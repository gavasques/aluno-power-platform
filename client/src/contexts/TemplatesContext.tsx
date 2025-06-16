
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Template, TemplateCategory, CreateTemplateData, UpdateTemplateData } from '@/types/template';

interface TemplatesContextType {
  templates: Template[];
  categories: TemplateCategory[];
  loading: boolean;
  error: string | null;
  searchTemplates: (query: string) => Template[];
  getTemplateById: (id: string) => Template | undefined;
  createTemplate: (data: CreateTemplateData) => Promise<void>;
  updateTemplate: (data: UpdateTemplateData) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  createCategory: (name: string, description?: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const TemplatesContext = createContext<TemplatesContextType | undefined>(undefined);

const mockCategories: TemplateCategory[] = [
  { id: '1', name: 'Comunicação com Fornecedor', description: 'Templates para comunicação com fornecedores' },
  { id: '2', name: 'Email', description: 'Templates de emails diversos' },
  { id: '3', name: 'Negociar Chinês', description: 'Templates para negociação com fornecedores chineses' },
  { id: '4', name: 'Desconto Fornecedor', description: 'Templates para solicitar descontos' },
];

const mockTemplates: Template[] = [
  {
    id: '1',
    title: 'Solicitação de Cotação',
    content: 'Prezado fornecedor,\n\nGostaria de solicitar uma cotação para os seguintes itens:\n\n[LISTA_PRODUTOS]\n\nQuantidade: [QUANTIDADE]\nPrazo de entrega: [PRAZO]\n\nAguardo seu retorno.\n\nAtenciosamente,\n[SEU_NOME]',
    category: mockCategories[0],
    description: 'Template para solicitar cotações de produtos aos fornecedores',
    whenToUse: 'Use quando precisar solicitar preços e condições de produtos específicos',
    customization: 'Substitua [LISTA_PRODUTOS], [QUANTIDADE], [PRAZO] e [SEU_NOME] pelos valores apropriados',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'Negociação de Desconto',
    content: 'Hello,\n\nI hope this email finds you well. I am writing to discuss potential discounts for bulk orders.\n\nOrder quantity: [QUANTITY]\nCurrent price: [CURRENT_PRICE]\nTarget price: [TARGET_PRICE]\n\nI believe this partnership can be beneficial for both parties.\n\nBest regards,\n[YOUR_NAME]',
    category: mockCategories[3],
    description: 'Template para negociar descontos em pedidos em quantidade',
    whenToUse: 'Use ao negociar preços melhores para pedidos de grande volume',
    customization: 'Ajuste os valores de quantidade e preços conforme sua necessidade',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
];

export function TemplatesProvider({ children }: { children: React.ReactNode }) {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);
  const [categories, setCategories] = useState<TemplateCategory[]>(mockCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchTemplates = (query: string): Template[] => {
    if (!query.trim()) return templates;
    const lowercaseQuery = query.toLowerCase();
    return templates.filter(template =>
      template.title.toLowerCase().includes(lowercaseQuery) ||
      template.content.toLowerCase().includes(lowercaseQuery) ||
      template.category.name.toLowerCase().includes(lowercaseQuery)
    );
  };

  const getTemplateById = (id: string): Template | undefined => {
    return templates.find(template => template.id === id);
  };

  const createTemplate = async (data: CreateTemplateData): Promise<void> => {
    setLoading(true);
    try {
      const category = categories.find(c => c.id === data.categoryId);
      if (!category) throw new Error('Categoria não encontrada');

      const newTemplate: Template = {
        id: Date.now().toString(),
        ...data,
        category,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTemplates(prev => [newTemplate, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar template');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTemplate = async (data: UpdateTemplateData): Promise<void> => {
    setLoading(true);
    try {
      setTemplates(prev => prev.map(template => {
        if (template.id === data.id) {
          const category = data.categoryId ? categories.find(c => c.id === data.categoryId) : template.category;
          return {
            ...template,
            ...data,
            category: category || template.category,
            updatedAt: new Date(),
          };
        }
        return template;
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar template');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      setTemplates(prev => prev.filter(template => template.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir template');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (name: string, description?: string): Promise<void> => {
    setLoading(true);
    try {
      const newCategory: TemplateCategory = {
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
      const hasTemplates = templates.some(template => template.category.id === id);
      if (hasTemplates) {
        throw new Error('Não é possível excluir categoria que possui templates');
      }
      setCategories(prev => prev.filter(category => category.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir categoria');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: TemplatesContextType = {
    templates,
    categories,
    loading,
    error,
    searchTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    createCategory,
    deleteCategory,
  };

  return (
    <TemplatesContext.Provider value={value}>
      {children}
    </TemplatesContext.Provider>
  );
}

export function useTemplates() {
  const context = useContext(TemplatesContext);
  if (context === undefined) {
    throw new Error('useTemplates must be used within a TemplatesProvider');
  }
  return context;
}
