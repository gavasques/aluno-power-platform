/**
 * Unified Calculations - Consolidated mathematical functions
 * This file consolidates all duplicate calculation logic across the codebase
 * following the DRY principle.
 */

/**
 * Calculate CBM (Cubic Meter) from dimensions
 * Used in formal import calculations and product management
 * @param length - Length in cm
 * @param width - Width in cm  
 * @param height - Height in cm
 * @returns CBM value in cubic meters
 */
export function calculateCBM(length: number, width: number, height: number): number {
  return (length * width * height) / 1000000;
}

/**
 * Calculate cubic weight from dimensions
 * Used for shipping calculations (standard factor: 6000)
 * @param length - Length in cm
 * @param width - Width in cm  
 * @param height - Height in cm
 * @param factor - Cubic weight factor (default: 6000)
 * @returns Cubic weight in kg
 */
export function calculateCubicWeight(
  length: number, 
  width: number, 
  height: number, 
  factor: number = 6000
): number {
  return (length * width * height) / factor;
}

/**
 * Calculate billable weight (greater of actual weight vs cubic weight)
 * @param actualWeight - Actual weight in kg
 * @param length - Length in cm
 * @param width - Width in cm  
 * @param height - Height in cm
 * @param factor - Cubic weight factor (default: 6000)
 * @returns Billable weight in kg
 */
export function calculateBillableWeight(
  actualWeight: number,
  length: number, 
  width: number, 
  height: number, 
  factor: number = 6000
): number {
  const cubicWeight = calculateCubicWeight(length, width, height, factor);
  return Math.max(actualWeight, cubicWeight);
}

/**
 * Convert USD to BRL
 * @param usdValue - Value in USD
 * @param exchangeRate - USD to BRL exchange rate
 * @returns Value in BRL
 */
export function convertUSDToBRL(usdValue: number, exchangeRate: number): number {
  return usdValue * exchangeRate;
}

/**
 * Convert BRL to USD
 * @param brlValue - Value in BRL
 * @param exchangeRate - USD to BRL exchange rate
 * @returns Value in USD
 */
export function convertBRLToUSD(brlValue: number, exchangeRate: number): number {
  return brlValue / exchangeRate;
}

/**
 * Calculate percentage of a value
 * @param value - Base value
 * @param percentage - Percentage (as decimal, e.g., 0.15 for 15%)
 * @returns Calculated percentage amount
 */
export function calculatePercentage(value: number, percentage: number): number {
  return value * percentage;
}

/**
 * Calculate percentage between two values
 * @param value - Current value
 * @param total - Total value
 * @returns Percentage as decimal (e.g., 0.15 for 15%)
 */
export function calculatePercentageOf(value: number, total: number): number {
  if (total === 0) return 0;
  return value / total;
}

/**
 * Calculate compound interest
 * @param principal - Initial amount
 * @param rate - Interest rate per period (as decimal)
 * @param periods - Number of periods
 * @returns Final amount after compound interest
 */
export function calculateCompoundInterest(
  principal: number, 
  rate: number, 
  periods: number
): number {
  return principal * Math.pow(1 + rate, periods);
}

/**
 * Calculate simple interest
 * @param principal - Initial amount
 * @param rate - Interest rate (as decimal)
 * @param time - Time period
 * @returns Interest amount
 */
export function calculateSimpleInterest(
  principal: number, 
  rate: number, 
  time: number
): number {
  return principal * rate * time;
}

/**
 * Calculate ROI (Return on Investment)
 * @param gain - Gain from investment
 * @param cost - Cost of investment
 * @returns ROI as decimal (e.g., 0.25 for 25%)
 */
export function calculateROI(gain: number, cost: number): number {
  if (cost === 0) return 0;
  return (gain - cost) / cost;
}

/**
 * Calculate weighted average
 * @param values - Array of values
 * @param weights - Array of weights (same length as values)
 * @returns Weighted average
 */
export function calculateWeightedAverage(values: number[], weights: number[]): number {
  if (values.length !== weights.length) {
    throw new Error('Values and weights arrays must have the same length');
  }
  
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  if (totalWeight === 0) return 0;
  
  const weightedSum = values.reduce((sum, value, index) => {
    return sum + (value * weights[index]);
  }, 0);
  
  return weightedSum / totalWeight;
}

