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
  reasoningLevel?: 'disabled' | 'low' | 'high';
  enableSearch?: boolean; // Web search for both OpenAI and Grok
  // OpenAI-specific features
  enableReasoning?: boolean; // For o3, o4-mini models
  reasoning_effort?: 'low' | 'medium' | 'high'; // For o3-mini, o4-mini models
  fineTuneModel?: string; // Fine-tuned model ID
  attachments?: Array<{
    data: string;
    filename: string;
    type: 'code' | 'text' | 'pdf' | 'image';
  }>;
  tools?: Array<{
    type: 'function' | 'code_interpreter' | 'retrieval';
    function?: {
      name: string;
      description: string;
      parameters: any;
    };
  }>;
  response_format?: {
    type: 'text' | 'json_object' | 'json_schema';
    json_schema?: any;
  };
  seed?: number; // For deterministic outputs
  top_p?: number; // Alternative to temperature
  frequency_penalty?: number; // -2.0 to 2.0
  presence_penalty?: number; // -2.0 to 2.0
  logit_bias?: Record<string, number>; // Token biases
  stop?: string[]; // Stop sequences
  stream?: boolean; // Enable streaming
  selectedCollections?: number[]; // Knowledge base collection IDs for retrieval
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