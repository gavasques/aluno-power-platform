/**
 * Tipos centralizados para o módulo de agentes
 * Refatoração do AgentProviderSettings.tsx (1847 linhas)
 * 
 * COBERTURA DE TIPOS:
 * - Agent: Interface principal para agentes IA
 * - ModelConfig: Configurações específicas de modelos
 * - ProviderStatus: Status de conectividade dos providers
 * - ProviderInfo: Metadados dos providers
 * - FormData: Dados de formulários de configuração
 * - TestConnection: Estruturas para teste de conexão
 * - KnowledgeBase: Tipos para base de conhecimento
 */

// Tipos de providers suportados
export type AgentProvider = 'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'xai' | 'openrouter';

// Tabs do sistema
export type ActiveTab = 'providers' | 'knowledge-base';

// Interface principal do Agent
export interface Agent {
  id: string;
  name: string;
  description: string;
  provider: AgentProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  costPer1kTokens: number;
  isActive: boolean;
  systemPrompt?: string;
  responseFormat?: 'text' | 'json_object' | 'json_schema';
  seed?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  webSearch?: boolean;
  reasoningMode?: boolean;
  reasoningEffort?: 'low' | 'medium' | 'high';
  useRetrieval?: boolean;
  useCodeInterpreter?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Configuração de modelos
export interface ModelConfig {
  provider: AgentProvider;
  model: string;
  inputCostPer1M: number;
  outputCostPer1M: number;
  maxTokens: number;
  contextWindow?: number;
  recommended?: boolean;
  capabilities?: {
    vision?: boolean;
    webSearch?: boolean;
    reasoning?: boolean;
    tools?: boolean;
    jsonMode?: boolean;
  };
  description?: string;
}

// Status de conectividade dos providers
export interface ProviderStatus {
  openai: boolean;
  anthropic: boolean;
  gemini: boolean;
  deepseek: boolean;
  xai: boolean;
  openrouter: boolean;
}

// Informações de providers
export interface ProviderInfo {
  value: AgentProvider;
  label: string;
  icon: string;
  color: string;
  description?: string;
  website?: string;
  models?: string[];
}

// Dados do formulário de configuração
export interface AgentFormData {
  provider: AgentProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  responseFormat: 'text' | 'json_object' | 'json_schema';
  seed?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  webSearch: boolean;
  reasoningMode: boolean;
  reasoningEffort: 'low' | 'medium' | 'high';
  useRetrieval: boolean;
  useCodeInterpreter: boolean;
}

// Estrutura para teste de conexão
export interface TestConnection {
  provider: AgentProvider;
  model: string;
  testMessage: string;
  temperature?: number;
  maxTokens?: number;
}

// Resultado do teste de conexão
export interface TestConnectionResult {
  success: boolean;
  response?: string;
  error?: string;
  duration?: number;
  tokensUsed?: number;
  cost?: number;
}

// Base de conhecimento
export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  provider: 'openai';
  vectorStoreId?: string;
  documents: KnowledgeDocument[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Documento da base de conhecimento
export interface KnowledgeDocument {
  id: string;
  name: string;
  originalName: string;
  type: string;
  size: number;
  url: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  uploadedAt: string;
  processedAt?: string;
}

// Props para componentes
export interface AgentListProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onAgentSelect: (agent: Agent) => void;
  onAgentUpdate: (agent: Agent) => void;
  isLoading?: boolean;
}

export interface ProviderStatusProps {
  status: ProviderStatus;
  onRefresh: () => void;
  isLoading?: boolean;
}

export interface AgentConfigurationProps {
  agent: Agent | null;
  models: ModelConfig[];
  formData: AgentFormData;
  onFormDataUpdate: <K extends keyof AgentFormData>(key: K, value: AgentFormData[K]) => void;
  onSave: () => void;
  onTestConnection: (data: TestConnection) => void;
  isLoading?: boolean;
  isSaving?: boolean;
  isTesting?: boolean;
}

export interface TestConnectionProps {
  selectedAgent: Agent | null;
  onTest: (data: TestConnection) => Promise<TestConnectionResult>;
  isLoading?: boolean;
}

export interface KnowledgeBaseProps {
  collections: KnowledgeBase[];
  onUpload: (file: File, collection?: KnowledgeBase) => Promise<void>;
  onDelete: (collectionId: string, documentId?: string) => Promise<void>;
  onCreateCollection: (data: Omit<KnowledgeBase, 'id' | 'documents' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  isLoading?: boolean;
}

// Constantes
export const PROVIDERS: ProviderInfo[] = [
  { 
    value: 'openai', 
    label: 'OpenAI (ChatGPT)', 
    icon: '🤖', 
    color: 'bg-green-100 text-green-800',
    description: 'GPT-4, GPT-4o, GPT-4o-mini, o3, o3-mini, o4-mini',
    website: 'https://openai.com'
  },
  { 
    value: 'anthropic', 
    label: 'Anthropic (Claude)', 
    icon: '🧠', 
    color: 'bg-purple-100 text-purple-800',
    description: 'Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku',
    website: 'https://anthropic.com'
  },
  { 
    value: 'gemini', 
    label: 'Google Gemini', 
    icon: '⭐', 
    color: 'bg-blue-100 text-blue-800',
    description: 'Gemini 1.5 Pro, Gemini 1.5 Flash',
    website: 'https://ai.google.dev'
  },
  { 
    value: 'deepseek', 
    label: 'DeepSeek AI', 
    icon: '🔍', 
    color: 'bg-orange-100 text-orange-800',
    description: 'DeepSeek Chat, DeepSeek Coder',
    website: 'https://deepseek.com'
  },
  { 
    value: 'xai', 
    label: 'xAI (Grok)', 
    icon: '🧪', 
    color: 'bg-indigo-100 text-indigo-800',
    description: 'Grok-4, Grok-3, Grok-3-mini com Live Search',
    website: 'https://x.ai'
  },
  { 
    value: 'openrouter', 
    label: 'OpenRouter (400+ Models)', 
    icon: '🌐', 
    color: 'bg-teal-100 text-teal-800',
    description: 'Acesso a 400+ modelos de múltiplos providers',
    website: 'https://openrouter.ai'
  }
];

// Response formats disponíveis
export const RESPONSE_FORMATS = [
  { value: 'text', label: 'Texto Normal' },
  { value: 'json_object', label: 'JSON Object' },
  { value: 'json_schema', label: 'JSON Schema' }
] as const;

// Níveis de reasoning effort
export const REASONING_EFFORTS = [
  { value: 'low', label: 'Baixo' },
  { value: 'medium', label: 'Médio' },
  { value: 'high', label: 'Alto' }
] as const;

// Utility functions para tipos
export const getProviderInfo = (provider: AgentProvider): ProviderInfo | undefined => {
  return PROVIDERS.find(p => p.value === provider);
};

export const formatCost = (cost: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  }).format(cost);
};

export const calculateCostPer1kTokens = (inputCost: number, outputCost: number): number => {
  return (inputCost + outputCost) / 1000;
};