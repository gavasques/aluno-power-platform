/**
 * TYPES: Imported Products System
 * Tipos centralizados para sistema de formulário de produtos importados
 * Extraído de ImportedProductForm.tsx (926 linhas) para modularização
 * Data: Janeiro 29, 2025
 */

// ===== FORM DATA TYPES =====
export interface ImportedProductFormData {
  name: string;
  sku: string;
  description: string;
  category: string;
  brand: string;
  supplier: string;
  cost: number;
  sellingPrice: number;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  images: File[];
  tags: string[];
  status: 'draft' | 'active' | 'inactive';
  specifications: Record<string, string>;
  variations: ProductVariation[];
  inventory: {
    quantity: number;
    minStock: number;
    maxStock: number;
    location: string;
  };
  shipping: {
    freeShipping: boolean;
    shippingCost: number;
    estimatedDelivery: number;
    restrictions: string[];
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  compliance: {
    certifications: string[];
    documents: File[];
    regulations: string[];
  };
}

export interface ProductVariation {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  inventory: number;
  attributes: Record<string, string>;
  images: File[];
}

// ===== STATE TYPES =====
export interface ImportedProductState {
  formData: ImportedProductFormData;
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  currentStep: number;
  totalSteps: number;
  errors: ImportedProductErrors;
  validationResults: ValidationResults;
  previewMode: boolean;
  autoSave: boolean;
}

// ===== VALIDATION TYPES =====
export interface ImportedProductErrors {
  name?: string;
  sku?: string;
  description?: string;
  category?: string;
  brand?: string;
  supplier?: string;
  cost?: string;
  sellingPrice?: string;
  weight?: string;
  dimensions?: {
    length?: string;
    width?: string;
    height?: string;
  };
  images?: string;
  tags?: string;
  specifications?: Record<string, string>;
  variations?: Record<string, ProductVariationErrors>;
  inventory?: {
    quantity?: string;
    minStock?: string;
    maxStock?: string;
    location?: string;
  };
  shipping?: {
    shippingCost?: string;
    estimatedDelivery?: string;
    restrictions?: string;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  compliance?: {
    certifications?: string;
    documents?: string;
    regulations?: string;
  };
  general?: string;
}

export interface ProductVariationErrors {
  name?: string;
  sku?: string;
  price?: string;
  cost?: string;
  inventory?: string;
  attributes?: Record<string, string>;
  images?: string;
}

export interface ValidationResults {
  isValid: boolean;
  completeness: number;
  score: number;
  suggestions: string[];
  warnings: string[];
  criticalIssues: string[];
}

// ===== HOOK RETURN TYPES =====
export interface UseImportedProductFormReturn {
  state: ImportedProductState;
  actions: {
    updateField: (field: keyof ImportedProductFormData, value: any) => void;
    updateNestedField: (path: string, value: any) => void;
    addVariation: (variation: ProductVariation) => void;
    updateVariation: (index: number, variation: ProductVariation) => void;
    removeVariation: (index: number) => void;
    addImage: (file: File, variationIndex?: number) => void;
    removeImage: (index: number, variationIndex?: number) => void;
    addTag: (tag: string) => void;
    removeTag: (index: number) => void;
    updateSpecification: (key: string, value: string) => void;
    removeSpecification: (key: string) => void;
    validateForm: () => Promise<ValidationResults>;
    saveProduct: () => Promise<boolean>;
    saveDraft: () => Promise<boolean>;
    resetForm: () => void;
    loadProduct: (id: string) => Promise<void>;
    duplicateProduct: () => void;
    togglePreview: () => void;
    toggleAutoSave: () => void;
    nextStep: () => void;
    previousStep: () => void;
    goToStep: (step: number) => void;
  };
  validation: {
    errors: ImportedProductErrors;
    results: ValidationResults;
    isValid: boolean;
    validateField: (field: string) => Promise<string | undefined>;
    clearErrors: () => void;
    clearFieldError: (field: string) => void;
  };
  navigation: {
    currentStep: number;
    totalSteps: number;
    canGoNext: boolean;
    canGoPrevious: boolean;
    stepTitles: string[];
    completedSteps: number[];
  };
}

export interface UseProductStepsReturn {
  currentStep: number;
  totalSteps: number;
  stepData: StepData[];
  canGoNext: boolean;
  canGoPrevious: boolean;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  markStepCompleted: (step: number) => void;
  getStepValidation: (step: number) => boolean;
}

export interface UseProductValidationReturn {
  errors: ImportedProductErrors;
  results: ValidationResults;
  isValid: boolean;
  validateForm: () => Promise<ValidationResults>;
  validateField: (field: string) => Promise<string | undefined>;
  validateStep: (step: number) => Promise<boolean>;
  clearErrors: () => void;
  clearFieldError: (field: string) => void;
  setFieldError: (field: string, error: string) => void;
}

export interface UseProductImagesReturn {
  images: File[];
  previews: string[];
  isUploading: boolean;
  uploadProgress: Record<string, number>;
  addImages: (files: File[]) => void;
  removeImage: (index: number) => void;
  reorderImages: (startIndex: number, endIndex: number) => void;
  setMainImage: (index: number) => void;
  compressImages: () => Promise<void>;
  generateThumbnails: () => Promise<void>;
  validateImages: () => string[];
}

// ===== COMPONENT PROPS TYPES =====
export interface ImportedProductFormContainerProps {
  productId?: string;
  mode?: 'create' | 'edit' | 'duplicate';
  onSuccess?: (product: ImportedProductFormData) => void;
  onCancel?: () => void;
}

export interface ImportedProductFormPresentationProps {
  state: ImportedProductState;
  actions: UseImportedProductFormReturn['actions'];
  validation: UseImportedProductFormReturn['validation'];
  navigation: UseImportedProductFormReturn['navigation'];
  onSuccess?: (product: ImportedProductFormData) => void;
  onCancel?: () => void;
}

export interface ProductFormStepsProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  completedSteps: number[];
  onStepClick: (step: number) => void;
  canGoToStep: (step: number) => boolean;
}

export interface BasicInfoStepProps {
  formData: ImportedProductFormData;
  errors: ImportedProductErrors;
  onChange: (field: keyof ImportedProductFormData, value: any) => void;
  onValidate: (field: string) => Promise<string | undefined>;
}

export interface InventoryStepProps {
  formData: ImportedProductFormData;
  errors: ImportedProductErrors;
  onChange: (field: keyof ImportedProductFormData, value: any) => void;
  onValidate: (field: string) => Promise<string | undefined>;
}

export interface ImagesStepProps {
  images: File[];
  previews: string[];
  errors: ImportedProductErrors;
  onAddImages: (files: File[]) => void;
  onRemoveImage: (index: number) => void;
  onReorderImages: (startIndex: number, endIndex: number) => void;
  onSetMainImage: (index: number) => void;
}

export interface VariationsStepProps {
  variations: ProductVariation[];
  errors: ImportedProductErrors;
  onAddVariation: (variation: ProductVariation) => void;
  onUpdateVariation: (index: number, variation: ProductVariation) => void;
  onRemoveVariation: (index: number) => void;
}

export interface SEOStepProps {
  formData: ImportedProductFormData;
  errors: ImportedProductErrors;
  onChange: (field: keyof ImportedProductFormData, value: any) => void;
  onValidate: (field: string) => Promise<string | undefined>;
  onGenerateSEO: () => void;
}

export interface ComplianceStepProps {
  formData: ImportedProductFormData;
  errors: ImportedProductErrors;
  onChange: (field: keyof ImportedProductFormData, value: any) => void;
  onValidate: (field: string) => Promise<string | undefined>;
}

export interface PreviewStepProps {
  formData: ImportedProductFormData;
  validation: ValidationResults;
  onEdit: (step: number) => void;
}

// ===== UTILITY TYPES =====
export interface StepData {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  isCompleted: boolean;
  isActive: boolean;
  canNavigate: boolean;
  requiredFields: string[];
  validationRules: ValidationRule[];
}

export interface ValidationRule {
  field: string;
  test: (value: any, formData: ImportedProductFormData) => boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'multiselect' | 'file' | 'checkbox' | 'radio';
  placeholder?: string;
  required: boolean;
  validation: ValidationRule[];
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  accept?: string;
  multiple?: boolean;
  rows?: number;
  cols?: number;
  helpText?: string;
  icon?: React.ReactNode;
  dependencies?: string[];
  conditionalDisplay?: (formData: ImportedProductFormData) => boolean;
}

export interface CategoryOption {
  id: string;
  name: string;
  parent?: string;
  level: number;
  path: string;
  attributes: string[];
}

export interface BrandOption {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  verified: boolean;
}

export interface SupplierOption {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country: string;
  rating: number;
  verified: boolean;
  products: number;
}

// ===== CONSTANTS =====
export const FORM_STEPS = [
  { id: 1, title: 'Informações Básicas', description: 'Nome, categoria, marca e descrição' },
  { id: 2, title: 'Precificação', description: 'Custos, preços e margens' },
  { id: 3, title: 'Especificações', description: 'Dimensões, peso e características' },
  { id: 4, title: 'Imagens', description: 'Fotos e mídia do produto' },
  { id: 5, title: 'Inventário', description: 'Estoque e localização' },
  { id: 6, title: 'Variações', description: 'Cores, tamanhos e modelos' },
  { id: 7, title: 'Envio', description: 'Custos e políticas de entrega' },
  { id: 8, title: 'SEO', description: 'Otimização para buscas' },
  { id: 9, title: 'Conformidade', description: 'Certificações e documentos' },
  { id: 10, title: 'Prévia', description: 'Revisão final antes de salvar' }
] as const;

export const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo é obrigatório',
  MIN_LENGTH: 'Mínimo de {min} caracteres',
  MAX_LENGTH: 'Máximo de {max} caracteres',
  INVALID_EMAIL: 'Email inválido',
  INVALID_NUMBER: 'Número inválido',
  MIN_VALUE: 'Valor mínimo: {min}',
  MAX_VALUE: 'Valor máximo: {max}',
  INVALID_SKU: 'SKU deve ter formato válido',
  DUPLICATE_SKU: 'SKU já existe no sistema',
  INVALID_IMAGE: 'Formato de imagem inválido',
  IMAGE_TOO_LARGE: 'Imagem muito grande (máx: {max}MB)',
  TOO_MANY_IMAGES: 'Máximo de {max} imagens',
  INVALID_DIMENSIONS: 'Dimensões inválidas',
  PRICE_LOWER_COST: 'Preço deve ser maior que o custo',
  INVALID_VARIATION: 'Variação inválida',
  MISSING_REQUIRED_FIELD: 'Campo obrigatório não preenchido'
} as const;

