/**
 * TYPES: Product Edit - Sistema de Edição de Produtos
 * Tipos centralizados para edição e gerenciamento de produtos
 * Extraído de ProductEdit.tsx (723 linhas) para modularização
 * Data: Janeiro 30, 2025
 */

// ===== CORE TYPES =====
export interface Product {
  id: number;
  name: string;
  sku?: string;
  freeCode?: string;
  supplierCode?: string;
  internalCode?: string;
  ean?: string;
  brand?: string;
  category?: string;
  supplierId?: number;
  ncm?: string;
  costItem?: number;
  packCost?: number;
  taxPercent?: number;
  weight?: number;
  dimensions?: ProductDimensions;
  description?: string;
  bulletPoints?: string;
  observations?: string;
  photo?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;
  
  // Relacionamentos
  supplier?: Supplier;
  brandInfo?: Brand;
  categoryInfo?: Category;
}

export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
}

export interface Supplier {
  id: number;
  tradeName: string;
  corporateName: string;
  logo?: string;
  isVerified: boolean;
  averageRating: string;
  totalReviews: number;
}

export interface Brand {
  id: number;
  name: string;
  logo?: string;
  isActive: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  isActive: boolean;
}

// ===== FORM TYPES =====
export interface ProductFormData {
  name: string;
  sku?: string;
  freeCode?: string;
  supplierCode?: string;
  internalCode?: string;
  ean?: string;
  brand?: string;
  category?: string;
  supplierId?: number;
  ncm?: string;
  costItem?: number;
  packCost?: number;
  taxPercent?: number;
  weight?: number;
  dimensions?: ProductDimensions;
  description?: string;
  bulletPoints?: string;
  observations?: string;
  active: boolean;
}

export interface ProductFormFiles {
  photo?: File;
}

// ===== VALIDATION TYPES =====
export interface ProductValidationErrors {
  name?: string;
  sku?: string;
  freeCode?: string;
  supplierCode?: string;
  internalCode?: string;
  ean?: string;
  brand?: string;
  category?: string;
  supplierId?: string;
  ncm?: string;
  costItem?: string;
  packCost?: string;
  taxPercent?: string;
  weight?: string;
  dimensions?: {
    length?: string;
    width?: string;
    height?: string;
  };
  description?: string;
  bulletPoints?: string;
  observations?: string;
  photo?: string;
  general?: string[];
}

// ===== STATE TYPES =====
export interface ProductEditState {
  // Data
  product: Product | null;
  suppliers: Supplier[];
  brands: Brand[];
  categories: Category[];
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  isLoadingSuppliers: boolean;
  isLoadingBrands: boolean;
  isLoadingCategories: boolean;
  
  // Form state
  formData: ProductFormData;
  originalData: ProductFormData | null;
  isDirty: boolean;
  
  // File handling
  photoFile: File | null;
  photoPreview: string | null;
  
  // Validation
  errors: ProductValidationErrors;
  validationErrors: string[];
  
  // UI state
  activeTab: string;
  showUnsavedChangesDialog: boolean;
  isSubmitting: boolean;
}

// ===== COMPONENT PROPS TYPES =====
export interface ProductEditContainerProps {
  productId: string;
  onSuccess?: (product: Product) => void;
  onCancel?: () => void;
  readOnly?: boolean;
  showTabs?: boolean;
  defaultTab?: string;
}

export interface ProductEditPresentationProps {
  state: ProductEditState;
  productData: {
    data: Product | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
  };
  suppliersData: {
    data: Supplier[];
    isLoading: boolean;
    error: string | null;
  };
  brandsData: {
    data: Brand[];
    isLoading: boolean;
    error: string | null;
  };
  categoriesData: {
    data: Category[];
    isLoading: boolean;
    error: string | null;
  };
  actions: UseProductEditReturn['actions'];
  utils: UseProductEditReturn['utils'];
  readOnly?: boolean;
  showTabs?: boolean;
}

