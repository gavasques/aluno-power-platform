
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Edit, Info } from "lucide-react";
import { Product, BaseChannel, ProductChannels } from "@/types/product";
import { calculateChannelResults, formatCurrency, formatPercentage } from "@/utils/productCalculations";
import { ProductCodeDisplay } from "./ProductCodeDisplay";

interface ChannelDetailsProps {
  product: Product;
  channelKey: keyof ProductChannels;
  channelName: string;
  channel: BaseChannel;
  onEditChannel: () => void;
}

export const ChannelDetails = ({ 
  product, 
  channelKey, 
  channelName, 
  channel, 
  onEditChannel 
}: ChannelDetailsProps) => {
  if (!channel || !channel.enabled) {
    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="min-w-[140px]">
            <h4 className="font-medium text-gray-600">{channelName}</h4>
            <ProductCodeDisplay placeholder="Canal inativo" />
          </div>
          <Badge variant="secondary">Inativo</Badge>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onEditChannel}
          className="h-8 px-3"
        >
          <Edit className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  const results = calculateChannelResults(product, channelKey, channel);
  
  const getCostDetails = () => {
    const details = [];
    
    // Custos base
    details.push({ label: "Custo do Item", value: product.costItem });
    details.push({ label: "Custo de Embalagem", value: product.packCost });
    
    // Custos percentuais
    if (channel.commissionPct > 0) {
      details.push({ 
        label: "Comissão", 
        value: (channel.commissionPct / 100) * channel.salePrice,
        percentage: channel.commissionPct 
      });
    }
    
    if (channel.adsPct > 0) {
      details.push({ 
        label: "Ads", 
        value: (channel.adsPct / 100) * channel.salePrice,
        percentage: channel.adsPct 
      });
    }
    
    if (product.taxPercent > 0) {
      details.push({ 
        label: "Impostos", 
        value: (product.taxPercent / 100) * channel.salePrice,
        percentage: product.taxPercent 
      });
    }
    
    // Custos específicos por canal
    const channelSpecific = channel as any;
    
    if (channelSpecific.gatewayPct > 0) {
      details.push({ 
        label: "Gateway", 
        value: (channelSpecific.gatewayPct / 100) * channel.salePrice,
        percentage: channelSpecific.gatewayPct 
      });
    }
    
    if (channelSpecific.outboundFreight > 0) {
      details.push({ label: "Frete Outbound", value: channelSpecific.outboundFreight });
    }
    
    if (channelSpecific.inboundFreight > 0) {
      details.push({ label: "Frete Inbound", value: channelSpecific.inboundFreight });
    }
    
    if (channelSpecific.prepCenter > 0) {
      details.push({ label: "Prep Center", value: channelSpecific.prepCenter });
    }
    
    if (channelSpecific.flexRevenue > 0) {
      details.push({ label: "Receita ML Flex", value: -channelSpecific.flexRevenue });
    }
    
    if (channel.fixedFee > 0) {
      details.push({ label: "Taxa Fixa", value: channel.fixedFee });
    }
    
    if (channel.otherPct > 0) {
      details.push({ 
        label: "Outros (%)", 
        value: (channel.otherPct / 100) * channel.salePrice,
        percentage: channel.otherPct 
      });
    }
    
    if (channel.otherValue > 0) {
      details.push({ label: "Outros (R$)", value: channel.otherValue });
    }
    
    return details;
  };

  const costDetails = getCostDetails();
  const totalCosts = costDetails.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center gap-6 flex-1">
        {/* Nome do Canal e Códigos */}
        <div className="flex items-center gap-3 min-w-[140px]">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h4 className="font-medium text-base">{channelName}</h4>
              <Badge variant="default">Ativo</Badge>
            </div>
            <div className="space-y-1">
              <ProductCodeDisplay code={channel.productCode} />
              {/* Mostrar FNSKU para Amazon FBA */}
              {channelKey === 'amazonFBA' && (channel as any).fnsku && (
                <div>
                  <span className="text-xs text-muted-foreground mr-1">FNSKU:</span>
                  <ProductCodeDisplay code={(channel as any).fnsku} />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Métricas */}
        <div className="flex items-center gap-8 flex-1">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Preço</p>
            <p className="font-semibold text-sm">{formatCurrency(channel.salePrice)}</p>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Margem</p>
            <p className={`font-semibold text-sm ${results.margin >= 20 ? 'text-green-600' : results.margin >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
              {formatPercentage(results.margin)}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">ROI</p>
            <p className={`font-semibold text-sm ${results.roi >= 50 ? 'text-green-600' : results.roi >= 25 ? 'text-yellow-600' : 'text-red-600'}`}>
              {formatPercentage(results.roi)}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Lucro</p>
            <p className={`font-semibold text-sm ${results.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(results.profit)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Botões de Ação */}
      <div className="flex items-center gap-2 ml-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Info className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-3">
              <h4 className="font-semibold">Detalhamento de Custos</h4>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Receita</span>
                  <span className="text-sm font-semibold text-green-600">
                    {formatCurrency(channel.salePrice)}
                  </span>
                </div>
                
                <div className="border-t pt-2">
                  <p className="text-sm font-medium mb-2">Custos:</p>
                  {costDetails.map((cost, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        {cost.label}
                        {cost.percentage && ` (${cost.percentage}%)`}
                      </span>
                      <span className={cost.value < 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(Math.abs(cost.value))}
                        {cost.value < 0 && ' (receita)'}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total de Custos</span>
                    <span className="text-red-600">{formatCurrency(totalCosts)}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold">
                    <span>Lucro Líquido</span>
                    <span className={results.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(results.profit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Button
          size="sm"
          variant="outline"
          onClick={onEditChannel}
          className="h-8 px-3"
        >
          <Edit className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
