/**
 * AGENT PROVIDER SETTINGS TYPES - FASE 4 REFATORAÇÃO
 * 
 * Tipos centralizados para todo o sistema de configuração de agentes
 * Elimina 20+ interfaces espalhadas no componente original
 */

// ================================
// CORE AGENT TYPES
// ================================

export interface Agent {
  id: string;
  name: string;
  description: string;
  provider: AgentProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  costPer1kTokens: number;
  isActive: boolean;
}

export type AgentProvider = 'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'xai' | 'openrouter';

export interface ModelConfig {
  provider: string;
  model: string;
  inputCostPer1M: number;
  outputCostPer1M: number;
  maxTokens: number;
  recommended?: boolean;
}

export interface ProviderStatus {
  openai: boolean;
  anthropic: boolean;
  gemini: boolean;
  deepseek: boolean;
  xai: boolean;
  openrouter: boolean;
}

export interface ProviderInfo {
  value: string;
  label: string;
  icon: string;
  color: string;
}

// ================================
// FORM DATA TYPES
// ================================

export interface AgentFormData {
  provider: AgentProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  
  // Grok (xAI) specific features
  reasoningLevel: 'disabled' | 'low' | 'high';
  enableSearch: boolean;
  enableImageUnderstanding: boolean;
  
  // OpenAI specific features
  enableReasoning: boolean;
  reasoning_effort: 'low' | 'medium' | 'high';
  responseFormat: string;
  seed?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  enableCodeInterpreter: boolean;
  enableRetrieval: boolean;
  fineTuneModel: string;
  selectedCollections: number[];
  
  // Claude specific features
  enableExtendedThinking: boolean;
  thinkingBudgetTokens: number;
}

export interface TestConnectionData {
  provider: string;
  model: string;
  prompt: string;
  temperature: number;
  maxTokens: number;
  imageData?: string;
  reasoningLevel?: 'disabled' | 'low' | 'high';
  enableSearch?: boolean;
  enableImageUnderstanding?: boolean;
  referenceImages?: Array<{ data: string; filename: string }>;
}

export interface TestResponse {
  response: string;
  requestSent: string;
  responseReceived: string;
}

// ================================
// IMAGE HANDLING TYPES
// ================================

export interface ReferenceImage {
  file: File;
  preview: string;
}

export interface ImageUploadState {
  uploadedImage: string | null;
  imageFile: File | null;
  referenceImages: ReferenceImage[];
}

// ================================
// TAB AND UI STATE TYPES
// ================================

export type ActiveTab = 'providers' | 'knowledge-base';

export interface TabState {
  activeTab: ActiveTab;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
}

export interface TestState {
  prompt: string;
  response: string;
  requestSent: string;
  responseReceived: string;
  isLoading: boolean;
}

// ================================
// FILTER TYPES
// ================================

export interface AgentFilters {
  search: string;
  provider: string;
  status: 'all' | 'active' | 'inactive';
}

export interface ModelFilters {
  search: string;
  provider: string;
  recommended: boolean;
}

// ================================
// HOOK RETURN TYPES
// ================================

export interface UseAgentDataReturn {
  // Data
  agents: Agent[];
  models: ModelConfig[];
  status: ProviderStatus;
  collections: any[];
  
  // Loading states
  isLoadingAgents: boolean;
  isLoadingModels: boolean;
  isLoadingStatus: boolean;
  isLoadingCollections: boolean;
  
  // Actions
  updateAgent: (agent: Agent) => Promise<void>;
  refreshData: () => void;
}

export interface UseAgentFormReturn {
  // Form data
  formData: AgentFormData;
  updateFormData: <K extends keyof AgentFormData>(key: K, value: AgentFormData[K]) => void;
  resetForm: () => void;
  
  // Computed data
  availableModels: ModelConfig[];
  selectedModel: ModelConfig | undefined;
  supportsTemperature: boolean;
  
  // Validation
  isFormValid: boolean;
  errors: Record<string, string>;
}

export interface UseTestConnectionReturn {
  // Test state
  testState: TestState;
  updateTestState: <K extends keyof TestState>(key: K, value: TestState[K]) => void;
  
