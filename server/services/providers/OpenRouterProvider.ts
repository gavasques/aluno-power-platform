import { AIRequest, AIResponse } from '../types/ai.types.js';
import { BaseProvider } from './BaseProvider.js';

export class OpenRouterProvider extends BaseProvider {
  protected providerName = 'openrouter';
  private apiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1';

  constructor() {
    super();
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ [OPENROUTER] OPENROUTER_API_KEY not configured');
    } else {
      console.log('✅ [OPENROUTER] Provider initialized successfully');
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  getAvailableModels() {
    if (!this.isConfigured()) {
      return [];
    }

    return [
      // Popular models available on OpenRouter with enhanced capabilities
      {
        provider: 'openrouter' as const,
        model: 'openai/gpt-4o',
        inputCostPer1M: 2500,
        outputCostPer1M: 10000,
        maxTokens: 128000,
        capabilities: ['text', 'vision', 'pdf', 'web-search', 'tools'],
        recommended: true
      },
      {
        provider: 'openrouter' as const,
        model: 'openai/o1',
        inputCostPer1M: 15000,
        outputCostPer1M: 60000,
        maxTokens: 100000,
        capabilities: ['text', 'reasoning', 'deep-analysis'],
        recommended: true
      },
      {
        provider: 'openrouter' as const,
        model: 'openai/o1-mini',
        inputCostPer1M: 3000,
        outputCostPer1M: 12000,
        maxTokens: 65536,
        capabilities: ['text', 'reasoning', 'deep-analysis', 'reasoning-effort']
      },
      {
        provider: 'openrouter' as const,
        model: 'deepseek/deepseek-r1',
        inputCostPer1M: 550,
        outputCostPer1M: 2190,
        maxTokens: 65536,
        capabilities: ['text', 'reasoning', 'deep-analysis', 'reasoning-effort']
      },
      {
        provider: 'openrouter' as const,
        model: 'openai/gpt-4o-mini',
        inputCostPer1M: 150,
        outputCostPer1M: 600,
        maxTokens: 128000,
        capabilities: ['text', 'vision', 'pdf', 'web-search', 'tools'],
        recommended: true
      },
      {
        provider: 'openrouter' as const,
        model: 'anthropic/claude-3.5-sonnet',
        inputCostPer1M: 3000,
        outputCostPer1M: 15000,
        maxTokens: 200000,
        capabilities: ['text', 'vision', 'pdf', 'web-search', 'tools'],
        recommended: true
      },
      {
        provider: 'openrouter' as const,
        model: 'anthropic/claude-3-haiku',
        inputCostPer1M: 250,
        outputCostPer1M: 1250,
        maxTokens: 200000,
        capabilities: ['text', 'vision', 'pdf', 'web-search']
      },
      {
        provider: 'openrouter' as const,
        model: 'google/gemini-pro-1.5',
        inputCostPer1M: 1250,
        outputCostPer1M: 5000,
        maxTokens: 2000000,
        capabilities: ['text', 'vision', 'pdf', 'web-search', 'tools']
      },
      {
        provider: 'openrouter' as const,
        model: 'meta-llama/llama-3.1-70b-instruct',
        inputCostPer1M: 520,
        outputCostPer1M: 750,
        maxTokens: 128000,
        capabilities: ['text', 'pdf', 'web-search']
      },
      {
        provider: 'openrouter' as const,
        model: 'mistralai/mistral-large',
        inputCostPer1M: 3000,
        outputCostPer1M: 9000,
        maxTokens: 128000,
        capabilities: ['text', 'pdf', 'web-search']
      },
      {
        provider: 'openrouter' as const,
        model: 'perplexity/llama-3.1-sonar-large-128k-online',
        inputCostPer1M: 1000,
        outputCostPer1M: 1000,
        maxTokens: 127072,
        capabilities: ['text', 'web-search-native', 'reasoning']
      },
      {
        provider: 'openrouter' as const,
        model: 'openrouter/auto',
        inputCostPer1M: 0,
        outputCostPer1M: 0,
        maxTokens: 200000,
        capabilities: ['text', 'vision', 'pdf', 'web-search', 'auto-routing', 'tools']
      }
    ];
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    console.log(`🚀 [OPENROUTER] Processing request for model: ${request.model}`);
    
    try {
      const headers = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.SITE_URL || 'http://localhost:5000',
        'X-Title': 'Aluno Power Platform - AI Agents'
      };

      // Convert messages to support multimodal content (images/PDFs)
      const processedMessages = this.processMultimodalMessages(request);

      // Build request body compatible with OpenRouter format
      const body: any = {
        model: this.getModelName(request),
        messages: processedMessages,
        temperature: request.temperature || 0.7,
        max_tokens: Math.min(request.maxTokens || 4000, 16000), // Increased limit for complex tasks
      };

      // Add OpenRouter advanced parameters
      if (request.top_p !== undefined) {
        body.top_p = request.top_p;
      }
      if (request.frequency_penalty !== undefined) {
        body.frequency_penalty = request.frequency_penalty;
      }
      if (request.presence_penalty !== undefined) {
        body.presence_penalty = request.presence_penalty;
      }
      if (request.seed !== undefined) {
        body.seed = request.seed;
      }

      // Add reasoning parameters for reasoning-capable models
      if (this.isReasoningModel(request.model) && request.openrouterAdvanced?.enableReasoning) {
        // For reasoning models, use specific parameters
        if (request.openrouterAdvanced?.reasoning_effort && (request.model.includes('o1-mini') || request.model.includes('deepseek-r1'))) {
          body.reasoning_effort = request.openrouterAdvanced.reasoning_effort;
        }
        
        // Reasoning models might have different temperature/token constraints
        if (request.model.includes('o1')) {
          body.temperature = Math.min(request.temperature || 0.7, 1.0); // o1 models have temperature limits
        }
        
        // Log reasoning activation
        console.log(`🧠 [OPENROUTER] Reasoning mode activated for ${request.model} with effort: ${request.openrouterAdvanced?.reasoning_effort || 'default'}`);
      }

      // Add plugins for advanced features
      const plugins = this.buildPlugins(request);
      if (plugins.length > 0) {
        body.plugins = plugins;
      }

      // Add web search options for models with native web search
      if (request.openrouterAdvanced?.searchContextSize && this.hasNativeWebSearch(request.model)) {
        body.web_search_options = {
          search_context_size: request.openrouterAdvanced.searchContextSize
        };
      }

      // Add response format if specified
      if (request.response_format) {
        body.response_format = request.response_format;
      }

      // Add tools if specified
      if (request.tools && request.tools.length > 0) {
        body.tools = request.tools;
        if (request.tool_choice) {
          body.tool_choice = request.tool_choice;
        }
      }

      console.log(`🔧 [OPENROUTER] Request params for ${request.model}:`, JSON.stringify(body, null, 2));

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ [OPENROUTER] Response received:`, JSON.stringify(data, null, 2));

      const content = data.choices?.[0]?.message?.content || '';
      const usage = data.usage || {};

      // Calculate cost based on OpenRouter pricing
      const inputTokens = usage.prompt_tokens || 0;
      const outputTokens = usage.completion_tokens || 0;
      const totalTokens = usage.total_tokens || (inputTokens + outputTokens);

      // Enhanced cost calculation with web search and PDF processing costs
      let totalCost = (inputTokens * 0.000001) + (outputTokens * 0.000002);
      
      // Add web search costs if applicable
      if (plugins.some(p => p.id === 'web')) {
        const webSearchResults = request.openrouterAdvanced?.webSearchMaxResults || 5;
        totalCost += (webSearchResults / 1000) * 4; // $4 per 1000 results
      }

      // Add PDF processing costs if applicable
      if (plugins.some(p => p.id === 'file-parser')) {
        const pdfEngine = request.openrouterAdvanced?.pdfEngine || 'mistral-ocr';
        if (pdfEngine === 'mistral-ocr') {
          totalCost += 2; // $2 per 1000 pages estimate
        }
      }

      return {
        content,
        usage: {
          inputTokens,
          outputTokens,
          totalTokens
        },
        cost: totalCost
      };

    } catch (error) {
      console.error('❌ [OPENROUTER] Error generating response:', error);
      throw error;
    }
  }

  async checkConnection(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/key`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('❌ [OPENROUTER] Connection check failed:', error);
      return false;
    }
  }

