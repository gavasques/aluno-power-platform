/**
 * Hook personalizado para gerenciamento de formulários complexos
 * Reduz a necessidade de múltiplos useState e centraliza lógica de validação
 */
import { useState, useCallback } from 'react';
import type { ZodSchema } from 'zod';

interface UseFormManagerOptions<T> {
  validationSchema?: ZodSchema<T>;
  validateOnChange?: boolean;
  resetOnSubmit?: boolean;
}

interface FormField {
  value: any;
  error?: string;
  touched: boolean;
}

export const useFormManager = <T extends Record<string, any>>(
  initialData: T,
  options: UseFormManagerOptions<T> = {}
) => {
  const { validationSchema, validateOnChange = true, resetOnSubmit = false } = options;
  
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((field: keyof T, value: any): string | undefined => {
    if (!validationSchema) return undefined;

    try {
      const testData = { ...data, [field]: value };
      validationSchema.parse(testData);
      return undefined;
    } catch (error: any) {
      const fieldError = error.issues?.find((issue: any) => issue.path[0] === field);
      return fieldError?.message;
    }
  }, [data, validationSchema]);

  const updateField = useCallback((field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Marcar campo como touched
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validação em tempo real se habilitada
    if (validateOnChange && validationSchema) {
      const fieldError = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: fieldError }));
    }
  }, [validateField, validateOnChange, validationSchema]);

  const validateForm = useCallback((): boolean => {
    if (!validationSchema) return true;

    try {
      validationSchema.parse(data);
      setErrors({});
      return true;
    } catch (error: any) {
      const newErrors: Partial<Record<keyof T, string>> = {};
      error.issues?.forEach((issue: any) => {
        if (issue.path[0] && typeof issue.path[0] === 'string') {
          newErrors[issue.path[0] as keyof T] = issue.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
  }, [data, validationSchema]);

  const handleSubmit = useCallback(async (
    onSubmit: (data: T) => Promise<void> | void
  ) => {
    setIsSubmitting(true);
    
    try {
      const isValid = validateForm();
      if (!isValid) {
        // Marcar todos os campos como touched para mostrar erros
        const allTouched = Object.keys(data).reduce((acc, key) => {
          acc[key as keyof T] = true;
          return acc;
        }, {} as Partial<Record<keyof T, boolean>>);
        setTouched(allTouched);
        return false;
      }

      await onSubmit(data);
      
      if (resetOnSubmit) {
        reset();
      }
      
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [data, validateForm, resetOnSubmit]);

  const reset = useCallback(() => {
    setData(initialData);
    setErrors({});
    setTouched({});
    setIsDirty(false);
    setIsSubmitting(false);
  }, [initialData]);

  const setFieldError = useCallback((field: keyof T, error: string | undefined) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const getFieldProps = useCallback((field: keyof T) => ({
    value: data[field],
    onChange: (value: any) => updateField(field, value),
    error: touched[field] ? errors[field] : undefined,
    touched: touched[field] || false,
  }), [data, errors, touched, updateField]);

  return {
    // Dados do formulário
    data,
    errors,
    touched,
    isDirty,
    isSubmitting,
    
    // Métodos de manipulação
    updateField,
    validateForm,
    handleSubmit,
    reset,
    setFieldError,
    clearErrors,
    
    // Helpers
    getFieldProps,
    
    // Estado computado
    isValid: Object.keys(errors).length === 0,
    hasErrors: Object.keys(errors).length > 0,
  };
};