import OpenAI from 'openai';
import { BaseProvider } from './BaseProvider';
import { AIRequest, AIResponse, ModelConfig } from '../types/ai.types';
import { ImageProcessor } from '../utils/imageProcessor';
import { db } from '../../db';
import { generatedImages } from '../../../shared/schema';

export class OpenAIProvider extends BaseProvider {
  protected providerName = 'openai';
  private client: OpenAI;

  constructor() {
    super();
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  isConfigured(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  getAvailableModels(): ModelConfig[] {
    return [
      { provider: 'openai', model: 'gpt-4.1', inputCostPer1M: 2.50, outputCostPer1M: 10.00, maxTokens: 128000 },
      { provider: 'openai', model: 'gpt-4o', inputCostPer1M: 2.50, outputCostPer1M: 10.00, maxTokens: 128000 },
      { provider: 'openai', model: 'gpt-4o-mini', inputCostPer1M: 0.15, outputCostPer1M: 0.60, maxTokens: 128000 },
      { provider: 'openai', model: 'o1-preview', inputCostPer1M: 15.00, outputCostPer1M: 60.00, maxTokens: 128000 },
      { provider: 'openai', model: 'o1-mini', inputCostPer1M: 3.00, outputCostPer1M: 12.00, maxTokens: 128000 },
      { provider: 'openai', model: 'o4-mini', inputCostPer1M: 1.00, outputCostPer1M: 4.00, maxTokens: 128000 },
      { provider: 'openai', model: 'gpt-image-1', inputCostPer1M: 5.00, outputCostPer1M: 0.167025, maxTokens: 32000 }
    ];
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    this.validateRequest(request);
    const modelConfig = this.getModelConfig(request.model);
    const prompt = request.messages[request.messages.length - 1]?.content || '';

    if (request.model === 'gpt-image-1') {
      return this.handleImageGeneration(request, modelConfig, prompt);
    }

    return this.handleTextGeneration(request, modelConfig);
  }

  private async handleImageGeneration(request: AIRequest, modelConfig: ModelConfig, prompt: string): Promise<AIResponse> {
    if (!request.referenceImages?.length) {
      throw new Error('gpt-image-1 requires reference images');
    }

    console.log(`Processing ${request.referenceImages.length} reference images with gpt-image-1`);
    
    const { files, cleanup } = await ImageProcessor.processMultipleImages(request.referenceImages);
    
    try {
      const response = await this.client.images.edit({
        model: 'gpt-image-1',
        image: files,
        prompt: prompt,
        n: 1,
        size: 'auto',
        quality: 'high'
      });

      const imageUrl = ImageProcessor.validateImageResponse(response);
      const content = `Image generated using ${request.referenceImages.length} reference images with GPT-Image-1!\n\nPrompt: ${prompt}\n\nURL: ${imageUrl}`;
      
      const inputTokens = this.countTokens(prompt);
      const outputTokens = 1;
      const cost = this.calculateCost(inputTokens, outputTokens, modelConfig);
      
      await this.storeGeneratedImage(imageUrl, prompt, 'gpt-image-1');
      
      return {
        content,
        usage: { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens },
        cost
      };
    } finally {
      cleanup();
    }
  }

  private async handleTextGeneration(request: AIRequest, modelConfig: ModelConfig): Promise<AIResponse> {
    const isReasoningModel = ['o1-preview', 'o1-mini', 'o4-mini'].includes(request.model);
    
    const params: any = {
      model: request.model,
      messages: request.messages,
      max_tokens: request.maxTokens || modelConfig.maxTokens
    };

    if (!isReasoningModel) {
      params.temperature = request.temperature ?? 0.7;
    }

    const response = await this.client.chat.completions.create(params);
    
    const content = response.choices[0]?.message?.content || '';
    const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    const cost = this.calculateCost(usage.prompt_tokens, usage.completion_tokens, modelConfig);

    return {
      content,
      usage: {
        inputTokens: usage.prompt_tokens,
        outputTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens
      },
      cost
    };
  }

  private getModelConfig(model: string): ModelConfig {
    const config = this.getAvailableModels().find(m => m.model === model);
    if (!config) {
      throw new Error(`Model ${model} not found for OpenAI provider`);
    }
    return config;
  }

  private async storeGeneratedImage(imageUrl: string, prompt: string, model: string): Promise<void> {
    if (imageUrl.length < 100) return;
    
    try {
      await db.insert(generatedImages).values({
        model,
        prompt,
        imageUrl,
        size: '1024x1024',
        quality: 'high',
        format: 'png',
        cost: '0.167',
        metadata: {
          provider: 'openai',
          model: 'gpt-image-1',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.log('Warning: Could not store generated image:', error);
    }
  }
}