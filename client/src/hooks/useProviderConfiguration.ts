import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Agent {
  id: string;
  name: string;
  description: string;
  provider: 'openai' | 'anthropic' | 'gemini' | 'deepseek';
  model: string;
  temperature: number;
  maxTokens: number;
  costPer1kTokens: number;
  isActive: boolean;
}

interface ConfigurationData {
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export function useProviderConfiguration(agentId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<ConfigurationData>({
    provider: 'openai',
    model: '',
    temperature: 0.7,
    maxTokens: 2000
  });

  const { data: agents = [] } = useQuery({
    queryKey: ["/api/agents"],
  });

  const { data: models = [] } = useQuery({
    queryKey: ["/api/ai-providers/models"],
  });

  const { data: status = {} } = useQuery({
    queryKey: ["/api/ai-providers/status"],
  });

  const updateAgentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Agent> }) => {
      const response = await fetch(`/api/agents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update agent');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Configurações salvas",
        description: "As configurações do agente foram atualizadas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Falha ao atualizar as configurações do agente.",
        variant: "destructive",
      });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/ai-providers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      return response.json();
    },
  });

  const selectedAgent = agentId ? (agents as any[]).find((agent: any) => agent.id === agentId) : null;

  const updateConfiguration = (updates: Partial<ConfigurationData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const saveConfiguration = async () => {
    if (!selectedAgent) return;

    await updateAgentMutation.mutateAsync({
      id: selectedAgent.id,
      data: {
        provider: formData.provider as Agent['provider'],
        model: formData.model,
        temperature: formData.temperature,
        maxTokens: formData.maxTokens,
      }
    });
  };

  const testConnection = async (testData: any) => {
    return testConnectionMutation.mutateAsync(testData);
  };

  return {
    agents,
    models,
    status,
    selectedAgent,
    formData,
    updateConfiguration,
    saveConfiguration,
    testConnection,
    isLoading: updateAgentMutation.isPending,
    isTestLoading: testConnectionMutation.isPending,
  };
}