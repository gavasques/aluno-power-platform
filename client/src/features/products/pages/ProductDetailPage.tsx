import React from 'react';
import { useParams, useLocation } from 'wouter';
import { ArrowLeft, Edit, Settings, Package, DollarSign, BarChart3, FileImage, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCard, ItemCard } from '@/components/ui/card-variants';
import { PageLoadingState } from '@/components/common/LoadingStates';
import { ProductChannelsManager } from '../components/ProductChannelsManager';
import { ProductSupplierManager } from '../components/ProductSupplierManager';
import { useProducts } from '../hooks/useProducts';
import { useBrands } from '@/hooks/useBrands';
import { formatCurrency, formatRelativeTime } from '@/lib/utils/unifiedFormatters';
import { PRODUCT_STATUS_LABELS, PRODUCT_STATUS_COLORS } from '../constants/product';

/**
 * ProductDetailPage - Página de detalhes do produto refatorada
 * 
 * Benefícios:
 * - Página simplificada e organizada
 * - Usa componentes padronizados de loading e cards
 * - Integra managers especializados
 * - Layout responsivo e intuitivo
 * - Stats cards informativos
 */
export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { useGetById } = useProducts();
  const { brands = [] } = useBrands();
  
  const productId = parseInt(id || '0');
  const { data: product, isLoading, error } = useGetById(productId);

  // Helper para buscar nome da marca
  const getBrandName = (product: any): string => {
    if (product?.brandId) {
      const brand = brands.find(b => b.id === product.brandId);
      return brand?.name || '-';
    }
    if (product?.brand && !isNaN(Number(product.brand))) {
      const brand = brands.find(b => b.id === Number(product.brand));
      return brand?.name || product.brand;
    }
    return product?.brand || '-';
  };

  const handleBack = () => {
    navigate('/minha-area/produtos');
  };

  const handleEdit = (section?: string) => {
    if (section) {
      navigate(`/minha-area/produtos/${productId}/editar-${section}`);
    } else {
      navigate(`/minha-area/produtos/${productId}/editar`);
    }
  };

  if (isLoading) {
    return <PageLoadingState message="Carregando detalhes do produto..." />;
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <h2 className="text-xl font-semibold">Produto não encontrado</h2>
            <p className="text-sm mt-2">{(error as any)?.message || 'O produto solicitado não existe ou foi removido.'}</p>
          </div>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para lista
          </Button>
        </div>
      </div>
    );
  }

  const brandName = getBrandName(product);
  const status = product.active ? 'active' : 'inactive';
  const statusLabel = PRODUCT_STATUS_LABELS[status as keyof typeof PRODUCT_STATUS_LABELS] || 'Inativo';
  const statusColors = PRODUCT_STATUS_COLORS[status as keyof typeof PRODUCT_STATUS_COLORS] || PRODUCT_STATUS_COLORS.inactive;

  // Calcular estatísticas dos canais
  const channels = product.channels ? Object.values(product.channels) : [];
  const activeChannels = channels.filter((ch: any) => ch?.isActive).length;
  const totalChannels = channels.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detalhes do Produto</h1>
            <p className="text-gray-600">Informações completas e gerenciamento</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleEdit('dados')}>
            <Edit className="h-4 w-4 mr-2" />
            Editar Dados
          </Button>
          <Button variant="outline" onClick={() => handleEdit('custos')}>
            <DollarSign className="h-4 w-4 mr-2" />
            Editar Custos
          </Button>
          <Button variant="outline" onClick={() => handleEdit('canais')}>
            <Settings className="h-4 w-4 mr-2" />
            Editar Canais
          </Button>
        </div>
      </div>

      {/* Product Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Product Image */}
            <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
              {product.photo ? (
                <img 
                  src={product.photo} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '<FileImage class="h-8 w-8 text-gray-400" />';
                  }}
                />
              ) : (
                <FileImage className="h-8 w-8 text-gray-400" />
              )}
            </div>
            
            {/* Product Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                  {product.descriptions?.description && (
                    <p className="text-gray-600 mt-2 max-w-2xl">{product.descriptions.description}</p>
                  )}
                </div>
                
                <Badge className={statusColors}>
                  {statusLabel}
                </Badge>
              </div>
              
              <div className="flex items-center gap-6 mt-4">
                {product.sku && (
                  <div className="text-sm">
                    <span className="text-gray-500">SKU:</span>
                    <span className="ml-1 font-mono">{product.sku}</span>
                  </div>
                )}
                {product.ean && (
                  <div className="text-sm">
                    <span className="text-gray-500">EAN:</span>
                    <span className="ml-1 font-mono">{product.ean}</span>
                  </div>
                )}
                {brandName !== '-' && (
                  <div className="text-sm">
                    <span className="text-gray-500">Marca:</span>
                    <Badge variant="outline" className="ml-1">{brandName}</Badge>
                  </div>
                )}
                {product.category && (
                  <div className="text-sm">
                    <span className="text-gray-500">Categoria:</span>
                    <span className="ml-1">{product.category}</span>
                  </div>
                )}
              </div>

              {product.createdAt && (
                <div className="text-sm text-gray-500 mt-2">
                  Criado {formatRelativeTime(product.createdAt)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Custo do Item"
          value={product.costItem ? formatCurrency(product.costItem) : '-'}
          icon={<DollarSign className="h-4 w-4" />}
          description="Último custo registrado"
        />
        
        <StatsCard
          title="Canais Ativos"
          value={`${activeChannels}/${totalChannels}`}
          icon={<Settings className="h-4 w-4" />}
          description="Canais de venda configurados"
          trend={activeChannels > 0 ? {
            value: Math.round((activeChannels / Math.max(totalChannels, 1)) * 100),
            isPositive: true,
            label: "% ativo"
          } : undefined}
        />
        
        <StatsCard
          title="Peso"
          value={product.weight ? `${product.weight} kg` : '-'}
          icon={<Package className="h-4 w-4" />}
          description="Peso do produto"
        />
        
        <StatsCard
          title="Dimensões"
          value={product.dimensions?.length && product.dimensions?.width && product.dimensions?.height 
            ? `${product.dimensions.length}×${product.dimensions.width}×${product.dimensions.height} cm`
            : '-'
          }
          icon={<Package className="h-4 w-4" />}
          description="Comprimento × Largura × Altura"
        />
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="channels" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="channels" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Canais de Venda
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Fornecedores
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Análise Financeira
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <FileImage className="h-4 w-4" />
            Detalhes Técnicos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-6">
          <ProductChannelsManager productId={productId} />
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <ProductSupplierManager productId={productId} />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Análise Financeira
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Análise de rentabilidade, margens e performance por canal em desenvolvimento.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações Técnicas */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Técnicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Código Interno:</span>
                    <p className="font-mono">{product.internalCode || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">NCM:</span>
                    <p className="font-mono">{product.ncm || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Peso:</span>
                    <p>{product.weight ? `${product.weight} kg` : '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Imposto Global:</span>
                    <p>{product.taxPercent ? `${product.taxPercent}%` : '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Observações */}
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                {product.observations ? (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.observations}</p>
                ) : (
                  <p className="text-sm text-gray-500 italic">Nenhuma observação registrada</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProductDetailPage;