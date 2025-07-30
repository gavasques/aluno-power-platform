/**
 * TYPES: Lançamentos - Sistema de Lançamentos Financeiros
 * Tipos centralizados para lançamentos de receitas e despesas
 * Extraído de LancamentosManager.tsx (672 linhas) para modularização
 * Data: Janeiro 30, 2025
 */

// ===== CORE TYPES =====
export interface Lancamento {
  id: number;
  empresaId: number;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: 'pendente' | 'pago' | 'cancelado' | 'vencido';
  categoria: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;
  
  // Relacionamentos
  empresa?: Empresa;
  parceiro?: Parceiro;
  contaBancaria?: ContaBancaria;
  formaPagamento?: FormaPagamento;
  canal?: Canal;
  estruturaDre?: EstruturaDRE;
}

export interface Empresa {
  id: number;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  isActive: boolean;
}

export interface Parceiro {
  id: number;
  nome: string;
  tipo: 'cliente' | 'fornecedor' | 'ambos';
  documento: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  observacoes?: string;
  isActive: boolean;
}

export interface ContaBancaria {
  id: number;
  empresaId: number;
  banco: string;
  agencia: string;
  conta: string;
  tipo: 'corrente' | 'poupanca' | 'investimento';
  saldoInicial: number;
  saldoAtual: number;
  isActive: boolean;
}

export interface FormaPagamento {
  id: number;
  nome: string;
  tipo: 'dinheiro' | 'cartao' | 'pix' | 'boleto' | 'transferencia';
  taxaFixa?: number;
  taxaPercentual?: number;
  prazoCompensacao?: number;
  isActive: boolean;
}

export interface Canal {
  id: number;
  nome: string;
  tipo: 'fisico' | 'online' | 'marketplace' | 'social';
  url?: string;
  comissao?: number;
  isActive: boolean;
}

export interface EstruturaDRE {
  id: number;
  codigo: string;
  descricao: string;
  tipo: 'receita' | 'custo' | 'despesa';
  nivel: number;
  paiId?: number;
  ordem?: number;
  isActive: boolean;
}

// ===== FORM TYPES =====
export interface LancamentoFormData {
  empresaId: number;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: 'pendente' | 'pago' | 'cancelado' | 'vencido';
  categoria: string;
  observacoes?: string;
  
  // Campos opcionais para relacionamentos
  parceiroId?: number;
  contaBancariaId?: number;
  formaPagamentoId?: number;
  canalId?: number;
  estruturaDreId?: number;
}

// ===== VALIDATION TYPES =====
export interface LancamentoValidationErrors {
  empresaId?: string;
  tipo?: string;
  descricao?: string;
  valor?: string;
  dataVencimento?: string;
  dataPagamento?: string;
  status?: string;
  categoria?: string;
  observacoes?: string;
  parceiroId?: string;
  contaBancariaId?: string;
  formaPagamentoId?: string;
  canalId?: string;
  estruturaDreId?: string;
  general?: string[];
}

// ===== FILTER TYPES =====
export interface LancamentoFilters {
  status: string;
  tipo: string;
  empresaId: string;
  categoria: string;
  dataInicio: string;
  dataFim: string;
  valorMin: number | undefined;
  valorMax: number | undefined;
  search: string;
  parceiroId: string;
  contaBancariaId: string;
  formaPagamentoId: string;
  canalId: string;
}

// ===== STATE TYPES =====
export interface LancamentosState {
  // Data
  lancamentos: Lancamento[];
  empresas: Empresa[];
  parceiros: Parceiro[];
  contasBancarias: ContaBancaria[];
  formasPagamento: FormaPagamento[];
  canais: Canal[];
  estruturasDre: EstruturaDRE[];
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  isLoadingEmpresas: boolean;
  isLoadingParceiros: boolean;
  isLoadingContasBancarias: boolean;
  isLoadingFormasPagamento: boolean;
  isLoadingCanais: boolean;
  isLoadingEstruturasDre: boolean;
  
  // Form state
  formData: LancamentoFormData;
  originalData: LancamentoFormData | null;
  isDirty: boolean;
  
