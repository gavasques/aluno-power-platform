/**
 * Tipos para Fornecedores de Produtos
 * Organiza tipos específicos para gerenciamento de fornecedores vinculados a produtos
 */

/**
 * Fornecedor vinculado a um produto
 */
export interface ProductSupplier {
  id: number;
  productId: number;
  supplierId: number;
  supplierName: string;
  supplierCode: string;
  productCode: string;
  costPrice: number;
  currency: string;
  leadTime: number; // em dias
  minimumQuantity?: number;
  maximumQuantity?: number;
  status: 'linked' | 'pending' | 'not_found' | 'discontinued';
  lastUpdated: string;
  notes?: string;
  isPrimary: boolean;
  isActive: boolean;
}

/**
 * Histórico de preços de fornecedor
 */
export interface SupplierPriceHistory {
  id: number;
  productSupplierId: number;
  costPrice: number;
  currency: string;
  validFrom: string;
  validTo?: string;
  changeReason?: string;
  userId?: number;
  notes?: string;
}

/**
 * Estatísticas de fornecedor para um produto
 */
export interface ProductSupplierStats {
  totalSuppliers: number;
  activeSuppliers: number;
  avgCostPrice: number;
  minCostPrice: number;
  maxCostPrice: number;
  avgLeadTime: number;
  primarySupplier?: ProductSupplier;
  lastPriceUpdate: string;
}

/**
 * Configuração de fornecedor
 */
export interface SupplierConfig {
  autoUpdatePrices: boolean;
  notifyPriceChanges: boolean;
  checkStockRegularly: boolean;
  preferredCurrency: string;
  maxPriceVariation: number; // percentual
  alertLowStock: boolean;
  stockThreshold: number;
}

/**
 * Dados de estoque do fornecedor
 */
export interface SupplierStock {
  productCode: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lastUpdated: string;
  location?: string;
  batchNumber?: string;
  expiryDate?: string;
}

/**
 * Comparação entre fornecedores
 */
export interface SupplierComparison {
  product: {
    id: number;
    name: string;
  };
  suppliers: Array<{
    supplier: ProductSupplier;
    advantages: string[];
    disadvantages: string[];
    score: number;
    recommendation: 'best' | 'good' | 'acceptable' | 'poor';
  }>;
  bestChoice: number; // ID do melhor fornecedor
  analysis: {
    costRange: { min: number; max: number; };
    leadTimeRange: { min: number; max: number; };
    qualityScores: Record<number, number>;
  };
}

/**
 * Pedido para fornecedor
 */
export interface SupplierOrder {
  id: number;
  productId: number;
  supplierId: number;
  productCode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  orderDate: string;
  expectedDelivery: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  trackingCode?: string;
  notes?: string;
}

/**
 * Avaliação de fornecedor
 */
export interface SupplierRating {
  id: number;
  productSupplierId: number;
  userId: number;
  orderId?: number;
  qualityScore: number; // 1-5
  deliveryScore: number; // 1-5
  communicationScore: number; // 1-5
  priceScore: number; // 1-5
  overallScore: number; // calculado
  review?: string;
  recommendedImprovements?: string[];
  ratingDate: string;
}

/**
 * Dados para importação de fornecedores
 */
export interface SupplierImportData {
  productId?: number;
  productSku?: string;
  supplierName: string;
  supplierCode?: string;
  productCode: string;
  costPrice: number;
  currency?: string;
  leadTime?: number;
  minimumQuantity?: number;
  isPrimary?: boolean;
  notes?: string;
}

/**
 * Resultado da importação de fornecedores
 */
export interface SupplierImportResult {
  success: number;
  created: number;
  updated: number;
  errors: Array<{
    row: number;
    message: string;
    data?: Partial<SupplierImportData>;
  }>;
  warnings: Array<{
    row: number;
    message: string;
    data?: Partial<SupplierImportData>;
  }>;
}

/**
 * Configuração de alerta de fornecedor
 */
export interface SupplierAlert {
  id: number;
  productId: number;
  supplierId: number;
  type: 'price_change' | 'stock_low' | 'delivery_delay' | 'quality_issue';
  message: string;
  severity: 'info' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  data?: Record<string, any>;
}