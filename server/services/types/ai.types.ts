export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'xai';

export interface AIRequest {
  provider: AIProvider;
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  maxTokens?: number;
  imageData?: string;
  referenceImages?: Array<{
    data: string;
    filename: string;
  }>;
  // Grok-specific features
  reasoningLevel?: 'low' | 'high';
  enableSearch?: boolean;
}

export interface AIResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  cost: number;
}

export interface ModelConfig {
  provider: AIProvider;
  model: string;
  inputCostPer1M: number;
  outputCostPer1M: number;
  maxTokens: number;
  capabilities?: string[];
  recommended?: boolean;
}

export interface ProviderStatus {
  openai: boolean;
  anthropic: boolean;
  gemini: boolean;
  deepseek: boolean;
  xai: boolean;
}