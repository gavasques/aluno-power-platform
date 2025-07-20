/**
 * Tipos para Hooks Customizados - Interfaces para todos os hooks do sistema
 * Centraliza tipos de retorno e parâmetros para hooks customizados
 */

import { ReactNode } from 'react';
import { 
  User, 
  Product, 
  Supplier, 
  Material, 
  Agent, 
  Simulation,
  Report,
  Notification,
  Message,
  ActivityLog
} from './domain';
import { 
  PricingCalculation, 
  SalesStatistics, 
  PerformanceMetrics 
} from './calculations';

// ============================================================================
// HOOKS DE AUTENTICAÇÃO
// ============================================================================

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  refreshToken: () => Promise<void>;
}

export interface UsePermissionsReturn {
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  permissions: string[];
  roles: string[];
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// HOOKS DE DADOS E QUERIES
// ============================================================================

export interface UseQueryReturn<T> {
  data: T | undefined;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isRefetching: boolean;
}

export interface UseMutationReturn<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  isError: boolean;
  reset: () => void;
}

export interface UseInfiniteQueryReturn<T> {
  data: T[] | undefined;
  isLoading: boolean;
  error: string | null;
  fetchNextPage: () => Promise<void>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  refetch: () => Promise<void>;
}

// ============================================================================
// HOOKS DE PRODUTOS
// ============================================================================

export interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  createProduct: (product: Partial<Product>) => Promise<Product>;
  updateProduct: (id: number, product: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: number) => Promise<void>;
  getProduct: (id: number) => Promise<Product>;
  searchProducts: (query: string) => Promise<Product[]>;
  filterProducts: (filters: Record<string, any>) => Promise<Product[]>;
}

export interface UseProductReturn {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
  updateProduct: (product: Partial<Product>) => Promise<Product>;
  deleteProduct: () => Promise<void>;
  duplicateProduct: () => Promise<Product>;
  calculatePricing: () => Promise<PricingCalculation>;
}

export interface UseProductPricingReturn {
  calculation: PricingCalculation | null;
  isLoading: boolean;
  error: string | null;
  calculate: (productId: number) => Promise<PricingCalculation>;
  saveCalculation: (calculation: PricingCalculation) => Promise<void>;
  exportCalculation: (format: string) => Promise<void>;
}

// ============================================================================
// HOOKS DE FORNECEDORES
// ============================================================================

export interface UseSuppliersReturn {
  suppliers: Supplier[];
  isLoading: boolean;
  error: string | null;
  createSupplier: (supplier: Partial<Supplier>) => Promise<Supplier>;
  updateSupplier: (id: number, supplier: Partial<Supplier>) => Promise<Supplier>;
  deleteSupplier: (id: number) => Promise<void>;
  getSupplier: (id: number) => Promise<Supplier>;
  searchSuppliers: (query: string) => Promise<Supplier[]>;
  filterSuppliers: (filters: Record<string, any>) => Promise<Supplier[]>;
}

export interface UseSupplierReturn {
  supplier: Supplier | null;
  isLoading: boolean;
  error: string | null;
  updateSupplier: (supplier: Partial<Supplier>) => Promise<Supplier>;
  deleteSupplier: () => Promise<void>;
  addContact: (contact: any) => Promise<void>;
  addConversation: (conversation: any) => Promise<void>;
}

export interface UseSupplierContactsReturn {
  contacts: any[];
  isLoading: boolean;
  error: string | null;
  addContact: (contact: any) => Promise<void>;
  updateContact: (id: number, contact: any) => Promise<void>;
  deleteContact: (id: number) => Promise<void>;
}

export interface UseSupplierConversationsReturn {
  conversations: any[];
  isLoading: boolean;
  error: string | null;
  addConversation: (conversation: any) => Promise<void>;
  updateConversation: (id: number, conversation: any) => Promise<void>;
  deleteConversation: (id: number) => Promise<void>;
  sendMessage: (conversationId: number, message: any) => Promise<void>;
}

