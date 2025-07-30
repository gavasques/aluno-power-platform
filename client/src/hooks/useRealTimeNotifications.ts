/**
 * Hook para sistema de notificações em tempo real
 * Gerencia WebSocket connection e estado das notificações
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
}

export interface NotificationAction {
  id: string;
  label: string;
  variant?: 'default' | 'destructive' | 'outline';
  handler: () => void;
}

interface UseRealTimeNotificationsProps {
  enableToast?: boolean;
  maxNotifications?: number;
  autoMarkAsRead?: boolean;
}

export function useRealTimeNotifications({
  enableToast = true,
  maxNotifications = 50,
  autoMarkAsRead = false
}: UseRealTimeNotificationsProps = {}) {
  const { token, user } = useAuth();
  const { toast } = useToast();
  
  // Estados
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // WebSocket ref
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>();

  // WebSocket URL
  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NODE_ENV === 'production' 
      ? window.location.host 
      : 'localhost:3001';
    return `${protocol}//${host}/ws/notifications?token=${token}`;
  }, [token]);

  // Conectar ao WebSocket
  const connect = useCallback(() => {
    if (!token || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(getWebSocketUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔗 WebSocket conectado para notificações');
        setIsConnected(true);
        setConnectionError(null);
        
        // Heartbeat para manter conexão viva
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'heartbeat' }));
          }
        }, 30000); // 30 segundos
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('Erro no WebSocket:', error);
        setConnectionError('Erro na conexão de notificações');
      };

      ws.onclose = (event) => {
        console.log('WebSocket fechado:', event.code, event.reason);
        setIsConnected(false);
        
        // Limpar heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }

        // Tentar reconectar automaticamente
        if (event.code !== 1000) { // Não foi fechamento normal
          scheduleReconnect();
        }
      };

    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error);
      setConnectionError('Falha ao conectar notificações');
      scheduleReconnect();
    }
  }, [token, getWebSocketUrl]);

  // Agendar reconexão
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Tentando reconectar WebSocket...');
      connect();
    }, 5000); // Tentar reconectar em 5 segundos
  }, [connect]);

  // Processar mensagens do WebSocket
  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'notification':
        addNotification(data.notification);
        break;
      
      case 'notification_read':
        markAsRead(data.notificationId);
        break;
      
      case 'notification_deleted':
        removeNotification(data.notificationId);
        break;
      
      case 'notifications_clear':
        clearNotifications();
        break;
      
      case 'heartbeat_response':
        // Conexão está viva
        break;
      
      default:
        console.log('Mensagem WebSocket não reconhecida:', data);
    }
  }, []);

  // Adicionar notificação
  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => {
      const newNotifications = [notification, ...prev];
      
      // Limitar número de notificações
      if (newNotifications.length > maxNotifications) {
        newNotifications.splice(maxNotifications);
      }
      
      return newNotifications;
    });

    // Mostrar toast se habilitado
    if (enableToast) {
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'error' ? 'destructive' : 'default'
      });
    }

    // Marcar como lida automaticamente se configurado
    if (autoMarkAsRead) {
      setTimeout(() => {
        markAsRead(notification.id);
      }, 3000);
    }
  }, [maxNotifications, enableToast, toast, autoMarkAsRead]);

  // Marcar como lida
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );

    // Enviar para servidor
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'mark_as_read',
        notificationId
      }));
    }
  }, []);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );

    // Enviar para servidor
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'mark_all_as_read'
      }));
    }
  }, []);

  // Remover notificação
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  }, []);

  // Limpar todas as notificações
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Desconectar
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Desconexão manual');
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  // Conectar automaticamente quando tiver token
  useEffect(() => {
    if (token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Estatísticas
  const unreadCount = notifications.filter(n => !n.read).length;
  const totalCount = notifications.length;

  return {
    // Estado da conexão
    isConnected,
    connectionError,
    
    // Notificações
    notifications,
    unreadCount,
    totalCount,
    
    // Ações
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
    
    // Conexão manual
    connect,
    disconnect,
    
    // Utilitários
    hasUnread: unreadCount > 0,
    isEmpty: totalCount === 0
  };
}