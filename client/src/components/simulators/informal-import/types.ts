/**
 * Types and interfaces for Informal Import Simulation
 * Enhanced with better type safety and validation
 */

// Enums for better type safety
export type Currency = "USD" | "BRL";
export type AllocationMethod = "peso" | "valor_fob" | "quantidade";

// Main configuration interface
export interface ConfiguracoesGerais {
  taxa_cambio_usd_brl: number;
  aliquota_ii_percentual: number;
  aliquota_icms_percentual: number;
  custo_frete_internacional_total_moeda_original: number;
  moeda_frete_internacional: Currency;
  outras_despesas_aduaneiras_total_brl: number;
  metodo_rateio_frete: AllocationMethod;
  metodo_rateio_outras_despesas: AllocationMethod;
}

// Configuration validation rules
export interface ConfigValidationRules {
  taxa_cambio_usd_brl: { min: 0.1, max: 20 };
  aliquota_ii_percentual: { min: 0, max: 1 };
  aliquota_icms_percentual: { min: 0, max: 0.5 };
  custo_frete_internacional_total_moeda_original: { min: 0, max: Infinity };
  outras_despesas_aduaneiras_total_brl: { min: 0, max: Infinity };
}

// Product interfaces with better organization
export interface ProdutoBase {
  id_produto_interno: string;
  descricao_produto: string;
  quantidade: number;
  valor_unitario_usd: number;
  peso_bruto_unitario_kg: number;
}

export interface ProdutoCalculado extends ProdutoBase {
  peso_bruto_total_produto_kg: number;
  valor_total_produto_usd: number;
  custo_produto_brl: number;
  custo_frete_por_produto_brl: number;
  produto_mais_frete_brl: number;
  base_calculo_ii_brl: number;
  valor_ii_brl: number;
  outras_despesas_rateadas_brl: number;
  base_calculo_icms_planilha_brl: number;
  valor_icms_brl: number;
  valor_total_produto_impostos_brl: number;
  custo_unitario_sem_imposto_brl: number;
  custo_unitario_com_imposto_brl: number;
}

// Main product type used in simulation
export type ProdutoSimulacao = ProdutoBase & Partial<Omit<ProdutoCalculado, keyof ProdutoBase>>;

// Product validation rules
export interface ProductValidationRules {
  descricao_produto: { minLength: 1, maxLength: 200 };
  quantidade: { min: 1, max: 999999 };
  valor_unitario_usd: { min: 0.01, max: 999999 };
  peso_bruto_unitario_kg: { min: 0.001, max: 999999 };
}

// Enhanced simulation interfaces
export interface SimulationMetadata {
  id?: number;
  nomeSimulacao: string;
  codigoSimulacao?: string;
  nomeFornecedor?: string;
  observacoes?: string;
  dataCriacao?: string;
  dataModificacao?: string;
}

export interface SimulacaoCompleta extends SimulationMetadata {
  configuracoesGerais: ConfiguracoesGerais;
  produtos: ProdutoSimulacao[];
}

// Enhanced totals with better naming and organization
export interface SimulationTotals {
  total_sim_quantidade_itens: number;
  total_sim_custo_produto_brl: number;
  total_sim_produto_mais_frete_brl: number;
  total_sim_valor_ii_brl: number;
  total_sim_valor_icms_brl: number;
  total_sim_outras_despesas_aduaneiras_brl: number;
  custo_total_importacao_brl: number;
  peso_total_kg: number;
  preco_por_kg_usd: number;
  multiplicador_importacao: number;
  valor_fob_total_usd: number;
}

export interface CalculatedResults {
  produtos: ProdutoCalculado[];
  totals: SimulationTotals;
}

// Event handlers types for better type safety
export interface SimulationEventHandlers {
  onSimulationChange: (updates: Partial<SimulacaoCompleta>) => void;
  onConfigChange: (field: keyof ConfiguracoesGerais, value: any) => void;
  onProductAdd: () => void;
  onProductUpdate: (index: number, field: keyof ProdutoSimulacao, value: any) => void;
  onProductRemove: (index: number) => void;
  onSave: () => void;
  onLoad: (simulation: SimulacaoCompleta) => void;
  onNew: () => void;
  onExportPDF: () => void;
}

// UI state management
export interface UIState {
  showSaveDialog: boolean;
  showLoadDialog: boolean;
  showDeleteConfirm: boolean;
  isLoading: boolean;
  selectedSimulationId: number | null;
}

// Validation result types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'format' | 'range';
}

export interface ValidationWarning {
  field: string;
  message: string;
  type: 'performance' | 'accuracy' | 'recommendation';
}

// Constants and default values
export const VALIDATION_RULES: ConfigValidationRules = {
  taxa_cambio_usd_brl: { min: 0.1, max: 20 },
  aliquota_ii_percentual: { min: 0, max: 1 },
  aliquota_icms_percentual: { min: 0, max: 0.5 },
  custo_frete_internacional_total_moeda_original: { min: 0, max: Infinity },
  outras_despesas_aduaneiras_total_brl: { min: 0, max: Infinity },
};

export const PRODUCT_VALIDATION_RULES: ProductValidationRules = {
  descricao_produto: { minLength: 1, maxLength: 200 },
  quantidade: { min: 1, max: 999999 },
  valor_unitario_usd: { min: 0.01, max: 999999 },
  peso_bruto_unitario_kg: { min: 0.001, max: 999999 },
};

export const DEFAULT_CONFIG: ConfiguracoesGerais = {
  taxa_cambio_usd_brl: 5.20,
  aliquota_ii_percentual: 0.60,
  aliquota_icms_percentual: 0.17,
  custo_frete_internacional_total_moeda_original: 0,
  moeda_frete_internacional: "USD",
  outras_despesas_aduaneiras_total_brl: 0,
  metodo_rateio_frete: "peso",
  metodo_rateio_outras_despesas: "quantidade",
};

export const DEFAULT_PRODUCT: Omit<ProdutoSimulacao, 'id_produto_interno'> = {
  descricao_produto: "",
  quantidade: 1,
  valor_unitario_usd: 0,
  peso_bruto_unitario_kg: 0,
};

export const DEFAULT_UI_STATE: UIState = {
  showSaveDialog: false,
  showLoadDialog: false,
  showDeleteConfirm: false,
  isLoading: false,
  selectedSimulationId: null,
};

export const DEFAULT_SIMULATION: Omit<SimulacaoCompleta, 'id'> = {
  nomeSimulacao: "Nova Simulação",
  nomeFornecedor: "",
  observacoes: "",
  configuracoesGerais: DEFAULT_CONFIG,
  produtos: [],
};