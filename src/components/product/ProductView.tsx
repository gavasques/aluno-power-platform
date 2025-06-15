
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Product } from "@/types/product";
import { ProductPrimaryInfo } from "./view/ProductPrimaryInfo";
import { ProductFinancialSummary } from "./view/ProductFinancialSummary";
import { ProductTechSpecs } from "./view/ProductTechSpecs";
import { ProductSalesChannels } from "./view/ProductSalesChannels";

interface ProductViewProps {
  product: Product;
  supplierName: string;
  onEditBasicData?: () => void;
  onEditChannels?: () => void;
}

export const ProductView = ({ 
  product, 
  supplierName, 
  onEditBasicData, 
  onEditChannels 
}: ProductViewProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Informações Principais */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Informações do Produto</CardTitle>
            {onEditBasicData && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEditBasicData}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Dados
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ProductPrimaryInfo product={product} supplierName={supplierName} />
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProductFinancialSummary product={product} />
        </CardContent>
      </Card>

      {/* Especificações Técnicas */}
      <Card>
        <CardHeader>
          <CardTitle>Especificações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProductTechSpecs product={product} />
        </CardContent>
      </Card>

      {/* Canais de Venda - Formato Lista */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Canais de Venda</CardTitle>
            {onEditChannels && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEditChannels}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Canais
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ProductSalesChannels product={product} onEditChannels={onEditChannels} />
        </CardContent>
      </Card>
    </div>
  );
};
