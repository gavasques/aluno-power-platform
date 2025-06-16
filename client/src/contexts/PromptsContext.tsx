
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Prompt, PromptCategory, CreatePromptData, UpdatePromptData, PromptImage, PromptStep, PromptFile } from '@/types/prompt';

interface PromptsContextType {
  prompts: Prompt[];
  categories: PromptCategory[];
  loading: boolean;
  error: string | null;
  searchPrompts: (query: string) => Prompt[];
  getPromptById: (id: string) => Prompt | undefined;
  createPrompt: (data: CreatePromptData) => Promise<void>;
  updatePrompt: (data: UpdatePromptData) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  createCategory: (name: string, description?: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const PromptsContext = createContext<PromptsContextType | undefined>(undefined);

const mockCategories: PromptCategory[] = [
  { id: '1', name: 'Geração de Imagem', description: 'Prompts para geração de imagens de produtos' },
  { id: '2', name: 'Gestão de Descrição', description: 'Prompts para criar descrições de produtos' },
  { id: '3', name: 'Pesquisa', description: 'Prompts para pesquisa de mercado e produtos' },
  { id: '4', name: 'Análise de Mercado', description: 'Prompts para análise de mercado e concorrência' },
];

const mockPrompts: Prompt[] = [
  {
    id: '1',
    title: 'Descrição de Produto E-commerce',
    content: 'Crie uma descrição atrativa e persuasiva para um produto de e-commerce com as seguintes informações:\n\nNome do produto: [NOME_PRODUTO]\nCaracterísticas principais: [CARACTERÍSTICAS]\nBenefícios: [BENEFÍCIOS]\nPúblico-alvo: [PÚBLICO_ALVO]\n\nA descrição deve:\n- Ter entre 150-200 palavras\n- Usar linguagem persuasiva\n- Destacar os principais benefícios\n- Incluir call-to-action\n- Ser otimizada para SEO',
    stepCount: 1,
    steps: [
      {
        id: 'step-1',
        title: 'Passo 1',
        content: 'Crie uma descrição atrativa e persuasiva para um produto de e-commerce com as seguintes informações:\n\nNome do produto: [NOME_PRODUTO]\nCaracterísticas principais: [CARACTERÍSTICAS]\nBenefícios: [BENEFÍCIOS]\nPúblico-alvo: [PÚBLICO_ALVO]\n\nA descrição deve:\n- Ter entre 150-200 palavras\n- Usar linguagem persuasiva\n- Destacar os principais benefícios\n- Incluir call-to-action\n- Ser otimizada para SEO',
        explanation: 'Execute este prompt para criar uma descrição otimizada do seu produto.',
        order: 1
      }
    ],
    category: mockCategories[1],
    description: 'Prompt para gerar descrições otimizadas de produtos para e-commerce',
    usageExamples: 'Use para criar descrições de produtos no Mercado Livre, Amazon, ou sua loja virtual. Substitua as variáveis pelos dados específicos do seu produto.',
    images: [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop',
        alt: 'Exemplo de descrição de produto antes da otimização',
        type: 'before'
      },
      {
        id: '2',
        url: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800&h=600&fit=crop',
        alt: 'Exemplo de descrição de produto depois da otimização com IA',
        type: 'after'
      },
      {
        id: '3',
        url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
        alt: 'Interface de ferramenta de IA para e-commerce',
        type: 'general'
      }
    ],
    files: [],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '2',
    title: 'Análise de Concorrência',
    content: 'Analise a concorrência para o seguinte produto/nicho:\n\nProduto/Nicho: [PRODUTO_NICHO]\nMercado: [MERCADO_ALVO]\n\nPor favor, forneça:\n\n1. Lista dos 5 principais concorrentes\n2. Faixa de preços praticada\n3. Principais diferenciais de cada concorrente\n4. Oportunidades identificadas no mercado\n5. Sugestões de posicionamento\n6. Análise de pontos fortes e fracos\n\nBase a análise em dados públicos e tendências do mercado.',
    stepCount: 2,
    steps: [
      {
        id: 'step-1',
        title: 'Passo 1',
        content: 'Analise a concorrência para o seguinte produto/nicho:\n\nProduto/Nicho: [PRODUTO_NICHO]\nMercado: [MERCADO_ALVO]\n\nPor favor, forneça:\n\n1. Lista dos 5 principais concorrentes\n2. Faixa de preços praticada\n3. Principais diferenciais de cada concorrente',
        explanation: 'Primeiro, faça uma análise básica dos concorrentes no seu nicho.',
        order: 1
      },
      {
        id: 'step-2',
        title: 'Passo 2',
        content: 'Com base na análise anterior, agora forneça:\n\n1. Oportunidades identificadas no mercado\n2. Sugestões de posicionamento\n3. Análise de pontos fortes e fracos\n4. Estratégias de diferenciação\n\nBase suas recomendações nos dados coletados no passo anterior.',
        explanation: 'Agora aprofunde a análise com estratégias e oportunidades baseadas nos dados do primeiro passo.',
        order: 2
      }
    ],
    category: mockCategories[3],
    description: 'Prompt para análise completa da concorrência em um nicho específico',
    usageExamples: 'Ideal para pesquisa antes de lançar produtos ou para identificar oportunidades de mercado. Use ferramentas como ChatGPT, Claude ou Gemini.',
    images: [
      {
        id: '4',
        url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
        alt: 'Dashboard de análise de concorrência gerado pela IA',
        type: 'general'
      }
    ],
    files: [
      {
        id: 'file-1',
        name: 'Template_Analise_Concorrencia.xlsx',
        url: '#',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 25600
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
];

export function PromptsProvider({ children }: { children: React.ReactNode }) {
  const [prompts, setPrompts] = useState<Prompt[]>(mockPrompts);
  const [categories, setCategories] = useState<PromptCategory[]>(mockCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPrompts = (query: string): Prompt[] => {
    if (!query.trim()) return prompts;
    const lowercaseQuery = query.toLowerCase();
    return prompts.filter(prompt =>
      prompt.title.toLowerCase().includes(lowercaseQuery) ||
      prompt.content.toLowerCase().includes(lowercaseQuery) ||
      prompt.category.name.toLowerCase().includes(lowercaseQuery) ||
      prompt.steps.some(step => 
        step.content.toLowerCase().includes(lowercaseQuery) ||
        step.explanation.toLowerCase().includes(lowercaseQuery)
      )
    );
  };

  const getPromptById = (id: string): Prompt | undefined => {
    return prompts.find(prompt => prompt.id === id);
  };

  const createPrompt = async (data: CreatePromptData): Promise<void> => {
    setLoading(true);
    try {
      const category = categories.find(c => c.id === data.categoryId);
      if (!category) throw new Error('Categoria não encontrada');

      const newPrompt: Prompt = {
        id: Date.now().toString(),
        ...data,
        category,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setPrompts(prev => [newPrompt, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar prompt');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePrompt = async (data: UpdatePromptData): Promise<void> => {
    setLoading(true);
    try {
      setPrompts(prev => prev.map(prompt => {
        if (prompt.id === data.id) {
          const category = data.categoryId ? categories.find(c => c.id === data.categoryId) : prompt.category;
          return {
            ...prompt,
            ...data,
            category: category || prompt.category,
            updatedAt: new Date(),
          };
        }
        return prompt;
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar prompt');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePrompt = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      setPrompts(prev => prev.filter(prompt => prompt.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir prompt');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (name: string, description?: string): Promise<void> => {
    setLoading(true);
    try {
      const newCategory: PromptCategory = {
        id: Date.now().toString(),
        name,
        description,
      };
      setCategories(prev => [newCategory, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar categoria');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      const hasPrompts = prompts.some(prompt => prompt.category.id === id);
      if (hasPrompts) {
        throw new Error('Não é possível excluir categoria que possui prompts');
      }
      setCategories(prev => prev.filter(category => category.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir categoria');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: PromptsContextType = {
    prompts,
    categories,
    loading,
    error,
    searchPrompts,
    getPromptById,
    createPrompt,
    updatePrompt,
    deletePrompt,
    createCategory,
    deleteCategory,
  };

  return (
    <PromptsContext.Provider value={value}>
      {children}
    </PromptsContext.Provider>
  );
}

export function usePrompts() {
  const context = useContext(PromptsContext);
  if (context === undefined) {
    throw new Error('usePrompts must be used within a PromptsProvider');
  }
  return context;
}
