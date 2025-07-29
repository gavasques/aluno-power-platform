/**
 * Hook para gerenciamento de tabs no sistema de agentes
 * Controla navegação entre diferentes seções
 */

import { useState } from 'react';
import type { ActiveTab } from '../types/agent.types';

export const useAgentTabs = (initialTab: ActiveTab = 'providers') => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);

  const switchToProviders = () => setActiveTab('providers');
  const switchToKnowledgeBase = () => setActiveTab('knowledge-base');

  return {
    activeTab,
    setActiveTab,
    switchToProviders,
    switchToKnowledgeBase,
    isProvidersTab: activeTab === 'providers',
    isKnowledgeBaseTab: activeTab === 'knowledge-base'
  };
};