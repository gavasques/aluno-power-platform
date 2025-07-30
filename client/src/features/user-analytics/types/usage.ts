/**
 * TYPES: Usage - Sistema de Análise de Uso
 * Tipos centralizados para análise de métricas e uso do usuário
 * Extraído de Usage.tsx (739 linhas) para modularização
 * Data: Janeiro 30, 2025
 */

// ===== CORE TYPES =====
export interface UsageData {
  id: number;
  userId: number;
  feature: FeatureType;
  action: ActionType;
  resourceId?: number;
  resourceType?: ResourceType;
  metadata?: UsageMetadata;
  duration?: number; // milliseconds
  success: boolean;
  errorMessage?: string;
  timestamp: string;
  sessionId: string;
  userAgent?: string;
  ipAddress?: string;
  country?: string;
  city?: string;
}

export type FeatureType = 
  | 'agents'
  | 'simulators'
  | 'products'
  | 'suppliers'
  | 'financas360'
  | 'imports'
  | 'reports'
  | 'dashboard'
  | 'settings'
  | 'hub'
  | 'materials'
  | 'tools'
  | 'auth'
  | 'api';

export type ActionType =
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'search'
  | 'filter'
  | 'export'
  | 'import'
  | 'upload'
  | 'download'
  | 'run'
  | 'generate'
  | 'calculate'
  | 'login'
  | 'logout';

export type ResourceType =
  | 'product'
  | 'supplier'
  | 'agent'
  | 'simulation'
  | 'report'
  | 'file'
  | 'image'
  | 'document'
  | 'user'
  | 'partner'
  | 'material'
  | 'tool';

export interface UsageMetadata {
  // Agent usage
  agentType?: string;
  tokensUsed?: number;
  creditsCost?: number;
  modelUsed?: string;
  
  // Product/Import usage
  productCount?: number;
  imageCount?: number;
  fileSize?: number;
  
  // Simulation usage
  simulationType?: string;
  calculationComplexity?: 'simple' | 'medium' | 'complex';
  
  // Search/Filter usage
  searchQuery?: string;
  filterCriteria?: Record<string, any>;
  resultsCount?: number;
  
  // Export usage
  exportFormat?: 'xlsx' | 'csv' | 'pdf' | 'txt';
  recordCount?: number;
  
  // Performance
  loadTime?: number;
  errorType?: string;
  
  // Context
  deviceType?: 'desktop' | 'tablet' | 'mobile';
  browser?: string;
  referrer?: string;
}

// ===== ANALYTICS TYPES =====
export interface UsageAnalytics {
  period: DateRange;
  totalActions: number;
  uniqueSessions: number;
  averageSessionDuration: number;
  topFeatures: FeatureUsage[];
  topActions: ActionUsage[];
  dailyUsage: DailyUsage[];
  hourlyDistribution: HourlyDistribution[];
  geographicDistribution: GeographicUsage[];
  deviceAnalytics: DeviceAnalytics;
  performanceMetrics: PerformanceMetrics;
  errorAnalytics: ErrorAnalytics;
  featureAdoption: FeatureAdoption[];
  userBehavior: UserBehavior;
}

export interface DateRange {
  startDate: string;
  endDate: string;
  period: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'last3months' | 'lastyear' | 'custom';
}

