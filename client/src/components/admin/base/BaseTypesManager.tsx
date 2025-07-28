import React, { useState, memo, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Plus, Trash2, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Tipos base para configuração flexível
export interface BaseItem {
  id: number;
  name: string;
  description?: string | null;
  createdAt: string;
  [key: string]: any; // Permite campos adicionais específicos
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string | boolean; label: string }>;
  defaultValue?: any;
}

export interface BaseTypesManagerConfig<T extends BaseItem> {
  // Configurações básicas
  title: string;
  entityName: string; // Ex: "tipo de material"
  entityNamePlural: string; // Ex: "tipos de materiais"
  apiEndpoint: string; // Ex: "/api/material-types"
  
  // Configurações de UI
  searchPlaceholder: string;
  addButtonText?: string;
  emptyMessage?: string;
  
  // Configurações de formulário
  dialogTitle: string;
  dialogDescription?: string;
  formFields: FormField[];
  
  // Mensagens de feedback
  messages: {
    createSuccess: string;
    createError: string;
    deleteSuccess: string;
    deleteError: string;
  };
  
  // Configurações avançadas
  defaultSort?: 'name' | 'created' | 'alphabetical';
  enableSearch?: boolean;
  enableSort?: boolean;
  
  // Renderer customizado para itens (opcional)
  customItemRenderer?: (item: T, onDelete: (item: T) => void) => React.ReactNode;
  
  // Função para processar dados antes do envio (opcional)
  processFormData?: (formData: Record<string, any>) => Record<string, any>;
  
  // Cache configuration
  cacheTime?: number; // em milissegundos
}

interface BaseTypesManagerProps<T extends BaseItem> {
  config: BaseTypesManagerConfig<T>;
}

