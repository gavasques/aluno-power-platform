import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/UserContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { 
  Agent, 
  ModelConfig, 
  ProviderStatus, 
  AgentFormData,
  TestConnectionData,
  TestResult
} from '@/types/agent';

export const useAgentData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch provider status
  const { data: status = { openai: false, anthropic: false, gemini: false, deepseek: false, xai: false, openrouter: false } } = useQuery<ProviderStatus>({
    queryKey: ['/api/agents/provider-status'],
    enabled: user?.role === 'admin'
  });

  // Fetch available models
  const { data: models = [] } = useQuery<ModelConfig[]>({
    queryKey: ['/api/agents/models'],
    enabled: user?.role === 'admin'
  });

  // Fetch agents
  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ['/api/agents'],
    enabled: user?.role === 'admin'
  });

  // Fetch knowledge base collections
  const { data: collections = [] } = useQuery({
    queryKey: ['/api/knowledge-base/collections'],
    enabled: user?.role === 'admin'
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
      if (!response.ok) throw new Error('Failed to update agent');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      toast({
        title: "Agente atualizado",
        description: "As configurações do agente foram salvas com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar agente",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async (data: TestConnectionData) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/ai-providers/test', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Test failed');
      }
      return response.json();
    },
    onSuccess: (data: TestResult) => {
      toast({
        title: "Conexão testada",
        description: "A conexão com o provedor foi testada com sucesso."
      });
      return data;
    },
    onError: (error) => {
      const errorMsg = error instanceof Error ? error.message : "Falha no teste de conexão";
      toast({
        title: "Erro no teste",
        description: errorMsg,
        variant: "destructive"
      });
      throw error;
    }
  });

  return {
    // Data
    status,
    models,
    agents,
    collections,
    // Mutations
    updateAgentMutation,
    testConnectionMutation,
    // Loading states
    isLoadingModels: false,
    isLoadingAgents: false,
    isLoadingStatus: false
  };
};

export const useAgentForm = (selectedAgent: Agent | null, models: ModelConfig[]) => {
  const [formData, setFormData] = useState<AgentFormData>({
    provider: 'openai',
    model: '',
    temperature: 0.7,
    maxTokens: 2000,
    // Grok specific features
    reasoningLevel: 'disabled',
    enableSearch: false,
    enableImageUnderstanding: false,
    // OpenAI specific features
    enableReasoning: false,
    reasoning_effort: 'medium',
    responseFormat: 'text',
    seed: undefined,
    top_p: undefined,
    frequency_penalty: undefined,
    presence_penalty: undefined,
    enableCodeInterpreter: false,
    enableRetrieval: false,
    fineTuneModel: '',
    selectedCollections: [],
    // Claude specific features
    enableExtendedThinking: false,
    thinkingBudgetTokens: 10000
  });

  // Load agent data when selected
  useEffect(() => {
    if (selectedAgent) {
      setFormData({
        provider: selectedAgent.provider,
        model: selectedAgent.model,
        temperature: typeof selectedAgent.temperature === 'string' ? parseFloat(selectedAgent.temperature) : selectedAgent.temperature,
        maxTokens: selectedAgent.maxTokens,
        // Reset features when changing agent
        reasoningLevel: 'disabled',
        enableSearch: false,
        enableImageUnderstanding: false,
        enableReasoning: false,
        responseFormat: 'text',
        seed: undefined,
        top_p: undefined,
        frequency_penalty: undefined,
        presence_penalty: undefined,
        enableCodeInterpreter: false,
        enableRetrieval: false,
        fineTuneModel: '',
        selectedCollections: [],
        enableExtendedThinking: false,
        thinkingBudgetTokens: 10000
      });
    }
  }, [selectedAgent]);

  const updateFormData = <K extends keyof AgentFormData>(key: K, value: AgentFormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Filter models by selected provider
  const availableModels = models.filter(model => model.provider === formData.provider);

  // Check if model supports temperature
  const selectedModel = models.find((m: ModelConfig) => m.model === formData.model);
  const supportsTemperature = selectedModel ? !selectedModel.model.includes('o1') && !selectedModel.model.includes('o4') && !selectedModel.model.includes('image') : true;

  return {
    formData,
    updateFormData,
    availableModels,
    selectedModel,
    supportsTemperature,
    setFormData
  };
};