import { Product } from "@/types/product";

interface ProductFinancialSummaryProps {
  product: Product;
}

export default function ProductFinancialSummary({ product }: ProductFinancialSummaryProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Resumo Financeiro</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-muted-foreground">Preço de Custo</p>
          <p className="text-lg font-medium">
            {product.costPrice ? `R$ ${product.costPrice.toFixed(2)}` : 'Não informado'}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-muted-foreground">Preço de Venda</p>
          <p className="text-lg font-medium">
            {product.salePrice ? `R$ ${product.salePrice.toFixed(2)}` : 'Não informado'}
          </p>
        </div>
      </div>
    </div>
  );
}