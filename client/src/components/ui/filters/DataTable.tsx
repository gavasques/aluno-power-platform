import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SortConfig } from '@/hooks/useFilteredData';

export interface ColumnConfig<T = any> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, item: T, index: number) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T extends Record<string, any>> {
  data: T[];
  columns: ColumnConfig<T>[];
  sortConfig?: SortConfig<T> | null;
  onSort?: (key: keyof T) => void;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (item: T, index: number) => void;
  rowClassName?: (item: T, index: number) => string;
  stickyHeader?: boolean;
}

/**
 * Componente de tabela reutilizável com ordenação integrada
 * Funciona perfeitamente com useFilteredData
 * 
 * @example
 * const columns = [
 *   { key: 'name', title: 'Nome', sortable: true },
 *   { key: 'price', title: 'Preço', sortable: true, render: (value) => `R$ ${value}` },
 *   { key: 'active', title: 'Status', render: (value) => <Badge>{value ? 'Ativo' : 'Inativo'}</Badge> }
 * ];
 * 
 * <DataTable
 *   data={filteredData.filteredData}
 *   columns={columns}
 *   sortConfig={filteredData.sortConfig}
 *   onSort={filteredData.toggleSort}
 * />
 */
export const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  sortConfig,
  onSort,
  className,
  emptyMessage = 'Nenhum resultado encontrado.',
  loading = false,
  onRowClick,
  rowClassName,
  stickyHeader = false
}: DataTableProps<T>) => {
  const getSortIcon = (columnKey: keyof T) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const formatCellValue = (value: any, column: ColumnConfig<T>, item: T, index: number) => {
    if (column.render) {
      return column.render(value, item, index);
    }
    
    if (value === null || value === undefined) {
      return '-';
    }
    
    if (typeof value === 'boolean') {
      return (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Sim' : 'Não'}
        </Badge>
      );
    }
    
    if (value instanceof Date) {
      return value.toLocaleDateString('pt-BR');
    }
    
    if (typeof value === 'number' && column.key.toString().includes('price')) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    }
    
    return String(value);
  };

  if (loading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(column => (
                <TableHead key={column.key as string} style={{ width: column.width }}>
                  <div className="h-4 bg-muted animate-pulse rounded" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {columns.map(column => (
                  <TableCell key={column.key as string}>
                    <div className="h-4 bg-muted animate-pulse rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("border rounded-lg", className)}>
      <Table>
        <TableHeader className={stickyHeader ? "sticky top-0 bg-background z-10" : ""}>
          <TableRow>
            {columns.map(column => (
              <TableHead
                key={column.key as string}
                style={{ width: column.width }}
                className={cn(
                  column.align === 'center' && "text-center",
                  column.align === 'right' && "text-right",
                  column.className
                )}
              >
                {column.sortable && onSort ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 data-[state=open]:bg-accent"
                    onClick={() => onSort(column.key)}
                  >
                    <span>{column.title}</span>
                    {getSortIcon(column.key)}
                  </Button>
                ) : (
                  column.title
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow
              key={item.id || index}
              className={cn(
                onRowClick && "cursor-pointer hover:bg-muted/50",
                rowClassName?.(item, index)
              )}
              onClick={() => onRowClick?.(item, index)}
            >
              {columns.map(column => (
                <TableCell
                  key={column.key as string}
                  className={cn(
                    column.align === 'center' && "text-center",
                    column.align === 'right' && "text-right",
                    column.className
                  )}
                >
                  {formatCellValue(item[column.key], column, item, index)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

/**
 * Componente de paginação simples para usar com DataTable
 */
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
  className?: string;
}

export const DataTablePagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  className
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={cn("flex items-center justify-between px-2", className)}>
      <div className="text-sm text-muted-foreground">
        Mostrando {startItem} a {endItem} de {totalItems} resultados
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Anterior
        </Button>
        
        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber;
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = currentPage - 2 + i;
            }
            
            return (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
};

/**
 * Hook para paginação de dados
 */
export const usePagination = <T,>(data: T[], itemsPerPage: number = 10) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);
  
  // Reset page when data changes
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);
  
  return {
    currentPage,
    totalPages,
    paginatedData,
    setCurrentPage,
    totalItems: data.length,
    startIndex,
    endIndex
  };
};