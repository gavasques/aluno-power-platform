/**
 * Pricing calculation utilities
 * Implements universal pricing formulas for all sales channels
 */

import {
  PricingProduct,
  ProductCosts,
  SalesChannel,
  PricingCalculation,
  ChannelType,
  ProductDimensions
} from '@/types/pricing';

/**
 * Calculate cubic weight based on dimensions
 * @param dimensions Product dimensions in cm
 * @param divisor Cubic weight divisor (default: 6000 for most carriers)
 */
export function calculateCubicWeight(dimensions: ProductDimensions, divisor: number = 6000): number {
  const volumeCm3 = dimensions.length * dimensions.width * dimensions.height;
  return volumeCm3 / divisor; // Convert to kg
}

/**
 * Get the billable weight (higher between actual and cubic weight)
 * @param actualWeight Actual weight in kg
 * @param cubicWeight Cubic weight in kg
 */
export function getBillableWeight(actualWeight: number, cubicWeight: number): number {
  return Math.max(actualWeight, cubicWeight);
}

/**
 * Calculate total cost including taxes
 * @param productCost Base product cost
 * @param taxPercent Tax percentage
 */
export function calculateTotalCost(productCost: number, taxPercent: number): number {
  const taxAmount = productCost * (taxPercent / 100);
  return productCost + taxAmount;
}

/**
 * Calculate commission value based on selling price
 * @param sellingPrice Selling price
 * @param commissionPercent Commission percentage
 */
export function calculateCommission(sellingPrice: number, commissionPercent: number): number {
  return sellingPrice * (commissionPercent / 100);
}

/**
 * Calculate advertising cost based on selling price
 * @param sellingPrice Selling price
 * @param advertisingPercent Advertising percentage
 */
export function calculateAdvertisingCost(sellingPrice: number, advertisingPercent: number): number {
  return sellingPrice * (advertisingPercent / 100);
}

/**
 * Calculate profit margin percentage
 * @param profit Net profit
 * @param sellingPrice Selling price
 */
export function calculateProfitMargin(profit: number, sellingPrice: number): number {
  if (sellingPrice === 0) return 0;
  return (profit / sellingPrice) * 100;
}

/**
 * Calculate markup percentage
 * @param sellingPrice Selling price
 * @param totalCost Total cost
 */
export function calculateMarkup(sellingPrice: number, totalCost: number): number {
  if (totalCost === 0) return 0;
  return ((sellingPrice - totalCost) / totalCost) * 100;
}

/**
 * Calculate ROI (Return on Investment)
 * @param profit Net profit
 * @param totalCost Total cost invested
 */
export function calculateROI(profit: number, totalCost: number): number {
  if (totalCost === 0) return 0;
  return (profit / totalCost) * 100;
}

/**
 * Perform complete pricing calculation for a channel
 * @param product Product with costs
 * @param channel Sales channel configuration
 */
export function calculateChannelPricing(
  product: PricingProduct,
  channel: SalesChannel
): PricingCalculation {
  // Base costs
  const productCost = product.costs.currentCost;
  const taxCost = productCost * (product.costs.taxPercent / 100);
  const totalCost = productCost + taxCost;
  
  // Channel fees
  const commissionValue = calculateCommission(channel.sellingPrice, channel.fees.commissionPercent);
  const fixedFees = channel.fees.fixedFee || 0;
  const shippingCost = channel.fees.shippingCost || 0;
  const fulfillmentCost = channel.fees.fulfillmentFee || 0;
  const advertisingCost = channel.fees.advertisingPercent 
    ? calculateAdvertisingCost(channel.sellingPrice, channel.fees.advertisingPercent)
    : 0;
  const otherFees = channel.fees.otherFees || 0;
  
  // Total channel costs
  const totalChannelCosts = commissionValue + fixedFees + shippingCost + 
                           fulfillmentCost + advertisingCost + otherFees;
  
  // Profit calculations
  const grossProfit = channel.sellingPrice - totalCost;
  const netProfit = channel.sellingPrice - totalCost - totalChannelCosts;
  
  // Performance metrics
  const profitMarginPercent = calculateProfitMargin(netProfit, channel.sellingPrice);
  const markupPercent = calculateMarkup(channel.sellingPrice, totalCost);
  const roi = calculateROI(netProfit, totalCost);
  
  // Indicators
  const isProfitable = netProfit > 0;
  const isCompetitive = channel.competitorPrice 
    ? channel.sellingPrice <= channel.competitorPrice * 1.1 // Within 10% of competitor
    : true;
  
  // Recommendations
  const recommendations: string[] = [];
  
  if (!isProfitable) {
    recommendations.push('⚠️ Produto com prejuízo - considere aumentar o preço ou reduzir custos');
  }
  
  if (profitMarginPercent < 15) {
    recommendations.push('📊 Margem baixa - ideal seria acima de 20%');
  }
  
  if (channel.competitorPrice && channel.sellingPrice > channel.competitorPrice * 1.2) {
    recommendations.push('💰 Preço 20% acima da concorrência - pode impactar vendas');
  }
  
  if (roi < 30) {
    recommendations.push('📈 ROI baixo - busque otimizar custos ou aumentar preço');
  }
  
  return {
    channelId: channel.id,
    channelType: channel.type,
    
    // Base values
    productCost,
    taxCost,
    totalCost,
    sellingPrice: channel.sellingPrice,
    
    // Channel costs
    commissionValue,
    fixedFees,
    shippingCost,
    fulfillmentCost,
    advertisingCost,
    totalChannelCosts,
    
    // Results
    grossProfit,
    netProfit,
    profitMarginPercent,
    markupPercent,
    roi,
    
    // Indicators
    isProfitable,
    isCompetitive,
    recommendations
  };
}

