// Provider Configuration Types - Single source of truth for all provider-related interfaces

export interface ProviderInfo {
  value: string;
  label: string;
  icon: string;
  color: string;
}

export interface ModelInfo {
  provider: string;
  model: string;
  inputCostPer1M: number;
  outputCostPer1M: number;
  maxTokens: number;
  capabilities?: string[];
  recommended?: boolean;
}

export interface BaseFormData {
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  // OpenAI specific
  reasoning_effort?: 'low' | 'medium' | 'high';
  responseFormat?: string;
  seed?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  enableCodeInterpreter?: boolean;
  enableRetrieval?: boolean;
  fineTuneModel?: string;
  selectedCollections?: number[];
  // Grok specific
  reasoningLevel?: 'disabled' | 'low' | 'high';
  enableSearch?: boolean;
  enableImageUnderstanding?: boolean;
  // Claude specific
  enableExtendedThinking?: boolean;
  thinkingBudgetTokens?: number;
}

export interface ProviderConfigurationProps {
  // Single-step mode props
  formData?: BaseFormData;
  setFormData?: (data: BaseFormData) => void;
  compact?: boolean;
  
  // Multi-step mode props
  selectedProvider?: string;
  selectedModel?: string;
  temperature?: number;
  maxTokens?: number;
  onProviderChange?: (provider: string) => void;
  onModelChange?: (model: string) => void;
  onTemperatureChange?: (temperature: number) => void;
  onMaxTokensChange?: (maxTokens: number) => void;
  onAdvancedSettingsChange?: (settings: any) => void;
}

export interface ProviderConfigHookReturn {
  formData: BaseFormData;
  isMultiStepMode: boolean;
  updateProvider: (value: string) => void;
  updateModel: (value: string) => void;
  updateTemperature: (value: number) => void;
  updateMaxTokens: (value: number) => void;
  updateAdvancedSettings: (settings: any) => void;
}