  // Actions
  runTest: (data: TestConnectionData) => Promise<void>;
  clearTest: () => void;
  isLoading: boolean;
}

export interface UseImageHandlingReturn {
  // Image state
  imageState: ImageUploadState;
  
  // Actions
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  clearImages: () => void;
}

export interface UseAgentTabsReturn {
  // Tab state
  tabState: TabState;
  setActiveTab: (tab: ActiveTab) => void;
  setLoading: (loading: boolean) => void;
  setUnsavedChanges: (hasChanges: boolean) => void;
}

export interface UseAgentFiltersReturn {
  // Filters
  agentFilters: AgentFilters;
  modelFilters: ModelFilters;
  
  // Actions
  updateAgentFilters: (filters: Partial<AgentFilters>) => void;
  updateModelFilters: (filters: Partial<ModelFilters>) => void;
  clearAllFilters: () => void;
}

// ================================
// COMPONENT PROPS TYPES
// ================================

export interface ProviderStatusCardProps {
  status: ProviderStatus;
  isLoading: boolean;
}

export interface AgentListCardProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  filters: AgentFilters;
  isLoading: boolean;
  onAgentSelect: (agent: Agent) => void;
  onFiltersChange: (filters: Partial<AgentFilters>) => void;
}

export interface AgentConfigurationCardProps {
  selectedAgent: Agent | null;
  formData: AgentFormData;
  models: ModelConfig[];
  collections: any[];
  isLoading: boolean;
  onFormDataUpdate: <K extends keyof AgentFormData>(key: K, value: AgentFormData[K]) => void;
  onSave: () => void;
}

export interface TestConnectionCardProps {
  formData: AgentFormData;
  testState: TestState;
  imageState: ImageUploadState;
  onTestStateUpdate: <K extends keyof TestState>(key: K, value: TestState[K]) => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onClearImages: () => void;
  onRunTest: () => void;
  isLoading: boolean;
}

export interface KnowledgeBaseTabProps {
  collections: any[];
  isLoading: boolean;
}

// ================================
// CONSTANTS
// ================================

export const PROVIDERS: ProviderInfo[] = [
  { value: 'openai', label: 'OpenAI (ChatGPT)', icon: '🤖', color: 'bg-green-100 text-green-800' },
  { value: 'anthropic', label: 'Anthropic (Claude)', icon: '🧠', color: 'bg-purple-100 text-purple-800' },
  { value: 'gemini', label: 'Google Gemini', icon: '⭐', color: 'bg-blue-100 text-blue-800' },
  { value: 'deepseek', label: 'DeepSeek AI', icon: '🔍', color: 'bg-orange-100 text-orange-800' },
  { value: 'xai', label: 'xAI (Grok)', icon: '🧪', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'openrouter', label: 'OpenRouter (400+ Models)', icon: '🌐', color: 'bg-teal-100 text-teal-800' }
];

export const REASONING_LEVELS = [
  { value: 'disabled', label: 'Desabilitado' },
  { value: 'low', label: 'Baixo' },
  { value: 'high', label: 'Alto' }
] as const;

export const REASONING_EFFORTS = [
  { value: 'low', label: 'Baixo' },
  { value: 'medium', label: 'Médio' },
  { value: 'high', label: 'Alto' }
] as const;

export const RESPONSE_FORMATS = [
  { value: 'text', label: 'Texto' },
  { value: 'json_object', label: 'JSON Object' },
  { value: 'json_schema', label: 'JSON Schema' }
] as const;

export const AGENT_STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' }
] as const;

// ================================
// ERROR TYPES
// ================================

export interface AgentError {
  field: string;
  message: string;
}

export interface ValidationErrors {
  provider?: string;
  model?: string;
  temperature?: string;
  maxTokens?: string;
  general?: string;
}

// ================================
// API RESPONSE TYPES
// ================================

export interface AgentUpdateResponse {
  success: boolean;
  agent: Agent;
  message: string;
}

export interface TestConnectionResponse {
  success: boolean;
  response: string;
  requestSent: string;
  responseReceived: string;
  error?: string;
}

export interface ProviderStatusResponse {
  success: boolean;
  status: ProviderStatus;
}

export interface ModelsResponse {
  success: boolean;
  models: ModelConfig[];
}