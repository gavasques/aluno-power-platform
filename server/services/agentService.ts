import { storage } from '../storage';
import { openaiService, type ChatMessage, type OpenAIConfig } from './openaiService';
import { v4 as uuidv4 } from 'uuid';
import type { Agent, AgentPrompt, AgentUsage, AgentGeneration } from '@shared/schema';

export interface ProductInfo {
  name: string;
  category?: string;
  features?: string[];
  brand?: string;
  specifications?: Record<string, any>;
}

export interface ReviewData {
  totalReviews: number;
  averageRating: number;
  positivePoints: string[];
  negativePoints: string[];
  commonComplaints: string[];
  featuresLoved: string[];
}

export interface AnalysisResult {
  keyBenefits: string[];
  targetAudience: string;
  competitiveAdvantages: string[];
  potentialConcerns: string[];
  marketPosition: string;
}

export interface GeneratedContent {
  titles: string[];
  bulletPoints: string[];
  description: string;
}

export class AgentService {
  async executeAgent(
    agentId: string,
    userId: string,
    userName: string,
    productInfo: ProductInfo,
    reviewsData: ReviewData
  ): Promise<AgentGeneration> {
    // Get agent with prompts
    const agent = await storage.getAgentWithPrompts(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    if (!agent.isActive) {
      throw new Error('Agent is not active');
    }

    // Create usage record
    const usageId = uuidv4();
    const usage: AgentUsage = await storage.createAgentUsage({
      id: usageId,
      agentId,
      userId,
      userName,
      status: 'success'
    });

    try {
      // Get active prompts
      const systemPrompts = agent.prompts.filter(p => p.isActive && p.promptType === 'system');
      const analysisPrompts = agent.prompts.filter(p => p.isActive && p.promptType === 'analysis');
      const titlePrompts = agent.prompts.filter(p => p.isActive && p.promptType === 'title');
      const bulletPointPrompts = agent.prompts.filter(p => p.isActive && p.promptType === 'bulletPoints');
      const descriptionPrompts = agent.prompts.filter(p => p.isActive && p.promptType === 'description');

      const config: OpenAIConfig = {
        model: agent.model,
        temperature: parseFloat(agent.temperature.toString()),
        maxTokens: agent.maxTokens
      };

      // Step 1: Analysis
      const analysisResult = await this.performAnalysis(
        systemPrompts[0],
        analysisPrompts[0],
        productInfo,
        reviewsData,
        config
      );

      // Step 2: Generate titles
      const titles = await this.generateTitles(
        systemPrompts[0],
        titlePrompts[0],
        productInfo,
        analysisResult,
        config
      );

      // Step 3: Generate bullet points
      const bulletPoints = await this.generateBulletPoints(
        systemPrompts[0],
        bulletPointPrompts[0],
        productInfo,
        analysisResult,
        config
      );

      // Step 4: Generate description
      const description = await this.generateDescription(
        systemPrompts[0],
        descriptionPrompts[0],
        productInfo,
        analysisResult,
        titles[0],
        bulletPoints,
        config
      );

      // Create generation record
      const generation = await storage.createAgentGeneration({
        id: uuidv4(),
        usageId,
        productName: productInfo.name,
        productInfo,
        reviewsData,
        analysisResult,
        titles,
        bulletPoints,
        description
      });

      return generation;

    } catch (error) {
      // Update usage with error
      await storage.updateAgentUsage(usageId, {
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private async performAnalysis(
    systemPrompt: AgentPrompt,
    analysisPrompt: AgentPrompt,
    productInfo: ProductInfo,
    reviewsData: ReviewData,
    config: OpenAIConfig
  ): Promise<AnalysisResult> {
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt.content },
      {
        role: 'user',
        content: analysisPrompt.content
          .replace('{{PRODUCT_INFO}}', JSON.stringify(productInfo, null, 2))
          .replace('{{REVIEWS_DATA}}', JSON.stringify(reviewsData, null, 2))
      }
    ];

    return await openaiService.generateJSON<AnalysisResult>(messages, config);
  }

  private async generateTitles(
    systemPrompt: AgentPrompt,
    titlePrompt: AgentPrompt,
    productInfo: ProductInfo,
    analysisResult: AnalysisResult,
    config: OpenAIConfig
  ): Promise<string[]> {
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt.content },
      {
        role: 'user',
        content: titlePrompt.content
          .replace('{{PRODUCT_INFO}}', JSON.stringify(productInfo, null, 2))
          .replace('{{ANALYSIS_RESULT}}', JSON.stringify(analysisResult, null, 2))
      }
    ];

    const result = await openaiService.generateJSON<{ titles: string[] }>(messages, config);
    return result.titles;
  }

  private async generateBulletPoints(
    systemPrompt: AgentPrompt,
    bulletPrompt: AgentPrompt,
    productInfo: ProductInfo,
    analysisResult: AnalysisResult,
    config: OpenAIConfig
  ): Promise<string[]> {
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt.content },
      {
        role: 'user',
        content: bulletPrompt.content
          .replace('{{PRODUCT_INFO}}', JSON.stringify(productInfo, null, 2))
          .replace('{{ANALYSIS_RESULT}}', JSON.stringify(analysisResult, null, 2))
      }
    ];

    const result = await openaiService.generateJSON<{ bulletPoints: string[] }>(messages, config);
    return result.bulletPoints;
  }

  private async generateDescription(
    systemPrompt: AgentPrompt,
    descriptionPrompt: AgentPrompt,
    productInfo: ProductInfo,
    analysisResult: AnalysisResult,
    title: string,
    bulletPoints: string[],
    config: OpenAIConfig
  ): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt.content },
      {
        role: 'user',
        content: descriptionPrompt.content
          .replace('{{PRODUCT_INFO}}', JSON.stringify(productInfo, null, 2))
          .replace('{{ANALYSIS_RESULT}}', JSON.stringify(analysisResult, null, 2))
          .replace('{{TITLE}}', title)
          .replace('{{BULLET_POINTS}}', bulletPoints.join('\n'))
      }
    ];

    const result = await openaiService.generateCompletion(messages, config);
    return result;
  }
}

export const agentService = new AgentService();