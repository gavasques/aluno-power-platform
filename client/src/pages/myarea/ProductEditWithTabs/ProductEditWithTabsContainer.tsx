/**
 * CONTAINER: ProductEditWithTabsContainer
 * Manages business logic and state for product editing with tabs
 * Refactored from ProductEditWithTabs.tsx (680 lines) for modularization
 */
import React from 'react';
import { useProductEdit } from './hooks/useProductEdit';
import { ProductEditWithTabsPresentation } from './ProductEditWithTabsPresentation';

export const ProductEditWithTabsContainer: React.FC = () => {
  const editLogic = useProductEdit();

  return <ProductEditWithTabsPresentation {...editLogic} />;
};