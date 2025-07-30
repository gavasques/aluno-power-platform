/**
 * CONTAINER: SupplierInfoDisplayContainer
 * Manages business logic and state for supplier information display
 * Refactored from SupplierInfoDisplay.tsx (675 lines) for modularization
 */
import React from 'react';
import { useSupplierInfo } from './hooks/useSupplierInfo';
import { SupplierInfoDisplayPresentation } from './SupplierInfoDisplayPresentation';
import type { Supplier } from './types';

interface SupplierInfoDisplayContainerProps {
  supplier: Supplier;
}

export const SupplierInfoDisplayContainer: React.FC<SupplierInfoDisplayContainerProps> = ({ supplier }) => {
  const supplierLogic = useSupplierInfo(supplier);

  return <SupplierInfoDisplayPresentation supplier={supplier} {...supplierLogic} />;
};