// ============================================================================
// HOOKS DE AGENTES DE IA
// ============================================================================

export interface UseAgentsReturn {
  agents: Agent[];
  isLoading: boolean;
  error: string | null;
  createAgent: (agent: Partial<Agent>) => Promise<Agent>;
  updateAgent: (id: number, agent: Partial<Agent>) => Promise<Agent>;
  deleteAgent: (id: number) => Promise<void>;
  getAgent: (id: number) => Promise<Agent>;
  runAgent: (id: number, input: Record<string, any>) => Promise<any>;
}

export interface UseAgentReturn {
  agent: Agent | null;
  isLoading: boolean;
  error: string | null;
  updateAgent: (agent: Partial<Agent>) => Promise<Agent>;
  deleteAgent: () => Promise<void>;
  runAgent: (input: Record<string, any>) => Promise<any>;
  getSessions: () => Promise<any[]>;
}

export interface UseAgentSessionReturn {
  session: any | null;
  isLoading: boolean;
  error: string | null;
  result: any | null;
  isRunning: boolean;
  progress: number;
  runSession: (input: Record<string, any>) => Promise<any>;
  cancelSession: () => Promise<void>;
  getResult: () => Promise<any>;
}

// ============================================================================
// HOOKS DE SIMULAÇÕES
// ============================================================================

export interface UseSimulationsReturn {
  simulations: Simulation[];
  isLoading: boolean;
  error: string | null;
  createSimulation: (simulation: Partial<Simulation>) => Promise<Simulation>;
  updateSimulation: (id: number, simulation: Partial<Simulation>) => Promise<Simulation>;
  deleteSimulation: (id: number) => Promise<void>;
  getSimulation: (id: number) => Promise<Simulation>;
  duplicateSimulation: (id: number) => Promise<Simulation>;
  runSimulation: (id: number) => Promise<any>;
}

export interface UseSimulationReturn {
  simulation: Simulation | null;
  isLoading: boolean;
  error: string | null;
  updateSimulation: (simulation: Partial<Simulation>) => Promise<Simulation>;
  deleteSimulation: () => Promise<void>;
  duplicateSimulation: () => Promise<Simulation>;
  runSimulation: () => Promise<any>;
  exportSimulation: (format: string) => Promise<void>;
}

export interface UseSimulationTypeReturn {
  types: string[];
  isLoading: boolean;
  error: string | null;
  getTypeConfig: (type: string) => Promise<any>;
  validateType: (type: string, data: any) => Promise<boolean>;
}

// ============================================================================
// HOOKS DE RELATÓRIOS
// ============================================================================

export interface UseReportsReturn {
  reports: Report[];
  isLoading: boolean;
  error: string | null;
  createReport: (report: Partial<Report>) => Promise<Report>;
  updateReport: (id: number, report: Partial<Report>) => Promise<Report>;
  deleteReport: (id: number) => Promise<void>;
  getReport: (id: number) => Promise<Report>;
  generateReport: (type: string, filters: Record<string, any>) => Promise<Report>;
}

export interface UseReportReturn {
  report: Report | null;
  isLoading: boolean;
  error: string | null;
  updateReport: (report: Partial<Report>) => Promise<Report>;
  deleteReport: () => Promise<void>;
  exportReport: (format: string) => Promise<void>;
  shareReport: () => Promise<void>;
}

export interface UseReportGeneratorReturn {
  types: string[];
  isLoading: boolean;
  error: string | null;
  generateReport: (type: string, filters: Record<string, any>) => Promise<Report>;
  getTypeConfig: (type: string) => Promise<any>;
  validateFilters: (type: string, filters: Record<string, any>) => Promise<boolean>;
}

// ============================================================================
// HOOKS DE MATERIAIS
// ============================================================================

