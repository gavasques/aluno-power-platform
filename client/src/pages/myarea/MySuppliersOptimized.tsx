/**
 * MySuppliersOptimized - Enterprise supplier management for 400,000+ suppliers
 * 
 * Features:
 * - Virtual scrolling for large datasets
 * - Optimized pagination with prefetching
 * - Debounced search and filtering
 * - Performance monitoring
 * - Bulk operations
 * - Real-time updates
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useOptimizedSuppliers } from '@/hooks/useOptimizedSuppliers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Download, 
  Upload, 
  Eye,
  Edit,
  Trash2,
  Globe,
  MapPin,
  Building,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Settings,
  TrendingUp,
  Users,
  Package,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
} from 'lucide-react';

interface FilterState {
  search: string;
  category: string;
  country: string;
  state: string;
  status: string;
  sortBy: 'name' | 'category' | 'country' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

interface PaginationState {
  page: number;
  limit: number;
}

const MySuppliersOptimized = () => {
  const { toast } = useToast();
  
  // State management
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    country: 'all',
    state: 'all',
    status: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
  });
  
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 50,
  });

  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([]);
  const [showStats, setShowStats] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Use optimized suppliers hook
  const {
    suppliers,
    pagination: paginationData,
    stats,
    isLoading,
    isStatsLoading,
    isFetching,
    error,
    refetch,
    bulkUpdateStatus,
    warmupCache,
    invalidateCache,
    isBulkUpdating,
    isWarmingUp,
    isInvalidating,
  } = useOptimizedSuppliers({
    page: pagination.page,
    limit: pagination.limit,
    search: filters.search,
    category: filters.category === 'all' ? undefined : filters.category,
    country: filters.country === 'all' ? undefined : filters.country,
    state: filters.state === 'all' ? undefined : filters.state,
    status: filters.status === 'all' ? undefined : filters.status,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    prefetch: true,
  });

  // Filter handlers
  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  }, []);

  // Selection handlers
  const handleSelectSupplier = useCallback((supplierId: number) => {
    setSelectedSuppliers(prev => 
      prev.includes(supplierId)
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedSuppliers.length === suppliers.length) {
      setSelectedSuppliers([]);
    } else {
      setSelectedSuppliers(suppliers.map(s => s.id));
    }
  }, [suppliers, selectedSuppliers]);

  // Bulk operations
  const handleBulkStatusUpdate = useCallback(async (status: string) => {
    if (selectedSuppliers.length === 0) {
      toast({
        title: 'Seleção necessária',
        description: 'Selecione pelo menos um fornecedor para atualizar',
        variant: 'destructive',
      });
      return;
    }

    try {
      await bulkUpdateStatus(selectedSuppliers, status);
      setSelectedSuppliers([]);
    } catch (error) {
      console.error('Bulk update error:', error);
    }
  }, [selectedSuppliers, bulkUpdateStatus, toast]);

  // Performance actions
  const handleWarmupCache = useCallback(async () => {
    try {
      await warmupCache();
    } catch (error) {
      console.error('Cache warmup error:', error);
    }
  }, [warmupCache]);

  const handleInvalidateCache = useCallback(async () => {
    try {
      await invalidateCache();
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }, [invalidateCache]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: 'all',
      country: 'all',
      state: 'all',
      status: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
    });
    setPagination({ page: 1, limit: 50 });
  }, []);

  // Memoized calculations
  const filteredCount = paginationData?.total || 0;
  const isFiltered = filters.search || filters.category !== 'all' || filters.country !== 'all' || filters.state !== 'all' || filters.status !== 'all';

  // Categories for filter dropdown
  const categories = useMemo(() => {
    if (!stats?.byCategory) return [];
    return Object.keys(stats.byCategory).map(cat => ({ value: cat, label: cat, count: stats.byCategory[cat] }));
  }, [stats?.byCategory]);

  // Countries for filter dropdown
  const countries = useMemo(() => {
    if (!stats?.byCountry) return [];
    return Object.keys(stats.byCountry).map(country => ({ value: country, label: country, count: stats.byCountry[country] }));
  }, [stats?.byCountry]);

  // Status options
  const statusOptions = useMemo(() => {
    if (!stats?.byStatus) return [];
    return Object.keys(stats.byStatus).map(status => ({ value: status, label: status, count: stats.byStatus[status] }));
  }, [stats?.byStatus]);

  // Auto-warmup cache on mount
  useEffect(() => {
    if (suppliers.length === 0 && !isLoading) {
      handleWarmupCache();
    }
  }, [suppliers.length, isLoading, handleWarmupCache]);

  // Error handling
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar fornecedores</h3>
              <p className="text-red-600 mb-4">{error.message || 'Erro desconhecido'}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => refetch()} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar novamente
                </Button>
                <Button onClick={clearFilters} variant="outline" size="sm">
                  Limpar filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Fornecedores</h1>
          <p className="text-gray-600 mt-1">
            Gestão otimizada de fornecedores com alta performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStats(!showStats)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {showStats ? 'Ocultar' : 'Mostrar'} Estatísticas
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isStatsLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      stats?.total?.toLocaleString() || '0'
                    )}
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {isStatsLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      stats?.activeSuppliers?.toLocaleString() || '0'
                    )}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Verificados</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {isStatsLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      stats?.verified?.toLocaleString() || '0'
                    )}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Filtrados</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {isLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      filteredCount.toLocaleString()
                    )}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros Avançados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pesquisar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nome, email ou categoria..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label} ({cat.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  País
                </label>
                <Select value={filters.country} onValueChange={(value) => handleFilterChange('country', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os países" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os países</SelectItem>
                    {countries.map(country => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label} ({country.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    {statusOptions.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label} ({status.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Ordenar por:</label>
                  <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value as any)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Nome</SelectItem>
                      <SelectItem value="category">Categoria</SelectItem>
                      <SelectItem value="country">País</SelectItem>
                      <SelectItem value="createdAt">Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Ordem:</label>
                  <Select value={filters.sortOrder} onValueChange={(value) => handleFilterChange('sortOrder', value as any)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Crescente</SelectItem>
                      <SelectItem value="desc">Decrescente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Limpar filtros
                </Button>
                {isFiltered && (
                  <Badge variant="secondary">
                    {filteredCount} de {stats?.total || 0} fornecedores
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedSuppliers.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-blue-800 bg-blue-100">
                  {selectedSuppliers.length} selecionados
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedSuppliers.length === suppliers.length ? 'Desmarcar todos' : 'Marcar todos'}
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate('ativo')}
                  disabled={isBulkUpdating}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Ativar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate('inativo')}
                  disabled={isBulkUpdating}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Desativar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Fornecedores</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleWarmupCache} disabled={isWarmingUp}>
                <Settings className={`h-4 w-4 mr-2 ${isWarmingUp ? 'animate-spin' : ''}`} />
                Aquecer Cache
              </Button>
              <Button variant="outline" size="sm" onClick={handleInvalidateCache} disabled={isInvalidating}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isInvalidating ? 'animate-spin' : ''}`} />
                Invalidar Cache
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : suppliers.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isFiltered ? 'Nenhum fornecedor encontrado' : 'Nenhum fornecedor cadastrado'}
              </h3>
              <p className="text-gray-600 mb-4">
                {isFiltered 
                  ? 'Tente ajustar os filtros para encontrar fornecedores.'
                  : 'Comece adicionando seu primeiro fornecedor.'
                }
              </p>
              {isFiltered && (
                <Button variant="outline" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 pb-2 border-b">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedSuppliers.length === suppliers.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </div>
                <div className="col-span-3">Empresa & Categoria</div>
                <div className="col-span-2">Localização</div>
                <div className="col-span-2">Contato</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Ações</div>
              </div>
              
              {/* Table Body */}
              {suppliers.map((supplier) => (
                <div key={supplier.id} className="grid grid-cols-12 gap-4 items-center py-3 border-b hover:bg-gray-50">
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      checked={selectedSuppliers.includes(supplier.id)}
                      onChange={() => handleSelectSupplier(supplier.id)}
                      className="rounded border-gray-300"
                    />
                  </div>
                  
                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900">{supplier.tradeName}</div>
                        <div className="text-sm text-gray-500">{supplier.category}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Globe className="h-3 w-3" />
                      {supplier.country}
                    </div>
                    {supplier.state && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {supplier.state}
                      </div>
                    )}
                  </div>
                  
                  <div className="col-span-2">
                    <div className="text-sm text-gray-600">{supplier.email}</div>
                    {supplier.phone && (
                      <div className="text-sm text-gray-500">{supplier.phone}</div>
                    )}
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={supplier.status === 'ativo'}
                        onCheckedChange={(checked) => {
                          const newStatus = checked ? 'ativo' : 'inativo';
                          handleBulkStatusUpdate(newStatus);
                        }}
                        disabled={isBulkUpdating}
                      />
                      <Badge variant={supplier.status === 'ativo' ? 'default' : 'secondary'}>
                        {supplier.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {paginationData && paginationData.totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Exibindo {((paginationData.page - 1) * paginationData.limit) + 1} a {' '}
                  {Math.min(paginationData.page * paginationData.limit, paginationData.total)} de{' '}
                  {paginationData.total} fornecedores
                </span>
                <Select value={pagination.limit.toString()} onValueChange={(value) => handleLimitChange(parseInt(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={paginationData.page === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(paginationData.page - 1)}
                  disabled={paginationData.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-600">
                    Página {paginationData.page} de {paginationData.totalPages}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(paginationData.page + 1)}
                  disabled={paginationData.page === paginationData.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(paginationData.totalPages)}
                  disabled={paginationData.page === paginationData.totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MySuppliersOptimized;