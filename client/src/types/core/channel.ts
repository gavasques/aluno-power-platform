/**
 * Unified Channel Types - Consolidated from multiple sources
 * Eliminates duplicate interfaces across the codebase
 */

// Core channel types from the Excel structure
export type ChannelType = 
  | 'SITE_PROPRIO'
  | 'AMAZON_FBM'
  | 'AMAZON_FBA'
  | 'AMAZON_DBA'
  | 'AMAZON_FBA_ONSITE'
  | 'MERCADO_LIVRE_ME1'
  | 'MERCADO_LIVRE_FLEX'
  | 'MERCADO_LIVRE_ENVIOS'
  | 'MERCADO_LIVRE_FULL'
  | 'SHOPEE'
  | 'MAGALU_FULL'
  | 'MAGALU_ENVIOS'
  | 'TIKTOKSHOP_NORMAL'
  | 'MARKETPLACE_OTHER'
  // Legacy channel types for backward compatibility
  | 'mercadolivre'
  | 'amazon'
  | 'shopee'
  | 'magazineluiza'
  | 'americanas'
  | 'casasbahia'
  | 'pontofrio'
  | 'extra'
  | 'carrefour'
  | 'ecommerce'
  | 'whatsapp'
  | 'fisico';

// Base channel interface (simplified structure)
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

// Comprehensive channel cost structure (Excel-based)
export interface ChannelCostData {
  // Pricing
  price: number;
  
  // Commission structure with advanced rules
  commissionPercent?: number;
  commissionUpToValue?: number;
  commissionAboveValue?: number;
  commissionMinValue?: number;
  commissionMaxValue?: number;
  
  // Cost components from Excel
  packagingCostValue: number;
  fixedCostPercent: number;
  marketingCostPercent: number;
  financialCostPercent?: number;
  shippingCostValue?: number;
  prepCenterCostValue?: number;
  
  // Rebate system (income, not cost)
  rebateValue?: number;
  
  // Product codes per channel
  productCodes?: {
    fnsku?: string;
    asin?: string;
    mlb?: string;
    mlbCatalog?: string;
    idProduto?: string;
    skuMgl?: string;
    codigoSite?: string;
  };
}

// Sales channel interface (comprehensive)
export interface SalesChannel {
  type: ChannelType;
  isActive: boolean;
  data: ChannelCostData;
}

// Legacy product channels interface for backward compatibility
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

// Channel fees structure
export interface ChannelFees {
  commission: number;
  payment: number;
  shipping: number;
  advertising?: number;
  operational?: number;
  other?: number;
}

// Calculation results interface
export interface ChannelCalculationResult {
  channelType: ChannelType;
  
  // Revenue
  grossRevenue: number;
  netRevenue: number;
  
  // Costs breakdown
  productCost: number;
  taxCost: number;
  commissionCost: number;
  packagingCost: number;
  fixedCost: number;
  marketingCost: number;
  financialCost: number;
  shippingCost: number;
  prepCenterCost: number;
  totalCosts: number;
  
  // Rebate (income)
  rebateIncome: number;
  
  // Profitability
  grossProfit: number;
  netProfit: number;
  marginPercent: number;
  roiPercent: number;
  
  // Validation
  isValid: boolean;
  errors: string[];
}

// Form interfaces
export interface ChannelFormData {
  channels: SalesChannel[];
}

// Component props interfaces
export interface ChannelEditorProps {
  productId: number;
  onSave: (channels: SalesChannel[]) => Promise<void>;
  onCancel: () => void;
}

export interface ChannelCalculatorProps {
  channel: SalesChannel;
  productCost: number;
  taxPercent: number;
  onChange: (result: ChannelCalculationResult) => void;
}

// API response types
export interface ChannelUpdateRequest {
  channels: SalesChannel[];
}

export interface ChannelUpdateResponse {
  success: boolean;
  data: any; // Product with channels
  message: string;
}

// Legacy aliases for backward compatibility
export type Channel = SalesChannel;
export type ChannelData = ChannelCostData;