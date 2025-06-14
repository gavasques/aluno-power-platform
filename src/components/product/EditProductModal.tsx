
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product, ProductChannels } from "@/types/product";
import { BasicProductForm } from "./BasicProductForm";
import { ChannelForm } from "./ChannelForm";
import { toast } from "@/hooks/use-toast";

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
  const [editedProduct, setEditedProduct] = useState<Product>(product);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditedProduct(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
          [child]: value
        }
      }));
    } else {
      setEditedProduct(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleChannelToggle = (channelType: keyof ProductChannels) => {
    setEditedProduct(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channelType]: {
          ...prev.channels[channelType]!,
          enabled: !prev.channels[channelType]!.enabled
        }
      }
    }));
  };

  const handleChannelInputChange = (channelType: keyof ProductChannels, field: string, value: number) => {
    setEditedProduct(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channelType]: {
          ...prev.channels[channelType]!,
          [field]: value
        }
      }
    }));
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
        setEditedProduct(prev => ({ 
          ...prev, 
          photo: e.target?.result as string 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Validação básica
    if (!editedProduct.name || !editedProduct.brand || !editedProduct.supplierId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos nome, marca e fornecedor.",
        variant: "destructive"
      });
      return;
    }

    onSave(editedProduct);
    toast({
      title: "Produto atualizado",
      description: "As alterações foram salvas com sucesso."
    });
  };

  const productData = {
    name: editedProduct.name,
    photo: editedProduct.photo || "",
    ean: editedProduct.ean || "",
    dimensions: editedProduct.dimensions,
    weight: editedProduct.weight,
    brand: editedProduct.brand,
    category: editedProduct.category,
    supplierId: editedProduct.supplierId,
    ncm: editedProduct.ncm || "",
    costItem: editedProduct.costItem,
    packCost: editedProduct.packCost,
    taxPercent: editedProduct.taxPercent
  };

  return (
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
              />
            </div>
          </TabsContent>

          <TabsContent value="canais">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChannelForm
                  channelType="sitePropio"
                  channelData={editedProduct.channels.sitePropio}
                  title="Site Próprio"
                  onChannelToggle={handleChannelToggle}
                  onChannelInputChange={handleChannelInputChange}
                />

                <ChannelForm
                  channelType="amazonFBM"
                  channelData={editedProduct.channels.amazonFBM}
                  title="Amazon FBM"
                  onChannelToggle={handleChannelToggle}
                  onChannelInputChange={handleChannelInputChange}
                />

                <ChannelForm
                  channelType="amazonFBAOnSite"
                  channelData={editedProduct.channels.amazonFBAOnSite}
                  title="Amazon FBA On Site"
                  onChannelToggle={handleChannelToggle}
                  onChannelInputChange={handleChannelInputChange}
                />

                <ChannelForm
                  channelType="amazonDBA"
                  channelData={editedProduct.channels.amazonDBA}
                  title="Amazon DBA"
                  onChannelToggle={handleChannelToggle}
                  onChannelInputChange={handleChannelInputChange}
                />

                <ChannelForm
                  channelType="amazonFBA"
                  channelData={editedProduct.channels.amazonFBA}
                  title="Amazon FBA"
                  onChannelToggle={handleChannelToggle}
                  onChannelInputChange={handleChannelInputChange}
                />

                <ChannelForm
                  channelType="mlME1"
                  channelData={editedProduct.channels.mlME1}
                  title="ML ME1"
                  onChannelToggle={handleChannelToggle}
                  onChannelInputChange={handleChannelInputChange}
                />

                <ChannelForm
                  channelType="mlFlex"
                  channelData={editedProduct.channels.mlFlex}
                  title="ML Flex"
                  onChannelToggle={handleChannelToggle}
                  onChannelInputChange={handleChannelInputChange}
                />

                <ChannelForm
                  channelType="mlEnvios"
                  channelData={editedProduct.channels.mlEnvios}
                  title="ML Envios"
                  onChannelToggle={handleChannelToggle}
                  onChannelInputChange={handleChannelInputChange}
                />

                <ChannelForm
                  channelType="mlFull"
                  channelData={editedProduct.channels.mlFull}
                  title="ML Full"
                  onChannelToggle={handleChannelToggle}
                  onChannelInputChange={handleChannelInputChange}
                />
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
  );
};
