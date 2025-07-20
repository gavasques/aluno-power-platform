/**
 * Tipos de Domínio de Negócio - Entidades principais do sistema
 * Centraliza tipos específicos para o domínio de e-commerce e gestão empresarial
 */

import { SalesChannel, ChannelType } from './channel';
import { Product, ProductDimensions } from './product';

// ============================================================================
// ENTIDADES DE USUÁRIO E AUTENTICAÇÃO
// ============================================================================

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  subscription?: Subscription;
  credits: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  preferences?: UserPreferences;
}

export type UserRole = 'admin' | 'user' | 'moderator' | 'premium';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface UserPreferences {
  language: 'pt-BR' | 'en-US' | 'es-ES';
  currency: 'BRL' | 'USD' | 'EUR';
  timezone: string;
  notifications: NotificationSettings;
  theme: 'light' | 'dark' | 'auto';
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
  updates: boolean;
}

export interface Subscription {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
}

export type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

// ============================================================================
// ENTIDADES DE FORNECEDORES E PARCEIROS
// ============================================================================

export interface Supplier {
  id: number;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  contactPerson?: string;
  paymentTerms?: string;
  isActive: boolean;
  rating?: number;
  totalProducts?: number;
  createdAt: string;
  updatedAt: string;
  brands?: Brand[];
  contacts?: Contact[];
  conversations?: Conversation[];
  files?: SupplierFile[];
}

export interface Brand {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  supplierId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  supplierId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: number;
  subject: string;
  content: string;
  type: ConversationType;
  status: ConversationStatus;
  supplierId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export type ConversationType = 'email' | 'phone' | 'meeting' | 'whatsapp';
export type ConversationStatus = 'open' | 'closed' | 'pending' | 'follow_up';

export interface SupplierFile {
  id: number;
  name: string;
  type: FileType;
  url: string;
  size: number;
  supplierId: number;
  uploadedAt: string;
}

export type FileType = 'document' | 'image' | 'spreadsheet' | 'presentation' | 'other';

// ============================================================================
// ENTIDADES DE MATERIAIS E RECURSOS
// ============================================================================

export interface Material {
  id: number;
  title: string;
  description: string;
  type: MaterialType;
  accessLevel: AccessLevel;
  tags: string[];
  viewCount: number;
  downloadCount: number;
  uploadDate: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  duration?: number; // para vídeos
  size?: number; // em bytes
  isActive: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialType {
  id: number;
  name: string;
  icon: string;
  viewerType: 'download' | 'preview' | 'video' | 'document';
  allowedExtensions: string[];
  maxFileSize: number; // em bytes
  isActive: boolean;
}

export type AccessLevel = 'public' | 'private' | 'shared' | 'restricted';

// ============================================================================
// ENTIDADES DE AGENTES DE IA
// ============================================================================

export interface Agent {
  id: number;
  name: string;
  description: string;
  type: AgentType;
  provider: AIProvider;
  model: string;
  config: AgentConfig;
  isActive: boolean;
  costPerToken: number;
  maxTokens: number;
  createdAt: string;
  updatedAt: string;
}

export type AgentType = 
  | 'amazon_listing_optimizer'
  | 'html_description_generator'
  | 'bullet_points_generator'
  | 'customer_service'
  | 'negative_reviews_handler'
  | 'product_photography'
  | 'infographic_generator'
  | 'keyword_researcher'
  | 'competitor_analyzer'
  | 'pricing_optimizer';

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'deepseek' | 'xai';

export interface AgentConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  systemPrompt?: string;
  tools?: string[];
  customInstructions?: string;
}

export interface AgentSession {
  id: string;
  agentId: number;
  userId: number;
  status: SessionStatus;
  input: Record<string, any>;
  output?: Record<string, any>;
  tokensUsed: number;
  cost: number;
  processingTime: number;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export type SessionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

// ============================================================================
// ENTIDADES DE SIMULAÇÕES FINANCEIRAS
// ============================================================================

export interface Simulation {
  id: number;
  name: string;
  type: SimulationType;
  userId: number;
  data: SimulationData;
  results: SimulationResults;
  status: SimulationStatus;
  createdAt: string;
  updatedAt: string;
}

export type SimulationType = 
  | 'import_simplified'
  | 'import_formal'
  | 'simples_nacional'
  | 'investment_roi'
  | 'pricing_analysis'
  | 'cost_breakdown';

export interface SimulationData {
  // Dados específicos por tipo de simulação
  [key: string]: any;
}

export interface SimulationResults {
  summary: SimulationSummary;
  details: Record<string, any>;
  charts?: ChartData[];
  recommendations?: string[];
}

export interface SimulationSummary {
  totalCost: number;
  totalRevenue: number;
  profit: number;
  margin: number;
  roi: number;
  breakEvenPoint?: number;
}

export type SimulationStatus = 'draft' | 'completed' | 'archived';

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'scatter';
  title: string;
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
}

// ============================================================================
// ENTIDADES DE ANÁLISE E RELATÓRIOS
// ============================================================================

export interface Report {
  id: number;
  name: string;
  type: ReportType;
  userId: number;
  filters: ReportFilters;
  data: ReportData;
  format: ReportFormat;
  status: ReportStatus;
  createdAt: string;
  downloadedAt?: string;
}

export type ReportType = 
  | 'sales_analysis'
  | 'cost_analysis'
  | 'profitability'
  | 'competitor_analysis'
  | 'market_research'
  | 'performance_metrics';

export interface ReportFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  products?: number[];
  channels?: ChannelType[];
  suppliers?: number[];
  categories?: string[];
}

