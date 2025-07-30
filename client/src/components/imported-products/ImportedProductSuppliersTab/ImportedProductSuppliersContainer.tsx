/**
 * CONTAINER: ImportedProductSuppliersContainer
 * Manages business logic and state for product suppliers management
 * Refactored from ImportedProductSuppliersTab.tsx (641 lines) for modularization
 */
import React from 'react';
import { useProductSuppliers } from './hooks/useProductSuppliers';
import { ImportedProductSuppliersPresentation } from './ImportedProductSuppliersPresentation';
import type { ImportedProductSuppliersTabProps } from './types';

export const ImportedProductSuppliersContainer: React.FC<ImportedProductSuppliersTabProps> = ({ productId }) => {
  const { 
    suppliers, 
    availableSuppliers, 
    loading, 
    error, 
    state, 
    isUpdating, 
    isDeleting, 
    isSettingMain, 
    actions 
  } = useProductSuppliers(productId);

  return (
    <ImportedProductSuppliersPresentation
      suppliers={suppliers}
      availableSuppliers={availableSuppliers}
      loading={loading}
      error={error}
      state={state}
      isUpdating={isUpdating}
      isDeleting={isDeleting}
      isSettingMain={isSettingMain}
      actions={actions}
    />
  );
};