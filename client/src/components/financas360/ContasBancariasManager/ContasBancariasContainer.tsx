/**
 * CONTAINER: ContasBancariasContainer
 * Manages business logic and state for bank accounts management
 * Refactored from ContasBancariasManager.tsx (666 lines) for modularization
 */
import React from 'react';
import { useContasBancarias } from './hooks/useContasBancarias';
import { ContasBancariasPresentation } from './ContasBancariasPresentation';

export const ContasBancariasContainer: React.FC = () => {
  const { state, actions, isSaving, isDeleting } = useContasBancarias();

  return (
    <ContasBancariasPresentation
      state={state}
      actions={actions}
      isSaving={isSaving}
      isDeleting={isDeleting}
    />
  );
};