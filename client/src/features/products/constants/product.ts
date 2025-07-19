/**
 * Constantes de Produtos - Feature Products
 * Centraliza todas as constantes relacionadas a produtos
 */

/**
 * Status de produtos
 */
export const PRODUCT_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DRAFT: 'draft',
  DISCONTINUED: 'discontinued',
} as const;

export type ProductStatus = typeof PRODUCT_STATUSES[keyof typeof PRODUCT_STATUSES];

/**
 * Labels dos status em português
 */
export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  [PRODUCT_STATUSES.ACTIVE]: 'Ativo',
  [PRODUCT_STATUSES.INACTIVE]: 'Inativo',
  [PRODUCT_STATUSES.DRAFT]: 'Rascunho',
  [PRODUCT_STATUSES.DISCONTINUED]: 'Descontinuado',
};

/**
 * Cores dos status para UI
 */
export const PRODUCT_STATUS_COLORS: Record<ProductStatus, string> = {
  [PRODUCT_STATUSES.ACTIVE]: 'bg-green-100 text-green-800',
  [PRODUCT_STATUSES.INACTIVE]: 'bg-red-100 text-red-800',
  [PRODUCT_STATUSES.DRAFT]: 'bg-yellow-100 text-yellow-800',
  [PRODUCT_STATUSES.DISCONTINUED]: 'bg-gray-100 text-gray-800',
};

/**
 * Categorias de produtos mais comuns
 */
export const PRODUCT_CATEGORIES = [
  'Eletrônicos',
  'Casa e Jardim',
  'Moda',
  'Esportes e Lazer',
  'Bebês e Crianças',
  'Beleza e Saúde',
  'Livros e Papelaria',
  'Automóveis',
  'Ferramentas',
  'Brinquedos',
  'Música e Filmes',
  'Cozinha',
  'Móveis',
  'Pet Shop',
  'Alimentação',
  'Outros',
] as const;

/**
 * Marcas mais comuns (pode ser expandido)
 */
export const COMMON_BRANDS = [
  'Generic',
  'OEM',
  'Não informado',
] as const;

/**
 * Configurações de paginação
 */
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 50,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100, 200] as const,
  MAX_PAGE_SIZE: 1000,
} as const;

/**
 * Configurações de busca
 */
export const SEARCH_CONFIG = {
  MIN_SEARCH_LENGTH: 2,
  DEBOUNCE_DELAY: 300, // ms
  MAX_RESULTS: 1000,
} as const;

/**
 * Validações de produto
 */
export const PRODUCT_VALIDATION = {
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 255,
  SKU_MAX_LENGTH: 50,
  EAN_LENGTH: [8, 13], // EAN-8 ou EAN-13
  DESCRIPTION_MAX_LENGTH: 2000,
  WEIGHT_MIN: 0,
  WEIGHT_MAX: 999999.99,
  DIMENSION_MIN: 0,
  DIMENSION_MAX: 9999.99,
  PRICE_MIN: 0,
  PRICE_MAX: 999999999.99,
} as const;

/**
 * Formatos de arquivo suportados
 */
export const SUPPORTED_FILE_FORMATS = {
  IMPORT: ['.xlsx', '.xls', '.csv'] as const,
  EXPORT: ['excel', 'csv', 'json'] as const,
  IMAGES: ['.jpg', '.jpeg', '.png', '.webp', '.gif'] as const,
} as const;

/**
 * Configurações de imagem
 */
export const IMAGE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_WIDTH: 2048,
  MAX_HEIGHT: 2048,
  THUMBNAIL_SIZE: 150,
  QUALITY: 0.85,
} as const;

/**
 * Campos padrão para listagem
 */
export const DEFAULT_LIST_COLUMNS = [
  'photo',
  'name',
  'sku',
  'brand',
  'category',
  'costPrice',
  'suggestedPrice',
  'status',
  'createdAt',
] as const;

/**
 * Campos para busca
 */
export const SEARCHABLE_FIELDS = [
  'name',
  'sku',
  'ean',
  'brand',
  'category',
  'description',
] as const;

/**
 * Campos para ordenação
 */
