export interface BaseChannel {
  enabled: boolean;
  price: number;
  shippingCost?: number;
  platformFee?: number;
  paymentFee?: number;
  advertisingCost?: number;
  operationalCost?: number;
  otherCosts?: number;
}

export interface ProductChannels {
  mercadolivre: BaseChannel;
  amazon: BaseChannel;
  shopee: BaseChannel;
  magazineluiza: BaseChannel;
  americanas: BaseChannel;
  casasbahia: BaseChannel;
  pontofrio: BaseChannel;
  extra: BaseChannel;
  carrefour: BaseChannel;
  ecommerce: BaseChannel;
  whatsapp: BaseChannel;
  fisico: BaseChannel;
}

export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
}

export interface ProductDescriptions {
  description?: string;
  htmlDescription?: string;
  bulletPoints?: string[];
  technicalSpecs?: Record<string, string>;
}

export interface Product {
  id: number;
  name: string;
  photo?: string;
  sku?: string;
  internalCode?: string;
  ean?: string;
  dimensions?: ProductDimensions;
  weight?: number;
  brand?: string;
  category?: string;
  supplierId?: number;
  ncm?: string;
  costItem?: number;
  packCost?: number;
  taxPercent?: number;
  observations?: string;
  descriptions?: ProductDescriptions;
  channels: ProductChannels;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
  
  // Computed fields for backward compatibility
  costPrice?: number;
  salePrice?: number;
}

export interface InsertProduct {
  name: string;
  photo?: string;
  sku?: string;
  internalCode?: string;
  ean?: string;
  dimensions?: ProductDimensions;
  weight?: number;
  brand?: string;
  category?: string;
  supplierId?: number;
  ncm?: string;
  costItem?: number;
  packCost?: number;
  taxPercent?: number;
  observations?: string;
  descriptions?: ProductDescriptions;
  channels?: ProductChannels;
  active?: boolean;
}