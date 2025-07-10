import OpenAI from 'openai';
import { BaseProvider } from './BaseProvider';
import { AIRequest, AIResponse, ModelConfig } from '../types/ai.types';
import { ImageProcessor } from '../utils/imageProcessor';
import { db } from '../../db';
import { generatedImages } from '../../../shared/schema';

export class OpenAIProvider extends BaseProvider {
  protected providerName = 'openai';
  private client: OpenAI;

  constructor() {
    super();
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  isConfigured(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  getAvailableModels(): ModelConfig[] {
    return [
      { 
        provider: 'openai', 
        model: 'gpt-4.1', 
        inputCostPer1M: 2.50, 
        outputCostPer1M: 10.00, 
        maxTokens: 128000,
        capabilities: ['chat', 'vision', 'tools', 'json', 'structured_output', 'web_search'],
        recommended: true
      },
      { 
        provider: 'openai', 
        model: 'gpt-4o', 
        inputCostPer1M: 2.50, 
        outputCostPer1M: 10.00, 
        maxTokens: 128000,
        capabilities: ['chat', 'vision', 'tools', 'json', 'structured_output', 'web_search'] 
      },
      { 
        provider: 'openai', 
        model: 'gpt-4o-mini', 
        inputCostPer1M: 0.15, 
        outputCostPer1M: 0.60, 
        maxTokens: 128000,
        capabilities: ['chat', 'vision', 'tools', 'json', 'structured_output', 'web_search'] 
      },
      { 
        provider: 'openai', 
        model: 'o4-mini', 
        inputCostPer1M: 1.00, 
        outputCostPer1M: 4.00, 
        maxTokens: 200000,
        capabilities: ['chat', 'reasoning', 'vision', 'files', 'structured_output'],
        recommended: true
      },
      { 
        provider: 'openai', 
        model: 'o3', 
        inputCostPer1M: 20.00, 
        outputCostPer1M: 80.00, 
        maxTokens: 200000,
        capabilities: ['chat', 'reasoning', 'vision', 'files', 'structured_output'] 
      },
      { 
        provider: 'openai', 
        model: 'o3-mini', 
        inputCostPer1M: 0.15, 
        outputCostPer1M: 0.60, 
        maxTokens: 128000,
        capabilities: ['chat', 'reasoning', 'structured_output'] 
      },
      { 
        provider: 'openai', 
        model: 'gpt-image-1', 
        inputCostPer1M: 5.00, 
        outputCostPer1M: 0.167025, 
        maxTokens: 32000,
        capabilities: ['image_generation', 'image_edit'] 
      }
    ];
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    this.validateRequest(request);
    const modelConfig = this.getModelConfig(request.model);
    const prompt = request.messages[request.messages.length - 1]?.content || '';

    // Fix temperature for problematic models
    if (request.model === 'gpt-4o' && request.temperature && request.temperature > 1.0) {
      console.log(`⚠️ [OPENAI] Limiting temperature for ${request.model} from ${request.temperature} to 1.0`);
      request.temperature = 1.0;
    }

    if (request.model === 'gpt-image-1') {
      return this.handleImageGeneration(request, modelConfig, prompt);
    }

    return this.handleTextGeneration(request, modelConfig);
  }

  private async handleImageGeneration(request: AIRequest, modelConfig: ModelConfig, prompt: string): Promise<AIResponse> {
    // Two modes for gpt-image-1:
    // 1. Edit mode: When reference images are provided
    // 2. Generation mode: When no reference images (uses Responses API)
    
    if (request.referenceImages?.length) {
      return this.handleImageEdit(request, modelConfig, prompt);
    } else {
      return this.handleImageCreation(request, modelConfig, prompt);
    }
  }

  private async handleImageEdit(request: AIRequest, modelConfig: ModelConfig, prompt: string): Promise<AIResponse> {
    console.log(`🖼️ [OPENAI] Edit mode: Processing ${request.referenceImages!.length} reference images with gpt-image-1`);
    
    const { files, cleanup } = await ImageProcessor.processMultipleImages(request.referenceImages!);
    
    try {
      const response = await this.client.images.edit({
        model: 'gpt-image-1',
        image: files,
        prompt: prompt,
        n: 1,
        size: 'auto',
        quality: 'high'
      });

      const imageUrl = ImageProcessor.validateImageResponse(response);
      const content = `Image edited using ${request.referenceImages!.length} reference images with GPT-Image-1!\n\nPrompt: ${prompt}\n\nURL: ${imageUrl}`;
      
      const inputTokens = this.countTokens(prompt);
      const outputTokens = 1;
      const cost = this.calculateCost(inputTokens, outputTokens, modelConfig);
      
      await this.storeGeneratedImage(imageUrl, prompt, 'gpt-image-1-edit');
      
      return {
        content,
        usage: { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens },
        cost
      };
    } finally {
      cleanup();
    }
  }

  private async handleImageCreation(request: AIRequest, modelConfig: ModelConfig, prompt: string): Promise<AIResponse> {
    console.log(`🎨 [OPENAI] Generation mode: Creating image with gpt-image-1 via Images API`);
    
    try {
      const response = await this.client.images.generate({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'high'
      });

      if (!response.data || !response.data[0] || !response.data[0].url) {
        throw new Error('No image generated from Images API');
      }

      const imageUrl = response.data[0].url;
      const content = `Image created with GPT-Image-1!\n\nPrompt: ${prompt}\n\nURL: ${imageUrl}`;
      
      const inputTokens = this.countTokens(prompt);
      const outputTokens = 1;
      const cost = this.calculateCost(inputTokens, outputTokens, modelConfig);
      
      await this.storeGeneratedImage(imageUrl, prompt, 'gpt-image-1-create');
      
      return {
        content,
        usage: { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens },
        cost
      };
    } catch (error) {
      console.error('❌ [OPENAI] Error in image creation mode:', error);
      throw error;
    }
  }

  private async handleTextGeneration(request: AIRequest, modelConfig: ModelConfig): Promise<AIResponse> {
    const isReasoningModel = ['o4-mini', 'o3', 'o3-mini'].includes(request.model);
    const isVisionModel = ['gpt-4.1', 'gpt-4o', 'gpt-4o-mini', 'o4-mini', 'o3'].includes(request.model);
    
    const params: any = {
      model: request.model,
      messages: this.prepareMessages(request, isVisionModel)
    };

    // Calculate safe max tokens - never exceed model's actual limit
    const requestedTokens = request.maxTokens || modelConfig.maxTokens;
    const safeMaxTokens = Math.min(requestedTokens, modelConfig.maxTokens);

    // Reasoning models use max_completion_tokens and have different parameter support
    if (isReasoningModel) {
      params.max_completion_tokens = safeMaxTokens;
      
      // Reasoning effort level (new parameter for o3-mini and o4-mini)
      if (request.reasoning_effort && ['o3-mini', 'o4-mini'].includes(request.model)) {
        params.reasoning_effort = request.reasoning_effort;
        console.log(`🧠 [OPENAI] Reasoning effort: ${request.reasoning_effort}`);
      }
      
      if (request.enableReasoning) {
        console.log(`🧠 [OPENAI] Reasoning mode enabled for ${request.model}`);
      }
      
      // IMPORTANT: Reasoning models DO NOT support these parameters:
      // - temperature, top_p, presence_penalty, frequency_penalty
      // - logprobs, logit_bias, max_tokens
      // Only basic parameters are supported
      console.log(`🚫 [OPENAI] Reasoning model - advanced parameters disabled for ${request.model}`);
    } else {
      params.max_tokens = safeMaxTokens;
      params.temperature = request.temperature ?? 0.7;
      
      // Advanced parameters for non-reasoning models
      if (request.top_p !== undefined) params.top_p = request.top_p;
      if (request.frequency_penalty !== undefined) params.frequency_penalty = request.frequency_penalty;
      if (request.presence_penalty !== undefined) params.presence_penalty = request.presence_penalty;
      if (request.logit_bias !== undefined) params.logit_bias = request.logit_bias;
      if (request.stop !== undefined) params.stop = request.stop;
      if (request.seed !== undefined) params.seed = request.seed;
    }

    // Response format
    if (request.response_format) {
      params.response_format = request.response_format;
      console.log(`📋 [OPENAI] Response format: ${request.response_format.type}`);
    }

    // Tools/Functions - only for non-reasoning models
    if (request.tools && request.tools.length > 0 && !isReasoningModel) {
      // Filter out unsupported tools and convert to proper function format
      const supportedTools = request.tools.filter(tool => {
        if (tool.type === 'retrieval') {
          console.log(`⚠️ [OPENAI] Retrieval tool is deprecated, skipping...`);
          return false;
        }
        return tool.type === 'code_interpreter';
      });

      if (supportedTools.length > 0) {
        params.tools = supportedTools;
        params.tool_choice = 'auto';
        console.log(`🔧 [OPENAI] Tools enabled: ${supportedTools.map(t => t.type).join(', ')}`);
      } else {
        console.log(`⚠️ [OPENAI] No supported tools found after filtering`);
      }
    } else if (request.tools && request.tools.length > 0 && isReasoningModel) {
      console.log(`🚫 [OPENAI] Tools requested but not supported for reasoning model ${request.model}`);
    }

    // Fine-tuned model override
    if (request.fineTuneModel) {
      params.model = request.fineTuneModel;
      console.log(`🎯 [OPENAI] Using fine-tuned model: ${request.fineTuneModel}`);
    }

    // Log if we had to reduce the token limit
    if (requestedTokens > modelConfig.maxTokens) {
      console.log(`⚠️ [OPENAI] Reduced maxTokens for ${request.model} from ${requestedTokens} to ${safeMaxTokens}`);
    }

    console.log(`🔧 [OPENAI] Request params for ${request.model}:`, JSON.stringify(params, null, 2));

    const response = await this.client.chat.completions.create(params);
    
    const content = response.choices[0]?.message?.content || '';
    const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    const cost = this.calculateCost(usage.prompt_tokens, usage.completion_tokens, modelConfig);

    // Handle tool calls if present
    if (response.choices[0]?.message?.tool_calls) {
      console.log(`🔧 [OPENAI] Tool calls detected: ${response.choices[0].message.tool_calls.length}`);
      // In a real implementation, you would process tool calls here
    }

    return {
      content,
      usage: {
        inputTokens: usage.prompt_tokens,
        outputTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens
      },
      cost
    };
  }

  private prepareMessages(request: AIRequest, isVisionModel: boolean): any[] {
    const messages = [...request.messages];

    // Handle image inputs for vision models
    if (isVisionModel && (request.referenceImages?.length || request.attachments?.some(a => a.type === 'image'))) {
      const lastMessage = messages[messages.length - 1];
      
      if (typeof lastMessage.content === 'string') {
        const content: any[] = [
          {
            type: "text",
            text: lastMessage.content
          }
        ];

        // Add reference images
        if (request.referenceImages?.length) {
          request.referenceImages.forEach(image => {
            content.push({
              type: "image_url",
              image_url: {
                url: image.data.startsWith('data:') ? image.data : `data:image/jpeg;base64,${image.data}`
              }
            });
          });
        }

        // Add image attachments
        if (request.attachments?.length) {
          request.attachments
            .filter(a => a.type === 'image')
            .forEach(attachment => {
              content.push({
                type: "image_url",
                image_url: {
                  url: attachment.data.startsWith('data:') ? attachment.data : `data:image/jpeg;base64,${attachment.data}`
                }
              });
            });
        }

        lastMessage.content = content;
        console.log(`📸 [OPENAI] Added ${content.length - 1} images for vision analysis`);
      }
    }

    // Handle text/code attachments
    if (request.attachments?.some(a => ['text', 'code', 'pdf'].includes(a.type))) {
      const textAttachments = request.attachments.filter(a => ['text', 'code', 'pdf'].includes(a.type));
      if (textAttachments.length > 0) {
        const attachmentText = textAttachments.map(a => {
          const content = a.data; // In real implementation, decode base64 for text files
          return `\n--- ${a.filename} (${a.type}) ---\n${content}\n---\n`;
        }).join('\n');
        
        // Prepend attachments to the last user message
        const lastMessage = messages[messages.length - 1];
        if (typeof lastMessage.content === 'string') {
          lastMessage.content = attachmentText + '\n' + lastMessage.content;
        }
        
        console.log(`📎 [OPENAI] Added ${textAttachments.length} text attachments`);
      }
    }

    return messages;
  }

  private getModelConfig(model: string): ModelConfig {
    const config = this.getAvailableModels().find(m => m.model === model);
    if (!config) {
      throw new Error(`Model ${model} not found for OpenAI provider`);
    }
    return config;
  }

  private async storeGeneratedImage(imageUrl: string, prompt: string, model: string): Promise<void> {
    if (imageUrl.length < 100) return;
    
    try {
      await db.insert(generatedImages).values({
        model,
        prompt,
        imageUrl,
        size: '1024x1024',
        quality: 'high',
        format: 'png',
        cost: '0.167',
        metadata: {
          provider: 'openai',
          model: 'gpt-image-1',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.log('Warning: Could not store generated image:', error);
    }
  }
}