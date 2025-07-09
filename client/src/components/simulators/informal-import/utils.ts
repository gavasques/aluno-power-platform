// Utility functions for Informal Import Simulation

/**
 * Brazilian number formatting utilities
 */
export const formatBrazilianNumber = (value: number, decimals: number = 2): string => {
  if (value === 0) return '';
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const formatCurrency = (value: number): string => {
  return `R$ ${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

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
 * Validation utilities
 */
export const validateSimulation = (simulation: { nomeSimulacao: string; produtos: any[] }): string[] => {
  const errors: string[] = [];
  
  if (!simulation.nomeSimulacao?.trim()) {
    errors.push('Nome da simulação é obrigatório');
  }
  
  if (!simulation.produtos?.length) {
    errors.push('Pelo menos um produto deve ser adicionado');
  }
  
  return errors;
};

/**
 * CSV export utilities
 */
export const generateCSVHeaders = (): string[] => [
  "Descrição", "Quantidade", "Valor Unit. USD", "Peso Unit. kg", 
  "Custo Produto BRL", "Frete BRL", "Produto+Frete BRL", "II BRL", 
  "ICMS BRL", "Total c/ Impostos BRL", "Custo Unit. s/ Imposto BRL", "Custo Unit. c/ Imposto BRL"
];

export const convertProductToCSVRow = (produto: any): string[] => [
  produto.descricao_produto,
  produto.quantidade.toString(),
  formatBrazilianNumber(produto.valor_unitario_usd),
  formatBrazilianNumber(produto.peso_bruto_unitario_kg, 3),
  formatBrazilianNumber(produto.custo_produto_brl || 0),
  formatBrazilianNumber(produto.custo_frete_por_produto_brl || 0),
  formatBrazilianNumber(produto.produto_mais_frete_brl || 0),
  formatBrazilianNumber(produto.valor_ii_brl || 0),
  formatBrazilianNumber(produto.valor_icms_brl || 0),
  formatBrazilianNumber(produto.valor_total_produto_impostos_brl || 0),
  formatBrazilianNumber(produto.custo_unitario_sem_imposto_brl || 0),
  formatBrazilianNumber(produto.custo_unitario_com_imposto_brl || 0)
];

export const exportToCSV = (produtos: any[], fileName: string): void => {
  const headers = generateCSVHeaders();
  const rows = produtos.map(convertProductToCSVRow);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

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