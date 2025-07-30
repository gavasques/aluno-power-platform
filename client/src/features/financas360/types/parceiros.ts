/**
 * TYPES: Parceiros - Sistema de Parceiros
 * Tipos centralizados para gerenciamento de parceiros de negócios
 * Extraído de ParceirosManager.tsx (753 linhas) para modularização
 * Data: Janeiro 30, 2025
 */

// ===== CORE TYPES =====
export interface Parceiro {
  id: number;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  categoria: ParceiroCategoria;
  tipo: ParceiroTipo;
  status: ParceiroStatus;
  endereco: EnderecoCompleto;
  contatos: ContatoParceiro[];
  documentos: DocumentoParceiro[];
  contratos: ContratoParceiro[];
  movimentacoes: MovimentacaoFinanceira[];
  dadosBancarios?: DadosBancarios;
  observacoes?: string;
  dataVencimento?: string;
  limitePagamento?: number;
  percentualComissao?: number;
  avaliacaoMedia: number;
  totalAvaliacoes: number;
  isVerificado: boolean;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export type ParceiroCategoria = 
  | 'fornecedor'
  | 'cliente'
  | 'transportadora'
  | 'prestador_servicos'
  | 'consultor'
  | 'contador'
  | 'advogado'
  | 'banco'
  | 'outro';

export type ParceiroTipo = 
  | 'pessoa_fisica'
  | 'pessoa_juridica'
  | 'mei'
  | 'cooperativa'
  | 'associacao';

export type ParceiroStatus = 
  | 'ativo'
  | 'inativo'
  | 'bloqueado'
  | 'em_analise'
  | 'suspenso';

export interface EnderecoCompleto {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  pais: string;
  referencia?: string;
}

export interface ContatoParceiro {
  id: number;
  nome: string;
  cargo?: string;
  email: string;
  telefone?: string;
  celular?: string;
  whatsapp?: string;
  isMain: boolean;
  departamento?: string;
  observacoes?: string;
}

export interface DocumentoParceiro {
  id: number;
  tipo: DocumentoTipo;
  numero: string;
  nome: string;
  url: string;
  dataEmissao?: string;
  dataVencimento?: string;
  status: DocumentoStatus;
  observacoes?: string;
  tamanhoBytes: number;
  uploadedBy: number;
  createdAt: string;
}

export type DocumentoTipo = 
  | 'rg'
  | 'cpf'
  | 'cnpj'
  | 'contrato_social'
  | 'procuracao'
  | 'alvara'
  | 'licenca'
  | 'certidao_negativa'
  | 'comprovante_endereco'
  | 'certidao_regularidade'
  | 'outro';

export type DocumentoStatus = 
  | 'pendente'
  | 'aprovado'
  | 'rejeitado'
  | 'vencido'
  | 'em_analise';

export interface ContratoParceiro {
  id: number;
  numero: string;
  tipo: ContratoTipo;
  status: ContratoStatus;
  objeto: string;
  valor: number;
  moeda: string;
  dataInicio: string;
  dataFim?: string;
  dataVencimento?: string;
  condicoesPagamento: string;
  observacoes?: string;
  documentoUrl?: string;
  renovacaoAutomatica: boolean;
  prazoNotificacao: number; // dias antes do vencimento
}

export type ContratoTipo = 
  | 'fornecimento'
  | 'prestacao_servicos'
  | 'consultoria'
  | 'representacao'
  | 'distribuicao'
  | 'parceria'
  | 'outro';

export type ContratoStatus = 
  | 'ativo'
  | 'vencido'
  | 'cancelado'
  | 'suspenso'
  | 'em_negociacao'
  | 'aguardando_assinatura';

export interface MovimentacaoFinanceira {
  id: number;
  tipo: MovimentacaoTipo;
  descricao: string;
  valor: number;
  moeda: string;
  dataMovimentacao: string;
  dataVencimento?: string;
  status: MovimentacaoStatus;
  categoria: string;
  formaPagamento?: string;
  numeroDocumento?: string;
  observacoes?: string;
  contratoId?: number;
  notaFiscalId?: number;
}

export type MovimentacaoTipo = 
  | 'receita'
  | 'despesa'
  | 'comissao'
  | 'multa'
  | 'desconto'
  | 'reembolso';

export type MovimentacaoStatus = 
  | 'pendente'
  | 'pago'
  | 'vencido'
  | 'cancelado'
  | 'parcial';

export interface DadosBancarios {
  banco: string;
  agencia: string;
  conta: string;
  digito: string;
  tipoConta: 'corrente' | 'poupanca' | 'salario';
  titular: string;
  cpfCnpjTitular: string;
  chavesPix?: ChavePix[];
}

export interface ChavePix {
  tipo: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
  chave: string;
  principal: boolean;
}

// ===== FORM TYPES =====
export interface ParceiroFormData {
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  categoria: ParceiroCategoria;
  tipo: ParceiroTipo;
  status: ParceiroStatus;
  endereco: EnderecoCompleto;
  observacoes?: string;
  dataVencimento?: string;
  limitePagamento?: number;
  percentualComissao?: number;
  dadosBancarios?: DadosBancarios;
}

export interface ContatoFormData {
  nome: string;
  cargo?: string;
  email: string;
  telefone?: string;
  celular?: string;
  whatsapp?: string;
  isMain: boolean;
  departamento?: string;
  observacoes?: string;
}

export interface ContratoFormData {
  numero: string;
  tipo: ContratoTipo;
  status: ContratoStatus;
  objeto: string;
  valor: number;
  moeda: string;
  dataInicio: string;
  dataFim?: string;
  dataVencimento?: string;
  condicoesPagamento: string;
  observacoes?: string;
  renovacaoAutomatica: boolean;
  prazoNotificacao: number;
}

export interface MovimentacaoFormData {
  tipo: MovimentacaoTipo;
  descricao: string;
  valor: number;
  moeda: string;
  dataMovimentacao: string;
  dataVencimento?: string;
  status: MovimentacaoStatus;
  categoria: string;
  formaPagamento?: string;
  numeroDocumento?: string;
  observacoes?: string;
  contratoId?: number;
}

// ===== STATE TYPES =====
export interface ParceirosManagerState {
  parceiros: Parceiro[];
  selectedParceiro: Parceiro | null;
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  searchQuery: string;
  categoriaFilter: ParceiroCategoria | 'all';
  statusFilter: ParceiroStatus | 'all';
  tipoFilter: ParceiroTipo | 'all';
  sortBy: ParceirosSort;
  sortOrder: 'asc' | 'desc';
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  selectedItems: number[];
  showForm: boolean;
  showContatoForm: boolean;
  showContratoForm: boolean;
  showMovimentacaoForm: boolean;
  showDocumentUpload: boolean;
  activeTab: ParceiroTab;
  errors: Record<string, string>;
  validationErrors: ValidationError[];
  isDirty: boolean;
}

export type ParceirosSort = 
  | 'razaoSocial'
  | 'nomeFantasia'
  | 'categoria'
  | 'status'
  | 'createdAt'
  | 'updatedAt'
  | 'avaliacaoMedia';

export type ParceiroTab = 
  | 'dados_basicos'
  | 'contatos'
  | 'documentos'
  | 'contratos'
  | 'movimentacoes'
  | 'historico';

export interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'invalid' | 'duplicate' | 'format';
}

