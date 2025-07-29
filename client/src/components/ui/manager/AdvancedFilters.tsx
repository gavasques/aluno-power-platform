/**
 * Componente para filtros avançados
 * Inclui filtros de data, multi-select, range, etc.
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  Calendar as CalendarIcon, 
  X,
  ChevronDown 
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface DateRangeFilter {
  type: 'dateRange';
  key: string;
  label: string;
  startDate?: Date;
  endDate?: Date;
}

export interface MultiSelectFilter {
  type: 'multiSelect';
  key: string;
  label: string;
  options: Array<{ value: string; label: string; count?: number }>;
  selectedValues: string[];
}

export interface RangeFilter {
  type: 'range';
  key: string;
  label: string;
  min: number;
  max: number;
  currentMin: number;
  currentMax: number;
  step?: number;
  formatter?: (value: number) => string;
}

export interface BooleanFilter {
  type: 'boolean';
  key: string;
  label: string;
  value: boolean | null; // null = não definido, true/false = valor
}

export type AdvancedFilter = DateRangeFilter | MultiSelectFilter | RangeFilter | BooleanFilter;

interface AdvancedFiltersProps {
  filters: AdvancedFilter[];
  onFiltersChange: (filters: AdvancedFilter[]) => void;
  onReset: () => void;
  className?: string;
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  onReset,
  className = ''
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Contar filtros ativos
  const activeFiltersCount = filters.reduce((count, filter) => {
    switch (filter.type) {
      case 'dateRange':
        return count + (filter.startDate || filter.endDate ? 1 : 0);
      case 'multiSelect':
        return count + filter.selectedValues.length;
      case 'range':
        return count + (filter.currentMin !== filter.min || filter.currentMax !== filter.max ? 1 : 0);
      case 'boolean':
        return count + (filter.value !== null ? 1 : 0);
      default:
        return count;
    }
  }, 0);

  // Atualizar um filtro específico
  const updateFilter = (key: string, updates: Partial<AdvancedFilter>) => {
    const newFilters = filters.map(filter => 
      filter.key === key ? { ...filter, ...updates } : filter
    );
    onFiltersChange(newFilters);
  };

  // Renderizar filtro de data
  const renderDateRangeFilter = (filter: DateRangeFilter) => (
    <div key={filter.key} className="space-y-3">
      <Label className="text-sm font-medium">{filter.label}</Label>
      <div className="flex gap-2">
        {/* Data inicial */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="flex-1 justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filter.startDate ? format(filter.startDate, 'dd/MM/yyyy') : 'Data inicial'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={filter.startDate}
              onSelect={(date) => updateFilter(filter.key, { startDate: date })}
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
              {filter.endDate ? format(filter.endDate, 'dd/MM/yyyy') : 'Data final'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={filter.endDate}
              onSelect={(date) => updateFilter(filter.key, { endDate: date })}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  // Renderizar filtro multi-select
  const renderMultiSelectFilter = (filter: MultiSelectFilter) => (
    <div key={filter.key} className="space-y-3">
      <Label className="text-sm font-medium">{filter.label}</Label>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {filter.options.map(option => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={`${filter.key}-${option.value}`}
              checked={filter.selectedValues.includes(option.value)}
              onCheckedChange={(checked) => {
                const newValues = checked
                  ? [...filter.selectedValues, option.value]
                  : filter.selectedValues.filter(v => v !== option.value);
                updateFilter(filter.key, { selectedValues: newValues });
              }}
            />
            <label 
              htmlFor={`${filter.key}-${option.value}`}
              className="text-sm flex-1 cursor-pointer"
            >
              {option.label}
              {option.count !== undefined && (
                <span className="text-gray-500 ml-1">({option.count})</span>
              )}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  // Renderizar filtro de range
  const renderRangeFilter = (filter: RangeFilter) => (
    <div key={filter.key} className="space-y-3">
      <Label className="text-sm font-medium">{filter.label}</Label>
      <div className="px-2">
        <Slider
          value={[filter.currentMin, filter.currentMax]}
          onValueChange={([min, max]) => 
            updateFilter(filter.key, { currentMin: min, currentMax: max })
          }
          min={filter.min}
          max={filter.max}
          step={filter.step || 1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>
            {filter.formatter 
              ? filter.formatter(filter.currentMin) 
              : filter.currentMin
            }
          </span>
          <span>
            {filter.formatter 
              ? filter.formatter(filter.currentMax) 
              : filter.currentMax
            }
          </span>
        </div>
      </div>
    </div>
  );

  // Renderizar filtro booleano
  const renderBooleanFilter = (filter: BooleanFilter) => (
    <div key={filter.key} className="space-y-3">
      <Label className="text-sm font-medium">{filter.label}</Label>
      <div className="flex gap-2">
        <Button
          variant={filter.value === true ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateFilter(filter.key, { value: true })}
        >
          Sim
        </Button>
        <Button
          variant={filter.value === false ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateFilter(filter.key, { value: false })}
        >
          Não
        </Button>
        <Button
          variant={filter.value === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateFilter(filter.key, { value: null })}
        >
          Todos
        </Button>
      </div>
    </div>
  );

  // Renderizar filtro baseado no tipo
  const renderFilter = (filter: AdvancedFilter) => {
    switch (filter.type) {
      case 'dateRange':
        return renderDateRangeFilter(filter);
      case 'multiSelect':
        return renderMultiSelectFilter(filter);
      case 'range':
        return renderRangeFilter(filter);
      case 'boolean':
        return renderBooleanFilter(filter);
      default:
        return null;
    }
  };

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="mr-2 h-4 w-4" />
            Filtros Avançados
            <ChevronDown className="ml-2 h-4 w-4" />
            {activeFiltersCount > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-96 p-0" 
          align="start"
          side="bottom"
        >
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filtros Avançados</h4>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReset}
                  className="text-xs"
                >
                  Limpar Todos
                </Button>
              )}
            </div>
          </div>
          
          <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
            {filters.map(renderFilter)}
          </div>
          
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {activeFiltersCount} filtro(s) ativo(s)
              </span>
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Badges dos filtros ativos */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.map(filter => {
            const badges: React.ReactNode[] = [];
            
            switch (filter.type) {
              case 'dateRange':
                if (filter.startDate || filter.endDate) {
                  const dateText = filter.startDate && filter.endDate 
                    ? `${format(filter.startDate, 'dd/MM')} - ${format(filter.endDate, 'dd/MM')}`
                    : filter.startDate 
                    ? `A partir de ${format(filter.startDate, 'dd/MM')}`
                    : `Até ${format(filter.endDate!, 'dd/MM')}`;
                  
                  badges.push(
                    <Badge key={filter.key} variant="secondary" className="flex items-center gap-1">
                      {filter.label}: {dateText}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => updateFilter(filter.key, { startDate: undefined, endDate: undefined })}
                      />
                    </Badge>
                  );
                }
                break;
                
              case 'multiSelect':
                filter.selectedValues.forEach(value => {
                  const option = filter.options.find(o => o.value === value);
                  if (option) {
                    badges.push(
                      <Badge key={`${filter.key}-${value}`} variant="secondary" className="flex items-center gap-1">
                        {option.label}
                        <X 
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => {
                            const newValues = filter.selectedValues.filter(v => v !== value);
                            updateFilter(filter.key, { selectedValues: newValues });
                          }}
                        />
                      </Badge>
                    );
                  }
                });
                break;
                
              case 'range':
                if (filter.currentMin !== filter.min || filter.currentMax !== filter.max) {
                  const rangeText = filter.formatter
                    ? `${filter.formatter(filter.currentMin)} - ${filter.formatter(filter.currentMax)}`
                    : `${filter.currentMin} - ${filter.currentMax}`;
                  
                  badges.push(
                    <Badge key={filter.key} variant="secondary" className="flex items-center gap-1">
                      {filter.label}: {rangeText}
                      <X 
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => updateFilter(filter.key, { 
                          currentMin: filter.min, 
                          currentMax: filter.max 
                        })}
                      />
                    </Badge>
                  );
                }
                break;
                
              case 'boolean':
                if (filter.value !== null) {
                  badges.push(
                    <Badge key={filter.key} variant="secondary" className="flex items-center gap-1">
                      {filter.label}: {filter.value ? 'Sim' : 'Não'}
                      <X 
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => updateFilter(filter.key, { value: null })}
                      />
                    </Badge>
                  );
                }
                break;
            }
            
            return badges;
          })}
        </div>
      )}
    </div>
  );
}