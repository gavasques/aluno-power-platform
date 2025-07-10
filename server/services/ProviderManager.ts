import { OpenAIProvider } from './providers/OpenAIProvider';
import { AnthropicProvider } from './providers/AnthropicProvider';
import { GeminiProvider } from './providers/GeminiProvider';
import { DeepSeekProvider } from './providers/DeepSeekProvider';
import { XAIProvider } from './providers/XAIProvider';
import { BaseProvider } from './providers/BaseProvider';
import { AIRequest, AIResponse, ModelConfig, ProviderStatus, AIProvider } from './types/ai.types';

export class ProviderManager {
  private providers: Map<AIProvider, BaseProvider>;

  constructor() {
    this.providers = new Map();
    this.providers.set('openai', new OpenAIProvider());
    this.providers.set('anthropic', new AnthropicProvider());
    this.providers.set('gemini', new GeminiProvider());
    this.providers.set('deepseek', new DeepSeekProvider());
    this.providers.set('xai', new XAIProvider());
  }

  getProviderStatus(): ProviderStatus {
    return {
      openai: this.providers.get('openai')?.isConfigured() ?? false,
      anthropic: this.providers.get('anthropic')?.isConfigured() ?? false,
      gemini: this.providers.get('gemini')?.isConfigured() ?? false,
      deepseek: this.providers.get('deepseek')?.isConfigured() ?? false,
      xai: this.providers.get('xai')?.isConfigured() ?? false
    };
  }

  getAllModels(): ModelConfig[] {
    const allModels: ModelConfig[] = [];
    const providerEntries = Array.from(this.providers.entries());
    
    for (const [, provider] of providerEntries) {
      if (provider.isConfigured()) {
        allModels.push(...provider.getAvailableModels());
      }
    }
    
    return allModels;
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    const provider = this.providers.get(request.provider);
    
    if (!provider) {
      throw new Error(`Provider ${request.provider} not found`);
    }
    
    if (!provider.isConfigured()) {
      throw new Error(`Provider ${request.provider} is not configured`);
    }
    
    return provider.generateResponse(request);
  }

  getProvider(providerName: AIProvider): BaseProvider | undefined {
    return this.providers.get(providerName);
  }

  isProviderConfigured(providerName: AIProvider): boolean {
    return this.providers.get(providerName)?.isConfigured() ?? false;
  }

  getModelsByProvider(providerName: AIProvider): ModelConfig[] {
    const provider = this.providers.get(providerName);
    return provider?.isConfigured() ? provider.getAvailableModels() : [];
  }
}