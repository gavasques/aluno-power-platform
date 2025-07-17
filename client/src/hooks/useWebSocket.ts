import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get the actual host and port from the current location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let host = window.location.hostname;
    let port = window.location.port;
    
    // If no port is specified, use the default for the protocol
    if (!port) {
      port = window.location.protocol === 'https:' ? '443' : '80';
    }
    
    // For development, use the Express server port (5000)
    if (host === 'localhost' || host === '127.0.0.1') {
      port = '5000';
    }
    
    const wsUrl = `${protocol}//${host}:${port}/ws`;
    
    // Prevent WebSocket connection if host is invalid
    if (!host || host === 'undefined') {
      logger.warn(`⚠️ [WS_CLIENT] Invalid host detected: ${host}, skipping WebSocket connection`);
      return;
    }

    logger.debug(`🔌 [WS_CLIENT] Initializing WebSocket connection`);
    logger.debug(`   🌐 URL: ${wsUrl}`);
    logger.debug(`   📍 Protocol: ${protocol}`);
    logger.debug(`   🏠 Host: ${host}:${port}`);

    const connectWebSocket = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        logger.debug(`🔌 [WS_CLIENT] Already connected, skipping connection attempt`);
        return;
      }

      const attemptNumber = connectionAttempts + 1;
      setConnectionAttempts(attemptNumber);

      logger.debug(`🚀 [WS_CLIENT] Connection attempt #${attemptNumber}`);
      logger.debug(`   🌐 Attempting WebSocket connection to: ${wsUrl}`);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = (event) => {
        logger.debug(`✅ [WS_CLIENT] WebSocket connected successfully`);
        logger.debug(`   🔗 Ready State: ${ws.readyState}`);
        logger.debug(`   📊 Attempt #${attemptNumber} succeeded`);
        logger.debug(`   🕐 Event:`, event);

        setIsConnected(true);
        setConnectionAttempts(0); // Reset counter on successful connection
        setLastError(null);

        // Clear any pending reconnection
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          logger.debug(`📨 [WS_CLIENT] Message received:`, {
            type: data.type,
            timestamp: data.timestamp,
            messageId: (data as any).messageId,
            dataKeys: Object.keys(data.data || {})
          });

          // Handle different message types
          switch (data.type) {
            case 'news_created':
              toast({
                title: "Nova Notícia Criada",
                description: `"${data.data.title}" foi criada com sucesso.`,
                variant: "default",
              });
              break;

            case 'news_updated':
              toast({
                title: "Notícia Atualizada",
                description: `"${data.data.title}" foi atualizada.`,
                variant: "default",
              });
              break;

            case 'news_deleted':
              toast({
                title: "Notícia Removida",
                description: "Uma notícia foi removida do sistema.",
                variant: "destructive",
              });
              break;

            case 'connection':
              logger.debug(`🎉 [WS_CLIENT] Connection established:`, data.data.message);
              break;

            default:
              logger.debug('Unknown WebSocket message type:', data.type);
          }

          setLastMessage(data);
        } catch (error) {
          logger.error(`❌ [WS_CLIENT] Error parsing message:`, error);
          logger.error(`   📄 Raw data:`, event.data);
          setLastError(`Failed to parse message: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      };

      ws.onclose = (event) => {
        logger.debug(`🔌 [WS_CLIENT] WebSocket disconnected`);
        logger.debug(`   📋 Code: ${event.code}`);
        logger.debug(`   💬 Reason: ${event.reason || 'No reason provided'}`);
        logger.debug(`   🧹 Clean: ${event.wasClean}`);
        logger.debug(`   🔗 Ready State: ${ws.readyState}`);

        setIsConnected(false);

        // Don't reconnect if it was a clean close
        if (!event.wasClean && attemptNumber < 10) {
          const backoffDelay = Math.min(1000 * Math.pow(2, attemptNumber - 1), 30000);
          logger.debug(`🔄 [WS_CLIENT] Scheduling reconnection in ${backoffDelay}ms (attempt ${attemptNumber + 1})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            logger.debug(`⏰ [WS_CLIENT] Reconnection timeout triggered`);
            connectWebSocket();
          }, backoffDelay);
        } else if (attemptNumber >= 10) {
          logger.debug(`❌ [WS_CLIENT] Max reconnection attempts reached (${attemptNumber})`);
          setLastError('Max reconnection attempts reached');
        }
      };

      ws.onerror = (error) => {
        logger.error(`💥 [WS_CLIENT] WebSocket error:`, error);
        logger.error(`   📊 Current State: ${ws.readyState}`);
        logger.error(`   🔗 URL: ${wsUrl}`);
        logger.error(`   📈 Attempt: ${attemptNumber}`);

        setIsConnected(false);
        setLastError(`WebSocket error on attempt ${attemptNumber}`);
      };
    };

    connectWebSocket();

    return () => {
      logger.debug(`🧹 [WS_CLIENT] Cleaning up WebSocket connection`);

      if (reconnectTimeoutRef.current) {
        logger.debug(`⏰ [WS_CLIENT] Clearing reconnection timeout`);
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (wsRef.current) {
        logger.debug(`🔌 [WS_CLIENT] Closing WebSocket connection (state: ${wsRef.current.readyState})`);
        wsRef.current.close(1000, 'Component unmounting');
        wsRef.current = null;
      }
    };
  }, [toast]);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const messageData = {
        ...message,
        clientTimestamp: new Date().toISOString()
      };

      logger.debug(`📤 [WS_CLIENT] Sending message:`, messageData);
      wsRef.current.send(JSON.stringify(messageData));
    } else {
      logger.warn(`⚠️ [WS_CLIENT] Cannot send message - WebSocket not connected (state: ${wsRef.current?.readyState || 'null'})`);
      setLastError('Cannot send message - not connected');
    }
  }, []);

  const connect = useCallback(() => {
    // Prevent connection if host is invalid
    if (!window.location.host || window.location.host.includes('undefined')) {
      logger.warn(`⚠️ [WS_CLIENT] Invalid host in connect: ${window.location.host}, skipping connection`);
      return;
    }
    
    // connectWebSocket is defined in the useEffect above
    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => setIsConnected(true);
      ws.onclose = () => setIsConnected(false);
      ws.onerror = () => setIsConnected(false);
    }
  }, [])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  return {
    isConnected,
    lastMessage,
    connectionAttempts,
    lastError,
    sendMessage,
    connect,
    disconnect
  };
}