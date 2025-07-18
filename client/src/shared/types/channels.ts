/**
 * Channel Management Types - Comprehensive Sales Channel System
 * Following SOLID principles and modular architecture
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
  | 'MARKETPLACE_OTHER';

// Excel-based comprehensive cost structure
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

// Channel configuration interface
export interface SalesChannel {
  type: ChannelType;
  isActive: boolean;
  data: ChannelCostData;
}

// Product with channels
export interface ProductWithChannels {
  id: number;
  name: string;
  costItem: number;
  taxPercent: number;
  channels: SalesChannel[];
}

// Calculation results
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

// Form interfaces following interface segregation
export interface ChannelFormData {
  channels: SalesChannel[];
}

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
  data: ProductWithChannels;
  message: string;
}