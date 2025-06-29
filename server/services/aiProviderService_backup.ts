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
  imageData?: string;
  referenceImages?: Array<{
    data: string;
    filename: string;
  }>;
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
    inputCostPer1M: 2.50,
    outputCostPer1M: 10.00,
    maxTokens: 128000,
  },
  'gpt-4o': {
    provider: 'openai',
    model: 'gpt-4o',
    inputCostPer1M: 2.50,
    outputCostPer1M: 10.00,
    maxTokens: 128000,
  },
  'gpt-4o-mini': {
    provider: 'openai',
    model: 'gpt-4o-mini',
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.60,
    maxTokens: 128000,
  },
  // OpenAI Reasoning Models
  'o1-preview': {
    provider: 'openai',
    model: 'o1-preview',
    inputCostPer1M: 15.00,
    outputCostPer1M: 60.00,
    maxTokens: 32768,
  },
  'o1-mini': {
    provider: 'openai',
    model: 'o1-mini',
    inputCostPer1M: 3.00,
    outputCostPer1M: 12.00,
    maxTokens: 65536,
  },
  // OpenAI Image Model
  'gpt-image-1': {
    provider: 'openai',
    model: 'gpt-image-1',
    inputCostPer1M: 5.00,
    outputCostPer1M: 0.167,
    maxTokens: 4000,
  },
  // Anthropic Models
  'claude-3-5-sonnet': {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    maxTokens: 8192,
  },
  'claude-3-opus': {
    provider: 'anthropic',
    model: 'claude-3-opus-20240229',
    inputCostPer1M: 15.00,
    outputCostPer1M: 75.00,
    maxTokens: 4096,
  },
  'claude-3-haiku': {
    provider: 'anthropic',
    model: 'claude-3-haiku-20240307',
    inputCostPer1M: 0.25,
    outputCostPer1M: 1.25,
    maxTokens: 4096,
  },
  // Google Gemini Models
  'gemini-1.5-pro': {
    provider: 'gemini',
    model: 'gemini-1.5-pro',
    inputCostPer1M: 3.50,
    outputCostPer1M: 10.50,
    maxTokens: 8192,
  },
  'gemini-1.5-flash': {
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    maxTokens: 8192,
  },
  // DeepSeek Models
  'deepseek-chat': {
    provider: 'deepseek',
    model: 'deepseek-chat',
    inputCostPer1M: 0.14,
    outputCostPer1M: 0.28,
    maxTokens: 4096,
  },
  'deepseek-coder': {
    provider: 'deepseek',
    model: 'deepseek-coder',
    inputCostPer1M: 0.14,
    outputCostPer1M: 0.28,
    maxTokens: 4096,
  },
};

