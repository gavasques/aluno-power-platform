import OpenAI from 'openai';
import { storage } from '../storage';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ProcessListingRequest {
  agentId: string;
  userId: string;
  userName: string;
  productName: string;
  productInfo?: string;
  reviewsData: string;
  format: 'csv' | 'text';
}

interface ProcessListingResponse {
  analysis: {
    mainBenefits: string[];
    painPoints: string[];
    keyFeatures: string[];
    targetAudience: string;
  };
  titles: string[];
  bulletPoints: string[];
  description: string;
  processingTime: number;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  usageId: string;
  generationId: string;
}

export class OpenAIService {
  async processAmazonListing(request: ProcessListingRequest): Promise<ProcessListingResponse> {
    const startTime = Date.now();
    
    // Get agent with prompts
    const agent = await storage.getAgentWithPrompts(request.agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    // Get prompts by type
    const systemPrompt = agent.prompts.find(p => p.promptType === 'system')?.content || '';
    const analysisPrompt = agent.prompts.find(p => p.promptType === 'analysis')?.content || '';
    const titlePrompt = agent.prompts.find(p => p.promptType === 'title')?.content || '';
    const bulletPointsPrompt = agent.prompts.find(p => p.promptType === 'bulletPoints')?.content || '';
    const descriptionPrompt = agent.prompts.find(p => p.promptType === 'description')?.content || '';

    try {
      // Step 1: Analysis
      const analysisResponse = await openai.chat.completions.create({
        model: agent.model,
        temperature: parseFloat(agent.temperature.toString()),
        max_tokens: agent.maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `${analysisPrompt}\n\nProduto: ${request.productName}\n${request.productInfo ? `Informações: ${request.productInfo}\n` : ''}Avaliações:\n${request.reviewsData}`
          }
        ],
      });

      const analysisResult = JSON.parse(analysisResponse.choices[0].message.content || '{}');

      // Step 2: Generate Titles
      const titlesResponse = await openai.chat.completions.create({
        model: agent.model,
        temperature: parseFloat(agent.temperature.toString()),
        max_tokens: agent.maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `${titlePrompt}\n\nAnálise: ${JSON.stringify(analysisResult)}\nProduto: ${request.productName}`
          }
        ],
      });

      const titles = JSON.parse(titlesResponse.choices[0].message.content || '[]');

      // Step 3: Generate Bullet Points
      const bulletPointsResponse = await openai.chat.completions.create({
        model: agent.model,
        temperature: parseFloat(agent.temperature.toString()),
        max_tokens: agent.maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `${bulletPointsPrompt}\n\nAnálise: ${JSON.stringify(analysisResult)}\nProduto: ${request.productName}`
          }
        ],
      });

      const bulletPoints = JSON.parse(bulletPointsResponse.choices[0].message.content || '[]');

      // Step 4: Generate Description
      const descriptionResponse = await openai.chat.completions.create({
        model: agent.model,
        temperature: parseFloat(agent.temperature.toString()),
        max_tokens: agent.maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `${descriptionPrompt}\n\nAnálise: ${JSON.stringify(analysisResult)}\nProduto: ${request.productName}`
          }
        ],
      });

      const description = descriptionResponse.choices[0].message.content || '';

      // Calculate tokens and cost
      const totalInputTokens = (analysisResponse.usage?.prompt_tokens || 0) +
                               (titlesResponse.usage?.prompt_tokens || 0) +
                               (bulletPointsResponse.usage?.prompt_tokens || 0) +
                               (descriptionResponse.usage?.prompt_tokens || 0);

      const totalOutputTokens = (analysisResponse.usage?.completion_tokens || 0) +
                                (titlesResponse.usage?.completion_tokens || 0) +
                                (bulletPointsResponse.usage?.completion_tokens || 0) +
                                (descriptionResponse.usage?.completion_tokens || 0);

      const totalTokens = totalInputTokens + totalOutputTokens;
      const cost = (totalTokens / 1000) * parseFloat(agent.costPer1kTokens.toString());

      const processingTime = Date.now() - startTime;

      // Save usage record
      const usageId = uuidv4();
      await storage.createAgentUsage({
        id: usageId,
        agentId: request.agentId,
        userId: request.userId,
        userName: request.userName,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        totalTokens,
        costUsd: cost.toString(),
        processingTimeMs: processingTime,
        status: 'success'
      });

      // Save generation record
      const generationId = uuidv4();
      await storage.createAgentGeneration({
        id: generationId,
        usageId,
        productName: request.productName,
        productInfo: request.productInfo ? { info: request.productInfo } : null,
        reviewsData: { data: request.reviewsData, format: request.format },
        analysisResult,
        titles,
        bulletPoints,
        description
      });

      return {
        analysis: analysisResult,
        titles,
        bulletPoints,
        description,
        processingTime,
        tokensUsed: {
          input: totalInputTokens,
          output: totalOutputTokens,
          total: totalTokens
        },
        cost,
        usageId,
        generationId
      };

    } catch (error: any) {
      // Save error usage record
      const usageId = uuidv4();
      await storage.createAgentUsage({
        id: usageId,
        agentId: request.agentId,
        userId: request.userId,
        userName: request.userName,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        costUsd: '0',
        processingTimeMs: Date.now() - startTime,
        status: 'error',
        errorMessage: error.message
      });

      throw error;
    }
  }
}

export const openaiService = new OpenAIService();