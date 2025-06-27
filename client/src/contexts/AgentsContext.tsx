import React, { createContext, useContext, useState } from 'react';

// Types para agentes
export interface Agent {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  iconUrl?: string;
  version: string;
  lastUpdated: string;
  createdBy: string;
  usageCount: number;
  rating: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  requirements: string[];
  outputs: string[];
}

export interface AgentCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
}

export interface AgentExecution {
  id: string;
  agentId: string;
  userId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  inputs: Record<string, any>;
  outputs?: Record<string, any>;
  error?: string;
  duration?: number;
}

interface AgentsContextType {
  agents: Agent[];
  categories: AgentCategory[];
  executions: AgentExecution[];
  
  // Queries
  isLoadingAgents: boolean;
  isLoadingCategories: boolean;
  
  // Agent operations
  getAgent: (id: string) => Agent | undefined;
  getAgentsByCategory: (categoryId: string) => Agent[];
  searchAgents: (query: string) => Agent[];
  getFeaturedAgents: () => Agent[];
  
  // Category operations
  getCategory: (id: string) => AgentCategory | undefined;
  
  // Execution operations
  executeAgent: (agentId: string, inputs: Record<string, any>) => Promise<AgentExecution>;
  getExecutionHistory: (agentId?: string) => AgentExecution[];
  
  // Admin operations
  createAgent: (agent: Omit<Agent, 'id' | 'createdBy' | 'lastUpdated' | 'usageCount' | 'rating'>) => Promise<Agent>;
  updateAgent: (id: string, agent: Partial<Agent>) => Promise<Agent>;
  deleteAgent: (id: string) => Promise<void>;
  
  createCategory: (category: Omit<AgentCategory, 'id'>) => Promise<AgentCategory>;
  updateCategory: (id: string, category: Partial<AgentCategory>) => Promise<AgentCategory>;
  deleteCategory: (id: string) => Promise<void>;
}

const AgentsContext = createContext<AgentsContextType | undefined>(undefined);

// Mock data inicial
const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Amazon Product Optimizer',
    description: 'Otimiza títulos, descrições e bullet points para produtos Amazon',
    category: {
      id: 'ecommerce',
      name: 'E-commerce',
      description: 'Agentes para otimização de vendas online',
      color: 'blue',
      icon: 'ShoppingCart',
      isActive: true
    },
    tags: ['amazon', 'seo', 'produto', 'otimização'],
    isActive: true,
    isFeatured: true,
    version: '2.1.0',
    lastUpdated: '2024-12-27',
    createdBy: 'admin',
    usageCount: 1247,
    rating: 4.8,
    difficulty: 'intermediate',
    estimatedTime: '5-10 min',
    requirements: ['Planilha CSV', 'Dados do produto'],
    outputs: ['Títulos otimizados', 'Descrições SEO', 'Bullet points', 'Insights']
  },
  {
    id: '2',
    name: 'Content Generator Pro',
    description: 'Gera conteúdo para redes sociais, blogs e newsletters',
    category: {
      id: 'content',
      name: 'Criação de Conteúdo',
      description: 'Agentes para geração de conteúdo',
      color: 'purple',
      icon: 'FileText',
      isActive: true
    },
    tags: ['conteúdo', 'redes sociais', 'blog', 'marketing'],
    isActive: true,
    isFeatured: true,
    version: '1.5.2',
    lastUpdated: '2024-12-25',
    createdBy: 'admin',
    usageCount: 892,
    rating: 4.6,
    difficulty: 'beginner',
    estimatedTime: '3-7 min',
    requirements: ['Tópico', 'Tom de voz', 'Público-alvo'],
    outputs: ['Posts para redes sociais', 'Artigos', 'Headlines']
  },
  {
    id: '3',
    name: 'Email Marketing Assistant',
    description: 'Cria campanhas de email marketing personalizadas e eficazes',
    category: {
      id: 'marketing',
      name: 'Marketing Digital',
      description: 'Agentes para estratégias de marketing',
      color: 'green',
      icon: 'Mail',
      isActive: true
    },
    tags: ['email', 'marketing', 'campanhas', 'conversão'],
    isActive: true,
    isFeatured: false,
    version: '1.8.1',
    lastUpdated: '2024-12-20',
    createdBy: 'admin',
    usageCount: 634,
    rating: 4.4,
    difficulty: 'intermediate',
    estimatedTime: '8-15 min',
    requirements: ['Lista de contatos', 'Objetivo da campanha'],
    outputs: ['Templates de email', 'Linha de assunto', 'Call-to-actions']
  },
  {
    id: '4',
    name: 'SEO Content Analyzer',
    description: 'Analisa e otimiza conteúdo para melhor posicionamento nos motores de busca',
    category: {
      id: 'analytics',
      name: 'Analytics',
      description: 'Agentes para análise de dados',
      color: 'orange',
      icon: 'BarChart',
      isActive: true
    },
    tags: ['seo', 'análise', 'conteúdo', 'otimização'],
    isActive: true,
    isFeatured: false,
    version: '1.3.0',
    lastUpdated: '2024-12-15',
    createdBy: 'admin',
    usageCount: 423,
    rating: 4.2,
    difficulty: 'advanced',
    estimatedTime: '10-20 min',
    requirements: ['URL do conteúdo', 'Palavras-chave alvo'],
    outputs: ['Relatório SEO', 'Sugestões de melhoria', 'Score de otimização']
  },
  {
    id: '5',
    name: 'Social Media Scheduler',
    description: 'Automatiza o agendamento e publicação em múltiplas redes sociais',
    category: {
      id: 'automation',
      name: 'Automação',
      description: 'Agentes para automação de processos',
      color: 'red',
      icon: 'Zap',
      isActive: false,
      },
    tags: ['automação', 'redes sociais', 'agendamento', 'publicação'],
    isActive: false,
    isFeatured: false,
    version: '0.9.1',
    lastUpdated: '2024-12-10',
    createdBy: 'admin',
    usageCount: 156,
    rating: 3.8,
    difficulty: 'intermediate',
    estimatedTime: '5-15 min',
    requirements: ['Conteúdo', 'Cronograma', 'Contas das redes sociais'],
    outputs: ['Posts agendados', 'Relatório de publicações']
  }
];