export class AIProviderService {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private googleAI: GoogleGenAI | null = null;

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }

    if (process.env.GOOGLE_AI_API_KEY) {
      this.googleAI = new GoogleGenAI(process.env.GOOGLE_AI_API_KEY);
    }
  }

  private countTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private async storeGeneratedImage(imageUrl: string, prompt: string, model: string): Promise<void> {
    try {
      const imageRecord: InsertGeneratedImage = {
        model: model,
        prompt: prompt,
        imageUrl: imageUrl,
        size: '1024x1024',
        quality: 'standard',
        format: 'png',
        cost: '0.167',
        metadata: {
          provider: 'openai',
          model: model,
          timestamp: new Date().toISOString()
        }
      };

      await db.insert(generatedImages).values(imageRecord);
      console.log('✅ Imagem salva no banco:', imageRecord);
    } catch (error) {
      console.error('❌ Erro ao salvar imagem no banco:', error);
      throw error;
    }
  }

  async generateCompletion(request: AIRequest & { imageData?: string }): Promise<AIResponse> {
    const modelConfig = MODEL_CONFIGS[request.model];
    if (!modelConfig) {
      throw new Error(`Model ${request.model} not found in configuration`);
    }

    switch (modelConfig.provider) {
      case 'openai':
        return this.generateOpenAI(request, modelConfig);
      case 'anthropic':
        return this.generateAnthropic(request, modelConfig);
      case 'gemini':
        return this.generateGemini(request, modelConfig);
      case 'deepseek':
        return this.generateDeepSeek(request, modelConfig);
      default:
        throw new Error(`Provider ${modelConfig.provider} not supported`);
    }
  }

  private async generateOpenAI(request: AIRequest & { imageData?: string }, modelConfig: ModelConfig): Promise<AIResponse> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized - missing API key');
    }

    const isReasoningModel = request.model.startsWith('o1') || request.model.startsWith('o4');
    const isImageModel = request.model.includes('image');

    if (isImageModel) {
      const prompt = request.messages.map(m => m.content).join('\n');
      
      if (request.model === 'gpt-image-1') {
        console.log('🖼️ Usando GPT-Image-1 para geração de imagens');
        
        try {
          if (request.imageData) {
            // Image editing mode
            console.log('🔄 Modo edição: Editando imagem existente...');
            
            const analysisResponse = await this.openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: `Analise esta imagem e crie um prompt detalhado para editá-la conforme solicitado: "${prompt}"`
                    },
                    {
                      type: "image_url",
                      image_url: {
                        url: `data:image/jpeg;base64,${request.imageData}`,
                        detail: "high"
                      }
                    }
                  ]
                }
              ],
              max_tokens: 1000
            });

            const analysisPrompt = analysisResponse.choices[0]?.message?.content || prompt;
            console.log(`🎨 Prompt de edição: ${analysisPrompt.substring(0, 200)}...`);

            const response = await this.openai.images.edit({
              image: Buffer.from(request.imageData, 'base64'),
              prompt: analysisPrompt.substring(0, 1000),
              n: 1,
              size: "1024x1024",
              response_format: "url"
            });

            const imageUrl = response.data[0]?.url || '';
            const content = `Imagem editada com sucesso!\n\nPrompt de edição: ${analysisPrompt}\n\nURL da imagem: ${imageUrl}`;

            const inputTokens = this.countTokens(prompt + analysisPrompt);
            const outputTokens = 1;
            const inputCost = (inputTokens / 1000000) * modelConfig.inputCostPer1M;
            const outputCost = modelConfig.outputCostPer1M;
            const totalCost = inputCost + outputCost;

            await this.storeGeneratedImage(imageUrl, prompt, 'gpt-image-1');

            return {
              content,
              usage: {
                inputTokens,
                outputTokens,
                totalTokens: inputTokens + outputTokens,
              },
              cost: totalCost,
            };
            
          } else {
            // Image generation mode
            console.log('🔄 Modo geração: Criando nova imagem...');
            
            if (request.referenceImages && request.referenceImages.length > 0) {
              console.log(`📸 Processando ${request.referenceImages.length} imagens de referência`);
              
              const referenceAnalysis = await this.openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                  {
                    role: "user",
                    content: [
                      {
                        type: "text",
                        text: `Analise essas imagens de referência e crie um prompt detalhado para gerar uma nova imagem seguindo esta instrução: "${prompt}". Use os elementos visuais das imagens como inspiração.`
                      },
                      ...request.referenceImages.map(img => ({
                        type: "image_url" as const,
                        image_url: {
                          url: `data:image/jpeg;base64,${img.data}`,
                          detail: "high" as const
                        }
                      }))
                    ]
                  }
                ],
                max_tokens: 1000
              });
              
              const enhancedPrompt = referenceAnalysis.choices[0]?.message?.content || prompt;
              console.log(`🎨 Prompt aprimorado: ${enhancedPrompt.substring(0, 200)}...`);
              
              const response = await this.openai.images.generate({
                model: "dall-e-3",
                prompt: enhancedPrompt.substring(0, 4000),
                n: 1,
                size: "1024x1024",
                quality: "standard",
                response_format: "url"
              });

              const imageUrl = response.data?.[0]?.url || '';
              const content = `Imagem gerada com sucesso usando ${request.referenceImages.length} imagens de referência!\n\nPrompt original: ${prompt}\n\nPrompt aprimorado: ${enhancedPrompt.substring(0, 200)}...\n\nURL da imagem: ${imageUrl}`;
              
              const inputTokens = this.countTokens(prompt + enhancedPrompt);
              const outputTokens = 1;
              const inputCost = (inputTokens / 1000000) * modelConfig.inputCostPer1M;
              const outputCost = modelConfig.outputCostPer1M;
              const totalCost = inputCost + outputCost;
              
              await this.storeGeneratedImage(imageUrl, prompt, 'gpt-image-1');
              
              return {
                content,
                usage: {
                  inputTokens,
                  outputTokens,
                  totalTokens: inputTokens + outputTokens,
                },
                cost: totalCost,
              };
              
            } else {
              const response = await this.openai.images.generate({
                model: "dall-e-3",
                prompt: prompt.substring(0, 4000),
                n: 1,
                size: "1024x1024",
                quality: "standard",
                response_format: "url"
              });

              const imageUrl = response.data?.[0]?.url || '';
              const content = `Imagem gerada com sucesso!\n\nPrompt: ${prompt}\n\nURL da imagem: ${imageUrl}`;

              const inputTokens = this.countTokens(prompt);
              const outputTokens = 1;
              const inputCost = (inputTokens / 1000000) * modelConfig.inputCostPer1M;
              const outputCost = modelConfig.outputCostPer1M;
              const totalCost = inputCost + outputCost;

              await this.storeGeneratedImage(imageUrl, prompt, 'gpt-image-1');

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
          
        } catch (gptImageError: any) {
          console.error('❌ Erro com geração de imagem:', gptImageError);
          
          if (gptImageError.message?.includes('model not found') || gptImageError.message?.includes('does not exist')) {
            throw new Error('Modelo de geração de imagens não está disponível na sua organização OpenAI. Verifique seu acesso ao DALL-E-3.');
          }
          
          throw new Error(`Erro na geração de imagem: ${gptImageError.message}`);
        }
      }
    }

    // Regular OpenAI models (text completion)
    const messages = request.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    if (isReasoningModel) {
      const response = await this.openai.chat.completions.create({
        model: request.model,
        messages: messages,
        max_completion_tokens: request.maxTokens || modelConfig.maxTokens
      });

      const content = response.choices[0]?.message?.content || '';
      const inputTokens = response.usage?.prompt_tokens || 0;
      const outputTokens = response.usage?.completion_tokens || 0;
      const totalCost = this.calculateCost(inputTokens, outputTokens, modelConfig);

      return {
        content,
        usage: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
        },
        cost: totalCost,
      };
    } else {
      const response = await this.openai.chat.completions.create({
        model: request.model,
        messages: messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || modelConfig.maxTokens
      });

      const content = response.choices[0]?.message?.content || '';
      const inputTokens = response.usage?.prompt_tokens || 0;
      const outputTokens = response.usage?.completion_tokens || 0;
      const totalCost = this.calculateCost(inputTokens, outputTokens, modelConfig);

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

  private async generateAnthropic(request: AIRequest, modelConfig: ModelConfig): Promise<AIResponse> {
    if (!this.anthropic) {
      throw new Error('Anthropic client not initialized - missing API key');
    }

    const systemMessage = request.messages.find(m => m.role === 'system')?.content || '';
    const userMessages = request.messages.filter(m => m.role !== 'system');

    const response = await this.anthropic.messages.create({
      model: request.model,
      max_tokens: request.maxTokens || modelConfig.maxTokens,
      temperature: request.temperature || 0.7,
      system: systemMessage,
      messages: userMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    });

    const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const totalCost = this.calculateCost(inputTokens, outputTokens, modelConfig);

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

  private async generateGemini(request: AIRequest, modelConfig: ModelConfig): Promise<AIResponse> {
    if (!this.googleAI) {
      throw new Error('Google AI client not initialized - missing API key');
    }

    const systemMessage = request.messages.find(m => m.role === 'system')?.content || '';
    const userMessages = request.messages.filter(m => m.role !== 'system');

    const messages = userMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const model = (this.googleAI as any).getGenerativeModel({ 
      model: request.model,
      systemInstruction: systemMessage
    });

    const result = await model.generateContent({
      contents: messages,
      generationConfig: {
        temperature: request.temperature || 0.7,
        maxOutputTokens: request.maxTokens || modelConfig.maxTokens
      }
    });

    const content = result.response.text();
    const inputTokens = result.response.usageMetadata?.promptTokenCount || this.countTokens(request.messages.map(m => m.content).join('\n'));
    const outputTokens = result.response.usageMetadata?.candidatesTokenCount || this.countTokens(content);
    const totalCost = this.calculateCost(inputTokens, outputTokens, modelConfig);

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

  private async generateDeepSeek(request: AIRequest, modelConfig: ModelConfig): Promise<AIResponse> {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || modelConfig.maxTokens
      })
    });

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0 };
    
    const inputTokens = usage.prompt_tokens;
    const outputTokens = usage.completion_tokens;
    const totalCost = this.calculateCost(inputTokens, outputTokens, modelConfig);

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

  private calculateCost(inputTokens: number, outputTokens: number, modelConfig: ModelConfig): number {
    const inputCost = (inputTokens / 1000000) * modelConfig.inputCostPer1M;
    const outputCost = (outputTokens / 1000000) * modelConfig.outputCostPer1M;
    return inputCost + outputCost;
  }

  getAvailableModels(provider?: AIProvider): ModelConfig[] {
    if (provider) {
      return Object.values(MODEL_CONFIGS).filter(config => config.provider === provider);
    }
    return Object.values(MODEL_CONFIGS);
  }

  getProviderStatus(): Record<AIProvider, boolean> {
    return {
      openai: !!this.openai,
      anthropic: !!this.anthropic,
      gemini: !!this.googleAI,
      deepseek: !!process.env.DEEPSEEK_API_KEY
    };
  }
}

export const aiProviderService = new AIProviderService();