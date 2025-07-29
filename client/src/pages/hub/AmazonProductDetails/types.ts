/**
 * AMAZON PRODUCT DETAILS TYPES - FASE 4 REFATORAÇÃO
 * 
 * Tipos centralizados para o componente AmazonProductDetails
 * Antes: Tipos espalhados no componente de 1.229 linhas
 * Depois: Tipos centralizados e organizados
 */

// Product Data Types
export interface ProductData {
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
    has_aplus: boolean;
    has_brandstory: boolean;
    sales_volume: string;
    product_description: string;
    about_product: string[];
    product_information: Record<string, any>;
    product_photos_videos: Array<{
      url: string;
      type: string;
    }>;
    product_byline: string;
    product_byline_link: string;
    delivery: string;
    primary_delivery_time: string;
    category: {
      name: string;
    };
    category_path: Array<{
      name: string;
      link: string;
    }>;
    product_variations: Record<string, any>;
    rating_distribution: Record<string, number>;
  };
}

// Component Props Types
export interface ExpandableSectionProps {
  title: string;
  icon: React.ComponentType<any>;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export interface BadgeDisplayProps {
  productData: ProductData['data'];
}

export interface PhotoGalleryProps {
  photos: string[];
  videos: Array<{ url: string; type: string }>;
  productTitle: string;
}

export interface ProductSpecificationsProps {
  specifications: Record<string, any>;
}

export interface RatingDistributionProps {
  distribution: Record<string, number>;
  totalRatings: number;
  starRating: string;
}

export interface ProductVariationsProps {
  variations: Record<string, any>;
}

export interface CategoryPathProps {
  categoryPath: Array<{ name: string; link: string }>;
  category: { name: string };
}

export interface ExportActionsProps {
  productData: ProductData['data'];
  onExportTxt: () => void;
  onDownloadImages: () => void;
}

// Hook Return Types
export interface UseAmazonProductSearchReturn {
  searchState: SearchState;
  productData: ProductData | null;
  updateSearchState: (field: keyof SearchState, value: any) => void;
  handleSearch: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export interface UseProductExportReturn {
  exportToTxt: (productData: ProductData['data']) => void;
  downloadImages: (productData: ProductData['data']) => Promise<void>;
  isExporting: boolean;
}

export interface UseExpandableSectionsReturn {
  expandedSections: Set<string>;
  toggleSection: (sectionId: string) => void;
  isExpanded: (sectionId: string) => boolean;
  expandAll?: () => void;
  collapseAll?: () => void;
  resetToDefault?: () => void;
}

// State Types
export interface SearchState {
  asin: string;
  country: string;
}

// Section IDs
export type SectionId = 
  | 'basic-info'
  | 'pricing'
  | 'ratings'
  | 'photos'
  | 'specifications'
  | 'variations'
  | 'description'
  | 'category';

// Container Props
export interface AmazonProductDetailsContainerProps {
  // Container doesn't need props for this use case
}

// Presentation Props
export interface AmazonProductDetailsPresentationProps {
  // Search functionality
  searchHook: UseAmazonProductSearchReturn;
  
  // Export functionality
  exportHook: UseProductExportReturn;
  
  // UI state
  sectionsHook: UseExpandableSectionsReturn;
  
  // Data
  productData: ProductData | null;
  isLoading: boolean;
  error: string | null;
}

// Constants
export const SECTION_IDS: Record<string, SectionId> = {
  BASIC_INFO: 'basic-info',
  PRICING: 'pricing',
  RATINGS: 'ratings',
  PHOTOS: 'photos',
  SPECIFICATIONS: 'specifications',
  VARIATIONS: 'variations',
  DESCRIPTION: 'description',
  CATEGORY: 'category'
} as const;

export const COUNTRIES = [
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'UK', name: 'Reino Unido', flag: '🇬🇧' },
  { code: 'DE', name: 'Alemanha', flag: '🇩🇪' },
  { code: 'FR', name: 'França', flag: '🇫🇷' },
  { code: 'IT', name: 'Itália', flag: '🇮🇹' },
  { code: 'ES', name: 'Espanha', flag: '🇪🇸' },
  { code: 'CA', name: 'Canadá', flag: '🇨🇦' },
  { code: 'AU', name: 'Austrália', flag: '🇦🇺' },
  { code: 'JP', name: 'Japão', flag: '🇯🇵' },
  { code: 'IN', name: 'Índia', flag: '🇮🇳' }
];

// Error Types
export interface AmazonProductDetailsError extends Error {
  code?: string;
  status?: number;
}

// API Response Types
export interface AmazonProductDetailsResponse {
  success: boolean;
  data?: ProductData;
  error?: string;
  message?: string;
}

// Export Types
export interface ExportData {
  productData: ProductData['data'];
  exportFormat: 'txt' | 'json' | 'csv';
  includeImages?: boolean;
}

// Component State Types
export interface ComponentState {
  searchState: SearchState;
  expandedSections: Set<string>;
  isLoading: boolean;
  error: string | null;
  productData: ProductData | null;
  isExporting: boolean;
}