import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Ruler, DollarSign, Edit, ExternalLink, Building2, Hash, Barcode } from "lucide-react";
import { useLocation } from "wouter";
import { formatCurrency } from "@/utils/productCalculations";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ProductPageProps, Product } from "@/types/core";

interface ProductPreviewProps extends ProductPageProps {
  showActions?: boolean;
  onEdit?: (productId: string) => void;
  onDelete?: (productId: string) => void;
  showMetrics?: boolean;
}

export default function ProductPreview({ 
  showActions = true, 
  onEdit, 
  onDelete,
  showMetrics = true 
}: ProductPreviewProps) {
  const [, setLocation] = useLocation();
  const params = useParams();
  const productId = params.id;

  const handleEdit = () => {
    if (onEdit && productId) {
      onEdit(productId);
    } else {
      setLocation(`/minha-area/produtos/${productId}/editar`);
    }
  };

  const handleDelete = () => {
    if (onDelete && productId) {
      onDelete(productId);
    }
  };

  const { data: productData, isLoading } = useQuery({
    queryKey: ['/api/products', productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch product');
      const result = await response.json();
      return result.data;
    },
    enabled: !!productId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <LoadingSpinner size="md" className="text-blue-600" />
          <p className="text-lg text-slate-600">Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-600">Produto não encontrado</p>
          <Button
            variant="outline"
            onClick={() => setLocation("/minha-area/produtos")}
            className="mt-4"
          >
            Voltar para Produtos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setLocation("/minha-area/produtos")}
            className="hover:bg-white/80"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Produtos
          </Button>
          
          {showActions && (
            <Button
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Produto
            </Button>
          )}
        </div>

        {/* Product Header */}
        <div className="bg-white rounded-xl p-8 shadow-sm border mb-8">
          <div className="flex items-start gap-8">
            {productData.photo && (
              <div className="flex-shrink-0">
                <img 
                  src={productData.photo} 
                  alt={productData.name}
                  className="w-48 h-48 object-cover rounded-lg border"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 mb-4">{productData.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="outline" className="text-sm">
                  {productData.active ? 'Ativo' : 'Inativo'}
                </Badge>
                {productData.brandName && (
                  <Badge variant="secondary" className="text-sm">
                    <Building2 className="h-3 w-3 mr-1" />
                    {productData.brandName}
                  </Badge>
                )}
              </div>
              {productData.observations && (
                <p className="text-slate-600">{productData.observations}</p>
              )}
            </div>
          </div>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">SKU</p>
                  <p className="font-medium">{productData.sku || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Código Interno</p>
                  <p className="font-medium">{productData.internalCode || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Código Livre</p>
                  <p className="font-medium">{productData.freeCode || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Código do Fornecedor</p>
                  <p className="font-medium">{productData.supplierCode || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">EAN/UPC/GTIN</p>
                  <p className="font-medium">{productData.ean || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">NCM</p>
                  <p className="font-medium">{productData.ncm || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dimensions & Weight */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Dimensões & Peso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-2">Dimensões da Caixa (cm)</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Comprimento</p>
                    <p className="font-medium">{productData.dimensions?.length || 0} cm</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Largura</p>
                    <p className="font-medium">{productData.dimensions?.width || 0} cm</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Altura</p>
                    <p className="font-medium">{productData.dimensions?.height || 0} cm</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500">Peso com a Caixa</p>
                <p className="font-medium">{productData.weight || 0} kg</p>
              </div>
            </CardContent>
          </Card>

          {/* Costs & Taxes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Custos & Impostos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Custo do Item</p>
                  <p className="font-medium text-lg">{formatCurrency(parseFloat(productData.costItem) || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Custo de Embalagem</p>
                  <p className="font-medium">{formatCurrency(parseFloat(productData.packCost) || 0)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500">Imposto Global</p>
                <p className="font-medium">{productData.taxPercent || 0}%</p>
              </div>
            </CardContent>
          </Card>

          {/* Sales Channels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Canais de Venda Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {productData.channels?.filter((ch: any) => ch.isActive).map((channel: any) => (
                  <div key={channel.type} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium">
                      {channel.type.replace(/_/g, ' ')}
                    </span>
                    {channel.data?.price && (
                      <span className="text-lg font-semibold text-green-600">
                        {formatCurrency(channel.data.price)}
                      </span>
                    )}
                  </div>
                )) || <p className="text-slate-500">Nenhum canal ativo</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}