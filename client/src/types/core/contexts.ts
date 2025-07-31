/**
 * Tipos para Contextos React - Interfaces para todos os contextos do sistema
 * Centraliza tipos de estado e providers para contextos React
 */

import { ReactNode } from 'react';
import { 
  User, 
  Supplier, 
  Material, 
  Agent, 
  Simulation,
  Report,
  Notification,
  Message,
  ActivityLog
} from './domain';
import { Product } from './product';

// ============================================================================
// CONTEXTO DE AUTENTICAÇÃO
// ============================================================================

export interface AuthContextValue {
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

export interface AuthProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONTEXTO DE PERMISSÕES
// ============================================================================

export interface PermissionsContextValue {
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  permissions: string[];
  roles: string[];
  isLoading: boolean;
  error: string | null;
  refreshPermissions: () => Promise<void>;
}

export interface PermissionsProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONTEXTO DE NOTIFICAÇÕES
// ============================================================================

export interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  addNotification: (notification: Partial<Notification>) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export interface NotificationsProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONTEXTO DE TOAST
// ============================================================================

export interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (toast: Partial<ToastItem>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
}

export interface ToastProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONTEXTO DE THEME
// ============================================================================

export interface ThemeContextValue {
  theme: 'light' | 'dark';
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark';
}

// ============================================================================
// CONTEXTO DE IDIOMA
// ============================================================================

export interface LanguageContextValue {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, params?: Record<string, any>) => string;
  availableLanguages: string[];
}

export interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: string;
}

// ============================================================================
// CONTEXTO DE CRÉDITOS
// ============================================================================

export interface CreditsContextValue {
  credits: number;
  isLoading: boolean;
  error: string | null;
  addCredits: (amount: number) => Promise<void>;
  useCredits: (amount: number) => Promise<void>;
  getCreditHistory: () => Promise<any[]>;
  getCreditBalance: () => Promise<number>;
  refreshCredits: () => Promise<void>;
}

export interface CreditsProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONTEXTO DE AGENTES
// ============================================================================

export interface AgentsContextValue {
  agents: Agent[];
  isLoading: boolean;
  error: string | null;
  createAgent: (agent: Partial<Agent>) => Promise<Agent>;
  updateAgent: (id: number, agent: Partial<Agent>) => Promise<Agent>;
  deleteAgent: (id: number) => Promise<void>;
  getAgent: (id: number) => Promise<Agent>;
  runAgent: (id: number, input: Record<string, any>) => Promise<any>;
  refreshAgents: () => Promise<void>;
}

export interface AgentsProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONTEXTO DE PRODUTOS
// ============================================================================

export interface ProductsContextValue {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  createProduct: (product: Partial<Product>) => Promise<Product>;
  updateProduct: (id: number, product: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: number) => Promise<void>;
  getProduct: (id: number) => Promise<Product>;
  searchProducts: (query: string) => Promise<Product[]>;
  filterProducts: (filters: Record<string, any>) => Promise<Product[]>;
  refreshProducts: () => Promise<void>;
}

export interface ProductsProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONTEXTO DE FORNECEDORES
// ============================================================================

export interface SuppliersContextValue {
  suppliers: Supplier[];
  isLoading: boolean;
  error: string | null;
  createSupplier: (supplier: Partial<Supplier>) => Promise<Supplier>;
  updateSupplier: (id: number, supplier: Partial<Supplier>) => Promise<Supplier>;
  deleteSupplier: (id: number) => Promise<void>;
  getSupplier: (id: number) => Promise<Supplier>;
  searchSuppliers: (query: string) => Promise<Supplier[]>;
  filterSuppliers: (filters: Record<string, any>) => Promise<Supplier[]>;
  refreshSuppliers: () => Promise<void>;
}

export interface SuppliersProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONTEXTO DE SIMULAÇÕES
// ============================================================================

export interface SimulationsContextValue {
  simulations: Simulation[];
  isLoading: boolean;
  error: string | null;
  createSimulation: (simulation: Partial<Simulation>) => Promise<Simulation>;
  updateSimulation: (id: number, simulation: Partial<Simulation>) => Promise<Simulation>;
  deleteSimulation: (id: number) => Promise<void>;
  getSimulation: (id: number) => Promise<Simulation>;
  duplicateSimulation: (id: number) => Promise<Simulation>;
  runSimulation: (id: number) => Promise<any>;
  refreshSimulations: () => Promise<void>;
}

