import { z } from 'zod';

// Form schema
export const productFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  sku: z.string().optional(),
  freeCode: z.string().optional(),
  supplierCode: z.string().optional(),
  internalCode: z.string().optional(),
  ean: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
  supplierId: z.number().optional(),
  ncm: z.string().optional(),
  costItem: z.number().min(0, 'Custo deve ser maior que 0').optional(),
  packCost: z.number().min(0, 'Custo de embalagem deve ser maior que 0').optional(),
  taxPercent: z.number().min(0, 'Taxa de imposto deve ser maior que 0').max(100, 'Taxa de imposto não pode ser maior que 100').optional(),
  weight: z.number().min(0, 'Peso deve ser maior que 0').optional(),
  dimensions: z.object({
    length: z.number().min(0, 'Comprimento deve ser maior que 0').optional(),
    width: z.number().min(0, 'Largura deve ser maior que 0').optional(),
    height: z.number().min(0, 'Altura deve ser maior que 0').optional(),
  }).optional(),
  description: z.string().optional(),
  bulletPoints: z.string().optional(),
  observations: z.string().optional(),
  active: z.boolean().default(true),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

export interface Product {
  id: number;
  name: string;
  sku?: string;
  freeCode?: string;
  supplierCode?: string;
  internalCode?: string;
  ean?: string;
  brand?: string;
  category?: string;
  supplierId?: number;
  ncm?: string;
  costItem?: number;
  packCost?: number;
  taxPercent?: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  description?: string;
  bulletPoints?: string;
  observations?: string;
  active: boolean;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductEditState {
  photoFile: File | null;
  photoPreview: string | null;
  activeTab: string;
}

export interface ProductEditActions {
  handlePhotoChange: (file: File | null) => void;
  setActiveTab: (tab: string) => void;
  onSave: (data: ProductFormData) => Promise<void>;
  onNavigateBack: () => void;
}