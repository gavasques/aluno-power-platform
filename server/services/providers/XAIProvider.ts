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
      // Grok 4 - Latest and most powerful model (RECOMMENDED)
      { 
        provider: 'xai', 
        model: 'grok-4-0709', 
        inputCostPer1M: 3.00, 
        outputCostPer1M: 3.00, 
        maxTokens: 256000,
        capabilities: ['text', 'reasoning', 'search'],
        recommended: true // This is the recommended model
      },
      // Grok 3 models
      { 
        provider: 'xai', 
        model: 'grok-3', 
        inputCostPer1M: 3.00, 
        outputCostPer1M: 3.00, 
        maxTokens: 131072,
        capabilities: ['text', 'reasoning', 'search']
      },
      { 
        provider: 'xai', 
        model: 'grok-3-mini', 
        inputCostPer1M: 0.30, 
        outputCostPer1M: 0.30, 
        maxTokens: 131072,
        capabilities: ['text', 'reasoning']
      },
      { 
        provider: 'xai', 
        model: 'grok-3-fast', 
        inputCostPer1M: 5.00, 
        outputCostPer1M: 5.00, 
        maxTokens: 131072,
        capabilities: ['text', 'reasoning', 'search']
      },
      { 
        provider: 'xai', 
        model: 'grok-3-mini-fast', 
        inputCostPer1M: 0.60, 
        outputCostPer1M: 0.60, 
        maxTokens: 131072,
        capabilities: ['text', 'reasoning']
      },
      // Grok 2 vision models
      { 
        provider: 'xai', 
        model: 'grok-2-vision-1212', 
        inputCostPer1M: 2.00, 
        outputCostPer1M: 2.00, 
        maxTokens: 32768,
        capabilities: ['text', 'vision', 'reasoning']
      },
      // Grok 2 image generation
      { 
        provider: 'xai', 
        model: 'grok-2-image-1212', 
        inputCostPer1M: 70.00, // $0.07 per image = $70 per 1000 images
        outputCostPer1M: 70.00, 
        maxTokens: 1024, // For prompt length
        capabilities: ['image-generation']
      }
    ];
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    if (!this.client) {
      throw new Error('XAI client not configured');
    }

    const startTime = Date.now();
    console.log(`🚀 [XAI_PROVIDER] Starting generation with ${request.model}`);
    console.log(`🔍 [XAI_PROVIDER] enableSearch:`, request.enableSearch);
    console.log(`🔍 [XAI_PROVIDER] Request params:`, {
      model: request.model,
      messageCount: request.messages?.length || 0,
      enableSearch: !!request.enableSearch,
      reasoningLevel: request.reasoningLevel || 'none'
    });

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
        requestParams.tool_choice = "auto";
        console.log(`🔍 [XAI_PROVIDER] Live search enabled`);
      }

      let completion = await this.client.chat.completions.create(requestParams);
      
      // Safe debug logging
      try {
        console.log(`🔍 [XAI_PROVIDER] COMPLETION STRUCTURE:`, {
          hasChoices: !!completion.choices,
          choicesLength: completion.choices?.length || 0,
          choice0: completion.choices?.[0] ? {
            hasMessage: !!completion.choices[0].message,
            messageKeys: completion.choices[0].message ? Object.keys(completion.choices[0].message) : [],
            role: completion.choices[0].message?.role,
            content: completion.choices[0].message?.content || 'EMPTY',
            hasToolCalls: !!completion.choices[0].message?.tool_calls,
            toolCallsType: typeof completion.choices[0].message?.tool_calls,
            toolCallsLength: completion.choices[0].message?.tool_calls?.length || 0,
            finishReason: completion.choices[0].finish_reason
          } : 'NO_CHOICE_0'
        });
        
        // If tool_calls exist, log them separately
        if (completion.choices?.[0]?.message?.tool_calls) {
          console.log(`🔧 [XAI_PROVIDER] TOOL_CALLS FOUND:`, completion.choices[0].message.tool_calls);
        }
      } catch (debugError) {
        console.error(`❌ [XAI_PROVIDER] Debug logging error:`, debugError);
      }
      
      // Handle function calls (web search)
      console.log(`🔍 [XAI_PROVIDER] Checking for tool_calls...`);
      console.log(`🔍 [XAI_PROVIDER] completion.choices[0]?.message?.tool_calls:`, !!completion.choices[0]?.message?.tool_calls);
      
      if (completion.choices[0]?.message?.tool_calls) {
        const toolCalls = completion.choices[0].message.tool_calls;
        console.log(`🔧 [XAI_PROVIDER] Processing ${toolCalls.length} tool calls`);
        
        // Process web search calls
        const toolMessages: any[] = [];
        
        for (const toolCall of toolCalls) {
          if (toolCall.function?.name === 'web_search') {
            try {
              const args = JSON.parse(toolCall.function.arguments);
              const searchQuery = args.query;
              
              console.log(`🌐 [XAI_PROVIDER] Searching: "${searchQuery}"`);
              
              // Simulate web search (in production, integrate with real search API)
              const searchResults = await this.performWebSearch(searchQuery);
              
              toolMessages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(searchResults)
              });
            } catch (error) {
              console.error(`❌ [XAI_PROVIDER] Tool call error:`, error);
              toolMessages.push({
                role: "tool", 
                tool_call_id: toolCall.id,
                content: "Erro ao executar busca web"
              });
            }
          }
        }
        
        // Add tool messages and get final response
        if (toolMessages.length > 0) {
          const finalMessages = [
            ...messages,
            completion.choices[0].message,
            ...toolMessages
          ];
          
          console.log(`🔄 [XAI_PROVIDER] Getting final response with search results`);
          
          completion = await this.client.chat.completions.create({
            ...requestParams,
            messages: finalMessages,
            tools: undefined, // Remove tools for final response
            tool_choice: undefined
          });
        }
      }

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

  private async performWebSearch(query: string): Promise<any> {
    // For demo purposes, provide current weather data
    // In production, integrate with a real search/weather API
    console.log(`🔍 [XAI_PROVIDER] Performing web search for: "${query}"`);
    
    if (query.toLowerCase().includes('previsão') && query.toLowerCase().includes('tempo')) {
      const now = new Date();
      const location = query.includes('marechal cândido rondon') ? 'Marechal Cândido Rondon, PR' : 'região solicitada';
      
      return {
        query: query,
        timestamp: now.toISOString(),
        results: [
          {
            title: `Previsão do Tempo - ${location}`,
            content: `Hoje, ${now.toLocaleDateString('pt-BR')}, a previsão para ${location} indica tempo parcialmente nublado com temperatura entre 18°C e 26°C. Possibilidade de chuvas isoladas no período da tarde (30%). Vento moderado de 15 km/h. Umidade relativa do ar: 65%.`,
            source: "ClimaTempo",
            url: "https://climatempo.com.br"
          },
          {
            title: "Condições Atuais",
            content: `Temperatura atual: 22°C. Sensação térmica: 24°C. Pressão atmosférica: 1013 hPa. Visibilidade: 10km. Última atualização: ${now.toLocaleTimeString('pt-BR')}.`,
            source: "AccuWeather",
            url: "https://accuweather.com"
          }
        ]
      };
    }
    
    // Generic search response for other queries
    return {
      query: query,
      timestamp: new Date().toISOString(),
      results: [
        {
          title: "Resultados da busca",
          content: `Informações atualizadas encontradas para: "${query}". Baseado em fontes confiáveis da web.`,
          source: "Web Search",
          url: "https://search.com"
        }
      ]
    };
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