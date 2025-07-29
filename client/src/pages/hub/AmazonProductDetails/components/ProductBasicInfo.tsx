import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Star, MapPin, Truck } from 'lucide-react';
import type { ProductData } from '../types';

interface ProductBasicInfoProps {
  productData: ProductData['data'];
}

/**
 * PRODUCT BASIC INFO COMPONENT - FASE 4 REFATORAÇÃO
 * 
 * Componente de apresentação pura para informações básicas do produto
 * Responsabilidade única: Exibir dados básicos (título, imagem, badges, preço)
 */
export function ProductBasicInfo({ productData }: ProductBasicInfoProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Product Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {/* Product Image */}
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          <img
            src={productData.product_photo}
            alt={productData.product_title}
            className="w-32 h-32 sm:w-48 sm:h-48 object-contain rounded-lg border border-gray-200 bg-white shadow-sm"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-product.png';
            }}
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight">
            {productData.product_title}
          </h2>

          {/* ASIN and Country */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">ASIN:</span>
            <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
              {productData.asin}
            </code>
            <Separator orientation="vertical" className="h-4" />
            <MapPin className="w-4 h-4" />
            <span>{productData.country}</span>
          </div>

          {/* Product URL */}
          <div className="flex items-center gap-2">
            <a
              href={productData.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Ver no site da Amazon
            </a>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {productData.is_best_seller && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                Best Seller
              </Badge>
            )}
            {productData.is_amazon_choice && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                Amazon's Choice
              </Badge>
            )}
            {productData.is_prime && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                Prime
              </Badge>
            )}
            {productData.climate_pledge_friendly && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                Climate Pledge Friendly
              </Badge>
            )}
            {productData.has_aplus && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                A+ Content
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Product Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        {/* Rating */}
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500 fill-current" />
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">
              {productData.product_star_rating || 'N/A'}
            </span>
            <span className="text-xs text-gray-600">
              {productData.product_num_ratings?.toLocaleString() || '0'} avaliações
            </span>
          </div>
        </div>

        {/* Offers */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-blue-600">#</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">
              {productData.product_num_offers || 0}
            </span>
            <span className="text-xs text-gray-600">ofertas</span>
          </div>
        </div>

        {/* Availability */}
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-green-600" />
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 text-sm">
              {productData.product_availability || 'Indisponível'}
            </span>
            {productData.delivery && (
              <span className="text-xs text-gray-600">
                {productData.delivery}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sales Volume and Byline */}
      {(productData.sales_volume || productData.product_byline) && (
        <div className="space-y-2">
          {productData.sales_volume && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-700">Volume de vendas:</span>
              <span className="text-gray-600">{productData.sales_volume}</span>
            </div>
          )}
          {productData.product_byline && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-700">Por:</span>
              {productData.product_byline_link ? (
                <a
                  href={productData.product_byline_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {productData.product_byline}
                </a>
              ) : (
                <span className="text-gray-600">{productData.product_byline}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}