// ===== HOOK RETURN TYPES =====
export interface UseProductEditReturn {
  state: ProductEditState;
  productData: {
    data: Product | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
  };
  suppliersData: {
    data: Supplier[];
    isLoading: boolean;
    error: string | null;
  };
  brandsData: {
    data: Brand[];
    isLoading: boolean;
    error: string | null;
  };
  categoriesData: {
    data: Category[];
    isLoading: boolean;
    error: string | null;
  };
  actions: {
    // Form actions
    updateFormData: (field: keyof ProductFormData, value: any) => void;
    updateDimensions: (dimensions: Partial<ProductDimensions>) => void;
    resetForm: () => void;
    submitForm: () => Promise<void>;
    
    // File actions
    handlePhotoSelect: (file: File) => void;
    removePhoto: () => void;
    
    // Navigation and UI
    setActiveTab: (tab: string) => void;
    showUnsavedDialog: () => void;
    hideUnsavedDialog: () => void;
    navigateBack: () => void;
    
    // Validation
    validateForm: () => boolean;
    validateField: (field: keyof ProductFormData, value: any) => string | null;
    clearErrors: () => void;
    
    // Data refresh
    refreshSuppliers: () => void;
    refreshBrands: () => void;
    refreshCategories: () => void;
  };
  utils: {
    // Formatting
    formatCurrency: (value: number) => string;
    formatWeight: (value: number) => string;
    formatDimensions: (dimensions: ProductDimensions) => string;
    formatPercentage: (value: number) => string;
    
    // Validation helpers
    isValidEAN: (ean: string) => boolean;
    isValidNCM: (ncm: string) => boolean;
    isValidSKU: (sku: string) => boolean;
    
    // File helpers
    getFileSize: (file: File) => string;
    isValidImageType: (file: File) => boolean;
    createImagePreview: (file: File) => Promise<string>;
    
    // Form helpers
    hasChanges: () => boolean;
    getChangedFields: () => string[];
    calculateVolume: (dimensions: ProductDimensions) => number;
    
    // Product helpers
    getProductDisplayName: (product: Product) => string;
    getProductStatus: (product: Product) => 'active' | 'inactive';
    getSupplierName: (supplierId: number) => string;
    getBrandName: (brandId: string) => string;
    getCategoryName: (categoryId: string) => string;
  };
}

// ===== TAB CONFIGURATION =====
export interface ProductEditTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

export const PRODUCT_EDIT_TABS: ProductEditTab[] = [
  { id: 'basic', label: 'Informações Básicas' },
  { id: 'details', label: 'Detalhes' },
  { id: 'dimensions', label: 'Dimensões e Peso' },
  { id: 'supplier', label: 'Fornecedor' },
  { id: 'pricing', label: 'Precificação' },
  { id: 'description', label: 'Descrição' },
  { id: 'images', label: 'Imagens' },
  { id: 'advanced', label: 'Avançado' }
];

// ===== FORM SCHEMA TYPES =====
export interface ProductFormSchema {
  name: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  sku: {
    pattern?: RegExp;
    maxLength: number;
  };
  ean: {
    pattern?: RegExp;
    length?: number[];
  };
  ncm: {
    pattern?: RegExp;
    length: number;
  };
  costItem: {
    min: number;
    max: number;
  };
  packCost: {
    min: number;
    max: number;
  };
  taxPercent: {
    min: number;
    max: number;
  };
  weight: {
    min: number;
    max: number;
  };
  dimensions: {
    length: { min: number; max: number };
    width: { min: number; max: number };
    height: { min: number; max: number };
  };
}

export const PRODUCT_FORM_SCHEMA: ProductFormSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 255
  },
  sku: {
    pattern: /^[A-Za-z0-9-_]+$/,
    maxLength: 100
  },
  ean: {
    pattern: /^[0-9]+$/,
    length: [8, 13, 14]
  },
  ncm: {
    pattern: /^[0-9]{8}$/,
    length: 8
  },
  costItem: {
    min: 0,
    max: 999999.99
  },
  packCost: {
    min: 0,
    max: 999999.99
  },
  taxPercent: {
    min: 0,
    max: 100
  },
  weight: {
    min: 0,
    max: 9999.999
  },
  dimensions: {
    length: { min: 0, max: 9999.99 },
    width: { min: 0, max: 9999.99 },
    height: { min: 0, max: 9999.99 }
  }
};

// ===== CONSTANTS =====
export const PRODUCT_PHOTO_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.9
};

export const PRODUCT_FORM_DEFAULTS: ProductFormData = {
  name: '',
  sku: '',
  freeCode: '',
  supplierCode: '',
  internalCode: '',
  ean: '',
  brand: '',
  category: '',
  supplierId: undefined,
  ncm: '',
  costItem: undefined,
  packCost: undefined,
  taxPercent: undefined,
  weight: undefined,
  dimensions: {
    length: undefined,
    width: undefined,
    height: undefined,
  },
  description: '',
  bulletPoints: '',
  observations: '',
  active: true,
};

