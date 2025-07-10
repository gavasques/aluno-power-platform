import { ProviderManager } from './ProviderManager';
import { AIRequest, AIResponse, ModelConfig, ProviderStatus, AIProvider } from './types/ai.types';

export class AIProviderService {
  private providerManager: ProviderManager;

  constructor() {
    this.providerManager = new ProviderManager();
  }

  getProviderStatus(): ProviderStatus {
    return this.providerManager.getProviderStatus();
  }

  getAllModels(): ModelConfig[] {
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

  async generateOpenAI(request: AIRequest): Promise<AIResponse> {
    return this.generateResponse({ ...request, provider: 'openai' });
  }

  async generateAnthropic(request: AIRequest): Promise<AIResponse> {
    return this.generateResponse({ ...request, provider: 'anthropic' });
  }

  async generateGemini(request: AIRequest): Promise<AIResponse> {
    return this.generateResponse({ ...request, provider: 'gemini' });
  }

  async generateDeepSeek(request: AIRequest): Promise<AIResponse> {
    return this.generateResponse({ ...request, provider: 'deepseek' });
  }

  async generateXAI(request: AIRequest): Promise<AIResponse> {
    return this.generateResponse({ ...request, provider: 'xai' });
  }

  async generateOpenRouter(request: AIRequest): Promise<AIResponse> {
    return this.generateResponse({ ...request, provider: 'openrouter' });
  }

  isProviderConfigured(provider: string): boolean {
    return this.providerManager.isProviderConfigured(provider as AIProvider);
  }

  getModelsByProvider(provider: string): ModelConfig[] {
    return this.providerManager.getModelsByProvider(provider as AIProvider);
  }

  // Legacy support methods for backward compatibility
  countTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  async storeGeneratedImage(imageUrl: string, prompt: string, model: string): Promise<void> {
    const provider = this.providerManager.getProvider('openai');
    if (provider && 'storeGeneratedImage' in provider) {
      await (provider as any).storeGeneratedImage(imageUrl, prompt, model);
    }
  }
}

// Export singleton instance
export const aiProviderService = new AIProviderService();