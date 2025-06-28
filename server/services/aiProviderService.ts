import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';

export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'deepseek';

export interface AIRequest {
  provider: AIProvider;
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  maxTokens?: number;
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
}

// Model configurations with latest pricing
export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  // OpenAI Normal Models
  'gpt-4.1': {
    provider: 'openai',
    model: 'gpt-4.1',
    inputCostPer1M: 2.50,   // Atualizado: $2.50 por 1M tokens
    outputCostPer1M: 10.00, // Atualizado: $10.00 por 1M tokens
    maxTokens: 128000
  },
  'gpt-4.1-mini': {
    provider: 'openai',
    model: 'gpt-4.1-mini',
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.60,
    maxTokens: 128000
  },
  'gpt-4.1-nano': {
    provider: 'openai',
    model: 'gpt-4.1-nano',
    inputCostPer1M: 0.05,
    outputCostPer1M: 0.20,
    maxTokens: 32000
  },
  
  // OpenAI Reasoning Models (o1 series)
  'o1-mini': {
    provider: 'openai',
    model: 'o1-mini',
    inputCostPer1M: 3.00,
    outputCostPer1M: 12.00,
    maxTokens: 65536
  },
  'o1-preview': {
    provider: 'openai',
    model: 'o1-preview',
    inputCostPer1M: 15.00,
    outputCostPer1M: 60.00,
    maxTokens: 128000
  },

  // OpenAI o4 Reasoning Models
  'o4-mini': {
    provider: 'openai',
    model: 'o4-mini',
    inputCostPer1M: 3.00,
    outputCostPer1M: 12.00,
    maxTokens: 65536
  },
  'o4': {
    provider: 'openai',
    model: 'o4',
    inputCostPer1M: 15.00,
    outputCostPer1M: 60.00,
    maxTokens: 128000
  },

  // OpenAI Image Generation (gpt-image-1 - preços oficiais da documentação)
  'gpt-image-1': {
    provider: 'openai',
    model: 'gpt-image-1',
    inputCostPer1M: 5.00,   // Text tokens input: $5.00 per 1M
    outputCostPer1M: 40.00, // Image tokens output: $40.00 per 1M
    maxTokens: 4096
  },

  // OpenAI Legacy Models - Preços atualizados Dezembro 2024
  'gpt-4o': {
    provider: 'openai',
    model: 'gpt-4o',
    inputCostPer1M: 2.50,   // Atualizado: $2.50 por 1M tokens
    outputCostPer1M: 10.00, // Atualizado: $10.00 por 1M tokens
    maxTokens: 128000
  },
  'gpt-4o-mini': {
    provider: 'openai',
    model: 'gpt-4o-mini',
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.60,
    maxTokens: 128000
  },
  'gpt-4-turbo': {
    provider: 'openai',
    model: 'gpt-4-turbo',
    inputCostPer1M: 10.00,
    outputCostPer1M: 30.00,
    maxTokens: 128000
  },
  'gpt-3.5-turbo': {
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    inputCostPer1M: 0.50,
    outputCostPer1M: 1.50,
    maxTokens: 16385
  },

  // Anthropic Claude 4.0 Models
  'claude-sonnet-4-20250514': {
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    maxTokens: 200000
  },
  'claude-4-opus': {
    provider: 'anthropic',
    model: 'claude-4-opus',
    inputCostPer1M: 15.00,
    outputCostPer1M: 75.00,
    maxTokens: 200000
  },
  // Anthropic Claude 3.x Models (Legacy)
  'claude-3-5-sonnet-20241022': {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    maxTokens: 200000
  },
  'claude-3-opus-20240229': {
    provider: 'anthropic',
    model: 'claude-3-opus-20240229',
    inputCostPer1M: 15.00,
    outputCostPer1M: 75.00,
    maxTokens: 200000
  },
  'claude-3-haiku-20240307': {
    provider: 'anthropic',
    model: 'claude-3-haiku-20240307',
    inputCostPer1M: 0.25,
    outputCostPer1M: 1.25,
    maxTokens: 200000
  },

  // Google Gemini 2.5 Models
  'gemini-2.5-pro': {
    provider: 'gemini',
    model: 'gemini-2.5-pro',
    inputCostPer1M: 1.25,
    outputCostPer1M: 5.00,
    maxTokens: 2000000
  },
  'gemini-2.5-flash': {
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    maxTokens: 1000000
  },
  'gemini-2.5-flash-lite-preview-06-17': {
    provider: 'gemini',
    model: 'gemini-2.5-flash-lite-preview-06-17',
    inputCostPer1M: 0.05,
    outputCostPer1M: 0.20,
    maxTokens: 500000
  },



  // Google Gemini Legacy Models
  'gemini-1.5-pro': {
    provider: 'gemini',
    model: 'gemini-1.5-pro',
    inputCostPer1M: 1.25,
    outputCostPer1M: 5.00,
    maxTokens: 2000000
  },
  'gemini-1.5-flash': {
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    maxTokens: 1000000
  },
  'gemini-2.0-flash-exp': {
    provider: 'gemini',
    model: 'gemini-2.0-flash-exp',
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    maxTokens: 1000000
  },

  // DeepSeek Models
  'deepseek-chat': {
    provider: 'deepseek',
    model: 'deepseek-chat',
    inputCostPer1M: 0.14,
    outputCostPer1M: 0.28,
    maxTokens: 64000
  },
  'deepseek-coder': {
    provider: 'deepseek',
    model: 'deepseek-coder',
    inputCostPer1M: 0.14,
    outputCostPer1M: 0.28,
    maxTokens: 64000
  }
};

