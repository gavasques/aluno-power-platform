// Provider Configuration Constants - Centralized configuration data

import { ProviderInfo } from './types';

export const PROVIDERS: ProviderInfo[] = [
  { value: 'openai', label: 'OpenAI (ChatGPT)', icon: '🤖', color: 'bg-green-100 text-green-800' },
  { value: 'anthropic', label: 'Anthropic (Claude)', icon: '🧠', color: 'bg-purple-100 text-purple-800' },
  { value: 'gemini', label: 'Google Gemini', icon: '⭐', color: 'bg-blue-100 text-blue-800' },
  { value: 'deepseek', label: 'DeepSeek AI', icon: '🔍', color: 'bg-orange-100 text-orange-800' },
  { value: 'xai', label: 'xAI (Grok)', icon: '🧪', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'openrouter', label: 'OpenRouter (400+ Models)', icon: '🌐', color: 'bg-teal-100 text-teal-800' }
];

export const REASONING_MODELS = ['o3', 'o4-mini', 'o3-mini'];

export const CLAUDE_EXTENDED_THINKING_MODELS = [
  'claude-opus-4-20250514',
  'claude-sonnet-4-20250514', 
  'claude-3-7-sonnet-20250219'
];

export const DEFAULT_FORM_DATA = {
  provider: 'openai',
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 2000,
  reasoning_effort: 'medium' as const,
  responseFormat: 'text',
  reasoningLevel: 'disabled' as const,
  enableSearch: false,
  enableImageUnderstanding: false,
  enableCodeInterpreter: false,
  enableRetrieval: false,
  selectedCollections: [],
  enableExtendedThinking: false,
  thinkingBudgetTokens: 10000
};

export const QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false,
  refetchOnMount: false
};