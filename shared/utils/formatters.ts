/**
 * Unified Formatters - Consolidated formatting functions
 * This file consolidates all duplicate formatting logic across the codebase
 * following the DRY principle.
 */

/**
 * Format currency values with enhanced type handling
 * @param value - The numeric value to format
 * @param currency - The currency code (default: 'BRL')
 * @param locale - The locale to use for formatting (default: 'pt-BR')
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number | string | null | undefined,
  currency: string = 'BRL',
  locale: string = 'pt-BR'
): string {
  const numValue = typeof value === 'number' ? value : parseFloat(String(value || 0));
  if (isNaN(numValue)) return currency === 'BRL' ? 'R$ 0,00' : '0.00';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
}

/**
 * Format percentage values with enhanced type handling
 * @param value - The numeric value to format (as decimal, e.g., 0.15 for 15%)
 * @param decimals - Number of decimal places (default: 2)
 * @param multiplier - Multiplier for the value (default: 100 for decimal to percentage)
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number | string | null | undefined, 
  decimals: number = 2,
  multiplier: number = 100
): string {
  const numValue = typeof value === 'number' ? value : parseFloat(String(value || 0));
  if (isNaN(numValue)) return '0%';
  
  return `${(numValue * multiplier).toFixed(decimals)}%`;
}

/**
 * Format numbers with thousands separators and enhanced type handling
 * @param value - The numeric value to format
 * @param decimals - Number of decimal places (default: 0)
 * @param locale - The locale to use for formatting (default: 'pt-BR')
 * @returns Formatted number string
 */
export function formatNumber(
  value: number | string | null | undefined, 
  decimals: number = 0,
  locale: string = 'pt-BR'
): string {
  const numValue = typeof value === 'number' ? value : parseFloat(String(value || 0));
  if (isNaN(numValue)) return '0';
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(numValue);
}

/**
 * Parse Brazilian number format (1.234,56) to float
 * Handles both Brazilian (1.234,56) and US (1,234.56) formats
 * @param value - The string value to parse
 * @returns Parsed number or 0 if invalid
 */
export function parseBrazilianNumber(value: string | null | undefined): number {
  if (!value) return 0;
  
  // Remove non-numeric characters except dots, commas, and minus
  const cleaned = value.replace(/[^\d,.-]/g, '');
  
  // Handle Brazilian format: dots as thousands, comma as decimal
  // Ex: "1.234.567,89" -> 1234567.89
  const parts = cleaned.split(',');
  if (parts.length === 2) {
    // Has comma - Brazilian format
    const wholePart = parts[0].replace(/\./g, ''); // Remove dots (thousands)
    const decimalPart = parts[1];
    const result = parseFloat(`${wholePart}.${decimalPart}`);
    return isNaN(result) ? 0 : result;
  } else {
    // No comma - could be US format or whole number
    const result = parseFloat(cleaned.replace(/,/g, '')); // Remove commas if US format
    return isNaN(result) ? 0 : result;
  }
}

/**
 * Calculate CBM (Cubic Meter) from dimensions
 * @param length - Length in cm
 * @param width - Width in cm  
 * @param height - Height in cm
 * @returns CBM value
 */
export function calculateCBM(length: number, width: number, height: number): number {
  return (length * width * height) / 1000000;
}

/**
 * Convert USD to BRL
 * @param usdValue - Value in USD
 * @param exchangeRate - USD to BRL exchange rate
 * @returns Value in BRL
 */
export function convertUSDToBRL(usdValue: number, exchangeRate: number): number {
  return usdValue * exchangeRate;
}

/**
 * Convert BRL to USD
 * @param brlValue - Value in BRL
 * @param exchangeRate - USD to BRL exchange rate
 * @returns Value in USD
 */
export function convertBRLToUSD(brlValue: number, exchangeRate: number): number {
  return brlValue / exchangeRate;
}

/**
 * Format date values to Brazilian format
 * @param date - The date to format
 * @returns Formatted date string (DD/MM/YYYY)
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Format date and time values to Brazilian format
 * @param date - The date to format
 * @returns Formatted date and time string (DD/MM/YYYY HH:MM)
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format file size in bytes to human readable format
 * @param bytes - The size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format phone number to Brazilian format
 * @param phone - The phone number string
 * @returns Formatted phone number
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
}

/**
 * Format CPF (Brazilian individual taxpayer registry)
 * @param cpf - The CPF string
 * @returns Formatted CPF
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }
  
  return cpf;
}

/**
 * Format CNPJ (Brazilian company registry)
 * @param cnpj - The CNPJ string
 * @returns Formatted CNPJ
 */
export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');
  
  if (cleaned.length === 14) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
  }
  
  return cnpj;
}

/**
 * Truncate text to specified length with ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Capitalize first letter of each word
 * @param text - The text to capitalize
 * @returns Capitalized text
 */
export function capitalizeWords(text: string): string {
  return text.replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Debounce function to limit function calls
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @param immediate - Whether to execute immediately
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = function() {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

/**
 * Generate unique ID
 * @returns Unique ID string
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Generate UUID v4
 * @returns UUID string
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Legacy aliases for backward compatibility
export const formatBRL = formatCurrency;
export const formatPercent = formatPercentage;
export const parseNumber = parseBrazilianNumber;