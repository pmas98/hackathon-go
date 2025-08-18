export interface Product {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
  estoque: number;
  fornecedor: string;
}

export interface Pagination {
  current_page: number;
  items_per_page: number;
  total_items: number;
  total_pages: number;
  has_next_page: boolean;
  has_previous_page: boolean;
}

export interface APIResponse {
  data: Product[];
  pagination?: Pagination;
}

export interface MismatchDetail {
  api: any;
  csv: any;
}

export interface ErrorDetail {
  type: string;
  csv_line?: number;
  api_id: number;
  nome?: string;
  fields?: Record<string, MismatchDetail>;
}

export interface Summary {
  total_api_items: number;
  total_csv_items: number;
  matched: number;
  mismatched: number;
  missing_in_csv: number;
  missing_in_api: number;
}

export interface ComparisonResult {
  summary: Summary;
  errors: ErrorDetail[];
}

export interface CSVValidationError {
  line: number;
  field: string;
  value: string;
  reason: string;
}

export interface CSVValidationResult {
  isValid: boolean;
  totalLines: number;
  validLines: number;
  invalidLines: number;
  errors: CSVValidationError[];
  validationTime: number;
}

export interface WebSocketMessage {
  type: 'status' | 'progress';
  status?: string;
  progress?: number;
}

export interface Filters {
  type?: string;
  categoria?: string;
  precoMin?: number;
  precoMax?: number;
  estoqueMin?: number;
  estoqueMax?: number;
  search?: string;
}

export interface PerformanceMetrics {
  validationTime: number;
  totalProcessTime: number;
  uploadTime?: number;
  apiFetchTime?: number;
  comparisonTime?: number;
}

export interface JobState {
  id: string;
  status: string;
  progress: number;
  isConnected: boolean;
  error?: string;
}

export interface ExportOptions {
  format: 'csv' | 'json';
  includeFilters: boolean;
  filename?: string;
}
