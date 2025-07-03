import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/types/product";

interface EditChannelsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}

export const EditChannelsModal = ({ 
  product, 
  isOpen, 
  onClose, 
  onSave 
}: EditChannelsModalProps) => {
  if (!product) return null;

  const handleEdit = () => {
    // Redirecionar para página de edição
    window.location.href = `/minha-area/produtos/${product.id}/editar`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Editar Canais de Venda
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Configure os canais de venda para o produto "{product.name}".
          </p>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleEdit}>
              Editar Produto
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};