export interface SimulationsProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONTEXTO DE RELATÓRIOS
// ============================================================================

export interface ReportsContextValue {
  reports: Report[];
  isLoading: boolean;
  error: string | null;
  createReport: (report: Partial<Report>) => Promise<Report>;
  updateReport: (id: number, report: Partial<Report>) => Promise<Report>;
  deleteReport: (id: number) => Promise<void>;
  getReport: (id: number) => Promise<Report>;
  generateReport: (type: string, filters: Record<string, any>) => Promise<Report>;
  refreshReports: () => Promise<void>;
}

export interface ReportsProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONTEXTO DE MATERIAIS
// ============================================================================

export interface MaterialsContextValue {
  materials: Material[];
  isLoading: boolean;
  error: string | null;
  createMaterial: (material: Partial<Material>) => Promise<Material>;
  updateMaterial: (id: number, material: Partial<Material>) => Promise<Material>;
  deleteMaterial: (id: number) => Promise<void>;
  getMaterial: (id: number) => Promise<Material>;
  searchMaterials: (query: string) => Promise<Material[]>;
  filterMaterials: (filters: Record<string, any>) => Promise<Material[]>;
  refreshMaterials: () => Promise<void>;
}

export interface MaterialsProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONTEXTO DE USUÁRIOS
// ============================================================================

export interface UsersContextValue {
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
  refreshUsers: () => Promise<void>;
}

export interface UsersProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONTEXTO DE MENSAGENS
// ============================================================================

export interface MessagesContextValue {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: Partial<Message>) => Promise<Message>;
  updateMessage: (id: number, message: Partial<Message>) => Promise<Message>;
  deleteMessage: (id: number) => Promise<void>;
  getMessage: (id: number) => Promise<Message>;
  replyToMessage: (id: number, reply: Partial<Message>) => Promise<Message>;
  refreshMessages: () => Promise<void>;
}

export interface MessagesProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONTEXTO DE ATIVIDADES
// ============================================================================

export interface ActivitiesContextValue {
  activities: ActivityLog[];
  isLoading: boolean;
  error: string | null;
  addActivity: (activity: Partial<ActivityLog>) => Promise<void>;
  getActivities: (filters?: Record<string, any>) => Promise<ActivityLog[]>;
  refreshActivities: () => Promise<void>;
}

export interface ActivitiesProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONTEXTO DE CONFIGURAÇÕES
// ============================================================================

export interface SettingsContextValue {
  settings: Record<string, any>;
  isLoading: boolean;
  error: string | null;
  updateSetting: (key: string, value: any) => Promise<void>;
  getSetting: (key: string) => any;
  refreshSettings: () => Promise<void>;
}

export interface SettingsProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONTEXTO DE CACHE
// ============================================================================

export interface CacheContextValue {
  cache: Map<string, any>;
  setCache: (key: string, value: any, ttl?: number) => void;
  getCache: (key: string) => any;
  removeCache: (key: string) => void;
  clearCache: () => void;
  hasCache: (key: string) => boolean;
}

export interface CacheProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONTEXTO DE LOADING
// ============================================================================

export interface LoadingContextValue {
  isLoading: boolean;
  loadingStates: Record<string, boolean>;
  startLoading: (key?: string) => void;
  stopLoading: (key?: string) => void;
  setLoading: (key: string, loading: boolean) => void;
}

export interface LoadingProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONTEXTO DE ERRO
// ============================================================================

export interface ErrorContextValue {
  error: Error | null;
  errorInfo: any;
  setError: (error: Error, errorInfo?: any) => void;
  clearError: () => void;
  hasError: boolean;
}

export interface ErrorProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONTEXTO DE MODAL
// ============================================================================

export interface ModalContextValue {
  modals: ModalItem[];
  openModal: (modal: Partial<ModalItem>) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
}

export interface ModalItem {
  id: string;
  component: ReactNode;
  props?: Record<string, any>;
  onClose?: () => void;
}

export interface ModalProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONTEXTO DE DIALOG
// ============================================================================

export interface DialogContextValue {
  dialogs: DialogItem[];
  openDialog: (dialog: Partial<DialogItem>) => void;
  closeDialog: (id: string) => void;
  closeAllDialogs: () => void;
}

export interface DialogItem {
  id: string;
  component: ReactNode;
  props?: Record<string, any>;
  onClose?: () => void;
}

export interface DialogProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONTEXTO DE SIDEBAR
// ============================================================================

