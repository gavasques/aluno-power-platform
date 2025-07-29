import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'skeleton' | 'dots';
  className?: string;
  fullScreen?: boolean;
}

/**
 * Componente de loading state reutilizável
 * Elimina duplicação de UI de loading em todo o projeto
 * 
 * @example
 * <LoadingState message="Carregando produtos..." />
 * <LoadingState size="lg" variant="skeleton" />
 * <LoadingState fullScreen />
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Carregando...",
  size = 'md',
  variant = 'spinner',
  className,
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const containerClasses = cn(
    "flex items-center justify-center",
    fullScreen ? "fixed inset-0 bg-background/80 backdrop-blur-sm z-50" : "p-8",
    className
  );

  const renderSpinner = () => (
    <div className="text-center">
      <Loader2 
        className={cn(
          "animate-spin text-primary mx-auto mb-4",
          sizeClasses[size]
        )} 
      />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );

  const renderSkeleton = () => (
    <div className="text-center space-y-4">
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse w-3/4 mx-auto" />
        <div className="h-4 bg-muted rounded animate-pulse w-1/2 mx-auto" />
      </div>
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );

  const renderDots = () => (
    <div className="text-center">
      <div className="flex justify-center space-x-1 mb-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "bg-primary rounded-full animate-pulse",
              size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );

  const renderVariant = () => {
    switch (variant) {
      case 'skeleton':
        return renderSkeleton();
      case 'dots':
        return renderDots();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={containerClasses}>
      {renderVariant()}
    </div>
  );
};

/**
 * Componente de loading inline para uso em botões e elementos pequenos
 */
export const InlineLoadingState: React.FC<{
  size?: 'sm' | 'md';
  className?: string;
}> = ({ size = 'sm', className }) => (
  <Loader2 
    className={cn(
      "animate-spin",
      size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
      className
    )} 
  />
);

/**
 * Componente de loading para tabelas e listas
 */
export const TableLoadingState: React.FC<{
  rows?: number;
  columns?: number;
  message?: string;
}> = ({ rows = 5, columns = 4, message = "Carregando dados..." }) => (
  <div className="space-y-4">
    <div className="text-center text-muted-foreground text-sm mb-4">
      {message}
    </div>
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-4 bg-muted rounded animate-pulse flex-1"
              style={{
                animationDelay: `${(rowIndex * columns + colIndex) * 0.1}s`
              }}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

/**
 * Componente de loading para cards
 */
export const CardLoadingState: React.FC<{
  count?: number;
  message?: string;
}> = ({ count = 3, message = "Carregando..." }) => (
  <div className="space-y-4">
    <div className="text-center text-muted-foreground text-sm mb-4">
      {message}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-3">
          <div className="h-6 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          <div className="flex space-x-2 pt-2">
            <div className="h-8 w-16 bg-muted rounded animate-pulse" />
            <div className="h-8 w-16 bg-muted rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  </div>
);