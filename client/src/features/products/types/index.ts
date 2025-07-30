/**
 * TYPES: Products - Sistema de Produtos
 * Tipos centralizados para gerenciamento de produtos e dados básicos
 * Extraído de ProductBasicDataTab.tsx (765 linhas) para modularização
 * Data: Janeiro 30, 2025
 */

// ===== CORE TYPES =====
export interface Product {
  id: number;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  model?: string;
  sku: string;
  barcode?: string;
  status: 'active' | 'inactive' | 'draft' | 'archived';
  price: number;
  costPrice?: number;
  weight?: number;
  dimensions?: ProductDimensions;
  images: ProductImage[];
  attributes: ProductAttribute[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
  unit: 'cm' | 'm' | 'in' | 'ft';
}

export interface ProductImage {
  id: number;
  url: string;
  alt?: string;
  isMain: boolean;
  order: number;
}

export interface ProductAttribute {
  id: number;
  name: string;
  value: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
  unit?: string;
  isRequired: boolean;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  parentId?: number;
  children?: ProductCategory[];
  attributes: CategoryAttribute[];
}

export interface CategoryAttribute {
  id: number;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
  isRequired: boolean;
  options?: string[];
  unit?: string;
}

export interface Brand {
  id: number;
  name: string;
  logo?: string;
  description?: string;
}

// ===== FORM TYPES =====
export interface ProductBasicDataFormData {
  name: string;
  description?: string;
  categoryId: number;
  subcategoryId?: number;
  brandId?: number;
  model?: string;
  sku: string;
  barcode?: string;
  status: Product['status'];
  price: number;
  costPrice?: number;
  weight?: number;
  dimensions?: ProductDimensions;
  tags: string[];
  attributes: AttributeValue[];
}

export interface AttributeValue {
  attributeId: number;
  value: string | number | boolean | string[];
}

export interface ImageUploadData {
  file: File;
  alt?: string;
  isMain?: boolean;
}

// ===== STATE TYPES =====
export interface ProductBasicDataState {
  product: Product | null;
  isLoading: boolean;
  isSaving: boolean;
  isUploadingImages: boolean;
  categories: ProductCategory[];
  brands: Brand[];
  selectedCategory: ProductCategory | null;
  selectedSubcategory: ProductCategory | null;
  selectedBrand: Brand | null;
  formData: ProductBasicDataFormData;
  errors: Record<string, string>;
  isDirty: boolean;
  validationErrors: ValidationError[];
  uploadProgress: number;
  previewImages: PreviewImage[];
}

export interface PreviewImage {
  id?: number;
  file?: File;
  url: string;
  alt?: string;
  isMain: boolean;
  order: number;
  isUploading?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'invalid' | 'duplicate' | 'format';
}

// ===== HOOK RETURN TYPES =====
export interface UseProductBasicDataReturn {
  state: ProductBasicDataState;
  product: {
    data: Product | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
  };
  categories: {
    data: ProductCategory[];
    isLoading: boolean;
    error: string | null;
    tree: ProductCategory[];
  };
  brands: {
    data: Brand[];
    isLoading: boolean;
    error: string | null;
  };
  form: {
    data: ProductBasicDataFormData;
    errors: Record<string, string>;
    isDirty: boolean;
    isValid: boolean;
    validationErrors: ValidationError[];
  };
  actions: {
    // Form actions
    updateField: (field: keyof ProductBasicDataFormData, value: any) => void;
    updateAttribute: (attributeId: number, value: any) => void;
    addTag: (tag: string) => void;
    removeTag: (tag: string) => void;
    setTags: (tags: string[]) => void;
    
    // Category and brand actions
    selectCategory: (category: ProductCategory) => void;
    selectSubcategory: (subcategory: ProductCategory) => void;
    selectBrand: (brand: Brand) => void;
    
    // Image actions
    uploadImages: (files: File[]) => Promise<void>;
    removeImage: (imageId: number) => void;
    setMainImage: (imageId: number) => void;
    reorderImages: (fromIndex: number, toIndex: number) => void;
    
    // Validation and save
    validate: () => boolean;
    save: () => Promise<Product>;
    reset: () => void;
    loadProduct: (product: Product) => void;
    
    // Utility actions
    generateSKU: () => string;
    checkSKUAvailability: (sku: string) => Promise<boolean>;
    duplicateProduct: () => Promise<Product>;
  };
  images: {
    previews: PreviewImage[];
    isUploading: boolean;
    progress: number;
    errors: string[];
  };
}

export interface UseProductFormValidationReturn {
  errors: Record<string, string>;
  validationErrors: ValidationError[];
  isValid: boolean;
  validate: (data: ProductBasicDataFormData) => boolean;
  validateField: (field: keyof ProductBasicDataFormData, value: any) => string | null;
  clearErrors: () => void;
  setFieldError: (field: string, error: string) => void;
}

export interface UseProductImagesReturn {
  images: PreviewImage[];
  isUploading: boolean;
  progress: number;
  errors: string[];
  addImages: (files: File[]) => Promise<void>;
  removeImage: (index: number) => void;
  setMainImage: (index: number) => void;
  reorderImages: (fromIndex: number, toIndex: number) => void;
  updateImageAlt: (index: number, alt: string) => void;
  reset: () => void;
  loadImages: (images: ProductImage[]) => void;
}

// ===== COMPONENT PROPS TYPES =====
export interface ProductBasicDataTabContainerProps {
  productId?: number;
  readOnly?: boolean;
  onSave?: (product: Product) => void;
  onCancel?: () => void;
  showAdvancedFields?: boolean;
  allowImageUpload?: boolean;
  maxImages?: number;
}

export interface ProductBasicDataTabPresentationProps {
  state: ProductBasicDataState;
  product: UseProductBasicDataReturn['product'];
  categories: UseProductBasicDataReturn['categories'];
  brands: UseProductBasicDataReturn['brands'];
  form: UseProductBasicDataReturn['form'];
  actions: UseProductBasicDataReturn['actions'];
  images: UseProductBasicDataReturn['images'];
  readOnly?: boolean;
  showAdvancedFields?: boolean;
  allowImageUpload?: boolean;
  maxImages?: number;
}

export interface ProductBasicInfoFormProps {
  formData: ProductBasicDataFormData;
  errors: Record<string, string>;
  categories: ProductCategory[];
  brands: Brand[];
  selectedCategory: ProductCategory | null;
  selectedBrand: Brand | null;
  onFieldChange: (field: keyof ProductBasicDataFormData, value: any) => void;
  onCategorySelect: (category: ProductCategory) => void;
  onBrandSelect: (brand: Brand) => void;
  onSKUGenerate: () => void;
  readOnly?: boolean;
}

export interface ProductAttributesFormProps {
  attributes: CategoryAttribute[];
  values: AttributeValue[];
  errors: Record<string, string>;
  onAttributeChange: (attributeId: number, value: any) => void;
  readOnly?: boolean;
}

export interface ProductImagesManagerProps {
  images: PreviewImage[];
  isUploading: boolean;
  progress: number;
  errors: string[];
  maxImages?: number;
  onImagesAdd: (files: File[]) => void;
  onImageRemove: (index: number) => void;
  onMainImageSet: (index: number) => void;
  onImagesReorder: (fromIndex: number, toIndex: number) => void;
  onImageAltUpdate: (index: number, alt: string) => void;
  readOnly?: boolean;
  allowUpload?: boolean;
}

export interface ProductTagsInputProps {
  tags: string[];
  suggestions?: string[];
  onTagsChange: (tags: string[]) => void;
  onTagAdd: (tag: string) => void;
  onTagRemove: (tag: string) => void;
  placeholder?: string;
  maxTags?: number;
  readOnly?: boolean;
}

export interface CategorySelectorProps {
  categories: ProductCategory[];
  selectedCategory: ProductCategory | null;
  selectedSubcategory: ProductCategory | null;
  onCategorySelect: (category: ProductCategory) => void;
  onSubcategorySelect: (subcategory: ProductCategory) => void;
  showSubcategories?: boolean;
  readOnly?: boolean;
}

export interface BrandSelectorProps {
  brands: Brand[];
  selectedBrand: Brand | null;
  onBrandSelect: (brand: Brand) => void;
  allowCreate?: boolean;
  onBrandCreate?: (name: string) => Promise<Brand>;
  readOnly?: boolean;
}

// ===== UTILITY TYPES =====
export interface SKUGenerationOptions {
  categoryCode?: string;
  brandCode?: string;
  includeDate?: boolean;
  includeRandom?: boolean;
  format?: 'simple' | 'structured' | 'hierarchical';
}

export interface ProductValidationRules {
  name: {
    required: true;
    minLength: number;
    maxLength: number;
  };
  sku: {
    required: true;
    pattern: RegExp;
    unique: true;
  };
  price: {
    required: true;
    min: number;
    max?: number;
  };
  categoryId: {
    required: true;
  };
  weight: {
    min?: number;
    max?: number;
    unit: string;
  };
  dimensions: {
    min?: number;
    max?: number;
    unit: string;
  };
}

export interface ImageUploadOptions {
  maxSize: number; // in bytes
  allowedTypes: string[];
  maxImages: number;
  resizeOptions?: {
    maxWidth: number;
    maxHeight: number;
    quality: number;
  };
}

export interface ProductSearchFilters {
  name?: string;
  category?: number;
  brand?: number;
  status?: Product['status'];
  priceRange?: { min: number; max: number };
  tags?: string[];
  dateRange?: { start: Date; end: Date };
}

// ===== API TYPES =====
export interface CreateProductRequest {
  name: string;
  description?: string;
  categoryId: number;
  subcategoryId?: number;
  brandId?: number;
  model?: string;
  sku: string;
  barcode?: string;
  price: number;
  costPrice?: number;
  weight?: number;
  dimensions?: ProductDimensions;
  tags?: string[];
  attributes?: AttributeValue[];
  status?: Product['status'];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: number;
}

export interface UploadImageRequest extends FormData {
  // FormData with: productId, files[], alts[], mainIndex
}

export interface CheckSKURequest {
  sku: string;
  excludeProductId?: number;
}

export interface CheckSKUResponse {
  available: boolean;
  suggestions?: string[];
}

export interface SearchProductsRequest {
  query?: string;
  filters?: ProductSearchFilters;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  filters: ProductSearchFilters;
}

// ===== CONSTANTS =====
export const PRODUCT_STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo', color: 'green' },
  { value: 'inactive', label: 'Inativo', color: 'red' },
  { value: 'draft', label: 'Rascunho', color: 'yellow' },
  { value: 'archived', label: 'Arquivado', color: 'gray' }
] as const;

