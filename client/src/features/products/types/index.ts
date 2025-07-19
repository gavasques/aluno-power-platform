/**
 * Index de Tipos da Feature Products
 * Centraliza todas as exportações de tipos para facilitar imports
 */

// Tipos principais de produto
export * from './product';

// Tipos de canais
export * from './productChannels';

// Tipos de fornecedores
export * from './productSupplier';

// Re-exporta tipos do core para conveniência
export type {
  BaseProduct,
  Product,
  InsertProduct,
  ProductFormData,
  ProductListItem,
  ProductDimensions,
  ProductDescriptions,
  CostCalculation,
  ProductEditMode,
} from '@/types/core/product';

export type {
  BaseChannel,
  ProductChannels,
  ChannelType,
  ChannelCostData,
} from '@/types/core/channel';