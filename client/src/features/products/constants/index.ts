/**
 * Index de Constantes da Feature Products
 * Centraliza todas as exportações de constantes para facilitar imports
 */

// Constantes principais de produto
export * from './product';

// Constantes de canais
export * from './channels';

// Re-exports úteis para conveniência
export {
  ITEMS_PER_PAGE,
  MARGIN_SUGGESTIONS as LEGACY_MARGIN_SUGGESTIONS,
  EDIT_ROUTES as LEGACY_EDIT_ROUTES,
} from '@/shared/constants/product';

export {
  CHANNEL_NAMES as LEGACY_CHANNEL_NAMES,
} from '@/shared/constants/product';