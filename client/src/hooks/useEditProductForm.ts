import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
  
  const [formData, setFormData] = useState<EditProductFormData>({
    id: productId,
    name: '',
    description: '',
    category: '',
    price: 0,
    imageUrl: '',
    tags: [],
    isActive: true
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/products/${productId}`);
      if (response.ok) {
        const product = await response.json();
        setFormData({
          id: product.id,
          name: product.name || '',
          description: product.description || '',
          category: product.category || '',
          price: product.price || 0,
          imageUrl: product.imageUrl || '',
          tags: product.tags || [],
          isActive: product.isActive !== false
        });
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Preço deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateField = (field: keyof EditProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest(`/api/products/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify(formData),
      });

      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso!",
      });

      if (onSuccess) {
        onSuccess(formData);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar produto';
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const isValid = formData.name.trim() && 
                 formData.description.trim() && 
                 formData.category.trim() && 
                 formData.price > 0;

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