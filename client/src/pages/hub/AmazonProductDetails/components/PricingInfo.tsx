import React from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import type { ProductData } from '../types';

interface PricingInfoProps {
  productData: ProductData['data'];
}

/**
 * PRICING INFO COMPONENT - FASE 4 REFATORAÇÃO
 * 
 * Componente de apresentação pura para informações de preço
 * Responsabilidade única: Exibir dados de preço e promoções
 */
export function PricingInfo({ productData }: PricingInfoProps) {
  const currentPrice = productData.product_price;
  const originalPrice = productData.product_original_price;
  const hasDiscount = originalPrice && currentPrice && originalPrice !== currentPrice;

  return (
    <div className="space-y-4">
      {/* Current Price */}
      <div className="flex items-center gap-3">
        <DollarSign className="w-6 h-6 text-green-600" />
        <div className="flex flex-col">
          <span className="text-sm text-gray-600">Preço atual</span>
          <span className="text-2xl font-bold text-green-600">
            {currentPrice || 'Preço não disponível'}
          </span>
        </div>
      </div>

      {/* Original Price and Discount */}
      {hasDiscount && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 flex items-center justify-center">
              <span className="w-4 h-0.5 bg-gray-400"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Preço original</span>
              <span className="text-lg text-gray-500 line-through">
                {originalPrice}
              </span>
            </div>
          </div>

          {/* Discount Calculation */}
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-green-800">
                Desconto identificado
              </span>
              <span className="text-xs text-green-700">
                Economia em relação ao preço original
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Price Availability Warning */}
      {!currentPrice && (
        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">!</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-yellow-800">
                Preço não disponível
              </span>
              <span className="text-xs text-yellow-700">
                O produto pode estar indisponível ou com acesso restrito
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Additional Price Info */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Ofertas disponíveis:</span>{' '}
          {productData.product_num_offers || 0}
        </div>
        
        {productData.primary_delivery_time && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Entrega:</span>{' '}
            {productData.primary_delivery_time}
          </div>
        )}
      </div>
    </div>
  );
}