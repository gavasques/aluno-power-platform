
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Tool, ToolType, UserToolReview } from '@/types/tool';

interface ToolsContextType {
  tools: Tool[];
  toolTypes: ToolType[];
  userReviews: UserToolReview[];
  addTool: (tool: Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTool: (id: string, tool: Partial<Tool>) => void;
  deleteTool: (id: string) => void;
  addToolType: (toolType: Omit<ToolType, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateToolType: (id: string, toolType: Partial<ToolType>) => void;
  deleteToolType: (id: string) => void;
  addUserReview: (review: Omit<UserToolReview, 'id' | 'createdAt'>) => void;
  getToolsByType: (typeId: string) => Tool[];
}

const ToolsContext = createContext<ToolsContextType | undefined>(undefined);

const mockToolTypes: ToolType[] = [
  {
    id: '1',
    name: 'Pesquisa de Produtos',
    description: 'Ferramentas para pesquisa e análise de produtos',
    icon: 'Search',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Analytics',
    description: 'Ferramentas de análise e métricas',
    icon: 'BarChart',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Automação',
    description: 'Ferramentas de automação de processos',
    icon: 'Bot',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockTools: Tool[] = [
  {
    id: '1',
    name: 'Helium 10',
    category: 'Pesquisa de Produtos',
    typeId: '1',
    description: 'Suite completa de ferramentas para vendedores Amazon',
    logo: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=100&h=100&fit=crop',
    verified: true,
    officialRating: 4.8,
    userRating: 4.5,
    reviewCount: 245,
    overview: 'Helium 10 é uma das suites mais completas para vendedores Amazon, oferecendo mais de 30 ferramentas diferentes para pesquisa de produtos, otimização de listagens, análise de concorrentes e muito mais.',
    features: [
      'Pesquisa de palavras-chave',
      'Análise de concorrentes',
      'Otimização de listings',
      'Monitoramento de posição',
      'Alertas de hijacking'
    ],
    pricing: {
      plans: [
        {
          name: 'Starter',
          price: '$39/mês',
          features: ['Acesso básico às ferramentas', 'Limite de uso reduzido']
        },
        {
          name: 'Platinum',
          price: '$99/mês',
          features: ['Acesso completo', 'Sem limites de uso', 'Suporte prioritário']
        }
      ]
    },
    availabilityBrazil: 'Disponível com suporte em português. Aceita cartões brasileiros.',
    lvReview: {
      rating: 4.7,
      review: 'Excelente ferramenta com interface intuitiva. O custo-benefício é muito bom considerando a quantidade de funcionalidades oferecidas.'
    },
    prosAndCons: {
      pros: [
        'Interface amigável e intuitiva',
        'Suporte ao português',
        'Dados precisos e atualizados',
        'Comunidade ativa'
      ],
      cons: [
        'Preço elevado para iniciantes',
        'Curva de aprendizado inicial',
        'Algumas funcionalidades complexas'
      ]
    },
    discounts: [
      {
        description: '20% de desconto nos primeiros 6 meses',
        link: 'https://helium10.com/lovable',
        coupon: 'LOVABLE20'
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }
];

export function ToolsProvider({ children }: { children: ReactNode }) {
  const [tools, setTools] = useState<Tool[]>(mockTools);
  const [toolTypes, setToolTypes] = useState<ToolType[]>(mockToolTypes);
  const [userReviews, setUserReviews] = useState<UserToolReview[]>([]);

  const addTool = (toolData: Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTool: Tool = {
      ...toolData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTools(prev => [...prev, newTool]);
  };

  const updateTool = (id: string, toolData: Partial<Tool>) => {
    setTools(prev => prev.map(tool => 
      tool.id === id 
        ? { ...tool, ...toolData, updatedAt: new Date().toISOString() }
        : tool
    ));
  };

  const deleteTool = (id: string) => {
    setTools(prev => prev.filter(tool => tool.id !== id));
  };

  const addToolType = (toolTypeData: Omit<ToolType, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newToolType: ToolType = {
      ...toolTypeData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setToolTypes(prev => [...prev, newToolType]);
  };

  const updateToolType = (id: string, toolTypeData: Partial<ToolType>) => {
    setToolTypes(prev => prev.map(type => 
      type.id === id 
        ? { ...type, ...toolTypeData, updatedAt: new Date().toISOString() }
        : type
    ));
  };

  const deleteToolType = (id: string) => {
    setToolTypes(prev => prev.filter(type => type.id !== id));
  };

  const addUserReview = (reviewData: Omit<UserToolReview, 'id' | 'createdAt'>) => {
    const newReview: UserToolReview = {
      ...reviewData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    setUserReviews(prev => [...prev, newReview]);
    
    // Atualizar rating da ferramenta
    const toolReviews = [...userReviews, newReview].filter(r => r.toolId === reviewData.toolId);
    const avgRating = toolReviews.reduce((acc, review) => acc + review.rating, 0) / toolReviews.length;
    
    updateTool(reviewData.toolId, { 
      userRating: avgRating,
      reviewCount: toolReviews.length 
    });
  };

  const getToolsByType = (typeId: string) => {
    return tools.filter(tool => tool.typeId === typeId);
  };

  return (
    <ToolsContext.Provider value={{
      tools,
      toolTypes,
      userReviews,
      addTool,
      updateTool,
      deleteTool,
      addToolType,
      updateToolType,
      deleteToolType,
      addUserReview,
      getToolsByType,
    }}>
      {children}
    </ToolsContext.Provider>
  );
}

export function useTools() {
  const context = useContext(ToolsContext);
  if (context === undefined) {
    throw new Error('useTools must be used within a ToolsProvider');
  }
  return context;
}
