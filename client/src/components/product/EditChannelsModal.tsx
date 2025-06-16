
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product, ProductChannels } from "@/types/product";
import { ChannelForm } from "./ChannelForm";
import { toast } from "@/hooks/use-toast";
import { defaultChannels, channelNames } from "@/config/channels";

const getInitialChannelsState = (productChannels: ProductChannels): ProductChannels => {
  const initialState: ProductChannels = {};
  
  for (const key in defaultChannels) {
    const channelKey = key as keyof ProductChannels;
    const defaultChannelData = defaultChannels[channelKey];
    const productChannelData = productChannels[channelKey];
    
    if (defaultChannelData && productChannelData) {
      initialState[channelKey] = {
        ...defaultChannelData,
        ...productChannelData,
      } as any;
    } else if (defaultChannelData) {
      initialState[channelKey] = { ...defaultChannelData } as any;
    }
  }
  
  return initialState;
};

interface EditChannelsModalProps {
  product: Product;
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
  const [editedChannels, setEditedChannels] = useState<ProductChannels>(
    getInitialChannelsState(product.channels)
  );

  useEffect(() => {
    if (product) {
      setEditedChannels(getInitialChannelsState(product.channels));
    }
  }, [product, isOpen]);

  const handleChannelToggle = (channelType: keyof ProductChannels) => {
    setEditedChannels(prev => ({
      ...prev,
      [channelType]: {
        ...prev[channelType]!,
        enabled: !prev[channelType]!.enabled
      }
    }));
  };

  const handleChannelInputChange = (channelType: keyof ProductChannels, field: string, value: number) => {
    setEditedChannels(prev => ({
      ...prev,
      [channelType]: {
        ...prev[channelType]!,
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    const updatedProduct = {
      ...product,
      channels: editedChannels
    };
    
    onSave(updatedProduct);
    toast({
      title: "Canais atualizados",
      description: "Os canais de venda foram atualizados com sucesso."
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Canais de Venda</DialogTitle>
          <DialogDescription>
            Ative ou desative canais de venda e ajuste suas configurações.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChannelForm
              channelType="sitePropio"
              channelData={editedChannels.sitePropio}
              title={channelNames.sitePropio}
              productTaxPercent={product.taxPercent}
              onChannelToggle={handleChannelToggle}
              onChannelInputChange={handleChannelInputChange}
            />

            <ChannelForm
              channelType="amazonFBM"
              channelData={editedChannels.amazonFBM}
              title={channelNames.amazonFBM}
              productTaxPercent={product.taxPercent}
              onChannelToggle={handleChannelToggle}
              onChannelInputChange={handleChannelInputChange}
            />

            <ChannelForm
              channelType="amazonFBAOnSite"
              channelData={editedChannels.amazonFBAOnSite}
              title={channelNames.amazonFBAOnSite}
              productTaxPercent={product.taxPercent}
              onChannelToggle={handleChannelToggle}
              onChannelInputChange={handleChannelInputChange}
            />

            <ChannelForm
              channelType="amazonDBA"
              channelData={editedChannels.amazonDBA}
              title={channelNames.amazonDBA}
              productTaxPercent={product.taxPercent}
              onChannelToggle={handleChannelToggle}
              onChannelInputChange={handleChannelInputChange}
            />

            <ChannelForm
              channelType="amazonFBA"
              channelData={editedChannels.amazonFBA}
              title={channelNames.amazonFBA}
              productTaxPercent={product.taxPercent}
              onChannelToggle={handleChannelToggle}
              onChannelInputChange={handleChannelInputChange}
            />

            <ChannelForm
              channelType="mlME1"
              channelData={editedChannels.mlME1}
              title={channelNames.mlME1}
              productTaxPercent={product.taxPercent}
              onChannelToggle={handleChannelToggle}
              onChannelInputChange={handleChannelInputChange}
            />

            <ChannelForm
              channelType="mlFlex"
              channelData={editedChannels.mlFlex}
              title={channelNames.mlFlex}
              productTaxPercent={product.taxPercent}
              onChannelToggle={handleChannelToggle}
              onChannelInputChange={handleChannelInputChange}
            />

            <ChannelForm
              channelType="mlEnvios"
              channelData={editedChannels.mlEnvios}
              title={channelNames.mlEnvios}
              productTaxPercent={product.taxPercent}
              onChannelToggle={handleChannelToggle}
              onChannelInputChange={handleChannelInputChange}
            />

            <ChannelForm
              channelType="mlFull"
              channelData={editedChannels.mlFull}
              title={channelNames.mlFull}
              productTaxPercent={product.taxPercent}
              onChannelToggle={handleChannelToggle}
              onChannelInputChange={handleChannelInputChange}
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
  );
};
