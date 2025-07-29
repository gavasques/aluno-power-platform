/**
 * TYPES: Amazon Comparison System
 * Tipos centralizados para sistema de comparação de listagens Amazon
 * Extraído de CompararListings.tsx (956 linhas) para modularização
 * Data: Janeiro 29, 2025
 */

// ===== API RESPONSE TYPES =====
export interface AmazonProductResponse {
  status: string;
  data: {
    asin: string;
    country: string;
    product_title: string;
    product_photo: string;
    product_photos: string[];
    product_url: string;
    product_price: string;
    product_original_price: string;
    product_star_rating: string;
    product_num_ratings: number;
    product_availability: string;
    product_num_offers: number;
    is_best_seller: boolean;
    is_amazon_choice: boolean;
    is_prime: boolean;
    climate_pledge_friendly: boolean;
    sales_volume: string;
    product_description: string;
    about_product: string[];
    product_information: Record<string, any>;
    delivery: string;
    primary_delivery_time: string;
    category: {
      name: string;
    };
    product_byline: string;
  };
}

// ===== FORM DATA TYPES =====
export interface ComparisonFormData {
  asins: string[];
  country: string;
}

// ===== STATE TYPES =====
export interface ComparisonState {
  asins: string[];
  country: string;
  loading: boolean;
  results: AmazonProductResponse[];
  error: string;
}

// ===== VALIDATION ERRORS =====
export interface ComparisonErrors {
  asins?: string[];
  country?: string;
  general?: string;
}

// ===== HOOK RETURN TYPES =====
export interface UseComparisonFormReturn {
  formData: ComparisonFormData;
  state: ComparisonState;
  errors: ComparisonErrors;
  actions: {
    handleAddAsin: () => void;
    handleRemoveAsin: (index: number) => void;
    handleAsinChange: (index: number, value: string) => void;
    handleCountryChange: (country: string) => void;
    handleCompare: () => Promise<void>;
    handleExportComparison: () => void;
    clearResults: () => void;
    clearErrors: () => void;
  };
}

export interface UseAmazonApiReturn {
  fetchProduct: (asin: string, country: string) => Promise<AmazonProductResponse>;
  isLoading: boolean;
  error: string | null;
}

// ===== COMPONENT PROPS TYPES =====
export interface ComparisonFormProps {
  asins: string[];
  country: string;
  loading: boolean;
  errors: ComparisonErrors;
  onAddAsin: () => void;
  onRemoveAsin: (index: number) => void;
  onAsinChange: (index: number, value: string) => void;
  onCountryChange: (country: string) => void;
  onCompare: () => Promise<void>;
}

export interface ComparisonResultsProps {
  results: AmazonProductResponse[];
  loading: boolean;
  onExport: () => void;
  onClear: () => void;
}

export interface ProductCardProps {
  product: AmazonProductResponse['data'];
  index: number;
}

export interface ProductComparisonTableProps {
  results: AmazonProductResponse[];
}

export interface AsinInputProps {
  value: string;
  index: number;
  error?: string;
  canRemove: boolean;
  onChange: (value: string) => void;
  onRemove: () => void;
}

export interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export interface ExportButtonProps {
  results: AmazonProductResponse[];
  loading: boolean;
  onExport: () => void;
}

// ===== UTILITY TYPES =====
export interface CountryOption {
  code: string;
  name: string;
  flag: string;
}

export interface ComparisonMetrics {
  avgPrice: number;
  avgRating: number;
  avgReviews: number;
  bestSellers: number;
  primeProducts: number;
  climateFreindly: number;
}

export interface ExportData {
  timestamp: string;
  country: string;
  products: Array<{
    asin: string;
    title: string;
    price: string;
    rating: string;
    reviews: number;
    availability: string;
    is_best_seller: boolean;
    is_prime: boolean;
    url: string;
  }>;
  metrics: ComparisonMetrics;
}

// ===== VALIDATION TYPES =====
export interface ValidationRule {
  test: (value: any) => boolean;
  message: string;
}

export interface ValidationSchema {
  [field: string]: ValidationRule[];
}

// ===== CONSTANTS =====
export const SUPPORTED_COUNTRIES: CountryOption[] = [
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧' },
  { code: 'DE', name: 'Alemanha', flag: '🇩🇪' },
  { code: 'FR', name: 'França', flag: '🇫🇷' },
  { code: 'IT', name: 'Itália', flag: '🇮🇹' },
  { code: 'ES', name: 'Espanha', flag: '🇪🇸' },
  { code: 'CA', name: 'Canadá', flag: '🇨🇦' },
  { code: 'JP', name: 'Japão', flag: '🇯🇵' },
  { code: 'AU', name: 'Austrália', flag: '🇦🇺' }
];

export const MAX_ASINS = 5;
export const MIN_ASINS = 2;

export const VALIDATION_MESSAGES = {
  ASIN_REQUIRED: 'ASIN é obrigatório',
  ASIN_INVALID: 'ASIN deve ter 10 caracteres alfanuméricos',
  ASIN_DUPLICATE: 'ASIN duplicado encontrado',
  COUNTRY_REQUIRED: 'País é obrigatório',
  MIN_ASINS: `Mínimo de ${MIN_ASINS} ASINs necessários`,
  MAX_ASINS: `Máximo de ${MAX_ASINS} ASINs permitidos`,
  API_ERROR: 'Erro ao buscar dados da Amazon',
  NETWORK_ERROR: 'Erro de rede. Verifique sua conexão.',
  CREDITS_INSUFFICIENT: 'Créditos insuficientes para realizar a comparação'
} as const;

export const COMPARISON_FEATURES = {
  PRICE_COMPARISON: 'Comparação de preços em tempo real',
  RATING_ANALYSIS: 'Análise de avaliações e reviews',
  AVAILABILITY_CHECK: 'Verificação de disponibilidade',
  DELIVERY_INFO: 'Informações de entrega',
  BADGE_ANALYSIS: 'Análise de badges (Best Seller, Amazon Choice)',
  EXPORT_FUNCTIONALITY: 'Exportação de dados para análise'
} as const;

// ===== ERROR TYPES =====
export type ComparisonErrorType = 
  | 'VALIDATION_ERROR'
  | 'API_ERROR'
  | 'NETWORK_ERROR'
  | 'CREDITS_ERROR'
  | 'UNKNOWN_ERROR';

export interface ComparisonError {
  type: ComparisonErrorType;
  message: string;
  details?: any;
}

// ===== API ENDPOINT TYPES =====
export interface ApiEndpoint {
  url: string;
  method: 'GET' | 'POST';
  requiresAuth: boolean;
  costCredits: number;
}

export const API_ENDPOINTS = {
  AMAZON_PRODUCT: '/api/amazon/product',
  COMPARISON_EXPORT: '/api/comparisons/export',
  CREDIT_CHECK: '/api/credits/check'
} as const;