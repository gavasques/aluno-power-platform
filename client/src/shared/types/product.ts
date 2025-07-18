// Re-export unified types from core module
export * from '../../types/core/product';
export * from '../../types/core/forms';

// Legacy exports for backward compatibility
export type {
  ProductFormData,
  ProductListItem,
  CostCalculation,
  ProductEditMode
} from '../../types/core';