import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Package, ShoppingCart, Calculator, BarChart3, FileText } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Product } from "@/types/product";
import ProductSalesChannels from "@/components/product/view/ProductSalesChannels";
import ProductFinancialSimulation from "@/components/product/view/ProductFinancialSimulation";

export default function ProductDetail() {
  const params = useParams();
  const productId = params.id;

  const { data: product, isLoading, error } = useQuery({
    queryKey: [`/api/products/${productId}`],
    queryFn: async (): Promise<Product> => {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) {
        throw new Error('Produto não encontrado');
      }
      return response.json();
    },
    enabled: !!productId
  });

  const handleBack = () => {
    window.location.href = '/minha-area/produtos';
  };

  const handleEdit = () => {
    window.location.href = `/minha-area/produtos/${productId}/editar`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
                      <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-lg text-muted-foreground">Carregando produto...</p>
          </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-lg text-red-600 mb-4">Produto não encontrado</p>
              <Button onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Package className="h-6 w-6 text-blue-600" />
                {product.name}
              </h1>
              <p className="text-muted-foreground">Detalhes do produto</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={product.active ? "default" : "secondary"}>
              {product.active ? "Ativo" : "Inativo"}
            </Badge>
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>

        {/* Content with Tabs */}
        <Tabs defaultValue="dados" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dados" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Dados do Item
            </TabsTrigger>
            <TabsTrigger value="canais" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Canais de Venda
            </TabsTrigger>
            <TabsTrigger value="simulacao" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Simulação
            </TabsTrigger>
            <TabsTrigger value="analise" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Análise
            </TabsTrigger>
          </TabsList>

          {/* Aba: Dados do Item */}
          <TabsContent value="dados" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informações Básicas */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nome</label>
                      <p className="text-base">{product.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">SKU</label>
                      <p className="text-base">{product.sku || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Código Interno</label>
                      <p className="text-base">{product.internalCode || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">EAN</label>
                      <p className="text-base">{product.ean || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Marca</label>
                      <p className="text-base">{product.brand || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Categoria</label>
                      <p className="text-base">{product.category || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">NCM</label>
                      <p className="text-base">{product.ncm || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Peso</label>
                      <p className="text-base">{product.weight ? `${product.weight} kg` : 'N/A'}</p>
                    </div>
                  </div>
                  {product.observations && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Observações</label>
                      <p className="text-base">{product.observations}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Custos */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Financeiras</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Custo do Item</label>
                    <p className="text-xl font-semibold text-green-600">
                      R$ {Number(product.costItem || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Custo de Embalagem</label>
                    <p className="text-base">R$ {Number(product.packCost || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Taxa de Imposto</label>
                    <p className="text-base">{Number(product.taxPercent || 0).toFixed(2)}%</p>
                  </div>
                  <div className="pt-2 border-t">
                    <label className="text-sm font-medium text-muted-foreground">Custo Total</label>
                    <p className="text-lg font-semibold text-blue-600">
                      R$ {(Number(product.costItem || 0) + Number(product.packCost || 0) + (Number(product.costItem || 0) + Number(product.packCost || 0)) * (Number(product.taxPercent || 0) / 100)).toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Dimensões */}
              {product.dimensions && (
                <Card>
                  <CardHeader>
                    <CardTitle>Dimensões</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Comprimento</label>
                        <p className="text-base">{product.dimensions.length || 0} cm</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Largura</label>
                        <p className="text-base">{product.dimensions.width || 0} cm</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Altura</label>
                        <p className="text-base">{product.dimensions.height || 0} cm</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Status e Datas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <p className="text-base">
                      <Badge variant={product.active ? "default" : "secondary"}>
                        {product.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Criado em</label>
                    <p className="text-base">
                      {new Date(product.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Última atualização</label>
                    <p className="text-base">
                      {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('pt-BR') : 'Não disponível'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba: Canais de Venda */}
          <TabsContent value="canais">
            <ProductSalesChannels product={product} />
          </TabsContent>

          {/* Aba: Simulação */}
          <TabsContent value="simulacao">
            <ProductFinancialSimulation product={product} />
          </TabsContent>

          {/* Aba: Análise */}
          <TabsContent value="analise">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Funcionalidade de análise avançada será implementada em breve.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Incluirá gráficos de performance, comparação de canais e insights de mercado.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}