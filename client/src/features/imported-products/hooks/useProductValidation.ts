/**
 * HOOK: useProductValidation
 * Gerencia validação de formulário de produtos importados
 * Extraído de ImportedProductForm.tsx para modularização
 */
import { useState, useCallback } from 'react';
import { 
  ImportedProductErrors, 
  ValidationResults, 
  UseProductValidationReturn,
  ImportedProductFormData,
  VALIDATION_MESSAGES
} from '../types';

export const useProductValidation = (): UseProductValidationReturn => {
  // ===== STATE =====
  const [errors, setErrors] = useState<ImportedProductErrors>({});
  const [results, setResults] = useState<ValidationResults>({
    isValid: false,
    completeness: 0,
    score: 0,
    suggestions: [],
    warnings: [],
    criticalIssues: []
  });

  // ===== VALIDATION FUNCTIONS =====
  const validateField = useCallback(async (field: string, value?: any, formData?: ImportedProductFormData): Promise<string | undefined> => {
    let error: string | undefined;

    switch (field) {
      case 'name':
        if (!value || value.trim().length === 0) {
          error = VALIDATION_MESSAGES.REQUIRED;
        } else if (value.length < 3) {
          error = VALIDATION_MESSAGES.MIN_LENGTH.replace('{min}', '3');
        } else if (value.length > 200) {
          error = VALIDATION_MESSAGES.MAX_LENGTH.replace('{max}', '200');
        }
        break;

      case 'sku':
        if (!value || value.trim().length === 0) {
          error = VALIDATION_MESSAGES.REQUIRED;
        } else if (!/^[A-Z0-9-_]{3,50}$/i.test(value)) {
          error = VALIDATION_MESSAGES.INVALID_SKU;
        }
        // TODO: Check for duplicate SKU
        break;

      case 'cost':
        if (value === undefined || value === null) {
          error = VALIDATION_MESSAGES.REQUIRED;
        } else if (isNaN(value) || value < 0) {
          error = VALIDATION_MESSAGES.INVALID_NUMBER;
        }
        break;

      case 'sellingPrice':
        if (value === undefined || value === null) {
          error = VALIDATION_MESSAGES.REQUIRED;
        } else if (isNaN(value) || value < 0) {
          error = VALIDATION_MESSAGES.INVALID_NUMBER;
        } else if (formData?.cost && value <= formData.cost) {
          error = VALIDATION_MESSAGES.PRICE_LOWER_COST;
        }
        break;

      case 'weight':
        if (value === undefined || value === null) {
          error = VALIDATION_MESSAGES.REQUIRED;
        } else if (isNaN(value) || value <= 0) {
          error = VALIDATION_MESSAGES.INVALID_NUMBER;
        }
        break;

      case 'dimensions.length':
      case 'dimensions.width':
      case 'dimensions.height':
        if (value === undefined || value === null) {
          error = VALIDATION_MESSAGES.REQUIRED;
        } else if (isNaN(value) || value <= 0) {
          error = VALIDATION_MESSAGES.INVALID_DIMENSIONS;
        }
        break;

      case 'images':
        if (!value || !Array.isArray(value) || value.length === 0) {
          error = 'Pelo menos uma imagem é obrigatória';
        }
        break;

      default:
        break;
    }

    return error;
  }, []);

  const validateForm = useCallback(async (formData?: ImportedProductFormData): Promise<ValidationResults> => {
    const newErrors: ImportedProductErrors = {};
    const criticalIssues: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!formData) {
      return {
        isValid: false,
        completeness: 0,
        score: 0,
        suggestions,
        warnings,
        criticalIssues: ['Dados do formulário não disponíveis']
      };
    }

    // Validate required fields
    const requiredFields = [
      { field: 'name', value: formData.name },
      { field: 'sku', value: formData.sku },
      { field: 'cost', value: formData.cost },
      { field: 'sellingPrice', value: formData.sellingPrice },
      { field: 'weight', value: formData.weight }
    ];

    for (const { field, value } of requiredFields) {
      const error = await validateField(field, value, formData);
      if (error) {
        newErrors[field as keyof ImportedProductErrors] = error;
        criticalIssues.push(`${field}: ${error}`);
      }
    }

    // Validate dimensions
    if (formData.dimensions) {
      const dimensionErrors: any = {};
      
      const lengthError = await validateField('dimensions.length', formData.dimensions.length);
      if (lengthError) dimensionErrors.length = lengthError;
      
      const widthError = await validateField('dimensions.width', formData.dimensions.width);
      if (widthError) dimensionErrors.width = widthError;
      
      const heightError = await validateField('dimensions.height', formData.dimensions.height);
      if (heightError) dimensionErrors.height = heightError;

      if (Object.keys(dimensionErrors).length > 0) {
        newErrors.dimensions = dimensionErrors;
      }
    }

    // Validate images
    const imageError = await validateField('images', formData.images);
    if (imageError) {
      newErrors.images = imageError;
      criticalIssues.push(`Imagens: ${imageError}`);
    }

    // Check business rules
    if (formData.sellingPrice && formData.cost && formData.sellingPrice <= formData.cost) {
      if (!newErrors.sellingPrice) {
        newErrors.sellingPrice = VALIDATION_MESSAGES.PRICE_LOWER_COST;
      }
      criticalIssues.push('Preço de venda deve ser maior que o custo');
    }

    // Calculate margin and profit
    if (formData.sellingPrice && formData.cost) {
      const margin = ((formData.sellingPrice - formData.cost) / formData.sellingPrice) * 100;
      if (margin < 20) {
        warnings.push(`Margem baixa: ${margin.toFixed(1)}% (recomendado: mínimo 20%)`);
      }
    }

    // SEO suggestions
    if (!formData.seo?.title || formData.seo.title.length < 30) {
      suggestions.push('Adicione um título SEO mais descritivo (mínimo 30 caracteres)');
    }

    if (!formData.seo?.description || formData.seo.description.length < 120) {
      suggestions.push('Adicione uma descrição SEO mais detalhada (mínimo 120 caracteres)');
    }

    if (!formData.seo?.keywords || formData.seo.keywords.length === 0) {
      suggestions.push('Adicione palavras-chave para melhorar o SEO');
    }

    // Inventory suggestions
    if (formData.inventory?.quantity && formData.inventory.quantity < 10) {
      warnings.push('Estoque baixo: considere reabastecer');
    }

    if (!formData.inventory?.minStock || formData.inventory.minStock <= 0) {
      suggestions.push('Defina um estoque mínimo para alertas automáticos');
    }

    // Category and brand suggestions
    if (!formData.category) {
      suggestions.push('Selecione uma categoria para melhor organização');
    }

    if (!formData.brand) {
      suggestions.push('Adicione a marca do produto');
    }

    // Calculate completeness score
    const totalFields = 20; // Number of important fields
    let completedFields = 0;

    if (formData.name) completedFields++;
    if (formData.sku) completedFields++;
    if (formData.description) completedFields++;
    if (formData.category) completedFields++;
    if (formData.brand) completedFields++;
    if (formData.cost > 0) completedFields++;
    if (formData.sellingPrice > 0) completedFields++;
    if (formData.weight > 0) completedFields++;
    if (formData.dimensions?.length > 0) completedFields++;
    if (formData.dimensions?.width > 0) completedFields++;
    if (formData.dimensions?.height > 0) completedFields++;
    if (formData.images && formData.images.length > 0) completedFields++;
    if (formData.inventory?.quantity !== undefined) completedFields++;
    if (formData.seo?.title) completedFields++;
    if (formData.seo?.description) completedFields++;
    if (formData.tags && formData.tags.length > 0) completedFields++;
    if (formData.specifications && Object.keys(formData.specifications).length > 0) completedFields++;
    if (formData.shipping?.estimatedDelivery) completedFields++;
    if (formData.compliance?.certifications && formData.compliance.certifications.length > 0) completedFields++;
    if (formData.supplier) completedFields++;

    const completeness = (completedFields / totalFields) * 100;
    
    // Calculate overall score
    const errorPenalty = Object.keys(newErrors).length * 10;
    const warningPenalty = warnings.length * 5;
    const score = Math.max(0, completeness - errorPenalty - warningPenalty);

    const validationResults: ValidationResults = {
      isValid: Object.keys(newErrors).length === 0,
      completeness,
      score,
      suggestions,
      warnings,
      criticalIssues
    };

    setErrors(newErrors);
    setResults(validationResults);

    return validationResults;
  }, [validateField]);

  const validateStep = useCallback(async (step: number, formData?: ImportedProductFormData): Promise<boolean> => {
    if (!formData) return false;

    let stepValid = true;
    const stepErrors: ImportedProductErrors = {};

    switch (step) {
      case 1: // Basic Info
        const nameError = await validateField('name', formData.name, formData);
        if (nameError) {
          stepErrors.name = nameError;
          stepValid = false;
        }

        const skuError = await validateField('sku', formData.sku, formData);
        if (skuError) {
          stepErrors.sku = skuError;
          stepValid = false;
        }
        break;

      case 2: // Pricing
        const costError = await validateField('cost', formData.cost, formData);
        if (costError) {
          stepErrors.cost = costError;
          stepValid = false;
        }

        const priceError = await validateField('sellingPrice', formData.sellingPrice, formData);
        if (priceError) {
          stepErrors.sellingPrice = priceError;
          stepValid = false;
        }
        break;

      case 3: // Specifications
        const weightError = await validateField('weight', formData.weight, formData);
        if (weightError) {
          stepErrors.weight = weightError;
          stepValid = false;
        }
        break;

      case 4: // Images
        const imageError = await validateField('images', formData.images, formData);
        if (imageError) {
          stepErrors.images = imageError;
          stepValid = false;
        }
        break;

      default:
        break;
    }

    // Update errors for this step
    setErrors(prev => ({ ...prev, ...stepErrors }));

    return stepValid;
  }, [validateField]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field as keyof ImportedProductErrors];
      return newErrors;
    });
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }, []);

  return {
    errors,
    results,
    isValid: results.isValid,
    validateForm,
    validateField,
    validateStep,
    clearErrors,
    clearFieldError,
    setFieldError
  };
};