// ===== HOOK RETURN TYPES =====
export interface UseParceirosReturn {
  state: ParceirosManagerState;
  parceiros: {
    data: Parceiro[];
    filteredData: Parceiro[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
  };
  actions: {
    // CRUD operations
    createParceiro: (data: ParceiroFormData) => Promise<Parceiro>;
    updateParceiro: (id: number, data: Partial<ParceiroFormData>) => Promise<Parceiro>;
    deleteParceiro: (id: number) => Promise<void>;
    bulkDelete: (ids: number[]) => Promise<void>;
    
    // Selection and UI
    selectParceiro: (parceiro: Parceiro | null) => void;
    toggleItemSelection: (id: number) => void;
    selectAllItems: () => void;
    clearSelection: () => void;
    
    // Search and filters
    search: (query: string) => void;
    filterByCategoria: (categoria: ParceiroCategoria | 'all') => void;
    filterByStatus: (status: ParceiroStatus | 'all') => void;
    filterByTipo: (tipo: ParceiroTipo | 'all') => void;
    sortBy: (field: ParceirosSort, order?: 'asc' | 'desc') => void;
    
    // Pagination
    setPage: (page: number) => void;
    setItemsPerPage: (items: number) => void;
    
    // Forms and modals
    showCreateForm: () => void;
    showEditForm: (parceiro: Parceiro) => void;
    hideForm: () => void;
    showContatoForm: () => void;
    hideContatoForm: () => void;
    showContratoForm: () => void;
    hideContratoForm: () => void;
    showMovimentacaoForm: () => void;
    hideMovimentacaoForm: () => void;
    showDocumentUpload: () => void;
    hideDocumentUpload: () => void;
    
    // Tabs
    setActiveTab: (tab: ParceiroTab) => void;
    
    // Validation
    validate: () => boolean;
    clearErrors: () => void;
  };
  contatos: {
    data: ContatoParceiro[];
    create: (data: ContatoFormData) => Promise<ContatoParceiro>;
    update: (id: number, data: Partial<ContatoFormData>) => Promise<ContatoParceiro>;
    delete: (id: number) => Promise<void>;
  };
  contratos: {
    data: ContratoParceiro[];
    create: (data: ContratoFormData) => Promise<ContratoParceiro>;
    update: (id: number, data: Partial<ContratoFormData>) => Promise<ContratoParceiro>;
    delete: (id: number) => Promise<void>;
    getVencidos: () => ContratoParceiro[];
    getProximosVencimento: (dias: number) => ContratoParceiro[];
  };
  movimentacoes: {
    data: MovimentacaoFinanceira[];
    create: (data: MovimentacaoFormData) => Promise<MovimentacaoFinanceira>;
    update: (id: number, data: Partial<MovimentacaoFormData>) => Promise<MovimentacaoFinanceira>;
    delete: (id: number) => Promise<void>;
    getTotals: () => MovimentacaoTotals;
    getByPeriodo: (inicio: string, fim: string) => MovimentacaoFinanceira[];
  };
  documentos: {
    data: DocumentoParceiro[];
    upload: (files: File[], tipo: DocumentoTipo) => Promise<DocumentoParceiro[]>;
    delete: (id: number) => Promise<void>;
    getVencidos: () => DocumentoParceiro[];
    getProximosVencimento: (dias: number) => DocumentoParceiro[];
  };
}

export interface MovimentacaoTotals {
  receitas: number;
  despesas: number;
  saldo: number;
  comissoes: number;
  pendentes: number;
  vencidas: number;
}

// ===== COMPONENT PROPS TYPES =====
export interface ParceirosManagerContainerProps {
  readOnly?: boolean;
  showBulkActions?: boolean;
  showFinancialInfo?: boolean;
  defaultFilter?: {
    categoria?: ParceiroCategoria;
    status?: ParceiroStatus;
    tipo?: ParceiroTipo;
  };
}

export interface ParceirosManagerPresentationProps {
  state: ParceirosManagerState;
  parceiros: UseParceirosReturn['parceiros'];
  actions: UseParceirosReturn['actions'];
  contatos: UseParceirosReturn['contatos'];
  contratos: UseParceirosReturn['contratos'];
  movimentacoes: UseParceirosReturn['movimentacoes'];
  documentos: UseParceirosReturn['documentos'];
  readOnly?: boolean;
  showBulkActions?: boolean;
  showFinancialInfo?: boolean;
}

export interface ParceiroListProps {
  parceiros: Parceiro[];
  isLoading: boolean;
  selectedParceiro: Parceiro | null;
  selectedItems: number[];
  onParceiroSelect: (parceiro: Parceiro) => void;
  onParceiroEdit: (parceiro: Parceiro) => void;
  onParceiroDelete: (id: number) => void;
  onItemToggle: (id: number) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  sortBy: ParceirosSort;
  sortOrder: 'asc' | 'desc';
  onSort: (field: ParceirosSort) => void;
  readOnly?: boolean;
}

export interface ParceiroFormProps {
  parceiro?: Parceiro;
  onSave: (data: ParceiroFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  errors: Record<string, string>;
  validationErrors: ValidationError[];
}

export interface ParceiroDetailTabsProps {
  parceiro: Parceiro;
  activeTab: ParceiroTab;
  onTabChange: (tab: ParceiroTab) => void;
  contatos: UseParceirosReturn['contatos'];
  contratos: UseParceirosReturn['contratos'];
  movimentacoes: UseParceirosReturn['movimentacoes'];
  documentos: UseParceirosReturn['documentos'];
  readOnly?: boolean;
}

export interface FilterBarProps {
  searchQuery: string;
  categoriaFilter: ParceiroCategoria | 'all';
  statusFilter: ParceiroStatus | 'all';
  tipoFilter: ParceiroTipo | 'all';
  onSearchChange: (query: string) => void;
  onCategoriaFilter: (categoria: ParceiroCategoria | 'all') => void;
  onStatusFilter: (status: ParceiroStatus | 'all') => void;
  onTipoFilter: (tipo: ParceiroTipo | 'all') => void;
  onClearFilters: () => void;
}

export interface StatsCardsProps {
  totals: {
    total: number;
    ativos: number;
    inativos: number;
    bloqueados: number;
    clientes: number;
    fornecedores: number;
    transportadoras: number;
    outros: number;
  };
  financeiro: MovimentacaoTotals;
  isLoading: boolean;
  showFinancialInfo?: boolean;
}

// ===== VALIDATION TYPES =====
export interface ParceiroValidationRules {
  razaoSocial: {
    required: true;
    minLength: number;
    maxLength: number;
  };
  cnpj: {
    required: true;
    pattern: RegExp;
    unique: true;
  };
  email: {
    pattern: RegExp;
    unique: true;
  };
  categoria: {
    required: true;
    allowedValues: ParceiroCategoria[];
  };
  endereco: {
    cep: {
      pattern: RegExp;
    };
  };
}

// ===== API TYPES =====
export interface CreateParceiroRequest {
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  categoria: ParceiroCategoria;
  tipo: ParceiroTipo;
  status?: ParceiroStatus;
  endereco: EnderecoCompleto;
  observacoes?: string;
  dataVencimento?: string;
  limitePagamento?: number;
  percentualComissao?: number;
  dadosBancarios?: DadosBancarios;
}

export interface UpdateParceiroRequest extends Partial<CreateParceiroRequest> {
  id: number;
}

export interface SearchParceirosRequest {
  query?: string;
  categoria?: ParceiroCategoria;
  status?: ParceiroStatus;
  tipo?: ParceiroTipo;
  page?: number;
  limit?: number;
  sortBy?: ParceirosSort;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParceirosResponse {
  parceiros: Parceiro[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===== CONSTANTS =====
export const PARCEIRO_CATEGORIAS = [
  { value: 'fornecedor', label: 'Fornecedor', color: 'blue' },
  { value: 'cliente', label: 'Cliente', color: 'green' },
  { value: 'transportadora', label: 'Transportadora', color: 'purple' },
  { value: 'prestador_servicos', label: 'Prestador de Serviços', color: 'orange' },
  { value: 'consultor', label: 'Consultor', color: 'teal' },
  { value: 'contador', label: 'Contador', color: 'indigo' },
  { value: 'advogado', label: 'Advogado', color: 'red' },
  { value: 'banco', label: 'Banco', color: 'gray' },
  { value: 'outro', label: 'Outro', color: 'slate' }
] as const;

export const PARCEIRO_STATUS_OPTIONS = [
  { value: 'ativo', label: 'Ativo', color: 'green' },
  { value: 'inativo', label: 'Inativo', color: 'gray' },
  { value: 'bloqueado', label: 'Bloqueado', color: 'red' },
  { value: 'em_analise', label: 'Em Análise', color: 'yellow' },
  { value: 'suspenso', label: 'Suspenso', color: 'orange' }
] as const;

export const PARCEIRO_TIPOS = [
  { value: 'pessoa_fisica', label: 'Pessoa Física' },
  { value: 'pessoa_juridica', label: 'Pessoa Jurídica' },
  { value: 'mei', label: 'MEI' },
  { value: 'cooperativa', label: 'Cooperativa' },
  { value: 'associacao', label: 'Associação' }
] as const;

export const DOCUMENTO_TIPOS = [
  { value: 'rg', label: 'RG' },
  { value: 'cpf', label: 'CPF' },
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'contrato_social', label: 'Contrato Social' },
  { value: 'procuracao', label: 'Procuração' },
  { value: 'alvara', label: 'Alvará' },
  { value: 'licenca', label: 'Licença' },
  { value: 'certidao_negativa', label: 'Certidão Negativa' },
  { value: 'comprovante_endereco', label: 'Comprovante de Endereço' },
  { value: 'certidao_regularidade', label: 'Certidão de Regularidade' },
  { value: 'outro', label: 'Outro' }
] as const;

export const CONTRATO_TIPOS = [
  { value: 'fornecimento', label: 'Fornecimento' },
  { value: 'prestacao_servicos', label: 'Prestação de Serviços' },
  { value: 'consultoria', label: 'Consultoria' },
  { value: 'representacao', label: 'Representação' },
  { value: 'distribuicao', label: 'Distribuição' },
  { value: 'parceria', label: 'Parceria' },
  { value: 'outro', label: 'Outro' }
] as const;

export const MOVIMENTACAO_TIPOS = [
  { value: 'receita', label: 'Receita', color: 'green' },
  { value: 'despesa', label: 'Despesa', color: 'red' },
  { value: 'comissao', label: 'Comissão', color: 'blue' },
  { value: 'multa', label: 'Multa', color: 'orange' },
  { value: 'desconto', label: 'Desconto', color: 'purple' },
  { value: 'reembolso', label: 'Reembolso', color: 'teal' }
] as const;

export const DEFAULT_VALIDATION_RULES: ParceiroValidationRules = {
  razaoSocial: {
    required: true,
    minLength: 3,
    maxLength: 200
  },
  cnpj: {
    required: true,
    pattern: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    unique: true
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    unique: true
  },
  categoria: {
    required: true,
    allowedValues: ['fornecedor', 'cliente', 'transportadora', 'prestador_servicos', 'consultor', 'contador', 'advogado', 'banco', 'outro']
  },
  endereco: {
    cep: {
      pattern: /^\d{5}-?\d{3}$/
    }
  }
};

// ===== EXPORT AGGREGATED TYPES =====
export type {
  Parceiro as ParceiroData,
  ParceiroFormData as ParceiroForm,
  ContatoParceiro as Contato,
  ContratoParceiro as Contrato,
  MovimentacaoFinanceira as Movimentacao,
  DocumentoParceiro as Documento
};