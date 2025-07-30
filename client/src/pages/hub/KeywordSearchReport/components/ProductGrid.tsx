import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, AlertCircle } from 'lucide-react';
import { ProductCard } from './ProductCard';
import type { SearchState } from '../types';

interface ProductGridProps {
  state: SearchState;
  formatPrice: (price: string | null | undefined) => string;
  onDownload: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = memo(({ state, formatPrice, onDownload }) => {
  if (state.products.length === 0 && state.errors.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Resultados da Busca</span>
          {state.products.length > 0 && (
            <Button onClick={onDownload}>
              <Download className="w-4 h-4 mr-2" />
              Exportar XLSX ({state.products.length} produtos)
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Produtos */}
        {state.products.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.products.slice(0, 12).map((product) => (
                <ProductCard 
                  key={product.asin} 
                  product={product} 
                  formatPrice={formatPrice}
                />
              ))}
            </div>
            {state.products.length > 12 && (
              <p className="text-center text-sm text-muted-foreground">
                ... e mais {state.products.length - 12} produtos no arquivo XLSX
              </p>
            )}
          </div>
        )}

        {/* Erros */}
        {state.errors.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Erros durante a busca:</p>
                <ul className="text-sm space-y-1">
                  {state.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
});