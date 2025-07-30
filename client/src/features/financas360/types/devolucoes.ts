/**
 * TYPES: Devolucoes - Sistema de Gerenciamento de Devoluções
 * Tipos centralizados para devoluções e notas fiscais
 * Extraído de DevolucaesManager.tsx (700 linhas) para modularização
 * Data: Janeiro 30, 2025
 */

// ===== CORE TYPES =====
export interface Devolucao {
  id: number;
  notaFiscal: {
    id: number;
    serie: string;
    numero: string;
    valorTotal?: number;
    dataEmissao?: string;
    cliente?: {
      id: number;
      razaoSocial: string;
      cnpj: string;
    };
  };
  tipo: DevolucaoTipo;
  motivo: string;
  dataDevolucao: string;
  valorDevolvido: number;
  status: DevolucaoStatus;
  observacoes?: string;
  itens?: DevolucaoItem[];
  processamento?: {
    responsavel?: string;
    dataProcessamento?: string;
    observacoesProcessamento?: string;
  };
  anexos?: DevolucaoAnexo[];
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;
}

export type DevolucaoTipo = 'produto' | 'valor' | 'total';
export type DevolucaoStatus = 'pendente' | 'em_analise' | 'aprovada' | 'processada' | 'cancelada' | 'rejeitada';

export interface DevolucaoItem {
  id?: number;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  codigoProduto?: string;
  ncm?: string;
  cfop?: string;
  motivoItem?: string;
}

export interface DevolucaoAnexo {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy: number;
}

export interface NotaFiscal {
  id: number;
  serie: string;
  numero: string;
  valorTotal: number;
  dataEmissao: string;
  cliente: {
    id: number;
    razaoSocial: string;
    cnpj: string;
    inscricaoEstadual?: string;
  };
  itens: NotaFiscalItem[];
  status: 'emitida' | 'cancelada' | 'devolvida_parcial' | 'devolvida_total';
  chaveAcesso?: string;
  protocoloAutorizacao?: string;
}

export interface NotaFiscalItem {
  id: number;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  codigoProduto: string;
  ncm: string;
  cfop: string;
  quantidadeDevolvida?: number;
  valorDevolvido?: number;
}

// ===== FORM TYPES =====
export interface DevolucaoFormData {
  notaFiscalId: number;
  tipo: DevolucaoTipo;
  motivo: string;
  dataDevolucao: string;
  valorDevolvido: number;
  status: DevolucaoStatus;
  observacoes?: string;
  itens?: Omit<DevolucaoItem, 'id'>[];
  anexos?: File[];
}

export interface DevolucaoItemFormData {
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  codigoProduto?: string;
  ncm?: string;
  cfop?: string;
  motivoItem?: string;
}

// ===== FILTER AND SEARCH TYPES =====
export interface DevolucaoFilters {
  searchTerm: string;
  tipoFilter: DevolucaoTipo | 'all';
  statusFilter: DevolucaoStatus | 'all';
  dataInicio?: string;
  dataFim?: string;
  notaFiscalSerie?: string;
  valorMinimo?: number;
  valorMaximo?: number;
  clienteId?: number;
}

export interface DevolucaoSort {
  field: DevolucaoSortField;
  direction: 'asc' | 'desc';
}

export type DevolucaoSortField =
  | 'dataDevolucao'
  | 'valorDevolvido'
  | 'status'
  | 'notaFiscalNumero'
  | 'clienteRazaoSocial'
  | 'createdAt'
  | 'updatedAt';

// ===== STATE TYPES =====
export interface DevolucaesManagerState {
  // Data
  devolucoes: Devolucao[];
  notasFiscais: NotaFiscal[];
  selectedDevolucao: Devolucao | null;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  isProcessing: boolean;
  isLoadingNotasFiscais: boolean;
  
  // UI state
  showForm: boolean;
  showItemsDialog: boolean;
  showAnexosDialog: boolean;
  showProcessingDialog: boolean;
  expandedRows: Set<number>;
  selectedItems: number[];
  
