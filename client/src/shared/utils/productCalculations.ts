import type { CostCalculation } from "@/shared/types/product";
import { MARGIN_SUGGESTIONS } from "@/shared/constants/product";

/**
 * Product cost calculation utilities
 * Pure functions following KISS principle
 */

export function calculateTotalCost(costItem: number, taxPercent: number, packCost: number = 0): number {
  const baseWithTax = costItem * (1 + taxPercent / 100);
  return baseWithTax + packCost;
}

export function calculatePriceWithMargin(totalCost: number, marginPercent: number): number {
  return totalCost / (1 - marginPercent / 100);
}

export function getFullCostCalculation(
  costItem: number, 
  taxPercent: number, 
  packCost: number = 0
): CostCalculation {
  const baseWithTax = costItem * (1 + taxPercent / 100);
  const totalCost = baseWithTax + packCost;
  
  const suggestedPrices = MARGIN_SUGGESTIONS.reduce((acc, margin) => {
    acc[`margin${margin}` as keyof typeof acc] = calculatePriceWithMargin(totalCost, margin);
    return acc;
  }, {} as CostCalculation['suggestedPrices']);

  return {
    baseWithTax,
    totalCost,
    suggestedPrices,
  };
}

export function getActiveChannels(product: any): any[] {
  if (!product?.channels) return [];
  return product.channels.filter((channel: any) => channel.isActive);
}