/**
 * Channel Configuration Constants
 * Centralized configuration following DRY principles
 */

import { ChannelType, ChannelCostData } from '../types/channels';

// Channel display metadata
export interface ChannelMetadata {
  name: string;
  category: string;
  icon: string;
  color: string;
  description: string;
  defaultCosts: Partial<ChannelCostData>;
  requiredFields: (keyof ChannelCostData)[];
  productCodeFields: string[];
}

// Comprehensive channel configuration
export const CHANNEL_METADATA: Record<ChannelType, ChannelMetadata> = {
  SITE_PROPRIO: {
    name: 'Site Próprio',
    category: 'E-commerce Próprio',
    icon: 'Store',
    color: 'bg-blue-500',
    description: 'Vendas diretas através do site próprio',
    defaultCosts: {
      fixedCostPercent: 5,
      marketingCostPercent: 8,
      financialCostPercent: 3,
      packagingCostValue: 15,
    },
    requiredFields: ['price', 'packagingCostValue', 'fixedCostPercent', 'marketingCostPercent'],
    productCodeFields: ['codigoSite'],
  },
  
  AMAZON_FBM: {
    name: 'Amazon FBM',
    category: 'Amazon',
    icon: 'Package',
    color: 'bg-orange-500',
    description: 'Fulfillment by Merchant - Envio próprio',
    defaultCosts: {
      commissionPercent: 15,
      fixedCostPercent: 3,
      marketingCostPercent: 10,
      packagingCostValue: 12,
    },
    requiredFields: ['price', 'commissionPercent', 'packagingCostValue'],
    productCodeFields: ['fnsku', 'asin'],
  },
  
  AMAZON_FBA: {
    name: 'Amazon FBA',
    category: 'Amazon',
    icon: 'Truck',
    color: 'bg-orange-600',
    description: 'Fulfillment by Amazon - Logística Amazon',
    defaultCosts: {
      commissionPercent: 15,
      fixedCostPercent: 3,
      marketingCostPercent: 10,
      packagingCostValue: 12,
      shippingCostValue: 8,
    },
    requiredFields: ['price', 'commissionPercent', 'packagingCostValue', 'shippingCostValue'],
    productCodeFields: ['fnsku', 'asin'],
  },
  
  AMAZON_DBA: {
    name: 'Amazon DBA',
    category: 'Amazon',
    icon: 'Building2',
    color: 'bg-orange-700',
    description: 'Direct Brand Advertising',
    defaultCosts: {
      commissionPercent: 12,
      fixedCostPercent: 2,
      marketingCostPercent: 15,
      packagingCostValue: 10,
    },
    requiredFields: ['price', 'commissionPercent', 'marketingCostPercent'],
    productCodeFields: ['fnsku', 'asin'],
  },
  
  AMAZON_FBA_ONSITE: {
    name: 'Amazon FBA OnSite',
    category: 'Amazon',
    icon: 'Home',
    color: 'bg-orange-400',
    description: 'FBA com logística no local',
    defaultCosts: {
      commissionPercent: 13,
      fixedCostPercent: 3,
      marketingCostPercent: 8,
      packagingCostValue: 15,
    },
    requiredFields: ['price', 'commissionPercent', 'packagingCostValue'],
    productCodeFields: ['fnsku', 'asin'],
  },
  
  MERCADO_LIVRE_ME1: {
    name: 'Mercado Livre ME1',
    category: 'Mercado Livre',
    icon: 'ShoppingBag',
    color: 'bg-yellow-500',
    description: 'Nível Mercado Envios 1',
    defaultCosts: {
      commissionPercent: 16,
      fixedCostPercent: 4,
      marketingCostPercent: 12,
      packagingCostValue: 10,
      shippingCostValue: 15,
    },
    requiredFields: ['price', 'commissionPercent', 'packagingCostValue'],
    productCodeFields: ['mlb', 'mlbCatalog', 'idProduto'],
  },
  
  MERCADO_LIVRE_FLEX: {
    name: 'Mercado Livre Flex',
    category: 'Mercado Livre',
    icon: 'Zap',
    color: 'bg-yellow-600',
    description: 'Entrega flexível Mercado Livre',
    defaultCosts: {
      commissionPercent: 14,
      fixedCostPercent: 3,
      marketingCostPercent: 10,
      packagingCostValue: 12,
    },
    requiredFields: ['price', 'commissionPercent', 'packagingCostValue'],
    productCodeFields: ['mlb', 'mlbCatalog', 'idProduto'],
  },
  
  MERCADO_LIVRE_ENVIOS: {
    name: 'Mercado Livre Envios',
    category: 'Mercado Livre',
    icon: 'Send',
    color: 'bg-yellow-400',
    description: 'Mercado Envios padrão',
    defaultCosts: {
      commissionPercent: 15,
      fixedCostPercent: 4,
      marketingCostPercent: 11,
      packagingCostValue: 10,
      shippingCostValue: 12,
    },
    requiredFields: ['price', 'commissionPercent', 'shippingCostValue'],
    productCodeFields: ['mlb', 'mlbCatalog', 'idProduto'],
  },
  
  MERCADO_LIVRE_FULL: {
    name: 'Mercado Livre Full',
    category: 'Mercado Livre',
    icon: 'Crown',
    color: 'bg-yellow-700',
    description: 'Mercado Livre Fulfillment completo',
    defaultCosts: {
      commissionPercent: 17,
      fixedCostPercent: 5,
      marketingCostPercent: 13,
      packagingCostValue: 8,
      shippingCostValue: 20,
      prepCenterCostValue: 5,
    },
    requiredFields: ['price', 'commissionPercent', 'shippingCostValue'],
    productCodeFields: ['mlb', 'mlbCatalog', 'idProduto'],
  },
  
  SHOPEE: {
    name: 'Shopee',
    category: 'Marketplace',
    icon: 'ShoppingCart',
    color: 'bg-red-500',
    description: 'Marketplace Shopee',
    defaultCosts: {
      commissionPercent: 12,
      fixedCostPercent: 3,
      marketingCostPercent: 8,
      packagingCostValue: 10,
      shippingCostValue: 10,
    },
    requiredFields: ['price', 'commissionPercent', 'packagingCostValue'],
    productCodeFields: ['idProduto'],
  },
  
  MAGALU_FULL: {
    name: 'Magalu Full',
    category: 'Magazine Luiza',
    icon: 'Boxes',
    color: 'bg-blue-600',
    description: 'Magazine Luiza com fulfillment',
    defaultCosts: {
      commissionPercent: 18,
      fixedCostPercent: 4,
      marketingCostPercent: 10,
      packagingCostValue: 12,
      shippingCostValue: 15,
    },
    requiredFields: ['price', 'commissionPercent', 'shippingCostValue'],
    productCodeFields: ['skuMgl'],
  },
  
  MAGALU_ENVIOS: {
    name: 'Magalu Envios',
    category: 'Magazine Luiza',
    icon: 'Package2',
    color: 'bg-blue-500',
    description: 'Magazine Luiza com envios próprios',
    defaultCosts: {
      commissionPercent: 16,
      fixedCostPercent: 3,
      marketingCostPercent: 9,
      packagingCostValue: 10,
    },
    requiredFields: ['price', 'commissionPercent', 'packagingCostValue'],
    productCodeFields: ['skuMgl'],
  },
  
  TIKTOKSHOP_NORMAL: {
    name: 'TikTok Shop',
    category: 'Social Commerce',
    icon: 'Video',
    color: 'bg-black',
    description: 'TikTok Shop marketplace',
    defaultCosts: {
      commissionPercent: 8,
      fixedCostPercent: 2,
      marketingCostPercent: 15,
      packagingCostValue: 8,
    },
    requiredFields: ['price', 'commissionPercent', 'marketingCostPercent'],
    productCodeFields: ['idProduto'],
  },
  
  MARKETPLACE_OTHER: {
    name: 'Outro Marketplace',
    category: 'Outros',
    icon: 'Globe',
    color: 'bg-gray-500',
    description: 'Outros marketplaces e plataformas',
    defaultCosts: {
      commissionPercent: 15,
      fixedCostPercent: 3,
      marketingCostPercent: 10,
      packagingCostValue: 10,
    },
    requiredFields: ['price', 'commissionPercent'],
    productCodeFields: ['idProduto'],
  },
};

