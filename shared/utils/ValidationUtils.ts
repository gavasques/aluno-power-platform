/**
 * Utilitários de validação centralizados
 * Elimina duplicação de lógica de validação
 * Providencia validadores reutilizáveis
 */
import { z } from 'zod';

export class ValidationUtils {
  // ===== VALIDAÇÕES DE FORMATO =====

  /**
   * Validação de email melhorada
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Validação de CNPJ
   */
  static isValidCNPJ(cnpj: string): boolean {
    // Remove caracteres não numéricos
    const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
    
    // Verifica se tem 14 dígitos
    if (cleanCNPJ.length !== 14) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cleanCNPJ)) return false;
    
    // Algoritmo de validação do CNPJ
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    
    const calculateDigit = (numbers: string, weights: number[]): number => {
      const sum = numbers
        .split('')
        .reduce((acc, digit, index) => acc + parseInt(digit) * weights[index], 0);
      
      const remainder = sum % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    };
    
    const firstDigit = calculateDigit(cleanCNPJ.substring(0, 12), weights1);
    const secondDigit = calculateDigit(cleanCNPJ.substring(0, 13), weights2);
    
    return (
      parseInt(cleanCNPJ.charAt(12)) === firstDigit &&
      parseInt(cleanCNPJ.charAt(13)) === secondDigit
    );
  }

  /**
   * Validação de CPF
   */
  static isValidCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/[^\d]/g, '');
    
    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleanCPF)) return false;
    
    const calculateDigit = (numbers: string, factor: number): number => {
      let sum = 0;
      for (let i = 0; i < numbers.length; i++) {
        sum += parseInt(numbers.charAt(i)) * factor--;
      }
      const remainder = sum % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    };
    
    const firstDigit = calculateDigit(cleanCPF.substring(0, 9), 10);
    const secondDigit = calculateDigit(cleanCPF.substring(0, 10), 11);
    
    return (
      parseInt(cleanCPF.charAt(9)) === firstDigit &&
      parseInt(cleanCPF.charAt(10)) === secondDigit
    );
  }

  /**
   * Validação de telefone brasileiro
   */
  static isValidBrazilianPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    
    // Aceita formatos: (11) 99999-9999, 11999999999, +5511999999999
    const phoneRegex = /^(\+55)?(\d{2})(\d{4,5})(\d{4})$/;
    return phoneRegex.test(cleanPhone);
  }

  /**
   * Validação de CEP
   */
  static isValidCEP(cep: string): boolean {
    const cleanCEP = cep.replace(/[^\d]/g, '');
    return /^\d{8}$/.test(cleanCEP);
  }

  // ===== VALIDAÇÕES NUMÉRICAS =====

  /**
   * Verifica se é um número positivo
   */
  static isPositiveNumber(value: any): boolean {
    return typeof value === 'number' && value > 0 && !isNaN(value);
  }

  /**
   * Verifica se é um número não negativo
   */
  static isNonNegativeNumber(value: any): boolean {
    return typeof value === 'number' && value >= 0 && !isNaN(value);
  }

  /**
   * Verifica se está dentro do range
   */
  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  // ===== VALIDAÇÕES DE STRING =====

  /**
   * Verifica se não está vazio
   */
  static isNotEmpty(value: string): boolean {
    return typeof value === 'string' && value.trim().length > 0;
  }

  /**
   * Verifica comprimento mínimo
   */
  static hasMinLength(value: string, minLength: number): boolean {
    return typeof value === 'string' && value.length >= minLength;
  }

  /**
   * Verifica comprimento máximo
   */
  static hasMaxLength(value: string, maxLength: number): boolean {
    return typeof value === 'string' && value.length <= maxLength;
  }

  /**
   * Validação de senha forte
   */
  static isStrongPassword(password: string): boolean {
    // Pelo menos 8 caracteres, 1 letra maiúscula, 1 minúscula, 1 número
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  }

  // ===== VALIDAÇÕES DE ARQUIVO =====

  /**
   * Validação de tipo de arquivo
   */
  static isValidFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  /**
   * Validação de tamanho de arquivo
   */
  static isValidFileSize(file: File, maxSizeBytes: number): boolean {
    return file.size <= maxSizeBytes;
  }

  /**
   * Validação de extensão de arquivo
   */
  static isValidFileExtension(filename: string, allowedExtensions: string[]): boolean {
    const extension = filename.toLowerCase().split('.').pop();
    return extension ? allowedExtensions.includes(extension) : false;
  }

  // ===== SCHEMAS ZOD REUTILIZÁVEIS =====

  /**
   * Schema para email
   */
  static emailSchema = z
    .string()
    .email('Email inválido')
    .max(254, 'Email muito longo')
    .refine(ValidationUtils.isValidEmail, 'Formato de email inválido');

  /**
   * Schema para CNPJ
   */
  static cnpjSchema = z
    .string()
    .min(14, 'CNPJ deve ter 14 dígitos')
    .max(18, 'CNPJ muito longo')
    .refine(ValidationUtils.isValidCNPJ, 'CNPJ inválido');

  /**
   * Schema para CPF
   */
  static cpfSchema = z
    .string()
    .min(11, 'CPF deve ter 11 dígitos')
    .max(14, 'CPF muito longo')
    .refine(ValidationUtils.isValidCPF, 'CPF inválido');

  /**
   * Schema para telefone
   */
  static phoneSchema = z
    .string()
    .min(10, 'Telefone muito curto')
    .max(15, 'Telefone muito longo')
    .refine(ValidationUtils.isValidBrazilianPhone, 'Telefone inválido');

  /**
   * Schema para CEP
   */
  static cepSchema = z
    .string()
    .length(8, 'CEP deve ter 8 dígitos')
    .refine(ValidationUtils.isValidCEP, 'CEP inválido');

  /**
   * Schema para número positivo
   */
  static positiveNumberSchema = z
    .number()
    .positive('Deve ser um número positivo')
    .finite('Deve ser um número válido');

  /**
   * Schema para número não negativo
   */
  static nonNegativeNumberSchema = z
    .number()
    .nonnegative('Deve ser um número não negativo')
    .finite('Deve ser um número válido');

  /**
   * Schema para string não vazia
   */
  static nonEmptyStringSchema = z
    .string()
    .min(1, 'Campo obrigatório')
    .refine(ValidationUtils.isNotEmpty, 'Campo não pode estar vazio');

  /**
   * Schema para senha forte
   */
  static strongPasswordSchema = z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .refine(
      ValidationUtils.isStrongPassword,
      'Senha deve conter pelo menos 1 letra maiúscula, 1 minúscula e 1 número'
    );

  /**
   * Schema para valor monetário
   */
  static currencySchema = z
    .number()
    .nonnegative('Valor deve ser positivo')
    .finite('Valor deve ser um número válido')
    .refine(
      (value) => Number.isFinite(value) && value >= 0,
      'Valor monetário inválido'
    );

  // ===== UTILITÁRIOS DE FORMATAÇÃO =====

  /**
   * Formatar CNPJ
   */
  static formatCNPJ(cnpj: string): string {
    const clean = cnpj.replace(/[^\d]/g, '');
    return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }

  /**
   * Formatar CPF
   */
  static formatCPF(cpf: string): string {
    const clean = cpf.replace(/[^\d]/g, '');
    return clean.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }

  /**
   * Formatar telefone
   */
  static formatPhone(phone: string): string {
    const clean = phone.replace(/[^\d]/g, '');
    if (clean.length === 11) {
      return clean.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (clean.length === 10) {
      return clean.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    }
    return phone;
  }

  /**
   * Formatar CEP
   */
  static formatCEP(cep: string): string {
    const clean = cep.replace(/[^\d]/g, '');
    return clean.replace(/^(\d{5})(\d{3})$/, '$1-$2');
  }

  // ===== CRIADORES DE SCHEMAS CUSTOMIZADOS =====

  /**
   * Criar schema para string com comprimento específico
   */
  static stringWithLength(min: number, max: number, fieldName = 'Campo') {
    return z
      .string()
      .min(min, `${fieldName} deve ter pelo menos ${min} caracteres`)
      .max(max, `${fieldName} deve ter no máximo ${max} caracteres`);
  }

  /**
   * Criar schema para número dentro de range
   */
  static numberInRange(min: number, max: number, fieldName = 'Valor') {
    return z
      .number()
      .min(min, `${fieldName} deve ser pelo menos ${min}`)
      .max(max, `${fieldName} deve ser no máximo ${max}`);
  }

  /**
   * Criar schema para arquivo
   */
  static fileSchema(allowedTypes: string[], maxSizeBytes: number) {
    return z.custom<File>((file) => {
      if (!(file instanceof File)) return false;
      if (!ValidationUtils.isValidFileType(file, allowedTypes)) return false;
      if (!ValidationUtils.isValidFileSize(file, maxSizeBytes)) return false;
      return true;
    }, 'Arquivo inválido');
  }

  // ===== VALIDAÇÕES AVANÇADAS =====

  /**
   * Validar URLs
   */
  static urlSchema = z.string().url('URL inválida');

  /**
   * Validar data não pode ser no passado
   */
  static futureDateSchema = z.date().refine(
    (date) => date > new Date(),
    'Data deve ser no futuro'
  );

  /**
   * Validar data não pode ser no futuro
   */
  static pastDateSchema = z.date().refine(
    (date) => date <= new Date(),
    'Data não pode ser no futuro'
  );
}

// Exportar constantes comuns
export const VALIDATION_CONSTANTS = {
  MAX_EMAIL_LENGTH: 254,
  CNPJ_LENGTH: 14,
  CPF_LENGTH: 11,
  CEP_LENGTH: 8,
  MIN_PASSWORD_LENGTH: 8,
  MAX_FILE_SIZE_MB: 10,
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_IMAGE_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  ALLOWED_DOCUMENT_EXTENSIONS: ['pdf', 'doc', 'docx']
};

// Mensagens de erro padrão
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Campo obrigatório',
  INVALID_EMAIL: 'Email inválido',
  INVALID_CNPJ: 'CNPJ inválido',
  INVALID_CPF: 'CPF inválido',
  INVALID_PHONE: 'Telefone inválido',
  INVALID_CEP: 'CEP inválido',
  WEAK_PASSWORD: 'Senha deve conter pelo menos 1 letra maiúscula, 1 minúscula e 1 número',
  FILE_TOO_LARGE: 'Arquivo muito grande',
  INVALID_FILE_TYPE: 'Tipo de arquivo não permitido',
  POSITIVE_NUMBER: 'Deve ser um número positivo',
  NON_NEGATIVE_NUMBER: 'Deve ser um número não negativo'
};