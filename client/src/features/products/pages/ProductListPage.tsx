import React from 'react';
import { ProductManager } from '../components/ProductManager';
import { StatsCard } from '@/components/ui/card-variants';
import { Package, DollarSign, TrendingUp, AlertCircle, FileImage, ShoppingCart } from 'lucide-react';
import { useProducts, useProductStats } from '../hooks/useProducts';
import { formatCurrency, formatCompactNumber } from '@/lib/utils/unifiedFormatters';
import { PageLoadingState } from '@/components/common/LoadingStates';

/**
 * ProductListPage - Página principal de listagem de produtos
 * 
 * Benefícios:
 * - Página simplificada usando novos componentes
 * - Cards de estatísticas usando StatsCard
 * - ProductManager integrado
 * - Layout responsivo e organizado
 * - Stats em tempo real
 */
export function ProductListPage() {
  const { useGetAll, useCount } = useProducts();
  const { data: products = [], isLoading: productsLoading } = useGetAll();
  const { data: totalCount = 0, isLoading: countLoading } = useCount();
  const { getStats } = useProductStats();
  const { data: stats, isLoading: statsLoading } = getStats;

  // Loading state
  if (productsLoading && products.length === 0) {
    return <PageLoadingState message="Carregando produtos..." />;
  }

  // Calcular estatísticas se não vieram do backend
  const calculatedStats = React.useMemo(() => {
    if (stats) return stats;
    
    const activeProducts = products.filter(p => p.active).length;
    const withoutPhoto = products.filter(p => !p.photo).length;
    const withoutPrice = products.filter(p => !p.costItem || p.costItem === 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.costItem || 0), 0);
    const activeChannels = products.reduce((sum, p) => {
      const channels = p.channels ? Object.values(p.channels) : [];
      return sum + channels.filter((ch: any) => ch?.isActive).length;
    }, 0);

    return {
      total: totalCount,
      active: activeProducts,
      inactive: totalCount - activeProducts,
      withoutPhoto,
      withoutPrice,
      totalValue,
      activeChannels,
      avgCostPrice: totalValue / (products.length || 1),
    };
  }, [products, totalCount, stats]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meus Produtos</h1>
        <p className="text-gray-600">Gerencie seu catálogo de produtos e canais de venda</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Produtos"
          value={formatCompactNumber(calculatedStats.total)}
          icon={<Package className="h-4 w-4" />}
          description="Produtos cadastrados"
          isLoading={countLoading}
        />
        
        <StatsCard
          title="Produtos Ativos"
          value={formatCompactNumber(calculatedStats.active)}
          icon={<TrendingUp className="h-4 w-4" />}
          trend={{ 
            value: Math.round((calculatedStats.active / calculatedStats.total) * 100), 
            isPositive: true,
            label: "% do total"
          }}
          description="Produtos disponíveis para venda"
          isLoading={statsLoading}
        />
        
        <StatsCard
          title="Valor Total"
          value={formatCurrency(calculatedStats.totalValue)}
          icon={<DollarSign className="h-4 w-4" />}
          description="Valor total em custos"
          trend={{
            value: Math.round(calculatedStats.avgCostPrice),
            isPositive: true,
            label: "Média por produto"
          }}
          isLoading={statsLoading}
        />
        
        <StatsCard
          title="Sem Foto"
          value={formatCompactNumber(calculatedStats.withoutPhoto)}
          icon={<FileImage className="h-4 w-4" />}
          description="Produtos sem imagem"
          trend={{
            value: Math.round((calculatedStats.withoutPhoto / calculatedStats.total) * 100),
            isPositive: false,
            label: "% do total"
          }}
          isLoading={statsLoading}
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Canais Ativos"
          value={formatCompactNumber(calculatedStats.activeChannels || 0)}
          icon={<ShoppingCart className="h-4 w-4" />}
          description="Total de canais configurados"
          variant="outline"
          isLoading={statsLoading}
        />
        
        <StatsCard
          title="Sem Preço"
          value={formatCompactNumber(calculatedStats.withoutPrice)}
          icon={<AlertCircle className="h-4 w-4" />}
          description="Produtos sem custo definido"
          variant="outline"
          trend={{
            value: Math.round((calculatedStats.withoutPrice / calculatedStats.total) * 100),
            isPositive: false,
            label: "% do total"
          }}
          isLoading={statsLoading}
        />
        
        <StatsCard
          title="Produtos Inativos"
          value={formatCompactNumber(calculatedStats.inactive)}
          icon={<Package className="h-4 w-4" />}
          description="Produtos desativados"
          variant="outline"
          isLoading={statsLoading}
        />
      </div>

      {/* Product Manager */}
      <div className="bg-white rounded-lg border shadow-sm">
        <ProductManager />
      </div>
    </div>
  );
}

export default ProductListPage;