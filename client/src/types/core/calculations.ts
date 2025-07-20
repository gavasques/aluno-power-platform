/**
 * Tipos para Cálculos e Operações - Centraliza tipos para operações matemáticas
 * e cálculos específicos do domínio de e-commerce
 */

import { Product } from './product';
import { SalesChannel, ChannelType } from './channel';
import { SimulationType } from './domain';

// ============================================================================
// TIPOS PARA CÁLCULOS DE PRECIFICAÇÃO
// ============================================================================

export interface PricingCalculation {
  productId: number;
  channelType: ChannelType;
  baseCost: number;
  totalCost: number;
  suggestedPrice: number;
  margin: number;
  markup: number;
  roi: number;
  breakEvenPrice: number;
  competitorAnalysis?: CompetitorPrice[];
}

export interface CompetitorPrice {
  competitor: string;
  price: number;
  difference: number;
  percentage: number;
}

export interface PricingBreakdown {
  costBreakdown: CostBreakdown;
  taxBreakdown: TaxBreakdown;
  commissionBreakdown: CommissionBreakdown;
  profitBreakdown: ProfitBreakdown;
}

export interface CostBreakdown {
  productCost: number;
  shippingCost: number;
  handlingCost: number;
  packagingCost: number;
  totalCost: number;
}

export interface TaxBreakdown {
  icms: number;
  pis: number;
  cofins: number;
  ipi: number;
  totalTaxes: number;
}

export interface CommissionBreakdown {
  marketplaceFee: number;
  paymentFee: number;
  advertisingFee: number;
  totalCommissions: number;
}

export interface ProfitBreakdown {
  grossProfit: number;
  netProfit: number;
  margin: number;
  markup: number;
}

// ============================================================================
// TIPOS PARA CÁLCULOS DE IMPORTAÇÃO
// ============================================================================

export interface ImportCalculation {
  simulationId: number;
  type: SimulationType;
  currency: 'USD' | 'EUR' | 'CNY';
  exchangeRate: number;
  totalFobValue: number;
  freightCost: number;
  insuranceCost: number;
  customsDuties: number;
  otherExpenses: number;
  totalCost: number;
  costPerUnit: number;
  suggestedPrice: number;
  profitMargin: number;
}

export interface ImportProduct {
  id: number;
  name: string;
  quantity: number;
  fobValue: number;
  weight: number;
  volume: number;
  customsValue: number;
  distributedCost: number;
  unitCost: number;
}

export interface FreightDistribution {
  method: 'weight' | 'value' | 'volume' | 'equal';
  totalWeight: number;
  totalValue: number;
  totalVolume: number;
  distribution: Record<number, number>; // productId -> distributedAmount
}

export interface CustomsCalculation {
  ncm: string;
  importTax: number;
  icms: number;
  pis: number;
  cofins: number;
  ipi: number;
  totalTaxes: number;
}

// ============================================================================
// TIPOS PARA CÁLCULOS DE SIMPLES NACIONAL
// ============================================================================

export interface SimplesNacionalCalculation {
  revenue: number;
  anexo: number;
  faixa: number;
  aliquota: number;
  deducao: number;
  impostoDevido: number;
  pis: number;
  cofins: number;
  icms: number;
  totalImpostos: number;
}

export interface SimplesNacionalFaixa {
  faixa: number;
  receitaInicial: number;
  receitaFinal: number;
  aliquota: number;
  deducao: number;
}

export interface SimplesNacionalAnexo {
  anexo: number;
  descricao: string;
  faixas: SimplesNacionalFaixa[];
}

// ============================================================================
// TIPOS PARA CÁLCULOS DE INVESTIMENTO
// ============================================================================

export interface InvestmentCalculation {
  initialInvestment: number;
  monthlyInvestment: number;
  period: number; // em meses
  expectedReturn: number; // percentual anual
  inflationRate: number;
  totalInvested: number;
  totalReturn: number;
  adjustedReturn: number;
  roi: number;
  projections: InvestmentProjection[];
}

export interface InvestmentProjection {
  month: number;
  invested: number;
  return: number;
  total: number;
  adjustedTotal: number;
}

export interface InvestmentScenario {
  name: string;
  initialInvestment: number;
  monthlyInvestment: number;
  expectedReturn: number;
  totalReturn: number;
  roi: number;
}

// ============================================================================
// TIPOS PARA CÁLCULOS DE ESTATÍSTICAS
// ============================================================================

export interface SalesStatistics {
  period: {
    start: Date;
    end: Date;
  };
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  conversionRate: number;
  topProducts: TopProduct[];
  salesByChannel: SalesByChannel[];
  salesByPeriod: SalesByPeriod[];
}

export interface TopProduct {
  productId: number;
  productName: string;
  quantity: number;
  revenue: number;
  percentage: number;
}

export interface SalesByChannel {
  channel: ChannelType;
  sales: number;
  revenue: number;
  percentage: number;
}

export interface SalesByPeriod {
  period: string;
  sales: number;
  revenue: number;
  orders: number;
}

export interface ProfitabilityAnalysis {
  grossProfit: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
  costBreakdown: CostBreakdown;
  revenueBreakdown: RevenueBreakdown;
  profitTrend: ProfitTrend[];
}

export interface RevenueBreakdown {
  productSales: number;
  shippingRevenue: number;
  otherRevenue: number;
  totalRevenue: number;
}

export interface ProfitTrend {
  period: string;
  revenue: number;
  costs: number;
  profit: number;
  margin: number;
}

// ============================================================================
// TIPOS PARA CÁLCULOS DE PERFORMANCE
// ============================================================================

export interface PerformanceMetrics {
  productId: number;
  views: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number; // Click Through Rate
  cvr: number; // Conversion Rate
  cpc: number; // Cost Per Click
  cpa: number; // Cost Per Acquisition
  roas: number; // Return on Ad Spend
  acos: number; // Advertising Cost of Sales
}

