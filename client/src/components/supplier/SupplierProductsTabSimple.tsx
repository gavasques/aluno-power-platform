import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Package } from 'lucide-react';

interface SupplierProductsTabSimpleProps {
  supplierId: number;
}

export const SupplierProductsTabSimple: React.FC<SupplierProductsTabSimpleProps> = ({ supplierId }) => {
  console.log('SupplierProductsTabSimple renderizando com supplierId:', supplierId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Produtos do Fornecedor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum produto cadastrado
            </h3>
            <p className="text-gray-500 mb-6">
              Importe o catálogo de produtos do fornecedor ou adicione produtos manualmente.
            </p>
            
            <div className="flex justify-center gap-3">
              <Button className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Importar CSV
              </Button>
              
              <Button variant="outline" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Adicionar Produto
              </Button>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Como funciona?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Importe o catálogo completo via CSV com todos os produtos do fornecedor</li>
              <li>• O sistema tentará vincular automaticamente com produtos existentes</li>
              <li>• Produtos não encontrados ficarão como "pendentes" até serem criados</li>
              <li>• Use esta área para gerenciar preços, lead times e SKUs específicos do fornecedor</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};