class AIProviderService {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private gemini: GoogleGenAI | null = null;
  private deepseek: OpenAI | null = null;

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize OpenAI
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    // Initialize Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }

    // Initialize Gemini
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
      });
    }

    // Initialize DeepSeek (using OpenAI-compatible API)
    if (process.env.DEEPSEEK_API_KEY) {
      this.deepseek = new OpenAI({
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: 'https://api.deepseek.com',
      });
    }
  }

  private calculateCost(inputTokens: number, outputTokens: number, modelConfig: ModelConfig): number {
    const inputCost = (inputTokens / 1000000) * modelConfig.inputCostPer1M;
    const outputCost = (outputTokens / 1000000) * modelConfig.outputCostPer1M;
    return inputCost + outputCost;
  }

  private countTokens(text: string): number {
    // Simple token estimation (4 characters ≈ 1 token)
    return Math.ceil(text.length / 4);
  }

  async generateCompletion(request: AIRequest): Promise<AIResponse> {
    const modelConfig = MODEL_CONFIGS[request.model];
    if (!modelConfig) {
      throw new Error(`Unsupported model: ${request.model}`);
    }

    if (modelConfig.provider !== request.provider) {
      throw new Error(`Model ${request.model} does not belong to provider ${request.provider}`);
    }

    const startTime = Date.now();

    try {
      switch (request.provider) {
        case 'openai':
          return await this.generateOpenAI(request, modelConfig);
        case 'anthropic':
          return await this.generateAnthropic(request, modelConfig);
        case 'gemini':
          return await this.generateGemini(request, modelConfig);
        case 'deepseek':
          return await this.generateDeepSeek(request, modelConfig);
        default:
          throw new Error(`Unsupported provider: ${request.provider}`);
      }
    } catch (error) {
      console.error(`AI Provider Error (${request.provider}):`, error);
      throw new Error(`AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateOpenAI(request: AIRequest, modelConfig: ModelConfig): Promise<AIResponse> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized. Please check OPENAI_API_KEY.');
    }

    // Handle reasoning models (o1 and o4 series) with different parameter names
    const isReasoningModel = request.model.startsWith('o1') || request.model.startsWith('o4');
    const isImageModel = request.model.includes('image');

    if (isImageModel) {
      // gpt-image-1 can use both Image API and Chat Completions API
      // Using Image API for image generation as documented
      const prompt = request.messages.map(m => m.content).join('\n');
      
      const response = await this.openai.images.generate({
        model: request.model,
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'high', // high quality ($0.167 per image)
        response_format: 'b64_json'
      });

      if (!response.data || response.data.length === 0) {
        throw new Error('No image generated');
      }
      
      const imageData = response.data[0]?.b64_json || '';
      const content = `Image generated successfully (JPEG format, high quality). Base64 data: ${imageData.substring(0, 50)}...`;
      
      // For gpt-image-1 pricing: text tokens for input, image generation cost for output
      const inputTokens = this.countTokens(prompt);
      const outputTokens = 1; // 1 image generated
      
      // Custom cost calculation for image generation
      // Text input: $5.00 per 1M tokens
      // Image output: high quality 1024x1024 = $0.167 per image
      const inputCost = (inputTokens / 1000000) * 5.00;
      const outputCost = 0.167; // High quality image cost
      const totalCost = inputCost + outputCost;

      return {
        content,
        usage: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
        },
        cost: totalCost,
      };
    }

    const requestParams: any = {
      model: request.model,
      messages: request.messages,
    };

    // Reasoning models don't support temperature adjustment
    if (!isReasoningModel && request.temperature !== undefined) {
      requestParams.temperature = request.temperature;
    } else if (!isReasoningModel) {
      requestParams.temperature = 0.7;
    }

    // Use correct token parameter based on model type
    if (isReasoningModel) {
      requestParams.max_completion_tokens = request.maxTokens || 2000;
    } else {
      requestParams.max_tokens = request.maxTokens || 2000;
    }

    const response = await this.openai.chat.completions.create(requestParams);

    const content = response.choices[0]?.message?.content || '';
    const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    return {
      content,
      usage: {
        inputTokens: usage.prompt_tokens,
        outputTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
      },
      cost: this.calculateCost(usage.prompt_tokens, usage.completion_tokens, modelConfig),
    };
  }

  private async generateAnthropic(request: AIRequest, modelConfig: ModelConfig): Promise<AIResponse> {
    if (!this.anthropic) {
      throw new Error('Anthropic client not initialized. Please check ANTHROPIC_API_KEY.');
    }

    // Convert messages to Anthropic format
    const systemMessage = request.messages.find(m => m.role === 'system');
    const userMessages = request.messages.filter(m => m.role !== 'system');

    const response = await this.anthropic.messages.create({
      model: request.model,
      max_tokens: request.maxTokens || 2000,
      temperature: request.temperature || 0.7,
      system: systemMessage?.content,
      messages: userMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
    });

    const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;

    return {
      content,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
      },
      cost: this.calculateCost(inputTokens, outputTokens, modelConfig),
    };
  }

  private async generateGemini(request: AIRequest, modelConfig: ModelConfig): Promise<AIResponse> {
    if (!this.gemini) {
      throw new Error('Gemini client not initialized. Please check GEMINI_API_KEY.');
    }

    // Convert messages to Gemini format
    const systemMessage = request.messages.find(m => m.role === 'system');
    const userMessages = request.messages.filter(m => m.role !== 'system');
    
    const contents = userMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const config: any = {
      temperature: request.temperature || 0.7,
      maxOutputTokens: request.maxTokens || 2000,
    };

    if (systemMessage) {
      config.systemInstruction = systemMessage.content;
    }

    const response = await this.gemini.models.generateContent({
      model: request.model,
      contents,
      config,
    });

    const content = response.text || '';
    const inputTokens = this.countTokens(request.messages.map(m => m.content).join(''));
    const outputTokens = this.countTokens(content);

    return {
      content,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
      },
      cost: this.calculateCost(inputTokens, outputTokens, modelConfig),
    };
  }

  getAvailableModels(provider?: AIProvider): ModelConfig[] {
    const models = Object.values(MODEL_CONFIGS);
    return provider ? models.filter(m => m.provider === provider) : models;
  }

  private async generateDeepSeek(request: AIRequest, modelConfig: ModelConfig): Promise<AIResponse> {
    if (!this.deepseek) {
      throw new Error('DeepSeek client not initialized. Please check DEEPSEEK_API_KEY.');
    }

    const response = await this.deepseek.chat.completions.create({
      model: request.model,
      messages: request.messages,
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 2000,
    });

    const content = response.choices[0]?.message?.content || '';
    const usage = response.usage;

    return {
      content,
      usage: {
        inputTokens: usage?.prompt_tokens || 0,
        outputTokens: usage?.completion_tokens || 0,
        totalTokens: usage?.total_tokens || 0,
      },
      cost: this.calculateCost(
        usage?.prompt_tokens || 0,
        usage?.completion_tokens || 0,
        modelConfig
      ),
    };
  }



  getProviderStatus(): Record<AIProvider, boolean> {
    return {
      openai: !!this.openai,
      anthropic: !!this.anthropic,
      gemini: !!this.gemini,
      deepseek: !!this.deepseek,
    };
  }
}

export const aiProviderService = new AIProviderService();