export const WEIGHT_UNITS = [
  { value: 'g', label: 'Gramas' },
  { value: 'kg', label: 'Quilogramas' },
  { value: 'lb', label: 'Libras' },
  { value: 'oz', label: 'Onças' }
] as const;

export const DIMENSION_UNITS = [
  { value: 'cm', label: 'Centímetros' },
  { value: 'm', label: 'Metros' },
  { value: 'in', label: 'Polegadas' },
  { value: 'ft', label: 'Pés' }
] as const;

export const ATTRIBUTE_TYPES = [
  { value: 'text', label: 'Texto' },
  { value: 'number', label: 'Número' },
  { value: 'boolean', label: 'Sim/Não' },
  { value: 'select', label: 'Seleção' },
  { value: 'multiselect', label: 'Múltipla Seleção' }
] as const;

export const SKU_FORMATS = [
  { value: 'simple', label: 'Simples (ABC123)' },
  { value: 'structured', label: 'Estruturado (CAT-BRA-001)' },
  { value: 'hierarchical', label: 'Hierárquico (CAT.SUB.BRA.001)' }
] as const;

export const DEFAULT_IMAGE_UPLOAD_OPTIONS: ImageUploadOptions = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxImages: 10,
  resizeOptions: {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.9
  }
};

export const DEFAULT_VALIDATION_RULES: ProductValidationRules = {
  name: {
    required: true,
    minLength: 3,
    maxLength: 200
  },
  sku: {
    required: true,
    pattern: /^[A-Z0-9\-\.]{3,20}$/,
    unique: true
  },
  price: {
    required: true,
    min: 0.01,
    max: 999999.99
  },
  categoryId: {
    required: true
  },
  weight: {
    min: 0.001,
    max: 9999.999,
    unit: 'kg'
  },
  dimensions: {
    min: 0.1,
    max: 999.9,
    unit: 'cm'
  }
};

// ===== ERROR TYPES =====
export type ProductErrorType = 
  | 'VALIDATION_ERROR'
  | 'DUPLICATE_SKU'
  | 'DUPLICATE_BARCODE'
  | 'INVALID_CATEGORY'
  | 'INVALID_BRAND'
  | 'IMAGE_UPLOAD_ERROR'
  | 'IMAGE_TOO_LARGE'
  | 'UNSUPPORTED_IMAGE_TYPE'
  | 'TOO_MANY_IMAGES'
  | 'SAVE_ERROR'
  | 'NETWORK_ERROR';

export interface ProductError {
  type: ProductErrorType;
  message: string;
  field?: string;
  details?: any;
}

// ===== EXPORT AGGREGATED TYPES =====
export type {
  Product as ProductData,
  ProductBasicDataFormData as BasicDataForm,
  ProductCategory as Category,
  ProductAttribute as Attribute,
  ProductImage as Image,
  Brand as ProductBrand
};