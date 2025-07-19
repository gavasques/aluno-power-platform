/**
 * ProductSupplierManagerRefactored.tsx
 * Refactored Product Supplier Manager Component
 * Displays suppliers for a product with clean table format and proper data handling
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Filter, Download, Star, Package, Edit, Trash2, MoreHorizontal, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@shared/utils/formatters';

interface ProductSupplierManagerRefactoredProps {
  productId: number;
  productName: string;
}

interface ProductSupplier {
  id: number;
  productId: number;
  supplierId: number;
  supplierCode?: string;
  cost?: number;
  isPrimary: boolean;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  supplier: {
    id: number;
    tradeName: string;
    corporateName: string;
    logo?: string;
    description?: string;
  };
}

export default function ProductSupplierManagerRefactored({ 
  productId, 
  productName 
}: ProductSupplierManagerRefactoredProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<any>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch product suppliers with error handling
  const {
    data: suppliersResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [`/api/products/${productId}/suppliers`],
    queryFn: async () => {
      console.log('🔍 ProductSupplierManagerRefactored - Fetching suppliers for productId:', productId);
      const response = await apiRequest(`/api/products/${productId}/suppliers`);
      console.log('🔍 ProductSupplierManagerRefactored - Raw API response:', response);
      if (response?.data) {
        console.log('🔍 ProductSupplierManagerRefactored - API returned suppliers with IDs:', response.data.map((s: any) => s.id));
      }
      return response;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const suppliers: ProductSupplier[] = suppliersResponse?.data || [];

  // Filter suppliers based on search term
  const filteredSuppliers = useMemo(() => {
    if (!searchTerm) return suppliers;
    
    const term = searchTerm.toLowerCase();
    return suppliers.filter(supplier => 
      supplier.supplier?.tradeName?.toLowerCase().includes(term) ||
      supplier.supplier?.corporateName?.toLowerCase().includes(term) ||
      supplier.supplierCode?.toLowerCase().includes(term)
    );
  }, [suppliers, searchTerm]);

  // Delete supplier mutation
  const deleteSupplierMutation = useMutation({
    mutationFn: async (supplierId: number) => {
      console.log('🔍 ProductSupplierManagerRefactored - Delete mutation called with supplierId:', supplierId);
      console.log('🔍 ProductSupplierManagerRefactored - Delete URL:', `/api/products/${productId}/suppliers/${supplierId}`);
      
      const response = await apiRequest(`/api/products/${productId}/suppliers/${supplierId}`, {
        method: 'DELETE'
      });
      
      console.log('🔍 ProductSupplierManagerRefactored - Delete response:', response);
      return response;
    },
    onSuccess: (data) => {
      console.log('🔍 ProductSupplierManagerRefactored - Delete success:', data);
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/suppliers`] });
      toast({
        title: 'Fornecedor removido',
        description: 'Fornecedor foi removido do produto com sucesso.',
      });
      setDeleteConfirmOpen(false);
      setSupplierToDelete(null);
    },
    onError: (error: any) => {
      console.error('🔍 ProductSupplierManagerRefactored - Delete error:', error);
      toast({
        title: 'Erro ao remover fornecedor',
        description: error.message || 'Ocorreu um erro ao remover o fornecedor.',
        variant: 'destructive'
      });
    }
  });

  // Update supplier mutation
  const updateSupplierMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest(`/api/products/${productId}/suppliers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/suppliers`] });
      toast({
        title: 'Fornecedor atualizado',
        description: 'Dados do fornecedor foram atualizados com sucesso.',
      });
      setEditDialogOpen(false);
      setEditingSupplier(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar fornecedor',
        description: error.message || 'Ocorreu um erro ao atualizar o fornecedor.',
        variant: 'destructive'
      });
    }
  });

  // Force cache clear and refresh
  const handleForceRefresh = async () => {
    console.log('🔄 Force refresh - clearing cache for productId:', productId);
    queryClient.removeQueries({ queryKey: [`/api/products/${productId}/suppliers`] });
    queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/suppliers`] });
    await refetch();
    console.log('🔄 Force refresh - completed');
  };

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSuppliers(filteredSuppliers.map(s => s.id));
    } else {
      setSelectedSuppliers([]);
    }
  };

  // Handle individual supplier selection
  const handleSupplierSelect = (supplierId: number, checked: boolean) => {
    if (checked) {
      setSelectedSuppliers(prev => [...prev, supplierId]);
    } else {
      setSelectedSuppliers(prev => prev.filter(id => id !== supplierId));
    }
  };

  // Handle supplier edit
  const handleEditSupplier = (supplier: ProductSupplier) => {
    setEditingSupplier({
      id: supplier.id,
      supplierCode: supplier.supplierCode || '',
      cost: supplier.cost || '',
      notes: supplier.notes || '',
      active: supplier.active
    });
    setEditDialogOpen(true);
  };

  // Handle supplier deletion
  const handleDeleteSupplier = (supplier: ProductSupplier) => {
    console.log('🔍 ProductSupplierManagerRefactored - handleDeleteSupplier called with:', supplier);
    setSupplierToDelete(supplier);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!supplierToDelete) return;

    try {
      await deleteSupplierMutation.mutateAsync(supplierToDelete.id);
    } catch (error) {
      console.error('Error deleting supplier:', error);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingSupplier) return;

    try {
      await updateSupplierMutation.mutateAsync({
        id: editingSupplier.id,
        data: {
          supplierCode: editingSupplier.supplierCode,
          cost: editingSupplier.cost ? parseFloat(editingSupplier.cost) : null,
          notes: editingSupplier.notes,
          active: editingSupplier.active
        }
      });
    } catch (error) {
      console.error('Error updating supplier:', error);
    }
  };

  // Debug logging
  console.log('🔍 ProductSupplierManagerRefactored - ProductId:', productId);
  console.log('🔍 ProductSupplierManagerRefactored - Response:', suppliersResponse);
  console.log('🔍 ProductSupplierManagerRefactored - Suppliers:', suppliers);
  console.log('🔍 ProductSupplierManagerRefactored - Filtered suppliers:', filteredSuppliers);
  console.log('🔍 ProductSupplierManagerRefactored - IsLoading:', isLoading);
  console.log('🔍 ProductSupplierManagerRefactored - Error:', error);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="text-red-600">Erro ao carregar fornecedores: {error.message}</p>
          <Button onClick={handleForceRefresh} variant="outline" className="mt-2">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Fornecedores do Produto</h3>
          <p className="text-sm text-gray-600">Gerencie os fornecedores para {productName}</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Fornecedor
        </Button>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar fornecedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleForceRefresh}>
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedSuppliers.length === filteredSuppliers.length && filteredSuppliers.length > 0}
                  onCheckedChange={handleSelectAll}
                  {...(selectedSuppliers.length > 0 && selectedSuppliers.length < filteredSuppliers.length 
                    ? { "data-indeterminate": "true" } 
                    : {})}
                />
              </TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead className="w-20">Código</TableHead>
              <TableHead className="w-24">Custo</TableHead>
              <TableHead className="w-20">Entrega</TableHead>
              <TableHead className="w-20">Qtd. Mín.</TableHead>
              <TableHead className="w-20">Status</TableHead>
              <TableHead className="w-16">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <Package className="h-8 w-8 text-gray-400" />
                    <p>Nenhum fornecedor encontrado</p>
                    <p className="text-sm">Adicione fornecedores para este produto</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Checkbox
                      checked={selectedSuppliers.includes(supplier.id)}
                      onCheckedChange={(checked) => handleSupplierSelect(supplier.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        {supplier.supplier?.logo ? (
                          <img 
                            src={supplier.supplier.logo} 
                            alt="" 
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-medium text-gray-600">
                            {supplier.supplier?.tradeName?.charAt(0) || 'F'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {supplier.supplier?.tradeName || 'N/A'}
                          </span>
                          {supplier.isPrimary && (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <Star className="h-3 w-3 fill-current" />
                              Principal
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {supplier.supplier?.corporateName || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">
                      {supplier.supplierCode || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {supplier.cost ? formatCurrency(supplier.cost) : 'R$ NaN'}
                  </TableCell>
                  <TableCell className="text-center">N/A</TableCell>
                  <TableCell className="text-center">N/A</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={supplier.active ? 'default' : 'secondary'}>
                      {supplier.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditSupplier(supplier)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteSupplier(supplier)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Statistics */}
      <div className="text-sm text-gray-500">
        {filteredSuppliers.length} fornecedor(es)
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Fornecedor</DialogTitle>
          </DialogHeader>
          {editingSupplier && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="supplierCode">Código do Fornecedor</Label>
                <Input
                  id="supplierCode"
                  value={editingSupplier.supplierCode}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, supplierCode: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="cost">Custo</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={editingSupplier.cost}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, cost: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={editingSupplier.notes}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, notes: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={editingSupplier.active}
                  onCheckedChange={(checked) => setEditingSupplier({ ...editingSupplier, active: checked })}
                />
                <Label htmlFor="active">Ativo</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateSupplierMutation.isPending}>
              {updateSupplierMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Remoção</DialogTitle>
          </DialogHeader>
          <p>
            Tem certeza que deseja remover o fornecedor{' '}
            <strong>{supplierToDelete?.supplier?.tradeName}</strong> deste produto?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteSupplierMutation.isPending}
            >
              {deleteSupplierMutation.isPending ? 'Removendo...' : 'Remover'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}