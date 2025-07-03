import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { Product } from "@/types/product";

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  mockSuppliers: Array<{ id: string; tradeName: string }>;
  mockCategories: Array<{ id: string; name: string }>;
}

export const EditProductModal = ({ 
  product, 
  isOpen, 
  onClose, 
  onSave, 
  mockSuppliers, 
  mockCategories 
}: EditProductModalProps) => {
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
            <Package className="h-5 w-5" />
            Editar Produto
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Deseja editar o produto "{product.name}"?
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