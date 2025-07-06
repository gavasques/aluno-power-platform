import { useState, useEffect } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
  message?: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export function useFormValidation(initialData: any = {}, rules: ValidationRules = {}) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValid, setIsValid] = useState(false);

  const validateField = (fieldName: string, value: string): string => {
    const rule = rules[fieldName];
    if (!rule) return '';

    if (rule.required && (!value || value.trim() === '')) {
      return rule.message || `${fieldName} é obrigatório`;
    }

    if (rule.minLength && value.length < rule.minLength) {
      return rule.message || `${fieldName} deve ter pelo menos ${rule.minLength} caracteres`;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return rule.message || `${fieldName} deve ter no máximo ${rule.maxLength} caracteres`;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message || `${fieldName} tem formato inválido`;
    }

    if (rule.custom && !rule.custom(value)) {
      return rule.message || `${fieldName} é inválido`;
    }

    return '';
  };

  const validateForm = (data: any): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    
    Object.keys(rules).forEach(fieldName => {
      const error = validateField(fieldName, data[fieldName] || '');
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    return newErrors;
  };

  const validate = (data: any) => {
    const newErrors = validateForm(data);
    setErrors(newErrors);
    const valid = Object.keys(newErrors).length === 0;
    setIsValid(valid);
    return valid;
  };

  const validateSingleField = (fieldName: string, value: string) => {
    const error = validateField(fieldName, value);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
    return !error;
  };

  const clearErrors = () => {
    setErrors({});
    setIsValid(false);
  };

  const clearFieldError = (fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  // Auto-validate when initialData changes
  useEffect(() => {
    if (initialData) {
      validate(initialData);
    }
  }, [initialData]);

  return {
    errors,
    isValid,
    validate,
    validateField,
    validateSingleField,
    validateForm,
    clearErrors,
    clearFieldError,
    clearError: clearFieldError
  };
}