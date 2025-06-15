import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product, ProductDescriptions } from "@/types/product";
import { BasicProductForm } from "./BasicProductForm";
import { ProductSuppliersManager } from "./ProductSuppliersManager";
import { ProductDescriptionsModal } from "./ProductDescriptionsModal";
import { toast } from "@/hooks/use-toast";

interface EditBasicDataModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  mockSuppliers: Array<{ id: string; tradeName: string }>;
  mockCategories: Array<{ id: string; name: string }>;
}

export const EditBasicDataModal = ({ 
  product, 
  isOpen, 
  onClose, 
  onSave, 
  mockSuppliers, 
  mockCategories 
}: EditBasicDataModalProps) => {
  const [isDescriptionsModalOpen, setIsDescriptionsModalOpen] = useState(false);
  
  const [editedData, setEditedData] = useState({
    name: product.name,
    photo: product.photo || "",
    sku: product.sku || "",
    internalCode: product.internalCode || "",
    ean: product.ean || "",
    dimensions: product.dimensions,
    weight: product.weight,
    brand: product.brand,
    category: product.category,
    supplierId: product.supplierId,
    ncm: product.ncm || "",
    costItem: product.costItem,
    packCost: product.packCost,
    taxPercent: product.taxPercent,
    observations: product.observations || ""
  });

  const [productSuppliers, setProductSuppliers] = useState(product.suppliers || []);
  const [productDescriptions, setProductDescriptions] = useState<ProductDescriptions>(product.descriptions || {});

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditedData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
          [child]: value
        }
      }));
    } else {
      setEditedData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A foto deve ter no máximo 3MB.",
          variant: "destructive"
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditedData(prev => ({ 
          ...prev, 
          photo: e.target?.result as string 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSuppliersChange = (suppliers: any[]) => {
    setProductSuppliers(suppliers);
  };

  const handleDescriptionsChange = (descriptions: ProductDescriptions) => {
    setProductDescriptions(descriptions);
  };

  const handleSave = () => {
    // Validação básica
    if (!editedData.name || !editedData.brand || !editedData.supplierId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos nome, marca e fornecedor.",
        variant: "destructive"
      });
      return;
    }

    const updatedProduct = {
      ...product,
      ...editedData,
      suppliers: productSuppliers,
      descriptions: productDescriptions
    };
    
    onSave(updatedProduct);
    toast({
      title: "Dados básicos atualizados",
      description: "Os dados básicos do produto foram atualizados com sucesso."
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Dados Básicos</DialogTitle>
          </DialogHeader>

          <div className="space-y-8">
            <BasicProductForm
              productData={editedData}
              onInputChange={handleInputChange}
              onPhotoUpload={handlePhotoUpload}
              mockSuppliers={mockSuppliers}
              mockCategories={mockCategories}
              onOpenDescriptions={() => setIsDescriptionsModalOpen(true)}
            />

            <div className="border-t pt-6">
              <ProductSuppliersManager
                suppliers={productSuppliers}
                availableSuppliers={mockSuppliers}
                onSuppliersChange={handleSuppliersChange}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t">
            <Button onClick={handleSave} size="lg">
              Salvar Alterações
            </Button>
            <Button variant="outline" onClick={onClose} size="lg">
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ProductDescriptionsModal
        isOpen={isDescriptionsModalOpen}
        onClose={() => setIsDescriptionsModalOpen(false)}
        descriptions={productDescriptions}
        onSave={handleDescriptionsChange}
      />
    </>
  );
};
