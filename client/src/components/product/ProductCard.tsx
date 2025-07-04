import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Eye, Edit, Power, Trash2, DollarSign } from "lucide-react";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onPricing: (id: number) => void;
  onToggleStatus: (id: number) => void;
  onDelete: (id: number) => void;
}

export const ProductCard = ({ 
  product, 
  onView, 
  onEdit, 
  onPricing,
  onToggleStatus, 
  onDelete 
}: ProductCardProps) => {
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header com nome e status */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold text-sm line-clamp-1">
                {product.name || 'Produto sem nome'}
              </h3>
            </div>
            <Badge variant={product.active ? "default" : "secondary"}>
              {product.active ? "Ativo" : "Inativo"}
            </Badge>
          </div>

          {/* Informações básicas */}
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>SKU: {product.sku || 'N/A'}</div>
            <div>Marca: {product.brand || 'N/A'}</div>
            <div>Categoria: {product.category || 'N/A'}</div>
          </div>

          {/* Preço */}
          <div className="text-sm">
            <span className="text-muted-foreground">Custo: </span>
            <span className="font-semibold text-green-600">
              R$ {Number(product.costItem || 0).toFixed(2)}
            </span>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(Number(product.id))}
              className="flex-1"
              title="Visualizar"
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(Number(product.id))}
              className="flex-1"
              title="Editar"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPricing(Number(product.id))}
              className="flex-1"
              title="Precificação"
            >
              <DollarSign className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onToggleStatus(Number(product.id))}
              className="flex-1"
              title={product.active ? "Desativar" : "Ativar"}
            >
              <Power className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(Number(product.id))}
              className="flex-1 text-red-500 hover:text-red-700"
              title="Excluir"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};