import { useState, useEffect, useRef, useCallback } from 'react';
import { createWebSocket } from './api';
import { api } from './api';
import type { WebSocketMessage, JobState } from './types';
import { STATUS_LABELS } from './schema';

interface UseJobSocketReturn {
  jobState: JobState;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
}

export function useJobSocket(jobId: string): UseJobSocketReturn {
  const [jobState, setJobState] = useState<JobState>({
    id: jobId,
    status: 'Carregando status...',
    progress: 0,
    isConnected: false
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const hasLoadedInitialStatus = useRef(false);

  // Load initial job status from API
  const loadInitialStatus = useCallback(async () => {
    try {
      const jobStatus = await api.getJobStatus(jobId);
      
      setJobState(prev => ({
        ...prev,
        status: STATUS_LABELS[jobStatus.status] || jobStatus.status,
        progress: jobStatus.progress,
        isConnected: true
      }));

      // If job is completed, don't connect to WebSocket
      if (jobStatus.is_completed) {
        setJobState(prev => ({
          ...prev,
          status: 'Processamento finalizado',
          progress: 100,
          isConnected: true
        }));
        return false; // Don't connect to WebSocket
      }

      hasLoadedInitialStatus.current = true;
      return true; // Connect to WebSocket
    } catch (error) {
      console.error('Erro ao carregar status inicial do job:', error);
      setJobState(prev => ({
        ...prev,
        status: 'Erro ao carregar status',
        isConnected: false
      }));
      return false; // Don't connect to WebSocket
    }
  }, [jobId]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = createWebSocket(jobId);
      wsRef.current = ws;

      ws.onopen = () => {
        setJobState(prev => ({
          ...prev,
          isConnected: true,
          status: 'Conectado'
        }));
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketMessage;
          
          if (data.type === 'status' && data.status) {
            const statusLabel = STATUS_LABELS[data.status] || data.status;
            setJobState(prev => ({
              ...prev,
              status: statusLabel,
              error: undefined
            }));
          } else if (data.type === 'progress' && typeof data.progress === 'number') {
            setJobState(prev => ({
              ...prev,
              progress: data.progress || 0
            }));
          }
        } catch (error) {
          console.error('Erro ao processar mensagem do WebSocket:', error);
        }
      };

      ws.onclose = (event) => {
        setJobState(prev => ({
          ...prev,
          isConnected: false,
          status: 'Desconectado'
        }));

        // Tentar reconectar automaticamente se não foi fechado intencionalmente
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('Erro no WebSocket:', error);
        setJobState(prev => ({
          ...prev,
          isConnected: false,
          status: 'Erro de conexão',
          error: 'Falha na conexão com o servidor'
        }));
      };

    } catch (error) {
      console.error('Erro ao criar WebSocket:', error);
      setJobState(prev => ({
        ...prev,
        isConnected: false,
        status: 'Erro de conexão',
        error: 'Não foi possível conectar ao servidor'
      }));
    }
  }, [jobId]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000); // Código 1000 = fechamento normal
      wsRef.current = null;
    }

    setJobState(prev => ({
      ...prev,
      isConnected: false,
      status: 'Desconectado'
    }));
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    setTimeout(connect, 1000);
  }, [connect, disconnect]);

  useEffect(() => {
    const initializeJob = async () => {
      const shouldConnect = await loadInitialStatus();
      if (shouldConnect) {
        connect();
      }
    };

    initializeJob();

    return () => {
      disconnect();
    };
  }, [loadInitialStatus, connect, disconnect]);

  return {
    jobState,
    connect,
    disconnect,
    reconnect
  };
}
