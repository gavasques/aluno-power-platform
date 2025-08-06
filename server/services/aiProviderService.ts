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

  // ✅ Método dinâmico substitui 6 métodos duplicados (83% redução)
  async generate(provider: AIProvider, request: Omit<AIRequest, 'provider'>): Promise<AIResponse> {
    const supportedProviders: AIProvider[] = ['openai', 'anthropic', 'gemini', 'deepseek', 'xai', 'openrouter'];
    
    if (!supportedProviders.includes(provider)) {
      throw new Error(`Unsupported provider: ${provider}`);
    }
    
    return this.generateResponse({ ...request, provider });
  }

  // ✅ Factory method para providers específicos (se necessário para backward compatibility)
  provider(name: AIProvider) {
    return {
      generate: (request: Omit<AIRequest, 'provider'>) => this.generate(name, request)
    };
  }

  // Backward compatibility - métodos antigos redirecionam para o novo
  async generateOpenAI(request: AIRequest): Promise<AIResponse> {
    return this.generate('openai', request);
  }

  async generateAnthropic(request: AIRequest): Promise<AIResponse> {
    return this.generate('anthropic', request);
  }

  async generateGemini(request: AIRequest): Promise<AIResponse> {
    return this.generate('gemini', request);
  }

  async generateDeepSeek(request: AIRequest): Promise<AIResponse> {
    return this.generate('deepseek', request);
  }

  async generateXAI(request: AIRequest): Promise<AIResponse> {
    return this.generate('xai', request);
  }

  async generateOpenRouter(request: AIRequest): Promise<AIResponse> {
    return this.generate('openrouter', request);
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