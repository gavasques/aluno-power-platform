/**
 * CONTAINER: SupplierInfoContainer
 * Manages business logic and state for supplier information display
 * Refactored from SupplierInfoDisplay.tsx (675 lines) for modularization
 */
import React from 'react';
import type { Supplier } from '@shared/schema';
import { useSupplierEdit } from './hooks/useSupplierEdit';
import { SupplierInfoPresentation } from './SupplierInfoPresentation';

interface SupplierInfoContainerProps {
  supplier: Supplier;
}

export const SupplierInfoContainer: React.FC<SupplierInfoContainerProps> = ({ supplier }) => {
  const { 
    departments, 
    editState, 
    formData, 
    isUpdating, 
    actions 
  } = useSupplierEdit(supplier);

  return (
    <SupplierInfoPresentation
      supplier={supplier}
      departments={departments}
      editState={editState}
      formData={formData}
      actions={actions}
      isUpdating={isUpdating}
    />
  );
};