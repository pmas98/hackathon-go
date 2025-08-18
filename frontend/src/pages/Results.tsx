import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Download, Copy, BarChart3, Clock, TrendingUp, FileText, Share2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { FiltersBar } from '@/components/FiltersBar';
import { DivergencesTable } from '@/components/DivergencesTable';
import { DivergenceChart } from '@/components/DivergenceChart';
import { api, exportData } from '@/lib/api';
import { formatNumber, formatTime, copyToClipboard } from '@/lib/utils';
import type { ComparisonResult, Filters, PerformanceMetrics } from '@/lib/types';

export default function Results() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [results, setResults] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    validationTime: 0,
    totalProcessTime: 0
  });

  // Load filters from URL
  useEffect(() => {
    const urlFilters: Filters = {};
    searchParams.forEach((value, key) => {
      if (key === 'precoMin' || key === 'precoMax' || key === 'estoqueMin' || key === 'estoqueMax') {
        urlFilters[key] = Number(value);
      } else if (value) {
        (urlFilters as any)[key] = value;
      }
    });
    setFilters(urlFilters);
  }, [searchParams]);

  // Load results
  useEffect(() => {
    const loadResults = async () => {
      if (!jobId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await api.getResults(jobId);
        setResults(data);
        
        // Calculate metrics (simulation - in production would come from backend)
        const totalTime = performance.now() - (window as any).uploadStartTime || 0;
        setMetrics({
          validationTime: (window as any).validationTime || 0,
          totalProcessTime: totalTime
        });
        
      } catch (err) {
        console.error('Erro ao carregar resultados:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [jobId]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  const handleExport = (format: 'csv' | 'json') => {
    if (!results) return;
    
    const content = format === 'csv' 
      ? exportData.toCSV(results)
      : exportData.toJSON(results);
    
    const filename = `divergencias_${jobId}_${new Date().toISOString().split('T')[0]}.${format}`;
    const mimeType = format === 'csv' ? 'text/csv' : 'application/json';
    
    exportData.download(content, filename, mimeType);
  };

  const handleCopyLink = async () => {
    const url = window.location.href;
    const success = await copyToClipboard(url);
    
    if (success) {
      // Show success toast (implement if needed)
      console.log('Link copiado para clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 relative overflow-hidden">
        {/* Cosmic Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-pink-500/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-300/60 rounded-full animate-ping delay-1000"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-300/50 rounded-full animate-ping delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-purple-300/40 rounded-full animate-ping delay-1500"></div>
          <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-pink-300/50 rounded-full animate-ping delay-3000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-500/5 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-pink-500/5 via-transparent to-transparent"></div>
        </div>

        <Header />
        <main className="relative z-10 container mx-auto py-16 px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center space-y-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
              <p className="text-purple-200 text-lg">Carregando resultados...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 relative overflow-hidden">
        {/* Cosmic Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-pink-500/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-300/60 rounded-full animate-ping delay-1000"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-300/50 rounded-full animate-ping delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-purple-300/40 rounded-full animate-ping delay-1500"></div>
          <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-pink-300/50 rounded-full animate-ping delay-3000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-500/5 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-pink-500/5 via-transparent to-transparent"></div>
        </div>

        <Header />
        <main className="relative z-10 container mx-auto py-16 px-4">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="flex items-center justify-center w-20 h-20 mx-auto bg-red-500/10 rounded-3xl border border-red-500/20">
              <FileText className="h-10 w-10 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Erro ao carregar resultados</h1>
            <p className="text-purple-200 text-lg">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
            >
              Voltar ao início
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Cosmic Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-pink-500/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-300/60 rounded-full animate-ping delay-1000"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-300/50 rounded-full animate-ping delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-purple-300/40 rounded-full animate-ping delay-1500"></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-pink-300/50 rounded-full animate-ping delay-3000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-500/5 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-pink-500/5 via-transparent to-transparent"></div>
      </div>

      <Header />
      
      <main className="relative z-10 container mx-auto py-16 px-4">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all duration-300 border border-white/10 hover:border-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Voltar ao início</span>
            </button>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => handleExport('csv')}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 border border-white/20 hover:border-white/30"
              >
                <Download className="h-4 w-4" />
                <span className="text-sm font-medium">Exportar CSV</span>
              </button>
              <button
                onClick={() => handleExport('json')}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 border border-white/20 hover:border-white/30"
              >
                <Download className="h-4 w-4" />
                <span className="text-sm font-medium">Exportar JSON</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
              >
                <Share2 className="h-4 w-4" />
                <span className="text-sm font-medium">Compartilhar</span>
              </button>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-red-500/20 rounded-xl">
                  <BarChart3 className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-purple-200">Total de Divergências</p>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(results.summary.mismatched + results.summary.missing_in_api + results.summary.missing_in_csv)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-green-500/20 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-purple-200">Produtos Corretos</p>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(results.summary.matched)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-xl">
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-purple-200">Tempo de Validação</p>
                  <p className="text-2xl font-bold text-white">
                    {formatTime(metrics.validationTime)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-500/20 rounded-xl">
                  <Clock className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-purple-200">Tempo Total</p>
                  <p className="text-2xl font-bold text-white">
                    {formatTime(metrics.totalProcessTime)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6">Resumo da Comparação</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-purple-200">Total de produtos na API:</span>
                  <span className="font-semibold text-white">{formatNumber(results.summary.total_api_items)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-purple-200">Total de produtos no CSV:</span>
                  <span className="font-semibold text-white">{formatNumber(results.summary.total_csv_items)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-green-400">Produtos corretos:</span>
                  <span className="font-semibold text-green-400">{formatNumber(results.summary.matched)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-orange-400">Divergências:</span>
                  <span className="font-semibold text-orange-400">{formatNumber(results.summary.mismatched)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-red-400">Faltando no CSV:</span>
                  <span className="font-semibold text-red-400">{formatNumber(results.summary.missing_in_csv)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-blue-400">Faltando na API:</span>
                  <span className="font-semibold text-blue-400">{formatNumber(results.summary.missing_in_api)}</span>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6">Divergências por Tipo</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-purple-200">Divergências de dados:</span>
                  <span className="font-semibold text-orange-400">
                    {formatNumber(results.errors.filter(e => e.type === 'mismatch').length)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-purple-200">Faltando na API:</span>
                  <span className="font-semibold text-red-400">
                    {formatNumber(results.errors.filter(e => e.type === 'missing_in_api').length)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-purple-200">Faltando no CSV:</span>
                  <span className="font-semibold text-blue-400">
                    {formatNumber(results.errors.filter(e => e.type === 'missing_in_csv').length)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Divergence Chart */}
          <DivergenceChart data={results} />

          {/* Filters */}
          <div className="p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Filtros e Busca</h3>
            <FiltersBar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleResetFilters}
            />
          </div>

          {/* Divergences Table */}
          <div className="p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Divergências Encontradas</h3>
            <DivergencesTable
              errors={results.errors}
              filters={filters}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
