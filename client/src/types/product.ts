// Re-export unified types from core module
export * from './core/product';
export * from './core/channel';

// Legacy exports for backward compatibility
export type {
  BaseChannel,
  ProductChannels,
  ProductDimensions,
  ProductDescriptions,
  Product,
  InsertProduct,
  BaseProduct,
  ProductFormData,
  ProductListItem,
  CostCalculation,
  ProductEditMode
} from './core';