export interface ReportData {
  summary: ReportSummary;
  details: Record<string, any>;
  charts: ChartData[];
  insights: string[];
}

export interface ReportSummary {
  totalRecords: number;
  totalValue: number;
  averageValue: number;
  topPerformers: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
}

export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json';
export type ReportStatus = 'generating' | 'completed' | 'failed';

// ============================================================================
// ENTIDADES DE CONFIGURAÇÕES E PREFERÊNCIAS
// ============================================================================

export interface SystemConfig {
  id: number;
  key: string;
  value: any;
  type: ConfigType;
  description?: string;
  isPublic: boolean;
  updatedAt: string;
}

export type ConfigType = 'string' | 'number' | 'boolean' | 'json' | 'array';

export interface FeatureFlag {
  id: number;
  name: string;
  description: string;
  isEnabled: boolean;
  targetUsers?: UserRole[];
  targetPercentage?: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ENTIDADES DE AUDITORIA E LOGS
// ============================================================================

export interface AuditLog {
  id: number;
  userId: number;
  action: string;
  entity: string;
  entityId?: number;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: number;
  userId: number;
  type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export type ActivityType = 
  | 'login'
  | 'logout'
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'import'
  | 'simulation'
  | 'agent_usage'
  | 'subscription_change';

// ============================================================================
// TIPOS UTILITÁRIOS PARA DOMÍNIO
// ============================================================================

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams {
  query: string;
  filters?: Record<string, any>;
  pagination?: PaginationParams;
}

export interface BulkOperationResult<T> {
  success: boolean;
  data?: T[];
  errors?: string[];
  total: number;
  processed: number;
  failed: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings?: Record<string, string[]>;
}

// ============================================================================
// TIPOS PARA OPERAÇÕES DE NEGÓCIO
// ============================================================================

export interface BusinessOperation<T> {
  id: string;
  type: OperationType;
  status: OperationStatus;
  data: T;
  result?: any;
  error?: string;
  startedAt: string;
  completedAt?: string;
  progress?: number;
}

export type OperationType = 
  | 'import_products'
  | 'export_data'
  | 'bulk_update'
  | 'generate_report'
  | 'process_agent'
  | 'calculate_pricing'
  | 'sync_channels';

export type OperationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

// ============================================================================
// TIPOS PARA INTEGRAÇÕES EXTERNAS
// ============================================================================

export interface ExternalIntegration {
  id: number;
  name: string;
  type: IntegrationType;
  provider: string;
  config: IntegrationConfig;
  isActive: boolean;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type IntegrationType = 
  | 'amazon_api'
  | 'mercadolivre_api'
  | 'shopee_api'
  | 'stripe_api'
  | 'picsart_api'
  | 'email_service'
  | 'sms_service';

export interface IntegrationConfig {
  apiKey?: string;
  apiSecret?: string;
  webhookUrl?: string;
  rateLimit?: number;
  timeout?: number;
  retries?: number;
  customHeaders?: Record<string, string>;
}

// ============================================================================
// TIPOS PARA NOTIFICAÇÕES E COMUNICAÇÕES
// ============================================================================

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  priority: NotificationPriority;
  expiresAt?: string;
  createdAt: string;
}

export type NotificationType = 
  | 'system_alert'
  | 'subscription_update'
  | 'credit_low'
  | 'simulation_complete'
  | 'agent_result'
  | 'report_ready'
  | 'security_alert';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Message {
  id: number;
  fromUserId: number;
  toUserId: number;
  subject: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  readAt?: string;
  createdAt: string;
}

export type MessageType = 'system' | 'support' | 'notification' | 'marketing';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed'; 