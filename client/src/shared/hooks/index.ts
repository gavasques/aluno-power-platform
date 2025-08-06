/**
 * Índice de hooks reutilizáveis
 * Centraliza exportações dos hooks otimizados
 */

// Hooks principais
export { useEntityCRUD } from './useEntityCRUD';
export { useCreditManager, useQuickCreditCheck } from './useCreditManager';

// Re-exports de hooks existentes otimizados
export { useUnifiedUserProfile, useOptimizedUserCredits } from '../hooks/useUnifiedUserProfile';
export { useAuth } from '../hooks/useAuth';

// Tipos para facilitar importação
export type {
  EntityCRUDConfig,
  EntityCRUDState,
  EntityCRUDActions,
  EntityCRUDReturn
} from './useEntityCRUD';

export type {
  CreditOperation,
  CreditCheckResult,
  CreditTransactionResult,
  LogAIGenerationParams
} from './useCreditManager';