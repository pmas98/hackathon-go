import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, ExternalLink, History, TrendingUp, Calendar } from 'lucide-react';
import { Header } from '@/components/Header';
import { api } from '@/lib/api';
import { formatNumber } from '@/lib/utils';

export default function Jobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await api.getJobs();
        setJobs(data.job_ids || []);
        
      } catch (err) {
        console.error('Erro ao carregar jobs:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
  }, []);

  const handleViewJob = (jobId: string) => {
    navigate(`/job/${jobId}`);
  };

  const handleViewResults = (jobId: string) => {
    navigate(`/results/${jobId}`);
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
              <p className="text-purple-200 text-lg">Carregando histórico...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
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
              <Clock className="h-10 w-10 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Erro ao carregar histórico</h1>
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
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all duration-300 border border-white/10 hover:border-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Voltar ao início</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                <History className="h-5 w-5 text-purple-300" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Histórico de Jobs</h1>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {formatNumber(jobs.length)}
                </div>
                <div className="text-purple-200 text-sm">
                  Total de Jobs
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {formatNumber(jobs.length)}
                </div>
                <div className="text-purple-200 text-sm">
                  Jobs Processados
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 sm:col-span-2 lg:col-span-1">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {formatNumber(jobs.length)}
                </div>
                <div className="text-purple-200 text-sm">
                  Jobs Disponíveis
                </div>
              </div>
            </div>
          </div>

          {/* Jobs List */}
          <div className="p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Jobs Recentes</h3>
              <p className="text-purple-200">
                Clique em um job para ver o progresso ou resultados
              </p>
            </div>
            
            <div>
              {jobs.length === 0 ? (
                <div className="text-center py-16">
                  <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-white/5 rounded-3xl border border-white/10">
                    <Clock className="h-10 w-10 text-purple-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Nenhum job encontrado</h3>
                  <p className="text-purple-200 mb-8 text-lg">
                    Faça upload de um arquivo CSV para começar
                  </p>
                  <button
                    onClick={() => navigate('/')}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
                  >
                    Fazer Upload
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((jobId, index) => (
                    <div
                      key={jobId}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:shadow-xl"
                    >
                      <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                          <CheckCircle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                            <span className="font-bold text-white text-lg">Job {jobId}</span>
                            <span className="text-sm text-purple-200 bg-purple-500/20 px-3 py-1 rounded-full w-fit">
                              #{index + 1}
                            </span>
                          </div>
                          <p className="text-purple-200 mt-1">
                            Processamento concluído
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        <button
                          onClick={() => handleViewJob(jobId)}
                          className="flex items-center justify-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 border border-white/20 hover:border-white/30"
                        >
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">Progresso</span>
                        </button>
                        <button
                          onClick={() => handleViewResults(jobId)}
                          className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span className="text-sm font-medium">Resultados</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Information */}
          <div className="p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl">
            <h3 className="font-bold text-white text-xl mb-6">Sobre o Histórico</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ul className="text-purple-200 space-y-3">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-sm">Os jobs são mantidos por 24 horas após o processamento</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-sm">Você pode visualizar o progresso de jobs em andamento</span>
                </li>
              </ul>
              <ul className="text-purple-200 space-y-3">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-sm">Os resultados ficam disponíveis para download e análise</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-sm">Use os filtros para encontrar jobs específicos</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
