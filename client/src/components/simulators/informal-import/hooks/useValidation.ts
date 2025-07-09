import { useMemo } from 'react';
import {
  SimulacaoCompleta,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  VALIDATION_RULES,
  PRODUCT_VALIDATION_RULES
} from '../types';

/**
 * Custom hook for simulation validation
 * Follows Single Responsibility Principle - only handles validation logic
 * Returns comprehensive validation results with errors and warnings
 */
export const useValidation = (simulation: SimulacaoCompleta): ValidationResult => {
  return useMemo(() => {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate simulation metadata
    if (simulation) {
      validateSimulationMetadata(simulation, errors);
      
      // Validate configuration
      validateConfiguration(simulation.configuracoesGerais, errors, warnings);
      
      // Validate products
      validateProducts(simulation.produtos, errors, warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [simulation]);
};

/**
 * Validate simulation metadata
 */
const validateSimulationMetadata = (
  simulation: SimulacaoCompleta, 
  errors: ValidationError[]
): void => {
  if (!simulation.nomeSimulacao?.trim()) {
    errors.push({
      field: 'nomeSimulacao',
      message: 'Nome da simulação é obrigatório',
      type: 'required'
    });
  }

  if (simulation.nomeSimulacao && simulation.nomeSimulacao.length > 100) {
    errors.push({
      field: 'nomeSimulacao',
      message: 'Nome da simulação deve ter no máximo 100 caracteres',
      type: 'format'
    });
  }
};

/**
 * Validate configuration values
 */
const validateConfiguration = (
  config: any,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void => {
  // Safety check for config object
  if (!config) return;
  
  // Validate exchange rate
  const taxa_cambio_usd_brl = config.taxa_cambio_usd_brl;
  const rules = VALIDATION_RULES;

  if (taxa_cambio_usd_brl && (taxa_cambio_usd_brl < rules.taxa_cambio_usd_brl.min || 
      taxa_cambio_usd_brl > rules.taxa_cambio_usd_brl.max)) {
    errors.push({
      field: 'taxa_cambio_usd_brl',
      message: `Taxa de câmbio deve estar entre ${rules.taxa_cambio_usd_brl.min} e ${rules.taxa_cambio_usd_brl.max}`,
      type: 'range'
    });
  }

  // Validate II rate
  if (config.aliquota_ii_percentual != null && (config.aliquota_ii_percentual < rules.aliquota_ii_percentual.min || 
      config.aliquota_ii_percentual > rules.aliquota_ii_percentual.max)) {
    errors.push({
      field: 'aliquota_ii_percentual',
      message: `Alíquota II deve estar entre ${rules.aliquota_ii_percentual.min * 100}% e ${rules.aliquota_ii_percentual.max * 100}%`,
      type: 'range'
    });
  }

  // Validate ICMS rate
  if (config.aliquota_icms_percentual != null && (config.aliquota_icms_percentual < rules.aliquota_icms_percentual.min || 
      config.aliquota_icms_percentual > rules.aliquota_icms_percentual.max)) {
    errors.push({
      field: 'aliquota_icms_percentual',
      message: `Alíquota ICMS deve estar entre ${rules.aliquota_icms_percentual.min * 100}% e ${rules.aliquota_icms_percentual.max * 100}%`,
      type: 'range'
    });
  }

  // Performance warnings
  if (taxa_cambio_usd_brl && taxa_cambio_usd_brl > 8) {
    warnings.push({
      field: 'taxa_cambio_usd_brl',
      message: 'Taxa de câmbio muito alta pode impactar a viabilidade da importação',
      type: 'performance'
    });
  }

  if (config.aliquota_ii_percentual && config.aliquota_ii_percentual > 0.8) {
    warnings.push({
      field: 'aliquota_ii_percentual',
      message: 'Alíquota de II muito alta pode inviabilizar a importação',
      type: 'performance'
    });
  }
};

/**
 * Validate products array
 */
const validateProducts = (
  produtos: any[],
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void => {
  if (!Array.isArray(produtos) || produtos.length === 0) {
    errors.push({
      field: 'produtos',
      message: 'Pelo menos um produto deve ser adicionado',
      type: 'required'
    });
    return;
  }

  const rules = PRODUCT_VALIDATION_RULES;

  produtos.forEach((produto, index) => {
    // Safety check for product object
    if (!produto) return;
    
    const prefix = `produtos[${index}]`;

    // Validate description
    if (!produto.descricao_produto?.trim()) {
      errors.push({
        field: `${prefix}.descricao_produto`,
        message: `Produto ${index + 1}: Descrição é obrigatória`,
        type: 'required'
      });
    } else if (produto.descricao_produto.length > rules.descricao_produto.maxLength) {
      errors.push({
        field: `${prefix}.descricao_produto`,
        message: `Produto ${index + 1}: Descrição muito longa (máximo ${rules.descricao_produto.maxLength} caracteres)`,
        type: 'format'
      });
    }

    // Validate quantity
    if (produto.quantidade != null && (produto.quantidade < rules.quantidade.min || produto.quantidade > rules.quantidade.max)) {
      errors.push({
        field: `${prefix}.quantidade`,
        message: `Produto ${index + 1}: Quantidade deve estar entre ${rules.quantidade.min} e ${rules.quantidade.max}`,
        type: 'range'
      });
    }

    // Validate unit value USD
    if (produto.valor_unitario_usd != null && (produto.valor_unitario_usd < rules.valor_unitario_usd.min || 
        produto.valor_unitario_usd > rules.valor_unitario_usd.max)) {
      errors.push({
        field: `${prefix}.valor_unitario_usd`,
        message: `Produto ${index + 1}: Valor unitário deve estar entre $${rules.valor_unitario_usd.min} e $${rules.valor_unitario_usd.max}`,
        type: 'range'
      });
    }

    // Validate weight
    if (produto.peso_bruto_unitario_kg != null && (produto.peso_bruto_unitario_kg < rules.peso_bruto_unitario_kg.min || 
        produto.peso_bruto_unitario_kg > rules.peso_bruto_unitario_kg.max)) {
      errors.push({
        field: `${prefix}.peso_bruto_unitario_kg`,
        message: `Produto ${index + 1}: Peso deve estar entre ${rules.peso_bruto_unitario_kg.min} kg e ${rules.peso_bruto_unitario_kg.max} kg`,
        type: 'range'
      });
    }

    // Performance warnings
    if (produto.valor_unitario_usd && produto.valor_unitario_usd > 1000) {
      warnings.push({
        field: `${prefix}.valor_unitario_usd`,
        message: `Produto ${index + 1}: Valor alto pode requerer tributação especial`,
        type: 'accuracy'
      });
    }

    if (produto.peso_bruto_unitario_kg && produto.peso_bruto_unitario_kg > 100) {
      warnings.push({
        field: `${prefix}.peso_bruto_unitario_kg`,
        message: `Produto ${index + 1}: Peso alto pode impactar significativamente o frete`,
        type: 'performance'
      });
    }
  });

  // Recommendations
  if (produtos.length > 20) {
    warnings.push({
      field: 'produtos',
      message: 'Muitos produtos podem tornar a simulação lenta. Considere dividir em múltiplas simulações.',
      type: 'recommendation'
    });
  }
};