/**
 * Hook para gerenciamento de formulários de agentes
 * Controla estado do formulário e validações
 */

import { useState, useEffect, useMemo } from 'react';
import type { Agent, AgentFormData, ModelConfig } from '../types/agent.types';

export const useAgentForm = (selectedAgent: Agent | null, models: ModelConfig[]) => {
  const [formData, setFormData] = useState<AgentFormData>({
    provider: 'openai',
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 4096,
    systemPrompt: '',
    responseFormat: 'text',
    seed: undefined,
    topP: undefined,
    frequencyPenalty: undefined,
    presencePenalty: undefined,
    webSearch: false,
    reasoningMode: false,
    reasoningEffort: 'medium',
    useRetrieval: false,
    useCodeInterpreter: false
  });

  // Atualizar formData quando selectedAgent muda
  useEffect(() => {
    if (selectedAgent) {
      setFormData({
        provider: selectedAgent.provider,
        model: selectedAgent.model,
        temperature: selectedAgent.temperature,
        maxTokens: selectedAgent.maxTokens,
        systemPrompt: selectedAgent.systemPrompt || '',
        responseFormat: selectedAgent.responseFormat || 'text',
        seed: selectedAgent.seed,
        topP: selectedAgent.topP,
        frequencyPenalty: selectedAgent.frequencyPenalty,
        presencePenalty: selectedAgent.presencePenalty,
        webSearch: selectedAgent.webSearch || false,
        reasoningMode: selectedAgent.reasoningMode || false,
        reasoningEffort: selectedAgent.reasoningEffort || 'medium',
        useRetrieval: selectedAgent.useRetrieval || false,
        useCodeInterpreter: selectedAgent.useCodeInterpreter || false
      });
    }
  }, [selectedAgent]);

  // Modelos disponíveis para o provider selecionado
  const availableModels = useMemo(() => {
    return models.filter(model => model.provider === formData.provider);
  }, [models, formData.provider]);

  // Modelo selecionado
  const selectedModel = useMemo(() => {
    return availableModels.find(model => model.model === formData.model);
  }, [availableModels, formData.model]);

  // Calcular custo estimado
  const estimatedCost = useMemo(() => {
    if (!selectedModel) return 0;
    return (selectedModel.inputCostPer1M + selectedModel.outputCostPer1M) / 1000;
  }, [selectedModel]);

  // Função para atualizar campo específico do formulário
  const updateFormData = <K extends keyof AgentFormData>(
    key: K,
    value: AgentFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      provider: 'openai',
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4096,
      systemPrompt: '',
      responseFormat: 'text',
      seed: undefined,
      topP: undefined,
      frequencyPenalty: undefined,
      presencePenalty: undefined,
      webSearch: false,
      reasoningMode: false,
      reasoningEffort: 'medium',
      useRetrieval: false,
      useCodeInterpreter: false
    });
  };

  // Validar formulário
  const isFormValid = useMemo(() => {
    return !!(
      formData.provider &&
      formData.model &&
      formData.temperature >= 0 &&
      formData.temperature <= 1 &&
      formData.maxTokens > 0 &&
      formData.maxTokens <= 16000
    );
  }, [formData]);

  // Verificar se há mudanças não salvas
  const hasUnsavedChanges = useMemo(() => {
    if (!selectedAgent) return false;
    
    return (
      selectedAgent.provider !== formData.provider ||
      selectedAgent.model !== formData.model ||
      selectedAgent.temperature !== formData.temperature ||
      selectedAgent.maxTokens !== formData.maxTokens ||
      (selectedAgent.systemPrompt || '') !== formData.systemPrompt ||
      (selectedAgent.responseFormat || 'text') !== formData.responseFormat ||
      selectedAgent.seed !== formData.seed ||
      selectedAgent.topP !== formData.topP ||
      selectedAgent.frequencyPenalty !== formData.frequencyPenalty ||
      selectedAgent.presencePenalty !== formData.presencePenalty ||
      (selectedAgent.webSearch || false) !== formData.webSearch ||
      (selectedAgent.reasoningMode || false) !== formData.reasoningMode ||
      (selectedAgent.reasoningEffort || 'medium') !== formData.reasoningEffort ||
      (selectedAgent.useRetrieval || false) !== formData.useRetrieval ||
      (selectedAgent.useCodeInterpreter || false) !== formData.useCodeInterpreter
    );
  }, [selectedAgent, formData]);

  return {
    formData,
    updateFormData,
    resetForm,
    availableModels,
    selectedModel,
    estimatedCost,
    isFormValid,
    hasUnsavedChanges
  };
};