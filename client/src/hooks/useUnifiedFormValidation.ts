import { useState, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

// Tipos base para validação
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message?: string;
}

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule;
}

export type ValidationErrors<T> = {
  [K in keyof T]?: string;
}

// Tipo para handlers de submit
export type SubmitHandler<T> = (data: T) => Promise<{ success: boolean; error?: string }>;

// Configurações do hook
export interface UseUnifiedFormValidationOptions<T> {
  initialData: T;
  validationRules?: ValidationRules<T>;
  onSubmit?: SubmitHandler<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  showToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Hook unificado para validação de formulários
 * 
 * Consolida todos os padrões de validação encontrados nos componentes:
 * - Estados de loading e error
 * - Handlers de mudança de input
 * - Validação de campos
 * - Padrões try-catch
 * - Limpeza de erros
 * 
 * @param options Configurações do formulário
 * @returns Objeto com estados, handlers e utilitários
 */
export function useUnifiedFormValidation<T extends Record<string, any>>({
  initialData,
  validationRules = {},
  onSubmit,
  onSuccess,
  onError,
  showToast = true,
  successMessage = "Operação realizada com sucesso!",
  errorMessage = "Erro ao processar solicitação"
}: UseUnifiedFormValidationOptions<T>) {
  const { toast } = useToast();
  
  // Estados unificados
  const [formData, setFormData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors<T>>({});
  const [globalError, setGlobalError] = useState<string>('');
  const [isValid, setIsValid] = useState(false);

  // Validação de campo único
  const validateField = useCallback((fieldName: keyof T, value: any): string => {
    const rule = validationRules[fieldName];
    if (!rule) return '';

    // Validação obrigatória
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return rule.message || `${String(fieldName)} é obrigatório`;
    }

    // Validação de comprimento mínimo
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      return rule.message || `${String(fieldName)} deve ter pelo menos ${rule.minLength} caracteres`;
    }

    // Validação de comprimento máximo
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return rule.message || `${String(fieldName)} deve ter no máximo ${rule.maxLength} caracteres`;
    }

    // Validação de padrão (regex)
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return rule.message || `${String(fieldName)} tem formato inválido`;
    }

    // Validação customizada
    if (rule.custom && !rule.custom(value)) {
      return rule.message || `${String(fieldName)} é inválido`;
    }

    return '';
  }, [validationRules]);

  // Validação do formulário completo
  const validateForm = useCallback((data?: T): ValidationErrors<T> => {
    const dataToValidate = data || formData;
    const newErrors: ValidationErrors<T> = {};
    
    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName as keyof T, dataToValidate[fieldName as keyof T]);
      if (error) {
        newErrors[fieldName as keyof T] = error;
      }
    });

    return newErrors;
  }, [validationRules, validateField]);

  // Atualização de campo único
  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Limpar erro global se existir
    if (globalError) {
      setGlobalError('');
    }
  }, [errors, globalError]);

  // Handler de mudança de input unificado
  const handleInputChange = useCallback((field: keyof T) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    updateField(field, value);
  }, [updateField]);

  // Validação em tempo real
  const validateSingleField = useCallback((fieldName: keyof T, value: any) => {
    const error = validateField(fieldName, value);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
    return !error;
  }, [validateField]);

  // Limpeza de erros
  const clearErrors = useCallback(() => {
    setErrors({});
    setGlobalError('');
    setIsValid(false);
  }, []);

  const clearFieldError = useCallback((fieldName: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  // Handler de submit unificado
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    setGlobalError('');
    setIsSubmitting(true);

    // Validar formulário
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setIsSubmitting(false);
      return;
    }

    try {
      if (onSubmit) {
        const result = await onSubmit(formData);
        if (result.success) {
          if (showToast) {
            toast({
              title: "Sucesso",
              description: successMessage,
            });
          }
          onSuccess?.(formData);
        } else {
          const error = result.error || errorMessage;
          setGlobalError(error);
          if (showToast) {
            toast({
              title: "Erro",
              description: error,
              variant: "destructive",
            });
          }
          onError?.(error);
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erro de conexão';
      setGlobalError(error);
      if (showToast) {
        toast({
          title: "Erro",
          description: error,
          variant: "destructive",
        });
      }
      onError?.(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onSubmit, onSuccess, onError, showToast, successMessage, errorMessage, toast]);

  // Reset do formulário
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setGlobalError('');
    setIsValid(false);
  }, [initialData]);

  // Atualização do estado de validação
  useEffect(() => {
    const validationErrors = validateForm(formData);
    const valid = Object.keys(validationErrors).length === 0;
    setIsValid(valid);
  }, [formData, validationRules, validateForm]);

  // Atualização quando initialData mudar
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  return {
    // Estados
    formData,
    isLoading,
    isSubmitting,
    errors,
    globalError,
    isValid,

    // Handlers
    updateField,
    handleInputChange,
    handleSubmit,

    // Utilitários de validação
    validateField,
    validateSingleField,
    validateForm,
    clearErrors,
    clearFieldError,
    resetForm,

    // Setters para casos especiais
    setFormData,
    setIsLoading,
    setGlobalError,
    setErrors
  };
}

// Hook auxiliar para validação de senha (usado no RegisterForm)
export function usePasswordValidation() {
  const validatePassword = useCallback((password: string) => {
    const errors: string[] = [];
    
    if (password.length < 12) {
      errors.push('A senha deve ter pelo menos 12 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra maiúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra minúscula');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('A senha deve conter pelo menos um número');
    }
    
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push('A senha deve conter pelo menos um caractere especial');
    }
    
    return errors;
  }, []);

  const getPasswordStrength = useCallback((password: string) => {
    const errors = validatePassword(password);
    return {
      isValid: errors.length === 0,
      errors,
      strength: Math.max(0, 5 - errors.length)
    };
  }, [validatePassword]);

  return {
    validatePassword,
    getPasswordStrength
  };
}

// Regras de validação pré-definidas comuns
export const commonValidationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Email deve ter um formato válido'
  },
  password: {
    required: true,
    minLength: 12,
    message: 'Senha deve ter pelo menos 12 caracteres'
  },
  name: {
    required: true,
    minLength: 2,
    message: 'Nome deve ter pelo menos 2 caracteres'
  },
  phone: {
    pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
    message: 'Telefone deve estar no formato (XX) XXXXX-XXXX'
  }
};