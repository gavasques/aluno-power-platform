import { GoogleGenAI } from '@google/genai';
import { BaseProvider } from './BaseProvider';
import { AIRequest, AIResponse, ModelConfig } from '../types/ai.types';

export class GeminiProvider extends BaseProvider {
  protected providerName = 'gemini';
  private client: GoogleGenAI;

  constructor() {
    super();
    this.client = new GoogleGenAI(process.env.GEMINI_API_KEY || '');
  }

  isConfigured(): boolean {
    return !!process.env.GEMINI_API_KEY;
  }

  getAvailableModels(): ModelConfig[] {
    return [
      { provider: 'gemini', model: 'gemini-2.5-pro', inputCostPer1M: 2.50, outputCostPer1M: 10.00, maxTokens: 2000000 },
      { provider: 'gemini', model: 'gemini-2.5-flash', inputCostPer1M: 0.075, outputCostPer1M: 0.30, maxTokens: 1000000 },
      { provider: 'gemini', model: 'gemini-2.5-flash-lite-preview', inputCostPer1M: 0.075, outputCostPer1M: 0.30, maxTokens: 1000000 },
      { provider: 'gemini', model: 'gemini-1.5-pro', inputCostPer1M: 1.25, outputCostPer1M: 5.00, maxTokens: 2000000 },
      { provider: 'gemini', model: 'gemini-1.5-flash', inputCostPer1M: 0.075, outputCostPer1M: 0.30, maxTokens: 1000000 },
      { provider: 'gemini', model: 'gemini-2.0-flash-exp', inputCostPer1M: 0.075, outputCostPer1M: 0.30, maxTokens: 1000000 }
    ];
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    this.validateRequest(request);
    const modelConfig = this.getModelConfig(request.model);

    const model = this.client.getGenerativeModel({ model: request.model });
    
    const prompt = request.messages.map(msg => 
      msg.role === 'system' ? `System: ${msg.content}` : msg.content
    ).join('\n\n');

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: request.temperature ?? 0.7,
        maxOutputTokens: request.maxTokens || 4000
      }
    });

    const response = result.response;
    const content = response.text() || '';
    const usage = response.usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 };
    const cost = this.calculateCost(usage.promptTokenCount, usage.candidatesTokenCount, modelConfig);

    return {
      content,
      usage: {
        inputTokens: usage.promptTokenCount,
        outputTokens: usage.candidatesTokenCount,
        totalTokens: usage.totalTokenCount
      },
      cost
    };
  }

  private getModelConfig(model: string): ModelConfig {
    const config = this.getAvailableModels().find(m => m.model === model);
    if (!config) {
      throw new Error(`Model ${model} not found for Gemini provider`);
    }
    return config;
  }
}