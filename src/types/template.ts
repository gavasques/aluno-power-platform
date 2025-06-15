
export interface TemplateCategory {
  id: string;
  name: string;
  description?: string;
}

export interface Template {
  id: string;
  title: string;
  content: string;
  category: TemplateCategory;
  description?: string;
  whenToUse?: string;
  customization?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTemplateData {
  title: string;
  content: string;
  categoryId: string;
  description?: string;
  whenToUse?: string;
  customization?: string;
}

export interface UpdateTemplateData extends Partial<CreateTemplateData> {
  id: string;
}
