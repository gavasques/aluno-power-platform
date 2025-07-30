/**
 * CONTAINER: ContasBancariasContainer
 * Manages business logic and state for bank accounts management
 * Refactored from ContasBancariasManager.tsx (666 lines) for modularization
 */
import React from 'react';
import { useContasBancarias } from './hooks/useContasBancarias';
import { ContasBancariasPresentation } from './ContasBancariasPresentation';

export const ContasBancariasContainer: React.FC = () => {
  const { 
    contas, 
    empresas, 
    loading, 
    error, 
    state, 
    isUpdating, 
    isDeleting, 
    actions 
  } = useContasBancarias();

  return (
    <ContasBancariasPresentation
      contas={contas}
      empresas={empresas}
      loading={loading}
      error={error}
      state={state}
      isUpdating={isUpdating}
      isDeleting={isDeleting}
      actions={actions}
    />
  );
};