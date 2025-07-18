/**
 * Product Supplier Types
 * 
 * SOLID Principles Applied:
 * - SRP: Single responsibility for product supplier types
 * - OCP: Open for extension with new supplier properties
 * - LSP: Consistent type interface substitution
 * - ISP: Focused on supplier-specific types
 * - DIP: Depends on abstractions through interface definitions
 */

export interface ProductSupplier {
  id: number;
  productId: number;
  supplierId: number;
  supplierProductCode: string;
  supplierCost: number;
  isPrimary: boolean;
  leadTime?: number;
  minimumOrderQuantity?: number;
  notes?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  supplier?: {
    id: number;
    tradeName: string;
    corporateName: string;
    logo?: string;
    description?: string;
  };
}

export interface ProductSupplierFormData {
  supplierId: number;
  supplierProductCode: string;
  supplierCost: number;
  isPrimary: boolean;
  leadTime?: number;
  minimumOrderQuantity?: number;
  notes?: string;
  active: boolean;
}

export interface ProductSupplierUpdateData {
  supplierProductCode?: string;
  supplierCost?: number;
  isPrimary?: boolean;
  leadTime?: number;
  minimumOrderQuantity?: number;
  notes?: string;
  active?: boolean;
}

export interface ProductSupplierSummary {
  totalSuppliers: number;
  primarySupplier?: ProductSupplier;
  avgCost: number;
  avgLeadTime: number;
  activeSuppliers: number;
}

export interface ProductSupplierCreateRequest {
  productId: number;
  supplierId: number;
  supplierProductCode: string;
  supplierCost: number;
  isPrimary?: boolean;
  leadTime?: number;
  minimumOrderQuantity?: number;
  notes?: string;
  active?: boolean;
}

export interface ProductSupplierUpdateRequest {
  supplierProductCode?: string;
  supplierCost?: number;
  isPrimary?: boolean;
  leadTime?: number;
  minimumOrderQuantity?: number;
  notes?: string;
  active?: boolean;
}

export interface ProductSupplierApiResponse {
  success: boolean;
  message: string;
  data?: ProductSupplier;
}

export interface ProductSupplierListResponse {
  success: boolean;
  data: ProductSupplier[];
  total?: number;
}

export interface ProductSupplierFilters {
  active?: boolean;
  isPrimary?: boolean;
  minCost?: number;
  maxCost?: number;
  supplierId?: number;
}

export interface ProductSupplierSortOptions {
  field: 'supplierCost' | 'leadTime' | 'isPrimary' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

export interface ProductSupplierStats {
  totalSuppliers: number;
  primarySupplier?: ProductSupplier;
  lowestCost: number;
  highestCost: number;
  avgCost: number;
  avgLeadTime: number;
  activeSuppliers: number;
  inactiveSuppliers: number;
}

export interface ProductSupplierValidationError {
  field: string;
  message: string;
}

export interface ProductSupplierValidation {
  isValid: boolean;
  errors: ProductSupplierValidationError[];
}

export interface ProductSupplierBulkUpdateRequest {
  supplierIds: number[];
  updates: ProductSupplierUpdateData;
}

export interface ProductSupplierBulkDeleteRequest {
  supplierIds: number[];
}

export interface ProductSupplierImportData {
  supplierProductCode: string;
  supplierCost: number;
  supplierTradeName: string;
  isPrimary?: boolean;
  leadTime?: number;
  minimumOrderQuantity?: number;
  notes?: string;
}

export interface ProductSupplierExportData {
  supplierTradeName: string;
  supplierCorporateName: string;
  supplierProductCode: string;
  supplierCost: number;
  isPrimary: boolean;
  leadTime?: number;
  minimumOrderQuantity?: number;
  notes?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductSupplierHistory {
  id: number;
  productId: number;
  supplierId: number;
  action: 'created' | 'updated' | 'deleted' | 'set_primary';
  previousData?: Partial<ProductSupplier>;
  newData?: Partial<ProductSupplier>;
  changedBy: number;
  changedAt: Date;
}

export interface ProductSupplierNotification {
  id: number;
  productId: number;
  supplierId: number;
  type: 'cost_change' | 'lead_time_change' | 'primary_change' | 'status_change';
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface ProductSupplierConfig {
  allowMultiplePrimary: boolean;
  requireSupplierCode: boolean;
  allowNegativeCost: boolean;
  maxSuppliers: number;
  autoUpdateProductCost: boolean;
  notifyOnCostChange: boolean;
  notifyOnStatusChange: boolean;
}