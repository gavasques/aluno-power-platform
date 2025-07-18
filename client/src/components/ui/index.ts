/**
 * Unified UI Components - Central export for all base components
 * Consolidates component patterns eliminating duplicates across the codebase
 */

// Modal components
export * from './BaseModal';
export type { BaseModalProps, ConfirmModalProps } from './BaseModal';

// Card components
export * from './BaseCard';
export type { BaseCardProps, StatusCardProps, ActionCardProps } from './BaseCard';

// Form components
export * from './BaseForm';
export type { BaseFormProps, FormField, FormSection } from './BaseForm';

// Button components
export * from './ActionButtonGroup';
export type { 
  ActionButtonGroupProps, 
  ActionButton, 
  SaveCancelButtonsProps, 
  DeleteCancelButtonsProps, 
  ActionButtonProps 
} from './ActionButtonGroup';

// Common prop interfaces for consistency
export interface CommonUIProps {
  className?: string;
  children?: React.ReactNode;
  isLoading?: boolean;
}

export interface EventHandlerProps {
  onClose?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onSubmit?: (data: any) => void;
}

export interface LayoutProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

export interface FormProps {
  initialData?: Record<string, any>;
  isLoading?: boolean;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
}

export interface ValidationProps {
  required?: boolean;
  validation?: (value: any) => string | null;
  error?: string;
  touched?: boolean;
}

// Size variants used across components
export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Color variants used across components
export type ColorVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive';

// Status variants used across components
export type StatusVariant = 'default' | 'success' | 'warning' | 'error' | 'info';