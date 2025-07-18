/**
 * Unified Formatters Utility
 * Centralized formatting functions eliminating code duplication
 */

export interface FormatOptions {
  currency?: string;
  locale?: string;
  precision?: number;
  multiplier?: number;
}

export const formatters = {
  /**
   * Format currency with consistent Brazilian Real formatting
   */
  currency(value: number | string | null | undefined, options: FormatOptions = {}): string {
    const {
      currency = 'BRL',
      locale = 'pt-BR',
      precision = 2
    } = options;

    const numValue = typeof value === 'number' ? value : parseFloat(String(value || 0));
    if (isNaN(numValue)) return 'R$ 0,00';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }).format(numValue);
  },

  /**
   * Format percentage with consistent formatting
   */
  percentage(value: number | string | null | undefined, options: FormatOptions = {}): string {
    const {
      precision = 1,
      multiplier = 1
    } = options;

    const numValue = typeof value === 'number' ? value : parseFloat(String(value || 0));
    if (isNaN(numValue)) return '0.0%';

    const finalValue = numValue * multiplier;
    return `${finalValue.toFixed(precision)}%`;
  },

  /**
   * Format credits with proper number formatting and pluralization
   */
  credits(credits: number | string | null | undefined, options: FormatOptions = {}): string {
    const {
      locale = 'pt-BR'
    } = options;

    const numValue = typeof credits === 'number' ? credits : parseFloat(String(credits || 0));
    if (isNaN(numValue)) return '0 créditos';

    const formatted = new Intl.NumberFormat(locale).format(numValue);
    const plural = numValue !== 1 ? 'créditos' : 'crédito';
    
    return `${formatted} ${plural}`;
  },

  /**
   * Format number with locale-specific formatting
   */
  number(value: number | string | null | undefined, options: FormatOptions = {}): string {
    const {
      locale = 'pt-BR',
      precision
    } = options;

    const numValue = typeof value === 'number' ? value : parseFloat(String(value || 0));
    if (isNaN(numValue)) return '0';

    const formatOptions: Intl.NumberFormatOptions = {};
    if (precision !== undefined) {
      formatOptions.minimumFractionDigits = precision;
      formatOptions.maximumFractionDigits = precision;
    }

    return new Intl.NumberFormat(locale, formatOptions).format(numValue);
  },

  /**
   * Parse Brazilian number format to float
   */
  parseNumber(value: string | null | undefined): number {
    if (!value) return 0;
    
    // Handle Brazilian format (1.234,56) and US format (1,234.56)
    const cleanValue = value
      .replace(/[^\d,.-]/g, '') // Remove non-numeric characters except , . -
      .replace(/\./g, '') // Remove thousand separators (dots)
      .replace(/,/g, '.'); // Replace comma with dot for decimal

    const numValue = parseFloat(cleanValue);
    return isNaN(numValue) ? 0 : numValue;
  }
};

// Legacy aliases for backward compatibility
export const formatCurrency = formatters.currency;
export const formatPercentage = formatters.percentage;
export const formatCredits = formatters.credits;
export const formatNumber = formatters.number;
export const parseNumber = formatters.parseNumber;