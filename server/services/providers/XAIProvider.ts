import OpenAI from 'openai';
import { BaseProvider } from './BaseProvider';
import { AIRequest, AIResponse, ModelConfig } from '../types/ai.types';

export class XAIProvider extends BaseProvider {
  private client?: OpenAI;

  constructor() {
    super();
    this.initializeClient();
  }

  private initializeClient() {
    const apiKey = process.env.XAI_API_KEY;
    if (apiKey) {
      this.client = new OpenAI({
        baseURL: "https://api.x.ai/v1",
        apiKey: apiKey
      });
      console.log('✅ [XAI_PROVIDER] Initialized successfully');
    } else {
      console.log('⚠️  [XAI_PROVIDER] XAI_API_KEY not found');
    }
  }

  isConfigured(): boolean {
    return !!this.client && !!process.env.XAI_API_KEY;
  }

  getAvailableModels(): ModelConfig[] {
    return [
      // Current Grok models as shown in user's image
      { 
        provider: 'xai', 
        model: 'grok-2-vision-1212', 
        inputCostPer1M: 2.00, 
        outputCostPer1M: 10.00, 
        maxTokens: 8192,
        capabilities: ['text', 'vision', 'reasoning']
      },
      { 
        provider: 'xai', 
        model: 'grok-2-1212', 
        inputCostPer1M: 2.00, 
        outputCostPer1M: 10.00, 
        maxTokens: 131072,
        capabilities: ['text', 'reasoning', 'search']
      },
      { 
        provider: 'xai', 
        model: 'grok-vision-beta', 
        inputCostPer1M: 5.00, 
        outputCostPer1M: 15.00, 
        maxTokens: 8192,
        capabilities: ['text', 'vision', 'reasoning']
      },
      { 
        provider: 'xai', 
        model: 'grok-beta', 
        inputCostPer1M: 5.00, 
        outputCostPer1M: 15.00, 
        maxTokens: 131072,
        capabilities: ['text', 'reasoning', 'search']
      }
    ];
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    if (!this.client) {
      throw new Error('XAI client not configured');
    }

    const startTime = Date.now();
    console.log(`🚀 [XAI_PROVIDER] Starting generation with ${request.model}`);

    try {
      // Prepare messages with Grok-specific features
      const messages = this.prepareMessages(request);
      
      // Build request parameters with Grok features
      const requestParams: any = {
        model: request.model,
        messages: messages,
        max_tokens: request.maxTokens || 4000,
        temperature: request.temperature || 0.7,
      };

      // Add reasoning controls if specified
      if (request.reasoningLevel) {
        requestParams.reasoning = {
          level: request.reasoningLevel // 'low' or 'high'
        };
        console.log(`🧠 [XAI_PROVIDER] Reasoning level: ${request.reasoningLevel}`);
      }

      // Add search capability if enabled
      if (request.enableSearch) {
        requestParams.tools = [{
          type: "function",
          function: {
            name: "web_search",
            description: "Search the web for current information",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The search query"
                }
              },
              required: ["query"]
            }
          }
        }];
        console.log(`🔍 [XAI_PROVIDER] Live search enabled`);
      }

      const completion = await this.client.chat.completions.create(requestParams);

      const endTime = Date.now();
      const duration = endTime - startTime;

      const inputTokens = completion.usage?.prompt_tokens || 0;
      const outputTokens = completion.usage?.completion_tokens || 0;
      const totalTokens = completion.usage?.total_tokens || 0;

      // Calculate cost based on model pricing
      const modelConfig = this.getAvailableModels().find(m => m.model === request.model);
      const inputCost = (inputTokens / 1000000) * (modelConfig?.inputCostPer1M || 2.00);
      const outputCost = (outputTokens / 1000000) * (modelConfig?.outputCostPer1M || 10.00);
      const totalCost = inputCost + outputCost;

      console.log(`✅ [XAI_PROVIDER] Generation completed in ${duration}ms`);
      console.log(`   📊 Tokens: ${inputTokens} input + ${outputTokens} output = ${totalTokens} total`);
      console.log(`   💰 Cost: $${totalCost.toFixed(6)}`);

      return {
        content: completion.choices[0]?.message?.content || '',
        usage: {
          inputTokens,
          outputTokens,
          totalTokens
        },
        cost: totalCost,
        model: request.model,
        provider: 'xai',
        reasoning: completion.choices[0]?.message?.reasoning || undefined,
        searchResults: completion.choices[0]?.message?.tool_calls?.filter(call => 
          call.function?.name === 'web_search'
        ) || undefined
      };

    } catch (error) {
      console.error('❌ [XAI_PROVIDER] Generation failed:', error);
      throw error;
    }
  }

  private prepareMessages(request: AIRequest): any[] {
    const messages = [...request.messages];

    // Handle image understanding for vision models
    if (request.referenceImages?.length && this.isVisionModel(request.model)) {
      const lastMessage = messages[messages.length - 1];
      
      if (typeof lastMessage.content === 'string') {
        lastMessage.content = [
          {
            type: "text",
            text: lastMessage.content
          },
          ...request.referenceImages.map(image => ({
            type: "image_url",
            image_url: {
              url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`
            }
          }))
        ];
      }
      
      console.log(`📸 [XAI_PROVIDER] Added ${request.referenceImages.length} images for vision analysis`);
    }

    return messages;
  }

  private isVisionModel(model: string): boolean {
    return model.includes('vision') || model.includes('grok-2-vision');
  }

  // Image analysis utility
  async analyzeImage(base64Image: string, prompt?: string): Promise<string> {
    if (!this.client) {
      throw new Error('XAI client not configured');
    }

    const analysisPrompt = prompt || "Analyze this image in detail and describe its key elements, context, and any notable aspects.";

    const response = await this.client.chat.completions.create({
      model: "grok-2-vision-1212",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: analysisPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content || '';
  }

  // Reasoning-enhanced generation
  async generateWithReasoning(prompt: string, reasoningLevel: 'low' | 'high' = 'low'): Promise<{
    content: string;
    reasoning?: string;
  }> {
    if (!this.client) {
      throw new Error('XAI client not configured');
    }

    const response = await this.client.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      reasoning: {
        level: reasoningLevel
      },
      max_tokens: 1000,
    });

    return {
      content: response.choices[0].message.content || '',
      reasoning: response.choices[0].message.reasoning
    };
  }

  // Live search capability
  async searchAndAnswer(query: string): Promise<{
    content: string;
    searchResults?: any[];
  }> {
    if (!this.client) {
      throw new Error('XAI client not configured');
    }

    const response = await this.client.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "user",
          content: `Search for current information about: ${query}`
        }
      ],
      tools: [{
        type: "function",
        function: {
          name: "web_search",
          description: "Search the web for current information",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query"
              }
            },
            required: ["query"]
          }
        }
      }],
      max_tokens: 1000,
    });

    return {
      content: response.choices[0].message.content || '',
      searchResults: response.choices[0].message.tool_calls?.filter(call => 
        call.function?.name === 'web_search'
      )
    };
  }
}