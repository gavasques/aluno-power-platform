/**
 * Unified Product Types - Consolidated from multiple sources
 * Eliminates duplicate interfaces across the codebase
 */

import { SalesChannel } from './channel';

// Base product interface
export interface Product {
  id: number;
  name: string;
  sku?: string;
  internalCode?: string;
  freeCode?: string;
  supplierCode?: string;
  ean?: string;
  ncm?: string;
  photo?: string;
  costItem: number;
  taxPercent: number;
  weight?: number;
  dimensions?: ProductDimensions;
  brandName?: string;
  observations?: string;
  active: boolean;
  channels?: SalesChannel[];
  createdAt: string;
  updatedAt: string;
}

// Product dimensions
export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
}

// Product descriptions for different channels
export interface ProductDescriptions {
  short?: string;
  long?: string;
  technical?: string;
  marketing?: string;
  seo?: string;
}

// Product form data for creation/editing
export interface ProductFormData {
  name: string;
  sku?: string;
  internalCode?: string;
  freeCode?: string;
  supplierCode?: string;
  ean?: string;
  ncm?: string;
  costItem: number;
  taxPercent: number;
  weight?: number;
  dimensions?: ProductDimensions;
  brandName?: string;
  observations?: string;
  active?: boolean;
}

// Product list item (simplified for lists)
export interface ProductListItem {
  id: number;
  name: string;
  sku?: string;
  costItem: number;
  brandName?: string;
  active: boolean;
  channelsCount?: number;
  createdAt: string;
}

// Base product for inheritance
export interface BaseProduct {
  name: string;
  costItem: number;
  taxPercent: number;
  active: boolean;
}

// Product for insertion (without id and timestamps)
export interface InsertProduct extends Omit<Product, 'id' | 'createdAt' | 'updatedAt'> {
  // Inherits all fields except id and timestamps
}

// Cost calculation result
export interface CostCalculation {
  productCost: number;
  taxCost: number;
  totalCost: number;
  marginPercent: number;
}

// Product edit mode
export type ProductEditMode = 'create' | 'edit' | 'view';

// NEW: Specific types to replace 'any' usage
export interface ProductUpdateData {
  name?: string;
  sku?: string;
  internalCode?: string;
  freeCode?: string;
  supplierCode?: string;
  ean?: string;
  ncm?: string;
  costItem?: number;
  taxPercent?: number;
  weight?: number;
  dimensions?: ProductDimensions;
  brandName?: string;
  observations?: string;
  active?: boolean;
}

export interface ProductFilterData {
  search?: string;
  brandName?: string;
  active?: boolean;
  costRange?: {
    min: number;
    max: number;
  };
  hasChannels?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ProductSortData {
  field: 'name' | 'costItem' | 'brandName' | 'active' | 'createdAt';
  direction: 'asc' | 'desc';
}

export interface ProductBulkUpdateData {
  productIds: number[];
  updates: ProductUpdateData;
}

export interface ProductValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface ProductImportData {
  products: InsertProduct[];
  options: {
    skipDuplicates?: boolean;
    updateExisting?: boolean;
    validateOnly?: boolean;
  };
}

export interface ProductExportData {
  format: 'csv' | 'excel' | 'json';
  filters?: ProductFilterData;
  fields?: (keyof Product)[];
}

export interface ProductMetrics {
  totalProducts: number;
  activeProducts: number;
  productsWithChannels: number;
  averageCost: number;
  totalValue: number;
}

// Legacy aliases for backward compatibility
export type ProductItem = Product;