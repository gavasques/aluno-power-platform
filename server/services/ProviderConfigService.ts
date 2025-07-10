import { db } from '../db';
import { providerConfigs, modelConfigs, agents } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { ModelConfig } from './types/ai.types';
import { XAIProvider } from './providers/XAIProvider';
import { GeminiProvider } from './providers/GeminiProvider';
import { DeepSeekProvider } from './providers/DeepSeekProvider';
import { AnthropicProvider } from './providers/AnthropicProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';

export class ProviderConfigService {
  private static instance: ProviderConfigService;

  private constructor() {}

  public static getInstance(): ProviderConfigService {
    if (!ProviderConfigService.instance) {
      ProviderConfigService.instance = new ProviderConfigService();
    }
    return ProviderConfigService.instance;
  }

  // Initialize default provider configurations
  async initializeProviderConfigs() {
    const providers = [
      {
        provider: 'openai',
        name: 'OpenAI (ChatGPT)',
        description: 'OpenAI GPT models including GPT-4 and GPT-3.5',
        isActive: true,
        defaultTemperature: '0.7',
        defaultMaxTokens: 2000,
        supportsStreaming: true,
        supportsVision: true,
        supportsFunctionCalling: true,
        customSettings: {}
      },
      {
        provider: 'anthropic',
        name: 'Anthropic (Claude)',
        description: 'Claude models including Claude 3 Opus, Sonnet, and Haiku',
        isActive: true,
        defaultTemperature: '0.7',
        defaultMaxTokens: 4000,
        supportsStreaming: true,
        supportsVision: true,
        supportsFunctionCalling: false,
        customSettings: {}
      },
      {
        provider: 'gemini',
        name: 'Google Gemini',
        description: 'Google Gemini models including Gemini Pro and Flash',
        isActive: true,
        defaultTemperature: '0.7',
        defaultMaxTokens: 8192,
        supportsStreaming: true,
        supportsVision: true,
        supportsFunctionCalling: true,
        customSettings: {}
      },
      {
        provider: 'deepseek',
        name: 'DeepSeek AI',
        description: 'DeepSeek models optimized for coding and reasoning',
        isActive: true,
        defaultTemperature: '0.7',
        defaultMaxTokens: 4000,
        supportsStreaming: true,
        supportsVision: false,
        supportsFunctionCalling: true,
        customSettings: {}
      },
      {
        provider: 'xai',
        name: 'xAI (Grok)',
        description: 'Grok models with advanced reasoning and real-time search capabilities',
        isActive: true,
        defaultTemperature: '0.7',
        defaultMaxTokens: 80000,
        supportsStreaming: true,
        supportsVision: true,
        supportsFunctionCalling: false,
        customSettings: {
          supportsReasoningLevel: true,
          supportsLiveSearch: true,
          supportsImageGeneration: true
        }
      }
    ];

    for (const provider of providers) {
      await db.insert(providerConfigs)
        .values(provider)
        .onConflictDoUpdate({
          target: providerConfigs.provider,
          set: {
            name: provider.name,
            description: provider.description,
            updatedAt: new Date()
          }
        });
    }
  }

  // Initialize model configurations from all providers
  async initializeModelConfigs() {
    // Get all models from providers
    const allModels: ModelConfig[] = [
      ...new OpenAIProvider().getAvailableModels(),
      ...new AnthropicProvider().getAvailableModels(),
      ...new GeminiProvider().getAvailableModels(),
      ...new DeepSeekProvider().getAvailableModels(),
      ...new XAIProvider().getAvailableModels()
    ];

    for (const model of allModels) {
      const customSettings: any = {};
      
      // Add Grok-specific settings
      if (model.provider === 'xai') {
        customSettings.supportsReasoningLevel = true;
        customSettings.supportsLiveSearch = !model.model.includes('vision') && !model.model.includes('image');
        customSettings.supportsImageGeneration = model.model.includes('image');
        customSettings.supportsImageUnderstanding = model.model.includes('vision');
      }

      // Determine temperature support
      const supportsTemperature = !model.model.includes('o1') && 
                                   !model.model.includes('o4') && 
                                   !model.model.includes('image');

      await db.insert(modelConfigs)
        .values({
          provider: model.provider,
          model: model.model,
          displayName: model.model,
          description: model.capabilities?.join(', '),
          inputCostPer1M: model.inputCostPer1M.toString(),
          outputCostPer1M: model.outputCostPer1M.toString(),
          maxTokens: model.maxTokens,
          contextWindow: model.maxTokens,
          temperature: '0.7',
          temperatureMin: model.provider === 'xai' ? '0' : '0',
          temperatureMax: model.provider === 'xai' ? '2' : '2',
          supportsTemperature,
          supportsImages: model.model.includes('vision') || model.capabilities?.includes('vision'),
          supportsSystemMessage: true,
          capabilities: model.capabilities || [],
          customSettings,
          isRecommended: model.recommended || false,
          isActive: true
        })
        .onConflictDoUpdate({
          target: [modelConfigs.provider, modelConfigs.model],
          set: {
            displayName: model.model,
            inputCostPer1M: model.inputCostPer1M.toString(),
            outputCostPer1M: model.outputCostPer1M.toString(),
            maxTokens: model.maxTokens,
            customSettings,
            isRecommended: model.recommended || false,
            updatedAt: new Date()
          }
        });
    }
  }

