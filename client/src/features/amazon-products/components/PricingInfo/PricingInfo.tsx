/**
 * COMPONENTE: PricingInfo
 * Informações de preços do produto Amazon
 * Extraído de AmazonProductDetails.tsx para modularização
 */
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Truck } from "lucide-react";
import { PricingInfoProps } from '../../types';

export const PricingInfo = ({ productData }: PricingInfoProps) => {
  const product = productData.data;

  return (
    <div className="space-y-6">
      {/* Price Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Current Price */}
        {product.product_price && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Preço Atual</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {product.product_price}
            </div>
          </div>
        )}

        {/* Original Price */}
        {product.product_original_price && product.product_original_price !== product.product_price && (
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Preço Original</span>
            </div>
            <div className="text-xl font-semibold text-gray-800 line-through">
              {product.product_original_price}
            </div>
            {product.product_price && (
              <div className="text-sm text-red-600 font-medium mt-1">
                Em promoção!
              </div>
            )}
          </div>
        )}

        {/* Delivery Information */}
        {product.delivery && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Entrega</span>
            </div>
            <div className="text-sm text-blue-900">
              {product.delivery}
            </div>
            {product.primary_delivery_time && (
              <div className="text-sm text-blue-700 mt-1">
                <strong>Tempo:</strong> {product.primary_delivery_time}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Price Badges */}
      <div className="flex flex-wrap gap-2">
        {product.is_prime && (
          <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
            <Truck className="h-3 w-3 mr-1" />
            Frete Grátis Prime
          </Badge>
        )}
        
        {product.product_num_offers > 1 && (
          <Badge variant="outline" className="border-orange-300 text-orange-700 bg-orange-50">
            {product.product_num_offers} ofertas disponíveis
          </Badge>
        )}
      </div>

      {/* Pricing Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">💡 Informações sobre Preços:</h4>
        <ul className="space-y-1 text-sm text-yellow-700">
          <li>• Os preços podem variar conforme disponibilidade</li>
          <li>• Preços exibidos são da região selecionada ({product.country})</li>
          <li>• Frete e taxas podem ser aplicados separadamente</li>
          {product.is_prime && (
            <li>• Membros Prime podem ter descontos adicionais</li>
          )}
        </ul>
      </div>
    </div>
  );
};