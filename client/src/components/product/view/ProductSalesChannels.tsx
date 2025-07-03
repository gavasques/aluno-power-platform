import { Product } from "@/types/product";

interface ProductSalesChannelsProps {
  product: Product;
}

export default function ProductSalesChannels({ product }: ProductSalesChannelsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Canais de Venda</h3>
      <div className="p-6 text-center bg-gray-50 rounded-lg">
        <p className="text-muted-foreground">Funcionalidade de canais de venda será implementada em breve.</p>
      </div>
    </div>
  );
}