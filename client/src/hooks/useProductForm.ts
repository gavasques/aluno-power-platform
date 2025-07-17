import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<ProductFormData>({
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
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => {
        // Only update if data actually changed to prevent loops
        const hasChanges = Object.keys(initialData).some(key => 
          JSON.stringify(prev[key]) !== JSON.stringify(initialData[key])
        );
        
        if (hasChanges) {
          return {
            ...prev,
            ...initialData
          };
        }
        return prev;
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Only Name and SKU are required
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.sku || !formData.sku.trim()) {
      newErrors.sku = 'SKU é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateField = (field: string, value: any) => {
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
      if (onSubmit) {
        await onSubmit(formData);
      }

      toast({
        title: "Sucesso",
        description: "Produto salvo com sucesso!",
      });

      if (onSuccess) {
        onSuccess(formData);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar produto';
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });

      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
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
    });
    setErrors({});
  };

  const isValid = formData.name.trim() && 
                 formData.sku && formData.sku.trim();

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