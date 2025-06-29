// Custom hook for Form Validation - Single Responsibility
import { useState, useCallback } from 'react';
import type { AmazonListingFormData, ValidationError } from '@/types/amazon-listing';

interface UseFormValidationReturn {
  errors: Record<string, string>;
  validateField: (field: keyof AmazonListingFormData, value: string) => void;
  validateForm: (formData: AmazonListingFormData, hasFiles: boolean) => boolean;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
}

export function useFormValidation(): UseFormValidationReturn {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((field: keyof AmazonListingFormData, value: string) => {
    const fieldErrors: Record<string, string> = {};

    switch (field) {
      case 'productName':
        if (!value.trim()) fieldErrors.productName = 'Nome do produto é obrigatório';
        break;
      case 'brand':
        if (!value.trim()) fieldErrors.brand = 'Marca é obrigatória';
        break;
      case 'category':
        if (!value.trim()) fieldErrors.category = 'Categoria é obrigatória';
        break;
      case 'keywords':
        if (!value.trim()) fieldErrors.keywords = 'Palavras-chave são obrigatórias';
        break;
      case 'reviewsData':
        if (!value.trim()) fieldErrors.reviewsData = 'Dados de avaliações são obrigatórios';
        break;
    }

    setErrors(prev => ({
      ...prev,
      ...fieldErrors,
      [field]: fieldErrors[field] || ''
    }));
  }, []);

  const validateForm = useCallback((formData: AmazonListingFormData, hasFiles: boolean): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.productName.trim()) {
      newErrors.productName = 'Nome do produto é obrigatório';
    }
    if (!formData.brand.trim()) {
      newErrors.brand = 'Marca é obrigatória';
    }
    if (!formData.category.trim()) {
      newErrors.category = 'Categoria é obrigatória';
    }
    if (!formData.keywords.trim()) {
      newErrors.keywords = 'Palavras-chave são obrigatórias';
    }

    // Reviews validation (either files or manual input required)
    if (!hasFiles && !formData.reviewsData.trim()) {
      newErrors.reviewsData = 'Dados de avaliações são obrigatórios';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearError,
    clearAllErrors
  };
}