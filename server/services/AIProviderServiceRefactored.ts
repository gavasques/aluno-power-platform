import { ProviderManager } from './ProviderManager';
import { AIRequest, AIResponse, ModelConfig, ProviderStatus } from './types/ai.types';

export class AIProviderService {
  private providerManager: ProviderManager;

  constructor() {
    this.providerManager = new ProviderManager();
  }

  getProviderStatus(): ProviderStatus {
    return this.providerManager.getProviderStatus();
  }

  async getAllModels(): Promise<ModelConfig[]> {
    return this.providerManager.getAllModels();
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    try {
      console.log(`🚀 [AI_SERVICE] Processing request for ${request.provider}:${request.model}`);
      
      if (request.referenceImages?.length) {
        console.log(`📸 [AI_SERVICE] ${request.referenceImages.length} reference images provided`);
      }
      
      const response = await this.providerManager.generateResponse(request);
      
      console.log(`✅ [AI_SERVICE] Response generated successfully (${response.usage.totalTokens} tokens, $${response.cost.toFixed(6)})`);
      
      return response;
    } catch (error) {
      console.error('❌ [AI_SERVICE] Generation failed:', error);
      throw new Error(`AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  isProviderConfigured(provider: string): boolean {
    return this.providerManager.isProviderConfigured(provider as any);
  }

  getModelsByProvider(provider: string): ModelConfig[] {
    return this.providerManager.getModelsByProvider(provider as any);
  }
}

// Export singleton instance
export const aiProviderService = new AIProviderService();