// Channel categories for grouping
export const CHANNEL_CATEGORIES = {
  'E-commerce Próprio': ['SITE_PROPRIO'],
  'Amazon': ['AMAZON_FBM', 'AMAZON_FBA', 'AMAZON_DBA', 'AMAZON_FBA_ONSITE'],
  'Mercado Livre': ['MERCADO_LIVRE_ME1', 'MERCADO_LIVRE_FLEX', 'MERCADO_LIVRE_ENVIOS', 'MERCADO_LIVRE_FULL'],
  'Magazine Luiza': ['MAGALU_FULL', 'MAGALU_ENVIOS'],
  'Social Commerce': ['TIKTOKSHOP_NORMAL'],
  'Marketplace': ['SHOPEE'],
  'Outros': ['MARKETPLACE_OTHER'],
} as const;

// Default empty channel structure
export const createEmptyChannel = (type: ChannelType) => ({
  type,
  isActive: false,
  data: {
    price: 0,
    packagingCostValue: CHANNEL_METADATA[type].defaultCosts.packagingCostValue || 0,
    fixedCostPercent: CHANNEL_METADATA[type].defaultCosts.fixedCostPercent || 0,
    marketingCostPercent: CHANNEL_METADATA[type].defaultCosts.marketingCostPercent || 0,
    ...CHANNEL_METADATA[type].defaultCosts,
  },
});

// All channel types for iteration
export const ALL_CHANNEL_TYPES: ChannelType[] = Object.keys(CHANNEL_METADATA) as ChannelType[];