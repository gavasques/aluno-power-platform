import { useState, useEffect, useMemo } from 'react';
import type { Agent, AgentFormData, ModelConfig, UseAgentFormReturn, ValidationErrors } from '../types';

/**
 * USE AGENT FORM HOOK - FASE 4 REFATORAÇÃO
 * 
 * Hook especializado para gerenciamento do formulário de agentes
 * Responsabilidade única: Estado do formulário, validação e transformações
 */
export function useAgentForm(
  selectedAgent: Agent | null,
  models: ModelConfig[]
): UseAgentFormReturn {

  // Initial form state
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
    thinkingBudgetTokens: 10000,
  });

  // Load agent data when selected
  useEffect(() => {
    if (selectedAgent) {
      setFormData({
        provider: selectedAgent.provider,
        model: selectedAgent.model,
        temperature: typeof selectedAgent.temperature === 'string' 
          ? parseFloat(selectedAgent.temperature) 
          : selectedAgent.temperature,
        maxTokens: selectedAgent.maxTokens,
        
        // Reset provider-specific features when changing agent
        reasoningLevel: 'disabled',
        enableSearch: false,
        enableImageUnderstanding: false,
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
        enableExtendedThinking: false,
        thinkingBudgetTokens: 10000
      });
    }
  }, [selectedAgent]);

  // Reset model when provider changes
  useEffect(() => {
    if (selectedAgent && formData.provider !== selectedAgent.provider) {
      setFormData(prev => ({ ...prev, model: '' }));
    }
  }, [formData.provider, selectedAgent]);

  // Update form data function
  const updateFormData = <K extends keyof AgentFormData>(
    key: K, 
    value: AgentFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Reset form function
  const resetForm = () => {
    if (selectedAgent) {
      setFormData({
        provider: selectedAgent.provider,
        model: selectedAgent.model,
        temperature: typeof selectedAgent.temperature === 'string' 
          ? parseFloat(selectedAgent.temperature) 
          : selectedAgent.temperature,
        maxTokens: selectedAgent.maxTokens,
        
        // Reset all provider-specific features
        reasoningLevel: 'disabled',
        enableSearch: false,
        enableImageUnderstanding: false,
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
        enableExtendedThinking: false,
        thinkingBudgetTokens: 10000
      });
    }
  };

  // Computed values
  const availableModels = useMemo(() => {
    return models.filter(model => model.provider === formData.provider);
  }, [models, formData.provider]);

  const selectedModel = useMemo(() => {
    return models.find((m: ModelConfig) => m.model === formData.model);
  }, [models, formData.model]);

  const supportsTemperature = useMemo(() => {
    if (!selectedModel) return true;
    
    // Models that don't support temperature
    const noTemperatureModels = ['o1', 'o4', 'image', 'o3'];
    return !noTemperatureModels.some(pattern => 
      selectedModel.model.toLowerCase().includes(pattern)
    );
  }, [selectedModel]);

  // Form validation
  const errors = useMemo((): ValidationErrors => {
    const validationErrors: ValidationErrors = {};

    if (!formData.provider) {
      validationErrors.provider = 'Provedor é obrigatório';
    }

    if (!formData.model) {
      validationErrors.model = 'Modelo é obrigatório';
    }

    if (formData.temperature < 0 || formData.temperature > 1) {
      validationErrors.temperature = 'Temperatura deve estar entre 0 e 1';
    }

    if (formData.maxTokens < 1 || formData.maxTokens > 32000) {
      validationErrors.maxTokens = 'Max tokens deve estar entre 1 e 32000';
    }

    // Provider-specific validations
    if (formData.provider === 'openai') {
      if (formData.top_p !== undefined && (formData.top_p < 0 || formData.top_p > 1)) {
        validationErrors.general = 'Top P deve estar entre 0 e 1';
      }
      
      if (formData.frequency_penalty !== undefined && 
          (formData.frequency_penalty < -2 || formData.frequency_penalty > 2)) {
        validationErrors.general = 'Frequency penalty deve estar entre -2 e 2';
      }
      
      if (formData.presence_penalty !== undefined && 
          (formData.presence_penalty < -2 || formData.presence_penalty > 2)) {
        validationErrors.general = 'Presence penalty deve estar entre -2 e 2';
      }
    }

    if (formData.provider === 'anthropic') {
      if (formData.thinkingBudgetTokens < 1 || formData.thinkingBudgetTokens > 100000) {
        validationErrors.general = 'Thinking budget deve estar entre 1 e 100000 tokens';
      }
    }

    return validationErrors;
  }, [formData]);

  const isFormValid = useMemo(() => {
    return Object.keys(errors).length === 0 && formData.provider && formData.model;
  }, [errors, formData.provider, formData.model]);

  return {
    // Form data
    formData,
    updateFormData,
    resetForm,
    
    // Computed data
    availableModels,
    selectedModel,
    supportsTemperature,
    
    // Validation
    isFormValid,
    errors
  };
}