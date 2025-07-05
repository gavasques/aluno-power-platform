import { UseFormReturn } from "react-hook-form";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  SalesChannel, 
  ChannelType,
  PricingProduct,
  PricingCalculation
} from "@/types/pricing";
import { calculateChannelPricing } from "@/utils/pricingCalculations";
import PricingChannelCard from "@/components/pricing/PricingChannelCard";
import { 
  ShoppingCart,
  Info,
  Calculator,
  RefreshCw
} from "lucide-react";

interface ProductChannelsTabProps {
  form: UseFormReturn<any>;
}

// Default channel configurations
const defaultChannels: Partial<SalesChannel>[] = [
  {
    type: ChannelType.SITE_PROPRIO,
    name: "Site Próprio",
    enabled: false,
    sellingPrice: 0,
    fees: {
      commissionPercent: 5, // Gateway de pagamento
      fixedFee: 0,
      shippingCost: 0,
      advertisingPercent: 0,
    }
  },
  {
    type: ChannelType.AMAZON_FBM,
    name: "Amazon FBM",
    enabled: false,
    sellingPrice: 0,
    fees: {
      commissionPercent: 16.95,
      fixedFee: 1.49,
      shippingCost: 0,
      advertisingPercent: 0,
    }
  },
  {
    type: ChannelType.AMAZON_FBA,
    name: "Amazon FBA",
    enabled: false,
    sellingPrice: 0,
    fees: {
      commissionPercent: 16.95,
      fixedFee: 0,
      shippingCost: 0,
      fulfillmentFee: 0,
      advertisingPercent: 0,
    }
  },
  {
    type: ChannelType.AMAZON_FBA_ON_SITE,
    name: "Amazon FBA On Site",
    enabled: false,
    sellingPrice: 0,
    fees: {
      commissionPercent: 16.95,
      fixedFee: 0,
      shippingCost: 0,
      fulfillmentFee: 0,
      advertisingPercent: 0,
    }
  },
  {
    type: ChannelType.AMAZON_DBA,
    name: "Amazon DBA",
    enabled: false,
    sellingPrice: 0,
    fees: {
      commissionPercent: 16.95,
      fixedFee: 0,
      shippingCost: 0,
      advertisingPercent: 0,
    }
  },
  {
    type: ChannelType.ML_ME1,
    name: "Mercado Livre ME1",
    enabled: false,
    sellingPrice: 0,
    fees: {
      commissionPercent: 13.5,
      fixedFee: 0,
      shippingCost: 0,
      advertisingPercent: 0,
    }
  },
  {
    type: ChannelType.ML_FLEX,
    name: "Mercado Livre Flex",
    enabled: false,
    sellingPrice: 0,
    fees: {
      commissionPercent: 15.5,
      fixedFee: 0,
      shippingCost: 0,
      advertisingPercent: 0,
    }
  },
  {
    type: ChannelType.ML_ENVIOS,
    name: "Mercado Livre Envios",
    enabled: false,
    sellingPrice: 0,
    fees: {
      commissionPercent: 16.5,
      fixedFee: 0,
      shippingCost: 0,
      advertisingPercent: 0,
    }
  },
  {
    type: ChannelType.ML_FULL,
    name: "Mercado Livre FULL",
    enabled: false,
    sellingPrice: 0,
    fees: {
      commissionPercent: 13.5,
      fixedFee: 0,
      shippingCost: 0,
      fulfillmentFee: 0,
      advertisingPercent: 0,
    }
  },
  {
    type: ChannelType.SHOPEE,
    name: "Shopee",
    enabled: false,
    sellingPrice: 0,
    fees: {
      commissionPercent: 12,
      fixedFee: 0,
      shippingCost: 0,
      advertisingPercent: 0,
    }
  }
];