const BaseTypesManagerImpl = memo(<T extends BaseItem>({ config }: BaseTypesManagerProps<T>) => {
  const {
    title,
    entityName,
    entityNamePlural,
    apiEndpoint,
    searchPlaceholder,
    addButtonText = "Adicionar",
    emptyMessage,
    dialogTitle,
    dialogDescription,
    formFields,
    messages,
    defaultSort = "alphabetical",
    enableSearch = true,
    enableSort = true,
    customItemRenderer,
    processFormData,
    cacheTime = 5 * 60 * 1000, // 5 minutos padrão
  } = config;

  // Estados locais
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "created" | "alphabetical">(defaultSort);
  
  // Inicializar formData com valores padrão dos campos
  const initialFormData = useMemo(() => {
    const data: Record<string, any> = {};
    formFields.forEach(field => {
      data[field.name] = field.defaultValue ?? (field.type === 'checkbox' ? false : '');
    });
    return data;
  }, [formFields]);
  
  const [formData, setFormData] = useState(initialFormData);

  // Hooks do React Query
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query para buscar dados
  const { data: items = [], isLoading } = useQuery<T[]>({
    queryKey: [apiEndpoint],
    staleTime: cacheTime,
  });

  // Mutation para criar item
  const createMutation = useMutation({
    mutationFn: (newItem: Record<string, any>) => {
      const processedData = processFormData ? processFormData(newItem) : newItem;
      return apiRequest(apiEndpoint, {
        method: 'POST',
        body: JSON.stringify(processedData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
      toast({
        title: "Sucesso",
        description: messages.createSuccess,
      });
      setFormData(initialFormData);
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: messages.createError,
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar item
  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`${apiEndpoint}/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
      toast({
        title: "Sucesso",
        description: messages.deleteSuccess,
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: messages.deleteError,
        variant: "destructive",
      });
    },
  });

  // Filtros e ordenação otimizados
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items;
    
    // Aplicar filtro de busca
    if (enableSearch && searchTerm) {
      filtered = items.filter((item) => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Aplicar ordenação
    if (enableSort) {
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case "name":
          case "alphabetical":
            return a.name.localeCompare(b.name, 'pt-BR');
          case "created":
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          default:
            return a.name.localeCompare(b.name, 'pt-BR');
        }
      });
    }
    
    return filtered;
  }, [items, searchTerm, sortBy, enableSearch, enableSort]);

  // Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    const requiredFields = formFields.filter(field => field.required);
    const hasEmptyRequired = requiredFields.some(field => 
      !formData[field.name] || (typeof formData[field.name] === 'string' && !formData[field.name].trim())
    );
    
    if (hasEmptyRequired) {
      toast({
        title: "Erro de validação",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    createMutation.mutate(formData);
  };

  const handleDelete = (item: T) => {
    if (window.confirm(`Confirma a exclusão do ${entityName} "${item.name}"?`)) {
      deleteMutation.mutate(item.id);
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  // Renderizar campo do formulário
  const renderFormField = (field: FormField) => {
    const value = formData[field.name];
    
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            key={field.name}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="bg-white border border-input text-foreground placeholder:text-muted-foreground"
          />
        );
      
      case 'select':
        return (
          <Select key={field.name} value={value} onValueChange={(val) => handleFieldChange(field.name, val)}>
            <SelectTrigger className="bg-white border border-input">
              <SelectValue placeholder={field.placeholder || `Selecionar ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent className="bg-white border border-input">
              {field.options?.map((option) => (
                <SelectItem key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'checkbox':
        return (
          <label key={field.name} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              className="rounded border border-input"
            />
            <span className="text-sm">{field.label}</span>
          </label>
        );
      
      default: // text
        return (
          <Input
            key={field.name}
            type="text"
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="bg-white border border-input text-foreground placeholder:text-muted-foreground"
            required={field.required}
          />
        );
    }
  };

  // Renderer padrão de item
  const defaultItemRenderer = (item: T, onDelete: (item: T) => void) => (
    <div
      key={item.id}
      className="flex items-center justify-between p-4 bg-gray-50 border border-border rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="flex-1">
        <div className="font-medium text-foreground">{item.name}</div>
        {item.description && (
          <div className="text-sm text-muted-foreground mt-1">{item.description}</div>
        )}
        <div className="text-xs text-muted-foreground mt-1">
          Criado em {new Date(item.createdAt).toLocaleDateString('pt-BR')}
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
        onClick={() => onDelete(item)}
        disabled={deleteMutation.isPending}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <Card className="bg-white border border-border shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-foreground">{title}</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                {addButtonText}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white max-w-md">
              <DialogHeader>
                <DialogTitle>{dialogTitle}</DialogTitle>
                {dialogDescription && (
                  <DialogDescription>{dialogDescription}</DialogDescription>
                )}
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {formFields.map(renderFormField)}
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="ghost" className="mr-2">
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button 
                    type="submit" 
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={createMutation.isPending}
                  >
                    {addButtonText}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Controles de busca e ordenação */}
          {(enableSearch || enableSort) && (
            <div className="flex items-center space-x-2">
              {enableSearch && (
                <Input
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border border-input text-foreground placeholder:text-muted-foreground flex-1"
                />
              )}
              {enableSort && (
                <Select value={sortBy} onValueChange={(value: "name" | "created" | "alphabetical") => setSortBy(value)}>
                  <SelectTrigger className="w-48 bg-white border border-input">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-input">
                    <SelectItem value="alphabetical">Ordem Alfabética</SelectItem>
                    <SelectItem value="created">Mais Recentes</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
          
          {/* Contador de itens */}
          {!isLoading && (
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">
                {filteredAndSortedItems.length} {filteredAndSortedItems.length === 1 ? entityName : entityNamePlural}
                {searchTerm && ` encontrado${filteredAndSortedItems.length !== 1 ? 's' : ''} para "${searchTerm}"`}
              </span>
              {enableSort && (
                <span className="text-xs text-muted-foreground">
                  Ordenado por {sortBy === 'alphabetical' ? 'ordem alfabética' : 'mais recentes'}
                </span>
              )}
            </div>
          )}
          
          {/* Lista de itens */}
          <div className="space-y-3">
            {isLoading && (
              <div className="text-muted-foreground px-4 py-8 text-center">
                Carregando {entityNamePlural}...
              </div>
            )}
            {!isLoading && filteredAndSortedItems.length === 0 && (
              <div className="text-muted-foreground px-4 py-8 text-center">
                {emptyMessage || `Nenhum ${entityName} encontrado.`}
              </div>
            )}
            {!isLoading && filteredAndSortedItems.map((item) => 
              customItemRenderer ? customItemRenderer(item, handleDelete) : defaultItemRenderer(item, handleDelete)
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Create typed component with proper displayName
const BaseTypesManager = BaseTypesManagerImpl as <T extends BaseItem>(props: BaseTypesManagerProps<T>) => React.ReactElement;

// Add displayName to the component for debugging
(BaseTypesManager as any).displayName = 'BaseTypesManager';

export default BaseTypesManager;