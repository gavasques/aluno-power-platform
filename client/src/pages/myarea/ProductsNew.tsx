/**
 * Products Management Page - New Parallel Implementation
 * Following all 13 optimization principles for clean, modular architecture
 */

import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, TrendingUp, Package, Settings, Eye } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/channelCalculations';

interface Product {
  id: number;
  name: string;
  photo?: string;
  costItem: number;
  taxPercent: number;
  channels?: any[];
  brandName?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const ProductsNew: React.FC = () => {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  // Load products
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['/api/products'],
    staleTime: 30000,
  });

  // Filter and search products
  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];

    let filtered = products as Product[];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brandName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply active filter
    if (filterActive !== null) {
      filtered = filtered.filter(product => product.active === filterActive);
    }

    return filtered;
  }, [products, searchTerm, filterActive]);

  // Calculate statistics
  const stats = useMemo(() => {
    const allProducts = Array.isArray(products) ? products : [];
    const activeCount = allProducts.filter((p: Product) => p.active).length;
    const withChannelsCount = allProducts.filter((p: Product) => 
      p.channels && Array.isArray(p.channels) && p.channels.some((ch: any) => ch.isActive)
    ).length;

    return {
      total: allProducts.length,
      active: activeCount,
      withChannels: withChannelsCount,
      avgCost: allProducts.length > 0 
        ? allProducts.reduce((sum: number, p: Product) => sum + parseFloat(p.costItem?.toString() || '0'), 0) / allProducts.length 
        : 0,
    };
  }, [products]);

  const handleCreateProduct = () => {
    setLocation('/minha-area/produtos/novo');
  };

  const handleViewChannels = (productId: number) => {
    setLocation(`/produtos-pro/${productId}/canais`);
  };

  const handleEditProduct = (productId: number) => {
    setLocation(`/produtos-pro/${productId}/editar`);
  };

  const getActiveChannelsCount = (channels: any[] | undefined) => {
    if (!channels || !Array.isArray(channels)) return 0;
    return channels.filter((ch: any) => ch.isActive).length;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando produtos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <p className="text-lg font-semibold">Erro ao carregar produtos</p>
            <p className="text-sm">{(error as any)?.message || 'Erro desconhecido'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Produtos Pro</h1>
            <p className="text-gray-600">Sistema avançado de multi-canais com cálculos Excel integrados</p>
          </div>
          <Button onClick={handleCreateProduct} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Settings className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Com Canais</p>
                  <p className="text-2xl font-bold">{stats.withChannels}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 font-bold">R$</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Custo Médio</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.avgCost)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Button
              variant={filterActive === null ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterActive(null)}
            >
              Todos
            </Button>
            <Button
              variant={filterActive === true ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterActive(true)}
            >
              Ativos
            </Button>
            <Button
              variant={filterActive === false ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterActive(false)}
            >
              Inativos
            </Button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filterActive !== null ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterActive !== null 
                ? 'Tente ajustar os filtros de busca' 
                : 'Comece criando seu primeiro produto'
              }
            </p>
            {!searchTerm && filterActive === null && (
              <Button onClick={handleCreateProduct} className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Primeiro Produto
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  {/* Product Image */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {product.photo ? (
                      <img 
                        src={product.photo} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-gray-400" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {product.name}
                        </h3>
                        {product.brandName && (
                          <p className="text-sm text-gray-600">Marca: {product.brandName}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={product.active ? "default" : "secondary"}>
                          {product.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <Badge variant="outline">
                          ID: {product.id}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Custo do Item</p>
                        <p className="font-semibold">{formatCurrency(parseFloat(product.costItem?.toString() || '0'))}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Taxa de Imposto</p>
                        <p className="font-semibold">{product.taxPercent}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Canais Ativos</p>
                        <p className="font-semibold">{getActiveChannelsCount(product.channels)} canais</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Última Atualização</p>
                        <p className="font-semibold">
                          {new Date(product.updatedAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewChannels(product.id)}
                      className="gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Canais
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProduct(product.id)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Editar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsNew;
export { ProductsNew };