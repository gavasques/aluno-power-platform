import { AmazonAdsRow, ValidationError, ENTITY_TYPES, MATCH_TYPES } from './types';

export class AmazonAdsValidator {
  
  static validateRow(row: AmazonAdsRow, index: number): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Regra 1: Lance Mínimo
    if (this.shouldHaveBid(row) && (row.Lance ?? 0) < 0.02) {
      errors.push({
        field: 'Lance',
        type: 'critical',
        message: 'Lance deve ser no mínimo R$ 0,02 para entidades com lance',
        severity: 10,
        category: 'Regras Críticas'
      });
    }

    // Regra 2: Keywords Negativas não podem ter lance
    if (this.isNegativeKeyword(row) && row.Lance && row.Lance > 0) {
      errors.push({
        field: 'Lance',
        type: 'critical', 
        message: 'Keywords negativas não podem ter lance',
        severity: 10,
        category: 'Regras Críticas'
      });
    }

    // Regra 3: Match Type Negativo para keywords negativas
    if (this.isNegativeKeyword(row) && !this.isNegativeMatchType(row['Tipo de correspondência'])) {
      errors.push({
        field: 'Tipo de correspondência',
        type: 'critical',
        message: 'Keywords negativas devem ter tipo de correspondência negativo',
        severity: 9,
        category: 'Regras Críticas'
      });
    }

    // Regra 4: Match Type Positivo para keywords positivas
    if (this.isPositiveKeyword(row) && this.isNegativeMatchType(row['Tipo de correspondência'])) {
      errors.push({
        field: 'Tipo de correspondência',
        type: 'critical',
        message: 'Keywords positivas devem ter tipo de correspondência positivo',
        severity: 9,
        category: 'Regras Críticas'
      });
    }

    // Regra 5: Orçamento Mínimo para campanhas
    if (this.isCampaign(row) && (row['Orçamento diário'] ?? 0) < 1.00) {
      errors.push({
        field: 'Orçamento diário',
        type: 'critical',
        message: 'Campanhas devem ter orçamento diário de no mínimo R$ 1,00',
        severity: 10,
        category: 'Regras Críticas'
      });
    }

    // Regra 6: Lance Alto (Aviso)
    if (this.shouldHaveBid(row) && (row.Lance ?? 0) > 50.00) {
      errors.push({
        field: 'Lance',
        type: 'warning',
        message: `Lance de R$ ${row.Lance?.toFixed(2)} pode ser ineficiente. Considere valores mais conservadores.`,
        severity: 6,
        category: 'Avisos'
      });
    }

    // Regra 7: Orçamento Baixo (Aviso)
    if (this.isCampaign(row) && (row['Orçamento diário'] ?? 0) > 0 && (row['Orçamento diário'] ?? 0) < 50.00) {
      errors.push({
        field: 'Orçamento diário',
        type: 'warning',
        message: `Orçamento de R$ ${row['Orçamento diário']?.toFixed(2)} pode limitar a performance da campanha`,
        severity: 5,
        category: 'Avisos'
      });
    }

    // Regra 8: Ajuste Extremo (Aviso)
    if (row.Porcentagem && (row.Porcentagem > 200 || row.Porcentagem < -75)) {
      errors.push({
        field: 'Porcentagem',
        type: 'warning',
        message: `Ajuste de ${row.Porcentagem}% pode ser muito arriscado`,
        severity: 6,
        category: 'Avisos'
      });
    }

    // Regras de Performance (Sugestões)
    
    // Regra 11: Scaling Winners
    if (this.isScalingOpportunity(row)) {
      errors.push({
        field: 'Lance',
        type: 'suggestion',
        message: `Oportunidade de scaling: ACoS baixo (${row.ACOS?.toFixed(1)}%) com bom volume. Considere aumentar o lance.`,
        severity: 3,
        category: 'Sugestões de Performance'
      });
    }

    // Regra 12: Redução Losers
    if (this.isUnderperforming(row)) {
      errors.push({
        field: 'Lance',
        type: 'suggestion',
        message: `ACoS alto (${row.ACOS?.toFixed(1)}%) com lance elevado. Considere reduzir o lance ou pausar.`,
        severity: 4,
        category: 'Sugestões de Performance'
      });
    }

    // Regra 13: Falta Visibilidade
    if (this.hasVisibilityIssue(row)) {
      errors.push({
        field: 'Lance',
        type: 'suggestion',
        message: 'Zero impressões com keyword ativa. Considere aumentar o lance para ganhar visibilidade.',
        severity: 4,
        category: 'Sugestões de Performance'
      });
    }

    // Regra 14: Cliques sem Conversão
    if (this.hasClicksWithoutConversion(row)) {
      errors.push({
        field: 'Estado',
        type: 'suggestion',
        message: `${row.Cliques} cliques sem conversões. Considere pausar esta keyword.`,
        severity: 5,
        category: 'Sugestões de Performance'
      });
    }