export const IMAGE_CONSTRAINTS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 20,
  ACCEPTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
  MIN_DIMENSIONS: { width: 300, height: 300 },
  MAX_DIMENSIONS: { width: 5000, height: 5000 },
  THUMBNAIL_SIZE: { width: 150, height: 150 }
} as const;

// ===== ERROR TYPES =====
export type ProductFormErrorType = 
  | 'VALIDATION_ERROR'
  | 'SAVE_ERROR'
  | 'LOAD_ERROR'
  | 'IMAGE_ERROR'
  | 'NETWORK_ERROR'
  | 'PERMISSION_ERROR'
  | 'UNKNOWN_ERROR';

export interface ProductFormError {
  type: ProductFormErrorType;
  message: string;
  field?: string;
  details?: any;
}

// ===== API TYPES =====
export interface SaveProductRequest {
  product: ImportedProductFormData;
  isDraft: boolean;
  validateOnly?: boolean;
}

export interface SaveProductResponse {
  success: boolean;
  productId: string;
  message: string;
  validation?: ValidationResults;
  errors?: ImportedProductErrors;
}

export interface LoadProductResponse {
  success: boolean;
  product: ImportedProductFormData;
  message: string;
}

// ===== EXPORT TYPES =====
export interface ExportProductData {
  basic: ImportedProductFormData;
  images: { url: string; alt: string; main: boolean }[];
  variations: ProductVariation[];
  calculated: {
    margin: number;
    profitability: number;
    breakeven: number;
    roi: number;
  };
  seo: {
    score: number;
    keywords: string[];
    suggestions: string[];
  };
  compliance: {
    status: 'compliant' | 'pending' | 'non-compliant';
    checklist: { item: string; status: boolean }[];
  };
}