import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { ArrowLeft, Edit, Trash2, Package, Building2, FileText, Calendar, Tag, Barcode, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Link, useLocation } from 'wouter';

interface ImportedProduct {
  id: string;
  name: string;
  internalCode: string;
  status: 'research' | 'analysis' | 'negotiation' | 'ordered' | 'shipped' | 'arrived' | 'cancelled';
  description?: string;
  detailedDescription?: string;
  category?: string;
  brand?: string;
  model?: string;
  color?: string;
  material?: string;
  technicalSpecifications?: string;
  hasMultiplePackages: boolean;
  totalPackages: number;
  hsCode?: string;
  ipiPercentage?: number;
  productEan?: string;
  productUpc?: string;
  internalBarcode?: string;
  customsDescription?: string;
  supplierId?: number;
  supplierName?: string;
  supplierProductCode?: string;
  supplierProductName?: string;
  supplierDescription?: string;
  moq?: number;
  leadTimeDays?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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

export default function ImportedProductDetail() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  const productId = params.id;

  // States
  const [product, setProduct] = useState<ImportedProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch product data usando useState + useEffect
  useEffect(() => {
    if (!productId || !token) return;

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/imported-products/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        setProduct(result.data);
      } catch (err: any) {
        console.error('[PRODUCT_DETAIL] Error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, token]);

  // Handle delete
  const handleDelete = async () => {
    if (!product || !token) return;
    
    if (!confirm(`Tem certeza que deseja deletar o produto "${product.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/imported-products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar produto');
      }

      toast({
        title: 'Sucesso',
        description: 'Produto deletado com sucesso',
      });

      setLocation('/minha-area/importacoes/produtos');
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao deletar produto',
        variant: 'destructive',
      });
    }
  };

  // Função para recarregar dados em caso de erro
  const handleRetry = () => {
    if (!productId || !token) return;
    
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/imported-products/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        setProduct(result.data);
      } catch (err: any) {
        console.error('[PRODUCT_DETAIL] Error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600">Erro ao carregar produto: {error}</p>
            <Button onClick={handleRetry} className="mt-4">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Carregando produto...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Produto não encontrado</p>
            <Link href="/minha-area/importacoes/produtos">
              <Button className="mt-4">Voltar à Lista</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Link href="/minha-area/importacoes/produtos">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                {product.internalCode}
              </code>
              <Badge className={statusConfig[product.status].color}>
                {statusConfig[product.status].label}
              </Badge>
              {product.brand && (
                <Badge variant="outline">{product.brand}</Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/minha-area/importacoes/produtos/${productId}/editar`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Deletar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Informações do Produto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.description && (
                <div>
                  <h4 className="font-medium mb-2">Descrição</h4>
                  <p className="text-gray-700">{product.description}</p>
                </div>
              )}

              {product.detailedDescription && (
                <div>
                  <h4 className="font-medium mb-2">Descrição Detalhada</h4>
                  <p className="text-gray-700 whitespace-pre-line">{product.detailedDescription}</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {product.category && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Categoria</span>
                    <p className="text-gray-900">{product.category}</p>
                  </div>
                )}
                {product.model && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Modelo</span>
                    <p className="text-gray-900">{product.model}</p>
                  </div>
                )}
                {product.color && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Cor</span>
                    <p className="text-gray-900">{product.color}</p>
                  </div>
                )}
                {product.material && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Material</span>
                    <p className="text-gray-900">{product.material}</p>
                  </div>
                )}
                {product.hsCode && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Código HS</span>
                    <p className="text-gray-900">{product.hsCode}</p>
                  </div>
                )}
                {product.ipiPercentage && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">IPI</span>
                    <p className="text-gray-900">{product.ipiPercentage}%</p>
                  </div>
                )}
              </div>

              {product.technicalSpecifications && (
                <div>
                  <h4 className="font-medium mb-2">Especificações Técnicas</h4>
                  <p className="text-gray-700 whitespace-pre-line">{product.technicalSpecifications}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Supplier Information */}
          {product.supplierId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informações do Fornecedor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Fornecedor</h4>
                  <p className="text-gray-900">{product.supplierName || 'Nome não informado'}</p>
                </div>

                {product.supplierProductCode && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Código do Produto</span>
                    <p className="text-gray-900">{product.supplierProductCode}</p>
                  </div>
                )}

                {product.supplierProductName && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Nome do Produto no Fornecedor</span>
                    <p className="text-gray-900">{product.supplierProductName}</p>
                  </div>
                )}

                {product.supplierDescription && (
                  <div>
                    <h4 className="font-medium mb-2">Descrição do Fornecedor</h4>
                    <p className="text-gray-700 whitespace-pre-line">{product.supplierDescription}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {product.moq && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">MOQ</span>
                      <p className="text-gray-900">{product.moq} unidades</p>
                    </div>
                  )}
                  {product.leadTimeDays && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Lead Time</span>
                      <p className="text-gray-900">{product.leadTimeDays} dias</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {product.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">{product.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Side Information */}
        <div className="space-y-6">
          {/* Package Information */}
          <Card>
            <CardHeader>
              <CardTitle>Embalagem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Total de Embalagens</span>
                <p className="text-gray-900">{product.totalPackages}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Múltiplas Embalagens</span>
                <p className="text-gray-900">{product.hasMultiplePackages ? 'Sim' : 'Não'}</p>
              </div>
              {product.customsDescription && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Descrição Alfandegária</span>
                  <p className="text-gray-900">{product.customsDescription}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Codes and Barcodes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Barcode className="h-5 w-5" />
                Códigos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Código Interno</span>
                <p className="text-gray-900 font-mono">{product.internalCode}</p>
              </div>
              {product.productEan && (
                <div>
                  <span className="text-sm font-medium text-gray-500">EAN</span>
                  <p className="text-gray-900 font-mono">{product.productEan}</p>
                </div>
              )}
              {product.productUpc && (
                <div>
                  <span className="text-sm font-medium text-gray-500">UPC</span>
                  <p className="text-gray-900 font-mono">{product.productUpc}</p>
                </div>
              )}
              {product.internalBarcode && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Código de Barras Interno</span>
                  <p className="text-gray-900 font-mono">{product.internalBarcode}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Criado em</span>
                <p className="text-gray-900">
                  {new Date(product.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Última atualização</span>
                <p className="text-gray-900">
                  {new Date(product.updatedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/minha-area/importacoes/produtos/${productId}/editar`}>
                <Button variant="outline" className="w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Produto
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full text-red-600 hover:text-red-700"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar Produto
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}