import { AIRequest, AIResponse } from '../types/ai.types.js';
import { BaseProvider } from './BaseProvider.js';

export class OpenRouterProvider extends BaseProvider {
  protected providerName = 'openrouter';
  private apiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1';

  constructor() {
    super();
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ [OPENROUTER] OPENROUTER_API_KEY not configured');
    } else {
      console.log('✅ [OPENROUTER] Provider initialized successfully');
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  getAvailableModels() {
    if (!this.isConfigured()) {
      return [];
    }

    return [
      // Popular models available on OpenRouter
      {
        provider: 'openrouter' as const,
        model: 'openai/gpt-4o',
        inputCostPer1M: 2500,
        outputCostPer1M: 10000,
        maxTokens: 128000,
        capabilities: ['text', 'vision'],
        recommended: true
      },
      {
        provider: 'openrouter' as const,
        model: 'openai/gpt-4o-mini',
        inputCostPer1M: 150,
        outputCostPer1M: 600,
        maxTokens: 128000,
        capabilities: ['text', 'vision'],
        recommended: true
      },
      {
        provider: 'openrouter' as const,
        model: 'anthropic/claude-3.5-sonnet',
        inputCostPer1M: 3000,
        outputCostPer1M: 15000,
        maxTokens: 200000,
        capabilities: ['text', 'vision'],
        recommended: true
      },
      {
        provider: 'openrouter' as const,
        model: 'anthropic/claude-3-haiku',
        inputCostPer1M: 250,
        outputCostPer1M: 1250,
        maxTokens: 200000,
        capabilities: ['text', 'vision']
      },
      {
        provider: 'openrouter' as const,
        model: 'google/gemini-pro-1.5',
        inputCostPer1M: 1250,
        outputCostPer1M: 5000,
        maxTokens: 2000000,
        capabilities: ['text', 'vision']
      },
      {
        provider: 'openrouter' as const,
        model: 'meta-llama/llama-3.1-70b-instruct',
        inputCostPer1M: 520,
        outputCostPer1M: 750,
        maxTokens: 128000,
        capabilities: ['text']
      },
      {
        provider: 'openrouter' as const,
        model: 'mistralai/mistral-large',
        inputCostPer1M: 3000,
        outputCostPer1M: 9000,
        maxTokens: 128000,
        capabilities: ['text']
      },
      {
        provider: 'openrouter' as const,
        model: 'perplexity/llama-3.1-sonar-large-128k-online',
        inputCostPer1M: 1000,
        outputCostPer1M: 1000,
        maxTokens: 127072,
        capabilities: ['text', 'search']
      },
      {
        provider: 'openrouter' as const,
        model: 'auto',
        inputCostPer1M: 0,
        outputCostPer1M: 0,
        maxTokens: 200000,
        capabilities: ['text', 'vision', 'auto-routing']
      }
    ];
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    console.log(`🚀 [OPENROUTER] Processing request for model: ${request.model}`);
    
    try {
      const headers = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.SITE_URL || 'http://localhost:5000',
        'X-Title': 'Aluno Power Platform - AI Agents'
      };

      // Build request body compatible with OpenAI format
      const body: any = {
        model: request.model,
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: Math.min(request.maxTokens || 4000, 4000), // Limit to prevent timeouts
      };

      // Add optional parameters if provided
      if (request.openaiAdvanced?.top_p !== undefined) {
        body.top_p = request.openaiAdvanced.top_p;
      }
      if (request.openaiAdvanced?.frequency_penalty !== undefined) {
        body.frequency_penalty = request.openaiAdvanced.frequency_penalty;
      }
      if (request.openaiAdvanced?.presence_penalty !== undefined) {
        body.presence_penalty = request.openaiAdvanced.presence_penalty;
      }
      if (request.openaiAdvanced?.seed !== undefined) {
        body.seed = request.openaiAdvanced.seed;
      }

      console.log(`🔧 [OPENROUTER] Request params for ${request.model}:`, JSON.stringify(body, null, 2));

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ [OPENROUTER] Response received:`, JSON.stringify(data, null, 2));

      const content = data.choices?.[0]?.message?.content || '';
      const usage = data.usage || {};

      // Calculate cost based on OpenRouter pricing
      const inputTokens = usage.prompt_tokens || 0;
      const outputTokens = usage.completion_tokens || 0;
      const totalTokens = usage.total_tokens || (inputTokens + outputTokens);

      // For cost calculation, we'll use a conservative estimate
      // since OpenRouter pricing varies by model
      const estimatedCost = (inputTokens * 0.000001) + (outputTokens * 0.000002);

      return {
        content,
        usage: {
          inputTokens,
          outputTokens,
          totalTokens
        },
        cost: estimatedCost
      };

    } catch (error) {
      console.error('❌ [OPENROUTER] Error generating response:', error);
      throw error;
    }
  }

  async checkConnection(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/key`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('❌ [OPENROUTER] Connection check failed:', error);
      return false;
    }
  }

