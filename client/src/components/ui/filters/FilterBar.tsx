import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  Calendar as CalendarIcon,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FilterConfig, FilterState } from '@/hooks/useFilteredData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface FilterBarProps {
  // Estados de busca
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  
  // Estados de filtros
  filters: FilterState;
  onFilterChange: (key: string, value: any) => void;
  onClearFilter: (key: string) => void;
  onClearAll: () => void;
  
  // Configurações de filtros
  filterConfigs?: FilterConfig[];
  
  // Layout e exibição
  className?: string;
  showActiveFilters?: boolean;
  showClearAll?: boolean;
  compact?: boolean;
  
  // Resultados
  totalCount?: number;
  filteredCount?: number;
}

/**
 * Componente de barra de filtros reutilizável
 * Elimina duplicação de código de filtros em 15+ componentes
 * 
 * @example
 * const filterConfigs = [
 *   { key: 'category', type: 'select', label: 'Categoria', options: categories },
 *   { key: 'active', type: 'boolean', label: 'Ativo' },
 *   { key: 'price', type: 'number', label: 'Preço', operator: 'gte' }
 * ];
 * 
 * <FilterBar
 *   searchTerm={filteredData.searchTerm}
 *   onSearchChange={filteredData.setSearchTerm}
 *   filters={filteredData.filters}
 *   onFilterChange={filteredData.setFilter}
 *   onClearFilter={filteredData.clearFilter}
 *   onClearAll={filteredData.clearAllFilters}
 *   filterConfigs={filterConfigs}
 *   totalCount={filteredData.totalCount}
 *   filteredCount={filteredData.filteredCount}
 * />
 */
export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm = '',
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  showSearch = true,
  filters,
  onFilterChange,
  onClearFilter,
  onClearAll,
  filterConfigs = [],
  className,
  showActiveFilters = true,
  showClearAll = true,
  compact = false,
  totalCount,
  filteredCount
}) => {
  const activeFilterCount = Object.keys(filters).length + (searchTerm ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;

  const renderFilterInput = (config: FilterConfig) => {
    const value = filters[config.key as string];
    
    switch (config.type) {
      case 'text':
        return (
          <Input
            placeholder={config.placeholder || `Filtrar por ${config.label.toLowerCase()}`}
            value={value || ''}
            onChange={(e) => onFilterChange(config.key as string, e.target.value)}
            className="h-8"
          />
        );
        
      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={(newValue) => 
              onFilterChange(config.key as string, newValue === 'all' ? null : newValue)
            }
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder={`Selecionar ${config.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {config.options?.map(option => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'multiselect':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-dashed"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                {config.label}
                {Array.isArray(value) && value.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {value.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="space-y-2">
                <h4 className="font-medium">{config.label}</h4>
                {config.options?.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${config.key as string}-${option.value}`}
                      checked={Array.isArray(value) && value.includes(option.value)}
                      onCheckedChange={(checked) => {
                        const currentValues = Array.isArray(value) ? value : [];
                        if (checked) {
                          onFilterChange(config.key as string, [...currentValues, option.value]);
                        } else {
                          onFilterChange(
                            config.key as string, 
                            currentValues.filter(v => v !== option.value)
                          );
                        }
                      }}
                    />
                    <Label
                      htmlFor={`${config.key as string}-${option.value}`}
                      className="text-sm"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        );
        
      case 'boolean':
        return (
          <Select
            value={value === null || value === undefined ? 'all' : String(value)}
            onValueChange={(newValue) => 
              onFilterChange(
                config.key as string, 
                newValue === 'all' ? null : newValue === 'true'
              )
            }
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder={config.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Sim</SelectItem>
              <SelectItem value="false">Não</SelectItem>
            </SelectContent>
          </Select>
        );
        
      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 border-dashed justify-start text-left font-normal",
                  !value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), 'PPP', { locale: ptBR }) : config.label}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => onFilterChange(config.key as string, date?.toISOString())}
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
        
      case 'number':
        return (
          <Input
            type="number"
            placeholder={config.placeholder || `${config.label}`}
            value={value || ''}
            onChange={(e) => onFilterChange(config.key as string, Number(e.target.value) || null)}
            className="h-8"
          />
        );
        
      default:
        return null;
    }
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {showSearch && onSearchChange && (
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 h-8"
            />
          </div>
        )}
        
        {filterConfigs.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-dashed">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filtros</h4>
                  {hasActiveFilters && showClearAll && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearAll}
                      className="h-8 px-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {filterConfigs.map(config => (
                    <div key={config.key as string} className="space-y-1">
                      <Label className="text-xs font-medium">
                        {config.label}
                      </Label>
                      {renderFilterInput(config)}
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
        
        {totalCount !== undefined && filteredCount !== undefined && (
          <div className="text-sm text-muted-foreground">
            {filteredCount} de {totalCount}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Linha principal com busca e filtros */}
      <div className="flex items-center gap-4 flex-wrap">
        {showSearch && onSearchChange && (
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
        
        <div className="flex items-center gap-2 flex-wrap">
          {filterConfigs.map(config => (
            <div key={config.key as string} className="flex items-center gap-2">
              <span className="text-sm font-medium whitespace-nowrap">
                {config.label}:
              </span>
              {renderFilterInput(config)}
            </div>
          ))}
        </div>
        
        {hasActiveFilters && showClearAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="shrink-0"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>
      
      {/* Filtros ativos */}
      {showActiveFilters && hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filtros ativos:</span>
          
          {searchTerm && onSearchChange && (
            <Badge variant="secondary" className="gap-1">
              <Search className="h-3 w-3" />
              "{searchTerm}"
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => onSearchChange('')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {Object.entries(filters).map(([key, value]) => {
            if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) {
              return null;
            }
            
            const config = filterConfigs.find(c => c.key === key);
            const label = config?.label || key;
            
            let displayValue = String(value);
            if (Array.isArray(value)) {
              displayValue = `${value.length} selecionados`;
            } else if (typeof value === 'boolean') {
              displayValue = value ? 'Sim' : 'Não';
            } else if (config?.options) {
              const option = config.options.find(o => o.value === value);
              displayValue = option?.label || displayValue;
            }
            
            return (
              <Badge key={key} variant="secondary" className="gap-1">
                {label}: {displayValue}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => onClearFilter(key)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
      
      {/* Contador de resultados */}
      {totalCount !== undefined && filteredCount !== undefined && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Exibindo {filteredCount} de {totalCount} resultados
            {hasActiveFilters && ` (${totalCount - filteredCount} filtrados)`}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Componente simplificado só para busca
 */
export interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = 'Buscar...',
  className
}) => {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
      {searchTerm && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1 h-8 w-8 p-0"
          onClick={() => onSearchChange('')}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

/**
 * Componente para filtros rápidos (chips/badges)
 */
export interface QuickFiltersProps {
  options: { value: any; label: string; count?: number }[];
  selectedValue: any;
  onSelect: (value: any) => void;
  className?: string;
}

export const QuickFilters: React.FC<QuickFiltersProps> = ({
  options,
  selectedValue,
  onSelect,
  className
}) => {
  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {options.map(option => (
        <Button
          key={option.value}
          variant={selectedValue === option.value ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(option.value)}
          className="h-8"
        >
          {option.label}
          {option.count !== undefined && (
            <Badge variant="secondary" className="ml-2">
              {option.count}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
};