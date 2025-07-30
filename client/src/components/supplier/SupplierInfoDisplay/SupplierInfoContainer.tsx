/**
 * CONTAINER: SupplierInfoContainer
 * Manages business logic and state for supplier information display
 * Refactored from SupplierInfoDisplay.tsx (675 lines) for modularization
 */
import React from 'react';
import { useSupplierInfo } from './hooks/useSupplierInfo';
import { SupplierInfoPresentation } from './SupplierInfoPresentation';
import type { SupplierInfoDisplayProps } from './types';

export const SupplierInfoContainer: React.FC<SupplierInfoDisplayProps> = ({ supplierId }) => {
  const { state, actions, isUpdating } = useSupplierInfo(supplierId);

  return (
    <SupplierInfoPresentation
      state={state}
      actions={actions}
      isUpdating={isUpdating}
    />
  );
};