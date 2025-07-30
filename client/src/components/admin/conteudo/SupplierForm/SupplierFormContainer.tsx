/**
 * CONTAINER: SupplierFormContainer
 * Manages business logic and state for supplier form
 * Refactored from SupplierForm.tsx (640 lines) for modularization
 */
import React from 'react';
import { useSupplierForm } from './hooks/useSupplierForm';
import { SupplierFormPresentation } from './SupplierFormPresentation';
import type { SupplierFormProps } from './types';

export const SupplierFormContainer: React.FC<SupplierFormProps> = ({
  onSuccess,
  onCancel,
  editingSupplier
}) => {
  const { state, actions } = useSupplierForm(editingSupplier, onSuccess);

  return (
    <SupplierFormPresentation
      state={state}
      actions={actions}
      onCancel={onCancel}
    />
  );
};