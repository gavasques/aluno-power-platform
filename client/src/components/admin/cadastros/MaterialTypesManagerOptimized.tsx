import React from 'react';
import BaseTypesManager, { type BaseItem, type BaseTypesManagerConfig } from '@/components/admin/base/BaseTypesManager';
import { FileText, Video, Youtube, FileSpreadsheet, Image, Globe, Code2 } from 'lucide-react';
import type { MaterialType } from '@shared/schema';

// Extend BaseItem para incluir campos específicos do MaterialType
interface MaterialTypeItem extends BaseItem {
  icon: string;
  allowsUpload: boolean;
  allowsUrl: boolean;
  viewerType: "inline" | "download" | "external";
}

// Opções de ícones disponíveis
const iconOptions = [
  { value: "FileText", label: "Documento" },
  { value: "Video", label: "Vídeo" },
  { value: "Youtube", label: "YouTube" },
  { value: "FileSpreadsheet", label: "Planilha" },
  { value: "Image", label: "Imagem" },
  { value: "Globe", label: "Web/iFrame" },
  { value: "Code2", label: "Código/Embed" },
];

// Opções de tipo de visualização
const viewerTypeOptions = [
  { value: "inline", label: "Visualização inline" },
  { value: "download", label: "Download apenas" },
  { value: "external", label: "Link externo" },
];

// Função para obter componente do ícone
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "FileText": return <FileText className="h-4 w-4" />;
    case "Video": return <Video className="h-4 w-4" />;
    case "Youtube": return <Youtube className="h-4 w-4" />;
    case "FileSpreadsheet": return <FileSpreadsheet className="h-4 w-4" />;
    case "Image": return <Image className="h-4 w-4" />;
    case "Globe": return <Globe className="h-4 w-4" />;
    case "Code2": return <Code2 className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
};

// Configuração específica para MaterialTypes
const materialTypesConfig: BaseTypesManagerConfig<MaterialTypeItem> = {
  // Configurações básicas
  title: "Tipos de Materiais",
  entityName: "tipo de material",
  entityNamePlural: "tipos de materiais",
  apiEndpoint: "/api/material-types",
  
  // Configurações de UI
  searchPlaceholder: "Buscar tipos de materiais...",
  addButtonText: "Adicionar",
  emptyMessage: "Nenhum tipo de material encontrado.",
  
  // Configurações de formulário
  dialogTitle: "Novo Tipo de Material",
  dialogDescription: "Configure o novo tipo de material e suas funcionalidades.",
  formFields: [
    {
      name: "name",
      label: "Nome do Tipo",
      type: "text",
      required: true,
      placeholder: "Nome do Tipo",
    },
    {
      name: "description",
      label: "Descrição",
      type: "textarea",
      placeholder: "Descrição (opcional)",
    },
    {
      name: "icon",
      label: "Ícone",
      type: "select",
      defaultValue: "FileText",
      options: iconOptions,
    },
    {
      name: "viewerType",
      label: "Tipo de visualização",
      type: "select",
      defaultValue: "inline",
      options: viewerTypeOptions,
    },
    {
      name: "allowsUpload",
      label: "Permite upload de arquivos",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "allowsUrl",
      label: "Permite URLs externas",
      type: "checkbox",
      defaultValue: true,
    },
  ],
  
  // Mensagens de feedback
  messages: {
    createSuccess: "Tipo de material criado com sucesso!",
    createError: "Erro ao criar tipo de material.",
    deleteSuccess: "Tipo de material removido com sucesso!",
    deleteError: "Erro ao remover tipo de material.",
  },
  
  // Configurações avançadas
  defaultSort: "alphabetical",
  enableSearch: true,
  enableSort: true,
  cacheTime: 10 * 60 * 1000, // 10 minutos
  
  // Renderer customizado para mostrar ícones e informações específicas
  customItemRenderer: (item: MaterialTypeItem, onDelete) => (
    <div
      key={item.id}
      className="flex items-center justify-between p-4 bg-gray-50 border border-border rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="flex-1">
        <div className="flex items-center gap-3">
          {getIconComponent(item.icon)}
          <div>
            <div className="font-medium text-foreground">{item.name}</div>
            {item.description && (
              <div className="text-sm text-muted-foreground mt-1">{item.description}</div>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              {item.viewerType === 'inline' ? 'Visualização inline' : 
               item.viewerType === 'download' ? 'Download apenas' : 'Link externo'} • 
              Criado em {new Date(item.createdAt).toLocaleDateString('pt-BR')}
            </div>
            <div className="flex gap-2 mt-2">
              {item.allowsUpload && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  Upload
                </span>
              )}
              {item.allowsUrl && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  URL
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <button
        className="ml-4 p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
        onClick={() => onDelete(item)}
        title="Remover tipo de material"
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
    icon: formData.icon,
    allowsUpload: formData.allowsUpload,
    allowsUrl: formData.allowsUrl,
    viewerType: formData.viewerType,
  }),
};

const MaterialTypesManagerOptimized: React.FC = () => {
  return <BaseTypesManager<MaterialTypeItem> config={materialTypesConfig} />;
};

export default MaterialTypesManagerOptimized;