export const SORTABLE_FIELDS = [
  'name',
  'sku',
  'brand',
  'category',
  'costPrice',
  'suggestedPrice',
  'createdAt',
  'updatedAt',
] as const;

/**
 * Rotas de produto
 */
export const PRODUCT_ROUTES = {
  LIST: '/minha-area/produtos',
  CREATE: '/minha-area/produtos/novo',
  DETAIL: (id: number | string) => `/minha-area/produtos/${id}`,
  EDIT: (id: number | string) => `/minha-area/produtos/${id}/editar`,
  EDIT_BASIC: (id: number | string) => `/minha-area/produtos/${id}/editar-dados`,
  EDIT_COSTS: (id: number | string) => `/minha-area/produtos/${id}/editar-custos`,
  EDIT_CHANNELS: (id: number | string) => `/minha-area/produtos/${id}/editar-canais`,
  SUPPLIERS: (id: number | string) => `/minha-area/produtos/${id}/fornecedores`,
  IMPORT: '/minha-area/produtos/importar',
  EXPORT: '/minha-area/produtos/exportar',
} as const;

/**
 * Sugestões de margem
 */
export const MARGIN_SUGGESTIONS = [15, 20, 25, 30, 35, 40, 50] as const;

/**
 * Configurações de cálculo
 */
export const CALCULATION_CONFIG = {
  DEFAULT_TAX_PERCENT: 0.0825, // 8.25%
  DEFAULT_MARGIN: 0.30, // 30%
  MIN_MARGIN: 0.05, // 5%
  MAX_MARGIN: 0.80, // 80%
  ROUND_PRECISION: 2,
} as const;

/**
 * Tipos de ação para histórico
 */
export const PRODUCT_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  ACTIVATE: 'activate',
  DEACTIVATE: 'deactivate',
  PRICE_CHANGE: 'price_change',
  CHANNEL_UPDATE: 'channel_update',
  SUPPLIER_LINK: 'supplier_link',
  SUPPLIER_UNLINK: 'supplier_unlink',
  BULK_UPDATE: 'bulk_update',
  IMPORT: 'import',
  EXPORT: 'export',
} as const;

export type ProductAction = typeof PRODUCT_ACTIONS[keyof typeof PRODUCT_ACTIONS];

/**
 * Configurações de cache
 */
export const CACHE_CONFIG = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
  GC_TIME: 10 * 60 * 1000, // 10 minutes
  PREFETCH_TIME: 2 * 60 * 1000, // 2 minutes
} as const;

/**
 * Mensagens de erro comuns
 */
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Este campo é obrigatório',
  INVALID_FORMAT: 'Formato inválido',
  NAME_TOO_SHORT: `Nome deve ter pelo menos ${PRODUCT_VALIDATION.NAME_MIN_LENGTH} caracteres`,
  NAME_TOO_LONG: `Nome deve ter no máximo ${PRODUCT_VALIDATION.NAME_MAX_LENGTH} caracteres`,
  INVALID_EAN: 'EAN deve ter 8 ou 13 dígitos',
  INVALID_PRICE: 'Preço deve ser maior que zero',
  INVALID_WEIGHT: 'Peso deve ser maior que zero',
  INVALID_DIMENSIONS: 'Dimensões devem ser maiores que zero',
  FILE_TOO_LARGE: 'Arquivo muito grande',
  UNSUPPORTED_FORMAT: 'Formato de arquivo não suportado',
  NETWORK_ERROR: 'Erro de conexão. Tente novamente.',
  SERVER_ERROR: 'Erro interno do servidor',
  NOT_FOUND: 'Produto não encontrado',
  DUPLICATE_SKU: 'SKU já existe',
  DUPLICATE_EAN: 'EAN já existe',
} as const;

/**
 * Mensagens de sucesso
 */
export const SUCCESS_MESSAGES = {
  CREATED: 'Produto criado com sucesso',
  UPDATED: 'Produto atualizado com sucesso',
  DELETED: 'Produto excluído com sucesso',
  IMPORTED: 'Produtos importados com sucesso',
  EXPORTED: 'Produtos exportados com sucesso',
  STATUS_CHANGED: 'Status alterado com sucesso',
  BULK_UPDATED: 'Produtos atualizados em lote com sucesso',
} as const;