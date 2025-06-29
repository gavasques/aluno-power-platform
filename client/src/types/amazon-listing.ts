// Amazon Listing Optimizer Types
export interface AmazonListingFormData {
  productName: string;
  brand: string;
  category: string;
  keywords: string;
  longTailKeywords: string;
  features: string;
  targetAudience: string;
  reviewsData: string;
}

export interface AmazonListingSession {
  id: string;
  sessionHash: string;
  userId: string;
  agentType: string;
  status: 'active' | 'processing' | 'completed' | 'aborted';
  formData?: AmazonListingFormData;
  reviewsInsight?: string;
  titles?: string;
  bulletPoints?: string;
  description?: string;
  providerAI?: string;
  modelAI?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcessingStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
}

export interface FileUpload {
  id: string;
  name: string;
  content: string;
  size: number;
}

export type ReviewsInputType = 'upload' | 'manual';

// Processing Constants
export const PROCESSING_STEPS = {
  SAVE_DATA: 'save_data',
  ANALYZE_REVIEWS: 'analyze_reviews',
  GENERATE_TITLES: 'generate_titles'
} as const;

export const PROMPT_TYPES = {
  ANALYSIS: 'analysis',
  TITLES: 'titles'
} as const;