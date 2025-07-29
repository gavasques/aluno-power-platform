/**
 * CONTAINER: AmazonProductDetailsContainer
 * Lógica de negócio para detalhes de produtos Amazon
 * Extraído de AmazonProductDetails.tsx (1229 linhas) para modularização
 * Data: Janeiro 29, 2025
 */
import { useAmazonProductSearch } from './hooks/useAmazonProductSearch';
import { useExpandableSections } from './hooks/useExpandableSections';
import { AmazonProductDetailsPresentation } from './AmazonProductDetailsPresentation';

export const AmazonProductDetailsContainer = () => {
  // ===== HOOKS INTEGRATION =====
  const searchHook = useAmazonProductSearch();
  const sectionsHook = useExpandableSections();

  // ===== CONTAINER ORCHESTRATION =====
  const containerProps = {
    // Search functionality
    searchProps: {
      asin: searchHook.asin,
      country: searchHook.country,
      onAsinChange: searchHook.setAsin,
      onCountryChange: searchHook.setCountry,
      onSearch: searchHook.handleSearch,
      isLoading: searchHook.isLoading,
      userBalance: searchHook.userBalance
    },

    // Product data
    productData: searchHook.productData,
    error: searchHook.error,

    // Export functionality
    exportProps: {
      productData: searchHook.productData,
      onExportTXT: searchHook.handleExportTXT,
      onDownloadImages: searchHook.handleDownloadImages,
      isExporting: searchHook.isExporting
    },

    // Expandable sections
    sectionsProps: {
      expandedSections: sectionsHook.expandedSections,
      toggleSection: sectionsHook.toggleSection,
      expandAll: sectionsHook.expandAll,
      collapseAll: sectionsHook.collapseAll
    }
  };

  return <AmazonProductDetailsPresentation {...containerProps} />;
};