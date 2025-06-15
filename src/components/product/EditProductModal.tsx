import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product } from "@/types/product";
import { BasicProductForm } from "./BasicProductForm";
import { ChannelForm } from "./ChannelForm";
import { ProductDescriptionsModal } from "./ProductDescriptionsModal";
import { channelNames } from "@/config/channels";
import { useEditProductForm } from "@/hooks/useEditProductForm";

interface EditProductModalProps {
  product: Product;
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
  const [isDescriptionsModalOpen, setIsDescriptionsModalOpen] = useState(false);
  
  const {
    editedProduct,
    handleInputChange,
    handleChannelToggle,
    handleChannelInputChange,
    handlePhotoUpload,
    handleDescriptionsChange,
    handleSave,
  } = useEditProductForm({ product, onSave });

  const productData = {
    name: editedProduct.name,
    photo: editedProduct.photo || "",
    sku: editedProduct.sku || "",
    internalCode: editedProduct.internalCode || "",
    ean: editedProduct.ean || "",
    dimensions: editedProduct.dimensions,
    weight: editedProduct.weight,
    brand: editedProduct.brand,
    category: editedProduct.category,
    supplierId: editedProduct.supplierId,
    ncm: editedProduct.ncm || "",
    costItem: editedProduct.costItem,
    packCost: editedProduct.packCost,
    taxPercent: editedProduct.taxPercent,
    observations: editedProduct.observations || ""
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basico" className="space-y-6">
            <TabsList>
              <TabsTrigger value="basico">Dados Básicos</TabsTrigger>
              <TabsTrigger value="canais">Canais de Venda</TabsTrigger>
            </TabsList>

            <TabsContent value="basico">
              <div className="space-y-6">
                <BasicProductForm
                  productData={productData}
                  onInputChange={handleInputChange}
                  onPhotoUpload={handlePhotoUpload}
                  mockSuppliers={mockSuppliers}
                  mockCategories={mockCategories}
                  onOpenDescriptions={() => setIsDescriptionsModalOpen(true)}
                />
              </div>
            </TabsContent>

            <TabsContent value="canais">
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {Object.keys(channelNames).map((channelKey) => {
                    const key = channelKey as keyof typeof channelNames;
                    const channelData = editedProduct.channels[key];
                    if (!channelData) return null;
                    
                    return (
                      <ChannelForm
                        key={key}
                        channelType={key}
                        channelData={channelData}
                        title={channelNames[key]}
                        onChannelToggle={handleChannelToggle}
                        onChannelInputChange={handleChannelInputChange}
                      />
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>

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
        descriptions={editedProduct.descriptions || {}}
        onSave={handleDescriptionsChange}
      />
    </>
  );
};
