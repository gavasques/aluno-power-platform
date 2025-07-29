/**
 * COMPONENTE: ProductCard
 * Card individual de produto na comparação
 * Extraído de CompararListings.tsx para modularização
 */
import { ExternalLink, Star, Award, Truck, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProductCardProps } from '../../types';

export const ProductCard = ({ product, index }: ProductCardProps) => {
  const {
    asin,
    product_title,
    product_photo,
    product_price,
    product_original_price,
    product_star_rating,
    product_num_ratings,
    product_availability,
    is_best_seller,
    is_amazon_choice,
    is_prime,
    climate_pledge_friendly,
    product_url,
    category
  } = product;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex gap-2 flex-wrap">
          {is_best_seller && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              <Award className="h-3 w-3 mr-1" />
              Best Seller
            </Badge>
          )}
          {is_amazon_choice && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Amazon Choice
            </Badge>
          )}
          {is_prime && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Truck className="h-3 w-3 mr-1" />
              Prime
            </Badge>
          )}
          {climate_pledge_friendly && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Shield className="h-3 w-3 mr-1" />
              Eco-Friendly
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Product Image */}
        {product_photo && (
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product_photo}
              alt={product_title}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Product Title */}
        <h3 className="font-semibold text-gray-900 line-clamp-3 min-h-[3.6rem]">
          {product_title || 'Título não disponível'}
        </h3>

        {/* ASIN */}
        <div className="text-sm text-gray-500">
          ASIN: <span className="font-mono">{asin}</span>
        </div>

        {/* Category */}
        {category?.name && (
          <div className="text-sm text-gray-500">
            Categoria: {category.name}
          </div>
        )}

        {/* Price */}
        <div className="space-y-1">
          <div className="text-xl font-bold text-gray-900">
            {product_price || 'Preço não disponível'}
          </div>
          {product_original_price && product_original_price !== product_price && (
            <div className="text-sm text-gray-500 line-through">
              {product_original_price}
            </div>
          )}
        </div>

        {/* Rating */}
        {product_star_rating && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="ml-1 font-medium">{product_star_rating}</span>
            </div>
            <span className="text-sm text-gray-500">
              ({product_num_ratings?.toLocaleString() || 0} avaliações)
            </span>
          </div>
        )}

        {/* Availability */}
        <div className="text-sm">
          <span className="font-medium">Disponibilidade: </span>
          <span className={`${
            product_availability?.toLowerCase().includes('disponível') || 
            product_availability?.toLowerCase().includes('in stock')
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {product_availability || 'Não informado'}
          </span>
        </div>

        {/* View on Amazon Button */}
        {product_url && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => window.open(product_url, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver na Amazon
          </Button>
        )}
      </CardContent>
    </Card>
  );
};