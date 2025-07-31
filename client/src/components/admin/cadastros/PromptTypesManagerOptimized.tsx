
import { FC } from "react";
import BaseTypesManager, { type BaseItem, type BaseTypesManagerConfig } from '@/components/admin/base/BaseTypesManager';
import { MessageSquare } from 'lucide-react';
// Using BaseItem interface instead of PromptType from schema

// Extend BaseItem para PromptType
interface PromptTypeItem extends BaseItem {
  icon?: string;
}

// Configuração específica para PromptTypes
const promptTypesConfig: BaseTypesManagerConfig<PromptTypeItem> = {
  // Configurações básicas
  title: "Tipos de Prompts IA",
  entityName: "tipo de prompt",
  entityNamePlural: "tipos de prompts",
  apiEndpoint: "/api/prompt-types",
  
  // Configurações de UI
  searchPlaceholder: "Buscar tipos de prompts...",
  addButtonText: "Adicionar",
  emptyMessage: "Nenhum tipo de prompt encontrado.",
  
  // Configurações de formulário
  dialogTitle: "Novo Tipo de Prompt IA",
  dialogDescription: "Crie uma nova categoria para organizar prompts de IA.",
  formFields: [
    {
      name: "name",
      label: "Nome do Tipo",
      type: "text",
      required: true,
      placeholder: "Ex: Marketing, Vendas, Atendimento",
    },
    {
      name: "description",
      label: "Descrição",
      type: "textarea",
      placeholder: "Descrição da categoria de prompts (opcional)",
    },
  ],
  
  // Mensagens de feedback
  messages: {
    createSuccess: "Tipo de prompt criado com sucesso!",
    createError: "Erro ao criar tipo de prompt.",
    deleteSuccess: "Tipo de prompt removido com sucesso!",
    deleteError: "Erro ao remover tipo de prompt.",
  },
  
  // Configurações avançadas
  defaultSort: "alphabetical",
  enableSearch: true,
  enableSort: true,
  cacheTime: 10 * 60 * 1000, // 10 minutos
  
  // Renderer customizado para mostrar ícone de mensagem
  customItemRenderer: (item: PromptTypeItem, onDelete) => (
    <div
      key={item.id}
      className="flex items-center justify-between p-4 bg-gray-50 border border-border rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-4 w-4 text-purple-600" />
          <div>
            <div className="font-medium text-foreground">{item.name}</div>
            {item.description && (
              <div className="text-sm text-muted-foreground mt-1">{item.description}</div>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              Criado em {new Date(item.createdAt).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
      </div>
      <button
        className="ml-4 p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
        onClick={() => onDelete(item)}
        title="Remover tipo de prompt"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  ),
  
  // Processar dados do formulário antes do envio
  processFormData: (formData) => ({
    name: formData.name.trim(),
    description: formData.description?.trim() || null,
    icon: "MessageSquare", // Ícone padrão para tipos de prompts
  }),
};

const PromptTypesManagerOptimized: FC = () => {
  return <BaseTypesManager config={promptTypesConfig} />;
};

export default PromptTypesManagerOptimized;