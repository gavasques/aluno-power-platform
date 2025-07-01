import Anthropic from '@anthropic-ai/sdk';
import { BaseProvider } from './BaseProvider';
import { AIRequest, AIResponse, ModelConfig } from '../types/ai.types';

export class AnthropicProvider extends BaseProvider {
  protected providerName = 'anthropic';
  private client: Anthropic;

  constructor() {
    super();
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }

  isConfigured(): boolean {
    return !!process.env.ANTHROPIC_API_KEY;
  }

  getAvailableModels(): ModelConfig[] {
    return [
      // Claude 4 Models (conforme documentação oficial)
      { provider: 'anthropic', model: 'claude-opus-4-20250514', inputCostPer1M: 15.00, outputCostPer1M: 75.00, maxTokens: 200000 },
      { provider: 'anthropic', model: 'claude-sonnet-4-20250514', inputCostPer1M: 3.00, outputCostPer1M: 15.00, maxTokens: 200000 },
      
      // Claude 3.7 e 3.5 Models
      { provider: 'anthropic', model: 'claude-3-7-sonnet-20250219', inputCostPer1M: 3.00, outputCostPer1M: 15.00, maxTokens: 200000 },
      { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', inputCostPer1M: 3.00, outputCostPer1M: 15.00, maxTokens: 200000 },
      { provider: 'anthropic', model: 'claude-3-opus-20240229', inputCostPer1M: 15.00, outputCostPer1M: 75.00, maxTokens: 200000 },
      { provider: 'anthropic', model: 'claude-3-haiku-20240307', inputCostPer1M: 0.25, outputCostPer1M: 1.25, maxTokens: 200000 }
    ];
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    this.validateRequest(request);
    const modelConfig = this.getModelConfig(request.model);

    // Anthropic only accepts temperature 0-1, clamp it
    let temperature = request.temperature ?? 0.7;
    if (temperature > 1.0) {
      console.log(`⚠️ [ANTHROPIC] Limiting temperature for ${request.model} from ${temperature} to 1.0`);
      temperature = 1.0;
    }

    // Limit max_tokens to avoid timeout issues - Anthropic recommends streaming for large responses
    let maxTokens = request.maxTokens || 4000;
    if (maxTokens > 8000) {
      console.log(`⚠️ [ANTHROPIC] Limiting maxTokens for ${request.model} from ${maxTokens} to 8000 to avoid timeout`);
      maxTokens = 8000;
    }

    try {
      const response = await this.client.messages.create({
        model: request.model,
        max_tokens: maxTokens,
        temperature: temperature,
        messages: request.messages.map(msg => ({
          role: msg.role === 'system' ? 'user' : msg.role,
          content: msg.role === 'system' ? `System: ${msg.content}` : msg.content
        }))
      });

      const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
      const usage = response.usage || { input_tokens: 0, output_tokens: 0 };
      const cost = this.calculateCost(usage.input_tokens, usage.output_tokens, modelConfig);

      return {
        content,
        usage: {
          inputTokens: usage.input_tokens,
          outputTokens: usage.output_tokens,
          totalTokens: usage.input_tokens + usage.output_tokens
        },
        cost
      };
    } catch (error: any) {
      // Log the actual error details for debugging
      console.error(`❌ [ANTHROPIC] API Error for model ${request.model}:`, {
        message: error.message,
        type: error.type,
        status: error.status,
        requestParams: {
          model: request.model,
          maxTokens,
          temperature,
          messageCount: request.messages.length
        }
      });
      
      // Re-throw with more context
      throw new Error(`Anthropic API Error: ${error.message}`);
    }
  }

  private getModelConfig(model: string): ModelConfig {
    const config = this.getAvailableModels().find(m => m.model === model);
    if (!config) {
      throw new Error(`Model ${model} not found for Anthropic provider`);
    }
    return config;
  }
}