import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Circle, AlertCircle, Wifi, WifiOff, Play, Clock } from 'lucide-react';
import { Header } from '@/components/Header';
import { ProgressCard } from '@/components/ProgressCard';
import { useJobSocket } from '@/lib/useJobSocket';
import { cn } from '@/lib/utils';

export default function JobProgress() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  
  const { jobState, reconnect } = useJobSocket(jobId!);

  const isFinished = jobState.status === 'Processamento finalizado';
  const hasError = jobState.status.includes('Erro');
  const isLoading = jobState.status === 'Carregando status...';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 relative overflow-hidden">
        <Header />
        <main className="relative z-10 container mx-auto py-16 px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center space-y-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
              <p className="text-purple-200 text-lg">Carregando status do job...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const steps = [
    { key: 'job_created', label: 'Job criado', icon: Play },
    { key: 'parsing_csv', label: 'Lendo arquivo CSV', icon: Clock },
    { key: 'csv_parsed', label: 'CSV processado', icon: CheckCircle },
    { key: 'fetching_api_products', label: 'Consultando API de produtos', icon: Clock },
    { key: 'api_products_fetched', label: 'Produtos da API obtidos', icon: CheckCircle },
    { key: 'comparing_products', label: 'Comparando produtos', icon: Clock },
    { key: 'comparison_done', label: 'Comparação concluída', icon: CheckCircle },
    { key: 'saved_results', label: 'Resultados salvos', icon: CheckCircle },
    { key: 'finished', label: 'Processamento finalizado', icon: CheckCircle }
  ];

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
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all duration-300 border border-white/10 hover:border-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Voltar ao início</span>
            </button>
            
            <div className="flex items-center space-x-3">
              {jobState.isConnected ? (
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium border border-green-500/20">
                  <Wifi className="h-4 w-4" />
                  <span>Conectado</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium border border-red-500/20">
                  <WifiOff className="h-4 w-4" />
                  <span>Desconectado</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Card */}
          <ProgressCard
            title={`Job ${jobId}`}
            description="Acompanhe o progresso da comparação em tempo real"
            progress={jobState.progress}
            status={jobState.status}
            isConnected={jobState.isConnected}
          />

          {/* Error State */}
          {hasError && (
            <div className="p-8 bg-red-500/10 backdrop-blur-sm rounded-3xl border border-red-500/20 shadow-2xl">
              <div className="flex items-center space-x-3 text-red-400">
                <div className="flex items-center justify-center w-10 h-10 bg-red-500/20 rounded-full">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Erro no Processamento</h3>
                  <p className="text-red-300 mt-1">{jobState.error || jobState.status}</p>
                </div>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => navigate('/')}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 border border-white/20 hover:border-white/30"
                >
                  Tentar Novamente
                </button>
                <button
                  onClick={reconnect}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                >
                  Reconectar
                </button>
              </div>
            </div>
          )}

          {/* Success State */}
          {isFinished && (
            <div className="p-8 bg-green-500/10 backdrop-blur-sm rounded-3xl border border-green-500/20 shadow-2xl">
              <div className="flex items-center space-x-3 text-green-400">
                <div className="flex items-center justify-center w-10 h-10 bg-green-500/20 rounded-full">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Processamento Concluído!</h3>
                  <p className="text-green-300 mt-1">
                    O job foi processado com sucesso. Use o botão abaixo para ver os resultados.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Process Steps */}
          <div className="p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Etapas do Processamento</h3>
            <p className="text-purple-200 mb-6">Acompanhe cada etapa do processamento</p>
            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = isFinished || 
                  jobState.status === step.label || 
                  (index > 0 && jobState.progress > (index / 8));
                const isCurrent = !isFinished && jobState.status === step.label;
                
                return (
                  <div key={step.key} className="flex items-center space-x-4 p-4 rounded-xl transition-colors hover:bg-white/5">
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <div className="flex items-center justify-center w-10 h-10 bg-green-500/20 rounded-full">
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        </div>
                      ) : isCurrent ? (
                        <div className="flex items-center justify-center w-10 h-10 bg-purple-500/20 rounded-full animate-pulse">
                          <Icon className="h-5 w-5 text-purple-400" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-full">
                          <Circle className="h-5 w-5 text-purple-300" />
                        </div>
                      )}
                    </div>
                    <span className={cn(
                      "text-sm font-medium",
                      isCompleted ? "text-green-400" : 
                      isCurrent ? "text-purple-400" : 
                      "text-purple-300"
                    )}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* View Results Button */}
          {isFinished && (
            <div className="flex justify-center">
              <button
                onClick={() => navigate(`/results/${jobId}`)}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
              >
                Ver Resultados
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