  // Get all provider configurations
  async getProviderConfigs() {
    return await db.select().from(providerConfigs).orderBy(providerConfigs.provider);
  }

  // Get provider configuration by provider key
  async getProviderConfig(provider: string) {
    const result = await db.select()
      .from(providerConfigs)
      .where(eq(providerConfigs.provider, provider))
      .limit(1);
    
    return result[0] || null;
  }

  // Update provider configuration
  async updateProviderConfig(provider: string, config: any) {
    return await db.update(providerConfigs)
      .set({
        ...config,
        updatedAt: new Date()
      })
      .where(eq(providerConfigs.provider, provider))
      .returning();
  }

  // Get model configurations for a provider
  async getModelConfigs(provider?: string) {
    if (provider) {
      return await db.select()
        .from(modelConfigs)
        .where(eq(modelConfigs.provider, provider))
        .orderBy(modelConfigs.model);
    }
    
    return await db.select()
      .from(modelConfigs)
      .orderBy(modelConfigs.provider, modelConfigs.model);
  }

  // Get specific model configuration
  async getModelConfig(provider: string, model: string) {
    const result = await db.select()
      .from(modelConfigs)
      .where(
        and(
          eq(modelConfigs.provider, provider),
          eq(modelConfigs.model, model)
        )
      )
      .limit(1);
    
    return result[0] || null;
  }

  // Update model configuration
  async updateModelConfig(provider: string, model: string, config: any) {
    return await db.update(modelConfigs)
      .set({
        ...config,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(modelConfigs.provider, provider),
          eq(modelConfigs.model, model)
        )
      )
      .returning();
  }

  // Get agent configuration with inherited settings
  async getAgentConfiguration(agentId: string) {
    // Get agent
    const agentResult = await db.select()
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);
    
    const agent = agentResult[0];
    if (!agent) {
      throw new Error('Agent not found');
    }

    // Get provider config
    const providerConfig = await this.getProviderConfig(agent.provider);
    
    // Get model config
    const modelConfig = await this.getModelConfig(agent.provider, agent.model);

    // Merge configurations (agent overrides model, model overrides provider)
    const mergedConfig = {
      ...providerConfig,
      ...modelConfig,
      ...agent,
      providerConfig,
      modelConfig,
      // Merge custom settings
      customSettings: {
        ...(providerConfig?.customSettings || {}),
        ...(modelConfig?.customSettings || {}),
        ...(agent.customSettings || {})
      }
    };

    return mergedConfig;
  }

  // Create agent with inherited configurations
  async createAgentWithInheritedConfig(agentData: any) {
    // Get model configuration
    const modelConfig = await this.getModelConfig(agentData.provider, agentData.model);
    
    if (!modelConfig) {
      throw new Error('Model configuration not found');
    }

    // Use model's default values if not provided
    const finalAgentData = {
      ...agentData,
      temperature: agentData.temperature ?? modelConfig.temperature,
      maxTokens: agentData.maxTokens ?? modelConfig.maxTokens,
      costPer1kTokens: ((parseFloat(modelConfig.inputCostPer1M) + parseFloat(modelConfig.outputCostPer1M)) / 2 / 1000).toFixed(6),
      customSettings: {
        ...(modelConfig.customSettings || {}),
        ...(agentData.customSettings || {})
      }
    };

    return await db.insert(agents)
      .values(finalAgentData)
      .returning();
  }

  // Update agent and preserve inherited settings
  async updateAgentWithInheritedConfig(agentId: string, updates: any) {
    // If model or provider changed, get new defaults
    if (updates.provider || updates.model) {
      const currentAgent = await db.select()
        .from(agents)
        .where(eq(agents.id, agentId))
        .limit(1);
      
      const agent = currentAgent[0];
      const newProvider = updates.provider || agent.provider;
      const newModel = updates.model || agent.model;
      
      const modelConfig = await this.getModelConfig(newProvider, newModel);
      
      if (modelConfig) {
        // Update cost based on new model
        updates.costPer1kTokens = ((parseFloat(modelConfig.inputCostPer1M) + parseFloat(modelConfig.outputCostPer1M)) / 2 / 1000).toFixed(6);
        
        // Inherit model settings if not explicitly provided
        if (!updates.temperature) {
          updates.temperature = modelConfig.temperature;
        }
        if (!updates.maxTokens) {
          updates.maxTokens = modelConfig.maxTokens;
        }
        
        // Merge custom settings
        updates.customSettings = {
          ...(modelConfig.customSettings || {}),
          ...(agent.customSettings || {}),
          ...(updates.customSettings || {})
        };
      }
    }

    return await db.update(agents)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(agents.id, agentId))
      .returning();
  }
}