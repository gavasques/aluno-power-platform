// Agent System Types
export interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  isActive: boolean;
  model: string;
  temperature: number;
  maxTokens: number;
  costPer1kTokens: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentPrompt {
  id: string;
  agentId: string;
  promptType: 'system' | 'analysis' | 'title' | 'bulletPoints' | 'description';
  content: string;
  version: number;
  isActive: boolean;
  createdAt: Date;
}

export interface AgentUsage {
  id: string;
  agentId: string;
  userId: string;
  userName: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  processingTimeMs: number;
  status: 'success' | 'error';
  errorMessage?: string;
  createdAt: Date;
}

export interface AgentGeneration {
  id: string;
  usageId: string;
  productName: string;
  productInfo: any;
  reviewsData: any;
  analysisResult: any;
  titles: any;
  bulletPoints: any;
  description: string;
  createdAt: Date;
}

export interface AgentWithPrompts extends Agent {
  prompts: AgentPrompt[];
}

export interface ModelPricing {
  inputCostPer1M: number;
  outputCostPer1M: number;
}

export interface AmazonListingRequest {
  productName: string;
  productInfo?: string;
  reviewsData: string;
  format: 'csv' | 'text';
}

export interface AmazonListingResponse {
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
}

export const MODEL_PRICING: Record<string, ModelPricing> = {
  'gpt-4o': {
    inputCostPer1M: 15.00,
    outputCostPer1M: 60.00
  },
  'gpt-4o-mini': {
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.60
  },
  'o1-preview': {
    inputCostPer1M: 15.00,
    outputCostPer1M: 60.00
  },
  'o1-mini': {
    inputCostPer1M: 3.00,
    outputCostPer1M: 12.00
  }
};