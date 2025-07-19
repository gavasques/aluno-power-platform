/**
 * Product Supplier Manager Component
 * 
 * SOLID Principles Applied:
 * - SRP: Single responsibility for supplier management interface
 * - OCP: Open for extension with new supplier operations
 * - LSP: Consistent component interface
 * - ISP: Interface segregation with focused props
 * - DIP: Depends on abstractions through hooks
 */

import React, { useState, useMemo } from 'react';
import { Plus, Search, Download, Filter, MoreHorizontal, Star, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { useProductSuppliers } from '@/hooks/useProductSuppliers';
import { ProductSupplierForm } from './ProductSupplierForm';
import { ProductSupplierList } from './ProductSupplierList';

import type { ProductSupplier } from '@/shared/types/productSupplier';

interface ProductSupplierManagerProps {
  productId: number;
  productName: string;
  onSupplierChange?: (suppliers: ProductSupplier[]) => void;
}

export const ProductSupplierManager: React.FC<ProductSupplierManagerProps> = ({
  productId,
  productName,
  onSupplierChange
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<ProductSupplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([]);

  const {
    suppliers,
    isLoading,
    isError,
    error,
    deleteSupplier,
    setPrimarySupplier,
    isDeleting,
    isSettingPrimary,
    refetch
  } = useProductSuppliers(productId);

  // Filter suppliers based on search term
  const filteredSuppliers = useMemo(() => {
    if (!searchTerm) return suppliers;
    
    const term = searchTerm.toLowerCase();
    return suppliers.filter(supplier => 
      supplier.supplier?.tradeName?.toLowerCase().includes(term) ||
      supplier.supplier?.corporateName?.toLowerCase().includes(term) ||
      supplier.supplierProductCode?.toLowerCase().includes(term) ||
      supplier.notes?.toLowerCase().includes(term)
    );
  }, [suppliers, searchTerm]);

  // Handle supplier form success
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingSupplier(null);
    onSupplierChange?.(suppliers);
  };

  // Handle supplier form cancel
  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingSupplier(null);
  };

  // Handle supplier edit
  const handleEditSupplier = (supplier: ProductSupplier) => {
    setEditingSupplier(supplier);
    setIsFormOpen(true);
  };

  // Handle supplier delete
  const handleDeleteSupplier = async (supplierId: number) => {
    try {
      await deleteSupplier(supplierId);
      onSupplierChange?.(suppliers.filter(s => s.id !== supplierId));
    } catch (error) {
      console.error('Error deleting supplier:', error);
    }
  };

  // Handle set primary supplier
  const handleSetPrimarySupplier = async (supplierId: number) => {
    try {
      await setPrimarySupplier(supplierId);
      onSupplierChange?.(suppliers);
    } catch (error) {
      console.error('Error setting primary supplier:', error);
    }
  };

  // Handle supplier selection change
  const handleSelectionChange = (supplierIds: number[]) => {
    setSelectedSuppliers(supplierIds);
  };

  // Handle bulk operations
  const handleBulkDelete = async () => {
    if (selectedSuppliers.length === 0) return;
    
    try {
      await Promise.all(
        selectedSuppliers.map(id => deleteSupplier(id))
      );
      setSelectedSuppliers([]);
      onSupplierChange?.(suppliers.filter(s => !selectedSuppliers.includes(s.id)));
    } catch (error) {
      console.error('Error bulk deleting suppliers:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Fornecedores do Produto
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie os fornecedores para {productName}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar fornecedores: {error?.message || 'Erro desconhecido'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Fornecedores do Produto
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie os fornecedores para {productName}
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Fornecedor
        </Button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 text-gray-400 transform -translate-y-1/2" />
            <Input
              placeholder="Buscar fornecedores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {selectedSuppliers.length > 0 && (
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={isDeleting}
                size="sm"
              >
                Remover Selecionados ({selectedSuppliers.length})
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Suppliers List */}
        {filteredSuppliers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 dark:text-gray-600 mb-4">
                <Star className="h-12 w-12 mx-auto mb-4" />
                {searchTerm ? (
                  <p>Nenhum fornecedor encontrado para "{searchTerm}"</p>
                ) : (
                  <p>Nenhum fornecedor adicionado ainda</p>
                )}
              </div>
              {!searchTerm && (
                <Button
                  onClick={() => setIsFormOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Fornecedor
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <ProductSupplierList
            suppliers={filteredSuppliers}
            onEdit={handleEditSupplier}
            onDelete={handleDeleteSupplier}
            onSetPrimary={handleSetPrimarySupplier}
            onSelectionChange={handleSelectionChange}
            isDeleting={isDeleting}
            isSettingPrimary={isSettingPrimary}
            selectedSuppliers={selectedSuppliers}
          />
        )}
      </div>

      {/* Supplier Form Modal */}
      <ProductSupplierForm
        productId={productId}
        supplier={editingSupplier}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
        isOpen={isFormOpen}
      />
    </div>
  );
};