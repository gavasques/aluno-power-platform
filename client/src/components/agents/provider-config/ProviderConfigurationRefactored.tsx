// Refactored Provider Configuration - Main component following SOLID principles

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProviderConfigurationProps } from './types';
import { QUERY_CONFIG, REASONING_MODELS } from './constants';
import { useProviderConfig } from './hooks/useProviderConfig';
import { ProviderSelector } from './components/ProviderSelector';
import { ModelSelector } from './components/ModelSelector';
import { TemperatureControl } from './components/TemperatureControl';
import { TokenControl } from './components/TokenControl';
import { OpenAIAdvancedSettings } from './components/OpenAIAdvancedSettings';
import { GrokAdvancedSettings } from './components/GrokAdvancedSettings';
import { ClaudeAdvancedSettings } from './components/ClaudeAdvancedSettings';

export default function ProviderConfigurationRefactored(props: ProviderConfigurationProps) {
  const { compact = false } = props;
  const { 
    formData, 
    isMultiStepMode, 
    updateProvider, 
    updateModel, 
    updateTemperature, 
    updateMaxTokens, 
    updateAdvancedSettings 
  } = useProviderConfig(props);

  // API queries with optimized caching
  const { data: status = {} } = useQuery({
    queryKey: ['/api/ai-providers/status'],
    ...QUERY_CONFIG
  });

  const { data: allModels = [] } = useQuery({
    queryKey: ['/api/ai-providers/models'],
    ...QUERY_CONFIG
  });

  const { data: collections = [] } = useQuery({
    queryKey: ['/api/knowledge-base/collections'],
    ...QUERY_CONFIG,
    enabled: formData.enableRetrieval
  });

  // Computed values
  const availableModels = allModels.filter((m: any) => m.provider === formData.provider);
  const selectedModel = availableModels.find((m: any) => m.model === formData.model);
  const supportsTemperature = !REASONING_MODELS.includes(formData.model);
  const isReasoningModel = REASONING_MODELS.includes(formData.model);

  // Reset advanced settings when switching to reasoning models
  useEffect(() => {
    if (isReasoningModel) {
      updateAdvancedSettings({
        enableCodeInterpreter: false,
        enableRetrieval: false,
        selectedCollections: []
      });
    }
  }, [formData.model, isReasoningModel, updateAdvancedSettings]);

  return (
    <div className="space-y-6">
      {/* Provider Selection */}
      <ProviderSelector
        selectedProvider={formData.provider}
        onProviderChange={updateProvider}
        providerStatus={status}
      />

      {/* Model Selection */}
      <ModelSelector
        selectedModel={formData.model}
        onModelChange={updateModel}
        availableModels={availableModels}
        compact={compact}
      />

      {/* Temperature Control */}
      <TemperatureControl
        temperature={formData.temperature}
        onTemperatureChange={updateTemperature}
        disabled={!supportsTemperature}
      />

      {/* Token Control */}
      <TokenControl
        maxTokens={formData.maxTokens}
        onMaxTokensChange={updateMaxTokens}
        selectedModel={selectedModel}
      />

      {/* Provider-specific Advanced Settings */}
      {formData.provider === 'xai' && (
        <GrokAdvancedSettings
          formData={formData}
          onAdvancedSettingsChange={updateAdvancedSettings}
        />
      )}

      {formData.provider === 'openai' && (
        <OpenAIAdvancedSettings
          formData={formData}
          onAdvancedSettingsChange={updateAdvancedSettings}
          collections={collections}
        />
      )}

      {formData.provider === 'anthropic' && (
        <ClaudeAdvancedSettings
          formData={formData}
          onAdvancedSettingsChange={updateAdvancedSettings}
        />
      )}
    </div>
  );
}