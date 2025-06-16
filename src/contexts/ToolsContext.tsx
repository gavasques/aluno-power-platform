
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
  updateUserReview: (reviewId: string, updates: Partial<UserToolReview>) => void;
  deleteUserReview: (reviewId: string) => void;
  addReplyToReview: (reviewId: string, reply: { userId: string; userName: string; comment: string; }) => void;
  getToolsByType: (typeId: string) => Tool[];
  getUserReviewsForTool: (toolId: string) => UserToolReview[];
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
      {
        title: 'Pesquisa de palavras-chave',
        description: 'Esta função permite descobrir palavras-chave relevantes para seus produtos, analisar volume de busca e competição. Você pode encontrar termos que seus concorrentes estão usando e identificar oportunidades de nicho.',
        photos: [
          'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop'
        ]
      },
      {
        title: 'Análise de concorrentes',
        description: 'Monitore seus concorrentes, analise seus produtos mais vendidos, estratégias de preços e performance. Identifique gaps no mercado e oportunidades de melhoria.',
        photos: [
          'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop'
        ]
      },
      {
        title: 'Otimização de listings',
        description: 'Melhore seus títulos, descrições e palavras-chave para aumentar a visibilidade e conversão dos seus produtos no Amazon.',
        photos: []
      }
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
    brazilSupport: 'works',
    guilhermeReview: {
      rating: 4.7,
      review: 'Excelente ferramenta com interface intuitiva. O custo-benefício é muito bom considerando a quantidade de funcionalidades oferecidas. A pesquisa de palavras-chave é muito precisa e os dados de concorrentes são atualizados.',
      photos: [
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=600&h=400&fit=crop'
      ]
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

const mockUserReviews: UserToolReview[] = [
  {
    id: '1',
    toolId: '1',
    userId: 'user1',
    userName: 'João Silva',
    rating: 5,
    comment: 'Ferramenta incrível! Me ajudou muito a encontrar produtos vencedores. A interface é intuitiva e os dados são precisos.',
    photos: [
      'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop'
    ],
    createdAt: '2024-01-15T10:30:00Z',
    replies: [
      {
        id: 'reply1',
        userId: 'admin',
        userName: 'Guilherme',
        comment: 'Obrigado pelo feedback! Ficamos felizes que esteja tendo bons resultados.',
        createdAt: '2024-01-15T14:20:00Z'
      }
    ]
  },
  {
    id: '2',
    toolId: '1',
    userId: 'user2',
    userName: 'Maria Santos',
    rating: 4,
    comment: 'Muito boa, mas o preço é um pouco salgado para quem está começando.',
    photos: [],
    createdAt: '2024-01-10T09:15:00Z',
    replies: []
  }
];

export function ToolsProvider({ children }: { children: ReactNode }) {
  const [tools, setTools] = useState<Tool[]>(mockTools);
  const [toolTypes, setToolTypes] = useState<ToolType[]>(mockToolTypes);
  const [userReviews, setUserReviews] = useState<UserToolReview[]>(mockUserReviews);

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
      replies: []
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

  const updateUserReview = (reviewId: string, updates: Partial<UserToolReview>) => {
    setUserReviews(prev => prev.map(review =>
      review.id === reviewId ? { ...review, ...updates } : review
    ));
  };

  const deleteUserReview = (reviewId: string) => {
    const review = userReviews.find(r => r.id === reviewId);
    setUserReviews(prev => prev.filter(r => r.id !== reviewId));
    
    if (review) {
      const toolReviews = userReviews.filter(r => r.toolId === review.toolId && r.id !== reviewId);
      const avgRating = toolReviews.length > 0 
        ? toolReviews.reduce((acc, r) => acc + r.rating, 0) / toolReviews.length 
        : 0;
      
      updateTool(review.toolId, { 
        userRating: avgRating,
        reviewCount: toolReviews.length 
      });
    }
  };

  const addReplyToReview = (reviewId: string, reply: { userId: string; userName: string; comment: string; }) => {
    const newReply = {
      ...reply,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    
    setUserReviews(prev => prev.map(review =>
      review.id === reviewId 
        ? { ...review, replies: [...review.replies, newReply] }
        : review
    ));
  };

  const getToolsByType = (typeId: string) => {
    return tools.filter(tool => tool.typeId === typeId);
  };

  const getUserReviewsForTool = (toolId: string) => {
    return userReviews.filter(review => review.toolId === toolId);
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
      updateUserReview,
      deleteUserReview,
      addReplyToReview,
      getToolsByType,
      getUserReviewsForTool,
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
