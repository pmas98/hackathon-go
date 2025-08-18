import { CSV_SCHEMA, CSV_HEADERS, VALIDATION_ERRORS } from '@/lib/schema';
import type { CSVValidationError, CSVValidationResult } from '@/lib/types';

// Interface para mensagens do worker
interface WorkerMessage {
  type: 'validate';
  data: string;
  chunkSize?: number;
}

interface WorkerResponse {
  type: 'progress' | 'result' | 'error';
  data: any;
}

// Função para validar uma linha do CSV
function validateLine(line: string[], lineNumber: number): CSVValidationError[] {
  const errors: CSVValidationError[] = [];

  // Verificar se tem o número correto de colunas
  if (line.length !== CSV_HEADERS.length) {
    errors.push({
      line: lineNumber,
      field: 'all',
      value: line.join(','),
      reason: `Número incorreto de colunas. Esperado: ${CSV_HEADERS.length}, Encontrado: ${line.length}`
    });
    return errors;
  }

  // Validar cada campo
  CSV_HEADERS.forEach((header, index) => {
    const value = line[index];
    const fieldSchema = CSV_SCHEMA[header];

    if (!fieldSchema) return;

    // Verificar se o campo é obrigatório
    if (fieldSchema.required && (!value || value.trim() === '')) {
      errors.push({
        line: lineNumber,
        field: header,
        value: value || '',
        reason: VALIDATION_ERRORS.REQUIRED_FIELD
      });
      return;
    }

    // Se o campo está vazio e não é obrigatório, pular
    if (!value || value.trim() === '') return;

    // Validar tipo e regras específicas
    if (!fieldSchema.validate(value)) {
      let reason = VALIDATION_ERRORS.INVALID_VALUE;

      if (header === 'categoria') {
        reason = VALIDATION_ERRORS.INVALID_CATEGORY as any;
      } else if (header === 'preco') {
        reason = VALIDATION_ERRORS.INVALID_PRICE as any;
      } else if (header === 'estoque') {
        reason = VALIDATION_ERRORS.INVALID_STOCK as any;
      } else if (header === 'id') {
        reason = VALIDATION_ERRORS.INVALID_ID as any;
      } else if (header === 'nome' || header === 'fornecedor') {
        reason = VALIDATION_ERRORS.EMPTY_STRING as any;
      }

      errors.push({
        line: lineNumber,
        field: header,
        value: value,
        reason: reason
      });
    }
  });

  return errors;
}

// Função para processar CSV em chunks
function processCSVInChunks(csvContent: string, chunkSize: number = 1000): CSVValidationResult {
  const startTime = performance.now();
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  
  // Pular a primeira linha (cabeçalho) e ajustar contadores
  const dataLines = lines.slice(1); // Remove a primeira linha (cabeçalho)
  const totalLines = dataLines.length; // Conta apenas as linhas de dados
  let validLines = 0;
  let invalidLines = 0;
  const allErrors: CSVValidationError[] = [];

  // Processar em chunks (apenas linhas de dados)
  for (let i = 0; i < dataLines.length; i += chunkSize) {
    const chunk = dataLines.slice(i, i + chunkSize);
    
    chunk.forEach((line, chunkIndex) => {
      const lineNumber = i + chunkIndex + 2; // +2 porque pulamos o cabeçalho e começamos do 1
      const fields = line.split(',').map(field => field.trim());
      
      const lineErrors = validateLine(fields, lineNumber);
      
      if (lineErrors.length === 0) {
        validLines++;
      } else {
        invalidLines++;
        allErrors.push(...lineErrors);
      }
    });

    // Enviar progresso
    const progress = Math.min((i + chunkSize) / dataLines.length, 1);
    self.postMessage({
      type: 'progress',
      data: { progress, processedLines: Math.min(i + chunkSize, dataLines.length) }
    } as WorkerResponse);
  }

  const validationTime = performance.now() - startTime;

  return {
    isValid: allErrors.length === 0,
    totalLines,
    validLines,
    invalidLines,
    errors: allErrors,
    validationTime
  };
}

// Listener para mensagens do main thread
self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  try {
    if (event.data.type === 'validate') {
      const { data: csvContent, chunkSize = 1000 } = event.data;
      
      const result = processCSVInChunks(csvContent, chunkSize);
      
      self.postMessage({
        type: 'result',
        data: result
      } as WorkerResponse);
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      data: { message: error instanceof Error ? error.message : 'Erro desconhecido' }
    } as WorkerResponse);
  }
});

// Exportar para uso em ambiente de desenvolvimento
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { processCSVInChunks, validateLine };
}
