/**
 * CONTAINER: PackageManagerContainer
 * Manages business logic and state for package management
 * Refactored from PackageManager.tsx (654 lines) for modularization
 */
import React from 'react';
import { usePackageManager } from './hooks/usePackageManager';
import { PackageManagerPresentation } from './PackageManagerPresentation';

interface PackageManagerContainerProps {
  productId: string;
}

export const PackageManagerContainer: React.FC<PackageManagerContainerProps> = ({ productId }) => {
  const { state, actions } = usePackageManager(productId);

  return (
    <PackageManagerPresentation
      state={state}
      actions={actions}
      productId={productId}
    />
  );
};