/**
 * Hook para gerenciamento das tabs de navegação
 * Estado isolado para facilitar testes e reutilização
 */

import { useState, useCallback } from 'react';
import type { SupplierTab, UseSupplierTabsReturn } from '../types/supplier.types';

export const useSupplierTabs = (initialTab: SupplierTab = 'overview'): UseSupplierTabsReturn => {
  const [activeTab, setActiveTabState] = useState<SupplierTab>(initialTab);

  const setActiveTab = useCallback((tab: SupplierTab) => {
    setActiveTabState(tab);
  }, []);

  return {
    activeTab,
    setActiveTab
  };
};