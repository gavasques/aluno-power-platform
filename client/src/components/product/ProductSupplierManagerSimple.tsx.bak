/**
 * Simple Product Supplier Manager Component
 * Displays suppliers in a clean table format
 */

import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Download, Star, Package, Edit, Trash2, MoreHorizontal, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useProductSuppliers } from '@/hooks/useProductSuppliers';
import { useQueryClient } from '@tanstack/react-query';
import { formatCurrency } from '@shared/utils/formatters';

interface ProductSupplierManagerSimpleProps {
  productId: number;
  productName: string;
}

export const ProductSupplierManagerSimple: React.FC<ProductSupplierManagerSimpleProps> = ({
  productId,
  productName
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<any>(null);
  
  const queryClient = useQueryClient();

  const {
    suppliers,
    isLoading,
    stats,
    updateSupplier,
    deleteSupplier,
    isUpdating,
    isDeleting,
    refetch
  } = useProductSuppliers(productId);

  // Force refresh on mount to ensure fresh data
  React.useEffect(() => {
    refetch();
  }, [productId, refetch]);

  // Force cache clear and refresh
  const handleForceRefresh = () => {
    console.log('🔄 Force refresh - clearing cache for productId:', productId);
    queryClient.removeQueries({ queryKey: ['product-suppliers', productId] });
    queryClient.removeQueries({ queryKey: ['product-suppliers-stats', productId] });
    queryClient.invalidateQueries({ queryKey: ['product-suppliers', productId] });
    queryClient.invalidateQueries({ queryKey: ['product-suppliers-stats', productId] });
    refetch();
  };

  // Filter suppliers based on search term
  const filteredSuppliers = useMemo(() => {
    if (!searchTerm) return suppliers;
    
    const term = searchTerm.toLowerCase();
    return suppliers.filter(supplier => 
      supplier.supplier?.tradeName?.toLowerCase().includes(term) ||
      supplier.supplier?.corporateName?.toLowerCase().includes(term)
    );
  }, [suppliers, searchTerm]);

  // Debug logging
  console.log('🔍 ProductSupplierManager - ProductId:', productId);
  console.log('🔍 ProductSupplierManager - Current suppliers:', suppliers);
  console.log('🔍 ProductSupplierManager - Filtered suppliers:', filteredSuppliers);
  console.log('🔍 ProductSupplierManager - IsLoading:', isLoading);

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
  const handleEditSupplier = (supplier: any) => {
    setEditingSupplier({
      id: supplier.id,
      supplierProductCode: supplier.supplierProductCode || '',
      cost: supplier.cost || '',
      leadTimeDays: supplier.leadTimeDays || '',
      minimumOrderQuantity: supplier.minimumOrderQuantity || '',
      notes: supplier.notes || '',
      active: supplier.active
    });
    setEditDialogOpen(true);
  };

  // Handle supplier delete
  const handleDeleteSupplier = (supplier: any) => {
    setSupplierToDelete(supplier);
    setDeleteConfirmOpen(true);
  };

  // Save supplier changes
  const handleSaveSupplier = async () => {
    if (!editingSupplier) return;

    try {
      await updateSupplier(editingSupplier.id, {
        supplierProductCode: editingSupplier.supplierProductCode,
        cost: editingSupplier.cost ? parseFloat(editingSupplier.cost) : undefined,
        leadTimeDays: editingSupplier.leadTimeDays ? parseInt(editingSupplier.leadTimeDays) : undefined,
        minimumOrderQuantity: editingSupplier.minimumOrderQuantity ? parseInt(editingSupplier.minimumOrderQuantity) : undefined,
        notes: editingSupplier.notes,
        active: editingSupplier.active
      });
      setEditDialogOpen(false);
      setEditingSupplier(null);
    } catch (error) {
      console.error('Error updating supplier:', error);
    }
  };

  // Confirm supplier deletion
  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return;

    try {
      await deleteSupplier(supplierToDelete.id);
      setDeleteConfirmOpen(false);
      setSupplierToDelete(null);
    } catch (error) {
      console.error('Error deleting supplier:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
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
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {supplier.supplier?.tradeName?.substring(0, 2).toUpperCase() || 'LC'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-sm">
                            {supplier.supplier?.tradeName || 'Nome não disponível'}
                          </span>
                          {supplier.isPrimary && (
                            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              Principal
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {supplier.supplier?.corporateName || 'Razão social não informada'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">
                        {supplier.supplierProductCode || 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">
                        {supplier.cost ? formatCurrency(supplier.cost) : 'R$ NaN'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {supplier.leadTimeDays ? `${supplier.leadTimeDays}d` : 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {supplier.minimumOrderQuantity || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={supplier.active ? "default" : "secondary"}
                      className={supplier.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                    >
                      {supplier.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditSupplier(supplier)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteSupplier(supplier)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
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

      {/* Footer with supplier count */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span>
            {selectedSuppliers.length > 0 && (
              <Checkbox
                checked={true}
                onCheckedChange={() => setSelectedSuppliers([])}
                className="mr-2"
              />
            )}
            <span>
              {stats?.totalSuppliers || 0} fornecedor(es)
            </span>
          </span>
        </div>
      </div>

      {/* Edit Supplier Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Fornecedor</DialogTitle>
          </DialogHeader>
          {editingSupplier && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="supplierCode">Código do Produto no Fornecedor</Label>
                <Input
                  id="supplierCode"
                  value={editingSupplier.supplierProductCode}
                  onChange={(e) => setEditingSupplier(prev => ({
                    ...prev,
                    supplierProductCode: e.target.value
                  }))}
                  placeholder="Código do fornecedor"
                />
              </div>
              <div>
                <Label htmlFor="cost">Custo (R$)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={editingSupplier.cost}
                  onChange={(e) => setEditingSupplier(prev => ({
                    ...prev,
                    cost: e.target.value
                  }))}
                  placeholder="0,00"
                />
              </div>
              <div>
                <Label htmlFor="leadTime">Prazo de Entrega (dias)</Label>
                <Input
                  id="leadTime"
                  type="number"
                  value={editingSupplier.leadTimeDays}
                  onChange={(e) => setEditingSupplier(prev => ({
                    ...prev,
                    leadTimeDays: e.target.value
                  }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="minQuantity">Quantidade Mínima</Label>
                <Input
                  id="minQuantity"
                  type="number"
                  value={editingSupplier.minimumOrderQuantity}
                  onChange={(e) => setEditingSupplier(prev => ({
                    ...prev,
                    minimumOrderQuantity: e.target.value
                  }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={editingSupplier.notes}
                  onChange={(e) => setEditingSupplier(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  placeholder="Observações sobre este fornecedor"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={editingSupplier.active}
                  onCheckedChange={(checked) => setEditingSupplier(prev => ({
                    ...prev,
                    active: checked
                  }))}
                />
                <Label htmlFor="active">Fornecedor ativo</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveSupplier} disabled={isUpdating}>
              {isUpdating ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja remover o fornecedor "{supplierToDelete?.supplier?.tradeName}" deste produto?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};