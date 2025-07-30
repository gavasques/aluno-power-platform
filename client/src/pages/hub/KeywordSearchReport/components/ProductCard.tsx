import React, { memo } from 'react';
import { Star } from 'lucide-react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  formatPrice: (price: string | null | undefined) => string;
}

export const ProductCard: React.FC<ProductCardProps> = memo(({ product, formatPrice }) => {
  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-3">
        <img
          src={product.product_photo}
          alt={product.product_title}
          className="w-16 h-16 object-cover rounded"
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium line-clamp-2 mb-1">
            {product.product_title}
          </h4>
          <div className="text-sm text-muted-foreground mb-2">
            ASIN: {product.asin}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-green-600">
              {formatPrice(product.product_price)}
            </span>
            {product.product_star_rating && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs">{product.product_star_rating}</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {product.is_best_seller && (
              <span className="text-xs bg-red-100 text-red-800 px-1 rounded">
                Best Seller
              </span>
            )}
            {product.is_amazon_choice && (
              <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                Choice
              </span>
            )}
            {product.is_prime && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">
                Prime
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});