export interface UseMaterialsReturn {
  materials: Material[];
  isLoading: boolean;
  error: string | null;
  createMaterial: (material: Partial<Material>) => Promise<Material>;
  updateMaterial: (id: number, material: Partial<Material>) => Promise<Material>;
  deleteMaterial: (id: number) => Promise<void>;
  getMaterial: (id: number) => Promise<Material>;
  searchMaterials: (query: string) => Promise<Material[]>;
  filterMaterials: (filters: Record<string, any>) => Promise<Material[]>;
}

export interface UseMaterialReturn {
  material: Material | null;
  isLoading: boolean;
  error: string | null;
  updateMaterial: (material: Partial<Material>) => Promise<Material>;
  deleteMaterial: () => Promise<void>;
  downloadMaterial: () => Promise<void>;
  shareMaterial: () => Promise<void>;
}

// ============================================================================
// HOOKS DE USUÁRIOS
// ============================================================================

export interface UseUsersReturn {
  users: User[];
  isLoading: boolean;
  error: string | null;
  createUser: (user: Partial<User>) => Promise<User>;
  updateUser: (id: number, user: Partial<User>) => Promise<User>;
  deleteUser: (id: number) => Promise<void>;
  suspendUser: (id: number) => Promise<void>;
  activateUser: (id: number) => Promise<void>;
  getUser: (id: number) => Promise<User>;
  searchUsers: (query: string) => Promise<User[]>;
  filterUsers: (filters: Record<string, any>) => Promise<User[]>;
}

export interface UseUserReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  updateUser: (user: Partial<User>) => Promise<User>;
  deleteUser: () => Promise<void>;
  suspendUser: () => Promise<void>;
  activateUser: () => Promise<void>;
  resetPassword: () => Promise<void>;
}

export interface UseUserProfileReturn {
  profile: User | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (profile: Partial<User>) => Promise<User>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  deleteAvatar: () => Promise<void>;
}

// ============================================================================
// HOOKS DE NOTIFICAÇÕES
// ============================================================================

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  getNotification: (id: number) => Promise<Notification>;
}

export interface UseNotificationReturn {
  notification: Notification | null;
  isLoading: boolean;
  error: string | null;
  markAsRead: () => Promise<void>;
  deleteNotification: () => Promise<void>;
}

// ============================================================================
// HOOKS DE MENSAGENS
// ============================================================================

export interface UseMessagesReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: Partial<Message>) => Promise<Message>;
  updateMessage: (id: number, message: Partial<Message>) => Promise<Message>;
  deleteMessage: (id: number) => Promise<void>;
  getMessage: (id: number) => Promise<Message>;
  replyToMessage: (id: number, reply: Partial<Message>) => Promise<Message>;
}

export interface UseMessageReturn {
  message: Message | null;
  isLoading: boolean;
  error: string | null;
  updateMessage: (message: Partial<Message>) => Promise<Message>;
  deleteMessage: () => Promise<void>;
  replyToMessage: (reply: Partial<Message>) => Promise<Message>;
}

// ============================================================================
// HOOKS DE ESTATÍSTICAS
// ============================================================================

export interface UseStatisticsReturn {
  statistics: SalesStatistics | null;
  isLoading: boolean;
  error: string | null;
  period: {
    start: Date;
    end: Date;
  };
  updatePeriod: (start: Date, end: Date) => Promise<void>;
  exportStatistics: (format: string) => Promise<void>;
  refreshStatistics: () => Promise<void>;
}

export interface UsePerformanceMetricsReturn {
  metrics: PerformanceMetrics[];
  isLoading: boolean;
  error: string | null;
  period: {
    start: Date;
    end: Date;
  };
  updatePeriod: (start: Date, end: Date) => Promise<void>;
  exportMetrics: (format: string) => Promise<void>;
  refreshMetrics: () => Promise<void>;
}

// ============================================================================
// HOOKS DE FORMULÁRIOS
// ============================================================================

