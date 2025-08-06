/**
 * Índice de componentes reutilizáveis
 * Centraliza exportações dos componentes otimizados
 */

// Componentes principais
export { DynamicForm, useDynamicForm, FieldUtils } from './DynamicForm';
export { 
  UnifiedLoadingState, 
  EmptyState, 
  WithLoading, 
  LoadingStates,
  useLoadingState 
} from './UnifiedLoadingState';

// Tipos para facilitar importação
export type { FieldConfig, DynamicFormProps } from './DynamicForm';
export type { LoadingStateProps, EmptyStateProps, WithLoadingProps } from './UnifiedLoadingState';