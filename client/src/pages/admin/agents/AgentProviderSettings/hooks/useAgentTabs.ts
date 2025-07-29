import { useState } from 'react';
import type { ActiveTab, TabState, UseAgentTabsReturn } from '../types';

/**
 * USE AGENT TABS HOOK - FASE 4 REFATORAÇÃO
 * 
 * Hook especializado para gerenciamento de navegação por abas
 * Responsabilidade única: Controle de estado das tabs e navegação
 */
export function useAgentTabs(): UseAgentTabsReturn {

  // Tab state
  const [tabState, setTabState] = useState<TabState>({
    activeTab: 'providers',
    isLoading: false,
    hasUnsavedChanges: false
  });

  // Set active tab
  const setActiveTab = (tab: ActiveTab) => {
    setTabState(prev => ({ ...prev, activeTab: tab }));
  };

  // Set loading state
  const setLoading = (loading: boolean) => {
    setTabState(prev => ({ ...prev, isLoading: loading }));
  };

  // Set unsaved changes state
  const setUnsavedChanges = (hasChanges: boolean) => {
    setTabState(prev => ({ ...prev, hasUnsavedChanges: hasChanges }));
  };

  return {
    // Tab state
    tabState,
    setActiveTab,
    setLoading,
    setUnsavedChanges
  };
}