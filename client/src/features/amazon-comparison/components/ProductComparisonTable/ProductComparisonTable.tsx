/**
 * COMPONENTE: ProductComparisonTable
 * Tabela comparativa de produtos
 * Extraído de CompararListings.tsx para modularização
 */
import { ExternalLink, Star, Award, Truck, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProductComparisonTableProps } from '../../types';

export const ProductComparisonTable = ({ results }: ProductComparisonTableProps) => {
  if (results.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparação Detalhada</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium text-gray-700 bg-gray-50">Atributo</th>
                {results.map((result, index) => (
                  <th key={result.data.asin} className="text-left p-3 font-medium text-gray-700 bg-gray-50 min-w-[200px]">
                    Produto {index + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* ASIN */}
              <tr className="border-b">
                <td className="p-3 font-medium">ASIN</td>
                {results.map((result) => (
                  <td key={result.data.asin} className="p-3 font-mono text-sm">
                    {result.data.asin}
                  </td>
                ))}
              </tr>

              {/* Title */}
              <tr className="border-b">
                <td className="p-3 font-medium">Título</td>
                {results.map((result) => (
                  <td key={result.data.asin} className="p-3 text-sm">
                    <div className="line-clamp-2">
                      {result.data.product_title || 'N/A'}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Price */}
              <tr className="border-b">
                <td className="p-3 font-medium">Preço</td>
                {results.map((result) => (
                  <td key={result.data.asin} className="p-3">
                    <div className="font-semibold text-lg">
                      {result.data.product_price || 'N/A'}
                    </div>
                    {result.data.product_original_price && 
                     result.data.product_original_price !== result.data.product_price && (
                      <div className="text-sm text-gray-500 line-through">
                        {result.data.product_original_price}
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Rating */}
              <tr className="border-b">
                <td className="p-3 font-medium">Avaliação</td>
                {results.map((result) => (
                  <td key={result.data.asin} className="p-3">
                    {result.data.product_star_rating ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                          <span className="font-medium">{result.data.product_star_rating}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {result.data.product_num_ratings?.toLocaleString() || 0} avaliações
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Availability */}
              <tr className="border-b">
                <td className="p-3 font-medium">Disponibilidade</td>
                {results.map((result) => (
                  <td key={result.data.asin} className="p-3">
                    <span className={`text-sm ${
                      result.data.product_availability?.toLowerCase().includes('disponível') || 
                      result.data.product_availability?.toLowerCase().includes('in stock')
                        ? 'text-green-600 font-medium' 
                        : 'text-red-600 font-medium'
                    }`}>
                      {result.data.product_availability || 'N/A'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Category */}
              <tr className="border-b">
                <td className="p-3 font-medium">Categoria</td>
                {results.map((result) => (
                  <td key={result.data.asin} className="p-3 text-sm">
                    {result.data.category?.name || 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Badges */}
              <tr className="border-b">
                <td className="p-3 font-medium">Badges</td>
                {results.map((result) => (
                  <td key={result.data.asin} className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {result.data.is_best_seller && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          Best Seller
                        </Badge>
                      )}
                      {result.data.is_amazon_choice && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                          Amazon Choice
                        </Badge>
                      )}
                      {result.data.is_prime && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                          <Truck className="h-3 w-3 mr-1" />
                          Prime
                        </Badge>
                      )}
                      {result.data.climate_pledge_friendly && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Eco
                        </Badge>
                      )}
                      {!result.data.is_best_seller && 
                       !result.data.is_amazon_choice && 
                       !result.data.is_prime && 
                       !result.data.climate_pledge_friendly && (
                        <span className="text-gray-500 text-sm">Nenhum</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Actions */}
              <tr>
                <td className="p-3 font-medium">Ações</td>
                {results.map((result) => (
                  <td key={result.data.asin} className="p-3">
                    {result.data.product_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(result.data.product_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Ver na Amazon
                      </Button>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};