
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product, ProductChannels } from "@/types/product";
import { ChannelForm } from "./ChannelForm";
import { toast } from "@/hooks/use-toast";

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
  const [editedChannels, setEditedChannels] = useState<ProductChannels>(product.channels);

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
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChannelForm
              channelType="sitePropio"
              channelData={editedChannels.sitePropio}
              title="Site Próprio"
              onChannelToggle={handleChannelToggle}
              onChannelInputChange={handleChannelInputChange}
            />

            <ChannelForm
              channelType="amazonFBM"
              channelData={editedChannels.amazonFBM}
              title="Amazon FBM"
              onChannelToggle={handleChannelToggle}
              onChannelInputChange={handleChannelInputChange}
            />

            <ChannelForm
              channelType="amazonFBAOnSite"
              channelData={editedChannels.amazonFBAOnSite}
              title="Amazon FBA On Site"
              onChannelToggle={handleChannelToggle}
              onChannelInputChange={handleChannelInputChange}
            />

            <ChannelForm
              channelType="amazonDBA"
              channelData={editedChannels.amazonDBA}
              title="Amazon DBA"
              onChannelToggle={handleChannelToggle}
              onChannelInputChange={handleChannelInputChange}
            />

            <ChannelForm
              channelType="amazonFBA"
              channelData={editedChannels.amazonFBA}
              title="Amazon FBA"
              onChannelToggle={handleChannelToggle}
              onChannelInputChange={handleChannelInputChange}
            />

            <ChannelForm
              channelType="mlME1"
              channelData={editedChannels.mlME1}
              title="ML ME1"
              onChannelToggle={handleChannelToggle}
              onChannelInputChange={handleChannelInputChange}
            />

            <ChannelForm
              channelType="mlFlex"
              channelData={editedChannels.mlFlex}
              title="ML Flex"
              onChannelToggle={handleChannelToggle}
              onChannelInputChange={handleChannelInputChange}
            />

            <ChannelForm
              channelType="mlEnvios"
              channelData={editedChannels.mlEnvios}
              title="ML Envios"
              onChannelToggle={handleChannelToggle}
              onChannelInputChange={handleChannelInputChange}
            />

            <ChannelForm
              channelType="mlFull"
              channelData={editedChannels.mlFull}
              title="ML Full"
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
