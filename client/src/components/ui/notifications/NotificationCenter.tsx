/**
 * Centro de notificações com dropdown
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  X,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRealTimeNotifications, Notification } from '@/hooks/useRealTimeNotifications';

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className = '' }: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    totalCount,
    isConnected,
    connectionError,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
    hasUnread,
    isEmpty
  } = useRealTimeNotifications();

  const [isOpen, setIsOpen] = useState(false);

  // Ícone baseado no tipo de notificação
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  // Renderizar item de notificação
  const renderNotification = (notification: Notification) => (
    <div
      key={notification.id}
      className={`
        p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors
        ${!notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Ícone */}
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {formatDistanceToNow(notification.timestamp, { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </p>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAsRead(notification.id)}
                  className="h-6 w-6 p-0"
                  title="Marcar como lida"
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeNotification(notification.id)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                title="Remover"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Ações da notificação */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="flex gap-2 mt-3">
              {notification.actions.map(action => (
                <Button
                  key={action.id}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={action.handler}
                  className="text-xs h-7"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative p-2"
            title={`${unreadCount} notificações não lidas`}
          >
            <Bell className="h-5 w-5" />
            
            {/* Badge de contagem */}
            {hasUnread && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}

            {/* Indicador de conexão */}
            <div className="absolute -bottom-1 -right-1">
              {isConnected ? (
                <Wifi className="h-3 w-3 text-green-500" />
              ) : (
                <WifiOff className="h-3 w-3 text-red-500" />
              )}
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent 
          className="w-80 p-0"
          align="end"
          side="bottom"
        >
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Notificações</h3>
                <p className="text-sm text-gray-600">
                  {totalCount === 0 
                    ? 'Nenhuma notificação' 
                    : `${unreadCount} não lidas de ${totalCount} total`
                  }
                </p>
              </div>

              {/* Status de conexão */}
              <div className="flex items-center gap-2">
                {connectionError ? (
                  <AlertCircle className="h-4 w-4 text-red-500" title={connectionError} />
                ) : isConnected ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <Wifi className="h-4 w-4" />
                    <span className="text-xs">Online</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-400">
                    <WifiOff className="h-4 w-4" />
                    <span className="text-xs">Offline</span>
                  </div>
                )}
              </div>
            </div>

            {/* Ações globais */}
            {!isEmpty && (
              <div className="flex gap-2 mt-3">
                {hasUnread && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-xs h-7"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Marcar todas como lidas
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearNotifications}
                  className="flex items-center gap-1 text-xs h-7 text-gray-600 hover:text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                  Limpar todas
                </Button>
              </div>
            )}
          </div>

          {/* Lista de notificações */}
          {isEmpty ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">Nenhuma notificação</p>
              <p className="text-xs mt-1">
                Você será notificado quando algo importante acontecer
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-96">
              {notifications.map(renderNotification)}
            </ScrollArea>
          )}

          {/* Footer */}
          {!isEmpty && (
            <>
              <Separator />
              <div className="p-3 text-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-gray-600"
                  onClick={() => setIsOpen(false)}
                >
                  Ver histórico completo
                </Button>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}