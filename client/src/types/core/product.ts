/**
 * Unified Product Types - Consolidated from multiple sources
 * Eliminates duplicate interfaces across the codebase
 */

// Base product dimensions (consolidated from multiple definitions)
export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
}

// Base product descriptions
export interface ProductDescriptions {
  description?: string;
  htmlDescription?: string;
  bulletPoints?: string[];
  technicalSpecs?: Record<string, string>;
}

// Base product interface with common fields
export interface BaseProduct {
  name: string;
  sku?: string;
  internalCode?: string;
  ean?: string;
  dimensions?: ProductDimensions;
  weight?: number;
  brand?: string;
  category?: string;
  supplierId?: number;
  ncm?: string;
  photo?: string;
  descriptions?: ProductDescriptions;
  observations?: string;
}

// Complete product interface for database entities
export interface Product extends BaseProduct {
  id: number;
  costItem?: number;
  packCost?: number;
  taxPercent?: number;
  channels: Record<string, any>; // Using generic type for now
  active: boolean;
  createdAt: string;
  updatedAt?: string;
  
  // Computed fields for backward compatibility
  costPrice?: number;
  salePrice?: number;
}

// Product form data for creating/editing products
export interface ProductFormData extends BaseProduct {
  brandId?: string;
  costItem?: number;
  packCost?: number;
  taxPercent?: number;
  channels?: any[];
  active?: boolean;
}

// Product data for inserting new products
export interface InsertProduct extends BaseProduct {
  costItem?: number;
  packCost?: number;
  taxPercent?: number;
  channels?: Record<string, any>;
  active?: boolean;
}

// Simplified product interface for lists
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

// Cost calculation interface
export interface CostCalculation {
  baseWithTax: number;
  totalCost: number;
  suggestedPrices: {
    margin20: number;
    margin30: number;
    margin40: number;
  };
}

// Product editing modes
export type ProductEditMode = 'basic' | 'costs' | 'channels';

// Legacy aliases for backward compatibility
export type ProductItem = Product;
export type ProductData = ProductFormData;