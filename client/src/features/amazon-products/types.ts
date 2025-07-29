/**
 * TIPOS CENTRALIZADOS - Amazon Product Details
 * Extraídos de AmazonProductDetails.tsx (1229 linhas) para modularização
 * Data: Janeiro 29, 2025
 */
import { ComponentType } from 'react';

// ===== CORE PRODUCT DATA TYPES =====
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

// ===== SEARCH AND FORM TYPES =====
export interface SearchFormData {
  asin: string;
  country: string;
}

export interface SearchState {
  isLoading: boolean;
  error: string | null;
  productData: ProductData | null;
}

// ===== UI COMPONENT TYPES =====
export interface ExpandableSectionProps {
  title: string;
  icon: ComponentType<any>;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export interface ExpandedSections {
  basicInfo: boolean;
  pricing: boolean;
  description: boolean;
  specifications: boolean;
  images: boolean;
  videos: boolean;
  ranking: boolean;
  variations: boolean;
  ratings: boolean;
  category: boolean;
}

// ===== PRESENTATION COMPONENT PROPS =====
export interface ProductBasicInfoProps {
  productData: ProductData;
}

export interface PricingInfoProps {
  productData: ProductData;
}

export interface SearchFormProps {
  asin: string;
  country: string;
  onAsinChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  userBalance: number;
}

export interface ExportActionsProps {
  productData: ProductData | null;
  onExportTXT: () => void;
  onDownloadImages: () => void;
  isExporting: boolean;
}

// ===== HOOK RETURN TYPES =====
export interface UseAmazonProductSearchReturn {
  // Search State
  asin: string;
  setAsin: (value: string) => void;
  country: string;
  setCountry: (value: string) => void;
  productData: ProductData | null;
  
  // Loading States
  isLoading: boolean;
  isExporting: boolean;
  error: string | null;
  
  // Actions
  handleSearch: () => Promise<void>;
  handleExportTXT: () => Promise<void>;
  handleDownloadImages: () => Promise<void>;
  
  // Credits
  userBalance: number;
  canAffordSearch: boolean;
}

export interface UseExpandableSectionsReturn {
  expandedSections: ExpandedSections;
  toggleSection: (section: keyof ExpandedSections) => void;
  expandAll: () => void;
  collapseAll: () => void;
}

export interface UseProductExportReturn {
  exportToTXT: (productData: ProductData) => Promise<void>;
  downloadImages: (productData: ProductData) => Promise<void>;
  isExporting: boolean;
  exportError: string | null;
}

// ===== CONSTANTS =====
export const FEATURE_CODE = 'tools.product_details';

export const DEFAULT_EXPANDED_SECTIONS: ExpandedSections = {
  basicInfo: true,
  pricing: false,
  description: false,
  specifications: false,
  images: false,
  videos: false,
  ranking: false,
  variations: false,
  ratings: false,
  category: false
};

// ===== CREDIT COSTS =====
export const CREDIT_COSTS = {
  SEARCH_PRODUCT: 5,
  EXPORT_TXT: 2,
  DOWNLOAD_IMAGES: 3
} as const;