  // UI state
  isDialogOpen: boolean;
  editingLancamento: Lancamento | null;
  filters: LancamentoFilters;
  selectedItems: number[];
  
  // Validation
  errors: LancamentoValidationErrors;
  validationErrors: string[];
  
  // Statistics
  totalReceitas: number;
  totalDespesas: number;
  saldoTotal: number;
  lancamentosPendentes: number;
  lancamentosVencidos: number;
}

// ===== COMPONENT PROPS TYPES =====
export interface LancamentosManagerContainerProps {
  onSuccess?: (lancamento: Lancamento) => void;
  onCancel?: () => void;
  readOnly?: boolean;
  showFilters?: boolean;
  showStatistics?: boolean;
  empresaId?: number;
}

export interface LancamentosManagerPresentationProps {
  state: LancamentosState;
  lancamentosData: {
    data: Lancamento[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
  };
  empresasData: {
    data: Empresa[];
    isLoading: boolean;
    error: string | null;
  };
  parceirosData: {
    data: Parceiro[];
    isLoading: boolean;
    error: string | null;
  };
  contasBancariasData: {
    data: ContaBancaria[];
    isLoading: boolean;
    error: string | null;
  };
  formasPagamentoData: {
    data: FormaPagamento[];
    isLoading: boolean;
    error: string | null;
  };
  canaisData: {
    data: Canal[];
    isLoading: boolean;
    error: string | null;
  };
  estruturasDreData: {
    data: EstruturaDRE[];
    isLoading: boolean;
    error: string | null;
  };
  actions: UseLancamentosReturn['actions'];
  utils: UseLancamentosReturn['utils'];
  readOnly?: boolean;
  showFilters?: boolean;
  showStatistics?: boolean;
}

// ===== HOOK RETURN TYPES =====
export interface UseLancamentosReturn {
  state: LancamentosState;
  lancamentosData: {
    data: Lancamento[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
  };
  empresasData: {
    data: Empresa[];
    isLoading: boolean;
    error: string | null;
  };
  parceirosData: {
    data: Parceiro[];
    isLoading: boolean;
    error: string | null;
  };
  contasBancariasData: {
    data: ContaBancaria[];
    isLoading: boolean;
    error: string | null;
  };
  formasPagamentoData: {
    data: FormaPagamento[];
    isLoading: boolean;
    error: string | null;
  };
  canaisData: {
    data: Canal[];
    isLoading: boolean;
    error: string | null;
  };
  estruturasDreData: {
    data: EstruturaDRE[];
    isLoading: boolean;
    error: string | null;
  };
  actions: {
    // CRUD operations
    createLancamento: (data: LancamentoFormData) => Promise<void>;
    updateLancamento: (id: number, data: Partial<LancamentoFormData>) => Promise<void>;
    deleteLancamento: (id: number) => Promise<void>;
    duplicateLancamento: (id: number) => Promise<void>;
    
    // Form actions
    updateFormData: (field: keyof LancamentoFormData, value: any) => void;
    resetForm: () => void;
    openDialog: (lancamento?: Lancamento) => void;
    closeDialog: () => void;
    
    // Filter actions
    updateFilter: (field: keyof LancamentoFilters, value: any) => void;
    resetFilters: () => void;
    applyFilters: () => void;
    
    // Selection actions
    selectItem: (id: number) => void;
    selectAll: () => void;
    clearSelection: () => void;
    bulkDelete: () => Promise<void>;
    bulkUpdateStatus: (status: string) => Promise<void>;
    
    // Status actions
    markAsPaid: (id: number, dataPagamento?: string) => Promise<void>;
    markAsPending: (id: number) => Promise<void>;
    markAsCanceled: (id: number) => Promise<void>;
    
    // Validation
    validateForm: () => boolean;
    validateField: (field: keyof LancamentoFormData, value: any) => string | null;
    clearErrors: () => void;
    
    // Data refresh
    refreshLancamentos: () => void;
    refreshEmpresas: () => void;
    refreshParceiros: () => void;
    refreshContasBancarias: () => void;
    refreshFormasPagamento: () => void;
    refreshCanais: () => void;
    refreshEstruturasDre: () => void;
  };
  utils: {
    // Filtering and search
    filterLancamentos: (lancamentos: Lancamento[]) => Lancamento[];
    searchLancamentos: (lancamentos: Lancamento[], query: string) => Lancamento[];
    sortLancamentos: (lancamentos: Lancamento[], field: string, direction: 'asc' | 'desc') => Lancamento[];
    
    // Formatting
    formatCurrency: (value: number) => string;
    formatDate: (date: string) => string;
    formatDateTime: (date: string) => string;
    formatStatus: (status: string) => string;
    formatTipo: (tipo: string) => string;
    
    // Calculations
    calculateTotalReceitas: (lancamentos: Lancamento[]) => number;
    calculateTotalDespesas: (lancamentos: Lancamento[]) => number;
    calculateSaldo: (lancamentos: Lancamento[]) => number;
    calculateLancamentosPendentes: (lancamentos: Lancamento[]) => number;
    calculateLancamentosVencidos: (lancamentos: Lancamento[]) => number;
    
    // Status helpers
    isVencido: (lancamento: Lancamento) => boolean;
    isPago: (lancamento: Lancamento) => boolean;
    isPendente: (lancamento: Lancamento) => boolean;
    isCancelado: (lancamento: Lancamento) => boolean;
    
    // Date helpers
    isToday: (date: string) => boolean;
    isThisMonth: (date: string) => boolean;
    isThisYear: (date: string) => boolean;
    daysBetween: (date1: string, date2: string) => number;
    
    // Entity helpers
    getEmpresaName: (empresaId: number) => string;
    getParceiroName: (parceiroId: number) => string;
    getContaBancariaName: (contaBancariaId: number) => string;
    getFormaPagamentoName: (formaPagamentoId: number) => string;
    getCanalName: (canalId: number) => string;
    getEstruturaDreName: (estruturaDreId: number) => string;
    
    // Export helpers
    exportToCSV: (lancamentos: Lancamento[]) => void;
    exportToExcel: (lancamentos: Lancamento[]) => void;
    exportToPDF: (lancamentos: Lancamento[]) => void;
    
    // Validation helpers
    isValidCurrency: (value: string) => boolean;
    isValidDate: (date: string) => boolean;
    isValidDescription: (description: string) => boolean;
  };
}

// ===== CONSTANTS =====
export const LANCAMENTO_STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente', color: 'orange' },
  { value: 'pago', label: 'Pago', color: 'green' },
  { value: 'cancelado', label: 'Cancelado', color: 'gray' },
  { value: 'vencido', label: 'Vencido', color: 'red' }
];

export const LANCAMENTO_TIPO_OPTIONS = [
  { value: 'receita', label: 'Receita', color: 'green', icon: 'TrendingUp' },
  { value: 'despesa', label: 'Despesa', color: 'red', icon: 'TrendingDown' }
];

export const LANCAMENTO_FORM_DEFAULTS: LancamentoFormData = {
  empresaId: 0,
  tipo: 'receita',
  descricao: '',
  valor: 0,
  dataVencimento: '',
  dataPagamento: '',
  status: 'pendente',
  categoria: '',
  observacoes: ''
};

export const LANCAMENTO_FILTERS_DEFAULTS: LancamentoFilters = {
  status: 'all',
  tipo: 'all',
  empresaId: 'all',
  categoria: '',
  dataInicio: '',
  dataFim: '',
  valorMin: undefined,
  valorMax: undefined,
  search: '',
  parceiroId: 'all',
  contaBancariaId: 'all',
  formaPagamentoId: 'all',
  canalId: 'all'
};

// ===== VALIDATION FUNCTIONS =====
export const validateLancamentoForm = (data: LancamentoFormData): LancamentoValidationErrors => {
  const errors: LancamentoValidationErrors = {};

  // Empresa validation
  if (!data.empresaId || data.empresaId === 0) {
    errors.empresaId = 'Empresa é obrigatória';
  }

  // Tipo validation
  if (!data.tipo) {
    errors.tipo = 'Tipo é obrigatório';
  }

  // Descrição validation
  if (!data.descricao.trim()) {
    errors.descricao = 'Descrição é obrigatória';
  } else if (data.descricao.length < 3) {
    errors.descricao = 'Descrição deve ter pelo menos 3 caracteres';
  } else if (data.descricao.length > 255) {
    errors.descricao = 'Descrição deve ter no máximo 255 caracteres';
  }

  // Valor validation
  if (!data.valor || data.valor <= 0) {
    errors.valor = 'Valor deve ser maior que zero';
  } else if (data.valor > 999999999.99) {
    errors.valor = 'Valor muito alto';
  }

  // Data vencimento validation
  if (!data.dataVencimento) {
    errors.dataVencimento = 'Data de vencimento é obrigatória';
  } else {
    const vencimento = new Date(data.dataVencimento);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (vencimento < hoje && data.status === 'pendente') {
      // Allow past dates but warn
    }
  }

  // Data pagamento validation
  if (data.dataPagamento && data.status !== 'pago') {
    errors.dataPagamento = 'Data de pagamento só pode ser preenchida se status for "Pago"';
  }

  if (data.status === 'pago' && !data.dataPagamento) {
    errors.dataPagamento = 'Data de pagamento é obrigatória quando status é "Pago"';
  }

  // Status validation
  if (!data.status) {
    errors.status = 'Status é obrigatório';
  }

  // Categoria validation
  if (!data.categoria.trim()) {
    errors.categoria = 'Categoria é obrigatória';
  } else if (data.categoria.length > 100) {
    errors.categoria = 'Categoria deve ter no máximo 100 caracteres';
  }

  // Observações validation
  if (data.observacoes && data.observacoes.length > 1000) {
    errors.observacoes = 'Observações deve ter no máximo 1000 caracteres';
  }

  return errors;
};

// ===== UTILITY FUNCTIONS =====
export const calculateLancamentoStats = (lancamentos: Lancamento[]) => {
  const stats = {
    totalReceitas: 0,
    totalDespesas: 0,
    saldoTotal: 0,
    lancamentosPendentes: 0,
    lancamentosVencidos: 0,
    lancamentosPagos: 0,
    lancamentosCancelados: 0
  };

  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);

