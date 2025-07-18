import { useUnifiedFormValidation } from './useUnifiedFormValidation';

export interface MaterialFormData {
  title: string;
  description: string;
  typeId: string;
  accessLevel: "public" | "restricted";
  fileUrl: string;
  fileName: string;
  fileSize: number | null;
  fileType: string;
  externalUrl: string;
  embedCode: string;
  embedUrl: string;
  videoUrl: string;
  videoDuration: number | null;
  videoThumbnail: string;
  tags: string[];
}

export interface UseMaterialFormProps {
  initialData?: Partial<MaterialFormData>;
  onSubmit?: (data: MaterialFormData) => Promise<{ success: boolean; error?: string }>;
  onSuccess?: (data: MaterialFormData) => void;
  onError?: (error: string) => void;
}

export function useMaterialForm({
  initialData,
  onSubmit,
  onSuccess,
  onError
}: UseMaterialFormProps = {}) {
  const defaultData: MaterialFormData = {
    title: "",
    description: "",
    typeId: "",
    accessLevel: "public",
    fileUrl: "",
    fileName: "",
    fileSize: null,
    fileType: "",
    externalUrl: "",
    embedCode: "",
    embedUrl: "",
    videoUrl: "",
    videoDuration: null,
    videoThumbnail: "",
    tags: [],
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
  } = useUnifiedFormValidation<MaterialFormData>({
    initialData: defaultData,
    validationRules: {
      title: { required: true, message: 'Título é obrigatório' },
      typeId: { required: true, message: 'Tipo é obrigatório' }
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
    successMessage: 'Material salvo com sucesso!',
    errorMessage: 'Erro ao salvar material'
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