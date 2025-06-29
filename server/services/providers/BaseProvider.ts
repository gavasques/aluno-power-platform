import { AIRequest, AIResponse, ModelConfig } from '../types/ai.types';

export abstract class BaseProvider {
  protected abstract providerName: string;
  
  abstract isConfigured(): boolean;
  abstract getAvailableModels(): ModelConfig[];
  abstract generateResponse(request: AIRequest): Promise<AIResponse>;
  
  protected countTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
  
  protected calculateCost(inputTokens: number, outputTokens: number, modelConfig: ModelConfig): number {
    const inputCost = (inputTokens / 1000000) * modelConfig.inputCostPer1M;
    const outputCost = (outputTokens / 1000000) * modelConfig.outputCostPer1M;
    return inputCost + outputCost;
  }
  
  protected validateRequest(request: AIRequest): void {
    if (!request.model) {
      throw new Error(`Model is required for ${this.providerName}`);
    }
    if (!request.messages?.length) {
      throw new Error(`Messages are required for ${this.providerName}`);
    }
  }
}