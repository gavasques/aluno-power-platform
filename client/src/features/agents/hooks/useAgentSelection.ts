/**
 * Hook para gerenciamento de seleção de agentes
 * Controla qual agente está selecionado e ações relacionadas
 */

import { useState, useCallback } from 'react';
import type { Agent } from '../types/agent.types';

export const useAgentSelection = (initialAgent: Agent | null = null) => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(initialAgent);

  const selectAgent = useCallback((agent: Agent) => {
    setSelectedAgent(agent);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedAgent(null);
  }, []);

  const isAgentSelected = useCallback((agent: Agent): boolean => {
    return selectedAgent?.id === agent.id;
  }, [selectedAgent]);

  return {
    selectedAgent,
    selectAgent,
    clearSelection,
    isAgentSelected,
    hasSelection: selectedAgent !== null
  };
};