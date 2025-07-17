// Shared types for product management
export interface ProductFormData {
  name: string;
  sku?: string;
  ean?: string;
  description?: string;
  category?: string;
  brandId?: string;
  supplierId?: string;
  ncm?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  photo?: string;
  costItem?: number;
  taxPercent?: number;

  channels?: any[];
}

export interface CostCalculation {
  baseWithTax: number;
  totalCost: number;
  suggestedPrices: {
    margin20: number;
    margin30: number;
    margin40: number;
  };
}

export interface ProductListItem {
  id: number;
  name: string;
  photo?: string;
  sku?: string;
  brand?: string;
  costItem?: number;
  channels?: any[];
  active: boolean;
}

export type ProductEditMode = 'basic' | 'costs' | 'channels';