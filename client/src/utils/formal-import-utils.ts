import { Product, Tax, Expense } from '@/types/formal-import';

// Funções de formatação memoizadas
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatUSD = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${((value || 0) * 100).toFixed(2)}%`;
};

export const formatCBM = (value: number): string => {
  return `${value.toFixed(6)} m³`;
};

// Funções de cálculo otimizadas
export const calculateCBM = (comprimento: number, largura: number, altura: number): number => {
  if (comprimento <= 0 || largura <= 0 || altura <= 0) return 0;
  return (comprimento * largura * altura) / 1000000; // Converter cm³ para m³
};

export const calculateProductCBM = (product: Product): { cbmUnitario: number; cbmTotal: number } => {
  const cbmUnitario = calculateCBM(product.comprimento, product.largura, product.altura);
  const cbmTotal = cbmUnitario * product.quantidade;
  
  return {
    cbmUnitario: Number(cbmUnitario.toFixed(6)),
    cbmTotal: Number(cbmTotal.toFixed(6))
  };
};

export const calculateTotalCBM = (products: Product[]): number => {
  return products.reduce((total, product) => {
    const { cbmTotal } = calculateProductCBM(product);
    return total + cbmTotal;
  }, 0);
};

export const calculateProductPercentages = (products: Product[]): Product[] => {
  const totalCBM = calculateTotalCBM(products);
  
  return products.map(product => {
    const { cbmUnitario, cbmTotal } = calculateProductCBM(product);
    const percentualContainer = totalCBM > 0 ? cbmTotal / totalCBM : 0;
    
    return {
      ...product,
      cbmUnitario,
      cbmTotal,
      percentualContainer
    };
  });
};

// Funções de validação
export const validateProduct = (product: Product): string[] => {
  const errors: string[] = [];
  
  if (!product.nome?.trim()) {
    errors.push('Nome do produto é obrigatório');
  }
  
  if (product.quantidade <= 0) {
    errors.push('Quantidade deve ser maior que zero');
  }
  
  if (product.valorUnitarioUsd < 0) {
    errors.push('Valor unitário não pode ser negativo');
  }
  
  if (product.comprimento <= 0 || product.largura <= 0 || product.altura <= 0) {
    errors.push('Dimensões devem ser maiores que zero');
  }
  
  return errors;
};

export const validateSimulation = (simulation: any): string[] => {
  const errors: string[] = [];
  
  if (!simulation.nome?.trim()) {
    errors.push('Nome da simulação é obrigatório');
  }
  
  if (simulation.taxaDolar <= 0) {
    errors.push('Taxa do dólar deve ser maior que zero');
  }
  
  if (simulation.valorFobDolar < 0) {
    errors.push('Valor FOB não pode ser negativo');
  }
  
  if (simulation.valorFreteDolar < 0) {
    errors.push('Valor do frete não pode ser negativo');
  }
  
  if (simulation.percentualSeguro < 0) {
    errors.push('Percentual do seguro não pode ser negativo');
  }
  
  if (!simulation.produtos?.length) {
    errors.push('Adicione pelo menos um produto');
  }
  
  return errors;
};

// Funções de conversão
export const convertUSDToBRL = (usdValue: number, exchangeRate: number): number => {
  return usdValue * exchangeRate;
};

export const convertBRLToUSD = (brlValue: number, exchangeRate: number): number => {
  return brlValue / exchangeRate;
};

// Funções de cálculo de impostos
export const calculateTaxEstimate = (tax: Tax, simulation: any): number => {
  const valorFobReal = simulation.valorFobDolar * simulation.taxaDolar;
  const valorFreteReal = simulation.valorFreteDolar * simulation.taxaDolar;
  const valorCfrReal = valorFobReal + valorFreteReal;
  const valorSeguro = valorCfrReal * (simulation.percentualSeguro / 100);
  const baseTotal = valorFobReal + valorFreteReal + valorSeguro;
  
  let baseValue = 0;
  
  switch (tax.baseCalculo) {
    case 'fob_frete_seguro':
      baseValue = baseTotal;
      break;
    case 'fob_apenas':
      baseValue = valorFobReal;
      break;
    default:
      baseValue = baseTotal;
  }
  
  return baseValue * (tax.aliquota / 100);
};

// Funções de atualização de despesas
export const updateExpenseUSD = (expenses: Expense[], index: number, usdValue: number, exchangeRate: number): Expense[] => {
  const newExpenses = [...expenses];
  newExpenses[index] = {
    ...newExpenses[index],
    valorDolar: usdValue,
    valorReal: convertUSDToBRL(usdValue, exchangeRate)
  };
  return newExpenses;
};

export const updateExpenseBRL = (expenses: Expense[], index: number, brlValue: number, exchangeRate: number): Expense[] => {
  const newExpenses = [...expenses];
  newExpenses[index] = {
    ...newExpenses[index],
    valorReal: brlValue,
    valorDolar: convertBRLToUSD(brlValue, exchangeRate)
  };
  return newExpenses;
}; 