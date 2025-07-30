/**
 * CONTAINER: CanaisPagamentoManagerContainer
 * Lógica de negócio para gerenciamento de canais de pagamento
 * Extraído de CanaisPagamentoManager.tsx para modularização
 */
import React from 'react';
import { useCanaisPagamento } from '../../hooks/useCanaisPagamento';
import { CanaisPagamentoManagerPresentation } from './CanaisPagamentoManagerPresentation';
import { CanaisPagamentoManagerContainerProps } from '../../types/canaisPagamento';

export const CanaisPagamentoManagerContainer = ({
  userId,
  readOnly = false,
  showAnalytics = true,
  showBulkActions = true,
  defaultFilters
}: CanaisPagamentoManagerContainerProps) => {
  // ===== HOOKS INTEGRATION =====
  const canaisData = useCanaisPagamento(userId, defaultFilters);

  // ===== CONTAINER ORCHESTRATION =====
  const containerProps = {
    state: canaisData.state,
    canais: canaisData.canais,
    processadoras: canaisData.processadoras,
    transacoes: canaisData.transacoes,
    analytics: canaisData.analytics,
    actions: canaisData.actions,
    utils: canaisData.utils,
    readOnly,
    showAnalytics,
    showBulkActions
  };

  return <CanaisPagamentoManagerPresentation {...containerProps} />;
};