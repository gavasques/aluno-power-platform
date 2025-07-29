import { useState, useEffect, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
  email?: boolean;
  cnpj?: boolean;
  cpf?: boolean;
  phone?: boolean;
  cep?: boolean;
  min?: number;
  max?: number;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export function useFormValidation(initialData: any = {}, rules: ValidationRules = {}) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValid, setIsValid] = useState(false);

  // Validação de CNPJ
  const validateCNPJ = (cnpj: string): boolean => {
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length !== 14) return false;
    
    const digits = cleaned.split('').map(Number);
    
    // Primeiro dígito verificador
    let sum = 0;
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    for (let i = 0; i < 12; i++) {
      sum += digits[i] * weights1[i];
    }
    const digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    // Segundo dígito verificador
    sum = 0;
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    for (let i = 0; i < 13; i++) {
      sum += digits[i] * weights2[i];
    }
    const digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    return digits[12] === digit1 && digits[13] === digit2;
  };

  // Validação de CPF
  const validateCPF = (cpf: string): boolean => {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return false;
    
    const digits = cleaned.split('').map(Number);
    
    // Primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += digits[i] * (10 - i);
    }
    const digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    // Segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += digits[i] * (11 - i);
    }
    const digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    return digits[9] === digit1 && digits[10] === digit2;
  };

  const validateField = useCallback((fieldName: string, value: any): string => {
    const rule = rules[fieldName];
    if (!rule) return '';

    // Required
    if (rule.required && (!value || value.toString().trim() === '')) {
      return rule.message || 'Este campo é obrigatório';
    }

    // Se não é obrigatório e está vazio, não valida outros rules
    if (!rule.required && (!value || value.toString().trim() === '')) {
      return '';
    }

    const stringValue = value?.toString() || '';

    // MinLength
    if (rule.minLength && stringValue.length < rule.minLength) {
      return rule.message || `Deve ter pelo menos ${rule.minLength} caracteres`;
    }

    // MaxLength
    if (rule.maxLength && stringValue.length > rule.maxLength) {
      return rule.message || `Deve ter no máximo ${rule.maxLength} caracteres`;
    }

    // Pattern
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      return rule.message || 'Formato inválido';
    }

    // Email
    if (rule.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(stringValue)) {
        return rule.message || 'Email inválido';
      }
    }

    // CNPJ
    if (rule.cnpj && !validateCNPJ(stringValue)) {
      return rule.message || 'CNPJ inválido';
    }

    // CPF
    if (rule.cpf && !validateCPF(stringValue)) {
      return rule.message || 'CPF inválido';
    }

    // Phone
    if (rule.phone) {
      const cleanPhone = stringValue.replace(/\D/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        return rule.message || 'Telefone inválido';
      }
    }

    // CEP
    if (rule.cep) {
      const cepPattern = /^\d{5}-?\d{3}$/;
      if (!cepPattern.test(stringValue)) {
        return rule.message || 'CEP inválido';
      }
    }

    // Min/Max para números
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        return rule.message || `Valor deve ser maior ou igual a ${rule.min}`;
      }
      if (rule.max !== undefined && value > rule.max) {
        return rule.message || `Valor deve ser menor ou igual a ${rule.max}`;
      }
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        return rule.message || customError;
      }
    }

    return '';
  }, [rules]);

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

  // Marcar campo como tocado
  const touchField = useCallback((fieldName: string) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  }, []);

  // Verificar se um campo tem erro e foi tocado
  const getFieldError = useCallback((fieldName: string): string | null => {
    return touched[fieldName] ? errors[fieldName] || null : null;
  }, [errors, touched]);

  // Reset de validação
  const resetValidation = useCallback(() => {
    setErrors({});
    setTouched({});
    setIsValid(false);
  }, []);

  // Auto-validate when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(rules).length > 0) {
      validate(initialData);
    }
  }, [initialData, rules]);

  return {
    errors,
    touched,
    isValid,
    validate,
    validateField,
    validateSingleField,
    validateForm,
    clearErrors,
    clearFieldError,
    clearError: clearFieldError,
    touchField,
    getFieldError,
    resetValidation,
    hasErrors: Object.keys(errors).length > 0
  };
}