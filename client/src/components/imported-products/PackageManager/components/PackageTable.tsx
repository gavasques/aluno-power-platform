import React, { memo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Package, ExternalLink } from 'lucide-react';
import { ButtonLoader } from '@/components/common/LoadingSpinner';
import { PACKAGE_STATUSES, type ProductPackage } from '../types';

interface PackageTableProps {
  packages: ProductPackage[];
  deletingId: number | null;
  onEdit: (pkg: ProductPackage) => void;
  onDelete: (id: number) => void;
  onViewProducts: (id: number) => void;
  isDeleting: boolean;
}

export const PackageTable = memo<PackageTableProps>(({
  packages,
  deletingId,
  onEdit,
  onDelete,
  onViewProducts,
  isDeleting
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusInfo = (status: string) => {
    return PACKAGE_STATUSES.find(s => s.value === status) || PACKAGE_STATUSES[0];
  };

  if (packages.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Nenhum pacote encontrado.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome/Fornecedor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Valor/Peso</TableHead>
            <TableHead>Custo Final</TableHead>
            <TableHead>Data Pedido</TableHead>
            <TableHead>Rastreamento</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packages.map((pkg) => {
            const statusInfo = getStatusInfo(pkg.status);
            return (
              <TableRow key={pkg.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{pkg.name}</div>
                    <div className="text-sm text-muted-foreground">{pkg.supplier}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={statusInfo.color}>
                    {statusInfo.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{formatCurrency(pkg.totalValue)}</div>
                    <div className="text-muted-foreground">{pkg.totalWeight}kg</div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(pkg.finalCost)}
                </TableCell>
                <TableCell>
                  {formatDate(pkg.orderDate)}
                  {pkg.expectedDelivery && (
                    <div className="text-xs text-muted-foreground">
                      Prev: {formatDate(pkg.expectedDelivery)}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {pkg.trackingCode ? (
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {pkg.trackingCode}
                      </code>
                      <Button variant="ghost" size="sm" asChild>
                        <a 
                          href={`https://www.17track.net/pt/track#nums=${pkg.trackingCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewProducts(pkg.id)}
                      title="Ver produtos"
                    >
                      <Package className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(pkg)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(pkg.id)}
                      disabled={isDeleting && deletingId === pkg.id}
                    >
                      {isDeleting && deletingId === pkg.id ? (
                        <ButtonLoader size="sm" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-red-600" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
});