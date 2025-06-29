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
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    maxTokens: 128000
  },
  
  // OpenAI Reasoning Models - No temperature allowed
  'o1-preview': {
    provider: 'openai',
    model: 'o1-preview',
    inputCostPer1M: 15.00,
    outputCostPer1M: 60.00,
    maxTokens: 32768
  },
  'o1-mini': {
    provider: 'openai',
    model: 'o1-mini',
    inputCostPer1M: 3.00,
    outputCostPer1M: 12.00,
    maxTokens: 65536
  },
  'o4-mini': {
    provider: 'openai',
    model: 'o4-mini',
    inputCostPer1M: 3.00,
    outputCostPer1M: 12.00,
    maxTokens: 65536
  },
  
  // OpenAI Image Model
  'gpt-image-1': {
    provider: 'openai',
    model: 'gpt-image-1',
    inputCostPer1M: 5.00,   // $5.00 per 1M tokens
    outputCostPer1M: 0.167, // $0.167 per image (high quality, PNG)
    maxTokens: 4000
  },
  
  // OpenAI Legacy Models
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

  // Claude 4.0 Models
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

  // Claude 3.x Models
  'claude-3-5-sonnet': {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    maxTokens: 200000
  },
  'claude-3-opus': {
    provider: 'anthropic',
    model: 'claude-3-opus-20240229',
    inputCostPer1M: 15.00,
    outputCostPer1M: 75.00,
    maxTokens: 200000
  },
  'claude-3-haiku': {
    provider: 'anthropic',
    model: 'claude-3-haiku-20240307',
    inputCostPer1M: 0.25,
    outputCostPer1M: 1.25,
    maxTokens: 200000
  },

  // Gemini 2.5 Models
  'gemini-2.5-pro': {
    provider: 'gemini',
    model: 'gemini-2.5-pro',
    inputCostPer1M: 3.50,
    outputCostPer1M: 10.50,
    maxTokens: 2000000
  },
  'gemini-2.5-flash': {
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    maxTokens: 1000000
  },
  'gemini-2.5-flash-lite-preview': {
    provider: 'gemini',
    model: 'gemini-2.5-flash-lite-preview',
    inputCostPer1M: 0.075,
    outputCostPer1M: 0.30,
    maxTokens: 1000000
  },

  // Gemini Legacy Models
  'gemini-1.5-pro': {
    provider: 'gemini',
    model: 'gemini-1.5-pro',
    inputCostPer1M: 3.50,
    outputCostPer1M: 10.50,
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

export class AIProviderService {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private googleAI: GoogleGenAI | null = null;

  constructor() {
    // Initialize providers with API keys
    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey });
    }

    if (anthropicKey) {
      this.anthropic = new Anthropic({ apiKey: anthropicKey });
    }

    if (geminiKey) {
      this.googleAI = new GoogleGenAI(geminiKey);
    }
  }

  private countTokens(text: string): number {
    // Simple token counting (approximately 4 characters = 1 token)
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

      await storage.createGeneratedImage(imageRecord);
      console.log('✅ Imagem salva no banco:', imageRecord);
    } catch (error) {
      console.error('❌ Erro ao salvar imagem:', error);
    }
  }

  async generateCompletion(request: AIRequest & { imageData?: string }): Promise<AIResponse> {
    const modelConfig = MODEL_CONFIGS[request.model];
    if (!modelConfig) {
      throw new Error(`Model ${request.model} not found in configurations`);
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

    // Handle reasoning models (o1 and o4 series) with different parameter names
    const isReasoningModel = request.model.startsWith('o1') || request.model.startsWith('o4');
    const isImageModel = request.model.includes('image');

    if (isImageModel) {
      const prompt = request.messages.map(m => m.content).join('\n');
      
      // GPT Image 1 implementation - Para geração e edição de imagens
      if (request.model === 'gpt-image-1') {
        console.log('🖼️ Usando GPT-Image-1 para geração de imagens');
        
        try {
          // Se há dados de imagem, é uma edição; senão, é geração
          const imageData = request.imageData;
          
          if (imageData) {
            console.log('🔄 Modo edição: Analisando imagem com GPT-4o-mini primeiro...');
            
            // Primeira etapa: análise da imagem com GPT-4o-mini
            const analysisResponse = await this.openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: `Analise esta imagem em detalhes e depois gere um prompt otimizado para criar uma versão editada com esta instrução: ${prompt}. Descreva a imagem atual e como ela deve ser modificada.`
                    },
                    {
                      type: "image_url",
                      image_url: {
                        url: `data:image/jpeg;base64,${imageData}`,
                        detail: "high"
                      }
                    }
                  ]
                }
              ],
              max_tokens: 500
            });

            const imageAnalysis = analysisResponse.choices[0]?.message?.content || '';
            console.log('📊 Análise da imagem:', imageAnalysis);

            // Segunda etapa: usar images.generate() para gerar a nova imagem
            console.log('🔄 Gerando nova imagem com images.generate()...');
            
            const generationPrompt = `${imageAnalysis}\n\nCrie uma nova imagem com as modificações solicitadas: ${prompt}`;
            
            const response = await this.openai.images.generate({
              model: "dall-e-3",
              prompt: generationPrompt.substring(0, 4000), // DALL-E-3 tem limite de prompt
              n: 1,
              size: "1024x1024",
              quality: "standard",
              response_format: "url"
            });

            const imageUrl = response.data[0]?.url || '';
            const content = `Imagem editada gerada com sucesso!\n\nPrompt usado: ${generationPrompt}\n\nURL da imagem: ${imageUrl}`;

            // Calculate costs for image generation
            const inputTokens = this.countTokens(generationPrompt);
            const outputTokens = 1; // 1 image generated
            const inputCost = (inputTokens / 1000000) * modelConfig.inputCostPer1M;
            const outputCost = modelConfig.outputCostPer1M; // Cost per image
            const totalCost = inputCost + outputCost;

            // Store the result
            try {
              await this.storeGeneratedImage(imageUrl, prompt, 'gpt-image-1');
            } catch (dbError) {
              console.log('⚠️ Erro ao salvar no banco (não crítico):', dbError);
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
            
          } else {
            console.log('🔄 Modo geração: Criando nova imagem...');
            
            // Check if reference images are provided
            if (request.referenceImages && request.referenceImages.length > 0) {
              console.log(`📸 Attempting new Responses API with ${request.referenceImages.length} reference images`);
              
              // Try the new Responses API first, with fallback to enhanced DALL-E-3
              try {
                // Prepare content for Responses API
                const content = [
                  { type: "input_text", text: prompt },
                  ...request.referenceImages.map(img => ({
                    type: "input_image",
                    image_url: `data:image/jpeg;base64,${img.data}`,
                    detail: "high"
                  }))
                ];
                
                const responsesResponse = await (this.openai as any).responses.create({
                  model: "gpt-4.1",
                  input: [
                    {
                      role: "user",
                      content: content
                    }
                  ],
                  tools: [{ type: "image_generation" }]
                });
                
                // Extract generated image from response
                const imageData = responsesResponse.output
                  .filter((output: any) => output.type === "image_generation_call")
                  .map((output: any) => output.result);
                
                if (imageData.length > 0) {
                  const imageBase64 = imageData[0];
                  const imageUrl = `data:image/png;base64,${imageBase64}`;
                  const content = `Imagem gerada com sucesso usando ${request.referenceImages.length} imagens de referência!\n\nPrompt: ${prompt}\n\nURL da imagem: ${imageUrl}`;
                  
                  const inputTokens = this.countTokens(prompt);
                  const outputTokens = 1;
                  const inputCost = (inputTokens / 1000000) * modelConfig.inputCostPer1M;
                  const outputCost = modelConfig.outputCostPer1M;
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
              } catch (responsesError: any) {
                console.log('⚠️ Responses API failed, falling back to enhanced DALL-E-3:', responsesError.message);
              }
              
              // Fallback: Use GPT-4o-mini to analyze reference images and enhance the prompt
              console.log('🔄 Using enhanced DALL-E-3 with reference image analysis');
              
              const referenceAnalysis = await this.openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                  {
                    role: "user",
                    content: [
                      {
                        type: "text",
                        text: `Analise essas imagens de referência e crie um prompt detalhado para gerar uma nova imagem seguindo esta instrução: "${prompt}". Use os elementos visuais das imagens como inspiração (cores, estilo, composição, objetos).`
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
              console.log(`🎨 Enhanced prompt from reference images: ${enhancedPrompt.substring(0, 200)}...`);
              
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
              
              // Store the generated image
              try {
                await this.storeGeneratedImage(imageUrl, prompt, 'gpt-image-1');
              } catch (dbError) {
                console.log('⚠️ Erro ao salvar no banco (não crítico):', dbError);
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
              
            } else {
              // No reference images - use traditional DALL-E-3
              console.log('🎨 Using DALL-E-3 for image generation (no reference images)');
              
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

              // Calculate costs for image generation
              const inputTokens = this.countTokens(prompt);
              const outputTokens = 1; // 1 image generated
              const inputCost = (inputTokens / 1000000) * modelConfig.inputCostPer1M;
              const outputCost = modelConfig.outputCostPer1M; // Cost per image
              const totalCost = inputCost + outputCost;

              // Store the generated image
              try {
                await this.storeGeneratedImage(imageUrl, prompt, 'gpt-image-1');
              } catch (dbError) {
                console.log('⚠️ Erro ao salvar no banco (não crítico):', dbError);
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
          
        } catch (gptImageError: any) {
          console.error('❌ Erro com geração de imagem:', gptImageError);
          console.error('📋 Detalhes do erro:', {
            message: gptImageError.message,
            status: gptImageError.status,
            code: gptImageError.code,
            type: gptImageError.type,
            param: gptImageError.param
          });
          
          // Se o erro é por falta de acesso, informar claramente
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
      // Reasoning models don't support temperature or max_tokens
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
      // Standard models with temperature support
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

    const model = this.googleAI.getGenerativeModel({ 
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

    const systemMessage = request.messages.find(m => m.role === 'system');
    const userMessages = request.messages.filter(m => m.role !== 'system');

    const response = await this.anthropic.messages.create({
      model: request.model,
      max_tokens: request.maxTokens || modelConfig.maxTokens,
      temperature: request.temperature ?? 1.0,
      system: systemMessage?.content,
      messages: userMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    });

    const content = response.content[0]?.type === 'text' ? response.content[0].text : 'Sem resposta';
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
    if (!this.googleAI) {
      throw new Error('Gemini client not initialized - missing API key');
    }

    const systemMessage = request.messages.find(m => m.role === 'system');
    const userMessages = request.messages.filter(m => m.role !== 'system');

    const contents = userMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const model = this.googleAI.getGenerativeModel(request.model);

    const result = await model.generateContent({
      contents
    });

    const content = result.response.text();
    const inputTokens = result.response.usageMetadata?.promptTokenCount || this.countTokens(request.messages.map(m => m.content).join('\n'));
    const outputTokens = result.response.usageMetadata?.candidatesTokenCount || this.countTokens(content);

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

  private async generateDeepSeek(request: AIRequest, modelConfig: ModelConfig): Promise<AIResponse> {
    // DeepSeek uses OpenAI-compatible API
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature ?? 1.0,
        max_tokens: request.maxTokens || modelConfig.maxTokens
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'Sem resposta';
    const usage = data.usage;

    return {
      content,
      usage: {
        inputTokens: usage?.prompt_tokens || 0,
        outputTokens: usage?.completion_tokens || 0,
        totalTokens: usage?.total_tokens || 0,
      },
      cost: this.calculateCost(usage?.prompt_tokens || 0, usage?.completion_tokens || 0, modelConfig),
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
      deepseek: !!process.env.DEEPSEEK_API_KEY,
    };
  }
}

// Export a singleton instance
export const aiProviderService = new AIProviderService();