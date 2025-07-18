import { useUnifiedFormValidation } from './useUnifiedFormValidation';

export interface ToolFormData {
  name: string;
  description: string;
  category: string;
  url: string;
  isActive: boolean;
  tags: string[];
  icon?: string;
  color?: string;
  order?: number;
}

export interface UseToolFormProps {
  initialData?: Partial<ToolFormData>;
  onSubmit?: (data: ToolFormData) => Promise<{ success: boolean; error?: string }>;
  onSuccess?: (data: ToolFormData) => void;
  onError?: (error: string) => void;
}

export function useToolForm({
  initialData,
  onSubmit,
  onSuccess,
  onError
}: UseToolFormProps = {}) {
  const defaultData: ToolFormData = {
    name: "",
    description: "",
    category: "",
    url: "",
    isActive: true,
    tags: [],
    icon: "",
    color: "",
    order: 0,
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
  } = useUnifiedFormValidation<ToolFormData>({
    initialData: defaultData,
    validationRules: {
      name: { required: true, message: 'Nome é obrigatório' },
      description: { required: true, message: 'Descrição é obrigatória' },
      category: { required: true, message: 'Categoria é obrigatória' },
      url: { 
        required: true, 
        pattern: /^https?:\/\/.+/,
        message: 'URL deve começar com http:// ou https://' 
      }
    },
    onSubmit: async (data) => {
      if (onSubmit) {
        return await onSubmit(data);
      }
      return { success: true };
    },
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
    successMessage: 'Ferramenta salva com sucesso!',
    errorMessage: 'Erro ao salvar ferramenta'
  });

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      updateField('tags', [...formData.tags, tag.trim()]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateField('tags', formData.tags.filter((tag: string) => tag !== tagToRemove));
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