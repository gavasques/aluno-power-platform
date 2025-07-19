/**
 * Tipos Unificados de Produtos - Feature Products
 * Centraliza todos os tipos relacionados a produtos em um local organizado
 * 
 * Re-exporta tipos do core e adiciona tipos específicos da feature
 */

// Re-export core types
export type {
  BaseProduct,
  Product,
  InsertProduct,
  ProductFormData,
  ProductListItem,
  ProductDimensions,
  ProductDescriptions,
  CostCalculation,
  ProductEditMode,
} from '@/types/core/product';

// Tipos específicos da feature de produtos

/**
 * Filtros para busca de produtos
 */
export interface ProductFilters {
  search?: string;
  brand?: string;
  category?: string;
  active?: boolean;
  supplierId?: number;
  hasPhoto?: boolean;
  hasPrice?: boolean;
  priceMin?: number;
  priceMax?: number;
  createdFrom?: string;
  createdTo?: string;
}

/**
 * Dados para importação de produtos
 */
export interface ProductImportData {
  name: string;
  sku?: string;
  ean?: string;
  brand?: string;
  category?: string;
  description?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  costPrice?: number;
  suggestedPrice?: number;
  active?: boolean;
}

/**
 * Resultado da importação
 */
export interface ProductImportResult {
  success: number;
  errors: Array<{
    row: number;
    message: string;
    data?: Partial<ProductImportData>;
  }>;
  warnings?: Array<{
    row: number;
    message: string;
    data?: Partial<ProductImportData>;
  }>;
}

/**
 * Estatísticas de produtos
 */
export interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  withoutPhoto: number;
  withoutPrice: number;
  byBrand: Record<string, number>;
  byCategory: Record<string, number>;
  avgCostPrice: number;
  avgSuggestedPrice: number;
  totalValue: number;
}

/**
 * Configurações de visualização da lista de produtos
 */
export interface ProductListSettings {
  itemsPerPage: number;
  sortBy: keyof Product;
  sortOrder: 'asc' | 'desc';
  visibleColumns: string[];
  filters: ProductFilters;
}

/**
 * Configurações de produto para cálculos
 */
export interface ProductCalculationConfig {
  includeTax: boolean;
  defaultTaxPercent: number;
  defaultMargin: number;
  roundPrices: boolean;
  minMargin: number;
  maxMargin: number;
}

/**
 * Histórico de alterações de produto
 */
export interface ProductHistory {
  id: number;
  productId: number;
  userId: number;
  action: 'create' | 'update' | 'delete' | 'activate' | 'deactivate';
  changes: Record<string, {
    from: any;
    to: any;
  }>;
  timestamp: string;
  description?: string;
}

/**
 * Produto com informações adicionais para visualização
 */
export interface ProductWithMetadata extends Product {
  totalChannels: number;
  activeChannels: number;
  lastUpdated: string;
  hasChanges: boolean;
  validationErrors?: string[];
  calculatedMargin?: number;
  profitability?: 'high' | 'medium' | 'low' | 'negative';
}

/**
 * Contexto de ação em produto (para logs e histórico)
 */
export interface ProductActionContext {
  action: string;
  productId: number;
  userId?: number;
  metadata?: Record<string, any>;
  timestamp: string;
}

/**
 * Configuração de exportação
 */
export interface ProductExportConfig {
  format: 'excel' | 'csv' | 'json';
  includeChannels: boolean;
  includeSuppliers: boolean;
  includeHistory: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
  filters?: ProductFilters;
}

/**
 * Template de produto para criação em massa
 */
export interface ProductTemplate {
  id: string;
  name: string;
  description: string;
  defaultValues: Partial<ProductFormData>;
  requiredFields: (keyof ProductFormData)[];
  category?: string;
}

/**
 * Validação de produto
 */
export interface ProductValidation {
  isValid: boolean;
  errors: Array<{
    field: keyof Product;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
  warnings: Array<{
    field: keyof Product;
    message: string;
  }>;
}