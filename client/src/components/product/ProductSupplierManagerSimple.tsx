/**
 * Simple Product Supplier Manager Component
 * Displays suppliers in a clean table format
 */

import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Download, Star, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useProductSuppliers } from '@/hooks/useProductSuppliers';
import { formatCurrency } from '@/shared/utils/formatters';

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

  const {
    suppliers,
    isLoading,
    stats
  } = useProductSuppliers(productId);

  // Filter suppliers based on search term
  const filteredSuppliers = useMemo(() => {
    if (!searchTerm) return suppliers;
    
    const term = searchTerm.toLowerCase();
    return suppliers.filter(supplier => 
      supplier.supplier?.tradeName?.toLowerCase().includes(term) ||
      supplier.supplier?.corporateName?.toLowerCase().includes(term)
    );
  }, [suppliers, searchTerm]);

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
                />
              </TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead className="w-20">Código</TableHead>
              <TableHead className="w-24">Custo</TableHead>
              <TableHead className="w-20">Entrega</TableHead>
              <TableHead className="w-20">Qtd. Mín.</TableHead>
              <TableHead className="w-20">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
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
                checked={selectedSuppliers.length > 0}
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
    </div>
  );
};