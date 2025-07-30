/**
 * CONTAINER: ParceirosManagerContainer
 * Lógica de negócio para gerenciamento de parceiros
 * Extraído de ParceirosManager.tsx para modularização
 */
import React from 'react';
import { useParceiros } from '../../hooks/useParceiros';
import { ParceirosManagerPresentation } from './ParceirosManagerPresentation';
import { ParceirosManagerContainerProps } from '../../types/parceiros';

export const ParceirosManagerContainer = ({
  readOnly = false,
  showBulkActions = true,
  showFinancialInfo = true,
  defaultFilter
}: ParceirosManagerContainerProps) => {
  // ===== HOOKS INTEGRATION =====
  const parceirosData = useParceiros();

  // ===== SIDE EFFECTS =====
  // Apply default filters on mount
  React.useEffect(() => {
    if (defaultFilter) {
      if (defaultFilter.categoria) {
        parceirosData.actions.filterByCategoria(defaultFilter.categoria);
      }
      if (defaultFilter.status) {
        parceirosData.actions.filterByStatus(defaultFilter.status);
      }
      if (defaultFilter.tipo) {
        parceirosData.actions.filterByTipo(defaultFilter.tipo);
      }
    }
  }, [defaultFilter, parceirosData.actions]);

  // ===== CONTAINER ORCHESTRATION =====
  const containerProps = {
    state: parceirosData.state,
    parceiros: parceirosData.parceiros,
    actions: parceirosData.actions,
    contatos: parceirosData.contatos,
    contratos: parceirosData.contratos,
    movimentacoes: parceirosData.movimentacoes,
    documentos: parceirosData.documentos,
    readOnly,
    showBulkActions,
    showFinancialInfo
  };

  return <ParceirosManagerPresentation {...containerProps} />;
};