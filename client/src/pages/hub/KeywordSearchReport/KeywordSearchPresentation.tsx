/**
 * PRESENTATION: KeywordSearchPresentation
 * Pure UI component for keyword search report functionality
 * Extracted from KeywordSearchReport.tsx (580 lines) for modularization
 */
import React, { memo } from 'react';
import { Search } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { SearchForm } from './components/SearchForm';
import { ProgressCard } from './components/ProgressCard';
import { ProductGrid } from './components/ProductGrid';
import type { KeywordSearchPresentationProps } from './types';

interface KeywordSearchPresentationPropsExtended extends KeywordSearchPresentationProps {
  formatPrice: (price: string | null | undefined) => string;
}

export const KeywordSearchPresentation = memo<KeywordSearchPresentationPropsExtended>(({
  searchParams,
  state,
  actions,
  userBalance,
  loading,
  formatPrice
}) => {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Search className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Relatório de Busca por Keywords</h1>
          <p className="text-muted-foreground">
            Busque produtos na Amazon por palavras-chave com filtros avançados e exporte para XLSX
          </p>
        </div>
      </div>

      {/* Search Form */}
      <SearchForm
        searchParams={searchParams}
        isSearching={state.isSearching}
        userBalance={userBalance}
        onParamChange={actions.updateSearchParam}
        onStartSearch={actions.startSearch}
        onStopSearch={actions.stopSearch}
      />

      {/* Progress */}
      <ProgressCard state={state} />

      {/* Loading */}
      {loading && <LoadingSpinner message="Buscando produtos..." />}

      {/* Results */}
      <ProductGrid
        state={state}
        formatPrice={formatPrice}
        onDownload={actions.downloadXLSX}
      />
    </div>
  );
});