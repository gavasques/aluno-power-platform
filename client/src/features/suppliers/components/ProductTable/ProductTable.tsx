/**
 * COMPONENTE: ProductTable
 * Tabela de produtos do fornecedor com paginação
 * Extraído de SupplierProductsTabSimple.tsx para modularização
 */
import React, { memo, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { SupplierProduct } from '../../hooks/useSupplierProducts';

// ===== UTILITY FUNCTIONS =====
const formatCurrency = (value: string | number | null | undefined): string => {
  if (!value || value === '') return '-';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '-';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

// ===== PRODUCT ROW COMPONENT =====
const ProductRow = memo(({ 
  product, 
  onEdit, 
  onDelete 
}: { 
  product: SupplierProduct; 
  onEdit: (product: SupplierProduct) => void; 
  onDelete: (product: SupplierProduct) => void; 
}) => {
  const handleEdit = useCallback(() => onEdit(product), [product, onEdit]);
  const handleDelete = useCallback(() => onDelete(product), [product, onDelete]);

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell className="font-medium">{product.supplierSku}</TableCell>
      <TableCell>{product.productName}</TableCell>
      <TableCell>{formatCurrency(product.cost)}</TableCell>
      <TableCell>{product.leadTime ? `${product.leadTime} dias` : '-'}</TableCell>
      <TableCell>{product.minimumOrderQuantity || '-'}</TableCell>
      <TableCell>{product.masterBox || '-'}</TableCell>
      <TableCell>{product.stock || '-'}</TableCell>
      <TableCell>
        <Badge variant={product.linkStatus === 'linked' ? 'default' : 
                      product.linkStatus === 'pending' ? 'secondary' : 'destructive'}>
          {product.linkStatus === 'linked' ? '✅ Vinculado' :
           product.linkStatus === 'pending' ? '⚠️ Pendente' : '❌ Não encontrado'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

ProductRow.displayName = 'ProductRow';

// ===== PAGINATION COMPONENT =====
const TablePagination = memo(({
  currentPage,
  totalPages,
  onPageChange
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t">
      <div className="text-sm text-gray-600">
        Página {currentPage} de {totalPages}
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex items-center gap-1"
        >
          Próxima
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

TablePagination.displayName = 'TablePagination';

// ===== MAIN COMPONENT =====
interface ProductTableProps {
  products: SupplierProduct[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  onEdit: (product: SupplierProduct) => void;
  onDelete: (product: SupplierProduct) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export const ProductTable = ({
  products,
  isLoading,
  error,
  totalCount,
  onEdit,
  onDelete,
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {}
}: ProductTableProps) => {
  // ===== LOADING STATE =====
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Carregando produtos...</p>
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-2">Erro ao carregar produtos</p>
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  // ===== EMPTY STATE =====
  if (products.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Package className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum produto encontrado
        </h3>
        <p className="text-gray-600">
          {totalCount === 0 
            ? 'Este fornecedor ainda não possui produtos cadastrados.' 
            : 'Nenhum produto corresponde aos filtros aplicados.'}
        </p>
      </div>
    );
  }

  // ===== TABLE RENDER =====
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código SKU</TableHead>
            <TableHead>Nome do Produto</TableHead>
            <TableHead>Custo</TableHead>
            <TableHead>Lead Time</TableHead>
            <TableHead>Qtd Mínima</TableHead>
            <TableHead>Master Box</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
      
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};