const mockCategories: AgentCategory[] = [
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Agentes para otimização de vendas online',
    color: 'blue',
    icon: 'ShoppingCart',
    isActive: true
  },
  {
    id: 'content',
    name: 'Criação de Conteúdo',
    description: 'Agentes para geração de conteúdo',
    color: 'purple',
    icon: 'FileText',
    isActive: true
  },
  {
    id: 'marketing',
    name: 'Marketing Digital',
    description: 'Agentes para estratégias de marketing',
    color: 'green',
    icon: 'Mail',
    isActive: true
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Agentes para análise de dados',
    color: 'orange',
    icon: 'BarChart',
    isActive: true
  },
  {
    id: 'automation',
    name: 'Automação',
    description: 'Agentes para automação de processos',
    color: 'red',
    icon: 'Zap',
    isActive: true
  }
];

export function AgentsProvider({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [categories, setCategories] = useState<AgentCategory[]>(mockCategories);
  const [executions, setExecutions] = useState<AgentExecution[]>([]);
  const [isLoadingAgents] = useState(false);
  const [isLoadingCategories] = useState(false);

  // Helper functions
  const getAgent = (id: string) => agents.find(agent => agent.id === id);
  
  const getAgentsByCategory = (categoryId: string) => 
    agents.filter(agent => agent.category.id === categoryId && agent.isActive);
  
  const searchAgents = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return agents.filter(agent => 
      agent.isActive && (
        agent.name.toLowerCase().includes(lowercaseQuery) ||
        agent.description.toLowerCase().includes(lowercaseQuery) ||
        agent.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      )
    );
  };
  
  const getFeaturedAgents = () => 
    agents.filter(agent => agent.isActive && agent.isFeatured);
  
  const getCategory = (id: string) => 
    categories.find(category => category.id === id);
  
  const getExecutionHistory = (agentId?: string) => {
    if (agentId) {
      return executions.filter(exec => exec.agentId === agentId);
    }
    return executions;
  };

  // Admin operations
  const createAgent = async (agentData: Omit<Agent, 'id' | 'createdBy' | 'lastUpdated' | 'usageCount' | 'rating'>): Promise<Agent> => {
    const newAgent: Agent = {
      ...agentData,
      id: Date.now().toString(),
      createdBy: 'admin',
      lastUpdated: new Date().toISOString().split('T')[0],
      usageCount: 0,
      rating: 0
    };
    setAgents(prev => [...prev, newAgent]);
    return newAgent;
  };

  const updateAgent = async (id: string, agentData: Partial<Agent>): Promise<Agent> => {
    setAgents(prev => prev.map(agent => 
      agent.id === id 
        ? { ...agent, ...agentData, lastUpdated: new Date().toISOString().split('T')[0] }
        : agent
    ));
    const updatedAgent = agents.find(a => a.id === id);
    if (!updatedAgent) throw new Error('Agent not found');
    return { ...updatedAgent, ...agentData };
  };

  const deleteAgent = async (id: string): Promise<void> => {
    setAgents(prev => prev.filter(agent => agent.id !== id));
  };

  const createCategory = async (categoryData: Omit<AgentCategory, 'id'>): Promise<AgentCategory> => {
    const newCategory: AgentCategory = {
      ...categoryData,
      id: Date.now().toString()
    };
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  };

  const updateCategory = async (id: string, categoryData: Partial<AgentCategory>): Promise<AgentCategory> => {
    setCategories(prev => prev.map(category => 
      category.id === id ? { ...category, ...categoryData } : category
    ));
    const updatedCategory = categories.find(c => c.id === id);
    if (!updatedCategory) throw new Error('Category not found');
    return { ...updatedCategory, ...categoryData };
  };

  const deleteCategory = async (id: string): Promise<void> => {
    setCategories(prev => prev.filter(category => category.id !== id));
  };

  const executeAgent = async (agentId: string, inputs: Record<string, any>): Promise<AgentExecution> => {
    const execution: AgentExecution = {
      id: Date.now().toString(),
      agentId,
      userId: 'current-user',
      status: 'completed',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      inputs,
      outputs: { result: 'Mock execution result' },
      duration: 5000
    };
    setExecutions(prev => [...prev, execution]);
    return execution;
  };

  const value: AgentsContextType = {
    agents,
    categories,
    executions,
    isLoadingAgents,
    isLoadingCategories,
    
    getAgent,
    getAgentsByCategory,
    searchAgents,
    getFeaturedAgents,
    getCategory,
    getExecutionHistory,
    
    executeAgent,
    
    createAgent,
    updateAgent,
    deleteAgent,
    
    createCategory,
    updateCategory,
    deleteCategory,
  };

  return (
    <AgentsContext.Provider value={value}>
      {children}
    </AgentsContext.Provider>
  );
}

export function useAgents() {
  const context = useContext(AgentsContext);
  if (!context) {
    throw new Error('useAgents must be used within an AgentsProvider');
  }
  return context;
}