export interface ChannelPerformance {
  channel: ChannelType;
  metrics: PerformanceMetrics;
  comparison: PerformanceComparison;
  recommendations: string[];
}

export interface PerformanceComparison {
  previousPeriod: PerformanceMetrics;
  currentPeriod: PerformanceMetrics;
  change: {
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
    ctr: number;
    cvr: number;
    cpc: number;
    cpa: number;
    roas: number;
    acos: number;
  };
}

// ============================================================================
// TIPOS PARA CÁLCULOS DE INVENTÁRIO
// ============================================================================

export interface InventoryCalculation {
  productId: number;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  reorderPoint: number;
  safetyStock: number;
  leadTime: number; // em dias
  demandForecast: number;
  suggestedOrder: number;
  stockoutRisk: number;
  holdingCost: number;
  stockoutCost: number;
  totalCost: number;
}

export interface InventoryOptimization {
  productId: number;
  currentPolicy: InventoryPolicy;
  suggestedPolicy: InventoryPolicy;
  savings: number;
  riskReduction: number;
}

export interface InventoryPolicy {
  reorderPoint: number;
  orderQuantity: number;
  safetyStock: number;
  reviewPeriod: number;
}

// ============================================================================
// TIPOS PARA CÁLCULOS DE LOGÍSTICA
// ============================================================================

export interface ShippingCalculation {
  origin: Address;
  destination: Address;
  package: Package;
  options: ShippingOption[];
  selectedOption: ShippingOption;
  cost: number;
  deliveryTime: number; // em dias
  tracking: boolean;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Package {
  weight: number;
  length: number;
  width: number;
  height: number;
  declaredValue: number;
}

export interface ShippingOption {
  carrier: string;
  service: string;
  cost: number;
  deliveryTime: number;
  tracking: boolean;
  insurance: number;
}

// ============================================================================
// TIPOS PARA CÁLCULOS DE DESCONTOS
// ============================================================================

export interface DiscountCalculation {
  originalPrice: number;
  discountType: DiscountType;
  discountValue: number;
  finalPrice: number;
  savings: number;
  percentage: number;
}

export type DiscountType = 'percentage' | 'fixed' | 'buy_x_get_y' | 'bundle';

export interface BulkDiscount {
  quantity: number;
  discountPercentage: number;
  discountAmount: number;
}

export interface PromotionalDiscount {
  code: string;
  type: DiscountType;
  value: number;
  minimumOrder: number;
  maximumDiscount: number;
  validFrom: Date;
  validTo: Date;
  usageLimit: number;
  usedCount: number;
}

// ============================================================================
// TIPOS PARA CÁLCULOS DE TRIBUTAÇÃO
// ============================================================================

export interface TaxCalculation {
  baseValue: number;
  taxes: TaxDetail[];
  totalTax: number;
  finalValue: number;
}

export interface TaxDetail {
  name: string;
  rate: number;
  amount: number;
  base: number;
}

export interface ICMSCalculation {
  state: string;
  origin: string;
  destination: string;
  rate: number;
  base: number;
  amount: number;
  st: number; // Substituição Tributária
}

export interface PISCOFINSCalculation {
  pisRate: number;
  cofinsRate: number;
  base: number;
  pisAmount: number;
  cofinsAmount: number;
  totalAmount: number;
}

// ============================================================================
// TIPOS PARA CÁLCULOS DE CUSTOS
// ============================================================================

export interface CostAnalysis {
  productId: number;
  directCosts: DirectCost[];
  indirectCosts: IndirectCost[];
  totalCost: number;
  costPerUnit: number;
  costBreakdown: CostBreakdown;
}

export interface DirectCost {
  category: string;
  amount: number;
  percentage: number;
  description: string;
}

export interface IndirectCost {
  category: string;
  amount: number;
  allocationMethod: 'proportional' | 'equal' | 'manual';
  allocatedAmount: number;
  description: string;
}

export interface CostAllocation {
  method: 'weight' | 'value' | 'volume' | 'equal' | 'manual';
  totalCost: number;
  allocations: Record<number, number>; // productId -> allocatedAmount
}

// ============================================================================
// TIPOS PARA CÁLCULOS DE MARGEM
// ============================================================================

export interface MarginCalculation {
  cost: number;
  price: number;
  grossMargin: number;
  netMargin: number;
  markup: number;
  profit: number;
}

export interface MarginAnalysis {
  productId: number;
  currentMargin: number;
  targetMargin: number;
  suggestedPrice: number;
  priceAdjustment: number;
  impact: MarginImpact;
}

export interface MarginImpact {
  revenueChange: number;
  profitChange: number;
  volumeImpact: number;
  marketPosition: 'competitive' | 'premium' | 'budget';
}

// ============================================================================
// TIPOS UTILITÁRIOS PARA CÁLCULOS
// ============================================================================

export interface CalculationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
  metadata?: Record<string, any>;
}

export interface CalculationOptions {
  precision?: number;
  currency?: string;
  includeTaxes?: boolean;
  includeShipping?: boolean;
  includeCommissions?: boolean;
  roundTo?: number;
}

export type CalculationFunction<T, R> = (data: T, options?: CalculationOptions) => CalculationResult<R>;

export interface CalculationCache {
  key: string;
  data: any;
  timestamp: number;
  ttl: number; // Time to live em milissegundos
}

// ============================================================================
// TIPOS PARA VALIDAÇÃO DE CÁLCULOS
// ============================================================================

export interface CalculationValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface CalculationRule {
  name: string;
  condition: (data: any) => boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export type ValidationRuleFunction<T> = (data: T) => CalculationValidation; 