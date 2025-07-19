import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Search, Plus, Edit, Trash2, Download, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  TableLoadingState, 
  LoadingButton, 
  SkeletonTable 
} from '@/components/common/LoadingStates';
import { useCrudQuery } from '@/hooks/useCrudQuery';
import { BaseCrudService } from '@/lib/services/base/BaseCrudService';

/**
 * Generic Entity Manager Component
 * Eliminates 15+ duplicated Manager components across the codebase
 * 
 * Replaces:
 * - PartnersManager
 * - SuppliersManager 
 * - MaterialsManager
 * - ToolsManager
 * - All type managers (PartnerTypesManager, MaterialTypesManager, etc.)
 */

interface EntityManagerProps<T, CreateT = Partial<T>, UpdateT = Partial<T>> {
  // Entity configuration
  entityName: string;
  entityNamePlural: string;
  service: BaseCrudService<T, CreateT, UpdateT>;
  
  // Table configuration
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  
  // Form configuration
  FormComponent: React.ComponentType<{
    data?: T;
    onSubmit: (data: CreateT | UpdateT) => void;
    onCancel: () => void;
    isLoading?: boolean;
  }>;
  
  // Optional features
  enableSearch?: boolean;
  enableCreate?: boolean;
  enableEdit?: boolean;
  enableDelete?: boolean;
  enableBulkOperations?: boolean;
  enableExport?: boolean;
  enableImport?: boolean;
  
  // Custom actions
  customActions?: Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (item: T) => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  }>;
  
  // Custom filters
  customFilters?: React.ReactNode;
  
  // Permissions
  permissions?: {
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
    export?: boolean;
    import?: boolean;
  };
  
  // Custom styling
  className?: string;
  tableClassName?: string;
  headerClassName?: string;
}

