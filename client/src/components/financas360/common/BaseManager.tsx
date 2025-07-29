// Componente base reutilizável para managers do Finanças 360
// Seguindo princípios SOLID: Single Responsibility, DRY, Interface Segregation

import React, { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { useDeleteConfirmation } from '@/hooks/useFinancas360Api';
import { LoadingState, ErrorState, EmptyState as UIEmptyState } from '@/components/ui/states';
import { useModalState, CrudModal } from '@/components/ui/modals';

// Interface para props do componente base
export interface BaseManagerProps<T> {
  title: string;
  icon: ReactNode;
  entityName: string;
  data: T[];
  isLoading: boolean;
  error: Error | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  onCreate: (data: any) => void;
  onUpdate: (id: number, data: any) => void;
  onDelete: (id: number) => void;
  onRefetch: () => void;
  renderForm: (editingItem: T | null, onSubmit: (data: any) => void, onClose: () => void) => ReactNode;
  renderList: (items: T[], onEdit: (item: T) => void, onDelete: (id: number) => void) => ReactNode;
  searchFields?: (keyof T)[];
  filterComponent?: ReactNode;
  additionalActions?: ReactNode;
}

// Estado do componente base
interface BaseManagerState<T> {
  isDialogOpen: boolean;
  editingItem: T | null;
  searchTerm: string;
}

// Componente base genérico
export function BaseManager<T extends { id: number }>({
  title,
  icon,
  entityName,
  data,
  isLoading,
  error,
  isCreating,
  isUpdating,
  isDeleting,
  onCreate,
  onUpdate,
  onDelete,
  onRefetch,
  renderForm,
  renderList,
  searchFields = [],
  filterComponent,
  additionalActions
}: BaseManagerProps<T>) {
  const [state, setState] = useState<BaseManagerState<T>>({
    isDialogOpen: false,
    editingItem: null,
    searchTerm: ''
  });

  const confirmDelete = useDeleteConfirmation();

  // Função para filtrar dados baseada na busca
  const filteredData = data.filter(item => {
    if (!state.searchTerm) return true;
    
    return searchFields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(state.searchTerm.toLowerCase());
      }
      if (typeof value === 'number') {
        return value.toString().includes(state.searchTerm);
      }
      return false;
    });
  });

  // Handlers
  const handleCreate = () => {
    setState(prev => ({ 
      ...prev, 
      editingItem: null, 
      isDialogOpen: true 
    }));
  };

  const handleEdit = (item: T) => {
    setState(prev => ({ 
      ...prev, 
      editingItem: item, 
      isDialogOpen: true 
    }));
  };

  const handleDelete = (id: number) => {
    confirmDelete(entityName.toLowerCase(), () => onDelete(id));
  };

  const handleSubmit = (data: any) => {
    if (state.editingItem) {
      onUpdate(state.editingItem.id, data);
    } else {
      onCreate(data);
    }
  };

  const handleCloseDialog = () => {
    setState(prev => ({ 
      ...prev, 
      isDialogOpen: false, 
      editingItem: null 
    }));
  };

  const handleSearchChange = (value: string) => {
    setState(prev => ({ ...prev, searchTerm: value }));
  };

  // Loading state - usando componente reutilizável
  if (isLoading) {
    return <LoadingState message={`Carregando ${entityName.toLowerCase()}...`} />;
  }

  // Error state - usando componente reutilizável
  if (error) {
    return (
      <ErrorState 
        error={`Erro ao carregar ${entityName.toLowerCase()}: ${error.message}`}
        onRetry={onRefetch}
      />
    );
  }

  // Empty state - quando não há dados
  if (filteredData.length === 0 && !state.searchTerm) {
    return (
      <UIEmptyState
        title={`Nenhum ${entityName.toLowerCase()} encontrado`}
        description={`Comece criando seu primeiro ${entityName.toLowerCase()}.`}
        actionLabel={`Criar ${entityName}`}
        onAction={handleCreate}
        variant="create"
      />
    );
  }

  // No results state - quando há busca mas nenhum resultado
  if (filteredData.length === 0 && state.searchTerm) {
    return (
      <UIEmptyState
        title="Nenhum resultado encontrado"
        description={`Nenhum ${entityName.toLowerCase()} corresponde à busca "${state.searchTerm}".`}
        variant="search"
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {icon}
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {additionalActions}
          
          <Dialog open={state.isDialogOpen} onOpenChange={handleCloseDialog}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo {entityName}
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>
                  {state.editingItem ? `Editar ${entityName}` : `Novo ${entityName}`}
                </DialogTitle>
              </DialogHeader>
              
              {renderForm(state.editingItem, handleSubmit, handleCloseDialog)}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex items-center gap-4 mb-6">
        {searchFields.length > 0 && (
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={`Buscar ${entityName.toLowerCase()}...`}
                value={state.searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}
        
        {filterComponent}
        
        <Button
          variant="outline"
          onClick={onRefetch}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Lista */}
      {filteredData.length === 0 ? (
        <EmptyState 
          entityName={entityName}
          hasSearch={state.searchTerm.length > 0}
          onCreate={handleCreate}
        />
      ) : (
        renderList(filteredData, handleEdit, handleDelete)
      )}
    </div>
  );
}

// Componente para estado vazio
interface EmptyStateProps {
  entityName: string;
  hasSearch: boolean;
  onCreate: () => void;
}

function EmptyState({ entityName, hasSearch, onCreate }: EmptyStateProps) {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <div className="text-gray-400 mb-4 text-4xl">📋</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {hasSearch 
            ? `Nenhum ${entityName.toLowerCase()} encontrado`
            : `Nenhum ${entityName.toLowerCase()} cadastrado`
          }
        </h3>
        <p className="text-gray-600 mb-4">
          {hasSearch 
            ? 'Tente ajustar os filtros de busca'
            : `Comece criando seu primeiro ${entityName.toLowerCase()}`
          }
        </p>
        {!hasSearch && (
          <Button onClick={onCreate} className="flex items-center gap-2 mx-auto">
            <Plus className="h-4 w-4" />
            Criar {entityName}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Hook para gerenciar estado do formulário
export function useFormState<T>(initialState: T) {
  const [formData, setFormData] = useState<T>(initialState);

  const updateField = <K extends keyof T>(field: K, value: T[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(initialState);
  };

  const setFormData_safe = (data: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  return {
    formData,
    setFormData: setFormData_safe,
    updateField,
    resetForm
  };
}

// Componente para botões de ação em cards
interface CardActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function CardActions({ onEdit, onDelete, isDeleting = false }: CardActionsProps) {
  return (
    <div className="flex gap-1">
      <Button size="sm" variant="outline" onClick={onEdit}>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={onDelete}
        disabled={isDeleting}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </Button>
    </div>
  );
}

// Componente para status badge
interface StatusBadgeProps {
  isActive: boolean;
  activeText?: string;
  inactiveText?: string;
}

export function StatusBadge({ 
  isActive, 
  activeText = 'Ativo', 
  inactiveText = 'Inativo' 
}: StatusBadgeProps) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      isActive 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      {isActive ? activeText : inactiveText}
    </span>
  );
}

// Componente para form actions
interface FormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitText?: string;
  cancelText?: string;
}

export function FormActions({ 
  onCancel, 
  onSubmit, 
  isSubmitting, 
  submitText = 'Salvar',
  cancelText = 'Cancelar'
}: FormActionsProps) {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t">
      <Button type="button" variant="outline" onClick={onCancel}>
        {cancelText}
      </Button>
      <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : submitText}
      </Button>
    </div>
  );
}