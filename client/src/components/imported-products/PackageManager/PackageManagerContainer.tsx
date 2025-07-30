/**
 * CONTAINER: PackageManagerContainer
 * Manages business logic and state for package management
 * Refactored from PackageManager.tsx (654 lines) for modularization
 */
import React from 'react';
import { usePackageManager } from './hooks/usePackageManager';
import { PackageManagerPresentation } from './PackageManagerPresentation';

export const PackageManagerContainer: React.FC = () => {
  const { 
    packages, 
    loading, 
    error, 
    state, 
    isUpdating, 
    isDeleting, 
    actions 
  } = usePackageManager();

  return (
    <PackageManagerPresentation
      packages={packages}
      loading={loading}
      error={error}
      state={state}
      isUpdating={isUpdating}
      isDeleting={isDeleting}
      actions={actions}
    />
  );
};