    // Regra 15: CTR Baixo
    if (this.hasLowCTR(row)) {
      errors.push({
        field: 'Estado',
        type: 'suggestion',
        message: `CTR baixo (${row['Taxa de cliques']?.toFixed(2)}%) com alto volume. Keyword pode não ser relevante.`,
        severity: 4,
        category: 'Sugestões de Performance'
      });
    }

    // Regra 16: Orçamento Limitante
    if (this.isBudgetLimited(row)) {
      errors.push({
        field: 'Orçamento diário',
        type: 'suggestion',
        message: `Gasto próximo ao orçamento (${((row.Gastos ?? 0) / (row['Orçamento diário'] ?? 1) * 100).toFixed(1)}%). Considere aumentar orçamento.`,
        severity: 3,
        category: 'Sugestões de Performance'
      });
    }

    return errors;
  }

  static validateAllData(data: AmazonAdsRow[]): ValidationError[] {
    const allErrors: ValidationError[] = [];
    
    data.forEach((row, index) => {
      const rowErrors = this.validateRow(row, index);
      rowErrors.forEach(error => {
        allErrors.push({
          ...error,
          field: `Linha ${index + 1}: ${error.field}`
        });
      });
    });

    return allErrors;
  }

  static getValidationStats(errors: ValidationError[]) {
    return {
      critical: errors.filter(e => e.type === 'critical').length,
      errors: errors.filter(e => e.type === 'error').length, 
      warnings: errors.filter(e => e.type === 'warning').length,
      suggestions: errors.filter(e => e.type === 'suggestion').length,
      total: errors.length
    };
  }

  static canExport(errors: ValidationError[]): boolean {
    return !errors.some(error => error.type === 'critical');
  }

  // Métodos auxiliares privados
  private static shouldHaveBid(row: AmazonAdsRow): boolean {
    return row.Entidade === ENTITY_TYPES.KEYWORD && row.Estado === 'ativada';
  }

  private static isNegativeKeyword(row: AmazonAdsRow): boolean {
    return row.Entidade === ENTITY_TYPES.NEGATIVE_KEYWORD;
  }

  private static isPositiveKeyword(row: AmazonAdsRow): boolean {
    return row.Entidade === ENTITY_TYPES.KEYWORD;
  }

  private static isCampaign(row: AmazonAdsRow): boolean {
    return row.Entidade === ENTITY_TYPES.CAMPAIGN;
  }

  private static isNegativeMatchType(matchType?: string): boolean {
    return [MATCH_TYPES.NEGATIVE_EXACT, MATCH_TYPES.NEGATIVE_PHRASE, MATCH_TYPES.NEGATIVE_BROAD]
      .includes(matchType as any);
  }

  private static isScalingOpportunity(row: AmazonAdsRow): boolean {
    return (row.Lance ?? 0) < 5.00 && 
           (row.ACOS ?? 100) < 20 && 
           (row.Impressões ?? 0) > 1000 &&
           row.Estado === 'ativada';
  }

  private static isUnderperforming(row: AmazonAdsRow): boolean {
    return (row.Lance ?? 0) > 10.00 && 
           (row.ACOS ?? 0) > 60 &&
           (row.Cliques ?? 0) > 10;
  }

  private static hasVisibilityIssue(row: AmazonAdsRow): boolean {
    return (row.Impressões ?? 0) === 0 && 
           row.Estado === 'ativada' &&
           this.shouldHaveBid(row);
  }

  private static hasClicksWithoutConversion(row: AmazonAdsRow): boolean {
    return (row.Cliques ?? 0) > 20 && 
           (row.Pedidos ?? 0) === 0 &&
           row.Estado === 'ativada';
  }

  private static hasLowCTR(row: AmazonAdsRow): boolean {
    return (row['Taxa de cliques'] ?? 0) < 0.5 && 
           (row.Impressões ?? 0) > 5000 &&
           row.Estado === 'ativada';
  }

  private static isBudgetLimited(row: AmazonAdsRow): boolean {
    if (!this.isCampaign(row)) return false;
    
    const dailyBudget = row['Orçamento diário'] ?? 0;
    const spending = row.Gastos ?? 0;
    
    return dailyBudget > 0 && (spending / dailyBudget) > 0.9;
  }
}

import { formatCurrency } from '@/lib/utils/unifiedFormatters';

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function validateFileStructure(workbook: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Verificar se existe a aba necessária
  const sheetName = 'Sponsored Products Campaigns';
  if (!workbook.SheetNames.includes(sheetName)) {
    errors.push(`Aba "${sheetName}" não encontrada. Verifique se o arquivo está no formato correto.`);
    return { isValid: false, errors };
  }

  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    errors.push(`Não foi possível ler a aba "${sheetName}".`);
    return { isValid: false, errors };
  }

  // Verificar colunas obrigatórias
  const requiredColumns = ['Produto', 'Entidade', 'Nome da campanha', 'Estado'];
  const range = worksheet['!ref'];
  
  if (!range) {
    errors.push('Planilha parece estar vazia.');
    return { isValid: false, errors };
  }

  return { isValid: errors.length === 0, errors };
}