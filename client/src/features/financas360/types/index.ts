/**
 * TYPES: Finanças360 - Sistema de Notas Fiscais
 * Tipos centralizados para gerenciamento de notas fiscais
 * Extraído de NotasFiscaisManager.tsx (810 linhas) para modularização
 * Data: Janeiro 29, 2025
 */

// ===== CORE TYPES =====
export interface NotaFiscal {
  id: number;
  numero: string;
  serie: string;
  chaveAcesso: string;
  dataEmissao: string;
  dataVencimento?: string;
  fornecedorId: number;
  fornecedor?: Fornecedor;
  clienteId?: number;
  cliente?: Cliente;
  tipo: 'entrada' | 'saida';
  status: 'pendente' | 'aprovada' | 'rejeitada' | 'cancelada';
  valorTotal: number;
  valorImpostos: number;
  valorLiquido: number;
  observacoes?: string;
  anexos?: string[];
  itens: ItemNotaFiscal[];
  impostos: ImpostoNotaFiscal[];
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface ItemNotaFiscal {
  id: number;
  notaFiscalId: number;
  produtoId?: number;
  produto?: Produto;
  descricao: string;
  codigo?: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  valorTotal: number;
  aliquotaICMS?: number;
  valorICMS?: number;
  aliquotaIPI?: number;
  valorIPI?: number;
  ncm?: string;
  cfop: string;
}

export interface ImpostoNotaFiscal {
  id: number;
  notaFiscalId: number;
  tipo: 'ICMS' | 'IPI' | 'PIS' | 'COFINS' | 'ISS' | 'IRRF' | 'CSLL';
  baseCalculo: number;
  aliquota: number;
  valor: number;
  observacoes?: string;
}

export interface Fornecedor {
  id: number;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  ie?: string;
  email?: string;
  telefone?: string;
  endereco?: Endereco;
}

export interface Cliente {
  id: number;
  razaoSocial: string;
  nomeFantasia?: string;
  documento: string; // CPF ou CNPJ
  email?: string;
  telefone?: string;
  endereco?: Endereco;
}

export interface Produto {
  id: number;
  nome: string;
  codigo: string;
  descricao?: string;
  unidade: string;
  ncm?: string;
  valor?: number;
}

export interface Endereco {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}

// ===== FORM TYPES =====
export interface NotaFiscalFormData {
  numero: string;
  serie: string;
  chaveAcesso?: string;
  dataEmissao: string;
  dataVencimento?: string;
  fornecedorId: number;
  clienteId?: number;
  tipo: 'entrada' | 'saida';
  observacoes?: string;
  itens: ItemNotaFiscalFormData[];
  impostos?: ImpostoNotaFiscalFormData[];
}

export interface ItemNotaFiscalFormData {
  produtoId?: number;
  descricao: string;
  codigo?: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  aliquotaICMS?: number;
  aliquotaIPI?: number;
  ncm?: string;
  cfop: string;
}

export interface ImpostoNotaFiscalFormData {
  tipo: ImpostoNotaFiscal['tipo'];
  baseCalculo: number;
  aliquota: number;
  observacoes?: string;
}

// ===== STATE TYPES =====
export interface NotasFiscaisState {
  notas: NotaFiscal[];
  selectedNota: NotaFiscal | null;
  isLoading: boolean;
  isSaving: boolean;
  isImporting: boolean;
  searchQuery: string;
  statusFilter: NotaFiscal['status'] | 'all';
  tipoFilter: NotaFiscal['tipo'] | 'all';
  fornecedorFilter: number | null;
  dateRange: { start?: Date; end?: Date };
  sortBy: 'dataEmissao' | 'numero' | 'valorTotal' | 'fornecedor';
  sortOrder: 'asc' | 'desc';
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  showForm: boolean;
  showImportDialog: boolean;
  selectedItems: number[];
}

// ===== HOOK RETURN TYPES =====
export interface UseNotasFiscaisReturn {
  state: NotasFiscaisState;
  notas: {
    data: NotaFiscal[];
    filteredData: NotaFiscal[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
  };
  fornecedores: {
    data: Fornecedor[];
    isLoading: boolean;
    error: string | null;
  };
  produtos: {
    data: Produto[];
    isLoading: boolean;
    error: string | null;
  };
  actions: {
    // CRUD operations
    createNota: (data: NotaFiscalFormData) => Promise<NotaFiscal>;
    updateNota: (id: number, data: Partial<NotaFiscalFormData>) => Promise<NotaFiscal>;
    deleteNota: (id: number) => Promise<void>;
    duplicateNota: (id: number) => Promise<NotaFiscal>;
    
    // Status operations
    approveNota: (id: number) => Promise<void>;
    rejectNota: (id: number, reason: string) => Promise<void>;
    cancelNota: (id: number, reason: string) => Promise<void>;
    
    // Import operations
    importXML: (file: File) => Promise<NotaFiscal>;
    importCSV: (file: File) => Promise<NotaFiscal[]>;
    
    // Export operations
    exportPDF: (id: number) => Promise<void>;
    exportExcel: (ids: number[]) => Promise<void>;
    
    // Filters and search
    search: (query: string) => void;
    filterByStatus: (status: NotaFiscal['status'] | 'all') => void;
    filterByTipo: (tipo: NotaFiscal['tipo'] | 'all') => void;
    filterByFornecedor: (fornecedorId: number | null) => void;
    filterByDateRange: (range: { start?: Date; end?: Date }) => void;
    sortNotas: (field: NotasFiscaisState['sortBy'], order: NotasFiscaisState['sortOrder']) => void;
    
    // Selection and UI
    selectNota: (nota: NotaFiscal | null) => void;
    toggleItemSelection: (id: number) => void;
    selectAllItems: () => void;
    clearSelection: () => void;
    
    // Form management
    showCreateForm: () => void;
    showEditForm: (nota: NotaFiscal) => void;
    hideForm: () => void;
    showImportDialog: () => void;
    hideImportDialog: () => void;
    
    // Pagination
    goToPage: (page: number) => void;
    setItemsPerPage: (items: number) => void;
    
    // Bulk operations
    bulkDelete: (ids: number[]) => Promise<void>;
    bulkApprove: (ids: number[]) => Promise<void>;
    bulkExport: (ids: number[]) => Promise<void>;
  };
  calculations: {
    totalValue: number;
    totalTaxes: number;
    totalNet: number;
    averageValue: number;
    monthlyTrend: Array<{ month: string; value: number }>;
    statusDistribution: Array<{ status: string; count: number; percentage: number }>;
    topFornecedores: Array<{ fornecedor: string; count: number; value: number }>;
  };
}

export interface UseNotaFiscalFormReturn {
  formData: NotaFiscalFormData;
  errors: Record<string, string>;
  isValid: boolean;
  isDirty: boolean;
  updateField: (field: keyof NotaFiscalFormData, value: any) => void;
  updateItem: (index: number, field: keyof ItemNotaFiscalFormData, value: any) => void;
  addItem: (item?: Partial<ItemNotaFiscalFormData>) => void;
  removeItem: (index: number) => void;
  updateImposto: (index: number, field: keyof ImpostoNotaFiscalFormData, value: any) => void;
  addImposto: (imposto?: Partial<ImpostoNotaFiscalFormData>) => void;
  removeImposto: (index: number) => void;
  calculateTotals: () => void;
  validate: () => boolean;
  reset: () => void;
  loadNota: (nota: NotaFiscal) => void;
}

// ===== COMPONENT PROPS TYPES =====
export interface NotasFiscaisManagerContainerProps {
  initialFilter?: {
    status?: NotaFiscal['status'];
    tipo?: NotaFiscal['tipo'];
    fornecedorId?: number;
  };
  readOnly?: boolean;
  showImportExport?: boolean;
  allowBulkOperations?: boolean;
  onNotaSelect?: (nota: NotaFiscal) => void;
}

export interface NotasFiscaisManagerPresentationProps {
  state: NotasFiscaisState;
  notas: UseNotasFiscaisReturn['notas'];
  fornecedores: UseNotasFiscaisReturn['fornecedores'];
  produtos: UseNotasFiscaisReturn['produtos'];
  actions: UseNotasFiscaisReturn['actions'];
  calculations: UseNotasFiscaisReturn['calculations'];
  readOnly?: boolean;
  showImportExport?: boolean;
  allowBulkOperations?: boolean;
}

export interface NotasListProps {
  notas: NotaFiscal[];
  isLoading: boolean;
  selectedNota: NotaFiscal | null;
  selectedItems: number[];
  onNotaSelect: (nota: NotaFiscal) => void;
  onNotaEdit: (nota: NotaFiscal) => void;
  onNotaDelete: (id: number) => void;
  onItemToggle: (id: number) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  readOnly?: boolean;
}

export interface NotaFiscalFormProps {
  nota?: NotaFiscal;
  fornecedores: Fornecedor[];
  produtos: Produto[];
  onSave: (data: NotaFiscalFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface ImportDialogProps {
  isOpen: boolean;
  onImportXML: (file: File) => Promise<void>;
  onImportCSV: (file: File) => Promise<void>;
  onClose: () => void;
  isImporting?: boolean;
}

export interface FilterBarProps {
  statusFilter: NotasFiscaisState['statusFilter'];
  tipoFilter: NotasFiscaisState['tipoFilter'];
  fornecedorFilter: number | null;
  dateRange: { start?: Date; end?: Date };
  fornecedores: Fornecedor[];
  onStatusFilter: (status: NotaFiscal['status'] | 'all') => void;
  onTipoFilter: (tipo: NotaFiscal['tipo'] | 'all') => void;
  onFornecedorFilter: (fornecedorId: number | null) => void;
  onDateRangeFilter: (range: { start?: Date; end?: Date }) => void;
  onClearFilters: () => void;
}

export interface StatsCardsProps {
  calculations: UseNotasFiscaisReturn['calculations'];
  isLoading: boolean;
}

// ===== UTILITY TYPES =====
export interface NotaFiscalMetrics {
  totalNotas: number;
  totalValue: number;
  totalTaxes: number;
  avgValue: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  canceledCount: number;
  entradaCount: number;
  saidaCount: number;
  monthlyGrowth: number;
  taxEfficiency: number;
}

export interface ImportResult {
  success: boolean;
  notasImported: number;
  errors: ImportError[];
  warnings: ImportWarning[];
}

export interface ImportError {
  line?: number;
  field?: string;
  message: string;
  data?: any;
}

export interface ImportWarning {
  line?: number;
  message: string;
  suggestion?: string;
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeItems: boolean;
  includeImpostos: boolean;
  dateRange?: { start: Date; end: Date };
  filters?: {
    status?: NotaFiscal['status'][];
    tipo?: NotaFiscal['tipo'][];
    fornecedorIds?: number[];
  };
}

// ===== VALIDATION TYPES =====
export interface NotaFiscalValidationRules {
  numero: {
    required: true;
    minLength: 1;
    maxLength: 20;
    pattern?: RegExp;
  };
  serie: {
    required: true;
    minLength: 1;
    maxLength: 3;
  };
  chaveAcesso: {
    required: false;
    length: 44;
    pattern: RegExp;
  };
  dataEmissao: {
    required: true;
    maxDate?: Date;
  };
  fornecedorId: {
    required: true;
  };
  itens: {
    minItems: 1;
    maxItems: 990;
  };
}

export interface ItemValidationRules {
  descricao: {
    required: true;
    minLength: 3;
    maxLength: 200;
  };
  quantidade: {
    required: true;
    min: 0.001;
    max: 999999.999;
  };
  valorUnitario: {
    required: true;
    min: 0.01;
  };
  cfop: {
    required: true;
    length: 4;
    pattern: RegExp;
  };
}

// ===== API TYPES =====
export interface CreateNotaFiscalRequest {
  numero: string;
  serie: string;
  chaveAcesso?: string;
  dataEmissao: string;
  dataVencimento?: string;
  fornecedorId: number;
  clienteId?: number;
  tipo: 'entrada' | 'saida';
  observacoes?: string;
  itens: CreateItemRequest[];
  impostos?: CreateImpostoRequest[];
}

export interface CreateItemRequest {
  produtoId?: number;
  descricao: string;
  codigo?: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  aliquotaICMS?: number;
  aliquotaIPI?: number;
  ncm?: string;
  cfop: string;
}

export interface CreateImpostoRequest {
  tipo: ImpostoNotaFiscal['tipo'];
  baseCalculo: number;
  aliquota: number;
  observacoes?: string;
}

export interface SearchNotasRequest {
  query?: string;
  status?: NotaFiscal['status'];
  tipo?: NotaFiscal['tipo'];
  fornecedorId?: number;
  dateRange?: { start: string; end: string };
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchNotasResponse {
  notas: NotaFiscal[];
  total: number;
  page: number;
  limit: number;
  totalValue: number;
  totalTaxes: number;
}

// ===== CONSTANTS =====
export const NOTA_FISCAL_STATUS = [
  { value: 'pendente', label: 'Pendente', color: 'yellow' },
  { value: 'aprovada', label: 'Aprovada', color: 'green' },
  { value: 'rejeitada', label: 'Rejeitada', color: 'red' },
  { value: 'cancelada', label: 'Cancelada', color: 'gray' }
] as const;

export const NOTA_FISCAL_TIPOS = [
  { value: 'entrada', label: 'Entrada', icon: 'ArrowDownCircle' },
  { value: 'saida', label: 'Saída', icon: 'ArrowUpCircle' }
] as const;

export const IMPOSTO_TIPOS = [
  { value: 'ICMS', label: 'ICMS' },
  { value: 'IPI', label: 'IPI' },
  { value: 'PIS', label: 'PIS' },
  { value: 'COFINS', label: 'COFINS' },
  { value: 'ISS', label: 'ISS' },
  { value: 'IRRF', label: 'IRRF' },
  { value: 'CSLL', label: 'CSLL' }
] as const;

export const UNIDADES = [
  'UN', 'PC', 'KG', 'G', 'L', 'ML', 'M', 'CM', 'M2', 'M3', 'CX', 'PCT', 'KIT'
] as const;

export const DEFAULT_ITEMS_PER_PAGE = 20;
export const MAX_ITEMS_PER_NOTA = 990;
export const CHAVE_ACESSO_LENGTH = 44;

// ===== ERROR TYPES =====
export type NotaFiscalErrorType = 
  | 'VALIDATION_ERROR'
  | 'DUPLICATE_NUMBER'
  | 'INVALID_XML'
  | 'INVALID_CHAVE_ACESSO'
  | 'FORNECEDOR_NOT_FOUND'
  | 'PRODUTO_NOT_FOUND'
  | 'CALCULATION_ERROR'
  | 'IMPORT_ERROR'
  | 'EXPORT_ERROR'
  | 'APPROVAL_ERROR'
  | 'NETWORK_ERROR';

export interface NotaFiscalError {
  type: NotaFiscalErrorType;
  message: string;
  field?: string;
  details?: any;
}

// ===== EXPORT AGGREGATED TYPES =====
export type {
  NotaFiscal as Nota,
  ItemNotaFiscal as Item,
  ImpostoNotaFiscal as Imposto,
  NotaFiscalFormData as NotaForm,
  ItemNotaFiscalFormData as ItemForm,
  ImpostoNotaFiscalFormData as ImpostoForm
};