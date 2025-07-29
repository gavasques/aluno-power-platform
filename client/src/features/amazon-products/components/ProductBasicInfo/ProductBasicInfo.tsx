/**
 * COMPONENTE: ProductBasicInfo
 * Informações básicas do produto Amazon
 * Extraído de AmazonProductDetails.tsx para modularização
 */
import { Badge } from "@/components/ui/badge";
import { Star, Award, Truck, MapPin, ExternalLink } from "lucide-react";
import { ProductBasicInfoProps } from '../../types';

export const ProductBasicInfo = ({ productData }: ProductBasicInfoProps) => {
  const product = productData.data;

  return (
    <div className="space-y-6">
      {/* Product Image and Title */}
      <div className="flex flex-col lg:flex-row gap-6">
        {product.product_photo && (
          <div className="flex-shrink-0">
            <img
              src={product.product_photo}
              alt={product.product_title}
              className="w-full lg:w-64 h-64 object-contain rounded-lg border border-gray-200 bg-white shadow-sm"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div className="flex-1 space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
            {product.product_title}
          </h2>
          
          {/* Badges Row */}
          <div className="flex flex-wrap gap-2">
            {product.is_best_seller && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                <Award className="h-3 w-3 mr-1" />
                Best Seller
              </Badge>
            )}
            {product.is_amazon_choice && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                <Star className="h-3 w-3 mr-1" />
                Amazon's Choice
              </Badge>
            )}
            {product.is_prime && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                <Truck className="h-3 w-3 mr-1" />
                Prime
              </Badge>
            )}
            {product.climate_pledge_friendly && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                Climate Pledge Friendly
              </Badge>
            )}
          </div>

          {/* Basic Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <span className="text-sm font-medium text-gray-600">ASIN:</span>
              <div className="text-gray-900 font-mono">{product.asin}</div>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-600">País:</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-gray-500" />
                <span className="text-gray-900">{product.country}</span>
              </div>
            </div>
            
            {product.product_star_rating && (
              <div>
                <span className="text-sm font-medium text-gray-600">Avaliação:</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-gray-900 font-medium">{product.product_star_rating}</span>
                  <span className="text-gray-500 text-sm">
                    ({product.product_num_ratings?.toLocaleString()} avaliações)
                  </span>
                </div>
              </div>
            )}
            
            {product.product_availability && (
              <div>
                <span className="text-sm font-medium text-gray-600">Disponibilidade:</span>
                <div className="text-gray-900">{product.product_availability}</div>
              </div>
            )}
            
            {product.product_num_offers > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-600">Ofertas:</span>
                <div className="text-gray-900">{product.product_num_offers} ofertas</div>
              </div>
            )}
            
            {product.sales_volume && (
              <div>
                <span className="text-sm font-medium text-gray-600">Volume de Vendas:</span>
                <div className="text-gray-900">{product.sales_volume}</div>
              </div>
            )}
          </div>

          {/* Product URL */}
          {product.product_url && (
            <div className="pt-4">
              <a
                href={product.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium underline"
              >
                <ExternalLink className="h-4 w-4" />
                Ver produto na Amazon
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};