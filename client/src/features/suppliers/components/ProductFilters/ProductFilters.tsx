/**
 * COMPONENTE: ProductFilters
 * Filtros para produtos do fornecedor
 * Extraído de SupplierProductsTabSimple.tsx para modularização
 */
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { ProductFilters as FilterType } from '../../hooks/useSupplierProducts';

interface ProductFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: Partial<FilterType>) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ProductFilters = ({
  filters,
  onFiltersChange,
  currentPage,
  totalPages,
  onPageChange
}: ProductFiltersProps) => {
  // ===== FILTER HANDLERS =====
  const handleSearchChange = (value: string) => {
    onFiltersChange({ search: value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ linkStatus: value === 'all' ? '' : value });
  };

  const handleCategoryChange = (value: string) => {
    onFiltersChange({ category: value === 'all' ? '' : value });
  };

  const handleClearFilters = () => {
    onFiltersChange({ search: '', linkStatus: '', category: '' });
  };

  const hasActiveFilters = filters.search || filters.linkStatus || filters.category;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome do produto ou código SKU..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <Select 
              value={filters.linkStatus || 'all'} 
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status de Vinculação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="linked">✅ Vinculado</SelectItem>
                <SelectItem value="pending">⚠️ Pendente</SelectItem>
                <SelectItem value="not_found">❌ Não encontrado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="w-full lg:w-48">
            <Select 
              value={filters.category || 'all'} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                <SelectItem value="eletronicos">Eletrônicos</SelectItem>
                <SelectItem value="casa">Casa e Jardim</SelectItem>
                <SelectItem value="roupas">Roupas e Acessórios</SelectItem>
                <SelectItem value="esportes">Esportes</SelectItem>
                <SelectItem value="livros">Livros</SelectItem>
                <SelectItem value="brinquedos">Brinquedos</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <X className="h-4 w-4" />
              Limpar Filtros
            </Button>
          )}
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span>Filtros ativos:</span>
            {filters.search && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Busca: "{filters.search}"
              </span>
            )}
            {filters.linkStatus && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                Status: {filters.linkStatus === 'linked' ? 'Vinculado' : 
                        filters.linkStatus === 'pending' ? 'Pendente' : 'Não encontrado'}
              </span>
            )}
            {filters.category && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                Categoria: {filters.category}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};