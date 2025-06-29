import OpenAI from 'openai';
import { BaseProvider } from './BaseProvider';
import { AIRequest, AIResponse, ModelConfig } from '../types/ai.types';

export class DeepSeekProvider extends BaseProvider {
  protected providerName = 'deepseek';
  private client: OpenAI;

  constructor() {
    super();
    this.client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com'
    });
  }

  isConfigured(): boolean {
    return !!process.env.DEEPSEEK_API_KEY;
  }

  getAvailableModels(): ModelConfig[] {
    return [
      { provider: 'deepseek', model: 'deepseek-chat', inputCostPer1M: 0.27, outputCostPer1M: 1.10, maxTokens: 64000 },
      { provider: 'deepseek', model: 'deepseek-coder', inputCostPer1M: 0.27, outputCostPer1M: 1.10, maxTokens: 64000 }
    ];
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    this.validateRequest(request);
    const modelConfig = this.getModelConfig(request.model);

    const response = await this.client.chat.completions.create({
      model: request.model,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens || modelConfig.maxTokens
    });

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
      throw new Error(`Model ${model} not found for DeepSeek provider`);
    }
    return config;
  }
}