import { ComparisonResult } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const api = {
  async uploadFile(file: File): Promise<{ job_id: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.error || 'Erro no upload do arquivo',
        response.status,
        errorData
      );
    }

    return response.json();
  },

  async getResults(jobId: string): Promise<ComparisonResult> {
    const response = await fetch(`${API_URL}/results/${jobId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.error || 'Erro ao buscar resultados',
        response.status,
        errorData
      );
    }

    return response.json();
  },

  async getJobs(): Promise<{ job_ids: string[] }> {
    const response = await fetch(`${API_URL}/jobs`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.error || 'Erro ao buscar jobs',
        response.status,
        errorData
      );
    }

    return response.json();
  },

  // Função para testar a conexão com a API
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/jobs`, {
        method: 'HEAD',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
};

// WebSocket helper
export const createWebSocket = (jobId: string): WebSocket => {
  const wsUrl = API_URL.replace('http', 'ws');
  return new WebSocket(`${wsUrl}/ws/${jobId}`);
};

// Função para exportar dados
export const exportData = {
  toCSV(data: ComparisonResult): string {
    const headers = ['ID', 'Tipo', 'Categoria', 'Nome', 'Campos Divergentes', 'Fornecedor'];
    const rows = data.errors.map(error => [
      error.api_id,
      error.type,
      error.fields?.categoria?.csv || '',
      error.nome || '',
      error.fields ? Object.keys(error.fields).join(', ') : '',
      error.fields?.fornecedor?.csv || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  },

  toJSON(data: ComparisonResult): string {
    return JSON.stringify({
      summary: data.summary,
      errors: data.errors,
      exportedAt: new Date().toISOString()
    }, null, 2);
  },

  download(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
