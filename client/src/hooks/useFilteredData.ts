import { useState, useCallback, useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

export interface FilterConfig<T = any> {
  key: keyof T;
  type: 'text' | 'select' | 'date' | 'number' | 'boolean' | 'multiselect';
  label: string;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  defaultValue?: any;
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte' | 'between';
}

export interface SortConfig<T = any> {
  key: keyof T;
  direction: 'asc' | 'desc';
}

export interface FilterState {
  [key: string]: any;
}

export interface UseFilteredDataOptions<T> {
  data: T[];
  searchFields?: (keyof T)[];
  initialFilters?: FilterState;
  initialSort?: SortConfig<T>;
  debounceDelay?: number;
}

export interface UseFilteredDataReturn<T> {
  // Dados filtrados
  filteredData: T[];
  
  // Estados de busca
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  debouncedSearchTerm: string;
  
  // Estados de filtros
  filters: FilterState;
  setFilter: (key: string, value: any) => void;
  clearFilter: (key: string) => void;
  clearAllFilters: () => void;
  
  // Estados de ordenação
  sortConfig: SortConfig<T> | null;
  setSortConfig: (config: SortConfig<T> | null) => void;
  toggleSort: (key: keyof T) => void;
  
  // Utilitários
  totalCount: number;
  filteredCount: number;
  hasActiveFilters: boolean;
  resetAll: () => void;
}

/**
 * Hook para gerenciar filtragem, busca e ordenação de dados
 * Elimina duplicação de lógica de filtros em 15+ componentes
 * 
 * @example
 * const filteredProducts = useFilteredData({
 *   data: products,
 *   searchFields: ['name', 'description'],
 *   initialFilters: { active: true },
 *   initialSort: { key: 'name', direction: 'asc' }
 * });
 * 
 * // Uso em componente
 * <SearchInput 
 *   value={filteredProducts.searchTerm}
 *   onChange={filteredProducts.setSearchTerm}
 * />
 * 
 * <FilterBar
 *   filters={filteredProducts.filters}
 *   setFilter={filteredProducts.setFilter}
 * />
 * 
 * <DataTable
 *   data={filteredProducts.filteredData}
 *   sortConfig={filteredProducts.sortConfig}
 *   onSort={filteredProducts.toggleSort}
 * />
 */
export const useFilteredData = <T extends Record<string, any>>({
  data,
  searchFields = [],
  initialFilters = {},
  initialSort = null,
  debounceDelay = 300
}: UseFilteredDataOptions<T>): UseFilteredDataReturn<T> => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(initialSort);
  
  const debouncedSearchTerm = useDebounce(searchTerm, debounceDelay);

  const setFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilter = useCallback((key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({});
  }, []);

  const toggleSort = useCallback((key: keyof T) => {
    setSortConfig(prev => {
      if (!prev || prev.key !== key) {
        return { key, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  }, []);

  const resetAll = useCallback(() => {
    setSearchTerm('');
    setFilters(initialFilters);
    setSortConfig(initialSort);
  }, [initialFilters, initialSort]);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Aplicar busca por texto
    if (debouncedSearchTerm && searchFields.length > 0) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      result = result.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          if (value == null) return false;
          return String(value).toLowerCase().includes(searchLower);
        })
      );
    }

    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) {
        return;
      }

      result = result.filter(item => {
        const itemValue = item[key];
        
        if (Array.isArray(value)) {
          // Filtro multi-select
          return value.includes(itemValue);
        }
        
        if (typeof value === 'boolean') {
          return itemValue === value;
        }
        
        if (typeof value === 'string') {
          if (itemValue == null) return false;
          return String(itemValue).toLowerCase().includes(value.toLowerCase());
        }
        
        if (typeof value === 'object' && value.operator) {
          // Filtros com operadores customizados
          switch (value.operator) {
            case 'equals':
              return itemValue === value.value;
            case 'contains':
              return String(itemValue).toLowerCase().includes(String(value.value).toLowerCase());
            case 'startsWith':
              return String(itemValue).toLowerCase().startsWith(String(value.value).toLowerCase());
            case 'endsWith':
              return String(itemValue).toLowerCase().endsWith(String(value.value).toLowerCase());
            case 'gt':
              return Number(itemValue) > Number(value.value);
            case 'lt':
              return Number(itemValue) < Number(value.value);
            case 'gte':
              return Number(itemValue) >= Number(value.value);
            case 'lte':
              return Number(itemValue) <= Number(value.value);
            case 'between':
              return Number(itemValue) >= Number(value.min) && Number(itemValue) <= Number(value.max);
            default:
              return itemValue === value.value;
          }
        }
        
        return itemValue === value;
      });
    });

    // Aplicar ordenação
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        
        let comparison = 0;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else if (aValue instanceof Date && bValue instanceof Date) {
          comparison = aValue.getTime() - bValue.getTime();
        } else {
          comparison = String(aValue).localeCompare(String(bValue));
        }
        
        return sortConfig.direction === 'desc' ? -comparison : comparison;
      });
    }

    return result;
  }, [data, debouncedSearchTerm, searchFields, filters, sortConfig]);

  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).length > 0 || debouncedSearchTerm.length > 0;
  }, [filters, debouncedSearchTerm]);

  return {
    filteredData,
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    filters,
    setFilter,
    clearFilter,
    clearAllFilters,
    sortConfig,
    setSortConfig,
    toggleSort,
    totalCount: data.length,
    filteredCount: filteredData.length,
    hasActiveFilters,
    resetAll
  };
};

/**
 * Hook utilitário para debounce
 */
export const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook para filtros avançados com configuração
 */
export const useAdvancedFilters = <T extends Record<string, any>>(
  data: T[],
  filterConfigs: FilterConfig<T>[],
  options?: Omit<UseFilteredDataOptions<T>, 'data'>
) => {
  const baseFilters = useFilteredData({ data, ...options });
  
  const getFilterOptions = useCallback((config: FilterConfig<T>) => {
    if (config.options) return config.options;
    
    // Gerar opções automaticamente baseado nos dados
    const uniqueValues = [...new Set(data.map(item => item[config.key]))]
      .filter(value => value != null)
      .sort();
    
    return uniqueValues.map(value => ({
      value,
      label: String(value)
    }));
  }, [data]);

  const filterConfigurations = useMemo(() => {
    return filterConfigs.map(config => ({
      ...config,
      options: getFilterOptions(config)
    }));
  }, [filterConfigs, getFilterOptions]);

  return {
    ...baseFilters,
    filterConfigurations
  };
};