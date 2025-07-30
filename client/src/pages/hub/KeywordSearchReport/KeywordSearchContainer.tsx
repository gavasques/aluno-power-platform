/**
 * CONTAINER: KeywordSearchContainer
 * Manages business logic and state for keyword search functionality
 * Refactored from KeywordSearchReport.tsx (580 lines) for modularization
 */
import React from 'react';
import { useKeywordSearch } from './hooks/useKeywordSearch';
import { useExportData } from './hooks/useExportData';
import { useUserCreditBalance } from '@/hooks/useUserCredits';
import { KeywordSearchPresentation } from './KeywordSearchPresentation';

export const KeywordSearchContainer: React.FC = () => {
  const { searchParams, state, loading, actions } = useKeywordSearch();
  const { balance: userBalance } = useUserCreditBalance();
  const { downloadXLSX, formatPrice } = useExportData(state.products, searchParams);

  // Merge export functionality with actions
  const enhancedActions = {
    ...actions,
    downloadXLSX
  };

  return (
    <KeywordSearchPresentation
      searchParams={searchParams}
      state={state}
      actions={enhancedActions}
      userBalance={userBalance}
      loading={loading}
      formatPrice={formatPrice}
    />
  );
};