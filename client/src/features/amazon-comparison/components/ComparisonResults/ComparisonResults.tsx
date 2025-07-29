/**
 * COMPONENTE: ComparisonResults
 * Exibe resultados da comparação de produtos
 * Extraído de CompararListings.tsx para modularização
 */
import { Download, ExternalLink, Star, Award, Truck, Shield, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Import components
import { ProductCard } from '../ProductCard/ProductCard';
import { ProductComparisonTable } from '../ProductComparisonTable/ProductComparisonTable';
import { ExportButton } from '../ExportButton/ExportButton';

// Import types
import { ComparisonResultsProps } from '../../types';

export const ComparisonResults = ({
  results,
  loading,
  onExport,
  onClear
}: ComparisonResultsProps) => {

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      
      {/* Results Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Resultados da Comparação
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {results.length} produto{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex gap-2">
              <ExportButton
                results={results}
                loading={loading}
                onExport={onExport}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={onClear}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result, index) => (
          <ProductCard
            key={result.data.asin}
            product={result.data}
            index={index}
          />
        ))}
      </div>

      {/* Comparison Table */}
      <ProductComparisonTable results={results} />

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Comparação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {results.length}
              </div>
              <div className="text-sm text-blue-700">Produtos</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {results.filter(r => r.data.is_best_seller).length}
              </div>
              <div className="text-sm text-green-700">Best Sellers</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {results.filter(r => r.data.is_prime).length}
              </div>
              <div className="text-sm text-purple-700">Prime</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {results.filter(r => r.data.climate_pledge_friendly).length}
              </div>
              <div className="text-sm text-orange-700">Eco-Friendly</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};