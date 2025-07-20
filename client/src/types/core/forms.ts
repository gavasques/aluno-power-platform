/**
 * Unified Form Types - Consolidated from multiple sources
 * Eliminates duplicate interfaces across the codebase
 */

import { z } from 'zod';

// Base form data interface
export interface BaseFormData {
  id?: string | number;
  createdAt?: string;
  updatedAt?: string;
}

// Product form data
export interface ProductFormData extends BaseFormData {
  name: string;
  sku?: string;
  internalCode?: string;
  freeCode?: string;
  supplierCode?: string;
  ean?: string;
  ncm?: string;
  costItem: number;
  taxPercent: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  brandName?: string;
  observations?: string;
  active?: boolean;
}

// Edit product form data
export interface EditProductFormData extends ProductFormData {
  id: string | number;
}

// Agent form data
export interface AgentFormData extends BaseFormData {
  name: string;
  description?: string;
  type: string;
  config: Record<string, any>;
  isActive?: boolean;
}

// Login form data
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Register form data
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

// Forgot password form data
export interface ForgotPasswordFormData {
  email: string;
}

// Reset password form data
export interface ResetPasswordFormData {
  token: string;
  password: string;
  confirmPassword: string;
}

// Supplier form data
export interface SupplierFormData extends BaseFormData {
  name: string;
  email?: string;
  phone?: string;
  cnpj?: string;
  address?: string;
  observations?: string;
  active?: boolean;
}

// Form validation result
export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings?: Record<string, string[]>;
}

// Form state
export interface FormState<T> {
  data: T;
  errors: Record<string, string[]>;
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
}

// Form field configuration
export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string | number; label: string }>;
  validation?: z.ZodSchema<any>;
  disabled?: boolean;
  hidden?: boolean;
}

// Form configuration
export interface FormConfig<T> {
  fields: FormFieldConfig[];
  initialData?: Partial<T>;
  validationSchema?: z.ZodSchema<T>;
  onSubmit: (data: T) => Promise<void>;
  onCancel?: () => void;
}

// Form props
export interface FormProps<T> {
  initialData?: Partial<T>;
  onSubmit: (data: T) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
  validationSchema?: z.ZodSchema<T>;
}

// NEW: Specific types to replace 'any' usage in event handlers
export type InputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;

export type TextareaChangeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => void;

export type SelectChangeHandler = (value: string | number) => void;

export type SelectValueChangeHandler = (value: string | number) => void;

export type CheckboxChangeHandler = (checked: boolean) => void;

export type RadioChangeHandler = (value: string | number) => void;

export type DateChangeHandler = (date: Date | null) => void;

export type FileChangeHandler = (files: FileList | null) => void;

export type FormSubmitHandler<T> = (data: T) => Promise<void>;

export type FormCancelHandler = () => void;

export type FormResetHandler = () => void;

export type FormValidationHandler<T> = (data: T) => FormValidationResult;

// Form field handlers
export interface FormFieldHandlers {
  onChange: InputChangeHandler;
  onBlur?: () => void;
  onFocus?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onKeyUp?: (e: React.KeyboardEvent) => void;
}

// Form error handlers
export type FormErrorHandler = (error: Error) => void;

export type ValidationErrorHandler = (errors: Record<string, string[]>) => void;

// Form state handlers
export type FormStateChangeHandler<T> = (state: FormState<T>) => void;

export type FormDirtyChangeHandler = (isDirty: boolean) => void;

export type FormValidChangeHandler = (isValid: boolean) => void;

// Form submission handlers
export type FormSubmissionStartHandler = () => void;

export type FormSubmissionSuccessHandler<T> = (data: T) => void;

export type FormSubmissionErrorHandler = (error: Error) => void;

export type FormSubmissionCompleteHandler = () => void;

// Form field validation handlers
export type FieldValidationHandler = (field: string, value: any) => string[];

export type FieldBlurHandler = (field: string, value: any) => void;

export type FieldFocusHandler = (field: string) => void;

// Form configuration handlers
export type FormConfigChangeHandler<T> = (config: FormConfig<T>) => void;

export type FormFieldConfigChangeHandler = (field: FormFieldConfig) => void;

// Form data handlers
export type FormDataChangeHandler<T> = (data: Partial<T>) => void;

export type FormDataResetHandler<T> = (data: T) => void;

export type FormDataLoadHandler<T> = (data: T) => void;

export type FormDataSaveHandler<T> = (data: T) => Promise<void>;

// Form utility handlers
export type FormUtilityHandler = () => void;

export type FormUtilityWithDataHandler<T> = (data: T) => void;

export type FormUtilityWithErrorHandler = (error: Error) => void;