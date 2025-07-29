import React, { useState } from 'react';
import { AgentProviderPresentation } from './AgentProviderPresentation';
import { useAgentData } from './hooks/useAgentData';
import { useAgentForm } from './hooks/useAgentForm';
import { useTestConnection } from './hooks/useTestConnection';
import { useImageHandling } from './hooks/useImageHandling';
import { useAgentTabs } from './hooks/useAgentTabs';
import { useAgentFilters } from './hooks/useAgentFilters';
import type { Agent, TestConnectionData } from './types';

/**
 * AGENT PROVIDER CONTAINER - FASE 4 REFATORAÇÃO
 * 
 * Container Component seguindo padrão Container/Presentational
 * Responsabilidade única: Orquestrar hooks e gerenciar lógica de negócio
 * 
 * Antes: Lógica misturada no componente de 1.847 linhas
 * Depois: Container limpo focado apenas em coordenação de estado
 */
export function AgentProviderContainer() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Initialize all specialized hooks
  const agentData = useAgentData();
  const agentForm = useAgentForm(selectedAgent, agentData.models);
  const testConnection = useTestConnection();
  const imageHandling = useImageHandling();
  const tabsState = useAgentTabs();
  const filtersState = useAgentFilters();

  // Handler for agent selection
  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  // Handler for saving agent configuration
  const handleSave = async () => {
    if (!selectedAgent || !agentForm.isFormValid) return;

    const selectedModel = agentData.models.find((m) => m.model === agentForm.formData.model);
    const costPer1kTokens = selectedModel 
      ? (selectedModel.inputCostPer1M + selectedModel.outputCostPer1M) / 1000
      : parseFloat(selectedAgent.costPer1kTokens.toString());

    try {
      await agentData.updateAgent({
        ...selectedAgent,
        provider: agentForm.formData.provider,
        model: agentForm.formData.model,
        temperature: agentForm.formData.temperature,
        maxTokens: agentForm.formData.maxTokens,
        costPer1kTokens
      });
    } catch (error) {

    }
  };

  // Handler for test connection
  const handleTestConnection = async () => {
    if (!testConnection.testState.prompt.trim() || !agentForm.formData.model) {
      return;
    }

    let imageData: string | undefined;
    let referenceImages: Array<{ data: string; filename: string }> = [];

    // Handle image conversion for vision models
    const hasVisionSupport = agentForm.formData.provider === 'openai' || 
                            agentForm.formData.provider === 'anthropic' || 
                            agentForm.formData.provider === 'gemini' ||
                            (agentForm.formData.provider === 'xai' && agentForm.formData.enableImageUnderstanding);

    if (hasVisionSupport && imageHandling.imageState.referenceImages.length > 0) {
      try {
        referenceImages = await Promise.all(
          imageHandling.imageState.referenceImages.map(async (img) => ({
            data: await convertImageToBase64(img.file),
            filename: img.file.name
          }))
        );
        
        if (referenceImages.length > 0) {
          imageData = referenceImages[0].data;
        }
      } catch (error) {

      }
    }

    const testData: TestConnectionData = {
      provider: agentForm.formData.provider,
      model: agentForm.formData.model,
      prompt: testConnection.testState.prompt,
      temperature: agentForm.formData.temperature,
      maxTokens: agentForm.formData.maxTokens,
      imageData,
      reasoningLevel: agentForm.formData.reasoningLevel,
      enableSearch: agentForm.formData.enableSearch,
      enableImageUnderstanding: agentForm.formData.enableImageUnderstanding,
      referenceImages
    };

    await testConnection.runTest(testData);
  };

  // Helper function to convert image to base64
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Pass all props to presentation component
  return (
    <AgentProviderPresentation
      // Agent selection
      selectedAgent={selectedAgent}
      onAgentSelect={handleAgentSelect}
      
      // Data hooks
      agentData={agentData}
      agentForm={agentForm}
      testConnection={testConnection}
      imageHandling={imageHandling}
      
      // UI state hooks
      tabsState={tabsState}
      filtersState={filtersState}
      
      // Action handlers
      onSave={handleSave}
      onTestConnection={handleTestConnection}
    />
  );
}

// Helper function to convert image to base64 (moved outside for reusability)
export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};