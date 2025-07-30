/**
 * CONTAINER: DevolucaesManagerContainer
 * Lógica de negócio para gerenciamento de devoluções
 * Extraído de DevolucaesManager.tsx para modularização
 */
import React from 'react';
import { useDevolucoes } from '../../hooks/useDevolucoes';
import { DevolucaesManagerPresentation } from './DevolucaesManagerPresentation';
import { DevolucaesManagerContainerProps } from '../../types/devolucoes';

export const DevolucaesManagerContainer = ({
  userId,
  readOnly = false,
  showAnalytics = true,
  showBulkActions = true,
  defaultFilters
}: DevolucaesManagerContainerProps) => {
  // ===== HOOKS INTEGRATION =====
  const devolucaesData = useDevolucoes(userId, defaultFilters);

  // ===== CONTAINER ORCHESTRATION =====
  const containerProps = {
    state: devolucaesData.state,
    devolucoes: devolucaesData.devolucoes,
    notasFiscais: devolucaesData.notasFiscais,
    analytics: devolucaesData.analytics,
    actions: devolucaesData.actions,
    utils: devolucaesData.utils,
    readOnly,
    showAnalytics,
    showBulkActions
  };

  return <DevolucaesManagerPresentation {...containerProps} />;
};