import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para formatar números
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('pt-BR').format(num);
}

// Função para formatar preços
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
}

// Função para formatar tempo em ms
export function formatTime(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

// Função para debounce
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Função para throttle
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Função para copiar texto para clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Erro ao copiar para clipboard:', error);
    return false;
  }
}

// Função para gerar ID único
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Função para validar se é um arquivo CSV
export function isValidCSVFile(file: File): boolean {
  return file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');
}

// Função para obter tamanho do arquivo formatado
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Função para filtrar dados
export function filterData<T>(
  data: T[],
  filters: Record<string, any>
): T[] {
  return data.filter(item => {
    // Aplicar filtros específicos
    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null || value === '') continue;
      
      const itemValue = (item as any)[key];
      
      if (typeof value === 'string') {
        if (!itemValue?.toLowerCase().includes(value.toLowerCase())) {
          return false;
        }
      } else if (typeof value === 'number') {
        if (itemValue !== value) {
          return false;
        }
      } else if (Array.isArray(value)) {
        if (value.length > 0 && !value.includes(itemValue)) {
          return false;
        }
      }
    }
    
    return true;
  });
}

// Função para ordenar dados
export function sortData<T>(
  data: T[],
  sortBy: keyof T,
  sortOrder: 'asc' | 'desc' = 'asc'
): T[] {
  return [...data].sort((a, b) => {
    const aValue = (a as any)[sortBy];
    const bValue = (b as any)[sortBy];
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
}

// Função para paginar dados
export function paginateData<T>(
  data: T[],
  page: number,
  pageSize: number
): { data: T[]; total: number; totalPages: number } {
  const total = data.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    data: data.slice(startIndex, endIndex),
    total,
    totalPages
  };
}
