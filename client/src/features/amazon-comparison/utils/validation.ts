/**
 * UTILS: Amazon Comparison Validation
 * Funções de validação para formulários de comparação
 * Extraído de CompararListings.tsx para modularização
 */
import { 
  ComparisonFormData, 
  ComparisonErrors, 
  VALIDATION_MESSAGES,
  SUPPORTED_COUNTRIES,
  MAX_ASINS,
  MIN_ASINS
} from '../types';

// ===== VALIDATION HELPERS =====
const isValidAsin = (asin: string): boolean => {
  return /^[A-Z0-9]{10}$/i.test(asin.trim());
};

const isValidCountry = (country: string): boolean => {
  return SUPPORTED_COUNTRIES.some(c => c.code === country);
};

const hasDuplicateAsins = (asins: string[]): boolean => {
  const validAsins = asins.filter(asin => asin.trim()).map(asin => asin.trim().toUpperCase());
  return validAsins.length !== new Set(validAsins).size;
};

// ===== MAIN VALIDATION FUNCTION =====
export const validateComparisonForm = (data: ComparisonFormData): ComparisonErrors => {
  const errors: ComparisonErrors = {};

  // Validate ASINs
  const validAsins = data.asins.filter(asin => asin.trim());
  const asinErrors: string[] = [];

  // Check minimum ASINs
  if (validAsins.length < MIN_ASINS) {
    errors.general = VALIDATION_MESSAGES.MIN_ASINS;
    return errors;
  }

  // Check maximum ASINs
  if (data.asins.length > MAX_ASINS) {
    errors.general = VALIDATION_MESSAGES.MAX_ASINS;
    return errors;
  }

  // Check for duplicate ASINs
  if (hasDuplicateAsins(data.asins)) {
    errors.general = VALIDATION_MESSAGES.ASIN_DUPLICATE;
    return errors;
  }

  // Validate each ASIN
  data.asins.forEach((asin, index) => {
    if (asin.trim()) {
      if (!isValidAsin(asin)) {
        asinErrors[index] = VALIDATION_MESSAGES.ASIN_INVALID;
      }
    } else if (index < MIN_ASINS) {
      // Only first MIN_ASINS are required
      asinErrors[index] = VALIDATION_MESSAGES.ASIN_REQUIRED;
    }
  });

  if (asinErrors.some(error => error)) {
    errors.asins = asinErrors;
  }

  // Validate country
  if (!data.country.trim()) {
    errors.country = VALIDATION_MESSAGES.COUNTRY_REQUIRED;
  } else if (!isValidCountry(data.country)) {
    errors.country = 'País não suportado';
  }

  return errors;
};

// ===== FIELD VALIDATION (for real-time validation) =====
export const validateAsin = (asin: string): string | undefined => {
  if (!asin.trim()) {
    return VALIDATION_MESSAGES.ASIN_REQUIRED;
  }
  
  if (!isValidAsin(asin)) {
    return VALIDATION_MESSAGES.ASIN_INVALID;
  }
  
  return undefined;
};

export const validateCountry = (country: string): string | undefined => {
  if (!country.trim()) {
    return VALIDATION_MESSAGES.COUNTRY_REQUIRED;
  }
  
  if (!isValidCountry(country)) {
    return 'País não suportado';
  }
  
  return undefined;
};

// ===== UTILITY FUNCTIONS =====
export const formatAsin = (asin: string): string => {
  return asin.trim().toUpperCase();
};

export const extractAsinFromUrl = (url: string): string | null => {
  // Extract ASIN from Amazon URL patterns
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/product\/([A-Z0-9]{10})/i,
    /asin=([A-Z0-9]{10})/i,
    /\/([A-Z0-9]{10})(?:\/|\?|$)/i
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && isValidAsin(match[1])) {
      return match[1].toUpperCase();
    }
  }

  return null;
};

export const getCountryByCode = (code: string) => {
  return SUPPORTED_COUNTRIES.find(country => country.code === code);
};

export const getCountryOptions = () => {
  return SUPPORTED_COUNTRIES.map(country => ({
    value: country.code,
    label: `${country.flag} ${country.name}`
  }));
};