  async getModels(): Promise<any[]> {
    if (!this.apiKey) {
      console.warn('⚠️ [OPENROUTER] API key not configured, returning default models');
      return this.getDefaultModels();
    }

    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn(`⚠️ [OPENROUTER] Failed to fetch models: ${response.status}`);
        return this.getDefaultModels();
      }

      const data = await response.json();
      const models = data.data || [];

      console.log(`✅ [OPENROUTER] Fetched ${models.length} models from API`);

      // Transform OpenRouter models to our format
      return models.map((model: any) => ({
        provider: 'openrouter',
        model: model.id,
        inputCostPer1M: (model.pricing?.prompt || 0) * 1000000,
        outputCostPer1M: (model.pricing?.completion || 0) * 1000000,
        maxTokens: model.context_length || 4000,
        capabilities: this.parseCapabilities(model),
        name: model.name || model.id,
        description: model.description || '',
        recommended: model.id === 'openrouter/auto'
      })).sort((a: any, b: any) => {
        // Sort with recommended first, then by name
        if (a.recommended && !b.recommended) return -1;
        if (!a.recommended && b.recommended) return 1;
        return a.name.localeCompare(b.name);
      });

    } catch (error) {
      console.error('❌ [OPENROUTER] Error fetching models:', error);
      return this.getDefaultModels();
    }
  }

  private parseCapabilities(model: any): string[] {
    const capabilities = ['chat'];
    
    if (model.modalities?.includes('image')) {
      capabilities.push('vision');
    }
    
    if (model.supported_parameters?.includes('tools')) {
      capabilities.push('tools');
    }
    
    if (model.supported_parameters?.includes('response_format')) {
      capabilities.push('json');
    }

    return capabilities;
  }

  private getDefaultModels(): any[] {
    return [
      {
        provider: 'openrouter',
        model: 'openrouter/auto',
        inputCostPer1M: 0,
        outputCostPer1M: 0,
        maxTokens: 4000,
        capabilities: ['chat'],
        name: 'Auto (OpenRouter)',
        description: 'Automatically selects the best model for your request',
        recommended: true
      },
      {
        provider: 'openrouter',
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        inputCostPer1M: 0,
        outputCostPer1M: 0,
        maxTokens: 131072,
        capabilities: ['chat'],
        name: 'Llama 3.2 3B (Free)',
        description: 'Fast and efficient for general tasks'
      },
      {
        provider: 'openrouter',
        model: 'microsoft/phi-3-mini-128k-instruct:free',
        inputCostPer1M: 0,
        outputCostPer1M: 0,
        maxTokens: 128000,
        capabilities: ['chat'],
        name: 'Phi-3 Mini (Free)',
        description: 'Microsoft\'s compact model for efficient inference'
      },
      {
        provider: 'openrouter',
        model: 'google/gemma-2-9b-it:free',
        inputCostPer1M: 0,
        outputCostPer1M: 0,
        maxTokens: 8192,
        capabilities: ['chat'],
        name: 'Gemma 2 9B (Free)',
        description: 'Google\'s open model for various tasks'
      }
    ];
  }
}