  lancamentos.forEach(lancamento => {
    const valor = lancamento.valor;
    const vencimento = new Date(lancamento.dataVencimento);

    // Totais por tipo
    if (lancamento.tipo === 'receita' && lancamento.status === 'pago') {
      stats.totalReceitas += valor;
    } else if (lancamento.tipo === 'despesa' && lancamento.status === 'pago') {
      stats.totalDespesas += valor;
    }

    // Status counts
    switch (lancamento.status) {
      case 'pendente':
        stats.lancamentosPendentes++;
        if (vencimento < hoje) {
          stats.lancamentosVencidos++;
        }
        break;
      case 'pago':
        stats.lancamentosPagos++;
        break;
      case 'cancelado':
        stats.lancamentosCancelados++;
        break;
    }
  });

  stats.saldoTotal = stats.totalReceitas - stats.totalDespesas;

  return stats;
};

export const formatLancamentoStatus = (status: string): { label: string; color: string; variant: string } => {
  switch (status) {
    case 'pendente':
      return { label: 'Pendente', color: 'orange', variant: 'secondary' };
    case 'pago':
      return { label: 'Pago', color: 'green', variant: 'default' };
    case 'cancelado':
      return { label: 'Cancelado', color: 'gray', variant: 'outline' };
    case 'vencido':
      return { label: 'Vencido', color: 'red', variant: 'destructive' };
    default:
      return { label: status, color: 'gray', variant: 'outline' };
  }
};

export const formatLancamentoTipo = (tipo: string): { label: string; color: string; icon: string } => {
  switch (tipo) {
    case 'receita':
      return { label: 'Receita', color: 'green', icon: 'TrendingUp' };
    case 'despesa':
      return { label: 'Despesa', color: 'red', icon: 'TrendingDown' };
    default:
      return { label: tipo, color: 'gray', icon: 'Receipt' };
  }
};