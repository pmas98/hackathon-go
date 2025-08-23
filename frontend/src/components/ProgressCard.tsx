import { CheckCircle, Circle, Wifi, WifiOff } from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';

interface ProgressCardProps {
  title: string;
  description?: string;
  progress: number;
  status: string;
  isConnected?: boolean;
  validationTime?: number;
  className?: string;
}

export function ProgressCard({ 
  title, 
  description, 
  progress, 
  status, 
  isConnected = true,
  validationTime,
  className 
}: ProgressCardProps) {
  return (
    <div className={cn("p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl", className)}>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            {description && (
              <p className="text-purple-200 mt-1">{description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {isConnected ? (
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
      </div>
      
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-purple-200">Progresso</span>
            <span className="font-semibold text-purple-400">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 rounded-full transition-all duration-700 ease-out shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Status */}
        <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center justify-center w-8 h-8 bg-purple-500/20 rounded-full">
            {status === 'Processamento finalizado' ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <Circle className="h-4 w-4 text-purple-400" />
            )}
          </div>
          <div>
            <p className="font-medium text-white">{status}</p>
            <p className="text-sm text-purple-200">
              {status === 'Processamento finalizado' ? 'Job concluído com sucesso' : 'Status atual'}
            </p>
          </div>
        </div>
        
        {/* Validation Time */}
        {validationTime && (
          <div className="flex items-center space-x-3 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
            <div className="flex items-center justify-center w-8 h-8 bg-green-500/20 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-400" />
            </div>
            <div>
              <p className="font-medium text-green-400">Validação concluída</p>
              <p className="text-sm text-green-300">em {formatTime(validationTime)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
