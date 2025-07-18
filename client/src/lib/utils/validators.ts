/**
 * Unified Validators Utility
 * Centralized validation functions eliminating code duplication
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationOptions {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  customMessage?: string;
}

export const validators = {
  /**
   * Validate required field
   */
  required(value: any, message = 'Este campo é obrigatório'): ValidationResult {
    const isValid = value !== null && value !== undefined && value !== '';
    return {
      isValid,
      errors: isValid ? [] : [message]
    };
  },

  /**
   * Validate email format
   */
  email(value: string, message = 'Email inválido'): ValidationResult {
    if (!value) return { isValid: true, errors: [] };
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(value);
    
    return {
      isValid,
      errors: isValid ? [] : [message]
    };
  },

  /**
   * Validate numeric values
   */
  number(value: any, options: ValidationOptions = {}): ValidationResult {
    const errors: string[] = [];
    const numValue = typeof value === 'number' ? value : parseFloat(String(value || 0));
    
    if (isNaN(numValue)) {
      errors.push('Valor deve ser um número válido');
      return { isValid: false, errors };
    }

    if (options.min !== undefined && numValue < options.min) {
      errors.push(`Valor deve ser maior ou igual a ${options.min}`);
    }

    if (options.max !== undefined && numValue > options.max) {
      errors.push(`Valor deve ser menor ou igual a ${options.max}`);
    }

    if (options.custom && !options.custom(numValue)) {
      errors.push(options.customMessage || 'Valor inválido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate percentage values
   */
  percentage(value: any, message = 'Percentual deve estar entre 0% e 100%'): ValidationResult {
    return validators.number(value, {
      min: 0,
      max: 100,
      customMessage: message
    });
  },

  /**
   * Validate price values
   */
  price(value: any, message = 'Preço deve ser maior que zero'): ValidationResult {
    return validators.number(value, {
      min: 0.01,
      customMessage: message
    });
  },

  /**
   * Validate string length
   */
  string(value: string, options: ValidationOptions = {}): ValidationResult {
    const errors: string[] = [];
    
    if (options.required && (!value || value.trim().length === 0)) {
      errors.push('Este campo é obrigatório');
      return { isValid: false, errors };
    }

    if (!value) return { isValid: true, errors: [] };

    if (options.minLength !== undefined && value.length < options.minLength) {
      errors.push(`Deve ter pelo menos ${options.minLength} caracteres`);
    }

    if (options.maxLength !== undefined && value.length > options.maxLength) {
      errors.push(`Deve ter no máximo ${options.maxLength} caracteres`);
    }

    if (options.pattern && !options.pattern.test(value)) {
      errors.push(options.customMessage || 'Formato inválido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate file upload
   */
  file(file: File, options: {
    maxSize?: number;
    allowedTypes?: string[];
    required?: boolean;
  } = {}): ValidationResult {
    const errors: string[] = [];
    
    if (options.required && !file) {
      errors.push('Arquivo é obrigatório');
      return { isValid: false, errors };
    }

    if (!file) return { isValid: true, errors: [] };

    if (options.maxSize && file.size > options.maxSize) {
      const maxSizeMB = Math.round(options.maxSize / (1024 * 1024));
      errors.push(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`);
    }

    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      errors.push(`Formato não suportado. Use: ${options.allowedTypes.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate Brazilian CPF
   */
  cpf(value: string, message = 'CPF inválido'): ValidationResult {
    if (!value) return { isValid: true, errors: [] };
    
    const cpf = value.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11) {
      return { isValid: false, errors: [message] };
    }

    // Check for known invalid CPFs
    if (/^(\d)\1{10}$/.test(cpf)) {
      return { isValid: false, errors: [message] };
    }

    // Validate CPF algorithm
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit1 = 11 - (sum % 11);
    if (digit1 > 9) digit1 = 0;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    let digit2 = 11 - (sum % 11);
    if (digit2 > 9) digit2 = 0;

    const isValid = digit1 === parseInt(cpf.charAt(9)) && digit2 === parseInt(cpf.charAt(10));
    
    return {
      isValid,
      errors: isValid ? [] : [message]
    };
  },

  /**
   * Validate Brazilian CNPJ
   */
  cnpj(value: string, message = 'CNPJ inválido'): ValidationResult {
    if (!value) return { isValid: true, errors: [] };
    
    const cnpj = value.replace(/[^\d]/g, '');
    
    if (cnpj.length !== 14) {
      return { isValid: false, errors: [message] };
    }

    // Check for known invalid CNPJs
    if (/^(\d)\1{13}$/.test(cnpj)) {
      return { isValid: false, errors: [message] };
    }

    // Validate CNPJ algorithm
    let sum = 0;
    let weight = 2;
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(cnpj.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(cnpj.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    const isValid = digit1 === parseInt(cnpj.charAt(12)) && digit2 === parseInt(cnpj.charAt(13));
    
    return {
      isValid,
      errors: isValid ? [] : [message]
    };
  },

  /**
   * Validate multiple fields at once
   */
  validateFields(fields: Record<string, any>, rules: Record<string, (value: any) => ValidationResult>): ValidationResult {
    const allErrors: string[] = [];
    let isValid = true;

    for (const [fieldName, fieldValue] of Object.entries(fields)) {
      const rule = rules[fieldName];
      if (rule) {
        const result = rule(fieldValue);
        if (!result.isValid) {
          isValid = false;
          allErrors.push(...result.errors);
        }
      }
    }

    return {
      isValid,
      errors: allErrors
    };
  }
};

// Legacy aliases for backward compatibility
export const validateChannelData = validators.validateFields;
export const validateFileStructure = validators.file;
export const validateUploadedFile = validators.file;