/**
 * TIPOS UNIFICADOS FINANÇAS360 - FASE 3 REFATORAÇÃO
 * 
 * Sistema de tipos centralizado para eliminar duplicação
 * entre todos os managers do Finanças360
 */

export type BaseFinancas360Entity = {
  id: number;
  createdAt: string;
  updatedAt: string;
  ativo?: boolean;
  observacoes?: string;
};

export type EntityStatus = 'ativo' | 'inativo' | 'pendente' | 'processado' | 'cancelado';
export type FilterType = 'all' | string;

// Base Form Data structure
export type BaseFormData<T = {}> = T & {
  ativo?: boolean;
  observacoes?: string;
};

// Generic CRUD Operations
export interface CrudOperations<T, FormData> {
  items: T[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredItems: T[];
  
  // Form state
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  editingItem: T | null;
  setEditingItem: (item: T | null) => void;
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  resetFormData: () => void;
  
  // Mutations
  createMutation: {
    mutate: (data: FormData) => void;
    isPending: boolean;
  };
  updateMutation: {
    mutate: (data: { id: number; data: FormData }) => void;
    isPending: boolean;
  };
  deleteMutation: {
    mutate: (id: number) => void;
    isPending: boolean;
  };
}

// Manager Configuration
export interface ManagerConfig<T, FormData> {
  title: string;
  description: string;
  apiEndpoint: string;
  queryKey: string;
  
  // Form configuration
  defaultFormData: FormData;
  
  // UI configuration
  columns?: ColumnConfig<T>[];
  filters?: FilterConfig[];
  actions?: ActionConfig<T>[];
  
  // Validation
  validateForm?: (data: FormData) => string | null;
  
  // Custom renderers
  renderItem?: (item: T) => React.ReactNode;
  renderForm?: (props: FormProps<FormData>) => React.ReactNode;
}

export interface ColumnConfig<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'search' | 'date' | 'range';
  options?: { value: string; label: string }[];
}

export interface ActionConfig<T> {
  key: string;
  label: string;
  icon: React.ComponentType;
  action: (item: T) => void;
  variant?: 'default' | 'destructive' | 'outline';
  show?: (item: T) => boolean;
}

export interface FormProps<FormData> {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  isEditing: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

// Specific entity types (using the existing structures)
export interface NotaFiscal extends BaseFinancas360Entity {
  empresaId: number;
  empresa: {
    id: number;
    razaoSocial: string;
  };
  serie: string;
  numero: string;
  dataEmissao: string;
  valorTotal: number;
  status: 'emitida' | 'enviada' | 'cancelada';
  tipo: 'entrada' | 'saida';
}

export interface CanalPagamento extends BaseFinancas360Entity {
  nome: string;
  tipo: 'pix' | 'boleto' | 'cartao' | 'transferencia' | 'gateway' | 'outros';
  provedor: string;
  configuracoes: {
    apiKey?: string;
    secretKey?: string;
    merchantId?: string;
    webhookUrl?: string;
    taxa?: number;
    prazoLiquidacao?: number;
    ativo?: boolean;
    ambiente?: 'sandbox' | 'producao';
    [key: string]: any;
  };
}

export interface Devolucao extends BaseFinancas360Entity {
  notaFiscal: {
    id: number;
    serie: string;
    numero: string;
  };
  tipo: 'produto' | 'valor' | 'total';
  motivo: string;
  dataDevolucao: string;
  valorDevolvido: number;
  status: 'pendente' | 'processada' | 'cancelada';
  itens?: {
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }[];
}

export interface Lancamento extends BaseFinancas360Entity {
  empresa: {
    id: number;
    razaoSocial: string;
  };
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: 'pendente' | 'pago' | 'cancelado' | 'vencido';
  categoria?: string;
  anexos?: string[];
}

export interface ContaBancaria extends BaseFinancas360Entity {
  banco: {
    id: number;
    nome: string;
    codigo: string;
  };
  agencia: string;
  conta: string;
  digito: string;
  tipo: 'corrente' | 'poupanca' | 'salario';
  saldoAtual: number;
  titular: string;
}

export interface FormaPagamento extends BaseFinancas360Entity {
  nome: string;
  tipo: 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'boleto' | 'transferencia' | 'outros';
  configuracoes: {
    taxa?: number;
    prazoCompensacao?: number;
    limiteTransacao?: number;
    ativo?: boolean;
    [key: string]: any;
  };
}

// Form Data Types
export type NotaFiscalFormData = BaseFormData<{
  empresaId: number;
  serie: string;
  numero: string;
  dataEmissao: string;
  valorTotal: number;
  status: 'emitida' | 'enviada' | 'cancelada';
  tipo: 'entrada' | 'saida';
}>;

export type CanalPagamentoFormData = BaseFormData<{
  nome: string;
  tipo: 'pix' | 'boleto' | 'cartao' | 'transferencia' | 'gateway' | 'outros';
  provedor: string;
  configuracoes: {
    apiKey?: string;
    secretKey?: string;
    merchantId?: string;
    webhookUrl?: string;
    taxa?: number;
    prazoLiquidacao?: number;
    ativo?: boolean;
    ambiente?: 'sandbox' | 'producao';
    [key: string]: any;
  };
}>;

export type DevolucaoFormData = BaseFormData<{
  notaFiscalId: number;
  tipo: 'produto' | 'valor' | 'total';
  motivo: string;
  dataDevolucao: string;
  valorDevolvido: number;
  status: 'pendente' | 'processada' | 'cancelada';
  itens?: {
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }[];
}>;

export type LancamentoFormData = BaseFormData<{
  empresaId: number;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: 'pendente' | 'pago' | 'cancelado' | 'vencido';
  categoria?: string;
}>;

export type ContaBancariaFormData = BaseFormData<{
  bancoId: number;
  agencia: string;
  conta: string;
  digito: string;
  tipo: 'corrente' | 'poupanca' | 'salario';
  saldoAtual: number;
  titular: string;
}>;

export type FormaPagamentoFormData = BaseFormData<{
  nome: string;
  tipo: 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'boleto' | 'transferencia' | 'outros';
  configuracoes: {
    taxa?: number;
    prazoCompensacao?: number;
    limiteTransacao?: number;
    ativo?: boolean;
    [key: string]: any;
  };
}>;