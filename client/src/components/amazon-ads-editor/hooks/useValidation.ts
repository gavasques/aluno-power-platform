import { useState, useEffect, useMemo, useCallback } from 'react';
import { AmazonAdsRow, ValidationError } from '../utils/types';
import { AmazonAdsValidator } from '../utils/validation';

export const useValidation = (data: AmazonAdsRow[]) => {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Validar todos os dados
  const validateAllData = useCallback(async () => {
    setIsValidating(true);
    
    try {
      // Simular um pequeno delay para UX em datasets grandes
      if (data.length > 1000) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const errors = AmazonAdsValidator.validateAllData(data);
      setValidationErrors(errors);
      
      // Atualizar erros nas linhas
      const updatedData = data.map((row, index) => {
        const rowErrors = errors.filter(error => 
          error.field.startsWith(`Linha ${index + 1}:`)
        );
        return {
          ...row,
          _validationErrors: rowErrors
        };
      });
      
      return updatedData;
    } finally {
      setIsValidating(false);
    }
  }, [data]);

  // Validar linha específica
  const validateRow = useCallback((row: AmazonAdsRow, index: number) => {
    return AmazonAdsValidator.validateRow(row, index);
  }, []);

  // Executar validação quando dados mudam
  useEffect(() => {
    if (data.length > 0) {
      validateAllData();
    } else {
      setValidationErrors([]);
    }
  }, [data, validateAllData]);

  // Estatísticas de validação
  const validationStats = useMemo(() => {
    return AmazonAdsValidator.getValidationStats(validationErrors);
  }, [validationErrors]);

  // Verificar se pode exportar
  const canExport = useMemo(() => {
    return AmazonAdsValidator.canExport(validationErrors);
  }, [validationErrors]);

  // Agrupar erros por categoria
  const errorsByCategory = useMemo(() => {
    const groups: { [key: string]: ValidationError[] } = {};
    validationErrors.forEach(error => {
      if (!groups[error.category]) {
        groups[error.category] = [];
      }
      groups[error.category].push(error);
    });
    return groups;
  }, [validationErrors]);

  // Agrupar erros por tipo
  const errorsByType = useMemo(() => {
    const groups: { [key: string]: ValidationError[] } = {};
    validationErrors.forEach(error => {
      if (!groups[error.type]) {
        groups[error.type] = [];
      }
      groups[error.type].push(error);
    });
    return groups;
  }, [validationErrors]);

  // Obter erros de uma linha específica
  const getRowErrors = useCallback((rowIndex: number) => {
    return validationErrors.filter(error => 
      error.field.startsWith(`Linha ${rowIndex + 1}:`)
    );
  }, [validationErrors]);

  // Verificar se uma linha tem erros críticos
  const hasRowCriticalErrors = useCallback((rowIndex: number) => {
    const rowErrors = getRowErrors(rowIndex);
    return rowErrors.some(error => error.type === 'critical');
  }, [getRowErrors]);

  // Obter resumo de validação para export
  const getValidationSummary = useCallback(() => {
    return {
      totalErrors: validationErrors.length,
      criticalErrors: validationStats.critical,
      canExport,
      errorsByCategory: Object.entries(errorsByCategory).map(([category, errors]) => ({
        category,
        count: errors.length,
        hascríticos: errors.some(e => e.type === 'critical')
      }))
    };
  }, [validationErrors, validationStats, canExport, errorsByCategory]);

  return {
    validationErrors,
    validationStats,
    isValidating,
    canExport,
    errorsByCategory,
    errorsByType,
    validateAllData,
    validateRow,
    getRowErrors,
    hasRowCriticalErrors,
    getValidationSummary
  };
};