export interface FeatureUsage {
  feature: FeatureType;
  usage_count: number;
  unique_users: number;
  total_duration: number;
  success_rate: number;
  growth_rate?: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ActionUsage {
  action: ActionType;
  usage_count: number;
  success_rate: number;
  average_duration: number;
  peak_hours: number[];
}

export interface DailyUsage {
  date: string;
  total_actions: number;
  unique_users: number;
  session_count: number;
  avg_session_duration: number;
  top_feature: FeatureType;
}

export interface HourlyDistribution {
  hour: number;
  usage_count: number;
  unique_users: number;
  peak_features: FeatureType[];
}

export interface GeographicUsage {
  country: string;
  city?: string;
  usage_count: number;
  unique_users: number;
  top_features: FeatureType[];
}

export interface DeviceAnalytics {
  desktop: number;
  tablet: number;
  mobile: number;
  topBrowsers: BrowserUsage[];
  topOperatingSystems: OSUsage[];
}

export interface BrowserUsage {
  browser: string;
  usage_count: number;
  percentage: number;
}

export interface OSUsage {
  os: string;
  usage_count: number;
  percentage: number;
}

export interface PerformanceMetrics {
  averageLoadTime: number;
  slowestFeatures: FeaturePerformance[];
  responseTimeDistribution: ResponseTimeDistribution[];
  uptimePercentage: number;
}

export interface FeaturePerformance {
  feature: FeatureType;
  averageLoadTime: number;
  slowestActions: ActionPerformance[];
}

export interface ActionPerformance {
  action: ActionType;
  averageTime: number;
  p95Time: number;
  p99Time: number;
}

export interface ResponseTimeDistribution {
  range: string; // "0-100ms", "100-500ms", etc.
  count: number;
  percentage: number;
}

export interface ErrorAnalytics {
  totalErrors: number;
  errorRate: number;
  topErrors: ErrorSummary[];
  errorsByFeature: FeatureErrorSummary[];
  errorTrends: ErrorTrend[];
}

export interface ErrorSummary {
  errorMessage: string;
  errorType: string;
  occurrences: number;
  affectedUsers: number;
  firstSeen: string;
  lastSeen: string;
}

export interface FeatureErrorSummary {
  feature: FeatureType;
  errorCount: number;
  errorRate: number;
  topErrors: string[];
}

export interface ErrorTrend {
  date: string;
  errorCount: number;
  errorRate: number;
  newErrors: number;
}

export interface FeatureAdoption {
  feature: FeatureType;
  adoptionRate: number; // percentage of users who used this feature
  timeToFirstUse: number; // average days from registration
  retentionRate: number; // percentage who used it again
  powerUsers: number; // users with >10 uses
}

export interface UserBehavior {
  averageSessionsPerUser: number;
  averageActionsPerSession: number;
  mostCommonFlows: UserFlow[];
  churnIndicators: ChurnIndicator[];
  engagementLevels: EngagementLevel[];
}

export interface UserFlow {
  flow: string[];
  occurrences: number;
  conversionRate: number;
  averageDuration: number;
}

export interface ChurnIndicator {
  indicator: string;
  risk_level: 'low' | 'medium' | 'high';
  affected_users: number;
  description: string;
}

export interface EngagementLevel {
  level: 'low' | 'medium' | 'high' | 'power_user';
  userCount: number;
  percentage: number;
  criteria: string;
  averageActions: number;
}

// ===== CREDIT USAGE TYPES =====
export interface CreditUsage {
  id: number;
  userId: number;
  feature: FeatureType;
  action: string;
  creditsUsed: number;
  creditsRemaining: number;
  agentType?: string;
  modelUsed?: string;
  tokensUsed?: number;
  success: boolean;
  timestamp: string;
  cost?: number;
  currency?: string;
}

export interface CreditAnalytics {
  totalCreditsUsed: number;
  totalCost: number;
  averageCostPerAction: number;
  creditsByFeature: FeatureCreditUsage[];
  dailyCreditUsage: DailyCreditUsage[];
  topSpendingUsers: UserCreditUsage[];
  modelUsageBreakdown: ModelCreditUsage[];
  projectedMonthlyUsage: number;
  budgetAlerts: BudgetAlert[];
}

export interface FeatureCreditUsage {
  feature: FeatureType;
  creditsUsed: number;
  cost: number;
  usage_count: number;
  averageCreditsPerUse: number;
}

export interface DailyCreditUsage {
  date: string;
  creditsUsed: number;
  cost: number;
  usage_count: number;
  topFeatures: FeatureType[];
}

export interface UserCreditUsage {
  userId: number;
  userName: string;
  creditsUsed: number;
  cost: number;
  usage_count: number;
  topFeatures: FeatureType[];
}

export interface ModelCreditUsage {
  model: string;
  creditsUsed: number;
  cost: number;
  usage_count: number;
  averageTokensPerUse: number;
}

export interface BudgetAlert {
  type: 'daily' | 'weekly' | 'monthly';
  threshold: number;
  current: number;
  percentage: number;
  status: 'ok' | 'warning' | 'critical';
}

// ===== STATE TYPES =====
export interface UsageAnalyticsState {
  // Data
  analytics: UsageAnalytics | null;
  creditAnalytics: CreditAnalytics | null;
  rawUsageData: UsageData[];
  rawCreditData: CreditUsage[];
  
  // Loading states
  isLoading: boolean;
  isLoadingAnalytics: boolean;
  isLoadingCredits: boolean;
  isExporting: boolean;
  
  // Filters
  dateRange: DateRange;
  selectedFeatures: FeatureType[];
  selectedActions: ActionType[];
  selectedUsers: number[];
  
  // UI state
  activeTab: UsageTab;
  selectedMetric: MetricType;
  chartType: ChartType;
  viewMode: ViewMode;
  
  // Export
  exportFormat: ExportFormat;
  exportFilters: ExportFilters;
  
