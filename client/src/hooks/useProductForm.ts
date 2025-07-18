import { useUnifiedFormValidation } from './useUnifiedFormValidation';

export interface ProductFormData {
  id?: number;
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
  tags: string[];
  isActive: boolean;
  userId: number;
  sku: string;
  photo?: string;
  brand?: string;
  internalCode?: string;
  ean?: string;
  ncm?: string;
  observations?: string;
  supplierId?: string;
  weight?: number;
  costItem?: number;
  taxPercent?: number;
  dimensions?: { length: number; width: number; height: number };
}

export interface UseProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit?: (data: ProductFormData) => Promise<void>;
  onSuccess?: (data: ProductFormData) => void;
  onError?: (error: string) => void;
}

export function useProductForm({
  initialData,
  onSubmit,
  onSuccess,
  onError
}: UseProductFormProps = {}) {
  const defaultData: ProductFormData = {
    name: '',
    description: '',
    category: '',
    price: 0,
    imageUrl: '',
    tags: [],
    isActive: true,
    userId: 0,
    sku: '',
    photo: '',
    brand: '',
    internalCode: '',
    ean: '',
    ncm: '',
    observations: '',
    supplierId: '',
    weight: 0,
    costItem: 0,
    taxPercent: 0,
    dimensions: { length: 0, width: 0, height: 0 },
    ...initialData
  };

  const {
    formData,
    updateField,
    handleSubmit,
    resetForm,
    isSubmitting,
    errors,
    isValid,
    validateForm
  } = useUnifiedFormValidation<ProductFormData>({
    initialData: defaultData,
    validationRules: {
      name: { required: true, message: 'Nome é obrigatório' },
      sku: { required: true, message: 'SKU é obrigatório' }
    },
    onSubmit: async (data) => {
      if (onSubmit) {
        await onSubmit(data);
      }
      return { success: true };
    },
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
    successMessage: 'Produto salvo com sucesso!',
    errorMessage: 'Erro ao salvar produto'
  });

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      updateField('tags', [...formData.tags, tag.trim()]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateField('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  return {
    formData,
    updateField,
    addTag,
    removeTag,
    handleSubmit,
    resetForm,
    isSubmitting,
    errors,
    isValid,
    validateForm
  };
}