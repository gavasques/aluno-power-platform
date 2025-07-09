import { GiroCalculado } from './types';

/**
 * Currency and number formatting utilities
 */
export const formatCurrency = (value: number): string => {
  return `R$ ${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Input validation utilities
 */
export const validatePositiveNumber = (value: number, min: number = 0): boolean => {
  return !isNaN(value) && value >= min;
};

export const sanitizeNumericInput = (value: string): number => {
  const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Time conversion utilities
 */
export const convertToDays = (value: number, unit: 'Dias' | 'Semanas' | 'Meses'): number => {
  switch (unit) {
    case 'Semanas':
      return value * 7;
    case 'Meses':
      return value * 30;
    default:
      return value;
  }
};

/**
 * CSV export utilities
 */
export const generateCSVHeaders = (): string[] => [
  'Giro', 'Investimento', 'ROI%', 'Retorno', 'Aporte', 'Retirada', 'Saldo', 'Tempo (dias)'
];

export const convertGiroToCSVRow = (giro: GiroCalculado): string[] => [
  giro.numero.toString(),
  formatNumber(giro.investimento),
  formatNumber(giro.roiGiro),
  formatNumber(giro.retorno),
  formatNumber(giro.aporte),
  formatNumber(giro.retirada),
  formatNumber(giro.saldo),
  giro.tempoDecorrido.toString()
];

export const exportToCSV = (giros: GiroCalculado[], fileName: string): void => {
  const headers = generateCSVHeaders();
  const rows = giros.map(convertGiroToCSVRow);
  
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * PDF export utilities
 */
export const generatePDFFileName = (simulationName: string): string => {
  const cleanName = simulationName.replace(/[^a-zA-Z0-9]/g, '-');
  const date = new Date().toISOString().split('T')[0];
  return `simulacao_investimentos_${cleanName}_${date}.pdf`;
};

/**
 * Storage utilities
 */
export const saveToLocalStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
  }
};

/**
 * Validation utilities
 */
export const validateSimulation = (simulation: { name: string; numberOfCycles: number }): string[] => {
  const errors: string[] = [];
  
  if (!simulation.name?.trim()) {
    errors.push('Nome da simulação é obrigatório');
  }
  
  if (simulation.numberOfCycles <= 0) {
    errors.push('Número de giros deve ser maior que zero');
  }
  
  return errors;
};

/**
 * Array utilities
 */
export const createArrayFromLength = (length: number): number[] => {
  return Array.from({ length }, (_, i) => i + 1);
};