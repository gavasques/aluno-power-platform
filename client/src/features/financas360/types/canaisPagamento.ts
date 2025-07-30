/**
 * TYPES: Canais Pagamento - Sistema de Gerenciamento de Canais de Pagamento
 * Tipos centralizados para canais de pagamento e processamento financeiro
 * Extraído de CanaisPagamentoManager.tsx (693 linhas) para modularização
 * Data: Janeiro 30, 2025
 */

// ===== CORE TYPES =====
export interface CanalPagamento {
  id: number;
  nome: string;
  tipo: CanalPagamentoTipo;
  descricao?: string;
  configuracao: CanalPagamentoConfiguracao;
  status: CanalPagamentoStatus;
  taxas: TaxaCanalPagamento;
  limitesTransacao: LimitesTransacao;
  processadora?: ProcessadoraPagamento;
  webhookUrl?: string;
  isAtivo: boolean;
  prioridade: number;
  dataIntegracao: string;
  ultimaTransacao?: string;
  proximaCobranca?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;
}

export type CanalPagamentoTipo = 
  | 'cartao_credito'
  | 'cartao_debito'
  | 'pix'
  | 'boleto'
  | 'transferencia_bancaria'
  | 'carteira_digital'
  | 'vale_alimentacao'
  | 'vale_refeicao'
  | 'credito_loja'
  | 'financiamento'
  | 'outros';

export type CanalPagamentoStatus = 
  | 'ativo'
  | 'inativo'
  | 'suspenso'
  | 'em_manutencao'
  | 'pendente_aprovacao'
  | 'erro_configuracao'
  | 'bloqueado';

export interface CanalPagamentoConfiguracao {
  // Configurações gerais
  moedaPadrao: string;
  permiteParcelas: boolean;
  maxParcelas?: number;
  minValorParcela?: number;
  
  // API Configuration
  apiUrl?: string;
  apiKey?: string;
  merchantId?: string;
  secretKey?: string;
  publicKey?: string;
  
  // PIX Configuration
  pixKey?: string;
  pixType?: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
  
  // Boleto Configuration
  agenciaBancaria?: string;
  contaBancaria?: string;
  digitoConta?: string;
  codigoBanco?: string;
  nomeBeneficiario?: string;
  cnpjBeneficiario?: string;
  
  // Card Configuration
  aceitaCredito: boolean;
  aceitaDebito: boolean;
  bandeirasSuportadas: string[];
  
  // Webhook Configuration
  webhookSecret?: string;
  webhookEvents: string[];
  
  // Additional Settings
  configuracaoCustomizada?: Record<string, any>;
}

export interface TaxaCanalPagamento {
  // Taxas percentuais
  taxaPercentual: number;
  taxaFixa: number;
  taxaAntecipacao?: number;
  
  // Taxas por tipo de transação
  taxaCredito?: number;
  taxaDebito?: number;
  taxaPix?: number;
  taxaBoleto?: number;
  
  // Taxas por parcela
  taxaParcela?: number;
  taxaParcelaMinima?: number;
  taxaParcelaMaxima?: number;
  
  // Taxas especiais
  taxaChargeback?: number;
  taxaEstorno?: number;
  taxaCancelamento?: number;
  
  // Configurações de repasse
  diasRepasse: number;
  antecipacaoAutomatica: boolean;
  
  // MDR (Merchant Discount Rate)
  mdrNegociado?: number;
  mdrPadrao?: number;
}

export interface LimitesTransacao {
  // Valores mínimos e máximos
  valorMinimo: number;
  valorMaximo: number;
  valorMaximoDiario?: number;
  valorMaximoMensal?: number;
  
  // Limites de quantidade
  quantidadeMaximaDiaria?: number;
  quantidadeMaximaMensal?: number;
  
  // Limites por tipo
  limitePorTipoTransacao?: Record<string, number>;
  
  // Risk Management
  limiteFraudeValor?: number;
  limiteFraudeQuantidade?: number;
  
  // Horários de funcionamento
  horariosPermitidos?: {
    inicio: string;
    fim: string;
    diasSemana: number[];
  };
}

export interface ProcessadoraPagamento {
  nome: string;
  codigo: string;
  versaoApi: string;
  urlApi: string;
  urlSandbox?: string;
  documentacao?: string;
  suporte: {
    email?: string;
    telefone?: string;
    horarioAtendimento?: string;
  };
  certificacoes: string[];
  sla?: {
    uptime: number;
    tempoResposta: number;
    resolucaoIncidentes: number;
  };
}

