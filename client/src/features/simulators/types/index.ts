/**
 * TYPES: Formal Import Simulator
 * Tipos centralizados para simulador de importação formal
 * Extraído de FormalImportSimulatorFixed.tsx (1053 linhas) para modularização
 * Data: Janeiro 29, 2025
 */

// ===== CORE TYPES =====
export interface Tax {
  nome: string;
  aliquota: number;
  baseCalculo: string;
  valor: number;
}

export interface Expense {
  nome: string;
  valorDolar: number;
  valorReal: number;
}

export interface Product {
  id?: string;
  nome: string;
  ncm: string;
  quantidade: number;
  valorUnitarioUsd: number;
  comprimento: number; // cm
  largura: number; // cm
  altura: number; // cm
  cbmUnitario?: number;
  cbmTotal?: number;
  percentualContainer?: number;
  valorTotalUSD?: number;
  valorTotalBRL?: number;
  freteRateio?: number;
  despesasRateio?: number;
  impostos?: {
    ii: number;
    ipi: number;
    pis: number;
    cofins: number;
    icms: number;
  };
  custoTotal?: number;
  custoUnitario?: number;
}

export interface SimulationResults {
  valorFobReal?: number;
  valorFreteReal?: number;
  valorCfrDolar?: number;
  valorCfrReal?: number;
  valorSeguro?: number;
  totalImpostos?: number;
  totalDespesas?: number;
  custoTotalImportacao?: number;
  custoUnitarioMedio?: number;
}

export interface FormalImportSimulation {
  id?: number;
  nome: string;
  fornecedor: string;
  despachante: string;
  agenteCargas: string;
  status: string;
  taxaDolar: number;
  valorFobDolar: number;
  valorFreteDolar: number;
  percentualSeguro: number;
  impostos: Tax[];
  despesasAdicionais: Expense[];
  produtos: Product[];
  resultados: SimulationResults;
  dataSimulacao?: string;
  observacoes?: string;
}

// ===== FORM TYPES =====
export interface ProductFormData {
  nome: string;
  ncm: string;
  quantidade: string;
  valorUnitarioUsd: string;
  comprimento: string;
  largura: string;
  altura: string;
}

export interface TaxFormData {
  nome: string;
  aliquota: string;
  baseCalculo: string;
}

export interface ExpenseFormData {
  nome: string;
  valorDolar: string;
}

export interface SimulationFormData {
  nome: string;
  fornecedor: string;
  despachante: string;
  agenteCargas: string;
  taxaDolar: string;
  valorFobDolar: string;
  valorFreteDolar: string;
  percentualSeguro: string;
  observacoes: string;
}

// ===== HOOK RETURN TYPES =====
export interface UseSimulationDataReturn {
  simulation: FormalImportSimulation;
  isLoading: boolean;
  error: string | null;
  updateSimulation: (data: Partial<FormalImportSimulation>) => void;
  saveSimulation: () => Promise<void>;
  loadSimulation: (id: number) => Promise<void>;
  resetSimulation: () => void;
}

export interface UseProductsReturn {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  calculateProductMetrics: () => void;
}

export interface UseTaxesReturn {
  taxes: Tax[];
  addTax: (tax: Omit<Tax, 'valor'>) => void;
  updateTax: (index: number, tax: Partial<Tax>) => void;
  removeTax: (index: number) => void;
  calculateTaxes: () => void;
}

export interface UseExpensesReturn {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'valorReal'>) => void;
  updateExpense: (index: number, expense: Partial<Expense>) => void;
  removeExpense: (index: number) => void;
  calculateExpenses: () => void;
}

export interface UseCalculationsReturn {
  results: SimulationResults;
  calculateAll: () => void;
  calculateFob: () => number;
  calculateFreight: () => number;
  calculateInsurance: () => number;
  calculateTotalTaxes: () => number;
  calculateTotalExpenses: () => number;
  calculateFinalCost: () => number;
}

// ===== UI COMPONENT TYPES =====
export interface TabsState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export interface ModalState {
  isOpen: boolean;
  type: 'product' | 'tax' | 'expense' | 'save' | null;
  data?: any;
  openModal: (type: 'product' | 'tax' | 'expense' | 'save', data?: any) => void;
  closeModal: () => void;
}

// ===== CONSTANTS =====
export const DEFAULT_TAXES: Omit<Tax, 'valor'>[] = [
  { nome: 'Imposto de Importação (II)', aliquota: 20, baseCalculo: 'FOB' },
  { nome: 'IPI', aliquota: 15, baseCalculo: 'FOB + II' },
  { nome: 'PIS', aliquota: 1.65, baseCalculo: 'CFR + II + IPI' },
  { nome: 'COFINS', aliquota: 7.6, baseCalculo: 'CFR + II + IPI' },
  { nome: 'ICMS', aliquota: 18, baseCalculo: 'CFR + II + IPI + PIS + COFINS + Seguro' }
];

export const DEFAULT_EXPENSES: Omit<Expense, 'valorReal'>[] = [
  { nome: 'Taxa SISCOMEX', valorDolar: 200 },
  { nome: 'Armazenagem', valorDolar: 150 },
  { nome: 'Movimentação', valorDolar: 100 },
  { nome: 'Despachante', valorDolar: 800 },
  { nome: 'Outros', valorDolar: 200 }
];

export const SIMULATION_STATUS = [
  'Rascunho',
  'Em Análise',
  'Aprovada',
  'Cancelada',
  'Finalizada'
] as const;

export type SimulationStatus = typeof SIMULATION_STATUS[number];