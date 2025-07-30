/**
 * CHANNELS TYPES: Sistema de Tipos para Editor de Canais
 * Extraído de ChannelsEditor.tsx (735 linhas) para modularização
 * Tipos centralizados para canais de venda, campos, validações e calculadora
 */
import { z } from 'zod';

// ===== CHANNEL TYPES =====
export type ChannelType = 
  | 'SITE_PROPRIO' 
  | 'AMAZON_FBM' 
  | 'AMAZON_FBA_ONSITE' 
  | 'AMAZON_FBA_OFFSITE' 
  | 'MERCADO_LIVRE' 
  | 'SHOPEE';

export type FieldType = 'text' | 'currency' | 'percent' | 'number';

// ===== CHANNEL FIELD CONFIGURATION =====
export interface ChannelField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface ChannelConfig {
  name: string;
  icon: string;
  description?: string;
  fields: ChannelField[];
  defaultValues?: Record<string, any>;
}

// ===== CHANNEL DATA STRUCTURES =====
export interface BaseChannelData {
  id?: number;
  productId: number;
  channelType: ChannelType;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteProprioData extends BaseChannelData {
  channelType: 'SITE_PROPRIO';
  codigoSite?: string;
  packagingCostValue?: number;
  fixedCostPercent?: number;
  otherCostPercent?: number;
  otherCostValue?: number;
  marketingCostPercent?: number;
  financialCostPercent?: number;
  price?: number;
}

export interface AmazonFBMData extends BaseChannelData {
  channelType: 'AMAZON_FBM';
  fnsku?: string;
  asin?: string;
  commissionPercent?: number;
  marketplaceFeeValue?: number;
  fixedCostPercent?: number;
  installmentPercent?: number;
  packagingCostValue?: number;
  otherCostPercent?: number;
  otherCostValue?: number;
  tacosCostPercent?: number;
  rebatePercent?: number;
  rebateValue?: number;
  price?: number;
}

export interface AmazonFBAOnSiteData extends BaseChannelData {
  channelType: 'AMAZON_FBA_ONSITE';
  fnsku?: string;
  asin?: string;
  shippingCost?: number;
  commissionPercent?: number;
  marketplaceFeeValue?: number;
  installmentPercent?: number;
  fixedCostPercent?: number;
  packagingCostValue?: number;
  otherCostPercent?: number;
  otherCostValue?: number;
  tacosCostPercent?: number;
  rebatePercent?: number;
  rebateValue?: number;
  price?: number;
}

export interface AmazonFBAOffSiteData extends BaseChannelData {
  channelType: 'AMAZON_FBA_OFFSITE';
  fnsku?: string;
  asin?: string;
  shippingCost?: number;
  commissionPercent?: number;
  marketplaceFeeValue?: number;
  installmentPercent?: number;
  fixedCostPercent?: number;
  packagingCostValue?: number;
  otherCostPercent?: number;
  otherCostValue?: number;
  tacosCostPercent?: number;
  rebatePercent?: number;
  rebateValue?: number;
  price?: number;
}

export interface MercadoLivreData extends BaseChannelData {
  channelType: 'MERCADO_LIVRE';
  mlbCode?: string;
  commissionPercent?: number;
  marketplaceFeeValue?: number;
  installmentPercent?: number;
  fixedCostPercent?: number;
  packagingCostValue?: number;
  otherCostPercent?: number;
  otherCostValue?: number;
  adsCostPercent?: number;
  price?: number;
}

export interface ShopeeData extends BaseChannelData {
  channelType: 'SHOPEE';
  shopeeCode?: string;
  commissionPercent?: number;
  marketplaceFeeValue?: number;
  installmentPercent?: number;
  fixedCostPercent?: number;
  packagingCostValue?: number;
  otherCostPercent?: number;
  otherCostValue?: number;
  adsCostPercent?: number;
  price?: number;
}

// ===== UNION TYPE FOR ALL CHANNEL DATA =====
export type ChannelData = 
  | SiteProprioData 
  | AmazonFBMData 
  | AmazonFBAOnSiteData 
  | AmazonFBAOffSiteData 
  | MercadoLivreData 
  | ShopeeData;

// ===== PRODUCT AND CHANNEL RELATIONSHIP =====
export interface Product {
  id: number;
  name: string;
  sku?: string;
  costPrice?: number;
  weightKg?: number;
  dimensionsCm?: {
    length: number;
    width: number;
    height: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductWithChannels extends Product {
  channels: ChannelData[];
}

// ===== CALCULATION RESULTS =====
export interface ChannelCalculationResult {
  channelType: ChannelType;
  productCost: number;
  totalCosts: number;
  netProfit: number;
  marginPercent: number;
  roi: number;
  isProfit: boolean;
  costBreakdown: {
    productCost: number;
    commissionCost?: number;
    fixedCost?: number;
    packagingCost?: number;
    shippingCost?: number;
    marketplaceFee?: number;
    installmentFee?: number;
    otherCosts?: number;
    marketingCosts?: number;
    financialCosts?: number;
    tacosCosts?: number;
    rebateCosts?: number;
    adsCosts?: number;
  };
  calculations: {
    grossRevenue: number;
    totalDeductions: number;
    netRevenue: number;
    totalCosts: number;
    profit: number;
  };
}

// ===== FORM AND STATE TYPES =====
export interface ChannelsFormData {
  [K in ChannelType]?: Partial<Extract<ChannelData, { channelType: K }>>;
}

export interface ChannelsEditorState {
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  product: Product | null;
  channels: ChannelData[];
  formData: ChannelsFormData;
  expandedChannels: Set<ChannelType>;
  calculations: Record<ChannelType, ChannelCalculationResult>;
  hasUnsavedChanges: boolean;
}

// ===== VALIDATION SCHEMAS =====
export const baseChannelSchema = z.object({
  productId: z.number().min(1, 'ID do produto é obrigatório'),
  channelType: z.enum(['SITE_PROPRIO', 'AMAZON_FBM', 'AMAZON_FBA_ONSITE', 'AMAZON_FBA_OFFSITE', 'MERCADO_LIVRE', 'SHOPEE']),
  isActive: z.boolean().default(true),
});

export const siteProprioSchema = baseChannelSchema.extend({
  channelType: z.literal('SITE_PROPRIO'),
  codigoSite: z.string().optional(),
  packagingCostValue: z.number().min(0).optional(),
  fixedCostPercent: z.number().min(0).max(100).optional(),
  otherCostPercent: z.number().min(0).max(100).optional(),
  otherCostValue: z.number().min(0).optional(),
  marketingCostPercent: z.number().min(0).max(100).optional(),
  financialCostPercent: z.number().min(0).max(100).optional(),
  price: z.number().min(0).optional(),
});

export const amazonFBMSchema = baseChannelSchema.extend({
  channelType: z.literal('AMAZON_FBM'),
  fnsku: z.string().optional(),
  asin: z.string().optional(),
  commissionPercent: z.number().min(0).max(100).optional(),
  marketplaceFeeValue: z.number().min(0).optional(),
  fixedCostPercent: z.number().min(0).max(100).optional(),
  installmentPercent: z.number().min(0).max(100).optional(),
  packagingCostValue: z.number().min(0).optional(),
  otherCostPercent: z.number().min(0).max(100).optional(),
  otherCostValue: z.number().min(0).optional(),
  tacosCostPercent: z.number().min(0).max(100).optional(),
  rebatePercent: z.number().min(0).max(100).optional(),
  rebateValue: z.number().min(0).optional(),
  price: z.number().min(0).optional(),
});

export const amazonFBAOnSiteSchema = baseChannelSchema.extend({
  channelType: z.literal('AMAZON_FBA_ONSITE'),
  fnsku: z.string().optional(),
  asin: z.string().optional(),
  shippingCost: z.number().min(0).optional(),
  commissionPercent: z.number().min(0).max(100).optional(),
  marketplaceFeeValue: z.number().min(0).optional(),
  installmentPercent: z.number().min(0).max(100).optional(),
  fixedCostPercent: z.number().min(0).max(100).optional(),
  packagingCostValue: z.number().min(0).optional(),
  otherCostPercent: z.number().min(0).max(100).optional(),
  otherCostValue: z.number().min(0).optional(),
  tacosCostPercent: z.number().min(0).max(100).optional(),
  rebatePercent: z.number().min(0).max(100).optional(),
  rebateValue: z.number().min(0).optional(),
  price: z.number().min(0).optional(),
});

export const amazonFBAOffSiteSchema = baseChannelSchema.extend({
  channelType: z.literal('AMAZON_FBA_OFFSITE'),
  fnsku: z.string().optional(),
  asin: z.string().optional(),
  shippingCost: z.number().min(0).optional(),
  commissionPercent: z.number().min(0).max(100).optional(),
  marketplaceFeeValue: z.number().min(0).optional(),
  installmentPercent: z.number().min(0).max(100).optional(),
  fixedCostPercent: z.number().min(0).max(100).optional(),
  packagingCostValue: z.number().min(0).optional(),
  otherCostPercent: z.number().min(0).max(100).optional(),
  otherCostValue: z.number().min(0).optional(),
  tacosCostPercent: z.number().min(0).max(100).optional(),
  rebatePercent: z.number().min(0).max(100).optional(),
  rebateValue: z.number().min(0).optional(),
  price: z.number().min(0).optional(),
});

export const mercadoLivreSchema = baseChannelSchema.extend({
  channelType: z.literal('MERCADO_LIVRE'),
  mlbCode: z.string().optional(),
  commissionPercent: z.number().min(0).max(100).optional(),
  marketplaceFeeValue: z.number().min(0).optional(),
  installmentPercent: z.number().min(0).max(100).optional(),
  fixedCostPercent: z.number().min(0).max(100).optional(),
  packagingCostValue: z.number().min(0).optional(),
  otherCostPercent: z.number().min(0).max(100).optional(),
  otherCostValue: z.number().min(0).optional(),
  adsCostPercent: z.number().min(0).max(100).optional(),
  price: z.number().min(0).optional(),
});

export const shopeeSchema = baseChannelSchema.extend({
  channelType: z.literal('SHOPEE'),
  shopeeCode: z.string().optional(),
  commissionPercent: z.number().min(0).max(100).optional(),
  marketplaceFeeValue: z.number().min(0).optional(),
  installmentPercent: z.number().min(0).max(100).optional(),
  fixedCostPercent: z.number().min(0).max(100).optional(),
  packagingCostValue: z.number().min(0).optional(),
  otherCostPercent: z.number().min(0).max(100).optional(),
  otherCostValue: z.number().min(0).optional(),
  adsCostPercent: z.number().min(0).max(100).optional(),
  price: z.number().min(0).optional(),
});

// ===== FORM VALIDATION =====
export const channelsFormSchema = z.object({
  SITE_PROPRIO: siteProprioSchema.optional(),
  AMAZON_FBM: amazonFBMSchema.optional(),
  AMAZON_FBA_ONSITE: amazonFBAOnSiteSchema.optional(),
  AMAZON_FBA_OFFSITE: amazonFBAOffSiteSchema.optional(),
  MERCADO_LIVRE: mercadoLivreSchema.optional(),
  SHOPEE: shopeeSchema.optional(),
});

// ===== COMPONENT PROPS =====
export interface ChannelsEditorContainerProps {
  productId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (channels: ChannelData[]) => void;
  readOnly?: boolean;
  initialChannels?: ChannelData[];
}

export interface ChannelsEditorPresentationProps {
  state: ChannelsEditorState;
  actions: ChannelsEditorActions;
  utils: ChannelsEditorUtils;
  readOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// ===== ACTIONS INTERFACE =====
export interface ChannelsEditorActions {
  // Form actions
  updateChannelData: (channelType: ChannelType, field: string, value: any) => void;
  toggleChannel: (channelType: ChannelType, enabled: boolean) => void;
  expandChannel: (channelType: ChannelType) => void;
  collapseChannel: (channelType: ChannelType) => void;
  toggleChannelExpansion: (channelType: ChannelType) => void;
  
  // Data actions
  saveChannels: () => Promise<void>;
  resetForm: () => void;
  loadChannels: () => Promise<void>;
  
  // Calculation actions
  recalculateChannel: (channelType: ChannelType) => void;
  recalculateAllChannels: () => void;
  
  // Validation actions
  validateChannel: (channelType: ChannelType) => boolean;
  validateAllChannels: () => boolean;
  
  // Modal actions
  closeEditor: () => void;
  confirmClose: () => void;
}

// ===== UTILITIES INTERFACE =====
export interface ChannelsEditorUtils {
  // Formatting
  formatCurrency: (value: number) => string;
  formatPercent: (value: number) => string;
  formatNumber: (value: number, decimals?: number) => string;
  
  // Calculations
  calculateChannelProfitability: (channelData: ChannelData, productCost: number) => ChannelCalculationResult;
  getChannelConfig: (channelType: ChannelType) => ChannelConfig;
  getChannelIcon: (channelType: ChannelType) => string;
  getChannelName: (channelType: ChannelType) => string;
  
  // Validation
  isChannelActive: (channelType: ChannelType) => boolean;
  isChannelExpanded: (channelType: ChannelType) => boolean;
  hasChannelData: (channelType: ChannelType) => boolean;
  getChannelErrors: (channelType: ChannelType) => string[];
  
  // Data transformation
  getChannelDataForAPI: (channelType: ChannelType) => Partial<ChannelData> | null;
  getAllChannelDataForAPI: () => Partial<ChannelData>[];
  mergeChannelData: (existing: ChannelData[], updated: Partial<ChannelData>[]) => ChannelData[];
}

// ===== CHANNEL CONFIGURATION CONSTANTS =====
export const CHANNEL_CONFIGS: Record<ChannelType, ChannelConfig> = {
  SITE_PROPRIO: {
    name: 'Site Próprio',
    icon: '🌐',
    description: 'Vendas através do site próprio da empresa',
    fields: [
      { key: 'codigoSite', label: 'Código Site', type: 'text' },
      { key: 'packagingCostValue', label: 'Custo de Embalagem R$', type: 'currency' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'marketingCostPercent', label: 'Custos Marketing %', type: 'percent' },
      { key: 'financialCostPercent', label: 'Custos Financeiro %', type: 'percent' },
      { key: 'price', label: 'Preço de Venda Site', type: 'currency' },
    ]
  },
  AMAZON_FBM: {
    name: 'Amazon FBM',
    icon: '📮',
    description: 'Amazon Fulfillment by Merchant',
    fields: [
      { key: 'fnsku', label: 'FNSKU', type: 'text' },
      { key: 'asin', label: 'ASIN', type: 'text' },
      { key: 'commissionPercent', label: 'Custo Comissão %', type: 'percent' },
      { key: 'marketplaceFeeValue', label: 'Taxa Fixa Marketplace R$', type: 'currency' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'installmentPercent', label: '% Parc. Sem Juros', type: 'percent' },
      { key: 'packagingCostValue', label: 'Custo Embalagem R$', type: 'currency' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'tacosCostPercent', label: 'Custos TaCos %', type: 'percent' },
      { key: 'rebatePercent', label: 'Rebate %', type: 'percent' },
      { key: 'rebateValue', label: 'Rebate R$', type: 'currency' },
      { key: 'price', label: 'Preço de Venda FBM', type: 'currency' },
    ]
  },
  AMAZON_FBA_ONSITE: {
    name: 'Amazon FBA On Site',
    icon: '🏭',
    description: 'Amazon FBA com fulfillment no local',
    fields: [
      { key: 'fnsku', label: 'FNSKU', type: 'text' },
      { key: 'asin', label: 'ASIN', type: 'text' },
      { key: 'shippingCost', label: 'Custo do Frete FBA ON Site', type: 'currency' },
      { key: 'commissionPercent', label: 'Custo Comissão %', type: 'percent' },
      { key: 'marketplaceFeeValue', label: 'Taxa Fixa Marketplace R$', type: 'currency' },
      { key: 'installmentPercent', label: '% Parc. Sem Juros', type: 'percent' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'packagingCostValue', label: 'Custo Embalagem R$', type: 'currency' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'tacosCostPercent', label: 'Custos TaCos %', type: 'percent' },
      { key: 'rebatePercent', label: 'Rebate %', type: 'percent' },
      { key: 'rebateValue', label: 'Rebate R$', type: 'currency' },
      { key: 'price', label: 'Preço de Venda FBA ON Site', type: 'currency' },
    ]
  },
  AMAZON_FBA_OFFSITE: {
    name: 'Amazon FBA Off Site',
    icon: '🚚',
    description: 'Amazon FBA com fulfillment externo',
    fields: [
      { key: 'fnsku', label: 'FNSKU', type: 'text' },
      { key: 'asin', label: 'ASIN', type: 'text' },
      { key: 'shippingCost', label: 'Custo do Frete FBA OFF Site', type: 'currency' },
      { key: 'commissionPercent', label: 'Custo Comissão %', type: 'percent' },
      { key: 'marketplaceFeeValue', label: 'Taxa Fixa Marketplace R$', type: 'currency' },
      { key: 'installmentPercent', label: '% Parc. Sem Juros', type: 'percent' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'packagingCostValue', label: 'Custo Embalagem R$', type: 'currency' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'tacosCostPercent', label: 'Custos TaCos %', type: 'percent' },
      { key: 'rebatePercent', label: 'Rebate %', type: 'percent' },
      { key: 'rebateValue', label: 'Rebate R$', type: 'currency' },
      { key: 'price', label: 'Preço de Venda FBA OFF Site', type: 'currency' },
    ]
  },
  MERCADO_LIVRE: {
    name: 'Mercado Livre',
    icon: '🛒',
    description: 'Marketplace Mercado Livre',
    fields: [
      { key: 'mlbCode', label: 'Código MLB', type: 'text' },
      { key: 'commissionPercent', label: 'Custo Comissão %', type: 'percent' },
      { key: 'marketplaceFeeValue', label: 'Taxa Fixa Marketplace R$', type: 'currency' },
      { key: 'installmentPercent', label: '% Parc. Sem Juros', type: 'percent' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'packagingCostValue', label: 'Custo Embalagem R$', type: 'currency' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'adsCostPercent', label: 'Custos Ads %', type: 'percent' },
      { key: 'price', label: 'Preço de Venda Mercado Livre', type: 'currency' },
    ]
  },
  SHOPEE: {
    name: 'Shopee',
    icon: '🛍️',
    description: 'Marketplace Shopee',
    fields: [
      { key: 'shopeeCode', label: 'Código Shopee', type: 'text' },
      { key: 'commissionPercent', label: 'Custo Comissão %', type: 'percent' },
      { key: 'marketplaceFeeValue', label: 'Taxa Fixa Marketplace R$', type: 'currency' },
      { key: 'installmentPercent', label: '% Parc. Sem Juros', type: 'percent' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'packagingCostValue', label: 'Custo Embalagem R$', type: 'currency' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'adsCostPercent', label: 'Custos Ads %', type: 'percent' },
      { key: 'price', label: 'Preço de Venda Shopee', type: 'currency' },
    ]
  }
};

// ===== ERROR TYPES =====
export interface ChannelValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ChannelsEditorError {
  type: 'validation' | 'api' | 'calculation' | 'network';
  message: string;
  details?: any;
  channelType?: ChannelType;
  field?: string;
}

// ===== API RESPONSE TYPES =====
export interface ChannelsApiResponse {
  success: boolean;
  data: ChannelData[];
  message?: string;
  error?: string;
}

export interface ProductApiResponse {
  success: boolean;
  data: Product;
  message?: string;
  error?: string;
}

// ===== EXPORT ALL TYPES =====
export type ChannelsFormSchemaType = z.infer<typeof channelsFormSchema>;
export type SiteProprioSchemaType = z.infer<typeof siteProprioSchema>;
export type AmazonFBMSchemaType = z.infer<typeof amazonFBMSchema>;
export type AmazonFBAOnSiteSchemaType = z.infer<typeof amazonFBAOnSiteSchema>;
export type AmazonFBAOffSiteSchemaType = z.infer<typeof amazonFBAOffSiteSchema>;
export type MercadoLivreSchemaType = z.infer<typeof mercadoLivreSchema>;
export type ShopeeSchemaType = z.infer<typeof shopeeSchema>;