  // Errors
  error: string | null;
  errors: Record<string, string>;
}

export type UsageTab = 
  | 'overview'
  | 'features'
  | 'performance'
  | 'users'
  | 'geographic'
  | 'credits'
  | 'errors'
  | 'realtime';

export type MetricType =
  | 'usage_count'
  | 'unique_users'
  | 'success_rate'
  | 'avg_duration'
  | 'credits_used'
  | 'error_rate'
  | 'growth_rate';

export type ChartType =
  | 'line'
  | 'bar'
  | 'pie'
  | 'area'
  | 'heatmap'
  | 'funnel';

export type ViewMode =
  | 'chart'
  | 'table'
  | 'cards'
  | 'timeline';

export type ExportFormat =
  | 'xlsx'
  | 'csv' 
  | 'pdf'
  | 'json';

export interface ExportFilters {
  includeRawData: boolean;
  includeCharts: boolean;
  includeAnalytics: boolean;
  dateRange: DateRange;
  features: FeatureType[];
  actions: ActionType[];
}

// ===== HOOK RETURN TYPES =====
export interface UseUsageAnalyticsReturn {
  state: UsageAnalyticsState;
  analytics: {
    data: UsageAnalytics | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
  };
  credits: {
    data: CreditAnalytics | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
  };
  actions: {
    // Date range
    setDateRange: (range: DateRange) => void;
    setCustomDateRange: (start: string, end: string) => void;
    
    // Filters
    setFeatureFilter: (features: FeatureType[]) => void;
    setActionFilter: (actions: ActionType[]) => void;
    setUserFilter: (users: number[]) => void;
    clearFilters: () => void;
    
    // UI
    setActiveTab: (tab: UsageTab) => void;
    setSelectedMetric: (metric: MetricType) => void;
    setChartType: (type: ChartType) => void;
    setViewMode: (mode: ViewMode) => void;
    
    // Export
    exportData: (format: ExportFormat, filters?: ExportFilters) => Promise<void>;
    
    // Real-time
    startRealTimeUpdates: () => void;
    stopRealTimeUpdates: () => void;
    
    // Data refresh
    refreshAll: () => void;
    refreshAnalytics: () => void;
    refreshCredits: () => void;
  };
  utils: {
    formatUsageNumber: (value: number) => string;
    formatDuration: (ms: number) => string;
    formatCurrency: (value: number) => string;
    formatPercentage: (value: number) => string;
    getGrowthIcon: (rate: number) => 'up' | 'down' | 'stable';
    getStatusColor: (status: string) => string;
    calculateGrowthRate: (current: number, previous: number) => number;
    groupByPeriod: (data: any[], period: string) => any[];
  };
}

// ===== COMPONENT PROPS TYPES =====
export interface UsageAnalyticsContainerProps {
  userId?: number;
  readOnly?: boolean;
  showCredits?: boolean;
  showRealTime?: boolean;
  defaultTab?: UsageTab;
  defaultDateRange?: DateRange;
}

export interface UsageAnalyticsPresentationProps {
  state: UsageAnalyticsState;
  analytics: UseUsageAnalyticsReturn['analytics'];
  credits: UseUsageAnalyticsReturn['credits'];
  actions: UseUsageAnalyticsReturn['actions'];
  utils: UseUsageAnalyticsReturn['utils'];
  readOnly?: boolean;
  showCredits?: boolean;
  showRealTime?: boolean;
}

export interface OverviewTabProps {
  analytics: UsageAnalytics;
  creditAnalytics: CreditAnalytics | null;
  isLoading: boolean;
  showCredits: boolean;
  utils: UseUsageAnalyticsReturn['utils'];
}

export interface FeaturesTabProps {
  analytics: UsageAnalytics;
  selectedMetric: MetricType;
  chartType: ChartType;
  viewMode: ViewMode;
  onMetricChange: (metric: MetricType) => void;
  onChartTypeChange: (type: ChartType) => void;
  onViewModeChange: (mode: ViewMode) => void;
  utils: UseUsageAnalyticsReturn['utils'];
}

export interface PerformanceTabProps {
  analytics: UsageAnalytics;
  isLoading: boolean;
  utils: UseUsageAnalyticsReturn['utils'];
}

export interface UsersTabProps {
  analytics: UsageAnalytics;
  selectedUsers: number[];
  onUserSelect: (users: number[]) => void;
  utils: UseUsageAnalyticsReturn['utils'];
}

export interface GeographicTabProps {
  analytics: UsageAnalytics;
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
  utils: UseUsageAnalyticsReturn['utils'];
}

export interface CreditsTabProps {
  creditAnalytics: CreditAnalytics;
  isLoading: boolean;
  utils: UseUsageAnalyticsReturn['utils'];
}

export interface ErrorsTabProps {
  analytics: UsageAnalytics;
  isLoading: boolean;
  utils: UseUsageAnalyticsReturn['utils'];
}

export interface RealTimeTabProps {
  isActive: boolean;
  onStart: () => void;
  onStop: () => void;
  utils: UseUsageAnalyticsReturn['utils'];
}

export interface DateRangePickerProps {
  dateRange: DateRange;
  onChange: (range: DateRange) => void;
  onCustomRangeChange: (start: string, end: string) => void;
}

export interface FilterBarProps {
  selectedFeatures: FeatureType[];
  selectedActions: ActionType[];
  selectedUsers: number[];
  onFeatureChange: (features: FeatureType[]) => void;
  onActionChange: (actions: ActionType[]) => void;
  onUserChange: (users: number[]) => void;
  onClearFilters: () => void;
}

export interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat, filters: ExportFilters) => Promise<void>;
  isExporting: boolean;
}

