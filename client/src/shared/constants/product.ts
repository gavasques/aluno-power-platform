// Product management constants
export const ITEMS_PER_PAGE = 50;

export const CHANNEL_NAMES: Record<string, string> = {
  'SITE_PROPRIO': 'Site',
  'AMAZON_FBM': 'FBM',
  'AMAZON_FBA_ON_SITE': 'FBA-Site',
  'AMAZON_FBA_ONSITE': 'FBA-Site',
  'AMAZON_DBA': 'DBA',
  'AMAZON_FBA': 'FBA',
  'ML_ME1': 'ML-ME1',
  'ML_FLEX': 'ML-Flex',
  'ML_ENVIOS': 'ML-Envios',
  'ML_FULL': 'ML-Full',
  'MERCADO_LIVRE_FULL': 'ML-Full',
  'MAGALU_FULL': 'MGL-Full',
  'MAGALU_ENVIOS': 'MGL-Envios',
  'TIKTOKSHOP_NORMAL': 'TikTok',
  'SHOPEE': 'Shopee',
  'MARKETPLACE_OTHER': 'Outro',
  'AMAZON_FBA_OSITE': 'FBA-Site',
  'AMAZON_ONSITE': 'FBA-Site'
};

export const EDIT_ROUTES = {
  basic: (id: string) => `/minha-area/produtos/${id}/editar-dados`,
  costs: (id: string) => `/minha-area/produtos/${id}/editar-custos`,
  channels: (id: string) => `/minha-area/produtos/${id}/editar-canais`,
  view: (id: string) => `/minha-area/produtos/${id}`,
  list: () => '/minha-area/produtos'
} as const;

export const MARGIN_SUGGESTIONS = [20, 30, 40] as const;