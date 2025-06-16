
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

export interface PromptFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface PromptStep {
  id: string;
  title: string;
  content: string;
  explanation: string;
  order: number;
}

export interface Prompt {
  id: string;
  title: string;
  content: string; // Manter para compatibilidade - será o primeiro passo
  steps: PromptStep[];
  stepCount: number;
  category: PromptCategory;
  description?: string;
  usageExamples?: string;
  images?: PromptImage[];
  files?: PromptFile[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePromptData {
  title: string;
  content: string;
  steps: PromptStep[];
  stepCount: number;
  categoryId: string;
  description?: string;
  usageExamples?: string;
  images?: PromptImage[];
  files?: PromptFile[];
}

export interface UpdatePromptData extends Partial<CreatePromptData> {
  id: string;
}
