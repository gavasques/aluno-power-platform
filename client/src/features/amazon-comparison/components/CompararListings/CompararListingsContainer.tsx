/**
 * CONTAINER: CompararListingsContainer
 * Lógica de negócio para comparação de listagens Amazon
 * Extraído de CompararListings.tsx para modularização
 */
import { useComparisonForm } from '../../hooks/useComparisonForm';
import { CompararListingsPresentation } from './CompararListingsPresentation';

export const CompararListingsContainer = () => {
  // ===== HOOKS INTEGRATION =====
  const comparisonHook = useComparisonForm();

  // ===== CONTAINER ORCHESTRATION =====
  const containerProps = {
    // Form props
    formProps: {
      asins: comparisonHook.formData.asins,
      country: comparisonHook.formData.country,
      loading: comparisonHook.state.loading,
      errors: comparisonHook.errors,
      onAddAsin: comparisonHook.actions.handleAddAsin,
      onRemoveAsin: comparisonHook.actions.handleRemoveAsin,
      onAsinChange: comparisonHook.actions.handleAsinChange,
      onCountryChange: comparisonHook.actions.handleCountryChange,
      onCompare: comparisonHook.actions.handleCompare
    },

    // Results props
    resultsProps: {
      results: comparisonHook.state.results,
      loading: comparisonHook.state.loading,
      onExport: comparisonHook.actions.handleExportComparison,
      onClear: comparisonHook.actions.clearResults
    },

    // General state
    state: comparisonHook.state,
    errors: comparisonHook.errors
  };

  return <CompararListingsPresentation {...containerProps} />;
};