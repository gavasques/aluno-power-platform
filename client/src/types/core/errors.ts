/**
 * Tipos para tratamento de erros - Centraliza definições de erro
 */

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
  statusCode?: number;
  timestamp?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface FormErrors {
  [key: string]: ValidationError[];
}

export type ErrorHandler = (error: ApiError) => void;

export type ValidationErrorHandler = (errors: FormErrors) => void;

export interface ErrorState {
  hasError: boolean;
  error: ApiError | null;
  isLoading: boolean;
}

export type AsyncErrorHandler<T> = (error: ApiError, data?: T) => void;

// Tipos específicos para diferentes contextos
export interface AuthError extends ApiError {
  code: 'INVALID_CREDENTIALS' | 'TOKEN_EXPIRED' | 'INSUFFICIENT_PERMISSIONS';
}

export interface NetworkError extends ApiError {
  code: 'NETWORK_ERROR' | 'TIMEOUT' | 'CORS_ERROR';
  retryable: boolean;
}

export interface BusinessError extends ApiError {
  code: 'INSUFFICIENT_CREDITS' | 'QUOTA_EXCEEDED' | 'FEATURE_NOT_AVAILABLE';
  action?: string;
} 