// ===== VALIDATION FUNCTIONS =====
export const validateProductForm = (data: ProductFormData): ProductValidationErrors => {
  const errors: ProductValidationErrors = {};

  // Name validation
  if (!data.name.trim()) {
    errors.name = 'Nome é obrigatório';
  } else if (data.name.length < PRODUCT_FORM_SCHEMA.name.minLength) {
    errors.name = `Nome deve ter pelo menos ${PRODUCT_FORM_SCHEMA.name.minLength} caracteres`;
  } else if (data.name.length > PRODUCT_FORM_SCHEMA.name.maxLength) {
    errors.name = `Nome deve ter no máximo ${PRODUCT_FORM_SCHEMA.name.maxLength} caracteres`;
  }

  // SKU validation
  if (data.sku && data.sku.length > PRODUCT_FORM_SCHEMA.sku.maxLength) {
    errors.sku = `SKU deve ter no máximo ${PRODUCT_FORM_SCHEMA.sku.maxLength} caracteres`;
  }
  if (data.sku && PRODUCT_FORM_SCHEMA.sku.pattern && !PRODUCT_FORM_SCHEMA.sku.pattern.test(data.sku)) {
    errors.sku = 'SKU deve conter apenas letras, números, hífens e underscores';
  }

  // EAN validation
  if (data.ean) {
    if (!PRODUCT_FORM_SCHEMA.ean.pattern?.test(data.ean)) {
      errors.ean = 'EAN deve conter apenas números';
    } else if (PRODUCT_FORM_SCHEMA.ean.length && !PRODUCT_FORM_SCHEMA.ean.length.includes(data.ean.length)) {
      errors.ean = 'EAN deve ter 8, 13 ou 14 dígitos';
    }
  }

  // NCM validation
  if (data.ncm) {
    if (!PRODUCT_FORM_SCHEMA.ncm.pattern.test(data.ncm)) {
      errors.ncm = 'NCM deve conter exatamente 8 dígitos';
    }
  }

  // Cost validation
  if (data.costItem !== undefined) {
    if (data.costItem < PRODUCT_FORM_SCHEMA.costItem.min) {
      errors.costItem = 'Custo unitário deve ser maior ou igual a 0';
    } else if (data.costItem > PRODUCT_FORM_SCHEMA.costItem.max) {
      errors.costItem = 'Custo unitário muito alto';
    }
  }

  // Pack cost validation
  if (data.packCost !== undefined) {
    if (data.packCost < PRODUCT_FORM_SCHEMA.packCost.min) {
      errors.packCost = 'Custo da embalagem deve ser maior ou igual a 0';
    } else if (data.packCost > PRODUCT_FORM_SCHEMA.packCost.max) {
      errors.packCost = 'Custo da embalagem muito alto';
    }
  }

  // Tax validation
  if (data.taxPercent !== undefined) {
    if (data.taxPercent < PRODUCT_FORM_SCHEMA.taxPercent.min) {
      errors.taxPercent = 'Percentual de imposto deve ser maior ou igual a 0';
    } else if (data.taxPercent > PRODUCT_FORM_SCHEMA.taxPercent.max) {
      errors.taxPercent = 'Percentual de imposto deve ser menor ou igual a 100';
    }
  }

  // Weight validation
  if (data.weight !== undefined) {
    if (data.weight < PRODUCT_FORM_SCHEMA.weight.min) {
      errors.weight = 'Peso deve ser maior ou igual a 0';
    } else if (data.weight > PRODUCT_FORM_SCHEMA.weight.max) {
      errors.weight = 'Peso muito alto';
    }
  }

  // Dimensions validation
  if (data.dimensions) {
    const dimensionErrors: { length?: string; width?: string; height?: string } = {};
    
    if (data.dimensions.length !== undefined) {
      if (data.dimensions.length < PRODUCT_FORM_SCHEMA.dimensions.length.min) {
        dimensionErrors.length = 'Comprimento deve ser maior ou igual a 0';
      } else if (data.dimensions.length > PRODUCT_FORM_SCHEMA.dimensions.length.max) {
        dimensionErrors.length = 'Comprimento muito alto';
      }
    }
    
    if (data.dimensions.width !== undefined) {
      if (data.dimensions.width < PRODUCT_FORM_SCHEMA.dimensions.width.min) {
        dimensionErrors.width = 'Largura deve ser maior ou igual a 0';
      } else if (data.dimensions.width > PRODUCT_FORM_SCHEMA.dimensions.width.max) {
        dimensionErrors.width = 'Largura muito alta';
      }
    }
    
    if (data.dimensions.height !== undefined) {
      if (data.dimensions.height < PRODUCT_FORM_SCHEMA.dimensions.height.min) {
        dimensionErrors.height = 'Altura deve ser maior ou igual a 0';
      } else if (data.dimensions.height > PRODUCT_FORM_SCHEMA.dimensions.height.max) {
        dimensionErrors.height = 'Altura muito alta';
      }
    }
    
    if (Object.keys(dimensionErrors).length > 0) {
      errors.dimensions = dimensionErrors;
    }
  }

  return errors;
};

export const validateProductPhoto = (file: File): string | null => {
  if (!PRODUCT_PHOTO_CONFIG.allowedTypes.includes(file.type)) {
    return 'Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.';
  }
  
  if (file.size > PRODUCT_PHOTO_CONFIG.maxSize) {
    return `Arquivo muito grande. Tamanho máximo: ${PRODUCT_PHOTO_CONFIG.maxSize / 1024 / 1024}MB`;
  }
  
  return null;
};