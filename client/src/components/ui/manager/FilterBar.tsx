/**
 * Componente reutilizável para barras de filtro
 * Elimina duplicação das estruturas de filtro nos managers
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: Array<{
    key: string;
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }>;
  onClearFilters?: () => void;
  className?: string;
  showClearButton?: boolean;
  hasActiveFilters?: boolean;
}

export function FilterBar({
  searchTerm = '',
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  filters = [],
  onClearFilters,
  className = '',
  showClearButton = true,
  hasActiveFilters = false
}: FilterBarProps) {
  const hasSearch = !!onSearchChange;
  const hasFilters = filters.length > 0;
  const shouldShowClearButton = showClearButton && hasActiveFilters && onClearFilters;

  if (!hasSearch && !hasFilters) {
    return null;
  }

  return (
    <div className={`flex flex-col sm:flex-row gap-4 mb-6 ${className}`}>
      {/* Search Input */}
      {hasSearch && (
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Filters */}
      {hasFilters && (
        <div className="flex flex-wrap gap-3 items-center">
          {filters.map((filter) => (
            <div key={filter.key} className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={filter.value} onValueChange={filter.onChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}

      {/* Clear Filters Button */}
      {shouldShowClearButton && (
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <X className="h-4 w-4" />
          Limpar Filtros
        </Button>
      )}
    </div>
  );
}