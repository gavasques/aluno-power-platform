/**
 * Channel Calculations Utility
 * Advanced commission and cost calculation engine based on Excel specifications
 * Following Single Responsibility and DRY principles
 */

import { SalesChannel, ChannelCalculationResult, ChannelCostData } from '../types/channels';

/**
 * Calculate commission with advanced tiered structure
 * Supports: flat rate, tiered rates, min/max limits
 */
export function calculateCommission(
  price: number,
  data: ChannelCostData
): number {
  const {
    commissionPercent = 0,
    commissionUpToValue,
    commissionAboveValue,
    commissionMinValue,
    commissionMaxValue
  } = data;

  let commission = 0;

  // Tiered commission calculation
  if (commissionUpToValue && commissionAboveValue) {
    if (price <= commissionUpToValue) {
      commission = price * (commissionPercent / 100);
    } else {
      // Up to threshold + above threshold
      const upToPortion = commissionUpToValue * (commissionPercent / 100);
      const abovePortion = (price - commissionUpToValue) * (commissionAboveValue / 100);
      commission = upToPortion + abovePortion;
    }
  } else {
    // Flat commission rate
    commission = price * (commissionPercent / 100);
  }

  // Apply min/max limits
  if (commissionMinValue && commission < commissionMinValue) {
    commission = commissionMinValue;
  }
  if (commissionMaxValue && commission > commissionMaxValue) {
    commission = commissionMaxValue;
  }

  return commission;
}

/**
 * Calculate percentage-based cost
 */
export function calculatePercentageCost(
  baseValue: number,
  percentage: number
): number {
  return baseValue * (percentage / 100);
}

/**
 * Validate channel data completeness
 */
export function validateChannelData(
  channel: SalesChannel,
  productCost: number,
  taxPercent: number
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const { data } = channel;

  // Basic validations
  if (!data.price || data.price <= 0) {
    errors.push('Preço deve ser maior que zero');
  }

  if (productCost <= 0) {
    errors.push('Custo do produto deve ser maior que zero');
  }

  if (taxPercent < 0 || taxPercent > 100) {
    errors.push('Taxa de imposto deve estar entre 0% e 100%');
  }

  // Channel-specific validations
  if (data.commissionPercent && (data.commissionPercent < 0 || data.commissionPercent > 50)) {
    errors.push('Comissão deve estar entre 0% e 50%');
  }

  if (data.packagingCostValue < 0) {
    errors.push('Custo de embalagem não pode ser negativo');
  }

  if (data.fixedCostPercent < 0 || data.fixedCostPercent > 20) {
    errors.push('Custo fixo deve estar entre 0% e 20%');
  }

  if (data.marketingCostPercent < 0 || data.marketingCostPercent > 30) {
    errors.push('Custo de marketing deve estar entre 0% e 30%');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Main calculation engine for channel profitability
 * Comprehensive calculation following Excel structure
 */
export function calculateChannelProfitability(
  channel: SalesChannel,
  productCost: number,
  taxPercent: number
): ChannelCalculationResult {
  const { type, data } = channel;
  
  // Validate inputs
  const validation = validateChannelData(channel, productCost, taxPercent);
  if (!validation.isValid) {
    return {
      channelType: type,
      grossRevenue: 0,
      netRevenue: 0,
      productCost: 0,
      taxCost: 0,
      commissionCost: 0,
      packagingCost: 0,
      fixedCost: 0,
      marketingCost: 0,
      financialCost: 0,
      shippingCost: 0,
      prepCenterCost: 0,
      totalCosts: 0,
      rebateIncome: 0,
      grossProfit: 0,
      netProfit: 0,
      marginPercent: 0,
      roiPercent: 0,
      isValid: false,
      errors: validation.errors
    };
  }

  // Revenue calculation
  const grossRevenue = data.price;
  const rebateIncome = data.rebateValue || 0;
  const netRevenue = grossRevenue + rebateIncome; // Rebate is income, not cost

  // Cost calculations
  const taxCost = calculatePercentageCost(productCost, taxPercent);
  const commissionCost = calculateCommission(grossRevenue, data);
  const packagingCost = data.packagingCostValue || 0;
  const fixedCost = calculatePercentageCost(grossRevenue, data.fixedCostPercent || 0);
  const marketingCost = calculatePercentageCost(grossRevenue, data.marketingCostPercent || 0);
  const financialCost = calculatePercentageCost(grossRevenue, data.financialCostPercent || 0);
  const shippingCost = data.shippingCostValue || 0;
  const prepCenterCost = data.prepCenterCostValue || 0;

  // Total costs
  const totalCosts = productCost + taxCost + commissionCost + packagingCost + 
                    fixedCost + marketingCost + financialCost + shippingCost + prepCenterCost;

  // Profitability
  const grossProfit = grossRevenue - totalCosts;
  const netProfit = netRevenue - totalCosts; // Including rebate income
  const marginPercent = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;
  const roiPercent = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;

  return {
    channelType: type,
    grossRevenue,
    netRevenue,
    productCost,
    taxCost,
    commissionCost,
    packagingCost,
    fixedCost,
    marketingCost,
    financialCost,
    shippingCost,
    prepCenterCost,
    totalCosts,
    rebateIncome,
    grossProfit,
    netProfit,
    marginPercent,
    roiPercent,
    isValid: true,
    errors: []
  };
}

/**
 * Calculate profitability for all active channels
 */
export function calculateAllChannels(
  channels: SalesChannel[],
  productCost: number,
  taxPercent: number
): Record<string, ChannelCalculationResult> {
  const results: Record<string, ChannelCalculationResult> = {};

  channels.forEach(channel => {
    if (channel.isActive) {
      results[channel.type] = calculateChannelProfitability(channel, productCost, taxPercent);
    }
  });

  return results;
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Get profitability status color
 */
export function getProfitabilityColor(marginPercent: number): string {
  if (marginPercent >= 30) return 'text-green-600';
  if (marginPercent >= 15) return 'text-yellow-600';
  if (marginPercent >= 0) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Get profitability status text
 */
export function getProfitabilityStatus(marginPercent: number): string {
  if (marginPercent >= 30) return 'Excelente';
  if (marginPercent >= 15) return 'Boa';
  if (marginPercent >= 0) return 'Baixa';
  return 'Prejuízo';
}