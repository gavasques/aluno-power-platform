
export interface PromptCategory {
  id: string;
  name: string;
  description?: string;
}

export interface PromptImage {
  id: string;
  url: string;
  alt: string;
  type: 'before' | 'after' | 'general';
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  category: PromptCategory;
  description?: string;
  usageExamples?: string;
  images?: PromptImage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePromptData {
  title: string;
  content: string;
  categoryId: string;
  description?: string;
  usageExamples?: string;
  images?: PromptImage[];
}

export interface UpdatePromptData extends Partial<CreatePromptData> {
  id: string;
}