  // Form state
  formData: DevolucaoFormData;
  editingDevolucao: Devolucao | null;
  
  // Filters and search
  filters: DevolucaoFilters;
  sort: DevolucaoSort;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  
  // Validation
  errors: Record<string, string>;
  validationErrors: string[];
  isDirty: boolean;
}

// ===== ANALYTICS TYPES =====
export interface DevolucaoAnalytics {
  totalDevolucoes: number;
  valorTotalDevolvido: number;
  devolucoesPendentes: number;
  devolucaesProcessadas: number;
  devolucoesCanceladas: number;
  ticketMedio: number;
  tempoMedioProcessamento: number; // em dias
  principaisMotivos: MotivoAnalytics[];
  devolucoesPorPeriodo: DevolucaoPeriodo[];
  devolucoesPorTipo: TipoAnalytics[];
  devolucoesPorStatus: StatusAnalytics[];
  clientesComMaisDevolucoes: ClienteDevolucaoAnalytics[];
  tendencias: {
    crescimentoMensal: number;
    projecaoMes: number;
    comparativoAnoAnterior: number;
  };
}

export interface MotivoAnalytics {
  motivo: string;
  quantidade: number;
  percentual: number;
  valorTotal: number;
  tendencia: 'up' | 'down' | 'stable';
}

export interface DevolucaoPeriodo {
  periodo: string; // YYYY-MM-DD
  quantidade: number;
  valorTotal: number;
  ticketMedio: number;
}

export interface TipoAnalytics {
  tipo: DevolucaoTipo;
  quantidade: number;
  percentual: number;
  valorTotal: number;
}

export interface StatusAnalytics {
  status: DevolucaoStatus;
  quantidade: number;
  percentual: number;
  tempoMedioProcessamento: number;
}

export interface ClienteDevolucaoAnalytics {
  clienteId: number;
  clienteRazaoSocial: string;
  clienteCnpj: string;
  quantidadeDevolucoes: number;
  valorTotalDevolvido: number;
  ticketMedio: number;
  ultimaDevolucao: string;
}

