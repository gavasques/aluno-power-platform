/**
 * CONTAINER: ProductEditContainer
 * Manages business logic and state for product editing with tabs
 * Refactored from ProductEditWithTabs.tsx (680 lines) for modularization
 */
import React from 'react';
import { useProductEdit } from './hooks/useProductEdit';
import { ProductEditPresentation } from './ProductEditPresentation';
import type { ProductEditWithTabsProps } from './types';

export const ProductEditContainer: React.FC<ProductEditWithTabsProps> = ({ productId }) => {
  const { state, actions } = useProductEdit(productId);

  return (
    <ProductEditPresentation
      state={state}
      actions={actions}
      isEditing={!!productId}
    />
  );
};