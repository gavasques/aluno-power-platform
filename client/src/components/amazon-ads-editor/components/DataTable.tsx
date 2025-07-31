import React, { useState, useMemo, useCallback } from 'react';
import { 
  Edit3, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  Search,
  Filter,
  X
} from 'lucide-react';
import { AmazonAdsRow, FilterState } from '../utils/types';
import { formatPercentage } from '../utils/validation';
import { formatCurrency } from '@/lib/utils/unifiedFormatters';

interface DataTableProps {
  data: AmazonAdsRow[];
  selectedRows: Set<string>;
  onRowSelect: (rowId: string) => void;
  onSelectAll: (selected: boolean) => void;
  onEditRow: (row: AmazonAdsRow) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  filterOptions: {
    entidades: string[];
    campanhas: string[];
    estados: string[];
  };
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

const ITEMS_PER_PAGE = 50;

export const DataTable: React.FC<DataTableProps> = ({
  data,
  selectedRows,
  onRowSelect,
  onSelectAll,
  onEditRow,
  filters,
  onFiltersChange,
  filterOptions
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });
  const [showFilters, setShowFilters] = useState(false);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof AmazonAdsRow];
      const bValue = b[sortConfig.key as keyof AmazonAdsRow];
      
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortConfig.direction === 'asc') {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      } else {
        return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
      }
    });
  }, [data, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);

  const handleSort = useCallback((key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  }, []);

  const getSortIcon = useCallback((key: string) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="h-4 w-4" />;
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />;
  }, [sortConfig]);

  const getValidationIcon = useCallback((row: AmazonAdsRow) => {
    if (!row._validationErrors || row._validationErrors.length === 0) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    const hasCritical = row._validationErrors.some(e => e.type === 'critical');
    const hasError = row._validationErrors.some(e => e.type === 'error');
    
    if (hasCritical) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    if (hasError) {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
    return <Info className="h-4 w-4 text-yellow-500" />;
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    onSelectAll(checked);
  }, [onSelectAll]);

  const isAllSelected = sortedData.length > 0 && sortedData.every(row => selectedRows.has(row._id!));
  const isPartiallySelected = !isAllSelected && sortedData.some(row => selectedRows.has(row._id!));

  const clearFilters = useCallback(() => {
    onFiltersChange({
      entidade: '',
      campanha: '',
      estado: '',
      alteracoes: 'todas',
      validacao: 'todas',
      busca: ''
    });
  }, [onFiltersChange]);

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
    key !== 'alteracoes' && key !== 'validacao' && value !== '' && value !== 'todas'
  );

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {/* Header with filters */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Dados Amazon Ads
            </h3>
            <p className="text-sm text-gray-600">
              {sortedData.length} linha(s) • {selectedRows.size} selecionada(s)
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                showFilters ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-300'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
              {hasActiveFilters && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {Object.values(filters).filter(v => v !== '' && v !== 'todas').length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 bg-white rounded-lg border">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.busca}
                  onChange={(e) => onFiltersChange({ ...filters, busca: e.target.value })}
                  placeholder="Campanha, keyword..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Entidade
              </label>
              <select
                value={filters.entidade}
                onChange={(e) => onFiltersChange({ ...filters, entidade: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas</option>
                {filterOptions.entidades.map(entity => (
                  <option key={entity} value={entity}>{entity}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filters.estado}
                onChange={(e) => onFiltersChange({ ...filters, estado: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos</option>
                {filterOptions.estados.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Alterações
              </label>
              <select
                value={filters.alteracoes}
                onChange={(e) => onFiltersChange({ ...filters, alteracoes: e.target.value as any })}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todas">Todas</option>
                <option value="alteradas">Alteradas</option>
                <option value="sem_alteracoes">Sem alterações</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Validação
              </label>
              <select
                value={filters.validacao}
                onChange={(e) => onFiltersChange({ ...filters, validacao: e.target.value as any })}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todas">Todas</option>
                <option value="com_erros">Com erros</option>
                <option value="sem_erros">Sem erros</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Limpar</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={input => {
                    if (input) input.indeterminate = isPartiallySelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              
              {/* Sortable columns */}
              {[
                { key: 'Entidade', label: 'Entidade' },
                { key: 'Nome da campanha', label: 'Campanha' },
                { key: 'Texto de palavras-chave', label: 'Keyword' },
                { key: 'Estado', label: 'Estado' },
                { key: 'Lance', label: 'Lance' },
                { key: 'Impressões', label: 'Impressões' },
                { key: 'Cliques', label: 'Cliques' },
                { key: 'Gastos', label: 'Gastos' },
                { key: 'ACOS', label: 'ACoS' }
              ].map(column => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {getSortIcon(column.key)}
                  </div>
                </th>
              ))}
              
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <tr
                key={row._id}
                className={`hover:bg-gray-50 transition-colors ${
                  row._hasChanges ? 'bg-yellow-50' : ''
                } ${
                  selectedRows.has(row._id!) ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(row._id!)}
                    onChange={() => onRowSelect(row._id!)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    {getValidationIcon(row)}
                    {row._hasChanges && (
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Linha alterada" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {row.Entidade}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                  {row['Nome da campanha']}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                  {row['Texto de palavras-chave'] || '-'}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    row.Estado === 'ativada' ? 'bg-green-100 text-green-800' :
                    row.Estado === 'pausada' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {row.Estado}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {row.Lance ? formatCurrency(row.Lance) : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {row.Impressões?.toLocaleString() || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {row.Cliques?.toLocaleString() || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {row.Gastos ? formatCurrency(row.Gastos) : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {row.ACOS ? formatPercentage(row.ACOS) : '-'}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onEditRow(row)}
                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                    title="Editar linha"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
          <div className="text-sm text-gray-700">
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, sortedData.length)} de {sortedData.length} resultados
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`flex items-center space-x-1 px-3 py-1 rounded border transition-colors ${
                currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Anterior</span>
            </button>
            
            <span className="text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`flex items-center space-x-1 px-3 py-1 rounded border transition-colors ${
                currentPage === totalPages 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>Próxima</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {sortedData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Nenhum dado encontrado</p>
            <p className="text-sm">
              {hasActiveFilters 
                ? 'Tente ajustar os filtros para encontrar mais resultados'
                : 'Faça o upload de um arquivo para começar'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};