  async getModels(): Promise<any[]> {
    if (!this.apiKey) {
      console.warn('⚠️ [OPENROUTER] API key not configured, returning default models');
      return this.getDefaultModels();
    }

    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn(`⚠️ [OPENROUTER] Failed to fetch models: ${response.status}`);
        return this.getDefaultModels();
      }

      const data = await response.json();
      const models = data.data || [];

      console.log(`✅ [OPENROUTER] Fetched ${models.length} models from API`);

      // Transform OpenRouter models to our format
      return models.map((model: any) => ({
        provider: 'openrouter',
        model: model.id,
        inputCostPer1M: (model.pricing?.prompt || 0) * 1000000,
        outputCostPer1M: (model.pricing?.completion || 0) * 1000000,
        maxTokens: model.context_length || 4000,
        capabilities: this.parseCapabilities(model),
        name: model.name || model.id,
        description: model.description || '',
        recommended: model.id === 'openrouter/auto'
      })).sort((a: any, b: any) => {
        // Sort with recommended first, then by name
        if (a.recommended && !b.recommended) return -1;
        if (!a.recommended && b.recommended) return 1;
        return a.name.localeCompare(b.name);
      });

    } catch (error) {
      console.error('❌ [OPENROUTER] Error fetching models:', error);
      return this.getDefaultModels();
    }
  }

  private getModelName(request: AIRequest): string {
    // Add :online suffix for web search if enabled
    if (request.openrouterAdvanced?.enableWebSearch && !request.model.includes(':online')) {
      return `${request.model}:online`;
    }
    return request.model;
  }

  private hasNativeWebSearch(model: string): boolean {
    // Models with built-in web search capabilities
    const nativeWebSearchModels = [
      'perplexity/',
      'openai/gpt-4',
      'openai/gpt-4o'
    ];
    return nativeWebSearchModels.some(prefix => model.startsWith(prefix));
  }

  private processMultimodalMessages(request: AIRequest): any[] {
    return request.messages.map(message => {
      if (message.role === 'user' && (request.imageData || request.referenceImages?.length || request.attachments?.length)) {
        const content = [];
        
        // Add text content first
        content.push({
          type: 'text',
          text: message.content
        });

        // Add image data if provided
        if (request.imageData) {
          content.push({
            type: 'image_url',
            image_url: {
              url: request.imageData.startsWith('data:') ? request.imageData : `data:image/png;base64,${request.imageData}`
            }
          });
        }

        // Add reference images
        if (request.referenceImages?.length) {
          request.referenceImages.forEach(img => {
            content.push({
              type: 'image_url',
              image_url: {
                url: img.data.startsWith('data:') ? img.data : `data:image/png;base64,${img.data}`
              }
            });
          });
        }

        // Add attachments (PDFs, other files)
        if (request.attachments?.length) {
          request.attachments.forEach(attachment => {
            if (attachment.type === 'pdf') {
              content.push({
                type: 'file',
                file: {
                  filename: attachment.filename,
                  file_data: attachment.data.startsWith('data:') ? attachment.data : `data:application/pdf;base64,${attachment.data}`
                }
              });
            } else if (attachment.type === 'image') {
              content.push({
                type: 'image_url',
                image_url: {
                  url: attachment.data.startsWith('data:') ? attachment.data : `data:image/png;base64,${attachment.data}`
                }
              });
            }
          });
        }

        return {
          ...message,
          content: content
        };
      }
      return message;
    });
  }

  private buildPlugins(request: AIRequest): any[] {
    const plugins = [];

    // Web search plugin
    if (request.openrouterAdvanced?.enableWebSearch) {
      const webPlugin: any = {
        id: 'web'
      };
      
      if (request.openrouterAdvanced.webSearchMaxResults) {
        webPlugin.max_results = Math.min(Math.max(request.openrouterAdvanced.webSearchMaxResults, 1), 10);
      }
      
      if (request.openrouterAdvanced.webSearchPrompt) {
        webPlugin.search_prompt = request.openrouterAdvanced.webSearchPrompt;
      }
      
      plugins.push(webPlugin);
    }

    // PDF processing plugin
    if (request.openrouterAdvanced?.enablePdfProcessing || request.attachments?.some(a => a.type === 'pdf')) {
      const pdfPlugin: any = {
        id: 'file-parser',
        pdf: {
          engine: request.openrouterAdvanced?.pdfEngine || 'pdf-text'
        }
      };
      plugins.push(pdfPlugin);
    }

    return plugins;
  }

  private isReasoningModel(model: string): boolean {
    const reasoningModels = [
      'o1', 'o1-mini', 'deepseek-r1', 'deepseek-reasoner', 
      'reasoning', 'sonar', 'perplexity/'
    ];
    return reasoningModels.some(prefix => model.includes(prefix));
  }

  private parseCapabilities(model: any): string[] {
    const capabilities = ['text'];
    
    // Check for reasoning capabilities
    if (this.isReasoningModel(model.id || model.model || '')) {
      capabilities.push('reasoning');
      if (model.id?.includes('o1-mini') || model.id?.includes('deepseek-r1')) {
        capabilities.push('reasoning-effort');
      }
    }
    
    // Check for vision capabilities
    if (model.architecture?.input_modalities?.includes('image') || model.modalities?.includes('image')) {
      capabilities.push('vision');
    }
    
    // Check for file/PDF processing
    if (model.architecture?.input_modalities?.includes('file')) {
      capabilities.push('pdf');
    }
    
    // Check for tools support
    if (model.supported_parameters?.includes('tools')) {
      capabilities.push('tools');
    }
    
    // Check for structured outputs
    if (model.supported_parameters?.includes('response_format') || model.supported_parameters?.includes('structured_outputs')) {
      capabilities.push('json');
    }

    // Check for web search (OpenRouter supports web search on all models via plugin)
    capabilities.push('web-search');

    // Check for reasoning capabilities (based on model name patterns)
    if (model.id?.includes('reasoning') || model.id?.includes('sonar') || model.name?.toLowerCase().includes('reasoning')) {
      capabilities.push('reasoning');
    }

    // Native web search for specific models
    if (model.id?.includes('online') || model.id?.includes('sonar') || model.id?.includes('perplexity')) {
      capabilities.push('web-search-native');
    }

    return capabilities;
  }

  private getDefaultModels(): any[] {
    return [
      {
        provider: 'openrouter',
        model: 'openrouter/auto',
        inputCostPer1M: 0,
        outputCostPer1M: 0,
        maxTokens: 4000,
        capabilities: ['chat'],
        name: 'Auto (OpenRouter)',
        description: 'Automatically selects the best model for your request',
        recommended: true
      },
      {
        provider: 'openrouter',
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        inputCostPer1M: 0,
        outputCostPer1M: 0,
        maxTokens: 131072,
        capabilities: ['chat'],
        name: 'Llama 3.2 3B (Free)',
        description: 'Fast and efficient for general tasks'
      },
      {
        provider: 'openrouter',
        model: 'microsoft/phi-3-mini-128k-instruct:free',
        inputCostPer1M: 0,
        outputCostPer1M: 0,
        maxTokens: 128000,
        capabilities: ['chat'],
        name: 'Phi-3 Mini (Free)',
        description: 'Microsoft\'s compact model for efficient inference'
      },
      {
        provider: 'openrouter',
        model: 'google/gemma-2-9b-it:free',
        inputCostPer1M: 0,
        outputCostPer1M: 0,
        maxTokens: 8192,
        capabilities: ['chat'],
        name: 'Gemma 2 9B (Free)',
        description: 'Google\'s open model for various tasks'
      }
    ];
  }
}