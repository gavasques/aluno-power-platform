/**
 * Componentes de Estado Reutilizáveis
 * 
 * Este módulo centraliza todos os componentes de estado (loading, error, empty)
 * eliminando duplicação de código em todo o projeto.
 * 
 * Uso:
 * import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
 */

// Loading States
export {
  LoadingState,
  InlineLoadingState,
  TableLoadingState,
  CardLoadingState
} from './LoadingState';

export type {
  LoadingStateProps
} from './LoadingState';

// Error States
export {
  ErrorState,
  ValidationErrorState,
  NetworkErrorState,
  NotFoundErrorState
} from './ErrorState';

export type {
  ErrorStateProps
} from './ErrorState';

// Empty States
export {
  EmptyState,
  NoResultsState,
  FirstTimeState,
  FailedLoadState
} from './EmptyState';

export type {
  EmptyStateProps
} from './EmptyState';

// Convenience re-exports for common combinations
export const StateComponents = {
  LoadingState,
  ErrorState,
  EmptyState,
  InlineLoadingState,
  NoResultsState,
  NetworkErrorState,
  ValidationErrorState
} as const;

export const renderAsyncState = (
  isLoading: boolean,
  error: string | null,
  data: any[],
  options?: {
    loadingMessage?: string;
    emptyTitle?: string;
    emptyDescription?: string;
    onRetry?: () => void;
    onCreate?: () => void;
  }
) => {
  if (isLoading) {
    return <LoadingState message={options?.loadingMessage} />;
  }
  
  if (error) {
    return <ErrorState error={error} onRetry={options?.onRetry} />;
  }
  
  if (data.length === 0) {
    return (
      <EmptyState
        title={options?.emptyTitle}
        description={options?.emptyDescription}
        onAction={options?.onCreate}
        variant="create"
      />
    );
  }
  
  return null;
};