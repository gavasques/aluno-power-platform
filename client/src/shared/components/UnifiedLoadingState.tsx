/**
 * Componentes de loading unificados
 * Elimina duplicação de estados de carregamento
 * Padroniza experiência visual
 */
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  type: 'card' | 'table' | 'list' | 'form' | 'full-page' | 'inline' | 'button' | 'grid';
  count?: number;
  message?: string;
  className?: string;
  variant?: 'default' | 'minimal' | 'detailed';
  showSpinner?: boolean;
}

// Skeleton genérico para cards
function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </CardContent>
    </Card>
  );
}

// Skeleton para tabelas
function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex space-x-4 p-4 border-b">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4 p-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}

// Skeleton para listas
function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

// Skeleton para formulários
function FormSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex justify-end space-x-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}

// Loading de página completa
function FullPageLoading({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}

// Loading inline
function InlineLoading({ message, showSpinner = true }: { message?: string; showSpinner?: boolean }) {
  return (
    <div className="flex items-center space-x-2 py-2">
      {showSpinner && <Loader2 className="h-4 w-4 animate-spin" />}
      {message && (
        <span className="text-sm text-muted-foreground">{message}</span>
      )}
    </div>
  );
}

// Loading para botões
function ButtonLoading() {
  return <Loader2 className="h-4 w-4 animate-spin" />;
}

// Grid skeleton
function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function UnifiedLoadingState({
  type,
  count = 3,
  message,
  className,
  variant = 'default',
  showSpinner = true
}: LoadingStateProps) {
  const containerClasses = cn(
    'animate-pulse',
    variant === 'minimal' && 'opacity-75',
    className
  );

  switch (type) {
    case 'card':
      return (
        <div className={cn('grid grid-cols-1 gap-4', containerClasses)}>
          {Array.from({ length: count }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      );

    case 'grid':
      return (
        <div className={containerClasses}>
          <GridSkeleton count={count} />
        </div>
      );

    case 'table':
      return (
        <div className={containerClasses}>
          <TableSkeleton rows={count} />
        </div>
      );

    case 'list':
      return (
        <div className={containerClasses}>
          <ListSkeleton items={count} />
        </div>
      );

    case 'form':
      return (
        <div className={containerClasses}>
          <FormSkeleton />
        </div>
      );

    case 'full-page':
      return (
        <div className={containerClasses}>
          <FullPageLoading message={message} />
        </div>
      );

    case 'inline':
      return (
        <div className={containerClasses}>
          <InlineLoading message={message} showSpinner={showSpinner} />
        </div>
      );

    case 'button':
      return <ButtonLoading />;

    default:
      return (
        <div className={cn('flex items-center justify-center p-4', containerClasses)}>
          {showSpinner && <Loader2 className="h-6 w-6 animate-spin" />}
          {message && (
            <span className="ml-2 text-sm text-muted-foreground">{message}</span>
          )}
        </div>
      );
  }
}

// Componente para estados vazios
interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center p-8 min-h-[300px]',
      className
    )}>
      {icon && (
        <div className="mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

// Hook para controle de estados de loading
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = React.useState(initialState);

  const startLoading = React.useCallback(() => setIsLoading(true), []);
  const stopLoading = React.useCallback(() => setIsLoading(false), []);
  const toggleLoading = React.useCallback(() => setIsLoading(prev => !prev), []);

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    setIsLoading
  };
}

// Wrapper para componentes com loading
interface WithLoadingProps {
  isLoading: boolean;
  loadingType?: LoadingStateProps['type'];
  loadingMessage?: string;
  loadingCount?: number;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function WithLoading({
  isLoading,
  loadingType = 'full-page',
  loadingMessage,
  loadingCount,
  children,
  fallback
}: WithLoadingProps) {
  if (isLoading) {
    return fallback || (
      <UnifiedLoadingState
        type={loadingType}
        message={loadingMessage}
        count={loadingCount}
      />
    );
  }

  return <>{children}</>;
}

// Componentes especializados para casos comuns
export const LoadingStates = {
  // Loading para dados sendo carregados
  DataLoading: ({ message = "Carregando dados..." }: { message?: string }) => (
    <UnifiedLoadingState type="inline" message={message} />
  ),

  // Loading para operações sendo processadas
  ProcessingLoading: ({ message = "Processando..." }: { message?: string }) => (
    <UnifiedLoadingState type="inline" message={message} />
  ),

  // Loading para cards em grid
  CardsLoading: ({ count = 6 }: { count?: number }) => (
    <UnifiedLoadingState type="grid" count={count} />
  ),

  // Loading para tabelas
  TableLoading: ({ rows = 5 }: { rows?: number }) => (
    <UnifiedLoadingState type="table" count={rows} />
  ),

  // Loading para formulários
  FormLoading: () => (
    <UnifiedLoadingState type="form" />
  )
};