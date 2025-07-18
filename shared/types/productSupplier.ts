/**
 * Product Supplier Types
 * 
 * Type definitions for product supplier management system
 * Following SOLID principles with clear interface segregation
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

export interface ProductSupplierStats {
  totalSuppliers: number;
  activeSuppliers: number;
  inactiveSuppliers: number;
  primarySupplier?: ProductSupplier;
  avgCost: number;
  lowestCost: number;
  highestCost: number;
  avgLeadTime: number;
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

export interface SupplierOption {
  id: number;
  tradeName: string;
  corporateName: string;
  logo?: string;
  description?: string;
  active: boolean;
}

export interface ProductSupplierMutationData {
  supplierId: number;
  supplierProductCode: string;
  supplierCost: number;
  isPrimary?: boolean;
  leadTime?: number;
  minimumOrderQuantity?: number;
  notes?: string;
  active?: boolean;
}

export interface ProductSupplierResponse {
  success: boolean;
  message?: string;
  data?: ProductSupplier | ProductSupplier[];
}

export interface ProductSupplierStatsResponse {
  success: boolean;
  message?: string;
  data?: ProductSupplierStats;
}

export interface ProductSupplierMutationResponse {
  success: boolean;
  message?: string;
  data?: ProductSupplier;
  errors?: any[];
}

export interface ProductSupplierDeleteResponse {
  success: boolean;
  message?: string;
}

export interface ProductSupplierListProps {
  suppliers: ProductSupplier[];
  onEdit: (supplier: ProductSupplier) => void;
  onDelete: (supplierId: number) => void;
  onSetPrimary: (supplierId: number) => void;
  onSelectionChange: (supplierIds: number[]) => void;
  isDeleting?: boolean;
  isSettingPrimary?: boolean;
  selectedSuppliers?: number[];
}

export interface ProductSupplierFormProps {
  productId: number;
  supplier?: ProductSupplier | null;
  onSuccess: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

export interface ProductSupplierManagerProps {
  productId: number;
  productName: string;
  onSupplierChange?: (suppliers: ProductSupplier[]) => void;
}

export interface ProductSupplierStatsProps {
  stats: ProductSupplierStats;
  productId: number;
}

export interface UseProductSuppliersReturn {
  // Data
  suppliers: ProductSupplier[];
  supplierStats: ProductSupplierStats;
  
  // Loading states
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // Mutation states
  isAdding: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isSettingPrimary: boolean;
  
  // Actions
  addSupplier: (data: ProductSupplierFormData) => Promise<void>;
  updateSupplier: (id: number, data: Partial<ProductSupplierFormData>) => Promise<void>;
  deleteSupplier: (id: number) => Promise<void>;
  setPrimarySupplier: (id: number) => Promise<void>;
  hasSupplier: (supplierId: number) => boolean;
  refetch: () => void;
}

export interface UseSupplierSelectionReturn {
  suppliers: SupplierOption[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  getSupplierById: (id: number) => SupplierOption | null;
  refetch: () => void;
}