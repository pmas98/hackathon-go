import { useState, useCallback, useRef } from 'react';
import type { CSVValidationResult } from './types';

interface UseCsvValidationReturn {
  validationResult: CSVValidationResult | null;
  isValidationInProgress: boolean;
  validationProgress: number;
  validateFile: (file: File) => Promise<void>;
  resetValidation: () => void;
  downloadErrorCSV: () => void;
}

export function useCsvValidation(): UseCsvValidationReturn {
  const [validationResult, setValidationResult] = useState<CSVValidationResult | null>(null);
  const [isValidationInProgress, setIsValidationInProgress] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const workerRef = useRef<Worker | null>(null);
  const csvContentRef = useRef<string>('');

  const validateFile = useCallback(async (file: File) => {
    try {
      setIsValidationInProgress(true);
      setValidationProgress(0);
      setValidationResult(null);

      // Ler o arquivo
      const content = await file.text();
      csvContentRef.current = content;

      // Criar worker
      if (workerRef.current) {
        workerRef.current.terminate();
      }

      workerRef.current = new Worker(
        new URL('../workers/csvWorker.ts', import.meta.url),
        { type: 'module' }
      );

      // Configurar listeners do worker
      workerRef.current.onmessage = (event) => {
        const { type, data } = event.data;

        switch (type) {
          case 'progress':
            setValidationProgress(data.progress);
            break;
          case 'result':
            setValidationResult(data);
            setIsValidationInProgress(false);
            break;
          case 'error':
            console.error('Erro no worker:', data.message);
            setIsValidationInProgress(false);
            break;
        }
      };

      workerRef.current.onerror = (error) => {
        console.error('Erro no worker:', error);
        setIsValidationInProgress(false);
      };

      // Iniciar validação
      workerRef.current.postMessage({
        type: 'validate',
        data: content,
        chunkSize: 1000
      });

    } catch (error) {
      console.error('Erro ao validar arquivo:', error);
      setIsValidationInProgress(false);
    }
  }, []);

  const resetValidation = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setValidationResult(null);
    setValidationProgress(0);
    setIsValidationInProgress(false);
    csvContentRef.current = '';
  }, []);

  const downloadErrorCSV = useCallback(() => {
    if (!validationResult || !csvContentRef.current) return;

    const lines = csvContentRef.current.split('\n');
    const errorLines = validationResult.errors.map(error => error.line);
    const uniqueErrorLines = [...new Set(errorLines)];

    const errorContent = lines.filter((_, index) => 
      uniqueErrorLines.includes(index + 1)
    ).join('\n');

    const blob = new Blob([errorContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'erros_validacao.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [validationResult]);

  return {
    validationResult,
    isValidationInProgress,
    validationProgress,
    validateFile,
    resetValidation,
    downloadErrorCSV
  };
}