export interface SidebarContextValue {
  isOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

export interface SidebarProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONTEXTO DE BREADCRUMB
// ============================================================================

export interface BreadcrumbContextValue {
  items: BreadcrumbItem[];
  addItem: (item: BreadcrumbItem) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
  setItems: (items: BreadcrumbItem[]) => void;
}

export interface BreadcrumbItem {
  id: string;
  label: string;
  path?: string;
  icon?: string;
}

export interface BreadcrumbProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONTEXTO DE PAGINAÇÃO
// ============================================================================

export interface PaginationContextValue {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
}

export interface PaginationProviderProps {
  children: ReactNode;
  initialPage?: number;
  initialItemsPerPage?: number;
}

// ============================================================================
// CONTEXTO DE FILTROS
// ============================================================================

export interface FiltersContextValue {
  filters: Record<string, any>;
  setFilter: (key: string, value: any) => void;
  setFilters: (filters: Record<string, any>) => void;
  clearFilters: () => void;
  resetFilters: () => void;
  hasFilters: boolean;
}

export interface FiltersProviderProps {
  children: ReactNode;
  initialFilters?: Record<string, any>;
}

// ============================================================================
// CONTEXTO DE SORT
// ============================================================================

export interface SortContextValue {
  sortBy: string | null;
  sortDirection: 'asc' | 'desc';
  setSortBy: (field: string) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
  toggleSort: (field: string) => void;
  clearSort: () => void;
}

export interface SortProviderProps {
  children: ReactNode;
  initialSortBy?: string;
  initialSortDirection?: 'asc' | 'desc';
}

// ============================================================================
// CONTEXTO DE SEARCH
// ============================================================================

export interface SearchContextValue {
  query: string;
  results: any[];
  isLoading: boolean;
  setQuery: (query: string) => void;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
  hasResults: boolean;
}

export interface SearchProviderProps {
  children: ReactNode;
  searchFunction?: (query: string) => Promise<any[]>;
}

// ============================================================================
// CONTEXTO DE DRAG AND DROP
// ============================================================================

export interface DragDropContextValue {
  draggedItem: any | null;
  dropTarget: any | null;
  isDragging: boolean;
  startDrag: (item: any) => void;
  endDrag: () => void;
  setDropTarget: (target: any) => void;
  clearDropTarget: () => void;
}

export interface DragDropProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONTEXTO DE WEBSOCKET
// ============================================================================

export interface WebSocketContextValue {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  sendMessage: (message: any) => void;
  connect: () => void;
  disconnect: () => void;
  lastMessage: any;
}

export interface WebSocketProviderProps {
  children: ReactNode;
  url?: string;
  autoConnect?: boolean;
}

// ============================================================================
// CONTEXTO DE ANALYTICS
// ============================================================================

export interface AnalyticsContextValue {
  trackEvent: (event: string, properties?: Record<string, any>) => void;
  trackPageView: (page: string) => void;
  trackUser: (userId: string, properties?: Record<string, any>) => void;
  isEnabled: boolean;
  enable: () => void;
  disable: () => void;
}

export interface AnalyticsProviderProps {
  children: ReactNode;
  enabled?: boolean;
}

// ============================================================================
// CONTEXTO DE PAGAMENTOS
// ============================================================================

export interface PaymentContextValue {
  isLoading: boolean;
  error: string | null;
  createPayment: (amount: number, currency: string) => Promise<any>;
  confirmPayment: (paymentId: string) => Promise<void>;
  cancelPayment: (paymentId: string) => Promise<void>;
  getPaymentHistory: () => Promise<any[]>;
}

export interface PaymentProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONTEXTO COMBINADO
// ============================================================================

export interface AppContextValue {
  auth: AuthContextValue;
  permissions: PermissionsContextValue;
  notifications: NotificationsContextValue;
  toast: ToastContextValue;
  theme: ThemeContextValue;
  language: LanguageContextValue;
  credits: CreditsContextValue;
  loading: LoadingContextValue;
  error: ErrorContextValue;
  modal: ModalContextValue;
  dialog: DialogContextValue;
  sidebar: SidebarContextValue;
  breadcrumb: BreadcrumbContextValue;
  pagination: PaginationContextValue;
  filters: FiltersContextValue;
  sort: SortContextValue;
  search: SearchContextValue;
  dragDrop: DragDropContextValue;
  websocket: WebSocketContextValue;
  analytics: AnalyticsContextValue;
  payment: PaymentContextValue;
}

export interface AppProviderProps {
  children: ReactNode;
} 