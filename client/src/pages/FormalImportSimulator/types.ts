import { FormalImportSimulation, Tax, Expense, Product } from './hooks/useFormalImportState';

export interface FormalImportSimulatorPresentationProps {
  // Estado
  simulation: FormalImportSimulation;
  activeTab: string;
  showAddTaxDialog: boolean;
  showAddExpenseDialog: boolean;
  newTax: Tax;
  newExpense: Expense;
  isLoading: boolean;
  isCalculating: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  
  // Cálculos
  totalCBM: number;
  totalUSD: number;
  totalTaxes: number;
  totalExpenses: number;
  
  // Funções de formatação
  formatCurrency: (value: number) => string;
  formatUSD: (value: number) => string;
  formatPercentage: (value: number) => string;
  
  // Handlers de estado
  setActiveTab: (tab: string) => void;
  setShowAddTaxDialog: (show: boolean) => void;
  setShowAddExpenseDialog: (show: boolean) => void;
  setNewTax: (tax: Tax) => void;
  setNewExpense: (expense: Expense) => void;
  
  // Handlers de operações
  handleSimulationUpdate: (field: string, value: any) => void;
  handleCalculateClick: () => void;
  handleSaveClick: () => void;
  handleDeleteClick: () => void;
  handleAddTaxClick: () => void;
  handleAddExpenseClick: () => void;
  
  // Operações de produtos
  addProduct: () => void;
  updateProduct: (index: number, field: keyof Product, value: any) => void;
  removeProduct: (index: number) => void;
  
  // Operações de impostos e despesas
  calculateTaxEstimate: (tax: Tax) => number;
  removeCustomTax: (index: number) => void;
  updateTax: (index: number, field: keyof Tax, value: any) => void;
  removeExpense: (index: number) => void;
  updateExpense: (index: number, field: keyof Expense, value: any) => void;
  handleExpenseUSDChange: (index: number, value: number) => void;
  handleExpenseRealChange: (index: number, value: number) => void;
  
  // Constantes
  defaultTaxNames: string[];
} 