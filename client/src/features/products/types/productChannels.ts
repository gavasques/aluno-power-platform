/**
 * Tipos para Canais de Produtos
 * Organiza tipos específicos para gerenciamento de canais de venda
 */

// Re-export core channel types
export type {
  BaseChannel,
  ProductChannels,
  ChannelType,
  ChannelCostData,
} from '@/types/core/channel';

/**
 * Dados de um canal vinculado a um produto
 */
export interface ProductChannel {
  id: number;
  productId: number;
  type: ChannelType;
  name: string;
  enabled: boolean;
  salePrice: number;
  commission: number;
  margin: number;
  netProfit: number;
  lastUpdated: string;
  productCodes?: Record<string, string>;
  config?: ChannelCostData;
}

/**
 * Resumo de performance de canais
 */
export interface ChannelPerformance {
  channelType: ChannelType;
  totalProducts: number;
  activeProducts: number;
  avgMargin: number;
  totalRevenue: number;
  avgSalePrice: number;
  profitability: number;
}

/**
 * Configuração de canal para produto
 */
export interface ProductChannelConfig {
  productId: number;
  channelType: ChannelType;
  isActive: boolean;
  pricing: {
    basePrice: number;
    salePrice: number;
    margin: number;
    minPrice?: number;
    maxPrice?: number;
  };
  costs: ChannelCostData;
  productCodes: Record<string, string>;
  settings: {
    autoSync: boolean;
    notifyPriceChanges: boolean;
    allowNegativeMargin: boolean;
  };
}

/**
 * Histórico de alterações em canais
 */
export interface ChannelHistory {
  id: number;
  productId: number;
  channelType: ChannelType;
  action: 'created' | 'updated' | 'enabled' | 'disabled' | 'price_changed';
  changes: Record<string, {
    from: any;
    to: any;
  }>;
  timestamp: string;
  userId?: number;
}

/**
 * Validação de canal
 */
export interface ChannelValidation {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

/**
 * Template de configuração de canal
 */
export interface ChannelTemplate {
  id: string;
  name: string;
  channelType: ChannelType;
  description: string;
  defaultConfig: Partial<ProductChannelConfig>;
  category?: string;
}

/**
 * Sincronização de canal com marketplace
 */
export interface ChannelSync {
  productId: number;
  channelType: ChannelType;
  status: 'pending' | 'syncing' | 'success' | 'error';
  lastSync?: string;
  nextSync?: string;
  errors?: string[];
  syncData?: Record<string, any>;
}

/**
 * Análise de rentabilidade por canal
 */
export interface ChannelProfitability {
  channelType: ChannelType;
  margin: number;
  netProfit: number;
  roi: number;
  breakEvenPoint: number;
  recommendation: 'excellent' | 'good' | 'acceptable' | 'poor' | 'negative';
  insights: string[];
}