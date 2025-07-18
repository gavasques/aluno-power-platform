/**
 * Product Channels Manager Page
 * New parallel implementation for channel management
 * Following all 13 optimization principles
 */

import React from 'react';
import { useParams, useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChannelManager } from '@/components/channels/ChannelManager';
import { useQuery } from '@tanstack/react-query';

export const ProductChannelsManager: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  
  const productId = parseInt(id || '0');

  // Get product basic data for cost calculations
  const { data: product, isLoading, error } = useQuery({
    queryKey: [`/api/products/${productId}`, 'basic-data'],
    enabled: !!productId,
  });

  const handleGoBack = () => {
    setLocation('/produtos-pro');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando produto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product?.data) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <p className="text-lg font-semibold">Produto não encontrado</p>
            <p className="text-sm">{(error as any)?.message || 'Erro ao carregar dados do produto'}</p>
          </div>
          <Button onClick={handleGoBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para lista
          </Button>
        </div>
      </div>
    );
  }

  const productData = product.data;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGoBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Canais de Venda
            </h1>
            <p className="text-gray-600">
              {productData.name} • ID: {productData.id}
            </p>
          </div>
        </div>
      </div>

      {/* Channel Manager */}
      <ChannelManager
        productId={productId}
        productCost={parseFloat(productData.costItem || '0')}
        taxPercent={parseFloat(productData.taxPercent || '0')}
        onClose={handleGoBack}
      />
    </div>
  );
};