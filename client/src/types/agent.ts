export interface Agent {
  id: string;
  name: string;
  description: string;
  provider: 'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'xai' | 'openrouter';
  model: string;
  temperature: number;
  maxTokens: number;
  costPer1kTokens: number;
  isActive: boolean;
}

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

export interface AgentFormData {
  provider: Agent['provider'];
  model: string;
  temperature: number;
  maxTokens: number;
  // Grok specific features
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

export interface TestResult {
  response: string;
  requestSent: string;
  responseReceived: string;
}

export type AgentProvider = 'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'xai' | 'openrouter';
export type ReasoningLevel = 'disabled' | 'low' | 'high';
export type ReasoningEffort = 'low' | 'medium' | 'high';
export type ResponseFormat = 'text' | 'json_object' | 'json_schema';
export type ActiveTab = 'providers' | 'knowledge-base';

export const PROVIDERS: ProviderInfo[] = [
  { value: 'openai', label: 'OpenAI (ChatGPT)', icon: '🤖', color: 'bg-green-100 text-green-800' },
  { value: 'anthropic', label: 'Anthropic (Claude)', icon: '🧠', color: 'bg-purple-100 text-purple-800' },
  { value: 'gemini', label: 'Google Gemini', icon: '⭐', color: 'bg-blue-100 text-blue-800' },
  { value: 'deepseek', label: 'DeepSeek AI', icon: '🔍', color: 'bg-orange-100 text-orange-800' },
  { value: 'xai', label: 'xAI (Grok)', icon: '🧪', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'openrouter', label: 'OpenRouter (400+ Models)', icon: '🌐', color: 'bg-teal-100 text-teal-800' }
];