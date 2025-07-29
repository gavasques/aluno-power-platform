/**
 * Componente para filtros do analytics
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  X,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AnalyticsFilter } from '@/hooks/useAnalytics';

interface AnalyticsFiltersProps {
  filters: AnalyticsFilter[];
  selectedFilters: Record<string, any>;
  onFilterChange: (filterId: string, value: any) => void;
  onClearFilters: () => void;
  className?: string;
}

export function AnalyticsFilters({
  filters,
  selectedFilters,
  onFilterChange,
  onClearFilters,
  className = ''
}: AnalyticsFiltersProps) {
  
  // Renderizar filtro de data
  const renderDateRangeFilter = (filter: AnalyticsFilter) => {
    const value = selectedFilters[filter.id] || {};
    
    return (
      <div key={filter.id} className="space-y-2">
        <Label className="text-sm font-medium">{filter.name}</Label>
        <div className="flex gap-2">
          {/* Data inicial */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="flex-1 justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value.startDate 
                  ? format(new Date(value.startDate), 'dd/MM/yyyy', { locale: ptBR })
                  : 'Data inicial'
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value.startDate ? new Date(value.startDate) : undefined}
                onSelect={(date) => 
                  onFilterChange(filter.id, { ...value, startDate: date })
                }
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          {/* Data final */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="flex-1 justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value.endDate 
                  ? format(new Date(value.endDate), 'dd/MM/yyyy', { locale: ptBR })
                  : 'Data final'
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value.endDate ? new Date(value.endDate) : undefined}
                onSelect={(date) => 
                  onFilterChange(filter.id, { ...value, endDate: date })
                }
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  };

  // Renderizar filtro select simples
  const renderSelectFilter = (filter: AnalyticsFilter) => {
    const value = selectedFilters[filter.id];
    
    return (
      <div key={filter.id} className="space-y-2">
        <Label className="text-sm font-medium">{filter.name}</Label>
        <Select 
          value={value || ''} 
          onValueChange={(val) => onFilterChange(filter.id, val)}
        >
          <SelectTrigger>
            <SelectValue placeholder={`Selecionar ${filter.name.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            {filter.options?.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  // Renderizar filtro multi-select
  const renderMultiSelectFilter = (filter: AnalyticsFilter) => {
    const selectedValues = selectedFilters[filter.id] || [];
    
    return (
      <div key={filter.id} className="space-y-2">
        <Label className="text-sm font-medium">{filter.name}</Label>
        <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
          {filter.options?.map(option => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`${filter.id}-${option.value}`}
                checked={selectedValues.includes(option.value)}
                onCheckedChange={(checked) => {
                  const newValues = checked
                    ? [...selectedValues, option.value]
                    : selectedValues.filter((v: any) => v !== option.value);
                  onFilterChange(filter.id, newValues);
                }}
              />
              <label 
                htmlFor={`${filter.id}-${option.value}`}
                className="text-sm cursor-pointer flex-1"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar filtro baseado no tipo
  const renderFilter = (filter: AnalyticsFilter) => {
    switch (filter.type) {
      case 'dateRange':
        return renderDateRangeFilter(filter);
      case 'select':
        return renderSelectFilter(filter);
      case 'multiSelect':
        return renderMultiSelectFilter(filter);
      default:
        return null;
    }
  };

  // Contar filtros ativos
  const activeFiltersCount = Object.keys(selectedFilters).filter(key => {
    const value = selectedFilters[key];
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => v !== null && v !== undefined && v !== '');
    }
    return value !== null && value !== undefined && value !== '';
  }).length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-medium">Filtros</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">
              {activeFiltersCount} ativo{activeFiltersCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-600 hover:text-red-600"
          >
            <X className="h-4 w-4 mr-2" />
            Limpar todos
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filters.map(renderFilter)}
      </div>

      {/* Filtros aplicados como badges */}
      {activeFiltersCount > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Filtros aplicados:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(selectedFilters).map(([filterId, value]) => {
              const filter = filters.find(f => f.id === filterId);
              if (!filter || !value) return null;

              // Renderizar badge baseado no tipo
              if (filter.type === 'dateRange' && (value.startDate || value.endDate)) {
                const dateText = value.startDate && value.endDate 
                  ? `${format(new Date(value.startDate), 'dd/MM')} - ${format(new Date(value.endDate), 'dd/MM')}`
                  : value.startDate 
                  ? `A partir de ${format(new Date(value.startDate), 'dd/MM')}`
                  : `Até ${format(new Date(value.endDate), 'dd/MM')}`;
                
                return (
                  <Badge key={filterId} variant="secondary" className="flex items-center gap-1">
                    {filter.name}: {dateText}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => onFilterChange(filterId, {})}
                    />
                  </Badge>
                );
              }

              if (filter.type === 'multiSelect' && Array.isArray(value) && value.length > 0) {
                return value.map(val => {
                  const option = filter.options?.find(o => o.value === val);
                  return option ? (
                    <Badge key={`${filterId}-${val}`} variant="secondary" className="flex items-center gap-1">
                      {option.label}
                      <X 
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => {
                          const newValues = value.filter((v: any) => v !== val);
                          onFilterChange(filterId, newValues);
                        }}
                      />
                    </Badge>
                  ) : null;
                });
              }

              if (filter.type === 'select' && value) {
                const option = filter.options?.find(o => o.value === value);
                return option ? (
                  <Badge key={filterId} variant="secondary" className="flex items-center gap-1">
                    {filter.name}: {option.label}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => onFilterChange(filterId, '')}
                    />
                  </Badge>
                ) : null;
              }

              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}