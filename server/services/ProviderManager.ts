import { OpenAIProvider } from './providers/OpenAIProvider';
import { AnthropicProvider } from './providers/AnthropicProvider';
import { GeminiProvider } from './providers/GeminiProvider';
import { DeepSeekProvider } from './providers/DeepSeekProvider';
import { XAIProvider } from './providers/XAIProvider';
import { OpenRouterProvider } from './providers/OpenRouterProvider';
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
    this.providers.set('openrouter', new OpenRouterProvider());
  }

  getProviderStatus(): ProviderStatus {
    return {
      openai: this.providers.get('openai')?.isConfigured() ?? false,
      anthropic: this.providers.get('anthropic')?.isConfigured() ?? false,
      gemini: this.providers.get('gemini')?.isConfigured() ?? false,
      deepseek: this.providers.get('deepseek')?.isConfigured() ?? false,
      xai: this.providers.get('xai')?.isConfigured() ?? false,
      openrouter: this.providers.get('openrouter')?.isConfigured() ?? false
    };
  }

  async getAllModels(): Promise<ModelConfig[]> {
    const allModels: ModelConfig[] = [];
    const providerEntries = Array.from(this.providers.entries());
    
    for (const [providerName, provider] of providerEntries) {
      if (provider.isConfigured()) {
        try {
          // For OpenRouter, use dynamic API call to get latest models
          if (providerName === 'openrouter') {
            console.log(`🔍 [PROVIDER_MANAGER] Attempting to fetch dynamic models for OpenRouter...`);
            const openrouterProvider = provider as OpenRouterProvider;
            if (typeof openrouterProvider.getModels === 'function') {
              console.log(`✅ [PROVIDER_MANAGER] OpenRouter getModels function found, calling API...`);
              const dynamicModels = await openrouterProvider.getModels();
              console.log(`📊 [PROVIDER_MANAGER] OpenRouter returned ${dynamicModels.length} models`);
              allModels.push(...dynamicModels);
            } else {
              console.log(`⚠️ [PROVIDER_MANAGER] OpenRouter getModels function not found, using static models`);
              allModels.push(...provider.getAvailableModels());
            }
          } else {
            allModels.push(...provider.getAvailableModels());
          }
        } catch (error) {
          console.warn(`⚠️ [PROVIDER_MANAGER] Failed to get models for ${providerName}:`, error);
          // Fallback to static models
          allModels.push(...provider.getAvailableModels());
        }
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