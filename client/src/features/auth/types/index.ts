/**
 * TYPES: Authentication System
 * Tipos centralizados para sistema de autenticação
 * Extraído de LoginNew.tsx (1012 linhas) para modularização
 * Data: Janeiro 29, 2025
 */

// ===== FORM DATA TYPES =====
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  acceptedTerms: boolean;
}

export interface ForgotPasswordFormData {
  identifier: string;
  type: 'email' | 'phone';
}

export interface ResetPasswordFormData {
  token: string;
  newPassword: string;
  confirmPassword: string;
  type: 'email' | 'phone';
}

// ===== VALIDATION ERRORS =====
export interface FormErrors {
  [key: string]: string | undefined;
}

export interface LoginErrors {
  email?: string;
  password?: string;
  general?: string;
}

export interface RegisterErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  acceptedTerms?: string;
  general?: string;
}

export interface ForgotPasswordErrors {
  identifier?: string;
  type?: string;
  general?: string;
}

export interface ResetPasswordErrors {
  token?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

// ===== MODAL STATES =====
export interface ModalStates {
  isRegisterModalOpen: boolean;
  isForgotPasswordModalOpen: boolean;
  isForgotPasswordCodeModalOpen: boolean;
  isResetPasswordModalOpen: boolean;
}

// ===== FEATURE CARD TYPES =====
export interface FeatureCardData {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

// ===== HOOK RETURN TYPES =====
export interface UseLoginFormReturn {
  formData: LoginFormData;
  errors: LoginErrors;
  showPassword: boolean;
  isLoading: boolean;
  handleInputChange: (field: keyof LoginFormData) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  togglePasswordVisibility: () => void;
  clearErrors: () => void;
}

export interface UseRegisterFormReturn {
  formData: RegisterFormData;
  errors: RegisterErrors;
  showPassword: boolean;
  isLoading: boolean;
  handleInputChange: (field: keyof RegisterFormData) => (e: React.ChangeEvent<HTMLInputElement> | boolean) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  togglePasswordVisibility: () => void;
  clearErrors: () => void;
}

export interface UseForgotPasswordReturn {
  formData: ForgotPasswordFormData;
  errors: ForgotPasswordErrors;
  isLoading: boolean;
  handleInputChange: (field: keyof ForgotPasswordFormData) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTypeChange: (type: 'email' | 'phone') => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  clearErrors: () => void;
}

export interface UseResetPasswordReturn {
  formData: ResetPasswordFormData;
  errors: ResetPasswordErrors;
  isLoading: boolean;
  handleInputChange: (field: keyof ResetPasswordFormData) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  clearErrors: () => void;
}

export interface UseModalManagerReturn {
  modalStates: ModalStates;
  openModal: (modal: keyof ModalStates) => void;
  closeModal: (modal: keyof ModalStates) => void;
  closeAllModals: () => void;
}

// ===== COMPONENT PROPS TYPES =====
export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

export interface LoginFormProps {
  formData: LoginFormData;
  errors: LoginErrors;
  showPassword: boolean;
  isLoading: boolean;
  onInputChange: (field: keyof LoginFormData) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onTogglePassword: () => void;
  onForgotPassword: () => void;
}

export interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: RegisterFormData;
  errors: RegisterErrors;
  showPassword: boolean;
  isLoading: boolean;
  onInputChange: (field: keyof RegisterFormData) => (e: React.ChangeEvent<HTMLInputElement> | boolean) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onTogglePassword: () => void;
}

export interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ForgotPasswordFormData;
  errors: ForgotPasswordErrors;
  isLoading: boolean;
  onInputChange: (field: keyof ForgotPasswordFormData) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTypeChange: (type: 'email' | 'phone') => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onOpenCodeModal: () => void;
}

export interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ResetPasswordFormData;
  errors: ResetPasswordErrors;
  isLoading: boolean;
  onInputChange: (field: keyof ResetPasswordFormData) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export interface FeaturesListProps {
  features: FeatureCardData[];
}

export interface HeroSectionProps {
  onOpenRegister: () => void;
}

// ===== VALIDATION TYPES =====
export interface ValidationRule {
  test: (value: any) => boolean;
  message: string;
}

export interface ValidationSchema {
  [field: string]: ValidationRule[];
}

// ===== AUTH CONTEXT TYPES =====
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  credits?: string;
  phone?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordFormData) => Promise<void>;
  resetPassword: (data: ResetPasswordFormData) => Promise<void>;
}

// ===== CONSTANTS =====
export const FEATURE_COLORS = {
  BLUE: 'bg-blue-100 text-blue-600',
  GREEN: 'bg-green-100 text-green-600',
  PURPLE: 'bg-purple-100 text-purple-600',
  ORANGE: 'bg-orange-100 text-orange-600',
  INDIGO: 'bg-indigo-100 text-indigo-600',
  RED: 'bg-red-100 text-red-600'
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo é obrigatório',
  EMAIL_INVALID: 'Email inválido',
  PASSWORD_MIN_LENGTH: 'Senha deve ter pelo menos 6 caracteres',
  PASSWORD_MISMATCH: 'Senhas não coincidem',
  PHONE_INVALID: 'Telefone inválido',
  TERMS_REQUIRED: 'Você deve aceitar os termos de uso'
} as const;

export const INPUT_TYPES = {
  EMAIL: 'email',
  PASSWORD: 'password',
  TEXT: 'text',
  TEL: 'tel'
} as const;