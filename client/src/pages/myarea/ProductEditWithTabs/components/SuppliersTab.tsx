import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import ProductSupplierManagerRefactored from '@/components/product/ProductSupplierManagerRefactored';

interface SuppliersTabProps {
  productId: string | undefined;
}

export const SuppliersTab = memo<SuppliersTabProps>(({ productId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Gestão de Fornecedores
        </CardTitle>
      </CardHeader>
      <CardContent>
        {productId ? (
          <ProductSupplierManagerRefactored productId={parseInt(productId) || 0} />
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Salve o produto primeiro para gerenciar fornecedores
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});