/**
 * Constantes de Canais - Feature Products
 * Re-exporta e estende constantes de canais para a feature de produtos
 */

// Re-export constantes do core
export {
  CHANNEL_METADATA,
  CHANNEL_CATEGORIES,
  createEmptyChannel,
  ALL_CHANNEL_TYPES,
} from '@/shared/constants/channels';

// Re-export tipos
export type { ChannelMetadata } from '@/shared/constants/channels';
export type { ChannelType } from '@/types/core/channel';

/**
 * Mapeamento simplificado de nomes de canais
 */
export const CHANNEL_DISPLAY_NAMES: Record<string, string> = {
  'SITE_PROPRIO': 'Site',
  'AMAZON_FBM': 'FBM',
  'AMAZON_FBA_ON_SITE': 'FBA-Site',
  'AMAZON_FBA_ONSITE': 'FBA-Site',
  'AMAZON_DBA': 'DBA',
  'AMAZON_FBA': 'FBA',
  'MERCADO_LIVRE_ME1': 'ML-ME1',
  'MERCADO_LIVRE_FLEX': 'ML-Flex',
  'MERCADO_LIVRE_ENVIOS': 'ML-Envios',
  'MERCADO_LIVRE_FULL': 'ML-Full',
  'MAGALU_FULL': 'MGL-Full',
  'MAGALU_ENVIOS': 'MGL-Envios',
  'TIKTOKSHOP_NORMAL': 'TikTok',
  'SHOPEE': 'Shopee',
  'MARKETPLACE_OTHER': 'Outro',
};

/**
 * Status de sincronização de canal
 */
export const CHANNEL_SYNC_STATUS = {
  IDLE: 'idle',
  PENDING: 'pending',
  SYNCING: 'syncing',
  SUCCESS: 'success',
  ERROR: 'error',
  PARTIAL: 'partial',
} as const;

export type ChannelSyncStatus = typeof CHANNEL_SYNC_STATUS[keyof typeof CHANNEL_SYNC_STATUS];

/**
 * Labels dos status de sincronização
 */
export const CHANNEL_SYNC_STATUS_LABELS: Record<ChannelSyncStatus, string> = {
  [CHANNEL_SYNC_STATUS.IDLE]: 'Aguardando',
  [CHANNEL_SYNC_STATUS.PENDING]: 'Pendente',
  [CHANNEL_SYNC_STATUS.SYNCING]: 'Sincronizando',
  [CHANNEL_SYNC_STATUS.SUCCESS]: 'Sincronizado',
  [CHANNEL_SYNC_STATUS.ERROR]: 'Erro',
  [CHANNEL_SYNC_STATUS.PARTIAL]: 'Parcial',
};

/**
 * Cores dos status de sincronização
 */
export const CHANNEL_SYNC_STATUS_COLORS: Record<ChannelSyncStatus, string> = {
  [CHANNEL_SYNC_STATUS.IDLE]: 'bg-gray-100 text-gray-800',
  [CHANNEL_SYNC_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [CHANNEL_SYNC_STATUS.SYNCING]: 'bg-blue-100 text-blue-800',
  [CHANNEL_SYNC_STATUS.SUCCESS]: 'bg-green-100 text-green-800',
  [CHANNEL_SYNC_STATUS.ERROR]: 'bg-red-100 text-red-800',
  [CHANNEL_SYNC_STATUS.PARTIAL]: 'bg-orange-100 text-orange-800',
};

/**
 * Prioridades de canal (para ordenação)
 */
export const CHANNEL_PRIORITIES: Record<string, number> = {
  'SITE_PROPRIO': 1,
  'AMAZON_FBA': 2,
  'AMAZON_FBM': 3,
  'MERCADO_LIVRE_FULL': 4,
  'MERCADO_LIVRE_ME1': 5,
  'MERCADO_LIVRE_FLEX': 6,
  'MERCADO_LIVRE_ENVIOS': 7,
  'MAGALU_FULL': 8,
  'MAGALU_ENVIOS': 9,
  'SHOPEE': 10,
  'TIKTOKSHOP_NORMAL': 11,
  'AMAZON_DBA': 12,
  'AMAZON_FBA_ONSITE': 13,
  'MARKETPLACE_OTHER': 99,
};

/**
 * Configurações de validação por canal
 */
export const CHANNEL_VALIDATION_RULES = {
  SITE_PROPRIO: {
    requiredFields: ['price', 'packagingCostValue'],
    minPrice: 1,
    maxPrice: 999999,
    minMargin: 0.05, // 5%
  },
  AMAZON_FBM: {
    requiredFields: ['price', 'commissionPercent', 'packagingCostValue'],
    minPrice: 5,
    maxPrice: 999999,
    minMargin: 0.10, // 10%
    maxCommission: 0.25, // 25%
  },
  AMAZON_FBA: {
    requiredFields: ['price', 'commissionPercent', 'packagingCostValue', 'shippingCostValue'],
    minPrice: 5,
    maxPrice: 999999,
    minMargin: 0.15, // 15%
    maxCommission: 0.25, // 25%
  },
  // Adicionar mais conforme necessário
} as const;

/**
 * Intervalos de sincronização (em minutos)
 */
export const SYNC_INTERVALS = {
  REAL_TIME: 0,
  EVERY_5_MIN: 5,
  EVERY_15_MIN: 15,
  EVERY_30_MIN: 30,
  HOURLY: 60,
  EVERY_2_HOURS: 120,
  EVERY_6_HOURS: 360,
  DAILY: 1440,
} as const;

/**
 * Configurações de preço automático
 */
export const AUTO_PRICING_CONFIG = {
  MIN_MARGIN: 0.05, // 5%
  MAX_MARGIN: 0.80, // 80%
  DEFAULT_MARGIN: 0.30, // 30%
  PRICE_ROUNDING: {
    NONE: 'none',
    TO_NEAREST_REAL: 'nearest_real',
    TO_99_CENTS: '99_cents',
    TO_90_CENTS: '90_cents',
  },
} as const;

/**
 * Tipos de alerta de canal
 */
export const CHANNEL_ALERT_TYPES = {
  PRICE_CHANGED: 'price_changed',
  MARGIN_LOW: 'margin_low',
  SYNC_ERROR: 'sync_error',
  STOCK_LOW: 'stock_low',
  COMPETITOR_PRICE: 'competitor_price',
  POLICY_VIOLATION: 'policy_violation',
} as const;

export type ChannelAlertType = typeof CHANNEL_ALERT_TYPES[keyof typeof CHANNEL_ALERT_TYPES];

/**
 * Severidade dos alertas
 */
export const ALERT_SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
} as const;

export type AlertSeverity = typeof ALERT_SEVERITY[keyof typeof ALERT_SEVERITY];

/**
 * Configurações de performance
 */
export const PERFORMANCE_THRESHOLDS = {
  EXCELLENT_MARGIN: 0.40, // 40%
  GOOD_MARGIN: 0.25, // 25%
  ACCEPTABLE_MARGIN: 0.15, // 15%
  POOR_MARGIN: 0.05, // 5%
  
  HIGH_VOLUME: 100, // vendas por mês
  MEDIUM_VOLUME: 20,
  LOW_VOLUME: 5,
} as const;

/**
 * Cores para indicadores de performance
 */
export const PERFORMANCE_COLORS = {
  EXCELLENT: 'bg-green-500',
  GOOD: 'bg-blue-500',
  ACCEPTABLE: 'bg-yellow-500',
  POOR: 'bg-orange-500',
  NEGATIVE: 'bg-red-500',
} as const;