import React, { memo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Crown, ArrowUpDown, Star } from 'lucide-react';
import { ButtonLoader } from '@/components/common/LoadingSpinner';
import type { ProductSupplier } from '../types';

interface SuppliersTableProps {
  suppliers: ProductSupplier[];
  deletingId: number | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onEdit: (supplier: ProductSupplier) => void;
  onDelete: (id: number) => void;
  onSetMainSupplier: (id: number) => void;
  onSort: (field: 'name' | 'cost' | 'leadTime' | 'rating') => void;
  isDeleting: boolean;
  isSettingMain: boolean;
}

export const SuppliersTable = memo<SuppliersTableProps>(({
  suppliers,
  deletingId,
  sortBy,
  sortOrder,
  onEdit,
  onDelete,
  onSetMainSupplier,
  onSort,
  isDeleting,
  isSettingMain
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const SortableHeader = ({ field, children }: { field: 'name' | 'cost' | 'leadTime' | 'rating', children: React.ReactNode }) => (
    <Button
      variant="ghost"
      className="h-auto p-0 font-medium"
      onClick={() => onSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  if (suppliers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum fornecedor adicionado ao produto.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortableHeader field="name">Fornecedor</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="cost">Preço de Custo</SortableHeader>
            </TableHead>
            <TableHead>Pedido Mínimo</TableHead>
            <TableHead>
              <SortableHeader field="leadTime">Lead Time</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="rating">Avaliação</SortableHeader>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell>
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {supplier.supplier?.name}
                    {supplier.isMainSupplier && (
                      <Crown className="w-4 h-4 text-yellow-500" title="Fornecedor Principal" />
                    )}
                  </div>
                  {supplier.supplier?.company && (
                    <div className="text-sm text-muted-foreground">{supplier.supplier.company}</div>
                  )}
                  {supplier.supplier?.country && (
                    <div className="text-xs text-muted-foreground">{supplier.supplier.country}</div>
                  )}
                </div>
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(supplier.costPrice)}
              </TableCell>
              <TableCell>
                {supplier.minimumOrder} unidades
              </TableCell>
              <TableCell>
                {supplier.leadTime} dias
              </TableCell>
              <TableCell>
                {supplier.supplier?.rating ? (
                  <div className="flex items-center gap-1">
                    {renderStars(supplier.supplier.rating)}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({supplier.supplier.rating})
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {supplier.isMainSupplier ? (
                  <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                    Principal
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    Alternativo
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {!supplier.isMainSupplier && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSetMainSupplier(supplier.id)}
                      disabled={isSettingMain}
                      title="Definir como principal"
                    >
                      <Crown className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(supplier)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(supplier.id)}
                    disabled={isDeleting && deletingId === supplier.id}
                  >
                    {isDeleting && deletingId === supplier.id ? (
                      <ButtonLoader size="sm" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-red-600" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});