export interface MetricCardProps {
  title: string;
  value: number | string;
  previousValue?: number;
  format: 'number' | 'currency' | 'percentage' | 'duration';
  trend?: 'up' | 'down' | 'stable';
  icon?: React.ReactNode;
  color?: string;
  isLoading?: boolean;
  utils: UseUsageAnalyticsReturn['utils'];
}

export interface ChartWrapperProps {
  title: string;
  data: any[];
  chartType: ChartType;
  metric: MetricType;
  isLoading: boolean;
  height?: number;
  utils: UseUsageAnalyticsReturn['utils'];
}

// ===== CONSTANTS =====
export const FEATURE_LABELS: Record<FeatureType, string> = {
  agents: 'Agentes de IA',
  simulators: 'Simuladores',
  products: 'Produtos',
  suppliers: 'Fornecedores',
  financas360: 'Finanças 360',
  imports: 'Importações',
  reports: 'Relatórios',
  dashboard: 'Dashboard',
  settings: 'Configurações',
  hub: 'Hub de Recursos',
  materials: 'Materiais',
  tools: 'Ferramentas',
  auth: 'Autenticação',
  api: 'API'
};

export const ACTION_LABELS: Record<ActionType, string> = {
  view: 'Visualizar',
  create: 'Criar',
  update: 'Atualizar',
  delete: 'Excluir',
  search: 'Pesquisar',
  filter: 'Filtrar',
  export: 'Exportar',
  import: 'Importar',
  upload: 'Upload',
  download: 'Download',
  run: 'Executar',
  generate: 'Gerar',
  calculate: 'Calcular',
  login: 'Login',
  logout: 'Logout'
};

export const USAGE_TAB_LABELS: Record<UsageTab, string> = {
  overview: 'Visão Geral',
  features: 'Recursos',
  performance: 'Performance',
  users: 'Usuários',
  geographic: 'Geográfico',
  credits: 'Créditos',
  errors: 'Erros',
  realtime: 'Tempo Real'
};

export const METRIC_LABELS: Record<MetricType, string> = {
  usage_count: 'Uso Total',
  unique_users: 'Usuários Únicos',
  success_rate: 'Taxa de Sucesso',
  avg_duration: 'Duração Média',
  credits_used: 'Créditos Usados',
  error_rate: 'Taxa de Erro',
  growth_rate: 'Taxa de Crescimento'
};

export const CHART_TYPE_LABELS: Record<ChartType, string> = {
  line: 'Linha',
  bar: 'Barras',
  pie: 'Pizza',
  area: 'Área',
  heatmap: 'Mapa de Calor',
  funnel: 'Funil'
};

export const DATE_RANGE_OPTIONS = [
  { value: 'today', label: 'Hoje' },
  { value: 'yesterday', label: 'Ontem' },
  { value: 'last7days', label: 'Últimos 7 dias' },
  { value: 'last30days', label: 'Últimos 30 dias' },
  { value: 'last3months', label: 'Últimos 3 meses' },
  { value: 'lastyear', label: 'Último ano' },
  { value: 'custom', label: 'Personalizado' }
] as const;

export const EXPORT_FORMAT_OPTIONS = [
  { value: 'xlsx', label: 'Excel (.xlsx)' },
  { value: 'csv', label: 'CSV (.csv)' },
  { value: 'pdf', label: 'PDF (.pdf)' },
  { value: 'json', label: 'JSON (.json)' }
] as const;

// ===== VALIDATION =====
export const isValidDateRange = (range: DateRange): boolean => {
  if (range.period === 'custom') {
    return range.startDate && range.endDate && 
           new Date(range.startDate) <= new Date(range.endDate);
  }
  return true;
};

export const isValidUsageData = (data: Partial<UsageData>): data is UsageData => {
  return !!(
    data.userId &&
    data.feature &&
    data.action &&
    data.timestamp &&
    data.sessionId
  );
};