// ===== HOOK RETURN TYPES =====
export interface UseDevolucaosReturn {
  state: DevolucaesManagerState;
  devolucoes: {
    data: Devolucao[];
    filteredData: Devolucao[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
  };
  notasFiscais: {
    data: NotaFiscal[];
    isLoading: boolean;
    error: string | null;
    searchNotas: (query: string) => void;
  };
  analytics: {
    data: DevolucaoAnalytics | null;
    isLoading: boolean;
    error: string | null;
  };
  actions: {
    // CRUD operations
    createDevolucao: (data: DevolucaoFormData) => Promise<Devolucao>;
    updateDevolucao: (id: number, data: Partial<DevolucaoFormData>) => Promise<Devolucao>;
    deleteDevolucao: (id: number) => Promise<void>;
    bulkDelete: (ids: number[]) => Promise<void>;
    
    // Processing operations
    processDevolucao: (id: number, data: { observacoesProcessamento?: string }) => Promise<void>;
    approveDevolucao: (id: number) => Promise<void>;
    rejectDevolucao: (id: number, motivo: string) => Promise<void>;
    cancelDevolucao: (id: number, motivo: string) => Promise<void>;
    
    // Selection and UI
    selectDevolucao: (devolucao: Devolucao | null) => void;
    toggleItemSelection: (id: number) => void;
    selectAllItems: () => void;
    clearSelection: () => void;
    toggleRowExpansion: (id: number) => void;
    
    // Search and filters
    search: (query: string) => void;
    filterByTipo: (tipo: DevolucaoTipo | 'all') => void;
    filterByStatus: (status: DevolucaoStatus | 'all') => void;
    filterByDateRange: (inicio: string, fim: string) => void;
    filterByValorRange: (minimo: number, maximo: number) => void;
    clearFilters: () => void;
    
    // Sorting and pagination
    sortBy: (field: DevolucaoSortField, direction?: 'asc' | 'desc') => void;
    setPage: (page: number) => void;
    setItemsPerPage: (items: number) => void;
    
    // Forms and modals
    showCreateForm: () => void;
    showEditForm: (devolucao: Devolucao) => void;
    hideForm: () => void;
    showItemsDialog: (devolucao: Devolucao) => void;
    hideItemsDialog: () => void;
    showAnexosDialog: (devolucao: Devolucao) => void;
    hideAnexosDialog: () => void;
    showProcessingDialog: (devolucao: Devolucao) => void;
    hideProcessingDialog: () => void;
    
    // File operations
    uploadAnexos: (devolucaoId: number, files: File[]) => Promise<void>;
    deleteAnexo: (anexoId: number) => Promise<void>;
    downloadAnexo: (anexo: DevolucaoAnexo) => void;
    
    // Export operations
    exportDevolucoes: (format: 'xlsx' | 'csv' | 'pdf') => Promise<void>;
    exportAnalytics: (format: 'xlsx' | 'pdf') => Promise<void>;
    
    // Validation
    validateForm: (data: DevolucaoFormData) => boolean;
    clearErrors: () => void;
  };
  utils: {
    formatCurrency: (value: number) => string;
    formatDate: (date: string) => string;
    formatStatus: (status: DevolucaoStatus) => string;
    formatTipo: (tipo: DevolucaoTipo) => string;
    getStatusColor: (status: DevolucaoStatus) => string;
    getTipoIcon: (tipo: DevolucaoTipo) => React.ReactNode;
    calculateDaysToProcess: (dataDevolucao: string) => number;
    canProcess: (devolucao: Devolucao) => boolean;
    canEdit: (devolucao: Devolucao) => boolean;
    canDelete: (devolucao: Devolucao) => boolean;
    validateCurrency: (value: string) => boolean;
    calculateItemTotal: (quantidade: number, valorUnitario: number) => number;
  };
}

// ===== COMPONENT PROPS TYPES =====
export interface DevolucaesManagerContainerProps {
  userId?: number;
  readOnly?: boolean;
  showAnalytics?: boolean;
  showBulkActions?: boolean;
  defaultFilters?: Partial<DevolucaoFilters>;
}

export interface DevolucaesManagerPresentationProps {
  state: DevolucaesManagerState;
  devolucoes: UseDevolucaosReturn['devolucoes'];
  notasFiscais: UseDevolucaosReturn['notasFiscais'];
  analytics: UseDevolucaosReturn['analytics'];
  actions: UseDevolucaosReturn['actions'];
  utils: UseDevolucaosReturn['utils'];
  readOnly?: boolean;
  showAnalytics?: boolean;
  showBulkActions?: boolean;
}

export interface DevolucaoListProps {
  devolucoes: Devolucao[];
  isLoading: boolean;
  selectedDevolucao: Devolucao | null;
  selectedItems: number[];
  expandedRows: Set<number>;
  sort: DevolucaoSort;
  onDevolucaoSelect: (devolucao: Devolucao) => void;
  onDevolucaoEdit: (devolucao: Devolucao) => void;
  onDevolucaoDelete: (id: number) => void;
  onDevolucaoProcess: (devolucao: Devolucao) => void;
  onItemToggle: (id: number) => void;
  onRowToggle: (id: number) => void;
  onSort: (field: DevolucaoSortField, direction?: 'asc' | 'desc') => void;
  readOnly?: boolean;
  utils: UseDevolucaosReturn['utils'];
}

export interface DevolucaoFormProps {
  devolucao?: Devolucao;
  notasFiscais: NotaFiscal[];
  onSave: (data: DevolucaoFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  isSaving: boolean;
  errors: Record<string, string>;
  validationErrors: string[];
  utils: UseDevolucaosReturn['utils'];
}

export interface DevolucaoFiltersProps {
  filters: DevolucaoFilters;
  onSearchChange: (query: string) => void;
  onTipoFilter: (tipo: DevolucaoTipo | 'all') => void;
  onStatusFilter: (status: DevolucaoStatus | 'all') => void;
  onDateRangeFilter: (inicio: string, fim: string) => void;
  onValorRangeFilter: (minimo: number, maximo: number) => void;
  onClearFilters: () => void;
}

export interface DevolucaoStatsProps {
  analytics: DevolucaoAnalytics;
  isLoading: boolean;
  utils: UseDevolucaosReturn['utils'];
}

export interface DevolucaoItemsDialogProps {
  devolucao: Devolucao;
  isOpen: boolean;
  onClose: () => void;
  readOnly?: boolean;
  utils: UseDevolucaosReturn['utils'];
}

export interface DevolucaoAnexosDialogProps {
  devolucao: Devolucao;
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => Promise<void>;
  onDelete: (anexoId: number) => Promise<void>;
  onDownload: (anexo: DevolucaoAnexo) => void;
  isUploading: boolean;
  readOnly?: boolean;
}

export interface DevolucaoProcessingDialogProps {
  devolucao: Devolucao;
  isOpen: boolean;
  onClose: () => void;
  onProcess: (data: { observacoesProcessamento?: string }) => Promise<void>;
  onApprove: () => Promise<void>;
  onReject: (motivo: string) => Promise<void>;
  isProcessing: boolean;
}

// ===== CONSTANTS =====
export const DEVOLUCAO_TIPOS: Record<DevolucaoTipo, string> = {
  produto: 'Produto',
  valor: 'Valor',
  total: 'Total'
};

export const DEVOLUCAO_STATUS: Record<DevolucaoStatus, string> = {
  pendente: 'Pendente',
  em_analise: 'Em Análise',
  aprovada: 'Aprovada',
  processada: 'Processada',
  cancelada: 'Cancelada',
  rejeitada: 'Rejeitada'
};

export const DEVOLUCAO_STATUS_COLORS: Record<DevolucaoStatus, string> = {
  pendente: 'text-yellow-600 bg-yellow-100',
  em_analise: 'text-blue-600 bg-blue-100',
  aprovada: 'text-green-600 bg-green-100',
  processada: 'text-green-700 bg-green-200',
  cancelada: 'text-gray-600 bg-gray-100',
  rejeitada: 'text-red-600 bg-red-100'
};

export const DEVOLUCAO_MOTIVOS_COMUNS = [
  'Produto defeituoso',
  'Produto danificado no transporte',
  'Produto diferente do pedido',
  'Desistência da compra',
  'Erro na emissão da nota fiscal',
  'Problema de qualidade',
  'Vencimento do produto',
  'Excesso de estoque',
  'Recall do produto',
  'Outro motivo'
];

export const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

// ===== VALIDATION =====
export const validateDevolucaoForm = (data: DevolucaoFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.notaFiscalId) {
    errors.notaFiscalId = 'Nota fiscal é obrigatória';
  }

  if (!data.motivo.trim()) {
    errors.motivo = 'Motivo é obrigatório';
  }

  if (!data.dataDevolucao) {
    errors.dataDevolucao = 'Data da devolução é obrigatória';
  }

  if (data.valorDevolvido <= 0) {
    errors.valorDevolvido = 'Valor deve ser maior que zero';
  }

  if (data.tipo === 'produto' && (!data.itens || data.itens.length === 0)) {
    errors.itens = 'Pelo menos um item deve ser informado para devolução de produto';
  }

  return errors;
};

export const validateDevolucaoItem = (item: DevolucaoItemFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!item.descricao.trim()) {
    errors.descricao = 'Descrição é obrigatória';
  }

  if (item.quantidade <= 0) {
    errors.quantidade = 'Quantidade deve ser maior que zero';
  }

  if (item.valorUnitario <= 0) {
    errors.valorUnitario = 'Valor unitário deve ser maior que zero';
  }

  return errors;
};