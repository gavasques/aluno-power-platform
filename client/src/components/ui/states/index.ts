/**
 * Estados Reutilizáveis - Fase 1 DRY Refatoração
 * 
 * Sistema centralizado para eliminar duplicação de código
 * em estados de loading, error e empty
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