/**
 * Calculate suggested selling price based on desired margin
 * @param totalCost Total product cost (including taxes)
 * @param desiredMarginPercent Desired profit margin percentage
 * @param channelCommissionPercent Channel commission percentage
 */
export function calculateSuggestedPrice(
  totalCost: number,
  desiredMarginPercent: number,
  channelCommissionPercent: number = 0
): number {
  // Formula: Price = Cost / (1 - MarginPercent - CommissionPercent)
  const totalDeduction = (desiredMarginPercent + channelCommissionPercent) / 100;
  
  if (totalDeduction >= 1) {
    throw new Error('Margem + Comissão não pode ser 100% ou mais');
  }
  
  return totalCost / (1 - totalDeduction);
}

/**
 * Find the break-even price for a channel
 * @param totalCost Total product cost
 * @param channel Channel configuration
 */
export function calculateBreakEvenPrice(
  totalCost: number,
  channel: SalesChannel
): number {
  // Fixed costs that don't depend on price
  const fixedCosts = (channel.fees.fixedFee || 0) + 
                    (channel.fees.shippingCost || 0) + 
                    (channel.fees.fulfillmentFee || 0) +
                    (channel.fees.otherFees || 0);
  
  // Percentage-based costs
  const percentageCosts = (channel.fees.commissionPercent || 0) + 
                         (channel.fees.advertisingPercent || 0);
  
  // Break-even = (TotalCost + FixedCosts) / (1 - PercentageCosts/100)
  return (totalCost + fixedCosts) / (1 - percentageCosts / 100);
}

/**
 * Get pricing health status based on margin
 * @param marginPercent Profit margin percentage
 */
export function getPricingHealth(marginPercent: number): {
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'loss';
  color: string;
  icon: string;
} {
  if (marginPercent >= 30) {
    return { status: 'excellent', color: 'text-green-600', icon: '🎯' };
  } else if (marginPercent >= 20) {
    return { status: 'good', color: 'text-blue-600', icon: '✅' };
  } else if (marginPercent >= 10) {
    return { status: 'fair', color: 'text-yellow-600', icon: '⚠️' };
  } else if (marginPercent > 0) {
    return { status: 'poor', color: 'text-orange-600', icon: '⚡' };
  } else {
    return { status: 'loss', color: 'text-red-600', icon: '🚨' };
  }
}

/**
 * Format currency for Brazilian Real
 * @param value Numeric value
 */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Format percentage
 * @param value Numeric value
 * @param decimals Number of decimal places
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Compare two prices and return the difference
 * @param price1 First price
 * @param price2 Second price
 */
export function comparePrices(price1: number, price2: number): {
  difference: number;
  percentDiff: number;
  status: 'higher' | 'lower' | 'equal';
} {
  const difference = price1 - price2;
  const percentDiff = price2 !== 0 ? (difference / price2) * 100 : 0;
  
  return {
    difference,
    percentDiff,
    status: difference > 0 ? 'higher' : difference < 0 ? 'lower' : 'equal'
  };
}