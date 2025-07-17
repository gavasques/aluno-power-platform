import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Store, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ChannelsEditor from '@/components/product/ChannelsEditor';

interface ProductChannelsEditPageProps {}

export default function ProductChannelsEditPage({}: ProductChannelsEditPageProps) {
  const [, setLocation] = useLocation();
  const [showChannelsEditor, setShowChannelsEditor] = useState(true);
  
  // Get product ID from URL
  const productId = window.location.pathname.split('/')[3];

  // Get product data
  const { data: product, isLoading } = useQuery({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });

  const handleBack = () => {
    setLocation('/minha-area/produtos');
  };

  const handleClose = () => {
    setShowChannelsEditor(false);
    setLocation('/minha-area/produtos');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Produto não encontrado</h2>
              <Button onClick={handleBack} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para lista
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Store className="h-7 w-7" />
                Editar Canais de Venda
              </h1>
              <p className="text-muted-foreground mt-1">
                Configure os canais de venda e preços do produto: <span className="font-semibold">{product.name}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Product Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Informações do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {product.photo && (
                <img
                  src={product.photo}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg border"
                />
              )}
              <div>
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-muted-foreground">
                  SKU: {product.sku || 'N/A'} | Categoria: {product.category || 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Custo: R$ {product.costItem || '0,00'} | Impostos: {product.taxPercent || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Channels Editor */}
        {showChannelsEditor && (
          <ChannelsEditor
            productId={productId}
            isOpen={showChannelsEditor}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  );
}