// ===== TRANSACTION TYPES =====
export interface TransacaoPagamento {
  id: string;
  canalPagamentoId: number;
  tipo: TransacaoTipo;
  valor: number;
  valorLiquido: number;
  moeda: string;
  status: TransacaoStatus;
  detalhes: TransacaoDetalhes;
  cliente?: ClienteTransacao;
  dataProcessamento: string;
  dataLiquidacao?: string;
  observacoes?: string;
  metadados?: Record<string, any>;
}

export type TransacaoTipo = 
  | 'pagamento'
  | 'estorno'
  | 'chargeback'
  | 'antecipacao'
  | 'liquidacao'
  | 'ajuste';

export type TransacaoStatus =
  | 'pendente'
  | 'processando'
  | 'aprovada'
  | 'recusada'
  | 'cancelada'
  | 'estornada'
  | 'liquidada'
  | 'contestada';

export interface TransacaoDetalhes {
  metodoPagamento: string;
  parcelas?: number;
  nsu?: string;
  authorizationCode?: string;
  tid?: string;
  acquirerResponseCode?: string;
  acquirerMessage?: string;
  cardBrand?: string;
  cardNumber?: string; // masked
  cardholderName?: string;
  softDescriptor?: string;
}

export interface ClienteTransacao {
  id?: number;
  nome: string;
  email?: string;
  cpfCnpj: string;
  telefone?: string;
  endereco?: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
}

// ===== FORM TYPES =====
export interface CanalPagamentoFormData {
  nome: string;
  tipo: CanalPagamentoTipo;
  descricao?: string;
  configuracao: Partial<CanalPagamentoConfiguracao>;
  taxas: Partial<TaxaCanalPagamento>;
  limitesTransacao: Partial<LimitesTransacao>;
  processadoraId?: number;
  webhookUrl?: string;
  isAtivo: boolean;
  prioridade: number;
  observacoes?: string;
}

// ===== FILTER AND SEARCH TYPES =====
export interface CanalPagamentoFilters {
  searchTerm: string;
  tipoFilter: CanalPagamentoTipo | 'all';
  statusFilter: CanalPagamentoStatus | 'all';
  ativoFilter: 'all' | 'ativo' | 'inativo';
  processadoraFilter: number | 'all';
  dataInicio?: string;
  dataFim?: string;
  valorMinimo?: number;
  valorMaximo?: number;
}

export interface CanalPagamentoSort {
  field: CanalPagamentoSortField;
  direction: 'asc' | 'desc';
}

export type CanalPagamentoSortField =
  | 'nome'
  | 'tipo'
  | 'status'
  | 'prioridade'
  | 'dataIntegracao'
  | 'ultimaTransacao'
  | 'valorProcessado'
  | 'taxaMedia'
  | 'createdAt';

// ===== STATE TYPES =====
export interface CanaisPagamentoManagerState {
  // Data
  canais: CanalPagamento[];
  processadoras: ProcessadoraPagamento[];
  transacoes: TransacaoPagamento[];
  selectedCanal: CanalPagamento | null;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  isTesting: boolean;
  isLoadingTransacoes: boolean;
  isLoadingProcessadoras: boolean;
  
  // UI state
  showForm: boolean;
  showTransacoesDialog: boolean;
  showConfigDialog: boolean;
  showTaxasDialog: boolean;
  expandedRows: Set<number>;
  selectedItems: number[];
  
  // Form state
  formData: CanalPagamentoFormData;
  editingCanal: CanalPagamento | null;
  
  // Filters and search
  filters: CanalPagamentoFilters;
  sort: CanalPagamentoSort;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  
  // Test state
  testResult: TestConnectionResult | null;
  
  // Validation
  errors: Record<string, string>;
  validationErrors: string[];
  isDirty: boolean;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
  details?: {
    responseTime: number;
    apiVersion?: string;
    features?: string[];
    limitations?: string[];
  };
  errors?: string[];
}

// ===== ANALYTICS TYPES =====
export interface CanalPagamentoAnalytics {
  totalCanais: number;
  canaisAtivos: number;
  canaisInativos: number;
  volumeTransacoes: number;
  valorTotalProcessado: number;
  ticketMedio: number;
  taxaAprovacao: number;
  tempoMedioProcessamento: number;
  distribuicaoPorTipo: TipoDistribuicao[];
  performancePorCanal: CanalPerformance[];
  evolucaoMensal: EvolucaoMensal[];
  comparativoTaxas: ComparativoTaxas[];
  incidentes: IncidenteCanal[];
  tendencias: {
    crescimentoVendas: number;
    crescimentoVolume: number;
    otimizacaoTaxas: number;
    satisfacaoClientes: number;
  };
}