export function EntityManager<T extends { id: number | string }, CreateT = Partial<T>, UpdateT = Partial<T>>({
  entityName,
  entityNamePlural,
  service,
  columns,
  searchPlaceholder = `Buscar ${entityNamePlural.toLowerCase()}...`,
  searchFields,
  FormComponent,
  enableSearch = true,
  enableCreate = true,
  enableEdit = true,
  enableDelete = true,
  enableBulkOperations = false,
  enableExport = false,
  enableImport = false,
  customActions = [],
  customFilters,
  permissions = {},
  className = "",
  tableClassName = "",
  headerClassName = ""
}: EntityManagerProps<T, CreateT, UpdateT>) {
  
  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | undefined>();
  const [selectedItems, setSelectedItems] = useState<(number | string)[]>([]);

  // CRUD operations using unified hook
  const crudQuery = useCrudQuery(entityNamePlural.toLowerCase(), service, {
    successMessages: {
      create: `${entityName} criado com sucesso`,
      update: `${entityName} atualizado com sucesso`,
      delete: `${entityName} excluído com sucesso`,
    },
    errorMessages: {
      create: `Erro ao criar ${entityName.toLowerCase()}`,
      update: `Erro ao atualizar ${entityName.toLowerCase()}`,
      delete: `Erro ao excluir ${entityName.toLowerCase()}`,
    }
  });

  const { data: items = [], isLoading } = crudQuery.useGetAll();
  const createMutation = crudQuery.useCreate();
  const updateMutation = crudQuery.useUpdate();
  const deleteMutation = crudQuery.useDelete();
  const bulkDeleteMutation = crudQuery.useBulkDelete();

  // Permission checks
  const canCreate = permissions.create !== false && enableCreate;
  const canEdit = permissions.edit !== false && enableEdit;
  const canDelete = permissions.delete !== false && enableDelete;
  const canExport = permissions.export !== false && enableExport;
  const canImport = permissions.import !== false && enableImport;

  // Filter items based on search
  const filteredItems = React.useMemo(() => {
    if (!searchTerm || !enableSearch) return items;
    
    return items.filter((item: any) => {
      if (searchFields) {
        return searchFields.some(field => {
          const value = item[field];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
      } else {
        // Default search - check common fields
        return Object.values(item).some(value => 
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    });
  }, [items, searchTerm, searchFields, enableSearch]);

  // Event handlers
  const handleCreate = () => {
    setEditingItem(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: T) => {
    if (!canEdit) return;
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number | string) => {
    if (!canDelete) return;
    
    if (confirm(`Tem certeza que deseja excluir este ${entityName.toLowerCase()}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleBulkDelete = async () => {
    if (!canDelete || selectedItems.length === 0) return;
    
    if (confirm(`Tem certeza que deseja excluir ${selectedItems.length} ${entityNamePlural.toLowerCase()}?`)) {
      bulkDeleteMutation.mutate(selectedItems);
      setSelectedItems([]);
    }
  };

  const handleFormSubmit = async (data: CreateT | UpdateT) => {
    if (editingItem) {
      updateMutation.mutate(
        { id: editingItem.id, data: data as UpdateT },
        { onSuccess: () => setIsDialogOpen(false) }
      );
    } else {
      createMutation.mutate(
        data as CreateT,
        { onSuccess: () => setIsDialogOpen(false) }
      );
    }
  };

  const handleFormCancel = () => {
    setIsDialogOpen(false);
    setEditingItem(undefined);
  };

  const handleSelectItem = (id: number | string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className={className}>
      <Card>
        <CardHeader className={headerClassName}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>{entityNamePlural}</CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Search */}
              {enableSearch && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex gap-2">
                {canImport && (
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Importar
                  </Button>
                )}
                
                {canExport && (
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                )}
                
                {canCreate && (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={handleCreate}>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo {entityName}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingItem ? `Editar ${entityName}` : `Novo ${entityName}`}
                        </DialogTitle>
                      </DialogHeader>
                      <FormComponent
                        data={editingItem}
                        onSubmit={handleFormSubmit}
                        onCancel={handleFormCancel}
                        isLoading={isFormLoading}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </div>
          
          {/* Custom filters */}
          {customFilters}
          
          {/* Bulk actions */}
          {enableBulkOperations && selectedItems.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded">
              <span className="text-sm text-muted-foreground">
                {selectedItems.length} item(s) selecionado(s)
              </span>
              {canDelete && (
                <LoadingButton
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  loading={bulkDeleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Selecionados
                </LoadingButton>
              )}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-0">
          {isLoading ? (
            <SkeletonTable rows={5} className="p-6" />
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm 
                  ? `Nenhum ${entityName.toLowerCase()} encontrado com "${searchTerm}"`
                  : `Nenhum ${entityName.toLowerCase()} cadastrado`
                }
              </p>
              {canCreate && !searchTerm && (
                <Button onClick={handleCreate} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeiro {entityName.toLowerCase()}
                </Button>
              )}
            </div>
          ) : (
            <div className={tableClassName}>
              <Table>
                <TableHeader>
                  <TableRow>
                    {enableBulkOperations && (
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === filteredItems.length}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </TableHead>
                    )}
                    {columns.map((column, index) => (
                      <TableHead key={index}>
                        {typeof column.header === 'string' ? column.header : 'Header'}
                      </TableHead>
                    ))}
                    {(canEdit || canDelete || customActions.length > 0) && (
                      <TableHead>Ações</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      {enableBulkOperations && (
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                            className="rounded border-gray-300"
                          />
                        </TableCell>
                      )}
                      {columns.map((column, index) => (
                        <TableCell key={index}>
                          {typeof column.cell === 'function' 
                            ? column.cell({ row: { original: item } } as any)
                            : (item as any)[column.accessorKey as string]
                          }
                        </TableCell>
                      ))}
                      {(canEdit || canDelete || customActions.length > 0) && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {customActions.map((action, index) => (
                              <Button
                                key={index}
                                variant={action.variant || "ghost"}
                                size="sm"
                                onClick={() => action.onClick(item)}
                              >
                                {action.icon && <action.icon className="h-4 w-4" />}
                                {action.label}
                              </Button>
                            ))}
                            
                            {canDelete && (
                              <LoadingButton
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                                loading={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </LoadingButton>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default EntityManager;