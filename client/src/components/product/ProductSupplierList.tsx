/**
 * Product Supplier List Component
 * 
 * SOLID Principles Applied:
 * - SRP: Single responsibility for supplier list display
 * - OCP: Open for extension with new list operations
 * - LSP: Consistent list component interface
 * - ISP: Interface segregation with focused props
 * - DIP: Depends on abstractions through props
 */

import React, { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  Star, 
  StarOff, 
  Building, 
  Package, 
  Clock, 
  DollarSign, 
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { formatCurrency } from '@/shared/utils/formatters';
import type { ProductSupplier } from '@/shared/types/productSupplier';

interface ProductSupplierListProps {
  suppliers: ProductSupplier[];
  onEdit: (supplier: ProductSupplier) => void;
  onDelete: (supplierId: number) => void;
  onSetPrimary: (supplierId: number) => void;
  onSelectionChange: (supplierIds: number[]) => void;
  isDeleting?: boolean;
  isSettingPrimary?: boolean;
  selectedSuppliers?: number[];
}

export const ProductSupplierList: React.FC<ProductSupplierListProps> = ({
  suppliers,
  onEdit,
  onDelete,
  onSetPrimary,
  onSelectionChange,
  isDeleting = false,
  isSettingPrimary = false,
  selectedSuppliers = []
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Handle individual supplier selection
  const handleSupplierSelection = (supplierId: number, checked: boolean) => {
    let newSelection = [...selectedSuppliers];
    if (checked) {
      newSelection.push(supplierId);
    } else {
      newSelection = newSelection.filter(id => id !== supplierId);
    }
    onSelectionChange(newSelection);
  };

  // Handle select all suppliers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(suppliers.map(s => s.id));
    } else {
      onSelectionChange([]);
    }
  };

  // Handle delete with confirmation
  const handleDelete = (supplierId: number) => {
    setDeleteConfirmId(supplierId);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  // Helper function to get supplier initials
  const getSupplierInitials = (supplier: ProductSupplier) => {
    const name = supplier.supplier?.tradeName || 'N/A';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  // All suppliers selected check
  const allSelected = suppliers.length > 0 && selectedSuppliers.length === suppliers.length;
  const someSelected = selectedSuppliers.length > 0 && selectedSuppliers.length < suppliers.length;

  return (
    <div className="space-y-4">
      {/* Header with bulk selection */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {selectedSuppliers.length > 0 
              ? `${selectedSuppliers.length} selecionado(s)`
              : 'Selecionar todos'
            }
          </span>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {suppliers.length} fornecedor(es)
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {suppliers.map((supplier) => (
          <Card key={supplier.id} className="relative hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedSuppliers.includes(supplier.id)}
                    onCheckedChange={(checked) => handleSupplierSelection(supplier.id, checked as boolean)}
                  />
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={supplier.supplier?.logo} alt={supplier.supplier?.tradeName} />
                    <AvatarFallback>
                      {getSupplierInitials(supplier)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">
                        {supplier.supplier?.tradeName || 'N/A'}
                      </h4>
                      {supplier.isPrimary && (
                        <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                          <Star className="h-3 w-3 mr-1" />
                          Principal
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {supplier.supplier?.corporateName || 'N/A'}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(supplier)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    {!supplier.isPrimary && (
                      <DropdownMenuItem 
                        onClick={() => onSetPrimary(supplier.id)}
                        disabled={isSettingPrimary}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Definir como Principal
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDelete(supplier.id)}
                      className="text-red-600"
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Product Code and Cost */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Código</p>
                      <p className="text-sm font-medium">{supplier.supplierProductCode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Custo</p>
                      <p className="text-sm font-medium text-green-600">
                        {formatCurrency(supplier.supplierCost)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lead Time and MOQ */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Entrega</p>
                      <p className="text-sm font-medium">
                        {supplier.leadTime ? `${supplier.leadTime} dias` : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Qtd. Mín.</p>
                      <p className="text-sm font-medium">
                        {supplier.minimumOrderQuantity || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status and Notes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {supplier.active ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <Badge variant={supplier.active ? "default" : "secondary"}>
                        {supplier.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    {supplier.notes && (
                      <div className="flex items-center gap-1 text-gray-400">
                        <FileText className="h-3 w-3" />
                        <span className="text-xs">Obs.</span>
                      </div>
                    )}
                  </div>
                  
                  {supplier.notes && (
                    <p className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      {supplier.notes}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Confirmar Remoção
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este fornecedor do produto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmId(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};