export interface UseFormReturn<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  setErrors: (errors: Record<string, string>) => void;
  setTouched: (field: keyof T, touched: boolean) => void;
  setTouchedAll: (touched: Record<string, boolean>) => void;
  handleSubmit: (onSubmit: (values: T) => Promise<void>) => Promise<void>;
  handleReset: () => void;
  validate: () => Promise<boolean>;
  validateField: (field: keyof T) => Promise<boolean>;
}

export interface UseFormFieldReturn<T> {
  value: any;
  error: string | undefined;
  touched: boolean;
  setValue: (value: any) => void;
  setError: (error: string) => void;
  setTouched: (touched: boolean) => void;
  handleBlur: () => void;
  handleChange: (value: any) => void;
}

// ============================================================================
// HOOKS DE ESTADO LOCAL
// ============================================================================

export interface UseLocalStorageReturn<T> {
  value: T | null;
  setValue: (value: T) => void;
  removeValue: () => void;
  clearStorage: () => void;
}

export interface UseSessionStorageReturn<T> {
  value: T | null;
  setValue: (value: T) => void;
  removeValue: () => void;
  clearStorage: () => void;
}

export interface UseToggleReturn {
  value: boolean;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
}

export interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setCount: (count: number) => void;
}

export interface UseArrayReturn<T> {
  array: T[];
  add: (item: T) => void;
  remove: (index: number) => void;
  update: (index: number, item: T) => void;
  clear: () => void;
  setArray: (array: T[]) => void;
}

// ============================================================================
// HOOKS DE UI E INTERAÇÃO
// ============================================================================

export interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export interface UseDialogReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export interface UseTooltipReturn {
  isOpen: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
}

export interface UsePopoverReturn {
  isOpen: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
}

export interface UseDropdownReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export interface UseTabsReturn {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: string[];
}

export interface UseAccordionReturn {
  openItems: string[];
  toggleItem: (item: string) => void;
  openItem: (item: string) => void;
  closeItem: (item: string) => void;
  openAll: () => void;
  closeAll: () => void;
}

export interface UseWizardReturn {
  currentStep: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  complete: () => void;
}

// ============================================================================
// HOOKS DE VALIDAÇÃO
// ============================================================================

export interface UseValidationReturn<T> {
  errors: Record<string, string>;
  isValid: boolean;
  validate: (data: T) => Promise<boolean>;
  validateField: (field: keyof T, value: any) => Promise<boolean>;
  clearErrors: () => void;
  setError: (field: keyof T, error: string) => void;
  setErrors: (errors: Record<string, string>) => void;
}

export interface UseFieldValidationReturn {
  error: string | undefined;
  isValid: boolean;
  validate: (value: any) => Promise<boolean>;
  clearError: () => void;
  setError: (error: string) => void;
}

// ============================================================================
// HOOKS DE UPLOAD E ARQUIVOS
// ============================================================================

export interface UseFileUploadReturn {
  files: File[];
  isLoading: boolean;
  error: string | null;
  upload: (files: File[]) => Promise<void>;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  validateFiles: (files: File[]) => boolean;
}

export interface UseImageUploadReturn {
  images: File[];
  isLoading: boolean;
  error: string | null;
  upload: (files: File[]) => Promise<void>;
  removeImage: (index: number) => void;
  clearImages: () => void;
  validateImages: (files: File[]) => boolean;
  compressImages: (files: File[]) => Promise<File[]>;
}

export interface UseFilePreviewReturn {
  preview: string | null;
  isLoading: boolean;
  error: string | null;
  generatePreview: (file: File) => Promise<void>;
  clearPreview: () => void;
}

// ============================================================================
// HOOKS DE BUSCA E FILTROS
// ============================================================================

export interface UseSearchReturn {
  query: string;
  results: any[];
  isLoading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
  suggestions: string[];
  setQuery: (query: string) => void;
}

