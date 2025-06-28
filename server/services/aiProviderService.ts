import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import { db } from '../db';
import { generatedImages, type InsertGeneratedImage } from '../../shared/schema';
import { storage } from '../storage';

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

  // OpenAI o4-mini Reasoning Model
  'o4-mini': {
    provider: 'openai',
    model: 'o4-mini',
    inputCostPer1M: 5.00,
    outputCostPer1M: 20.00,
    maxTokens: 200000
  },

  // OpenAI Image Generation - Create New Images (using gpt-image-1 with image_generation tool)
  'gpt-image-1': {
    provider: 'openai',
    model: 'gpt-image-1',
    inputCostPer1M: 5.00,   // Text tokens input: $5.00 per 1M
    outputCostPer1M: 40.00, // Image generation cost
    maxTokens: 4096
  },

  // DALL-E 3 - Fallback image generation model
  'dall-e-3': {
    provider: 'openai',
    model: 'dall-e-3',
    inputCostPer1M: 0,      // No input token cost for image generation
    outputCostPer1M: 40.00, // $0.040 per image (1024x1024 standard)
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
      const prompt = request.messages.map(m => m.content).join('\n');
      
      // Use the new gpt-image-1 API for image generation as provided by user
      if (request.model === 'gpt-image-1') {
        console.log('🎨 Using gpt-image-1 for image generation (new OpenAI model)');
        
        try {
          const response = await this.openai.responses.create({
            model: "gpt-image-1",
            input: prompt,
            tools: [{type: "image_generation"}]
          });

          // Extract image data from response
          const imageData = response.output
            .filter((output: any) => output.type === "image_generation_call")
            .map((output: any) => output.result);

          if (imageData.length === 0) {
            throw new Error('No image generated');
          }

          const imageBase64 = imageData[0];
          const imageUrl = `data:image/png;base64,${imageBase64}`;
          const content = `✅ Imagem gerada com sucesso usando gpt-image-1! Formato: PNG. Dados base64 disponíveis.`;

          // Calculate costs
          const inputTokens = this.countTokens(prompt);
          const outputTokens = 1; // 1 image generated
          const inputCost = (inputTokens / 1000000) * 5.00;
          const outputCost = 0.04; // Standard image cost
          const totalCost = inputCost + outputCost;

          // Save image to database
          try {
            const imageRecord: InsertGeneratedImage = {
              model: request.model,
              prompt: prompt,
              imageUrl: imageUrl,
              size: '1024x1024',
              quality: 'standard',
              format: 'png',
              cost: totalCost.toString(),
              metadata: {
                inputTokens,
                outputTokens,
                provider: 'openai',
                model: 'gpt-image-1',
                actualModel: 'gpt-image-1'
              }
            };

            await storage.createGeneratedImage(imageRecord);
            console.log('✅ Imagem salva no banco de dados:', imageRecord);
          } catch (dbError) {
            console.error('❌ Erro ao salvar imagem no banco:', dbError);
          }

          return {
            content,
            usage: {
              inputTokens,
              outputTokens,
              totalTokens: inputTokens + outputTokens,
            },
            cost: totalCost,
          };

        } catch (error: any) {
          console.log('❌ gpt-image-1 falhou, tentando DALL-E 3...');
          
          try {
            const dalleResponse = await this.openai.images.generate({
              model: 'dall-e-3',
              prompt: prompt,
              n: 1,
              size: '1024x1024',
              quality: 'standard'
            });

            if (!dalleResponse.data || dalleResponse.data.length === 0) {
              throw new Error('No image generated');
            }
            
            const imageData = dalleResponse.data[0];
            const imageUrl = imageData.url || '';
            const content = `⚠️ Fallback para DALL-E 3: Imagem gerada com sucesso! URL: ${imageUrl}`;

            const inputTokens = this.countTokens(prompt);
            const outputTokens = 1;
            const inputCost = (inputTokens / 1000000) * 5.00;
            const outputCost = 0.04;
            const totalCost = inputCost + outputCost;

            // Save DALL-E image to database
            try {
              const imageRecord: InsertGeneratedImage = {
                model: request.model,
                prompt: prompt,
                imageUrl: imageUrl,
                size: '1024x1024',
                quality: 'standard',
                format: 'png',
                cost: totalCost.toString(),
                metadata: {
                  inputTokens,
                  outputTokens,
                  provider: 'openai',
                  model: request.model,
                  actualModel: 'dall-e-3',
                  fallback: true
                }
              };

              await storage.createGeneratedImage(imageRecord);
              console.log('✅ Imagem DALL-E 3 salva no banco:', imageRecord);
            } catch (dbError) {
              console.error('❌ Erro ao salvar imagem DALL-E no banco:', dbError);
            }

            return {
              content,
              usage: {
                inputTokens,
                outputTokens,
                totalTokens: inputTokens + outputTokens,
              },
              cost: totalCost,
            };

          } catch (dalleError: any) {
            console.log('❌ DALL-E 3 também falhou, ativando modo demo...');
            
            // Demo mode as last resort
            const demoImageUrl = `https://picsum.photos/1024/1024?random=${Date.now()}`;
            const content = `🔧 MODO DEMO: Simulação de imagem para "${prompt}". URL demo: ${demoImageUrl}`;
            
            const inputTokens = this.countTokens(prompt);
            const outputTokens = 1;
            const inputCost = (inputTokens / 1000000) * 5.00;
            const outputCost = 0.04;
            const totalCost = inputCost + outputCost;

            try {
              const imageRecord: InsertGeneratedImage = {
                model: request.model,
                prompt: prompt,
                imageUrl: demoImageUrl,
                size: '1024x1024',
                quality: 'standard',
                format: 'png',
                cost: totalCost.toString(),
                metadata: {
                  inputTokens,
                  outputTokens,
                  provider: 'openai',
                  model: request.model,
                  actualModel: 'demo',
                  isDemo: true
                }
              };

              await storage.createGeneratedImage(imageRecord);
              console.log('✅ Imagem demo salva no banco:', imageRecord);
            } catch (dbError) {
              console.error('❌ Erro ao salvar imagem demo:', dbError);
            }

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
        }
      }
      
      // If we reach here, no fallback worked - return error
      throw new Error('GPT Image 1 não está disponível. Verifique se sua organização OpenAI tem acesso aprovado ao modelo gpt-image-1.');
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