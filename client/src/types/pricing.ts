/**
 * Types and interfaces for product pricing functionality
 * Compatible with existing product structure while adding pricing-specific features
 */

/**
 * Product dimensions in centimeters
 */
export interface ProductDimensions {
  length: number; // comprimento em cm
  width: number;  // largura em cm
  height: number; // altura em cm
}

/**
 * Cost history entry for tracking price changes over time
 */
export interface CostHistoryEntry {
  id: string;
  productCost: number;
  taxPercent: number;
  totalCost: number;
  updatedAt: Date;
  updatedBy: string;
  observations?: string;
}

/**
 * Product costs configuration and history
 */
export interface ProductCosts {
  currentCost: number;      // Custo atual do produto
  taxPercent: number;       // Percentual de impostos
  totalCost: number;        // Custo total (produto + impostos)
  lastUpdated: Date;        // Data da última atualização
  history: CostHistoryEntry[]; // Histórico de alterações
  observations?: string;    // Observações sobre custos
}

/**
 * Sales channel types supported by the system
 */
export enum ChannelType {
  // Site Próprio
  SITE_PROPRIO = 'SITE_PROPRIO',
  
  // Amazon
  AMAZON_FBM = 'AMAZON_FBM',
  AMAZON_FBA_ON_SITE = 'AMAZON_FBA_ON_SITE',
  AMAZON_DBA = 'AMAZON_DBA',
  AMAZON_FBA = 'AMAZON_FBA',
  
  // Mercado Livre
  ML_ME1 = 'ML_ME1',
  ML_FLEX = 'ML_FLEX',
  ML_ENVIOS = 'ML_ENVIOS',
  ML_FULL = 'ML_FULL',
  
  // Shopee
  SHOPEE = 'SHOPEE',
  
  // Generic channels for extensibility
  MARKETPLACE_OTHER = 'MARKETPLACE_OTHER'
}

/**
 * Channel-specific fee structure
 */
export interface ChannelFees {
  commissionPercent: number;     // Comissão do marketplace (%)
  fixedFee?: number;            // Taxa fixa por venda
  shippingCost?: number;        // Custo de envio
  fulfillmentFee?: number;      // Taxa de fulfillment (FBA, FULL, etc)
  advertisingPercent?: number;  // Percentual de publicidade
  otherFees?: number;          // Outras taxas
}

/**
 * Sales channel configuration
 */
export interface SalesChannel {
  id: string;
  type: ChannelType;
  name: string;                 // Nome amigável do canal
  enabled: boolean;             // Canal ativo/inativo
  sellingPrice: number;         // Preço de venda neste canal
  fees: ChannelFees;           // Taxas do canal
  minPrice?: number;           // Preço mínimo permitido
  maxPrice?: number;           // Preço máximo permitido
  competitorPrice?: number;    // Preço da concorrência
  notes?: string;              // Observações do canal
}

/**
 * Pricing calculation results for a specific channel
 */
export interface PricingCalculation {
  channelId: string;
  channelType: ChannelType;
  
  // Valores base
  productCost: number;
  totalCost: number;
  sellingPrice: number;
  
  // Taxas e custos do canal
  commissionValue: number;
  fixedFees: number;
  shippingCost: number;
  fulfillmentCost: number;
  advertisingCost: number;
  totalChannelCosts: number;
  
  // Resultados
  grossProfit: number;         // Lucro bruto
  netProfit: number;          // Lucro líquido
  profitMarginPercent: number; // Margem de lucro (%)
  markupPercent: number;       // Markup (%)
  roi: number;                // ROI - Return on Investment (%)
  
  // Indicadores
  isProfitable: boolean;      // Se é lucrativo
  isCompetitive: boolean;     // Se está competitivo
  recommendations?: string[]; // Recomendações de ajuste
}

/**
 * Product with complete pricing information
 */
export interface PricingProduct {
  // Identificação
  id: string;
  sku?: string;
  
  // Dados básicos
  name: string;
  photo?: string;              // URL da foto (max 3MB)
  ean?: string;                // Código de barras
  brand?: string;              // Marca
  
  // Categorização
  categoryId: string;
  categoryName?: string;
  supplierId: string;
  supplierName?: string;
  ncm?: string;                // Nomenclatura Comum do Mercosul
  
  // Dimensões e peso
  dimensions: ProductDimensions;
  weight: number;              // Peso real em kg
  calculatedWeight: number;    // Peso cubado ou real (o maior)
  
  // Custos
  costs: ProductCosts;
  
  // Canais de venda
  channels: SalesChannel[];
  
  // Cálculos
  calculations?: PricingCalculation[]; // Resultados por canal
  
  // Metadados
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
}

/**
 * Pricing configuration for bulk operations
 */
export interface PricingConfig {
  defaultTaxPercent: number;           // Imposto padrão
  defaultProfitMarginPercent: number;  // Margem padrão
  cubicWeightDivisor: number;          // Divisor para peso cubado (ex: 6000)
  minAcceptableMargin: number;         // Margem mínima aceitável
  
  // Configurações por canal
  channelDefaults: {
    [key in ChannelType]?: {
      commissionPercent: number;
      enabled: boolean;
    };
  };
}

/**
 * Filters for product pricing list
 */
export interface PricingFilters {
  search?: string;
  categoryIds?: string[];
  supplierIds?: string[];
  channelTypes?: ChannelType[];
  profitableOnly?: boolean;
  activeOnly?: boolean;
  priceRange?: {
    min: number;
    max: number;
  };
  marginRange?: {
    min: number;
    max: number;
  };
}

/**
 * Summary statistics for pricing dashboard
 */
export interface PricingSummary {
  totalProducts: number;
  activeProducts: number;
  averageMargin: number;
  profitableProducts: number;
  
  channelStats: {
    channelType: ChannelType;
    productCount: number;
    averageMargin: number;
    totalRevenue: number;
  }[];
  
  alertCount: number; // Produtos com margem baixa ou prejuízo
}