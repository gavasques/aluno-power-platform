export interface AmazonKeyword {
  produto?: string;
  entidade?: string;
  operacao?: string;
  identificadorCampanha?: string;
  identificadorGrupoAnuncios?: string;
  nomeCampanha?: string;
  nomeGrupoAnuncios?: string;
  estado?: string;
  textopalavraChave?: string;
  tipoCorrespondencia?: string;
  lance?: number;
  impressoes?: number;
  cliques?: number;
  taxaCliques?: number;
  gastos?: number;
  vendas?: number;
  pedidos?: number;
  unidades?: number;
  taxaConversao?: number;
  acos?: number;
  cpc?: number;
  roas?: number;
  // Campos alternativos em inglês
  campaign?: string;
  adGroup?: string;
  keyword?: string;
  bid?: number;
  clicks?: number;
  impressions?: number;
  orders?: number;
  spend?: number;
  sales?: number;
  ctr?: number;
  conversionRate?: number;
  [key: string]: any; // Para campos dinâmicos da planilha
}

export interface SOPRecommendation {
  keyword: string;
  campaign: string;
  currentBid: number;
  currentCpc: number;
  newBid: number;
  clicks: number;
  orders: number;
  acos: number;
  impressions: number;
  spend: number;
  sales: number;
  ruleApplied: string;
  action: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  estimatedImpact: number;
  justification: string;
  rowIndex: number;
  ctr?: number;
}

export interface AnalysisConfig {
  priceRange: 'auto' | '50' | '100' | '200' | '200+';
  analysisMode: 'conservative' | 'aggressive';
  customTolerances?: {
    low: number;
    medium: number;
    high: number;
  };
}

export interface AnalysisSummary {
  totalKeywords: number;
  totalRecommendations: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  deactivations: number;
  bidReductions: number;
  bidIncreases: number;
  estimatedSavings: number;
  priceRange: string;
  estimatedProductPrice: number;
}

export interface ProcessingStatus {
  stage: 'idle' | 'uploading' | 'validating' | 'analyzing' | 'generating' | 'complete' | 'error';
  progress: number;
  message: string;
}

export interface ToleranceConfig {
  low: number;
  medium: number;
  high: number;
}

export interface PriceRangeConfig {
  range: string;
  tolerances: ToleranceConfig;
}