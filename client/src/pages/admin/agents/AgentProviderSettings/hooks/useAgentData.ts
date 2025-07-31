import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import type { Agent, ModelConfig, ProviderStatus, UseAgentDataReturn } from '../types';

/**
 * USE AGENT DATA HOOK - FASE 4 REFATORAÇÃO
 * 
 * Hook especializado para gerenciamento de dados de agentes
 * Responsabilidade única: Operações CRUD e cache de agentes
 */
export function useAgentData(): UseAgentDataReturn {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch provider status
  const { 
    data: status = { 
      openai: false, 
      anthropic: false, 
      gemini: false, 
      deepseek: false, 
      xai: false, 
      openrouter: false 
    },
    isLoading: isLoadingStatus 
  } = useQuery<ProviderStatus>({
    queryKey: ['/api/agents/provider-status'],
    enabled: user?.role === 'admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch available models
  const { 
    data: models = [], 
    isLoading: isLoadingModels 
  } = useQuery<ModelConfig[]>({
    queryKey: ['/api/agents/models'],
    enabled: user?.role === 'admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch agents
  const { 
    data: agents = [], 
    isLoading: isLoadingAgents 
  } = useQuery<Agent[]>({
    queryKey: ['/api/agents'],
    enabled: user?.role === 'admin',
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch knowledge base collections
  const { 
    data: collections = [], 
    isLoading: isLoadingCollections 
  } = useQuery({
    queryKey: ['/api/knowledge-base/collections'],
    enabled: user?.role === 'admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Update agent mutation
  const updateAgentMutation = useMutation({
    mutationFn: async (agentData: Agent) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/agents/${agentData.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(agentData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao atualizar agente');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate and refetch agents
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      
      // Update specific agent in cache
      queryClient.setQueryData(['/api/agents'], (oldData: Agent[] | undefined) => {
        if (!oldData) return [data.agent];
        return oldData.map(agent => 
          agent.id === data.agent.id ? data.agent : agent
        );
      });

      toast({
        title: "Agente atualizado",
        description: "As configurações do agente foram salvas com sucesso."
      });
    },
    onError: (error) => {
      console.error('Error updating agent:', error);
      toast({
        title: "Erro ao atualizar agente",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  });

  // Update agent function
  const updateAgent = async (agent: Agent): Promise<void> => {
    return updateAgentMutation.mutateAsync(agent);
  };

  // Refresh all data
  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/ai-providers/status'] });
    queryClient.invalidateQueries({ queryKey: ['/api/ai-providers/models'] });
    queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
    queryClient.invalidateQueries({ queryKey: ['/api/knowledge-base/collections'] });
  };

  return {
    // Data
    agents,
    models,
    status,
    collections,
    
    // Loading states
    isLoadingAgents,
    isLoadingModels,
    isLoadingStatus,
    isLoadingCollections,
    
    // Actions
    updateAgent,
    refreshData
  };
}