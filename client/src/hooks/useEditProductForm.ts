import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useUnifiedFormValidation } from './useUnifiedFormValidation';

export interface EditProductFormData {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
  tags: string[];
  isActive: boolean;
}

export interface UseEditProductFormProps {
  productId: number;
  onSuccess?: (data: EditProductFormData) => void;
  onCancel?: () => void;
}

export function useEditProductForm({
  productId,
  onSuccess,
  onCancel
}: UseEditProductFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<EditProductFormData>({
    id: productId,
    name: '',
    description: '',
    category: '',
    price: 0,
    imageUrl: '',
    tags: [],
    isActive: true
  });

  const {
    formData,
    isSubmitting,
    errors,
    isValid,
    updateField,
    handleSubmit,
    validateForm
  } = useUnifiedFormValidation<EditProductFormData>({
    initialData,
    validationRules: {
      name: { required: true, message: 'Nome é obrigatório' },
      description: { required: true, message: 'Descrição é obrigatória' },
      category: { required: true, message: 'Categoria é obrigatória' },
      price: { 
        required: true, 
        custom: (value) => value > 0,
        message: 'Preço deve ser maior que zero' 
      }
    },
    onSubmit: async (data) => {
      await apiRequest(`/api/products/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return { success: true };
    },
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    successMessage: 'Produto atualizado com sucesso!',
    errorMessage: 'Erro ao atualizar produto'
  });

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/products/${productId}`);
      if (response.ok) {
        const product = await response.json();
        const productData = {
          id: product.id,
          name: product.name || '',
          description: product.description || '',
          category: product.category || '',
          price: product.price || 0,
          imageUrl: product.imageUrl || '',
          tags: product.tags || [],
          isActive: product.isActive !== false
        };
        setInitialData(productData);
      } else {
        throw new Error('Produto não encontrado');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar produto';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      updateField('tags', [...formData.tags, tag.trim()]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateField('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return {
    formData,
    updateField,
    addTag,
    removeTag,
    handleSubmit,
    handleCancel,
    isLoading,
    isSubmitting,
    errors,
    isValid,
    validateForm
  };
}