/**
 * Calculate margin from cost and selling price
 * @param cost - Cost price
 * @param sellingPrice - Selling price
 * @returns Margin as decimal (e.g., 0.25 for 25%)
 */
export function calculateMargin(cost: number, sellingPrice: number): number {
  if (sellingPrice === 0) return 0;
  return (sellingPrice - cost) / sellingPrice;
}

/**
 * Calculate markup from cost and selling price
 * @param cost - Cost price
 * @param sellingPrice - Selling price
 * @returns Markup as decimal (e.g., 0.33 for 33%)
 */
export function calculateMarkup(cost: number, sellingPrice: number): number {
  if (cost === 0) return 0;
  return (sellingPrice - cost) / cost;
}

/**
 * Calculate selling price from cost and desired margin
 * @param cost - Cost price
 * @param marginPercentage - Desired margin as decimal (e.g., 0.25 for 25%)
 * @returns Selling price
 */
export function calculateSellingPriceFromMargin(cost: number, marginPercentage: number): number {
  return cost / (1 - marginPercentage);
}

/**
 * Calculate selling price from cost and desired markup
 * @param cost - Cost price
 * @param markupPercentage - Desired markup as decimal (e.g., 0.33 for 33%)
 * @returns Selling price
 */
export function calculateSellingPriceFromMarkup(cost: number, markupPercentage: number): number {
  return cost * (1 + markupPercentage);
}

/**
 * Calculate total with tax
 * @param subtotal - Subtotal amount
 * @param taxRate - Tax rate as decimal (e.g., 0.18 for 18%)
 * @returns Total including tax
 */
export function calculateTotalWithTax(subtotal: number, taxRate: number): number {
  return subtotal * (1 + taxRate);
}

/**
 * Calculate tax amount from total
 * @param total - Total amount including tax
 * @param taxRate - Tax rate as decimal (e.g., 0.18 for 18%)
 * @returns Tax amount
 */
export function calculateTaxFromTotal(total: number, taxRate: number): number {
  return total * (taxRate / (1 + taxRate));
}

/**
 * Calculate subtotal from total with tax
 * @param total - Total amount including tax
 * @param taxRate - Tax rate as decimal (e.g., 0.18 for 18%)
 * @returns Subtotal without tax
 */
export function calculateSubtotalFromTotal(total: number, taxRate: number): number {
  return total / (1 + taxRate);
}

/**
 * Calculate discount amount
 * @param originalPrice - Original price
 * @param discountPercentage - Discount percentage as decimal (e.g., 0.15 for 15%)
 * @returns Discount amount
 */
export function calculateDiscountAmount(originalPrice: number, discountPercentage: number): number {
  return originalPrice * discountPercentage;
}

/**
 * Calculate final price after discount
 * @param originalPrice - Original price
 * @param discountPercentage - Discount percentage as decimal (e.g., 0.15 for 15%)
 * @returns Final price after discount
 */
export function calculateFinalPrice(originalPrice: number, discountPercentage: number): number {
  return originalPrice * (1 - discountPercentage);
}

/**
 * Calculate shipping cost based on weight and distance
 * @param weight - Weight in kg
 * @param distance - Distance in km
 * @param ratePerKgKm - Rate per kg per km
 * @param minimumCost - Minimum shipping cost
 * @returns Shipping cost
 */
export function calculateShippingCost(
  weight: number, 
  distance: number, 
  ratePerKgKm: number, 
  minimumCost: number = 0
): number {
  const calculatedCost = weight * distance * ratePerKgKm;
  return Math.max(calculatedCost, minimumCost);
}

/**
 * Round to specified decimal places
 * @param value - Value to round
 * @param decimals - Number of decimal places
 * @returns Rounded value
 */
export function roundToDecimals(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Clamp value between min and max
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate average of an array of numbers
 * @param values - Array of numbers
 * @returns Average value
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calculate standard deviation
 * @param values - Array of numbers
 * @returns Standard deviation
 */
export function calculateStandardDeviation(values: number[]): number {
  if (values.length <= 1) return 0;
  
  const avg = calculateAverage(values);
  const squaredDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquaredDiff = calculateAverage(squaredDiffs);
  
  return Math.sqrt(avgSquaredDiff);
}