export interface TipoDistribuicao {
  tipo: CanalPagamentoTipo;
  quantidade: number;
  percentual: number;
  valorProcessado: number;
  participacaoVolume: number;
}

export interface CanalPerformance {
  canalId: number;
  canalNome: string;
  transacoes: number;
  valorProcessado: number;
  taxaAprovacao: number;
  tempoMedioProcessamento: number;
  custoTotal: number;
  receita: number;
  roi: number;
  avaliacaoGeral: 'excelente' | 'bom' | 'regular' | 'ruim';
}

export interface EvolucaoMensal {
  mes: string;
  transacoes: number;
  valorProcessado: number;
  novosCanais: number;
  canaisInativos: number;
  custosOperacionais: number;
}

export interface ComparativoTaxas {
  canalId: number;
  canalNome: string;
  taxaNegociada: number;
  taxaMercado: number;
  economia: number;
  potencialOtimizacao: number;
}

export interface IncidenteCanal {
  id: number;
  canalId: number;
  tipo: 'indisponibilidade' | 'lentidao' | 'erro_configuracao' | 'falha_comunicacao';
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  dataInicio: string;
  dataResolucao?: string;
  duracao?: number;
  impactoFinanceiro?: number;
  descricao: string;
  status: 'aberto' | 'em_andamento' | 'resolvido' | 'fechado';
}

