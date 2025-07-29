/**
 * Hook para updates em tempo real nos managers
 * Sincroniza dados automaticamente via WebSocket
 */

import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface RealTimeUpdate {
  type: 'create' | 'update' | 'delete';
  resource: string;
  data: any;
  timestamp: string;
}

interface UseRealTimeUpdatesProps {
  resources: string[]; // Recursos a escutar (ex: ['empresas', 'canais'])
  enabled?: boolean;
}

export function useRealTimeUpdates({ 
  resources, 
  enabled = true 
}: UseRealTimeUpdatesProps) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  // URL do WebSocket para updates
  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NODE_ENV === 'production' 
      ? window.location.host 
      : 'localhost:3001';
    const resourcesParam = resources.join(',');
    return `${protocol}//${host}/ws/updates?token=${token}&resources=${resourcesParam}`;
  }, [token, resources]);

  // Processar update recebido
  const handleUpdate = useCallback((update: RealTimeUpdate) => {
    const queryKey = [`financas360-${update.resource}`];
    
    switch (update.type) {
      case 'create':
        // Adicionar novo item ao cache
        queryClient.setQueryData(queryKey, (oldData: any[] = []) => [
          update.data,
          ...oldData
        ]);
        
        // Invalidar para buscar dados atualizados
        queryClient.invalidateQueries({ queryKey });
        break;

      case 'update':
        // Atualizar item existente no cache
        queryClient.setQueryData(queryKey, (oldData: any[] = []) =>
          oldData.map(item => 
            item.id === update.data.id ? { ...item, ...update.data } : item
          )
        );
        break;

      case 'delete':
        // Remover item do cache
        queryClient.setQueryData(queryKey, (oldData: any[] = []) =>
          oldData.filter(item => item.id !== update.data.id)
        );
        break;
    }

    console.log(`🔄 Real-time update: ${update.type} em ${update.resource}`, update.data);
  }, [queryClient]);

  // Conectar ao WebSocket
  const connect = useCallback(() => {
    if (!token || !enabled || resources.length === 0 || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(getWebSocketUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔗 WebSocket conectado para updates em tempo real');
        
        // Enviar lista de recursos para escutar
        ws.send(JSON.stringify({
          type: 'subscribe',
          resources
        }));
      };

      ws.onmessage = (event) => {
        try {
          const update: RealTimeUpdate = JSON.parse(event.data);
          
          // Verificar se é um update que nos interessa
          if (resources.includes(update.resource)) {
            handleUpdate(update);
          }
        } catch (error) {
          console.error('Erro ao processar update em tempo real:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('Erro no WebSocket de updates:', error);
      };

      ws.onclose = (event) => {
        console.log('WebSocket de updates fechado:', event.code);
        
        // Tentar reconectar automaticamente
        if (event.code !== 1000 && enabled) {
          scheduleReconnect();
        }
      };

    } catch (error) {
      console.error('Erro ao conectar WebSocket de updates:', error);
      scheduleReconnect();
    }
  }, [token, enabled, resources, getWebSocketUrl, handleUpdate]);

  // Agendar reconexão
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Tentando reconectar WebSocket de updates...');
      connect();
    }, 3000);
  }, [connect]);

  // Desconectar
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Desconexão manual');
      wsRef.current = null;
    }
  }, []);

  // Conectar quando necessário
  useEffect(() => {
    if (enabled && token && resources.length > 0) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, token, resources, connect, disconnect]);

  // Cleanup
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN
  };
}