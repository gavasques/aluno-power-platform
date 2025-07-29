import { useState } from 'react';
import type { AgentFilters, ModelFilters, UseAgentFiltersReturn } from '../types';

/**
 * USE AGENT FILTERS HOOK - FASE 4 REFATORAÇÃO
 * 
 * Hook especializado para gerenciamento de filtros
 * Responsabilidade única: Estado e manipulação de filtros de agentes e modelos
 */
export function useAgentFilters(): UseAgentFiltersReturn {

  // Agent filters state
  const [agentFilters, setAgentFilters] = useState<AgentFilters>({
    search: '',
    provider: '',
    status: 'all'
  });

  // Model filters state
  const [modelFilters, setModelFilters] = useState<ModelFilters>({
    search: '',
    provider: '',
    recommended: false
  });

  // Update agent filters
  const updateAgentFilters = (filters: Partial<AgentFilters>) => {
    setAgentFilters(prev => ({ ...prev, ...filters }));
  };

  // Update model filters
  const updateModelFilters = (filters: Partial<ModelFilters>) => {
    setModelFilters(prev => ({ ...prev, ...filters }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setAgentFilters({
      search: '',
      provider: '',
      status: 'all'
    });
    
    setModelFilters({
      search: '',
      provider: '',
      recommended: false
    });
  };

  return {
    // Filters
    agentFilters,
    modelFilters,
    
    // Actions
    updateAgentFilters,
    updateModelFilters,
    clearAllFilters
  };
}