export default function ProductChannelsTab({ form }: ProductChannelsTabProps) {
  const [channels, setChannels] = useState<SalesChannel[]>([]);
  const [calculations, setCalculations] = useState<Record<string, PricingCalculation>>({});

  // Watch form values
  const productCost = form.watch("costs.currentCost") || 0;
  const taxPercent = form.watch("costs.taxPercent") || 0;
  const dimensions = form.watch("dimensions");
  const weight = form.watch("weight");
  const formChannels = form.watch("channels");

  // Initialize channels
  useEffect(() => {
    if (!formChannels || formChannels.length === 0) {
      // Initialize with default channels
      const initialChannels = defaultChannels.map((channel, index) => ({
        ...channel,
        id: `channel-${index}-${channel.type}`,
      })) as SalesChannel[];
      
      setChannels(initialChannels);
      form.setValue("channels", initialChannels);
    } else {
      setChannels(formChannels);
    }
  }, [formChannels, form]);

  // Update form when channels change
  useEffect(() => {
    form.setValue("channels", channels);
  }, [channels, form]);

  const handleChannelUpdate = (updatedChannel: SalesChannel) => {
    const newChannels = channels.map(ch => 
      ch.id === updatedChannel.id ? updatedChannel : ch
    );
    setChannels(newChannels);
  };

  const calculateChannel = (channelId: string) => {
    const channel = channels.find(ch => ch.id === channelId);
    if (!channel || !channel.enabled) return;

    // Create temporary product object for calculation
    const product: PricingProduct = {
      id: "temp",
      name: form.getValues("name") || "Produto",
      categoryId: form.getValues("categoryId") || "1",
      supplierId: form.getValues("supplierId") || "1",
      dimensions: dimensions || { length: 0, width: 0, height: 0 },
      weight: weight || 0,
      calculatedWeight: Math.max(weight || 0, 0), // Will be calculated properly
      costs: {
        currentCost: productCost,
        taxPercent: taxPercent,
        totalCost: productCost * (1 + taxPercent / 100),
        lastUpdated: new Date(),
        history: []
      },
      channels: [channel],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: "user"
    };

    const calculation = calculateChannelPricing(product, channel);
    setCalculations(prev => ({
      ...prev,
      [channelId]: calculation
    }));
  };

  const calculateAllChannels = () => {
    channels.forEach(channel => {
      if (channel.enabled) {
        calculateChannel(channel.id);
      }
    });
  };

  const activeChannelsCount = channels.filter(ch => ch.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Canais de Venda
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={calculateAllChannels}
              disabled={activeChannelsCount === 0}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recalcular Todos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Configure os canais onde o produto será vendido. Ative apenas os canais que você utiliza 
              e configure os preços e taxas específicas de cada um.
              <br />
              <strong className="text-sm">
                {activeChannelsCount} de {channels.length} canais ativos
              </strong>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {channels.map(channel => (
          <PricingChannelCard
            key={channel.id}
            channel={channel}
            calculation={calculations[channel.id]}
            onChannelUpdate={handleChannelUpdate}
            onCalculate={() => calculateChannel(channel.id)}
          />
        ))}
      </div>

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Calculator className="h-5 w-5" />
            Dicas de Precificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-blue-800">
          <div>
            <strong>Comissões dos Marketplaces:</strong>
            <ul className="mt-1 ml-4 list-disc space-y-1">
              <li>Amazon: 16.95% + R$ 1,49 (FBM) ou taxas de fulfillment (FBA)</li>
              <li>Mercado Livre: 13.5% a 16.5% dependendo do programa</li>
              <li>Shopee: 12% + taxas promocionais</li>
            </ul>
          </div>
          
          <div>
            <strong>Custos de Publicidade:</strong>
            <p className="mt-1">
              Reserve entre 10% a 20% do preço de venda para investimento em ads, 
              especialmente em produtos novos ou competitivos.
            </p>
          </div>
          
          <div>
            <strong>Margem Ideal:</strong>
            <p className="mt-1">
              Busque uma margem líquida mínima de 20% para garantir sustentabilidade 
              e capacidade de reinvestimento no negócio.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}