export interface UseFiltersReturn<T> {
  filters: T;
  filteredData: any[];
  isLoading: boolean;
  error: string | null;
  setFilter: (key: keyof T, value: any) => void;
  setFilters: (filters: Partial<T>) => void;
  clearFilters: () => void;
  resetFilters: () => void;
  applyFilters: () => Promise<void>;
}

export interface UseSortReturn<T> {
  sortBy: keyof T | null;
  sortDirection: 'asc' | 'desc';
  sortedData: any[];
  setSortBy: (field: keyof T) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
  toggleSort: (field: keyof T) => void;
  clearSort: () => void;
}

export interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
}

// ============================================================================
// HOOKS DE DRAG AND DROP
// ============================================================================

export interface UseDragDropReturn<T> {
  items: T[];
  draggedItem: T | null;
  isDragging: boolean;
  reorderItems: (fromIndex: number, toIndex: number) => void;
  startDrag: (item: T) => void;
  endDrag: () => void;
  moveItem: (fromIndex: number, toIndex: number) => void;
}

export interface UseDraggableReturn {
  isDragging: boolean;
  isOver: boolean;
  startDrag: () => void;
  endDrag: () => void;
}

export interface UseDroppableReturn {
  isOver: boolean;
  canDrop: boolean;
  onDrop: (item: any) => void;
}

// ============================================================================
// HOOKS DE PERFORMANCE
// ============================================================================

export interface UseDebounceReturn<T> {
  value: T;
  debouncedValue: T;
  setValue: (value: T) => void;
}

export interface UseThrottleReturn<T> {
  value: T;
  throttledValue: T;
  setValue: (value: T) => void;
}

export interface UseMemoizedReturn<T> {
  value: T;
  dependencies: any[];
  updateValue: (value: T) => void;
  updateDependencies: (dependencies: any[]) => void;
}

// ============================================================================
// HOOKS DE TEMPO E DATAS
// ============================================================================

export interface UseTimerReturn {
  time: number;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  pause: () => void;
  resume: () => void;
}

export interface UseCountdownReturn {
  time: number;
  isRunning: boolean;
  isFinished: boolean;
  start: (duration: number) => void;
  stop: () => void;
  reset: () => void;
  pause: () => void;
  resume: () => void;
}

export interface UseDateReturn {
  date: Date;
  setDate: (date: Date) => void;
  addDays: (days: number) => void;
  subtractDays: (days: number) => void;
  addMonths: (months: number) => void;
  subtractMonths: (months: number) => void;
  addYears: (years: number) => void;
  subtractYears: (years: number) => void;
  format: (format: string) => string;
}

// ============================================================================
// HOOKS DE REDIMENSIONAMENTO
// ============================================================================

export interface UseWindowSizeReturn {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export interface UseElementSizeReturn {
  width: number;
  height: number;
  ref: React.RefObject<HTMLElement>;
}

export interface UseScrollReturn {
  scrollX: number;
  scrollY: number;
  scrollDirection: 'up' | 'down' | null;
  isScrolling: boolean;
}

// ============================================================================
// HOOKS DE CLIPBOARD
// ============================================================================

export interface UseClipboardReturn {
  value: string;
  copied: boolean;
  copy: (text: string) => Promise<void>;
  clear: () => void;
}

// ============================================================================
// HOOKS DE GEOLOCALIZAÇÃO
// ============================================================================

export interface UseGeolocationReturn {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  isLoading: boolean;
  getCurrentPosition: () => Promise<void>;
  watchPosition: () => void;
  clearWatch: () => void;
}

// ============================================================================
// HOOKS DE MÍDIA
// ============================================================================

export interface UseMediaQueryReturn {
  matches: boolean;
  mediaQuery: string;
}

export interface UseMediaDevicesReturn {
  devices: MediaDeviceInfo[];
  selectedDevice: MediaDeviceInfo | null;
  setSelectedDevice: (device: MediaDeviceInfo) => void;
  requestPermission: () => Promise<void>;
}

// ============================================================================
// HOOKS DE WEBSOCKET
// ============================================================================

export interface UseWebSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  sendMessage: (message: any) => void;
  connect: () => void;
  disconnect: () => void;
  lastMessage: any;
}

