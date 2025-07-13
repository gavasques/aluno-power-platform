export interface AmazonAdsRow {
  // Identificação
  Produto: string;
  Entidade: string;
  Operação?: string;
  'Nome da campanha': string;
  'Nome do grupo de anúncios'?: string;
  'Texto de palavras-chave'?: string;
  
  // Editáveis
  Estado: 'ativada' | 'pausada' | 'arquivada';
  Lance?: number;
  'Tipo de correspondência'?: string;
  'Orçamento diário'?: number;
  'Estratégia de lances'?: string;
  Porcentagem?: number;
  
  // Performance (readonly)
  Impressões?: number;
  Cliques?: number;
  'Taxa de cliques'?: number;
  Gastos?: number;
  Vendas?: number;
  Pedidos?: number;
  'Taxa de conversão'?: number;
  ACOS?: number;
  CPC?: number;
  ROAS?: number;
  
  // Metadados internos
  _id?: string;
  _originalIndex?: number;
  _hasChanges?: boolean;
  _validationErrors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  type: 'critical' | 'error' | 'warning' | 'suggestion';
  message: string;
  severity: number; // 1-10
  category: string;
}

export interface ChangeHistory {
  id: string;
  timestamp: Date;
  field: string;
  oldValue: any;
  newValue: any;
  rowIndex: number;
  reason?: string;
}

export interface FilterState {
  entidade: string;
  campanha: string;
  estado: string;
  alteracoes: 'todas' | 'alteradas' | 'sem_alteracoes';
  validacao: 'todas' | 'com_erros' | 'sem_erros';
  busca: string;
}

export interface BulkEditData {
  Estado?: 'ativada' | 'pausada' | 'arquivada';
  Lance?: number;
  'Tipo de correspondência'?: string;
  'Orçamento diário'?: number;
  'Estratégia de lances'?: string;
  Porcentagem?: number;
  reason?: string;
}

export interface FileStats {
  totalRows: number;
  totalCampaigns: number;
  totalAdGroups: number;
  totalKeywords: number;
  totalNegativeKeywords: number;
  fileSize: string;
}

export interface ValidationStats {
  critical: number;
  errors: number;
  warnings: number;
  suggestions: number;
  total: number;
}

export const ENTITY_TYPES = {
  CAMPAIGN: 'Campanha',
  AD_GROUP: 'Grupo de anúncios', 
  KEYWORD: 'Palavra-chave',
  NEGATIVE_KEYWORD: 'Palavra-chave negativa'
} as const;

export const STATES = {
  ENABLED: 'ativada',
  PAUSED: 'pausada',
  ARCHIVED: 'arquivada'
} as const;

export const MATCH_TYPES = {
  EXACT: 'Exata',
  PHRASE: 'Frase',
  BROAD: 'Ampla',
  NEGATIVE_EXACT: 'Exata negativa',
  NEGATIVE_PHRASE: 'Frase negativa',
  NEGATIVE_BROAD: 'Ampla negativa'
} as const;

export const BIDDING_STRATEGIES = {
  DYNAMIC_DOWN_ONLY: 'Dinâmico - apenas reduções',
  DYNAMIC_UP_DOWN: 'Dinâmico - aumentos e reduções',
  FIXED_BID: 'Lance fixo'
} as const;

export const REQUIRED_COLUMNS = [
  'Produto',
  'Entidade',
  'Nome da campanha',
  'Estado'
] as const;

export const EDITABLE_FIELDS = [
  'Estado',
  'Lance',
  'Tipo de correspondência',
  'Orçamento diário', 
  'Estratégia de lances',
  'Porcentagem'
] as const;

export const READONLY_FIELDS = [
  'Produto',
  'Entidade',
  'Operação',
  'Nome da campanha',
  'Nome do grupo de anúncios',
  'Texto de palavras-chave',
  'Impressões',
  'Cliques',
  'Taxa de cliques',
  'Gastos',
  'Vendas',
  'Pedidos',
  'Taxa de conversão',
  'ACOS',
  'CPC',
  'ROAS'
] as const;