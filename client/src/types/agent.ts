export interface AgentCategory {
  id: string;
  name: string;
  color: string;
}

export interface Agent {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AgentCategory;
  badges: string[];
  isFavorite: boolean;
  isNew: boolean;
  isBeta: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentFilter {
  id: string;
  name: string;
  count?: number;
}

export const AGENT_CATEGORIES: AgentCategory[] = [
  { id: 'ecommerce', name: 'E-commerce', color: 'bg-green-100 text-green-800' },
  { id: 'marketing', name: 'Marketing', color: 'bg-blue-100 text-blue-800' },
  { id: 'content', name: 'Conteúdo', color: 'bg-purple-100 text-purple-800' },
  { id: 'emails', name: 'E-mails', color: 'bg-orange-100 text-orange-800' },
  { id: 'ads', name: 'Anúncios', color: 'bg-red-100 text-red-800' },
  { id: 'youtube', name: 'YouTube', color: 'bg-red-100 text-red-800' },
];

export const AGENT_FILTERS: AgentFilter[] = [
  { id: 'favorites', name: 'Favoritos' },
  { id: 'all', name: 'Todos' },
  { id: 'beta', name: 'Beta' },
  { id: 'new', name: 'Novo!' },
  { id: 'ecommerce', name: 'E-commerce' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'ads', name: 'Anúncios' },
  { id: 'content', name: 'Conteúdo' },
];