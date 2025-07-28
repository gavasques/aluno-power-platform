/**
 * Unified Validators - Consolidated validation functions
 * This file consolidates all duplicate validation logic across the codebase
 * following the DRY principle.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate required fields in an object
 * @param data - Object to validate
 * @param requiredFields - Array of required field names
 * @returns Validation result
 */
export function validateRequiredFields(
  data: Record<string, any>, 
  requiredFields: string[]
): ValidationResult {
  const errors: string[] = [];
  
  for (const field of requiredFields) {
    const value = data[field];
    if (value === null || value === undefined || value === '' || 
        (Array.isArray(value) && value.length === 0)) {
      errors.push(`Campo obrigatório: ${field}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate numeric fields have valid positive values
 * @param data - Object to validate
 * @param numericFields - Array of numeric field names
 * @returns Validation result
 */
export function validateNumericFields(
  data: Record<string, any>, 
  numericFields: string[]
): ValidationResult {
  const errors: string[] = [];
  
  for (const field of numericFields) {
    const value = data[field];
    if (value !== undefined && value !== null && value !== '') {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 0) {
        errors.push(`${field} deve ser um número válido e positivo`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate dimensions object
 * @param dimensions - Dimensions object with length, width, height
 * @returns Validation result
 */
export function validateDimensions(
  dimensions: { length?: number; width?: number; height?: number } | null | undefined
): ValidationResult {
  const errors: string[] = [];
  
  if (!dimensions) {
    errors.push('Dimensões são obrigatórias');
    return { isValid: false, errors };
  }
  
  const { length, width, height } = dimensions;
  
  if (!length || length <= 0) {
    errors.push('Comprimento deve ser maior que zero');
  }
  if (!width || width <= 0) {
    errors.push('Largura deve ser maior que zero');
  }
  if (!height || height <= 0) {
    errors.push('Altura deve ser maior que zero');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate weight value
 * @param weight - Weight value to validate
 * @returns Validation result
 */
export function validateWeight(weight: number | null | undefined): ValidationResult {
  const errors: string[] = [];
  
  if (weight === null || weight === undefined) {
    errors.push('Peso é obrigatório');
  } else if (weight <= 0) {
    errors.push('Peso deve ser maior que zero');
  } else if (weight > 1000) {
    errors.push('Peso não pode ser maior que 1000kg');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate formal import simulation data
 * @param simulation - Simulation data to validate
 * @returns Validation result
 */
export function validateFormalImportSimulation(simulation: any): ValidationResult {
  const errors: string[] = [];
  
  // Required fields validation
  const requiredResult = validateRequiredFields(simulation, [
    'name', 'supplierName', 'originCountry', 'products'
  ]);
  errors.push(...requiredResult.errors);
  
  // Numeric fields validation
  const numericResult = validateNumericFields(simulation, [
    'exchangeRate', 'domesticFreight', 'internationalFreight'
  ]);
  errors.push(...numericResult.errors);
  
  // Products validation
  if (simulation.products && Array.isArray(simulation.products)) {
    if (simulation.products.length === 0) {
      errors.push('Pelo menos um produto é obrigatório');
    } else {
      simulation.products.forEach((product: any, index: number) => {
        const productErrors = validateProduct(product);
        productErrors.errors.forEach(error => {
          errors.push(`Produto ${index + 1}: ${error}`);
        });
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate individual product data
 * @param product - Product data to validate
 * @returns Validation result
 */
export function validateProduct(product: any): ValidationResult {
  const errors: string[] = [];
  
  // Required fields for product
  const requiredResult = validateRequiredFields(product, [
    'name', 'quantity', 'unitPrice'
  ]);
  errors.push(...requiredResult.errors);
  
  // Numeric validations
  if (product.quantity && product.quantity <= 0) {
    errors.push('Quantidade deve ser maior que zero');
  }
  
  if (product.unitPrice && product.unitPrice <= 0) {
    errors.push('Preço unitário deve ser maior que zero');
  }
  
  // Dimensions validation if provided
  if (product.dimensions) {
    const dimensionsResult = validateDimensions(product.dimensions);
    errors.push(...dimensionsResult.errors);
  }
  
  // Weight validation if provided
  if (product.weight !== undefined) {
    const weightResult = validateWeight(product.weight);
    errors.push(...weightResult.errors);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns Validation result
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email é obrigatório');
  } else if (!emailRegex.test(email)) {
    errors.push('Formato de email inválido');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate CPF format and check digit
 * @param cpf - CPF string to validate
 * @returns Validation result
 */
export function validateCPF(cpf: string): ValidationResult {
  const errors: string[] = [];
  
  if (!cpf) {
    errors.push('CPF é obrigatório');
    return { isValid: false, errors };
  }
  
  // Remove formatting
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) {
    errors.push('CPF deve ter 11 dígitos');
    return { isValid: false, errors };
  }
  
  // Check for repeated digits
  if (/^(\d)\1{10}$/.test(cleaned)) {
    errors.push('CPF inválido');
    return { isValid: false, errors };
  }
  
  // Validate check digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;
  
  if (parseInt(cleaned.charAt(9)) !== digit1 || parseInt(cleaned.charAt(10)) !== digit2) {
    errors.push('CPF inválido');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate CNPJ format and check digit
 * @param cnpj - CNPJ string to validate
 * @returns Validation result
 */
export function validateCNPJ(cnpj: string): ValidationResult {
  const errors: string[] = [];
  
  if (!cnpj) {
    errors.push('CNPJ é obrigatório');
    return { isValid: false, errors };
  }
  
  // Remove formatting
  const cleaned = cnpj.replace(/\D/g, '');
  
  if (cleaned.length !== 14) {
    errors.push('CNPJ deve ter 14 dígitos');
    return { isValid: false, errors };
  }
  
  // Check for repeated digits
  if (/^(\d)\1{13}$/.test(cleaned)) {
    errors.push('CNPJ inválido');
    return { isValid: false, errors };
  }
  
  // Validate check digits
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned.charAt(i)) * weights1[i];
  }
  let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned.charAt(i)) * weights2[i];
  }
  let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  if (parseInt(cleaned.charAt(12)) !== digit1 || parseInt(cleaned.charAt(13)) !== digit2) {
    errors.push('CNPJ inválido');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate file type and size
 * @param file - File to validate
 * @param allowedTypes - Array of allowed MIME types
 * @param maxSizeBytes - Maximum file size in bytes
 * @returns Validation result
 */
export function validateFile(
  file: File, 
  allowedTypes: string[], 
  maxSizeBytes: number
): ValidationResult {
  const errors: string[] = [];
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`);
  }
  
  if (file.size > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(1);
    errors.push(`Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @param minLength - Minimum password length (default: 8)
 * @returns Validation result
 */
export function validatePassword(password: string, minLength: number = 8): ValidationResult {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Senha é obrigatória');
    return { isValid: false, errors };
  }
  
  if (password.length < minLength) {
    errors.push(`Senha deve ter pelo menos ${minLength} caracteres`);
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}