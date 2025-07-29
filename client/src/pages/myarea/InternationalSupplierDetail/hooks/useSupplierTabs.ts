import { useState } from 'react';
import type { TabState, UseSupplierTabsReturn } from '../types';

/**
 * HOOK DE GERENCIAMENTO DE ABAS - FASE 4 REFATORAÇÃO
 * 
 * Responsabilidade única: Gerenciar estado das abas e navegação
 * Antes: Estado misturado no componente de 1.853 linhas
 * Depois: Hook isolado para controle de abas
 */
export function useSupplierTabs(): UseSupplierTabsReturn {
  const [tabState, setTabState] = useState<TabState>({
    activeTab: 'overview',
    isLoading: false,
    hasUnsavedChanges: false
  });

  const setActiveTab = (tab: TabState['activeTab']) => {
    setTabState(prev => ({
      ...prev,
      activeTab: tab
    }));
  };

  const setLoading = (loading: boolean) => {
    setTabState(prev => ({
      ...prev,
      isLoading: loading
    }));
  };

  const setUnsavedChanges = (hasChanges: boolean) => {
    setTabState(prev => ({
      ...prev,
      hasUnsavedChanges: hasChanges
    }));
  };

  return {
    tabState,
    setActiveTab,
    setLoading,
    setUnsavedChanges
  };
}