/**
 * Sistema de Filtros e Busca Reutilizáveis
 * 
 * Este módulo centraliza todos os componentes de filtros e busca
 * eliminando duplicação de código de filtros em todo o projeto.
 * 
 * Uso:
 * import { FilterBar, DataTable, useFilteredData } from '@/components/ui/filters';
 */

// Hook principal
export {
  useFilteredData,
  useAdvancedFilters,
  useDebounce
} from '@/hooks/useFilteredData';

export type {
  FilterConfig,
  SortConfig,
  FilterState,
  UseFilteredDataOptions,
  UseFilteredDataReturn
} from '@/hooks/useFilteredData';

// Componentes de filtros
export {
  FilterBar,
  SearchBar,
  QuickFilters
} from './FilterBar';

export type {
  FilterBarProps,
  SearchBarProps,
  QuickFiltersProps
} from './FilterBar';

// Componentes de tabela
export {
  DataTable,
  DataTablePagination,
  usePagination
} from './DataTable';

export type {
  ColumnConfig,
  DataTableProps,
  PaginationProps
} from './DataTable';

// Utilities para casos comuns
export const FilterUtils = {
  /**
   * Cria configurações de filtro comuns
   */
  createTextFilter: (key: string, label: string, placeholder?: string): FilterConfig => ({
    key,
    type: 'text',
    label,
    placeholder: placeholder || `Filtrar por ${label.toLowerCase()}`
  }),

  createSelectFilter: (key: string, label: string, options: any[]): FilterConfig => ({
    key,
    type: 'select',
    label,
    options: options.map(opt => 
      typeof opt === 'string' 
        ? { value: opt, label: opt }
        : opt
    )
  }),

  createBooleanFilter: (key: string, label: string): FilterConfig => ({
    key,
    type: 'boolean',
    label
  }),

  createDateFilter: (key: string, label: string): FilterConfig => ({
    key,
    type: 'date',
    label
  }),

  createNumberFilter: (key: string, label: string, operator: 'equals' | 'gt' | 'lt' | 'gte' | 'lte' = 'equals'): FilterConfig => ({
    key,
    type: 'number',
    label,
    operator
  })
} as const;

/**
 * Configurações de colunas comuns para DataTable
 */
export const ColumnUtils = {
  /**
   * Cria coluna de texto simples
   */
  textColumn: (key: string, title: string, sortable: boolean = true): ColumnConfig => ({
    key,
    title,
    sortable
  }),

  /**
   * Cria coluna de preço formatada
   */
  priceColumn: (key: string, title: string = 'Preço'): ColumnConfig => ({
    key,
    title,
    sortable: true,
    align: 'right',
    render: (value) => 
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value || 0)
  }),

  /**
   * Cria coluna de data formatada
   */
  dateColumn: (key: string, title: string): ColumnConfig => ({
    key,
    title,
    sortable: true,
    render: (value) => 
      value ? new Date(value).toLocaleDateString('pt-BR') : '-'
  }),

  /**
   * Cria coluna de status com badge
   */
  statusColumn: (key: string, title: string = 'Status'): ColumnConfig => ({
    key,
    title,
    sortable: true,
    align: 'center',
    render: (value) => (
      <Badge variant={value ? 'default' : 'secondary'}>
        {value ? 'Ativo' : 'Inativo'}
      </Badge>
    )
  }),

  /**
   * Cria coluna de ações
   */
  actionsColumn: (render: (item: any, index: number) => React.ReactNode): ColumnConfig => ({
    key: 'actions',
    title: 'Ações',
    sortable: false,
    align: 'center',
    width: '120px',
    render: (_, item, index) => render(item, index)
  })
} as const;

// Convenience export para padrões comuns
export const createDataManager = <T extends Record<string, any>>(
  data: T[],
  searchFields: (keyof T)[],
  filterConfigs: FilterConfig<T>[],
  columnConfigs: ColumnConfig<T>[]
) => {
  const filteredData = useFilteredData({
    data,
    searchFields,
    initialFilters: {},
    initialSort: null
  });

  const FilterBarComponent = () => (
    <FilterBar
      searchTerm={filteredData.searchTerm}
      onSearchChange={filteredData.setSearchTerm}
      filters={filteredData.filters}
      onFilterChange={filteredData.setFilter}
      onClearFilter={filteredData.clearFilter}
      onClearAll={filteredData.clearAllFilters}
      filterConfigs={filterConfigs}
      totalCount={filteredData.totalCount}
      filteredCount={filteredData.filteredCount}
    />
  );

  const DataTableComponent = () => (
    <DataTable
      data={filteredData.filteredData}
      columns={columnConfigs}
      sortConfig={filteredData.sortConfig}
      onSort={filteredData.toggleSort}
    />
  );

  return {
    filteredData,
    FilterBar: FilterBarComponent,
    DataTable: DataTableComponent
  };
};