// ===== HOOK RETURN TYPES =====
export interface UseCanaisPagamentoReturn {
  state: CanaisPagamentoManagerState;
  canais: {
    data: CanalPagamento[];
    filteredData: CanalPagamento[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
  };
  processadoras: {
    data: ProcessadoraPagamento[];
    isLoading: boolean;
    error: string | null;
  };
  transacoes: {
    data: TransacaoPagamento[];
    isLoading: boolean;
    error: string | null;
    loadByCanal: (canalId: number) => void;
  };
  analytics: {
    data: CanalPagamentoAnalytics | null;
    isLoading: boolean;
    error: string | null;
  };
  actions: {
    // CRUD operations
    createCanal: (data: CanalPagamentoFormData) => Promise<CanalPagamento>;
    updateCanal: (id: number, data: Partial<CanalPagamentoFormData>) => Promise<CanalPagamento>;
    deleteCanal: (id: number) => Promise<void>;
    bulkDelete: (ids: number[]) => Promise<void>;
    
    // Canal operations
    activateCanal: (id: number) => Promise<void>;
    deactivateCanal: (id: number) => Promise<void>;
    suspendCanal: (id: number, motivo: string) => Promise<void>;
    testConnection: (id: number) => Promise<TestConnectionResult>;
    
    // Configuration operations
    updateConfiguracao: (id: number, config: Partial<CanalPagamentoConfiguracao>) => Promise<void>;
    updateTaxas: (id: number, taxas: Partial<TaxaCanalPagamento>) => Promise<void>;
    updateLimites: (id: number, limites: Partial<LimitesTransacao>) => Promise<void>;
    
    // Selection and UI
    selectCanal: (canal: CanalPagamento | null) => void;
    toggleItemSelection: (id: number) => void;
    selectAllItems: () => void;
    clearSelection: () => void;
    toggleRowExpansion: (id: number) => void;
    
    // Search and filters
    search: (query: string) => void;
    filterByTipo: (tipo: CanalPagamentoTipo | 'all') => void;
    filterByStatus: (status: CanalPagamentoStatus | 'all') => void;
    filterByAtivo: (ativo: 'all' | 'ativo' | 'inativo') => void;
    filterByProcessadora: (processadoraId: number | 'all') => void;
    filterByDateRange: (inicio: string, fim: string) => void;
    clearFilters: () => void;
    
    // Sorting and pagination
    sortBy: (field: CanalPagamentoSortField, direction?: 'asc' | 'desc') => void;
    setPage: (page: number) => void;
    setItemsPerPage: (items: number) => void;
    
    // Forms and modals
    showCreateForm: () => void;
    showEditForm: (canal: CanalPagamento) => void;
    hideForm: () => void;
    showTransacoesDialog: (canal: CanalPagamento) => void;
    hideTransacoesDialog: () => void;
    showConfigDialog: (canal: CanalPagamento) => void;
    hideConfigDialog: () => void;
    showTaxasDialog: (canal: CanalPagamento) => void;
    hideTaxasDialog: () => void;
    
    // Export operations
    exportCanais: (format: 'xlsx' | 'csv' | 'pdf') => Promise<void>;
    exportTransacoes: (canalId: number, format: 'xlsx' | 'csv') => Promise<void>;
    exportAnalytics: (format: 'xlsx' | 'pdf') => Promise<void>;
    
    // Validation
    validateForm: (data: CanalPagamentoFormData) => boolean;
    clearErrors: () => void;
  };
  utils: {
    formatCurrency: (value: number) => string;
    formatPercentage: (value: number) => string;
    formatDate: (date: string) => string;
    formatStatus: (status: CanalPagamentoStatus) => string;
    formatTipo: (tipo: CanalPagamentoTipo) => string;
    getStatusColor: (status: CanalPagamentoStatus) => string;
    getTipoIcon: (tipo: CanalPagamentoTipo) => React.ReactNode;
    calculateTaxaTotal: (taxas: TaxaCanalPagamento, valor: number) => number;
    isWithinLimites: (canal: CanalPagamento, valor: number) => boolean;
    canProcessTransaction: (canal: CanalPagamento) => boolean;
    getPriorityLevel: (prioridade: number) => 'alta' | 'media' | 'baixa';
    formatTransactionId: (id: string) => string;
    maskCardNumber: (number: string) => string;
    validateConfiguration: (tipo: CanalPagamentoTipo, config: CanalPagamentoConfiguracao) => string[];
  };
}

// ===== COMPONENT PROPS TYPES =====
export interface CanaisPagamentoManagerContainerProps {
  userId?: number;
  readOnly?: boolean;
  showAnalytics?: boolean;
  showBulkActions?: boolean;
  defaultFilters?: Partial<CanalPagamentoFilters>;
}

export interface CanaisPagamentoManagerPresentationProps {
  state: CanaisPagamentoManagerState;
  canais: UseCanaisPagamentoReturn['canais'];
  processadoras: UseCanaisPagamentoReturn['processadoras'];
  transacoes: UseCanaisPagamentoReturn['transacoes'];
  analytics: UseCanaisPagamentoReturn['analytics'];
  actions: UseCanaisPagamentoReturn['actions'];
  utils: UseCanaisPagamentoReturn['utils'];
  readOnly?: boolean;
  showAnalytics?: boolean;
  showBulkActions?: boolean;
}

// ===== CONSTANTS =====
export const CANAL_PAGAMENTO_TIPOS: Record<CanalPagamentoTipo, string> = {
  cartao_credito: 'Cartão de Crédito',
  cartao_debito: 'Cartão de Débito',
  pix: 'PIX',
  boleto: 'Boleto Bancário',
  transferencia_bancaria: 'Transferência Bancária',
  carteira_digital: 'Carteira Digital',
  vale_alimentacao: 'Vale Alimentação',
  vale_refeicao: 'Vale Refeição',
  credito_loja: 'Crédito da Loja',
  financiamento: 'Financiamento',
  outros: 'Outros'
};

export const CANAL_PAGAMENTO_STATUS: Record<CanalPagamentoStatus, string> = {
  ativo: 'Ativo',
  inativo: 'Inativo',
  suspenso: 'Suspenso',
  em_manutencao: 'Em Manutenção',
  pendente_aprovacao: 'Pendente Aprovação',
  erro_configuracao: 'Erro de Configuração',
  bloqueado: 'Bloqueado'
};

export const CANAL_PAGAMENTO_STATUS_COLORS: Record<CanalPagamentoStatus, string> = {
  ativo: 'text-green-600 bg-green-100',
  inativo: 'text-gray-600 bg-gray-100',
  suspenso: 'text-yellow-600 bg-yellow-100',
  em_manutencao: 'text-blue-600 bg-blue-100',
  pendente_aprovacao: 'text-orange-600 bg-orange-100',
  erro_configuracao: 'text-red-600 bg-red-100',
  bloqueado: 'text-red-700 bg-red-200'
};

export const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

// ===== VALIDATION =====
export const validateCanalPagamentoForm = (data: CanalPagamentoFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.nome.trim()) {
    errors.nome = 'Nome é obrigatório';
  }

  if (!data.tipo) {
    errors.tipo = 'Tipo é obrigatório';
  }

  if (data.prioridade < 1 || data.prioridade > 10) {
    errors.prioridade = 'Prioridade deve estar entre 1 e 10';
  }

  // Validate based on tipo
  if (data.tipo === 'pix' && !data.configuracao.pixKey) {
    errors.pixKey = 'Chave PIX é obrigatória';
  }

  if (data.tipo === 'boleto' && (!data.configuracao.agenciaBancaria || !data.configuracao.contaBancaria)) {
    errors.dadosBancarios = 'Dados bancários são obrigatórios para boleto';
  }

  if ((data.tipo === 'cartao_credito' || data.tipo === 'cartao_debito') && !data.configuracao.apiKey) {
    errors.apiKey = 'API Key é obrigatória para cartões';
  }

  return errors;
};