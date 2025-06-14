
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product, ProductChannels } from "@/types/product";
import { ChannelForm } from "./ChannelForm";
import { toast } from "@/hooks/use-toast";

const defaultChannels: ProductChannels = {
    sitePropio: { enabled: false, commissionPct: 0, fixedFee: 0, otherPct: 0, otherValue: 0, adsPct: 0, salePrice: 0, gatewayPct: 0 },
    amazonFBM: { enabled: false, commissionPct: 15, fixedFee: 0, otherPct: 0, otherValue: 0, adsPct: 0, outboundFreight: 0, salePrice: 0 },
    amazonFBAOnSite: { enabled: false, commissionPct: 15, fixedFee: 0, otherPct: 0, otherValue: 0, adsPct: 0, outboundFreight: 0, salePrice: 0 },
    amazonDBA: { enabled: false, commissionPct: 15, fixedFee: 0, otherPct: 0, otherValue: 0, adsPct: 0, outboundFreight: 0, salePrice: 0 },
    amazonFBA: { enabled: false, commissionPct: 15, fixedFee: 0, otherPct: 0, otherValue: 0, adsPct: 0, inboundFreight: 0, prepCenter: 0, salePrice: 0 },
    mlME1: { enabled: false, commissionPct: 14, fixedFee: 0, otherPct: 0, otherValue: 0, adsPct: 0, salePrice: 0 },
    mlFlex: { enabled: false, commissionPct: 14, fixedFee: 0, otherPct: 0, otherValue: 0, adsPct: 0, outboundFreight: 0, flexRevenue: 0, salePrice: 0 },
    mlEnvios: { enabled: false, commissionPct: 14, fixedFee: 0, otherPct: 0, otherValue: 0, adsPct: 0, outboundFreight: 0, salePrice: 0 },
    mlFull: { enabled: false, commissionPct: 14, fixedFee: 0, otherPct: 0, otherValue: 0, adsPct: 0, inboundFreight: 0, prepCenter: 0, salePrice: 0 }
};

const getInitialChannelsState = (productChannels: ProductChannels): ProductChannels => {
  const initialState: Partial<ProductChannels> = {};
  for (const key in defaultChannels) {
    const channelKey = key as keyof ProductChannels;
    const defaultChannelData = defaultChannels[channelKey] || {};
    const productChannelData = productChannels[channelKey] || {};
    initialState[channelKey] = {
      ...defaultChannelData,
      ...productChannelData,
    };
  }
  return initialState as ProductChannels;
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
