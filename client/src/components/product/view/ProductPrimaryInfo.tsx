
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface ProductPrimaryInfoProps {
  product: Product;
  supplierName: string;
  onOpenDescriptions?: () => void;
}

export const ProductPrimaryInfo = ({ product, supplierName, onOpenDescriptions }: ProductPrimaryInfoProps) => {
  // Buscar o fornecedor principal dos suppliers se existir
  const mainSupplier = product.suppliers?.find(supplier => supplier.isMain);
  
  return (
    <div className="space-y-6">
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
            <label className="text-sm font-medium text-muted-foreground">Fornecedor Principal</label>
            <p>{supplierName}</p>
          </div>
          {product.sku && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">SKU</label>
              <p className="font-mono">{product.sku}</p>
            </div>
          )}
          {product.internalCode && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Código Interno</label>
              <p className="font-mono">{product.internalCode}</p>
            </div>
          )}
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

      {/* Observações do Produto */}
      {product.observations && (
        <div className="border-t pt-4">
          <label className="text-sm font-medium text-muted-foreground">Observações do Produto</label>
          <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{product.observations}</p>
        </div>
      )}

      {/* Botão para ver descrições */}
      {onOpenDescriptions && (
        <div className="border-t pt-4">
          <Button
            variant="outline"
            onClick={onOpenDescriptions}
            className="w-full sm:w-auto"
          >
            <FileText className="h-4 w-4 mr-2" />
            Ver Descrições do Produto
          </Button>
        </div>
      )}
    </div>
  );
};
