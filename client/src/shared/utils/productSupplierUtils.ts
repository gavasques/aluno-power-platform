/**
 * Product Supplier Utilities
 * 
 * DRY Principles Applied:
 * - Centralized validation logic
 * - Reusable formatting functions
 * - Shared business rules
 * 
 * SOLID Principles Applied:
 * - SRP: Single responsibility for supplier utilities
 * - OCP: Open for extension with new utility functions
 * - DIP: Depends on abstractions, not concrete implementations
 */

import { ProductSupplier, ProductSupplierFormData } from '../types/productSupplier';

export class ProductSupplierUtils {
  /**
   * Validates supplier product code format
   */
  static validateSupplierCode(code: string): boolean {
    return code.trim().length >= 3 && code.trim().length <= 50;
  }

  /**
   * Validates supplier cost
   */
  static validateCost(cost: number): boolean {
    return cost > 0 && cost <= 999999.99;
  }

  /**
   * Validates lead time (in days)
   */
  static validateLeadTime(leadTime?: number): boolean {
    if (leadTime === undefined) return true;
    return leadTime >= 0 && leadTime <= 365;
  }

  /**
   * Validates minimum order quantity
   */
  static validateMinimumOrderQuantity(qty?: number): boolean {
    if (qty === undefined) return true;
    return qty >= 1 && qty <= 99999;
  }

  /**
   * Formats currency for display
   */
  static formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  /**
   * Formats lead time for display
   */
  static formatLeadTime(days?: number): string {
    if (!days) return 'Não informado';
    if (days === 1) return '1 dia';
    if (days < 7) return `${days} dias`;
    if (days < 30) return `${Math.floor(days / 7)} semanas`;
    return `${Math.floor(days / 30)} meses`;
  }

  /**
   * Calculates the best supplier based on cost and lead time
   */
  static findBestSupplier(suppliers: ProductSupplier[]): ProductSupplier | null {
    if (suppliers.length === 0) return null;

    // Primary supplier is always the best
    const primarySupplier = suppliers.find(s => s.isPrimary && s.active);
    if (primarySupplier) return primarySupplier;

    // Otherwise, find the one with lowest cost
    const activeSuppliers = suppliers.filter(s => s.active);
    if (activeSuppliers.length === 0) return null;

    return activeSuppliers.reduce((best, current) => 
      current.supplierCost < best.supplierCost ? current : best
    );
  }

  /**
   * Validates that only one supplier can be primary
   */
  static validatePrimaryUniqueness(
    suppliers: ProductSupplier[],
    newPrimarySupplierId?: number
  ): boolean {
    const primarySuppliers = suppliers.filter(s => 
      s.isPrimary && s.id !== newPrimarySupplierId
    );
    return primarySuppliers.length <= 1;
  }

  /**
   * Transforms form data to API format
   */
  static transformFormData(data: ProductSupplierFormData): Record<string, any> {
    return {
      supplierId: data.supplierId,
      supplierProductCode: data.supplierProductCode.trim(),
      supplierCost: data.supplierCost,
      isPrimary: data.isPrimary,
      leadTime: data.leadTime || null,
      minimumOrderQuantity: data.minimumOrderQuantity || null,
      notes: data.notes?.trim() || null,
      active: data.active,
    };
  }

  /**
   * Generates unique supplier code suggestion
   */
  static generateSupplierCodeSuggestion(
    productName: string,
    supplierName: string
  ): string {
    const cleanProductName = productName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const cleanSupplierName = supplierName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    const productPrefix = cleanProductName.substring(0, 3);
    const supplierPrefix = cleanSupplierName.substring(0, 3);
    const timestamp = Date.now().toString().slice(-4);
    
    return `${productPrefix}${supplierPrefix}${timestamp}`;
  }

  /**
   * Calculates average cost across all suppliers
   */
  static calculateAverageCost(suppliers: ProductSupplier[]): number {
    const activeSuppliers = suppliers.filter(s => s.active);
    if (activeSuppliers.length === 0) return 0;
    
    const totalCost = activeSuppliers.reduce((sum, s) => sum + s.supplierCost, 0);
    return totalCost / activeSuppliers.length;
  }

  /**
   * Finds cost variation percentage
   */
  static calculateCostVariation(suppliers: ProductSupplier[]): {
    min: number;
    max: number;
    variationPercent: number;
  } {
    const activeSuppliers = suppliers.filter(s => s.active);
    if (activeSuppliers.length === 0) return { min: 0, max: 0, variationPercent: 0 };
    
    const costs = activeSuppliers.map(s => s.supplierCost);
    const min = Math.min(...costs);
    const max = Math.max(...costs);
    const variationPercent = min > 0 ? ((max - min) / min) * 100 : 0;
    
    return { min, max, variationPercent };
  }
}