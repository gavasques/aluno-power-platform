/**
 * Unified Core Types - Central export for all consolidated types
 * Eliminates duplicate type definitions across the codebase
 */

// Product types
export * from './product';
export * from './channel';
export * from './forms';

// Re-export commonly used types with aliases for backward compatibility
export type {
  Product,
  ProductFormData,
  ProductListItem,
  ProductDimensions,
  ProductDescriptions,
  BaseProduct,
  InsertProduct,
  CostCalculation,
  ProductEditMode
} from './product';

export type {
  ChannelType,
  SalesChannel,
  BaseChannel,
  ChannelCostData,
  ChannelCalculationResult,
  ChannelFormData,
  ChannelEditorProps,
  ChannelCalculatorProps,
  ChannelUpdateRequest,
  ChannelUpdateResponse,
  ProductChannels,
  ChannelFees
} from './channel';

export type {
  BaseFormData,
  ProductFormData as FormProductData,
  EditProductFormData,
  AgentFormData,
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  SupplierFormData,
  FormValidationResult,
  FormState,
  FormFieldConfig,
  FormConfig,
  FormProps
} from './forms';

// Common utility types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

export interface FilterOptions {
  search?: string;
  category?: string;
  brand?: string;
  status?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Loading and error states
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  data: any;
}

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated?: Date;
}

// Navigation and routing
export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  children?: NavigationItem[];
  permissions?: string[];
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive?: boolean;
}