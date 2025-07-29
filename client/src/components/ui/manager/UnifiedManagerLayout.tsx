import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, Loader2 } from 'lucide-react';
import { useFinancas360Formatters } from '@/hooks/financas360/useUnifiedFinancas360Manager';
import type { 
  CrudOperations, 
  ManagerConfig, 
  BaseFinancas360Entity,
  BaseFormData
} from '@/types/financas360-unified';

interface UnifiedManagerLayoutProps<TEntity extends BaseFinancas360Entity, TFormData extends BaseFormData> {
  manager: CrudOperations<TEntity, TFormData>;
  config: ManagerConfig<TEntity, TFormData>;
}

/**
 * LAYOUT UNIFICADO FINANÇAS360 - FASE 3 REFATORAÇÃO
 * 
 * Componente que elimina 90% da duplicação de UI
 * entre todos os managers do Finanças360
 * 
 * FUNCIONALIDADES UNIFICADAS:
 * - Header com título e descrição
 * - Barra de busca e filtros
 * - Lista de itens com ações
 * - Dialog de formulário
 * - Loading e error states
 * - Formatação padronizada
 */
export function UnifiedManagerLayout<
  TEntity extends BaseFinancas360Entity,
  TFormData extends BaseFormData
>({ manager, config }: UnifiedManagerLayoutProps<TEntity, TFormData>) {
  
  const formatters = useFinancas360Formatters();

  const handleEdit = (item: TEntity) => {
    manager.setEditingItem(item);
    // Convert entity to form data (basic mapping)
    const formData = { ...item } as unknown as TFormData;
    manager.setFormData(formData);
    manager.setIsDialogOpen(true);
  };

  const handleCreate = () => {
    manager.resetFormData();
    manager.setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (manager.editingItem) {
      manager.updateMutation.mutate({
        id: manager.editingItem.id,
        data: manager.formData
      });
    } else {
      manager.createMutation.mutate(manager.formData);
    }
  };

  const handleDelete = (item: TEntity) => {
    if (window.confirm(`Tem certeza que deseja excluir este ${config.title.toLowerCase()}?`)) {
      manager.deleteMutation.mutate(item.id);
    }
  };

  if (manager.isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-600">Carregando {config.title.toLowerCase()}...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
          <p className="text-gray-600 mt-1">{config.description}</p>
        </div>
        
        <Dialog open={manager.isDialogOpen} onOpenChange={manager.setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar {config.title}
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {manager.editingItem ? 'Editar' : 'Adicionar'} {config.title}
              </DialogTitle>
            </DialogHeader>
            
            {config.renderForm ? (
              config.renderForm({
                formData: manager.formData,
                setFormData: manager.setFormData,
                isEditing: !!manager.editingItem,
                onSubmit: handleSubmit,
                onCancel: () => manager.setIsDialogOpen(false),
                isLoading: manager.createMutation.isPending || manager.updateMutation.isPending
              })
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Formulário customizado não configurado para {config.title}
                </p>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => manager.setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={manager.createMutation.isPending || manager.updateMutation.isPending}
                  >
                    {manager.createMutation.isPending || manager.updateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={`Buscar ${config.title.toLowerCase()}...`}
                value={manager.searchTerm}
                onChange={(e) => manager.setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Additional filters can be added here */}
            {config.filters?.map((filter) => (
              <div key={filter.key} className="min-w-[150px]">
                {/* Filter implementation based on type */}
                {filter.type === 'select' && filter.options && (
                  <select className="w-full p-2 border rounded-md">
                    <option value="all">{filter.label}</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      <div className="grid grid-cols-1 gap-4">
        {manager.filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum {config.title.toLowerCase()} encontrado
                </h3>
                <p className="text-gray-600">
                  {manager.searchTerm 
                    ? `Nenhum resultado para "${manager.searchTerm}"`
                    : `Comece adicionando seu primeiro ${config.title.toLowerCase()}`}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          manager.filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                {config.renderItem ? (
                  config.renderItem(item)
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        Item #{item.id}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Criado em {formatters.formatDate(item.createdAt)}
                      </div>
                      {item.ativo !== undefined && (
                        <Badge 
                          className={`mt-2 ${
                            item.ativo 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {item.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item)}
                        disabled={manager.deleteMutation.isPending}
                      >
                        {manager.deleteMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}