/**
 * Componente de paginação reutilizável
 * Para uso com dados paginados
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showPageSizer?: boolean;
  showPageInfo?: boolean;
  showFirstLast?: boolean;
  pageSizeOptions?: number[];
}

export function Pagination({
  meta,
  onPageChange,
  onPageSizeChange,
  className = '',
  size = 'md',
  showPageSizer = true,
  showPageInfo = true,
  showFirstLast = true,
  pageSizeOptions = [10, 20, 50, 100]
}: PaginationProps) {
  const { page, limit, total, totalPages, hasNext, hasPrev } = meta;

  // Se não há dados para paginar, não renderizar
  if (total === 0 || totalPages <= 1) {
    return null;
  }

  const sizeClasses = {
    sm: { button: 'h-8 px-2 text-xs', gap: 'gap-1' },
    md: { button: 'h-9 px-3 text-sm', gap: 'gap-2' }, 
    lg: { button: 'h-10 px-4 text-base', gap: 'gap-3' }
  };

  const classes = sizeClasses[size];

  // Calcular páginas visíveis
  const getVisiblePages = () => {
    const delta = 2; // Número de páginas antes e depois da atual
    const left = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);
    
    const pages: (number | string)[] = [];
    
    // Primeira página e ellipsis
    if (left > 1) {
      pages.push(1);
      if (left > 2) {
        pages.push('...');
      }
    }
    
    // Páginas visíveis
    for (let i = left; i <= right; i++) {
      pages.push(i);
    }
    
    // Ellipsis e última página
    if (right < totalPages) {
      if (right < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  // Calcular range de itens atual
  const itemStart = (page - 1) * limit + 1;
  const itemEnd = Math.min(page * limit, total);

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Info de páginas */}
      {showPageInfo && (
        <div className="text-sm text-gray-700">
          Exibindo <span className="font-medium">{itemStart}</span> a{' '}
          <span className="font-medium">{itemEnd}</span> de{' '}
          <span className="font-medium">{total}</span> resultados
        </div>
      )}

      {/* Controles de paginação */}
      <div className={`flex items-center ${classes.gap}`}>
        {/* Seletor de tamanho da página */}
        {showPageSizer && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Itens por página:</span>
            <Select 
              value={limit.toString()} 
              onValueChange={(value) => onPageSizeChange(parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map(option => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Botões de navegação */}
        <div className={`flex items-center ${classes.gap}`}>
          {/* Primeira página */}
          {showFirstLast && (
            <Button
              variant="outline"
              className={classes.button}
              onClick={() => onPageChange(1)}
              disabled={!hasPrev}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
          )}

          {/* Página anterior */}
          <Button
            variant="outline"
            className={classes.button}
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Números das páginas */}
          {visiblePages.map((pageNum, index) => (
            <React.Fragment key={index}>
              {pageNum === '...' ? (
                <span className="px-2 text-gray-500">...</span>
              ) : (
                <Button
                  variant={pageNum === page ? 'default' : 'outline'}
                  className={classes.button}
                  onClick={() => onPageChange(pageNum as number)}
                >
                  {pageNum}
                </Button>
              )}
            </React.Fragment>
          ))}

          {/* Próxima página */}
          <Button
            variant="outline"
            className={classes.button}
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Última página */}
          {showFirstLast && (
            <Button
              variant="outline"
              className={classes.button}
              onClick={() => onPageChange(totalPages)}
              disabled={!hasNext}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}