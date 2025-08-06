import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, TrendingUp, Package, Settings, Eye, Zap, Calculator } from 'lucide-react';
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

export default function ProductsPro() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
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
    setLocation(`/produtos-novo/${productId}/canais`);
  };

  const handleEditProduct = (productId: number) => {
    setLocation(`/minha-area/produtos/${productId}/editar`);
  };

  const getActiveChannelsCount = (channels: any[] | undefined) => {
    if (!channels || !Array.isArray(channels)) return 0;
    return channels.filter((ch: any) => ch.isActive).length;
  };

  const features = [
    {
      icon: Calculator,
      title: "Cálculos Excel Integrados",
      description: "Sistema avançado de cálculos com fórmulas Excel nativas para margens, custos e preços"
    },
    {
      icon: TrendingUp,
      title: "18+ Campos de Custo",
      description: "Controle detalhado de todos os custos: produto, logística, taxas, impostos e margens"
    },
    {
      icon: Zap,
      title: "Multi-Canais Avançado",
      description: "Gerencie preços e configurações para Amazon, Mercado Livre, Shopee e outros marketplaces"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Produtos Pro
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Sistema avançado de gerenciamento de produtos com cálculos integrados
          </p>
        </div>
        <Button onClick={handleCreateProduct} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Produtos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Produtos Ativos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Com Canais</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.withChannels}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Calculator className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Custo Médio</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(stats.avgCost)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar produtos por nome, SKU ou marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterActive === null ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterActive(null)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
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
        </CardContent>
      </Card>

      {/* Products List */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Carregando produtos...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <div className="text-red-600 dark:text-red-400 mb-4">
                <p className="text-lg font-semibold">Erro ao carregar produtos</p>
                <p className="text-sm">{(error as any)?.message || 'Erro desconhecido'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {searchTerm || filterActive !== null ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || filterActive !== null 
                  ? 'Tente ajustar os filtros de busca para encontrar produtos.'
                  : 'Comece criando seu primeiro produto com sistema avançado de cálculos.'
                }
              </p>
              {!searchTerm && filterActive === null && (
                <Button onClick={handleCreateProduct} className="flex items-center gap-2 mx-auto">
                  <Plus className="h-4 w-4" />
                  Criar Primeiro Produto
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
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
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {product.brandName && `${product.brandName} • `}
                        Custo: {formatCurrency(product.costItem)}
                        {product.taxPercent > 0 && ` • Taxa: ${product.taxPercent}%`}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={product.active ? "default" : "secondary"}>
                          {product.active ? "Ativo" : "Inativo"}
                        </Badge>
                        {product.channels && (
                          <Badge variant="outline">
                            {getActiveChannelsCount(product.channels)} canais ativos
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewChannels(product.id)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Canais
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProduct(product.id)}
                      className="flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
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
}