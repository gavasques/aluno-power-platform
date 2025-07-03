export interface Product {
  id: number;
  name: string;
  sku?: string;
  brand?: string;
  category?: string;
  ean?: string;
  weight?: number;
  costItem?: number;
  packCost?: number;
  taxPercent?: number;
  observations?: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
}