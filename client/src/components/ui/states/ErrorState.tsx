/**
 * Componente reutilizável para estados de erro
 * Elimina duplicação dos estados de error nos managers
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  error: Error | string;
  onRetry?: () => void;
  title?: string;
  retryText?: string;
  className?: string;
  showRetryButton?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ErrorState({
  error,
  onRetry,
  title = "Erro",
  retryText = "Tentar Novamente",
  className = "",
  showRetryButton = true,
  size = 'md'
}: ErrorStateProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  const sizeClasses = {
    sm: { container: 'p-4', icon: 'h-8 w-8', title: 'text-base', text: 'text-sm' },
    md: { container: 'p-8', icon: 'h-12 w-12', title: 'text-lg', text: 'text-base' },
    lg: { container: 'p-12', icon: 'h-16 w-16', title: 'text-xl', text: 'text-lg' }
  };

  const classes = sizeClasses[size];

  return (
    <div className={`flex items-center justify-center ${classes.container} ${className}`}>
      <div className="text-center max-w-md">
        <AlertCircle className={`${classes.icon} text-red-500 mx-auto mb-4`} />
        
        <h3 className={`${classes.title} font-semibold text-gray-900 mb-2`}>
          {title}
        </h3>
        
        <p className={`${classes.text} text-red-600 mb-6 leading-relaxed`}>
          {errorMessage}
        </p>
        
        {showRetryButton && onRetry && (
          <Button 
            onClick={onRetry}
            variant="outline"
            className="inline-flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {retryText}
          </Button>
        )}
      </div>
    </div>
  );
}