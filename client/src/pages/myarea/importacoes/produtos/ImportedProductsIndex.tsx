import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Eye, Trash2, Package, Building2, Clock, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

// Types
interface ImportedProduct {
  id: string;
  name: string;
  internalCode: string;
  status: 'research' | 'analysis' | 'negotiation' | 'ordered' | 'shipped' | 'arrived' | 'cancelled';
  description?: string;
  category?: string;
  brand?: string;
  model?: string;
  hasMultiplePackages: boolean;
  totalPackages: number;
  supplierId?: number;
  supplierName?: string;
  supplierProductCode?: string;
  moq?: number;
  leadTimeDays?: number;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ImportedProductsResponse {
  success: boolean;
  data: {
    products: ImportedProduct[];
    pagination: PaginationData;
  };
}

// Status mapping
const statusConfig = {
  research: { label: 'Pesquisa', color: 'bg-gray-100 text-gray-800' },
  analysis: { label: 'Análise', color: 'bg-blue-100 text-blue-800' },
  negotiation: { label: 'Negociação', color: 'bg-yellow-100 text-yellow-800' },
  ordered: { label: 'Pedido', color: 'bg-purple-100 text-purple-800' },
  shipped: { label: 'Enviado', color: 'bg-orange-100 text-orange-800' },
  arrived: { label: 'Chegou', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

export default function ImportedProductsIndex() {
  const { toast } = useToast();
  
  // States
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [data, setData] = useState<ImportedProductsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [productImages, setProductImages] = useState<Record<string, string>>({});
  
  const limit = 10;

  // Fetch products using native fetch with authentication
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });
      
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/imported-products?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[IMPORTED_PRODUCTS] Error response:', errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      setData(result);
      
      // Buscar primeira imagem de cada produto
      if (result?.data?.products?.length > 0) {
        fetchProductImages(result.data.products);
      }
      
      setIsLoading(false);
    } catch (err: any) {
      console.error('[IMPORTED_PRODUCTS] Error:', err);
      setError(err);
      setIsLoading(false);
    }
  };

  // Buscar primeira imagem de cada produto
  const fetchProductImages = async (products: ImportedProduct[]) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const imagePromises = products.map(async (product) => {
      try {
        const response = await fetch(`/api/product-images/product/${product.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const imageData = await response.json();
          if (imageData.success && imageData.data?.length > 0) {
            // Pegar primeira imagem (position 1)
            const firstImage = imageData.data.find((img: any) => img.position === 1) || imageData.data[0];
            return { productId: product.id, imageUrl: firstImage.url };
          }
        }
        return { productId: product.id, imageUrl: null };
      } catch (error) {
        console.error(`Erro ao buscar imagem do produto ${product.id}:`, error);
        return { productId: product.id, imageUrl: null };
      }
    });

    const results = await Promise.all(imagePromises);
    const imagesMap: Record<string, string> = {};
    results.forEach(result => {
      if (result.imageUrl) {
        imagesMap[result.productId] = result.imageUrl;
      }
    });
    
    setProductImages(imagesMap);
  };

  // Load data on component mount and when dependencies change
  useEffect(() => {
    fetchProducts();
  }, [page, search, statusFilter, categoryFilter, sortBy, sortOrder]);

  const products = data?.data?.products || [];
  const pagination = data?.data?.pagination;

  // Handle search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Handle filters
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value === 'all' ? '' : value);
    setPage(1);
  };

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value === 'all' ? '' : value);
    setPage(1);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle delete
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja deletar o produto "${name}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/imported-products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar produto');
      }

      toast({
        title: 'Sucesso',
        description: 'Produto deletado com sucesso',
      });

      fetchProducts();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao deletar produto',
        variant: 'destructive',
      });
    }
  };

  // Get unique categories for filter
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  if (error) {
    console.error('[IMPORTED_PRODUCTS] Render error:', error);
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600">Erro ao carregar produtos importados</p>
            <p className="text-sm text-gray-500 mt-2">{error.message}</p>
            <Button onClick={() => fetchProducts()} className="mt-4">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Produtos Importados</h1>
          <p className="text-gray-600 mt-2">
            Gerencie todos os produtos em processo de importação
          </p>
        </div>
        <Link href="/minha-area/importacoes/produtos/novo">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </Link>
      </div>



      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou código..."
                value={search}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter || 'all'} onValueChange={handleStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                {Object.entries(statusConfig).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={categoryFilter || 'all'} onValueChange={handleCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category || ''}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={`${sortBy}_${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('_');
              setSortBy(field);
              setSortOrder(order as 'asc' | 'desc');
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at_desc">Mais Recentes</SelectItem>
                <SelectItem value="created_at_asc">Mais Antigos</SelectItem>
                <SelectItem value="name_asc">Nome A-Z</SelectItem>
                <SelectItem value="name_desc">Nome Z-A</SelectItem>
                <SelectItem value="status_asc">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table - Simplified */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Carregando produtos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum produto encontrado</p>
              <Link href="/minha-area/importacoes/produtos/novo">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Produto
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Foto</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {productImages[product.id] ? (
                            <img 
                              src={productImages[product.id]} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Se a imagem falhar, mostrar ícone
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement!.innerHTML = '<svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>';
                              }}
                            />
                          ) : (
                            <Package className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.brand && (
                            <p className="text-sm text-gray-600">{product.brand}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {product.internalCode}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[product.status].color}>
                          {statusConfig[product.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {product.category ? (
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/minha-area/importacoes/produtos/${product.id}`}>
                            <Button variant="ghost" size="sm" title="Visualizar">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/minha-area/importacoes/produtos/${product.id}/editar`}>
                            <Button variant="ghost" size="sm" title="Editar">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id, product.name)}
                            className="text-red-600 hover:text-red-700"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-gray-600">
                    Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                    {pagination.total} produtos
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    >
                      Anterior
                    </Button>
                    <span className="flex items-center px-3 py-1 text-sm">
                      Página {pagination.page} de {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}