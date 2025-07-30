/**
 * OptimizedBaseManager - Nova versão usando arquitetura consolidada
 * Elimina prop drilling e duplicação de estado
 */

import React, { useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useEntityOperations } from '@/shared/hooks/useEntityOperations';
import { useModals, useGlobalSearch } from '@/contexts/UIContext';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';

// Interface otimizada (menos props)
export interface OptimizedBaseManagerProps<T> {
  title: string;
  icon: ReactNode;
  entityName: string;
  queryKey: string;
  entityDisplayName?: string;
  renderForm: (editingItem: T | null, onSubmit: (data: any) => void) => ReactNode;
  renderList: (items: T[], onEdit: (item: T) => void, onDelete: (id: number) => void) => ReactNode;
  searchFields?: (keyof T)[];
  filterComponent?: ReactNode;
  additionalActions?: ReactNode;
  endpoint?: string;
}

// Componente principal otimizado
export function OptimizedBaseManager<T extends { id: number }>({
  title,
  icon,
  entityName,
  queryKey,
  entityDisplayName,
  renderForm,
  renderList,
  searchFields = [],
  filterComponent,
  additionalActions,
  endpoint
}: OptimizedBaseManagerProps<T>) {
  
  // Estados locais (apenas UI state)
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<T | null>(null);

  // Hooks consolidados da nova arquitetura
  const modals = useModals();
  
  // TanStack Query para dados (elimina estado duplicado)
  const {
    data: items = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [queryKey],
    queryFn: () => apiRequest<T[]>(endpoint || `/api/${entityName}`),
  });

  // Hook de operações CRUD (elimina duplicação)
  const operations = useEntityOperations<T>({
    entityName,
    entityDisplayName: entityDisplayName || title,
    queryKey,
    endpoints: endpoint ? {
      create: endpoint,
      update: endpoint,
      delete: endpoint,
    } : undefined,
  });

  // Filtros de busca
  const filteredItems = items.filter(item => {
    if (!searchTerm) return true;
    
    return searchFields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      }
      if (typeof value === 'number') {
        return value.toString().includes(searchTerm);
      }
      return false;
    });
  });

  // Handlers otimizados
  const handleCreate = () => {
    setEditingItem(null);
    modals.open(`${entityName}-form`);
  };

  const handleEdit = (item: T) => {
    setEditingItem(item);
    modals.open(`${entityName}-form`);
  };

  const handleDelete = (id: number) => {
    if (confirm(`Deseja excluir este ${entityDisplayName?.toLowerCase() || 'item'}?`)) {
      operations.remove(id);
    }
  };

  const handleSubmit = (data: any) => {
    if (editingItem) {
      operations.update(editingItem.id, data);
    } else {
      operations.create(data);
    }
    modals.close(`${entityName}-form`);
  };

  const handleCloseDialog = () => {
    modals.close(`${entityName}-form`);
    setEditingItem(null);
  };

  // Estados de carregamento
  if (isLoading) {
    return <LoadingState message={`Carregando ${title.toLowerCase()}...`} />;
  }

  // Estados de erro
  if (error) {
    return (
      <ErrorState 
        title={`Erro ao carregar ${title.toLowerCase()}`}
        description={error.message}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header otimizado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              {/* Busca */}
              {searchFields.length > 0 && (
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder={`Buscar ${title.toLowerCase()}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}
              
              {/* Filtros adicionais */}
              {filterComponent}
            </div>

            <div className="flex gap-2">
              {/* Ações adicionais */}
              {additionalActions}
              
              {/* Botão de atualizar */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>

              {/* Botão de criar */}
              <Button 
                onClick={handleCreate}
                disabled={operations.isCreating}
              >
                <Plus className="w-4 h-4 mr-2" />
                {operations.isCreating ? 'Criando...' : `Criar ${entityDisplayName || title}`}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de itens */}
      {filteredItems.length === 0 ? (
        <EmptyState
          title={`Nenhum ${title.toLowerCase()} encontrado`}
          description={
            searchTerm 
              ? `Nenhum resultado para "${searchTerm}"`
              : `Você ainda não possui ${title.toLowerCase()}. Clique em "Criar" para adicionar o primeiro.`
          }
          action={
            !searchTerm ? (
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Criar {entityDisplayName || title}
              </Button>
            ) : undefined
          }
        />
      ) : (
        renderList(filteredItems, handleEdit, handleDelete)
      )}

      {/* Modal de formulário */}
      <Dialog 
        open={modals.openModals.has(`${entityName}-form`)} 
        onOpenChange={(open) => !open && handleCloseDialog()}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar' : 'Criar'} {entityDisplayName || title}
            </DialogTitle>
          </DialogHeader>
          {renderForm(editingItem, handleSubmit)}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Hook auxiliar para usar o manager otimizado
export function useOptimizedManager<T extends { id: number }>(config: {
  entityName: string;
  queryKey: string;
  entityDisplayName?: string;
  endpoint?: string;
}) {
  const operations = useEntityOperations<T>({
    entityName: config.entityName,
    entityDisplayName: config.entityDisplayName,
    queryKey: config.queryKey,
    endpoints: config.endpoint ? {
      create: config.endpoint,
      update: config.endpoint,
      delete: config.endpoint,
    } : undefined,
  });

  const query = useQuery({
    queryKey: [config.queryKey],
    queryFn: () => apiRequest<T[]>(config.endpoint || `/api/${config.entityName}`),
  });

  return {
    ...operations,
    ...query,
    items: query.data || [],
  };
}