import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    console.log(`🔌 [WS_CLIENT] Initializing WebSocket connection`);
    console.log(`   🌐 URL: ${wsUrl}`);
    console.log(`   📍 Protocol: ${protocol}`);
    console.log(`   🏠 Host: ${host}`);

    const connectWebSocket = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        console.log(`🔌 [WS_CLIENT] Already connected, skipping connection attempt`);
        return;
      }

      const attemptNumber = connectionAttempts + 1;
      setConnectionAttempts(attemptNumber);

      console.log(`🚀 [WS_CLIENT] Connection attempt #${attemptNumber}`);
      console.log(`   🌐 Attempting WebSocket connection to: ${wsUrl}`);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = (event) => {
        console.log(`✅ [WS_CLIENT] WebSocket connected successfully`);
        console.log(`   🔗 Ready State: ${ws.readyState}`);
        console.log(`   📊 Attempt #${attemptNumber} succeeded`);
        console.log(`   🕐 Event:`, event);

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
          console.log(`📨 [WS_CLIENT] Message received:`, {
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
              console.log(`🎉 [WS_CLIENT] Connection established:`, data.data.message);
              break;

            default:
              console.log('Unknown WebSocket message type:', data.type);
          }

          setLastMessage(data);
        } catch (error) {
          console.error(`❌ [WS_CLIENT] Error parsing message:`, error);
          console.error(`   📄 Raw data:`, event.data);
          setLastError(`Failed to parse message: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      };

      ws.onclose = (event) => {
        console.log(`🔌 [WS_CLIENT] WebSocket disconnected`);
        console.log(`   📋 Code: ${event.code}`);
        console.log(`   💬 Reason: ${event.reason || 'No reason provided'}`);
        console.log(`   🧹 Clean: ${event.wasClean}`);
        console.log(`   🔗 Ready State: ${ws.readyState}`);

        setIsConnected(false);

        // Don't reconnect if it was a clean close
        if (!event.wasClean && attemptNumber < 10) {
          const backoffDelay = Math.min(1000 * Math.pow(2, attemptNumber - 1), 30000);
          console.log(`🔄 [WS_CLIENT] Scheduling reconnection in ${backoffDelay}ms (attempt ${attemptNumber + 1})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`⏰ [WS_CLIENT] Reconnection timeout triggered`);
            connectWebSocket();
          }, backoffDelay);
        } else if (attemptNumber >= 10) {
          console.log(`❌ [WS_CLIENT] Max reconnection attempts reached (${attemptNumber})`);
          setLastError('Max reconnection attempts reached');
        }
      };

      ws.onerror = (error) => {
        console.error(`💥 [WS_CLIENT] WebSocket error:`, error);
        console.error(`   📊 Current State: ${ws.readyState}`);
        console.error(`   🔗 URL: ${wsUrl}`);
        console.error(`   📈 Attempt: ${attemptNumber}`);

        setIsConnected(false);
        setLastError(`WebSocket error on attempt ${attemptNumber}`);
      };
    };

    connectWebSocket();

    return () => {
      console.log(`🧹 [WS_CLIENT] Cleaning up WebSocket connection`);

      if (reconnectTimeoutRef.current) {
        console.log(`⏰ [WS_CLIENT] Clearing reconnection timeout`);
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (wsRef.current) {
        console.log(`🔌 [WS_CLIENT] Closing WebSocket connection (state: ${wsRef.current.readyState})`);
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

      console.log(`📤 [WS_CLIENT] Sending message:`, messageData);
      wsRef.current.send(JSON.stringify(messageData));
    } else {
      console.warn(`⚠️ [WS_CLIENT] Cannot send message - WebSocket not connected (state: ${wsRef.current?.readyState || 'null'})`);
      setLastError('Cannot send message - not connected');
    }
  }, []);

  const connect = useCallback(() => {
    connectWebSocket();
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