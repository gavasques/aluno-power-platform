/**
 * Unified Form Types - Consolidated from multiple sources
 * Eliminates duplicate form interfaces across the codebase
 */

import { ProductDimensions } from './product';

// Base form data interface
export interface BaseFormData {
  id?: number;
  name: string;
  description?: string;
}

// Product form data variations
export interface ProductFormData extends BaseFormData {
  sku?: string;
  ean?: string;
  category?: string;
  brand?: string;
  brandId?: string;
  supplierId?: string;
  ncm?: string;
  weight?: number;
  dimensions?: ProductDimensions;
  photo?: string;
  costItem?: number;
  packCost?: number;
  taxPercent?: number;
  channels?: any[];
  active?: boolean;
}

// Edit product form data
export interface EditProductFormData extends ProductFormData {
  id: number;
  price?: number;
  salePrice?: number;
  costPrice?: number;
}

// Agent-specific form data (for AI tools)
export interface AgentFormData extends BaseFormData {
  productName?: string;
  brand?: string;
  textInput?: string;
  targetAudience?: string;
  bulletPoints?: string[];
  keywords?: string[];
  tone?: string;
  language?: string;
}

// Authentication form data
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  password: string;
  confirmPassword: string;
}

// Channel form data
export interface ChannelFormData {
  channels: any[];
}

// Supplier form data
export interface SupplierFormData extends BaseFormData {
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  contactPerson?: string;
  paymentTerms?: string;
  isActive?: boolean;
}

// Form validation result
export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
}

// Form state interface
export interface FormState<T> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
  touched: Record<string, boolean>;
}

// Form field configuration
export interface FormFieldConfig {
  name: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'file';
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: (value: any) => string | null;
  options?: Array<{ value: string; label: string }>;
  disabled?: boolean;
  className?: string;
}

// Form configuration
export interface FormConfig {
  fields: FormFieldConfig[];
  submitText?: string;
  cancelText?: string;
  className?: string;
}

// Form props interface
export interface FormProps<T> {
  initialData?: Partial<T>;
  config?: FormConfig;
  onSubmit: (data: T) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

// Legacy aliases for backward compatibility
export type ProductData = ProductFormData;
export type EditProductData = EditProductFormData;
export type FormData = BaseFormData;