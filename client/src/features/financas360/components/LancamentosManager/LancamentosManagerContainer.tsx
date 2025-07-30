/**
 * CONTAINER: LancamentosManagerContainer
 * Orquestração lógica para gerenciamento de lançamentos financeiros
 * Extraído de LancamentosManager.tsx (672 linhas) para modularização
 */
import React from 'react';
import { useLancamentos } from '../../hooks/useLancamentos';
import { LancamentosManagerPresentation } from './LancamentosManagerPresentation';
import { LancamentosManagerContainerProps } from '../../types/lancamentos';

export const LancamentosManagerContainer: React.FC<LancamentosManagerContainerProps> = ({
  empresaId,
  readOnly = false,
  showStatistics = true,
  showFilters = true,
  showActions = true,
  initialFilters,
  onLancamentoCreated,
  onLancamentoUpdated,
  onLancamentoDeleted,
  onError,
  className,
  style
}) => {
  // ===== HOOKS =====
  const {
    state,
    lancamentosData,
    empresasData,
    parceirosData,
    actions,
    utils
  } = useLancamentos(
    onLancamentoCreated || onLancamentoUpdated,
    undefined,
    empresaId
  );

  // ===== SIDE EFFECTS =====
  React.useEffect(() => {
    if (initialFilters) {
      Object.entries(initialFilters).forEach(([key, value]) => {
        actions.updateFilter(key as any, value);
      });
    }
  }, [initialFilters, actions]);

  React.useEffect(() => {
    if (onError && (lancamentosData.error || empresasData.error || parceirosData.error)) {
      const error = lancamentosData.error || empresasData.error || parceirosData.error;
      onError(new Error(error));
    }
  }, [lancamentosData.error, empresasData.error, parceirosData.error, onError]);

  // ===== ENHANCED ACTIONS =====
  const enhancedActions = {
    ...actions,
    deleteLancamento: async (id: number) => {
      await actions.deleteLancamento(id);
      if (onLancamentoDeleted) {
        onLancamentoDeleted(id);
      }
    }
  };

  // ===== RENDER =====
  return (
    <LancamentosManagerPresentation
      // Data
      state={state}
      lancamentosData={lancamentosData}
      empresasData={empresasData}
      parceirosData={parceirosData}
      
      // Actions
      actions={enhancedActions}
      utils={utils}
      
      // Configuration
      readOnly={readOnly}
      showStatistics={showStatistics}
      showFilters={showFilters}
      showActions={showActions}
      
      // Styling
      className={className}
      style={style}
    />
  );
};

export default LancamentosManagerContainer;
