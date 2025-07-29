/**
 * Hook para gerenciamento de dados dos agentes
 * Centraliza toda a lógica de fetching e state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { Agent, ModelConfig, ProviderStatus, KnowledgeBase } from '../types/agent.types';

// Hook principal para dados dos agentes
export const useAgentData = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para status dos providers
  const statusQuery = useQuery({
    queryKey: ['/api/agents/provider-status'],
    queryFn: async (): Promise<ProviderStatus> => {
      const response = await fetch('/api/agents/provider-status');
      if (!response.ok) throw new Error('Failed to fetch provider status');
      const data = await response.json();
      return data.status || {};
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 2
  });

  // Query para modelos disponíveis
  const modelsQuery = useQuery({
    queryKey: ['/api/agents/models'],
    queryFn: async (): Promise<ModelConfig[]> => {
      const response = await fetch('/api/agents/models');
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      return data.models || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
    retry: 2
  });

  // Query para agentes
  const agentsQuery = useQuery({
    queryKey: ['/api/agents'],
    queryFn: async (): Promise<Agent[]> => {
      const response = await fetch('/api/agents');
      if (!response.ok) throw new Error('Failed to fetch agents');
      const data = await response.json();
      return data.agents || [];
    },
    retry: 2
  });

  // Query para coleções de conhecimento
  const collectionsQuery = useQuery({
    queryKey: ['/api/knowledge-collections'],
    queryFn: async (): Promise<KnowledgeBase[]> => {
      const response = await fetch('/api/knowledge-collections');
      if (!response.ok) throw new Error('Failed to fetch knowledge collections');
      const data = await response.json();
      return data.collections || [];
    },
    retry: 2
  });

  // Mutation para atualizar agente
  const updateAgentMutation = useMutation({
    mutationFn: async (agent: Agent): Promise<Agent> => {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agent)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update agent');
      }
      
      return response.json();
    },
    onSuccess: (updatedAgent) => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      toast({
        title: "Agente atualizado",
        description: `${updatedAgent.name} foi atualizado com sucesso.`
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar agente",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Mutation para refresh do status dos providers
  const refreshStatusMutation = useMutation({
    mutationFn: async (): Promise<ProviderStatus> => {
      const response = await fetch('/api/agents/provider-status', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh provider status');
      }
      
      const data = await response.json();
      return data.status;
    },
    onSuccess: (status) => {
      queryClient.setQueryData(['/api/agents/provider-status'], status);
      toast({
        title: "Status atualizado",
        description: "Status dos providers foi atualizado com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    // Data
    status: statusQuery.data || {} as ProviderStatus,
    models: modelsQuery.data || [],
    agents: agentsQuery.data || [],
    collections: collectionsQuery.data || [],
    
    // Loading states
    isLoadingStatus: statusQuery.isLoading,
    isLoadingModels: modelsQuery.isLoading,
    isLoadingAgents: agentsQuery.isLoading,
    isLoadingCollections: collectionsQuery.isLoading,
    
    // Error states
    statusError: statusQuery.error,
    modelsError: modelsQuery.error,
    agentsError: agentsQuery.error,
    collectionsError: collectionsQuery.error,
    
    // Actions
    updateAgent: updateAgentMutation.mutate,
    refreshStatus: refreshStatusMutation.mutate,
    
    // Mutation states
    isUpdatingAgent: updateAgentMutation.isPending,
    isRefreshingStatus: refreshStatusMutation.isPending,
    
    // Refetch functions
    refetchStatus: statusQuery.refetch,
    refetchModels: modelsQuery.refetch,
    refetchAgents: agentsQuery.refetch,
    refetchCollections: collectionsQuery.refetch
  };
};