// ============================================================================
// HOOKS DE NOTIFICAÇÕES DO NAVEGADOR
// ============================================================================

export interface UseNotificationReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
  showNotification: (title: string, options?: NotificationOptions) => void;
}

// ============================================================================
// HOOKS DE THEME E DARK MODE
// ============================================================================

export interface UseThemeReturn {
  theme: 'light' | 'dark';
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export interface UseDarkModeReturn {
  isDark: boolean;
  toggle: () => void;
  enable: () => void;
  disable: () => void;
}

// ============================================================================
// HOOKS DE IDIOMA E INTERNACIONALIZAÇÃO
// ============================================================================

export interface UseLanguageReturn {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, params?: Record<string, any>) => string;
  availableLanguages: string[];
}

export interface UseTranslationReturn {
  t: (key: string, params?: Record<string, any>) => string;
  language: string;
  setLanguage: (language: string) => void;
  isLoading: boolean;
}

// ============================================================================
// HOOKS DE ANALYTICS
// ============================================================================

export interface UseAnalyticsReturn {
  trackEvent: (event: string, properties?: Record<string, any>) => void;
  trackPageView: (page: string) => void;
  trackUser: (userId: string, properties?: Record<string, any>) => void;
  isEnabled: boolean;
  enable: () => void;
  disable: () => void;
}

// ============================================================================
// HOOKS DE CRÉDITOS E PAGAMENTOS
// ============================================================================

export interface UseCreditsReturn {
  credits: number;
  isLoading: boolean;
  error: string | null;
  addCredits: (amount: number) => Promise<void>;
  useCredits: (amount: number) => Promise<void>;
  getCreditHistory: () => Promise<any[]>;
  getCreditBalance: () => Promise<number>;
}

export interface UsePaymentReturn {
  isLoading: boolean;
  error: string | null;
  createPayment: (amount: number, currency: string) => Promise<any>;
  confirmPayment: (paymentId: string) => Promise<void>;
  cancelPayment: (paymentId: string) => Promise<void>;
  getPaymentHistory: () => Promise<any[]>;
}

// ============================================================================
// HOOKS DE CACHE
// ============================================================================

export interface UseCacheReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  setData: (data: T) => void;
  clearCache: () => void;
  refresh: () => Promise<void>;
  isStale: boolean;
}

export interface UseLocalCacheReturn<T> {
  data: T | null;
  setData: (data: T) => void;
  clearCache: () => void;
  hasData: boolean;
  isExpired: boolean;
}

// ============================================================================
// HOOKS DE ERRO E BOUNDARY
// ============================================================================

export interface UseErrorBoundaryReturn {
  error: Error | null;
  errorInfo: any;
  resetError: () => void;
  hasError: boolean;
}

export interface UseErrorHandlerReturn {
  error: Error | null;
  setError: (error: Error) => void;
  clearError: () => void;
  hasError: boolean;
}

// ============================================================================
// HOOKS DE LOADING E ESTADOS
// ============================================================================

export interface UseLoadingReturn {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>;
}

export interface UseAsyncReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

// ============================================================================
// HOOKS DE UTILITÁRIOS
// ============================================================================

export interface UsePreviousReturn<T> {
  value: T | undefined;
  currentValue: T;
}

export interface UseMountReturn {
  isMounted: boolean;
}

export interface UseUnmountReturn {
  isUnmounted: boolean;
}

export interface UseUpdateEffectReturn {
  dependencies: any[];
  effect: () => void | (() => void);
}

export interface UseIsomorphicLayoutEffectReturn {
  effect: () => void | (() => void);
  deps: any[];
} 