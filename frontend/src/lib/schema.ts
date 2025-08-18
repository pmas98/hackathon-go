// Schema de validação do CSV
export const CSV_SCHEMA = {
  id: {
    type: 'number',
    required: true,
    min: 0,
    validate: (value: string) => {
      const num = parseInt(value);
      return !isNaN(num) && num >= 0;
    }
  },
  nome: {
    type: 'string',
    required: true,
    validate: (value: string) => value.trim().length > 0
  },
  categoria: {
    type: 'string',
    required: true,
    allowedValues: ['Móveis', 'Hardware', 'Acessórios', 'Componentes', 'Periféricos'],
    validate: (value: string) => {
      const allowed = ['Móveis', 'Hardware', 'Acessórios', 'Componentes', 'Periféricos'];
      return allowed.includes(value.trim());
    }
  },
  preco: {
    type: 'number',
    required: true,
    min: 0,
    validate: (value: string) => {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) return false;
      // Verificar se tem no máximo 2 casas decimais
      const decimalPlaces = (num.toString().split('.')[1] || '').length;
      return decimalPlaces <= 2;
    }
  },
  estoque: {
    type: 'number',
    required: true,
    min: 0,
    max: 500,
    validate: (value: string) => {
      const num = parseInt(value);
      return !isNaN(num) && num >= 0 && num <= 500;
    }
  },
  fornecedor: {
    type: 'string',
    required: true,
    validate: (value: string) => value.trim().length > 0
  }
} as const;

export const CSV_HEADERS = ['id', 'nome', 'categoria', 'preco', 'estoque', 'fornecedor'] as const;

export type CSVField = keyof typeof CSV_SCHEMA;
export type CSVHeader = typeof CSV_HEADERS[number];

// Mapeamento de status do backend para labels amigáveis
export const STATUS_LABELS: Record<string, string> = {
  'job_created': 'Job criado',
  'parsing_csv': 'Lendo arquivo CSV',
  'csv_parsed': 'CSV processado',
  'fetching_api_products': 'Consultando API de produtos',
  'api_products_fetched': 'Produtos da API obtidos',
  'comparing_products': 'Comparando produtos',
  'comparison_done': 'Comparação concluída',
  'saved_results': 'Resultados salvos',
  'finished': 'Processamento finalizado',
  'error_parsing_csv': 'Erro ao processar CSV',
  'error_fetching_api_products': 'Erro ao consultar API'
};

// Tipos de erro de validação
export const VALIDATION_ERRORS = {
  REQUIRED_FIELD: 'Campo obrigatório',
  INVALID_TYPE: 'Tipo de dado inválido',
  INVALID_VALUE: 'Valor inválido',
  INVALID_CATEGORY: 'Categoria deve ser uma das opções válidas',
  INVALID_PRICE: 'Preço deve ser um número com no máximo 2 casas decimais',
  INVALID_STOCK: 'Estoque deve ser um número entre 0 e 500',
  INVALID_ID: 'ID deve ser um número não negativo',
  EMPTY_STRING: 'Campo não pode estar vazio'
} as const;
