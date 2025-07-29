import React from 'react';
import { useAmazonProductSearch } from './hooks/useAmazonProductSearch';
import { useProductExport } from './hooks/useProductExport';
import { useExpandableSections } from './hooks/useExpandableSections';
import { AmazonProductDetailsPresentation } from './AmazonProductDetailsPresentation';
import type { AmazonProductDetailsContainerProps } from './types';

/**
 * AMAZON PRODUCT DETAILS CONTAINER - FASE 4 REFATORAÇÃO
 * 
 * Container Component seguindo padrão Container/Presentational
 * Responsabilidade única: Orquestrar hooks e gerenciar lógica de negócio
 * 
 * Antes: Lógica misturada no componente de 1.229 linhas
 * Depois: Container limpo focado apenas em coordenação de estado
 */
export function AmazonProductDetailsContainer({}: AmazonProductDetailsContainerProps) {
  // Initialize specialized hooks
  const searchHook = useAmazonProductSearch();
  const exportHook = useProductExport();
  const sectionsHook = useExpandableSections();

  // Extract data from hooks for easier access
  const { productData, isLoading, error } = searchHook;

  // Pass all props to presentation component
  return (
    <AmazonProductDetailsPresentation
      searchHook={searchHook}
      exportHook={exportHook}
      sectionsHook={sectionsHook}
      productData={productData}
      isLoading={isLoading}
      error={error}
    />
  );
}