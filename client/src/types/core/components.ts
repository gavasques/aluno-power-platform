/**
 * Tipos para Componentes React - Interfaces para todos os componentes principais
 * Centraliza props e tipos específicos para componentes do sistema
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
// COMPONENTES DE LAYOUT E NAVEGAÇÃO
// ============================================================================

export interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showHeader?: boolean;
  showSidebar?: boolean;
  showFooter?: boolean;
  className?: string;
}

export interface HeaderProps {
  user?: User;
  notifications?: Notification[];
  onLogout?: () => void;
  onNotificationClick?: (notification: Notification) => void;
  className?: string;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  currentPath?: string;
  className?: string;
}

export interface NavigationProps {
  items: NavigationItem[];
  currentPath?: string;
  onItemClick?: (item: NavigationItem) => void;
  className?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  badge?: number;
  children?: NavigationItem[];
  permissions?: string[];
  isActive?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onItemClick?: (item: BreadcrumbItem) => void;
  className?: string;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive?: boolean;
  icon?: string;
}

export interface FooterProps {
  links?: FooterLink[];
  copyright?: string;
  className?: string;
}

export interface FooterLink {
  label: string;
  url: string;
  external?: boolean;
}

// ============================================================================
// COMPONENTES DE DASHBOARD
// ============================================================================

export interface DashboardProps {
  user: User;
  stats?: DashboardStats;
  recentActivity?: ActivityLog[];
  notifications?: Notification[];
  onRefresh?: () => void;
  className?: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalRevenue: number;
  totalOrders: number;
  activeAgents: number;
  pendingTasks: number;
  creditBalance: number;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  onClick?: () => void;
  className?: string;
}

export interface ActivityFeedProps {
  activities: ActivityLog[];
  maxItems?: number;
  onItemClick?: (activity: ActivityLog) => void;
  className?: string;
}

export interface ActivityItemProps {
  activity: ActivityLog;
  onClick?: () => void;
  className?: string;
}

// ============================================================================
// COMPONENTES DE PRODUTOS
// ============================================================================

export interface ProductListProps {
  products: Product[];
  loading?: boolean;
  error?: string;
  onProductClick?: (product: Product) => void;
  onProductEdit?: (product: Product) => void;
  onProductDelete?: (product: Product) => void;
  onProductDuplicate?: (product: Product) => void;
  showActions?: boolean;
  showPagination?: boolean;
  className?: string;
}

export interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onDuplicate?: (product: Product) => void;
  onView?: (product: Product) => void;
  showActions?: boolean;
  className?: string;
}

export interface ProductFormProps {
  product?: Product;
  onSubmit: (data: Partial<Product>) => void;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

export interface ProductDetailProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onDuplicate?: (product: Product) => void;
  showActions?: boolean;
  className?: string;
}

export interface ProductPricingProps {
  product: Product;
  calculation?: PricingCalculation;
  onCalculate?: (productId: number) => void;
  onSave?: (pricing: PricingCalculation) => void;
  loading?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENTES DE FORNECEDORES
// ============================================================================

export interface SupplierListProps {
  suppliers: Supplier[];
  loading?: boolean;
  error?: string;
  onSupplierClick?: (supplier: Supplier) => void;
  onSupplierEdit?: (supplier: Supplier) => void;
  onSupplierDelete?: (supplier: Supplier) => void;
  showActions?: boolean;
  className?: string;
}

export interface SupplierCardProps {
  supplier: Supplier;
  onEdit?: (supplier: Supplier) => void;
  onDelete?: (supplier: Supplier) => void;
  onView?: (supplier: Supplier) => void;
  showActions?: boolean;
  className?: string;
}

export interface SupplierFormProps {
  supplier?: Supplier;
  onSubmit: (data: Partial<Supplier>) => void;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

export interface SupplierDetailProps {
  supplier: Supplier;
  onEdit?: (supplier: Supplier) => void;
  onDelete?: (supplier: Supplier) => void;
  showActions?: boolean;
  className?: string;
}

export interface ContactListProps {
  contacts: any[];
  supplierId?: number;
  onContactEdit?: (contact: any) => void;
  onContactDelete?: (contact: any) => void;
  onContactAdd?: (supplierId: number) => void;
  className?: string;
}

export interface ConversationListProps {
  conversations: any[];
  supplierId?: number;
  onConversationClick?: (conversation: any) => void;
  onConversationAdd?: (supplierId: number) => void;
  className?: string;
}

// ============================================================================
// COMPONENTES DE AGENTES DE IA
// ============================================================================

export interface AgentListProps {
  agents: Agent[];
  loading?: boolean;
  error?: string;
  onAgentClick?: (agent: Agent) => void;
  onAgentEdit?: (agent: Agent) => void;
  onAgentDelete?: (agent: Agent) => void;
  onAgentRun?: (agent: Agent) => void;
  showActions?: boolean;
  className?: string;
}

export interface AgentCardProps {
  agent: Agent;
  onEdit?: (agent: Agent) => void;
  onDelete?: (agent: Agent) => void;
  onRun?: (agent: Agent) => void;
  onView?: (agent: Agent) => void;
  showActions?: boolean;
  className?: string;
}

export interface AgentFormProps {
  agent?: Agent;
  onSubmit: (data: Partial<Agent>) => void;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

export interface AgentRunnerProps {
  agent: Agent;
  onRun: (input: Record<string, any>) => void;
  onCancel?: () => void;
  loading?: boolean;
  result?: any;
  error?: string;
  className?: string;
}

export interface AgentSessionProps {
  session: any;
  onView?: (session: any) => void;
  onDelete?: (session: any) => void;
  className?: string;
}

// ============================================================================
// COMPONENTES DE SIMULAÇÕES
// ============================================================================

export interface SimulationListProps {
  simulations: Simulation[];
  loading?: boolean;
  error?: string;
  onSimulationClick?: (simulation: Simulation) => void;
  onSimulationEdit?: (simulation: Simulation) => void;
  onSimulationDelete?: (simulation: Simulation) => void;
  onSimulationDuplicate?: (simulation: Simulation) => void;
  showActions?: boolean;
  className?: string;
}

export interface SimulationCardProps {
  simulation: Simulation;
  onEdit?: (simulation: Simulation) => void;
  onDelete?: (simulation: Simulation) => void;
  onDuplicate?: (simulation: Simulation) => void;
  onView?: (simulation: Simulation) => void;
  showActions?: boolean;
  className?: string;
}

export interface SimulationFormProps {
  simulation?: Simulation;
  type: string;
  onSubmit: (data: Partial<Simulation>) => void;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

export interface SimulationResultProps {
  simulation: Simulation;
  onExport?: (format: string) => void;
  onShare?: () => void;
  className?: string;
}

// ============================================================================
// COMPONENTES DE RELATÓRIOS
// ============================================================================

export interface ReportListProps {
  reports: Report[];
  loading?: boolean;
  error?: string;
  onReportClick?: (report: Report) => void;
  onReportEdit?: (report: Report) => void;
  onReportDelete?: (report: Report) => void;
  onReportGenerate?: (type: string) => void;
  showActions?: boolean;
  className?: string;
}

export interface ReportCardProps {
  report: Report;
  onEdit?: (report: Report) => void;
  onDelete?: (report: Report) => void;
  onDownload?: (report: Report) => void;
  onView?: (report: Report) => void;
  showActions?: boolean;
  className?: string;
}

export interface ReportGeneratorProps {
  type: string;
  filters?: Record<string, any>;
  onGenerate: (filters: Record<string, any>) => void;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

export interface ReportViewerProps {
  report: Report;
  onExport?: (format: string) => void;
  onShare?: () => void;
  className?: string;
}

// ============================================================================
// COMPONENTES DE MATERIAIS
// ============================================================================

export interface MaterialListProps {
  materials: Material[];
  loading?: boolean;
  error?: string;
  onMaterialClick?: (material: Material) => void;
  onMaterialEdit?: (material: Material) => void;
  onMaterialDelete?: (material: Material) => void;
  onMaterialDownload?: (material: Material) => void;
  showActions?: boolean;
  className?: string;
}

export interface MaterialCardProps {
  material: Material;
  onEdit?: (material: Material) => void;
  onDelete?: (material: Material) => void;
  onDownload?: (material: Material) => void;
  onView?: (material: Material) => void;
  showActions?: boolean;
  className?: string;
}

export interface MaterialFormProps {
  material?: Material;
  onSubmit: (data: Partial<Material>) => void;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

export interface MaterialViewerProps {
  material: Material;
  onDownload?: (material: Material) => void;
  className?: string;
}

// ============================================================================
// COMPONENTES DE USUÁRIOS
// ============================================================================

export interface UserListProps {
  users: User[];
  loading?: boolean;
  error?: string;
  onUserClick?: (user: User) => void;
  onUserEdit?: (user: User) => void;
  onUserDelete?: (user: User) => void;
  onUserSuspend?: (user: User) => void;
  showActions?: boolean;
  className?: string;
}

export interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onSuspend?: (user: User) => void;
  onView?: (user: User) => void;
  showActions?: boolean;
  className?: string;
}

export interface UserFormProps {
  user?: User;
  onSubmit: (data: Partial<User>) => void;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

export interface UserProfileProps {
  user: User;
  onEdit?: (user: User) => void;
  className?: string;
}

// ============================================================================
// COMPONENTES DE NOTIFICAÇÕES
// ============================================================================

export interface NotificationListProps {
  notifications: Notification[];
  loading?: boolean;
  error?: string;
  onNotificationClick?: (notification: Notification) => void;
  onNotificationMarkAsRead?: (notification: Notification) => void;
  onNotificationDelete?: (notification: Notification) => void;
  showActions?: boolean;
  className?: string;
}

export interface NotificationItemProps {
  notification: Notification;
  onClick?: (notification: Notification) => void;
  onMarkAsRead?: (notification: Notification) => void;
  onDelete?: (notification: Notification) => void;
  className?: string;
}

export interface NotificationBellProps {
  notifications: Notification[];
  unreadCount: number;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAllAsRead?: () => void;
  className?: string;
}

// ============================================================================
// COMPONENTES DE MENSAGENS
// ============================================================================

export interface MessageListProps {
  messages: Message[];
  loading?: boolean;
  error?: string;
  onMessageClick?: (message: Message) => void;
  onMessageReply?: (message: Message) => void;
  onMessageDelete?: (message: Message) => void;
  showActions?: boolean;
  className?: string;
}

export interface MessageItemProps {
  message: Message;
  onClick?: (message: Message) => void;
  onReply?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  className?: string;
}

export interface MessageComposerProps {
  recipientId?: number;
  onSend: (message: Partial<Message>) => void;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

// ============================================================================
// COMPONENTES DE ESTATÍSTICAS
// ============================================================================

export interface StatisticsProps {
  data: SalesStatistics;
  period: {
    start: Date;
    end: Date;
  };
  onPeriodChange?: (period: { start: Date; end: Date }) => void;
  onExport?: (format: string) => void;
  className?: string;
}

export interface PerformanceChartProps {
  data: PerformanceMetrics[];
  type: 'line' | 'bar' | 'pie' | 'scatter';
  title: string;
  onDataPointClick?: (point: any) => void;
  className?: string;
}

export interface MetricsCardProps {
  title: string;
  value: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  format?: 'number' | 'currency' | 'percentage';
  icon?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  onClick?: () => void;
  className?: string;
}

// ============================================================================
// COMPONENTES DE FORMULÁRIOS
// ============================================================================

export interface FormFieldProps {
  label: string;
  name: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date' | 'file';
  value?: any;
  onChange?: (value: any) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  options?: Array<{ value: any; label: string; disabled?: boolean }>;
  className?: string;
}

export interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}

export interface FormActionsProps {
  onSubmit?: () => void;
  onCancel?: () => void;
  onReset?: () => void;
  submitText?: string;
  cancelText?: string;
  resetText?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENTES DE MODAIS E DIALOGS
// ============================================================================

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  loading?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENTES DE TABELAS
// ============================================================================

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  error?: string;
  onRowClick?: (row: T) => void;
  onRowSelect?: (row: T, selected: boolean) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  pagination?: TablePagination;
  onPageChange?: (page: number) => void;
  className?: string;
}

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T) => ReactNode;
  className?: string;
}

export interface TablePagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface TableRowProps<T = any> {
  row: T;
  columns: TableColumn<T>[];
  onRowClick?: (row: T) => void;
  onRowSelect?: (row: T, selected: boolean) => void;
  selected?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENTES DE FILTROS E BUSCA
// ============================================================================

export interface FilterProps {
  filters: FilterOption[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  onReset?: () => void;
  onApply?: () => void;
  className?: string;
}

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'dateRange' | 'number' | 'numberRange';
  options?: Array<{ value: any; label: string }>;
  placeholder?: string;
  required?: boolean;
}

export interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  className?: string;
}

// ============================================================================
// COMPONENTES DE CARREGAMENTO E ESTADOS
// ============================================================================

export interface LoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export interface ErrorProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
  className?: string;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export interface SkeletonProps {
  type: 'text' | 'title' | 'avatar' | 'button' | 'card' | 'table';
  lines?: number;
  className?: string;
}

// ============================================================================
// COMPONENTES DE UPLOAD E ARQUIVOS
// ============================================================================

export interface FileUploadProps {
  onUpload: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  loading?: boolean;
  error?: string;
  className?: string;
}

export interface FilePreviewProps {
  file: File | string;
  onRemove?: () => void;
  onDownload?: () => void;
  showActions?: boolean;
  className?: string;
}

export interface ImageUploadProps {
  onUpload: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  aspectRatio?: number;
  loading?: boolean;
  error?: string;
  className?: string;
}

// ============================================================================
// COMPONENTES DE TOAST E NOTIFICAÇÕES
// ============================================================================

export interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  className?: string;
}

export interface ToastContainerProps {
  toasts: ToastProps[];
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

// ============================================================================
// COMPONENTES DE TOOLTIP E POPOVER
// ============================================================================

export interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  className?: string;
}

export interface PopoverProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

// ============================================================================
// COMPONENTES DE BOTÕES E AÇÕES
// ============================================================================

export interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  className?: string;
}

export interface IconButtonProps {
  icon: string;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  disabled?: boolean;
  loading?: boolean;
  tooltip?: string;
  className?: string;
}

export interface ActionMenuProps {
  actions: ActionItem[];
  trigger: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export interface ActionItem {
  label: string;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

// ============================================================================
// COMPONENTES DE BADGES E STATUS
// ============================================================================

export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface StatusProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENTES DE AVATAR E PERFIL
// ============================================================================

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

export interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENTES DE CALENDÁRIO E DATAS
// ============================================================================

export interface CalendarProps {
  value?: Date;
  onChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  className?: string;
}

export interface DateRangeProps {
  startDate?: Date;
  endDate?: Date;
  onChange?: (startDate: Date, endDate: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

// ============================================================================
// COMPONENTES DE PAGINAÇÃO
// ============================================================================

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showItemsPerPage?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENTES DE PROGRESSO
// ============================================================================

export interface ProgressProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENTES DE ACCORDION
// ============================================================================

export interface AccordionProps {
  items: AccordionItem[];
  multiple?: boolean;
  defaultOpen?: string[];
  className?: string;
}

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
  disabled?: boolean;
}

// ============================================================================
// COMPONENTES DE TABS
// ============================================================================

export interface TabsProps {
  tabs: TabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
  icon?: string;
}

// ============================================================================
// COMPONENTES DE WIZARD
// ============================================================================

export interface WizardProps {
  steps: WizardStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete?: () => void;
  className?: string;
}

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
  disabled?: boolean;
  completed?: boolean;
}

// ============================================================================
// COMPONENTES DE DRAG AND DROP
// ============================================================================

export interface DragDropProps {
  items: any[];
  onReorder: (items: any[]) => void;
  onDrop?: (item: any, target: any) => void;
  renderItem: (item: any, index: number) => ReactNode;
  className?: string;
}

export interface DraggableProps {
  id: string;
  children: ReactNode;
  onDragStart?: (id: string) => void;
  onDragEnd?: (id: string) => void;
  className?: string;
}

export interface DroppableProps {
  id: string;
  children: ReactNode;
  onDrop?: (item: any) => void;
  className?: string;
} 