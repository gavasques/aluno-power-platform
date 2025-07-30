// Utility functions for Informal Import Simulation
import { SimulacaoCompleta, ValidationResult, ValidationError, CalculatedResults } from './types';
import { formatters } from '@/lib/utils/unifiedFormatters';

// Dynamic imports for PDF generation
let jsPDF: any;
let autoTable: any;

const loadPDFLibraries = async () => {
  if (!jsPDF) {
    jsPDF = (await import('jspdf')).default;
  }
  if (!autoTable) {
    autoTable = (await import('jspdf-autotable')).default;
  }
};

/**
 * Brazilian number formatting utilities
 */
export const formatBrazilianNumber = (value: number, decimals: number = 2): string => {
  if (value === 0) return '';
  const { formatBrazilianNumber: unifiedFormatBrazilianNumber } = require('@/lib/utils/unifiedFormatters');
  return unifiedFormatBrazilianNumber(value, decimals);
};

export const formatCurrency = formatters.currency;

export const parseBrazilianNumber = (value: string): number => {
  if (!value || value.trim() === '') return 0;
  
  // Remove all dots (thousand separators) and replace comma with dot for parsing
  const cleanValue = value
    .replace(/\./g, '')  // Remove dots
    .replace(',', '.');  // Replace comma with dot
  
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Product ID generation
 */
export const generateProductId = (): string => Date.now().toString();

/**
 * Enhanced validation utilities
 */

export const validateSimulation = (simulation: SimulacaoCompleta): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!simulation.nomeSimulacao?.trim()) {
    errors.push({
      field: 'nomeSimulacao',
      message: 'Nome da simulação é obrigatório',
      type: 'required'
    });
  }
  
  if (!simulation.produtos?.length) {
    errors.push({
      field: 'produtos',
      message: 'Pelo menos um produto deve ser adicionado',
      type: 'required'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings: []
  };
};

/**
 * Deep clone utility for immutable updates
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Debounce utility for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

/**
 * Removed CSV export functionality as requested
 */

/**
 * Safe numeric operations
 */
export const safeNumber = (value: any, defaultValue: number = 0): number => {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

export const safeDiv = (dividend: number, divisor: number, defaultValue: number = 0): number => {
  return divisor > 0 ? dividend / divisor : defaultValue;
};

/**
 * Formatting helpers for display
 */
export const formatWeight = (value: number): string => {
  return `${formatBrazilianNumber(value, 3)} kg`;
};

export const formatPercentage = (value: number): string => {
  return `${formatBrazilianNumber(value * 100, 2)}%`;
};

/**
 * Enhanced PDF generation with professional formatting
 */
export const generatePDF = (simulation: SimulacaoCompleta, calculatedResults: CalculatedResults): void => {
  try {
    // Safety checks
    if (!simulation) {
      throw new Error('Simulação não disponível');
    }
    
    if (!calculatedResults) {
      throw new Error('Resultados calculados não disponíveis');
    }

    const doc = new jsPDF();
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório de Simulação de Importação', 105, yPosition, { align: 'center' });
    yPosition += 20;

    // Simulation info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Simulação: ${simulation.nomeSimulacao || 'Sem nome'}`, 20, yPosition);
    yPosition += 8;
    
    if (simulation.nomeFornecedor) {
      doc.text(`Fornecedor: ${simulation.nomeFornecedor}`, 20, yPosition);
      yPosition += 8;
    }

    if (simulation.observacoes) {
      doc.text(`Observações: ${simulation.observacoes}`, 20, yPosition);
      yPosition += 8;
    }

    yPosition += 10;

    // Configuration summary
    doc.setFont('helvetica', 'bold');
    doc.text('Configurações:', 20, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    const config = simulation.configuracoesGerais;
    if (config) {
      doc.text(`Taxa USD/BRL: ${formatBrazilianNumber(config.taxa_cambio_usd_brl || 0)}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Alíquota II: ${formatPercentage(config.aliquota_ii_percentual || 0)}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Alíquota ICMS: ${formatPercentage(config.aliquota_icms_percentual || 0)}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Frete: ${formatCurrency(config.custo_frete_internacional_total_moeda_original || 0)} ${config.moeda_frete_internacional || 'USD'}`, 20, yPosition);
      yPosition += 10;
    }

    // Products table
    if (calculatedResults.produtos && calculatedResults.produtos.length > 0) {
      const tableData = calculatedResults.produtos.map(produto => [
        produto.descricao_produto || '',
        (produto.quantidade || 0).toString(),
        formatCurrency(produto.custo_unitario_com_imposto_brl || 0),
        formatCurrency(produto.valor_total_produto_impostos_brl || 0)
      ]);

      autoTable(doc, {
        head: [['Produto', 'Qtd', 'Custo Unit. c/ Imp.', 'Total c/ Impostos']],
        body: tableData,
        startY: yPosition,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [66, 139, 202] },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Totals summary
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('Resumo Financeiro:', 20, yPosition);
    yPosition += 10;

    doc.setFont('helvetica', 'normal');
    const totals = calculatedResults.totals;
    if (totals) {
      doc.text(`Valor FOB Total: ${formatCurrency(totals.valor_fob_total_usd || 0)} USD`, 20, yPosition);
      yPosition += 6;
      doc.text(`Custo Total Importação: ${formatCurrency(totals.custo_total_importacao_brl || 0)}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Peso Total: ${formatWeight(totals.peso_total_kg || 0)}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Multiplicador: ${formatBrazilianNumber(totals.multiplicador_importacao || 0, 2)}x`, 20, yPosition);
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Gerado em ${new Date().toLocaleDateString('pt-BR')} - Página ${i} de ${pageCount}`,
        105,
        290,
        { align: 'center' }
      );
    }

    // Save file
    const fileName = `simulacao-importacao-${simulation.nomeSimulacao?.replace(/[^a-zA-Z0-9]/g, '-') || 'simulacao'}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
};

