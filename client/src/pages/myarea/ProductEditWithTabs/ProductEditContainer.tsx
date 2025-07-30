/**
 * CONTAINER: ProductEditContainer
 * Manages business logic and state for product editing functionality
 * Refactored from ProductEditWithTabs.tsx (680 lines) for modularization
 */
import React from 'react';
import { useProductEdit } from './hooks/useProductEdit';
import { ProductEditPresentation } from './ProductEditPresentation';

export const ProductEditContainer: React.FC = () => {
  const { 
    form, 
    product, 
    suppliers, 
    state, 
    isLoading, 
    error, 
    isUpdating, 
    actions 
  } = useProductEdit();

  return (
    <ProductEditPresentation
      form={form}
      product={product}
      suppliers={suppliers}
      state={state}
      isLoading={isLoading}
      error={error}
      isUpdating={isUpdating}
      actions={actions}
    />
  );
};