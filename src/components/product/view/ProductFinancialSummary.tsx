
import { Product } from "@/types/product";
import { formatCurrency } from "@/utils/productCalculations";

interface ProductFinancialSummaryProps {
  product: Product;
}

export const ProductFinancialSummary = ({ product }: ProductFinancialSummaryProps) => {
  const enabledChannels = Object.entries(product.channels)
    .filter(([_, channel]) => channel?.enabled)
    .length;

  return (
    <>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Custo do Item</label>
        <p className="text-lg font-semibold text-green-600">{formatCurrency(product.costItem)}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Custo de Embalagem</label>
        <p className="text-lg">{formatCurrency(product.packCost)}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Imposto Global</label>
        <p className="text-lg">{product.taxPercent}%</p>
      </div>
      <div className="pt-2 border-t">
        <label className="text-sm font-medium text-muted-foreground">Canais Ativos</label>
        <p className="text-lg font-semibold">{enabledChannels}</p>
      </div>
    </>
  );
};
