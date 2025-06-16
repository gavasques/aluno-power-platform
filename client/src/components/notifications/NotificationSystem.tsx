import { useWebSocket } from '@/hooks/useWebSocket';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Bell, BellOff, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function NotificationSystem() {
  const { isConnected, lastMessage, connect, disconnect } = useWebSocket();
  const queryClient = useQueryClient();

  // Handle real-time data updates
  useEffect(() => {
    if (!lastMessage) return;

    // Invalidate queries based on the message type
    switch (lastMessage.type) {
      case 'news_created':
      case 'news_updated':
      case 'news_deleted':
        // Refresh news data
        queryClient.invalidateQueries({ queryKey: ['/api/news'] });
        queryClient.refetchQueries({ queryKey: ['/api/news'] });
        break;
        
      case 'update_created':
      case 'update_updated':
      case 'update_deleted':
        // Refresh updates data
        queryClient.invalidateQueries({ queryKey: ['/api/updates'] });
        queryClient.refetchQueries({ queryKey: ['/api/updates'] });
        break;
    }
  }, [lastMessage, queryClient]);

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <Badge 
                variant={isConnected ? "default" : "destructive"}
                className="flex items-center gap-1 text-xs"
              >
                {isConnected ? (
                  <>
                    <Wifi className="h-3 w-3" />
                    Conectado
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    Desconectado
                  </>
                )}
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={isConnected ? disconnect : connect}
                className="h-8 w-8 p-0"
              >
                {isConnected ? (
                  <Bell className="h-4 w-4" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {isConnected 
                ? 'Notificações em tempo real ativas. Clique para desconectar.' 
                : 'Notificações desconectadas. Clique para reconectar.'
              }
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}