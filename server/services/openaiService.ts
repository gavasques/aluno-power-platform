import OpenAI from 'openai';

export interface OpenAIConfig {
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OpenAIService {
  private client: OpenAI | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
  }

  isConfigured(): boolean {
    return this.client !== null && !!process.env.OPENAI_API_KEY;
  }

  async generateCompletion(
    messages: ChatMessage[],
    config: OpenAIConfig
  ): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI client not configured. Please provide OPENAI_API_KEY.');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: config.model,
        messages: messages,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      return content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(`OpenAI API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateJSON<T>(
    messages: ChatMessage[],
    config: OpenAIConfig
  ): Promise<T> {
    const content = await this.generateCompletion(messages, config);
    
    try {
      return JSON.parse(content) as T;
    } catch (error) {
      console.error('Failed to parse JSON response:', content);
      throw new Error('Failed to parse AI response as JSON');
    }
  }
}

export const openaiService = new OpenAIService();