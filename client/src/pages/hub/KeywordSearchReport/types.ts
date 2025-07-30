// Types for KeywordSearchReport component
export interface Product {
  asin: string;
  product_title: string;
  product_price: string;
  product_original_price?: string;
  currency: string;
  product_star_rating?: string;
  product_num_ratings: number;
  product_url: string;
  product_photo: string;
  is_best_seller: boolean;
  is_amazon_choice: boolean;
  is_prime: boolean;
  sales_volume?: string;
  delivery?: string;
  product_badge?: string;
  product_byline?: string;
}

export interface SearchParams {
  query: string;
  country: string;
  sort_by: string;
  min_price: string;
  max_price: string;
  brand: string;
  seller_id: string;
  deals_and_discounts: string;
}

export interface SearchState {
  isSearching: boolean;
  currentPage: number;
  totalPages: number;
  progress: number;
  products: Product[];
  totalProducts: number;
  searchParams: SearchParams | null;
  errors: string[];
}

export interface KeywordSearchActions {
  updateSearchParam: (key: string, value: any) => void;
  startSearch: () => Promise<void>;
  stopSearch: () => void;
  downloadXLSX: () => void;
}

export interface KeywordSearchPresentationProps {
  searchParams: SearchParams;
  state: SearchState;
  actions: KeywordSearchActions;
  userBalance: string;
  loading: boolean;
}

export const SORT_OPTIONS = [
  { value: 'RELEVANCE', label: 'Relevância' },
  { value: 'PRICE_LOW_TO_HIGH', label: 'Menor Preço' },
  { value: 'PRICE_HIGH_TO_LOW', label: 'Maior Preço' },
  { value: 'REVIEWS', label: 'Avaliações' },
  { value: 'NEWEST', label: 'Novos' },
  { value: 'BEST_SELLERS', label: 'Mais Vendidos' }
];

export const DEALS_OPTIONS = [
  { value: 'NONE', label: 'Nenhum' },
  { value: 'ALL_DISCOUNTS', label: 'Todos Descontos' },
  { value: 'TODAYS_DEALS', label: 'Ofertas do Dia' }
];

export const FEATURE_CODE = 'tools.keyword_report';