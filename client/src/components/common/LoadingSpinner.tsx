import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'inline' | 'button';
  className?: string;
  showMessage?: boolean;
}

const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6', 
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

const variantClasses = {
  default: 'flex flex-col items-center justify-center space-y-2',
  inline: 'flex items-center space-x-2',
  button: 'flex items-center space-x-2'
};

export function LoadingSpinner({ 
  message = "Carregando...", 
  size = 'md',
  variant = 'default',
  className = '',
  showMessage = true
}: LoadingSpinnerProps) {
  const containerClasses = cn(variantClasses[variant], className);
  const spinnerClasses = cn('animate-spin', sizeClasses[size]);

  return (
    <div className={containerClasses}>
      <Loader2 className={spinnerClasses} />
      {showMessage && (
        <p className={cn(
          'text-muted-foreground',
          variant === 'inline' ? 'text-sm' : 'text-sm'
        )}>
          {message}
        </p>
      )}
    </div>
  );
}

// Convenience component for inline loading states
export function InlineLoader({ 
  message = "Carregando...", 
  size = 'sm' as const,
  className = ''
}: Omit<LoadingSpinnerProps, 'variant'>) {
  return (
    <LoadingSpinner 
      message={message} 
      size={size} 
      variant="inline" 
      className={className}
    />
  );
}

// Convenience component for button loading states
export function ButtonLoader({ 
  message = "Processando...", 
  size = 'sm' as const,
  className = ''
}: Omit<LoadingSpinnerProps, 'variant'>) {
  return (
    <LoadingSpinner 
      message={message} 
      size={size} 
      variant="button" 
      className={className}
      showMessage={false}
    />
  );
}