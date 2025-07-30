/**
 * TYPES: Product Basic Data Tab
 * Tipos centralizados para edição de dados básicos de produtos
 * Extraído de ProductBasicDataTab.tsx (765 linhas) para modularização
 * Data: Janeiro 30, 2025
 */

// ===== CORE TYPES =====
export interface ProductBasicData {
  id: number;
  name: string;
  description?: string;
  brand?: string;
  model?: string;
  sku: string;
  barcode?: string;
  category?: string;
  subcategory?: string;
  tags: string[];
  weight?: number;
  dimensions?: ProductDimensions;
  color?: string;
  size?: string;
  material?: string;
  origin?: string;
  manufacturer?: string;
  warranty?: string;
  isActive: boolean;
  isVisible: boolean;
  isFeatured: boolean;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'mm' | 'in';
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  parentId?: number;
  level: number;
  subcategories?: ProductCategory[];
}

export interface ProductBrand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
  isActive: boolean;
}

export interface ProductSupplier {
  id: number;
  name: string;
  corporateName?: string;
  document: string;
  email?: string;
  phone?: string;
  website?: string;
  rating: number;
  isActive: boolean;
  productCount: number;
}

// ===== FORM TYPES =====
export interface ProductBasicDataFormData {
  name: string;
  description?: string;
  brand?: string;
  model?: string;
  sku: string;
  barcode?: string;
  categoryId?: number;
  subcategoryId?: number;
  tags: string[];
  weight?: number;
  dimensions?: ProductDimensions;
  color?: string;
  size?: string;
  material?: string;
  origin?: string;
  manufacturer?: string;
  warranty?: string;
  isActive: boolean;
  isVisible: boolean;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export interface ProductVariation {
  id?: number;
  name: string;
  value: string;
  sku?: string;
  barcode?: string;
  price?: number;
  stock?: number;
  isActive: boolean;
}

export interface ProductAttribute {
  id?: number;
  name: string;
  value: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
  unit?: string;
  isRequired: boolean;
  isVisible: boolean;
}

// ===== STATE TYPES =====
export interface ProductBasicDataState {
  product: ProductBasicData | null;
  formData: ProductBasicDataFormData;
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
  activeTab: 'basic' | 'seo' | 'attributes' | 'variations';
  tagInput: string;
  availableTags: string[];
  variations: ProductVariation[];
  attributes: ProductAttribute[];
  showVariationDialog: boolean;
  showAttributeDialog: boolean;
  editingVariation: ProductVariation | null;
  editingAttribute: ProductAttribute | null;
}

// ===== HOOK RETURN TYPES =====
export interface UseProductBasicDataReturn {
  state: ProductBasicDataState;
  categories: {
    data: ProductCategory[];
    isLoading: boolean;
    error: string | null;
  };
  brands: {
    data: ProductBrand[];
    isLoading: boolean;
    error: string | null;
  };
  suppliers: {
    data: ProductSupplier[];
    isLoading: boolean;
    error: string | null;
  };
  actions: {
    // Form actions
    updateField: (field: keyof ProductBasicDataFormData, value: any) => void;
    updateDimension: (dimension: keyof ProductDimensions, value: number) => void;
    setDimensionUnit: (unit: ProductDimensions['unit']) => void;
    
    // Tag actions
    addTag: (tag: string) => void;
    removeTag: (tag: string) => void;
    setTagInput: (input: string) => void;
    
    // Variation actions
    addVariation: (variation: Omit<ProductVariation, 'id'>) => void;
    updateVariation: (id: number, variation: Partial<ProductVariation>) => void;
    removeVariation: (id: number) => void;
    showVariationForm: (variation?: ProductVariation) => void;
    hideVariationForm: () => void;
    
    // Attribute actions
    addAttribute: (attribute: Omit<ProductAttribute, 'id'>) => void;
    updateAttribute: (id: number, attribute: Partial<ProductAttribute>) => void;
    removeAttribute: (id: number) => void;
    showAttributeForm: (attribute?: ProductAttribute) => void;
    hideAttributeForm: () => void;
    
    // Tab actions
    setActiveTab: (tab: ProductBasicDataState['activeTab']) => void;
    
    // Form actions
    validate: () => boolean;
    save: () => Promise<void>;
    reset: () => void;
    loadProduct: (productId: number) => Promise<void>;
    
    // SEO actions
    generateSlug: () => void;
    generateMetaTitle: () => void;
    generateMetaDescription: () => void;
  };
  validation: {
    isValid: boolean;
    fieldErrors: Record<string, string>;
    hasUnsavedChanges: boolean;
  };
}

export interface UseProductValidationReturn {
  errors: Record<string, string>;
  isValid: boolean;
  validate: (data: ProductBasicDataFormData) => boolean;
  validateField: (field: keyof ProductBasicDataFormData, value: any) => string | null;
  clearErrors: () => void;
  setError: (field: string, error: string) => void;
}

export interface UseProductSEOReturn {
  generateSlug: (name: string) => string;
  generateMetaTitle: (name: string, brand?: string) => string;
  generateMetaDescription: (name: string, description?: string) => string;
  validateSEO: (data: { metaTitle?: string; metaDescription?: string; slug?: string }) => {
    metaTitle: { isValid: boolean; message?: string };
    metaDescription: { isValid: boolean; message?: string };
    slug: { isValid: boolean; message?: string };
  };
}

// ===== COMPONENT PROPS TYPES =====
export interface ProductBasicDataTabContainerProps {
  productId?: number;
  onSave?: (product: ProductBasicData) => void;
  onCancel?: () => void;
  readOnly?: boolean;
  showAdvancedOptions?: boolean;
}

export interface ProductBasicDataTabPresentationProps {
  state: ProductBasicDataState;
  categories: UseProductBasicDataReturn['categories'];
  brands: UseProductBasicDataReturn['brands'];
  suppliers: UseProductBasicDataReturn['suppliers'];
  actions: UseProductBasicDataReturn['actions'];
  validation: UseProductBasicDataReturn['validation'];
  readOnly?: boolean;
  showAdvancedOptions?: boolean;
}

export interface BasicInfoFormProps {
  formData: ProductBasicDataFormData;
  errors: Record<string, string>;
  categories: ProductCategory[];
  brands: ProductBrand[];
  onFieldChange: (field: keyof ProductBasicDataFormData, value: any) => void;
  onDimensionChange: (dimension: keyof ProductDimensions, value: number) => void;
  onDimensionUnitChange: (unit: ProductDimensions['unit']) => void;
  readOnly?: boolean;
}

export interface TagInputProps {
  tags: string[];
  availableTags: string[];
  tagInput: string;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onTagInputChange: (input: string) => void;
  placeholder?: string;
  maxTags?: number;
  readOnly?: boolean;
}

export interface VariationsTableProps {
  variations: ProductVariation[];
  onAddVariation: () => void;
  onEditVariation: (variation: ProductVariation) => void;
  onDeleteVariation: (id: number) => void;
  readOnly?: boolean;
}

export interface VariationFormProps {
  variation?: ProductVariation;
  onSave: (variation: Omit<ProductVariation, 'id'>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export interface AttributesTableProps {
  attributes: ProductAttribute[];
  onAddAttribute: () => void;
  onEditAttribute: (attribute: ProductAttribute) => void;
  onDeleteAttribute: (id: number) => void;
  readOnly?: boolean;
}

export interface AttributeFormProps {
  attribute?: ProductAttribute;
  onSave: (attribute: Omit<ProductAttribute, 'id'>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export interface SEOFormProps {
  formData: Pick<ProductBasicDataFormData, 'metaTitle' | 'metaDescription'>;
  product: { name: string; description?: string; brand?: string };
  errors: Record<string, string>;
  onFieldChange: (field: keyof ProductBasicDataFormData, value: any) => void;
  onGenerateSlug: () => void;
  onGenerateMetaTitle: () => void;
  onGenerateMetaDescription: () => void;
  readOnly?: boolean;
}

// ===== UTILITY TYPES =====
export interface ProductValidationRules {
  name: {
    required: true;
    minLength: 3;
    maxLength: 100;
  };
  sku: {
    required: true;
    minLength: 3;
    maxLength: 50;
    pattern: RegExp;
    unique: true;
  };
  barcode: {
    required: false;
    pattern?: RegExp;
    unique: true;
  };
  weight: {
    min: 0;
    max: 999999;
  };
  dimensions: {
    min: 0;
    max: 999999;
  };
  metaTitle: {
    maxLength: 60;
    recommended: { min: 50; max: 60 };
  };
  metaDescription: {
    maxLength: 160;
    recommended: { min: 150; max: 160 };
  };
}

export interface ProductImportData {
  name: string;
  description?: string;
  brand?: string;
  model?: string;
  sku: string;
  barcode?: string;
  category: string;
  subcategory?: string;
  tags?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  color?: string;
  size?: string;
  material?: string;
  origin?: string;
  manufacturer?: string;
  warranty?: string;
}

export interface BulkEditData {
  categoryId?: number;
  brand?: string;
  isActive?: boolean;
  isVisible?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  addTags?: string[];
  removeTags?: string[];
}

// ===== API TYPES =====
export interface CreateProductRequest {
  name: string;
  description?: string;
  brand?: string;
  model?: string;
  sku: string;
  barcode?: string;
  categoryId?: number;
  subcategoryId?: number;
  tags: string[];
  weight?: number;
  dimensions?: ProductDimensions;
  color?: string;
  size?: string;
  material?: string;
  origin?: string;
  manufacturer?: string;
  warranty?: string;
  isActive: boolean;
  isVisible: boolean;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  variations?: Omit<ProductVariation, 'id'>[];
  attributes?: Omit<ProductAttribute, 'id'>[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: number;
}

export interface ProductSearchRequest {
  query?: string;
  categoryId?: number;
  brandId?: number;
  supplierId?: number;
  tags?: string[];
  isActive?: boolean;
  isVisible?: boolean;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductSearchResponse {
  products: ProductBasicData[];
  total: number;
  page: number;
  limit: number;
  categories: ProductCategory[];
  brands: ProductBrand[];
  tags: string[];
}

// ===== CONSTANTS =====
export const DIMENSION_UNITS = [
  { value: 'cm', label: 'Centímetros' },
  { value: 'mm', label: 'Milímetros' },
  { value: 'in', label: 'Polegadas' }
] as const;

export const ATTRIBUTE_TYPES = [
  { value: 'text', label: 'Texto' },
  { value: 'number', label: 'Número' },
  { value: 'boolean', label: 'Sim/Não' },
  { value: 'select', label: 'Seleção única' },
  { value: 'multiselect', label: 'Seleção múltipla' }
] as const;

export const PRODUCT_ORIGINS = [
  'Nacional',
  'Importado',
  'China',
  'Estados Unidos',
  'Alemanha',
  'Japão',
  'Coreia do Sul',
  'Outros'
] as const;

export const PRODUCT_CONDITIONS = [
  'Novo',
  'Usado',
  'Recondicionado',
  'Aberto',
  'Defeituoso'
] as const;

export const DEFAULT_META_TITLE_TEMPLATE = '{name} - {brand} | Loja';
export const DEFAULT_META_DESCRIPTION_TEMPLATE = '{description} Compre {name} com melhor preço e qualidade.';

export const SKU_PATTERN = /^[A-Z0-9-_]+$/;
export const BARCODE_PATTERNS = {
  EAN13: /^\d{13}$/,
  EAN8: /^\d{8}$/,
  UPC: /^\d{12}$/,
  CODE128: /^[A-Za-z0-9\-\.\$\/\+\%\s]+$/
};

// ===== ERROR TYPES =====
export type ProductBasicDataErrorType = 
  | 'VALIDATION_ERROR'
  | 'DUPLICATE_SKU'
  | 'DUPLICATE_BARCODE'
  | 'INVALID_CATEGORY'
  | 'INVALID_BRAND'
  | 'SAVE_ERROR'
  | 'LOAD_ERROR'
  | 'NETWORK_ERROR'
  | 'PERMISSION_ERROR';

export interface ProductBasicDataError {
  type: ProductBasicDataErrorType;
  message: string;
  field?: string;
  details?: any;
}

// ===== EXPORT AGGREGATED TYPES =====
export type {
  ProductBasicData as Product,
  ProductBasicDataFormData as ProductForm,
  ProductCategory as Category,
  ProductBrand as Brand,
  ProductSupplier as Supplier,
  ProductVariation as Variation,
  ProductAttribute as Attribute
};