/**
 * UTILS: Auth Validation
 * Funções de validação para formulários de autenticação
 * Extraído de LoginNew.tsx para modularização
 */
import { 
  LoginFormData, 
  RegisterFormData, 
  ForgotPasswordFormData, 
  ResetPasswordFormData,
  LoginErrors,
  RegisterErrors,
  ForgotPasswordErrors,
  ResetPasswordErrors,
  VALIDATION_MESSAGES 
} from '../types';

// ===== VALIDATION HELPERS =====
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

// ===== LOGIN VALIDATION =====
export const validateLoginForm = (data: LoginFormData): LoginErrors => {
  const errors: LoginErrors = {};

  // Email validation
  if (!data.email.trim()) {
    errors.email = VALIDATION_MESSAGES.REQUIRED;
  } else if (!isValidEmail(data.email)) {
    errors.email = VALIDATION_MESSAGES.EMAIL_INVALID;
  }

  // Password validation
  if (!data.password) {
    errors.password = VALIDATION_MESSAGES.REQUIRED;
  }

  return errors;
};

// ===== REGISTER VALIDATION =====
export const validateRegisterForm = (data: RegisterFormData): RegisterErrors => {
  const errors: RegisterErrors = {};

  // Name validation
  if (!data.name.trim()) {
    errors.name = VALIDATION_MESSAGES.REQUIRED;
  }

  // Email validation
  if (!data.email.trim()) {
    errors.email = VALIDATION_MESSAGES.REQUIRED;
  } else if (!isValidEmail(data.email)) {
    errors.email = VALIDATION_MESSAGES.EMAIL_INVALID;
  }

  // Password validation
  if (!data.password) {
    errors.password = VALIDATION_MESSAGES.REQUIRED;
  } else if (!isValidPassword(data.password)) {
    errors.password = VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH;
  }

  // Confirm password validation
  if (!data.confirmPassword) {
    errors.confirmPassword = VALIDATION_MESSAGES.REQUIRED;
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = VALIDATION_MESSAGES.PASSWORD_MISMATCH;
  }

  // Phone validation (optional but must be valid if provided)
  if (data.phone.trim() && !isValidPhone(data.phone)) {
    errors.phone = VALIDATION_MESSAGES.PHONE_INVALID;
  }

  // Terms validation
  if (!data.acceptedTerms) {
    errors.acceptedTerms = VALIDATION_MESSAGES.TERMS_REQUIRED;
  }

  return errors;
};

// ===== FORGOT PASSWORD VALIDATION =====
export const validateForgotPasswordForm = (data: ForgotPasswordFormData): ForgotPasswordErrors => {
  const errors: ForgotPasswordErrors = {};

  // Identifier validation
  if (!data.identifier.trim()) {
    errors.identifier = VALIDATION_MESSAGES.REQUIRED;
  } else {
    if (data.type === 'email' && !isValidEmail(data.identifier)) {
      errors.identifier = VALIDATION_MESSAGES.EMAIL_INVALID;
    } else if (data.type === 'phone' && !isValidPhone(data.identifier)) {
      errors.identifier = VALIDATION_MESSAGES.PHONE_INVALID;
    }
  }

  return errors;
};

// ===== RESET PASSWORD VALIDATION =====
export const validateResetPasswordForm = (data: ResetPasswordFormData): ResetPasswordErrors => {
  const errors: ResetPasswordErrors = {};

  // Token validation
  if (!data.token.trim()) {
    errors.token = VALIDATION_MESSAGES.REQUIRED;
  }

  // New password validation
  if (!data.newPassword) {
    errors.newPassword = VALIDATION_MESSAGES.REQUIRED;
  } else if (!isValidPassword(data.newPassword)) {
    errors.newPassword = VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH;
  }

  // Confirm password validation
  if (!data.confirmPassword) {
    errors.confirmPassword = VALIDATION_MESSAGES.REQUIRED;
  } else if (data.newPassword !== data.confirmPassword) {
    errors.confirmPassword = VALIDATION_MESSAGES.PASSWORD_MISMATCH;
  }

  return errors;
};

// ===== FIELD VALIDATION (for real-time validation) =====
export const validateField = (field: string, value: any, formData?: any): string | undefined => {
  switch (field) {
    case 'email':
      if (!value.trim()) return VALIDATION_MESSAGES.REQUIRED;
      if (!isValidEmail(value)) return VALIDATION_MESSAGES.EMAIL_INVALID;
      break;
      
    case 'password':
      if (!value) return VALIDATION_MESSAGES.REQUIRED;
      if (!isValidPassword(value)) return VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH;
      break;
      
    case 'confirmPassword':
      if (!value) return VALIDATION_MESSAGES.REQUIRED;
      if (formData?.password && value !== formData.password) return VALIDATION_MESSAGES.PASSWORD_MISMATCH;
      break;
      
    case 'name':
      if (!value.trim()) return VALIDATION_MESSAGES.REQUIRED;
      break;
      
    case 'phone':
      if (value.trim() && !isValidPhone(value)) return VALIDATION_MESSAGES.PHONE_INVALID;
      break;
      
    case 'acceptedTerms':
      if (!value) return VALIDATION_MESSAGES.TERMS_REQUIRED;
      break;
      
    case 'token':
      if (!value.trim()) return VALIDATION_MESSAGES.REQUIRED;
      break;
  }
  
  return undefined;
};