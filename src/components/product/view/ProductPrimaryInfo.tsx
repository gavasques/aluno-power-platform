
import { Product } from "@/types/product";

interface ProductPrimaryInfoProps {
  product: Product;
  supplierName: string;
}

export const ProductPrimaryInfo = ({ product, supplierName }: ProductPrimaryInfoProps) => {
  return (
    <div className="flex gap-6">
      {product.photo && (
        <div className="flex-shrink-0">
          <img 
            src={product.photo} 
            alt={product.name}
            className="w-32 h-32 object-cover rounded-lg border"
          />
        </div>
      )}
      
      <div className="flex-1 grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Nome</label>
          <p className="text-lg font-semibold">{product.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Marca</label>
          <p>{product.brand}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Categoria</label>
          <p>{product.category}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Fornecedor</label>
          <p>{supplierName}</p>
        </div>
        {product.ean && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">EAN</label>
            <p className="font-mono">{product.ean}</p>
          </div>
        )}
        {product.ncm && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">NCM</label>
            <p className="font-mono">{product.ncm}</p>
          </div>
        )}
      </div>
    </div>
  );
};
