// Unified Provider Configuration Types - Enterprise-scale architecture

export interface ProviderInfo {
  value: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  capabilities: string[];
  features: string[];
}

export interface ModelInfo {
  provider: string;
  model: string;
  inputCostPer1M: number;
  outputCostPer1M: number;
  maxTokens: number;
  capabilities?: string[];
  recommended?: boolean;
  supportsVision?: boolean;
  supportsTools?: boolean;
  supportsReasoning?: boolean;
}

export interface ProviderConfiguration {
  id?: string;
  name: string;
  description: string;
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  
  // Advanced settings for all providers
  reasoning_effort?: 'low' | 'medium' | 'high';
  responseFormat?: string;
  seed?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  
  // OpenAI specific
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
  
  // Configurable prompts
  systemPrompt?: string;
  promptTemplate?: string;
  placeholders?: PromptPlaceholder[];
  
  // Configuration metadata
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PromptPlaceholder {
  key: string;
  label: string;
  description: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'file';
  required: boolean;
  defaultValue?: string;
  options?: string[]; // For select type
}

export interface ProviderStep {
  id?: string;
  stepNumber: number;
  stepName: string;
  stepDescription: string;
  configuration: ProviderConfiguration;
  outputFormat: 'text' | 'json' | 'structured';
  passOutputToNext: boolean;
}

export interface ProviderWorkflow {
  id?: string;
  name: string;
  description: string;
  steps: ProviderStep[];
  isMultiStep: boolean;
  agentId?: string;
}

export interface TestConfiguration {
  prompt: string;
  referenceImages?: File[];
  placeholderValues?: Record<string, any>;
  expectedOutput?: string;
}

export interface TestResult {
  success: boolean;
  response?: string;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost?: number;
  executionTime?: number;
}

export interface ProviderTestingProps {
  configuration: ProviderConfiguration;
  onTest: (config: TestConfiguration) => Promise<TestResult>;
  isLoading: boolean;
  lastResult?: TestResult;
}

export interface UnifiedProviderManagerProps {
  mode: 'single-step' | 'multi-step' | 'full-configuration';
  workflow?: ProviderWorkflow;
  onWorkflowChange?: (workflow: ProviderWorkflow) => void;
  onConfigurationChange?: (config: ProviderConfiguration) => void;
  showTesting?: boolean;
  showPromptConfiguration?: boolean;
  compact?: boolean;
}

export interface ProviderConfigurationHookReturn {
  configuration: ProviderConfiguration;
  workflow: ProviderWorkflow;
  updateConfiguration: (updates: Partial<ProviderConfiguration>) => void;
  updateStep: (stepIndex: number, updates: Partial<ProviderStep>) => void;
  addStep: () => void;
  removeStep: (stepIndex: number) => void;
  testConfiguration: (config: TestConfiguration) => Promise<TestResult>;
  saveWorkflow: () => Promise<void>;
  isLoading: boolean;
}