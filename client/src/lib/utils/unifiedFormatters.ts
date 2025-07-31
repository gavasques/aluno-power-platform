/**
 * Unified Formatters - Consolidates all duplicate formatting functions
 * This replaces scattered formatting logic across the codebase
 * 
 * Import this instead of:
 * - utils/productCalculations.ts formatCurrency/formatPercentage
 * - amazon-ads-editor/utils/validation.ts formatCurrency/formatPercentage  
 * - shared/utils/channelCalculations.ts formatCurrency/formatPercentage
 * - Various simulator utilities formatting functions
 */

import { 
  formatCurrency as sharedFormatCurrency,
  formatPercentage as sharedFormatPercentage,
  formatDate,
  formatDateTime,
  formatNumber,
  formatFileSize,
  formatPhone,
  formatCPF,
  formatCNPJ,
  truncateText,
  capitalizeWords
} from '@/../../shared/utils/formatters';

// Re-export shared formatters with enhanced versions
export {
  formatDate,
  formatDateTime,
  formatFileSize,
  formatPhone,
  formatCPF,
  formatCNPJ,
  truncateText,
  capitalizeWords
};

/**
 * Enhanced Currency Formatter - handles various input types
 * Replaces all currency formatting across the codebase
 */
export function formatCurrency(
  value: number | string | null | undefined,
  options?: {
    currency?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const {
    currency = 'BRL',
    locale = 'pt-BR',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2
  } = options || {};

  // Handle null/undefined
  if (value === null || value === undefined) {
    return sharedFormatCurrency(0, currency, locale);
  }

  // Handle string inputs
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
    if (isNaN(parsed)) {
      return sharedFormatCurrency(0, currency, locale);
    }
    value = parsed;
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value);
}

/**
 * Enhanced Percentage Formatter - handles various input types
 * Replaces all percentage formatting across the codebase
 */
export function formatPercentage(
  value: number | string | null | undefined,
  options?: {
    decimals?: number;
    multiplier?: number; // Use 1 if value is already percentage, 100 if decimal
    locale?: string;
  }
): string {
  const {
    decimals = 2,
    multiplier = 100, // Default assumes decimal input (0.15 -> 15%)
    locale = 'pt-BR'
  } = options || {};

  // Handle null/undefined
  if (value === null || value === undefined) {
    return '0%';
  }

  // Handle string inputs
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
    if (isNaN(parsed)) {
      return '0%';
    }
    value = parsed;
  }

  const percentage = value * multiplier;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Brazilian Number Formatter - handles Brazilian number format
 * Replaces formatBrazilianNumber from simulators
 */
export function formatBrazilianNumber(
  value: number | string | null | undefined,
  decimals: number = 2
): string {
  if (value === null || value === undefined) {
    return '0';
  }

  let numValue: number;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
    if (isNaN(parsed)) {
      return '0';
    }
    numValue = parsed;
  } else {
    numValue = value;
  }

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(numValue);
}

/**
 * Parse Brazilian Number - handles Brazilian number input format
 * Replaces parseBrazilianNumber from simulators
 */
export function parseBrazilianNumber(value: string): number {
  if (!value) return 0;
  
  // Remove dots (thousands separator) and replace comma with dot (decimal separator)
  const cleanValue = value
    .replace(/\./g, '') // Remove dots
    .replace(',', '.'); // Replace comma with dot
  
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parse any number format - handles both US and Brazilian formats
 * Replaces various parsing functions across the codebase
 */
export function parseNumber(value: string, format: 'US' | 'BR' = 'BR'): number {
  if (!value) return 0;

  if (format === 'BR') {
    return parseBrazilianNumber(value);
  } else {
    // US format - comma as thousands separator, dot as decimal
    const cleanValue = value.replace(/,/g, ''); // Remove commas
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  }
}

/**
 * Enhanced Number Formatter with locale support
 * Replaces formatNumber variations across the codebase
 */
export function formatNumberWithLocale(
  value: number | string | null | undefined,
  options?: {
    decimals?: number;
    locale?: string;
    style?: 'decimal' | 'currency' | 'percent';
    currency?: string;
  }
): string {
  const {
    decimals = 0,
    locale = 'pt-BR',
    style = 'decimal',
    currency = 'BRL'
  } = options || {};

  if (value === null || value === undefined) {
    return '0';
  }

  let numValue: number;
  if (typeof value === 'string') {
    numValue = parseNumber(value, locale === 'pt-BR' ? 'BR' : 'US');
  } else {
    numValue = value;
  }

  const formatOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    style
  };

  if (style === 'currency') {
    formatOptions.currency = currency;
  }

  return new Intl.NumberFormat(locale, formatOptions).format(numValue);
}

/**
 * ID Generator - replaces various ID generation patterns
 */
export function generateId(prefix?: string): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 11);
  const id = `${timestamp}-${random}`;
  return prefix ? `${prefix}-${id}` : id;
}

/**
 * Generate UUID v4 - for cases requiring proper UUIDs
 */
export function generateUUID(): string {
  if (crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Sanitize numeric input - replaces sanitizeNumericInput from simulators
 */
export function sanitizeNumericInput(value: string, format: 'US' | 'BR' = 'BR'): string {
  if (!value) return '';

  if (format === 'BR') {
    // Allow digits, dots (thousands), and comma (decimal)
    return value.replace(/[^0-9.,]/g, '');
  } else {
    // Allow digits, commas (thousands), and dot (decimal)
    return value.replace(/[^0-9,.]/g, '');
  }
}

/**
 * Debounce function - replaces various debounce implementations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Format relative time - useful for timestamps
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'agora há pouco';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `há ${hours} hora${hours > 1 ? 's' : ''}`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `há ${days} dia${days > 1 ? 's' : ''}`;
  } else {
    return formatDate(dateObj);
  }
}

/**
 * Format compact number (1.2K, 1.5M, etc.)
 */
export function formatCompactNumber(value: number, locale: string = 'pt-BR'): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(value);
}

/**
 * Format CBM (Cubic Meters) with appropriate precision
 * Replaces formatCBM functions in formal import utilities
 */
export function formatCBM(value: number, decimals: number = 6): string {
  return `${value.toFixed(decimals)} m³`;
}

// Utility object for easy importing
export const Formatters = {
  currency: formatCurrency,
  percentage: formatPercentage,
  number: formatBrazilianNumber,
  numberWithLocale: formatNumberWithLocale,
  date: formatDate,
  dateTime: formatDateTime,
  phone: formatPhone,
  cpf: formatCPF,
  cnpj: formatCNPJ,
  fileSize: formatFileSize,
  relativeTime: formatRelativeTime,
  compactNumber: formatCompactNumber,
  cbm: formatCBM,
  truncateText,
  capitalizeWords,
};

export const Parsers = {
  brazilianNumber: parseBrazilianNumber,
  number: parseNumber,
  sanitizeInput: sanitizeNumericInput,
};

export const Generators = {
  id: generateId,
  uuid: generateUUID,
};

export const Utils = {
  debounce,
};

// Legacy alias for backward compatibility
export const formatters = {
  currency: formatCurrency,
  percentage: formatPercentage,
  number: formatBrazilianNumber,
};

export default {
  ...Formatters,
  ...Parsers,
  ...Generators,
  ...Utils,
};