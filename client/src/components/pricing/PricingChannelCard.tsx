import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  SalesChannel, 
  PricingCalculation,
  ChannelType 
} from "@/types/pricing";
import { 
  formatBRL, 
  formatPercent, 
  getPricingHealth,
  comparePrices 
} from "@/utils/pricingCalculations";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2,
  Calculator,
  DollarSign
} from "lucide-react";

interface PricingChannelCardProps {
  channel: SalesChannel;
  calculation?: PricingCalculation;
  onChannelUpdate: (channel: SalesChannel) => void;
}

// Channel display names mapping
const channelDisplayNames: Record<ChannelType, string> = {
  [ChannelType.SITE_PROPRIO]: "Site Próprio",
  [ChannelType.AMAZON_FBM]: "Amazon FBM",
  [ChannelType.AMAZON_FBA_ON_SITE]: "Amazon FBA On Site",
  [ChannelType.AMAZON_DBA]: "Amazon DBA",
  [ChannelType.AMAZON_FBA]: "Amazon FBA",
  [ChannelType.ML_ME1]: "Mercado Livre ME1",
  [ChannelType.ML_FLEX]: "Mercado Livre Flex",
  [ChannelType.ML_ENVIOS]: "Mercado Livre Envios",
  [ChannelType.ML_FULL]: "Mercado Livre FULL",
  [ChannelType.SHOPEE]: "Shopee",
  [ChannelType.MARKETPLACE_OTHER]: "Outro Marketplace"
};

export default function PricingChannelCard({
  channel,
  calculation,
  onChannelUpdate
}: PricingChannelCardProps) {
  const health = calculation ? getPricingHealth(calculation.profitMarginPercent) : null;
  
  const handleFieldUpdate = (field: string, value: any) => {
    const updatedChannel = { ...channel };
    
    if (field.includes('.')) {
      // Handle nested fields like fees.commissionPercent
      const [parent, child] = field.split('.');
      (updatedChannel as any)[parent][child] = value;
    } else {
      (updatedChannel as any)[field] = value;
    }
    
    onChannelUpdate(updatedChannel);
  };

  const competitorComparison = channel.competitorPrice && channel.sellingPrice
    ? comparePrices(channel.sellingPrice, channel.competitorPrice)
    : null;

  return (
    <Card className={channel.enabled ? "border-primary/20" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {channelDisplayNames[channel.type]}
            {health && (
              <span className={health.color}>{health.icon}</span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {calculation && (
              <Badge variant={calculation.isProfitable ? "default" : "destructive"}>
                {calculation.isProfitable ? "Lucrativo" : "Prejuízo"}
              </Badge>
            )}
            <Switch
              checked={channel.enabled}
              onCheckedChange={(checked) => handleFieldUpdate('enabled', checked)}
            />
          </div>
        </div>
      </CardHeader>
      
      {channel.enabled && (
        <CardContent className="space-y-4">
          {/* Pricing Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${channel.id}-price`}>Preço de Venda</Label>
              <div className="relative">
                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id={`${channel.id}-price`}
                  type="number"
                  step="0.01"
                  value={channel.sellingPrice || ''}
                  onChange={(e) => handleFieldUpdate('sellingPrice', parseFloat(e.target.value) || 0)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`${channel.id}-competitor`}>Preço Concorrência</Label>
              <div className="relative">
                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id={`${channel.id}-competitor`}
                  type="number"
                  step="0.01"
                  value={channel.competitorPrice || ''}
                  onChange={(e) => handleFieldUpdate('competitorPrice', parseFloat(e.target.value) || 0)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          {/* Competitor Comparison */}
          {competitorComparison && competitorComparison.status !== 'equal' && (
            <div className={`p-3 rounded-lg ${
              competitorComparison.status === 'higher' ? 'bg-red-50' : 'bg-green-50'
            }`}>
              <div className="flex items-center gap-2 text-sm">
                {competitorComparison.status === 'higher' ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-red-600" />
                    <span className="text-red-700">
                      {formatPercent(Math.abs(competitorComparison.percentDiff))} acima da concorrência
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-green-600" />
                    <span className="text-green-700">
                      {formatPercent(Math.abs(competitorComparison.percentDiff))} abaixo da concorrência
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Fees Section */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Taxas e Custos</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Comissão (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={channel.fees.commissionPercent || ''}
                  onChange={(e) => handleFieldUpdate('fees.commissionPercent', parseFloat(e.target.value) || 0)}
                  className="h-8"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs">Taxa Fixa (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={channel.fees.fixedFee || ''}
                  onChange={(e) => handleFieldUpdate('fees.fixedFee', parseFloat(e.target.value) || 0)}
                  className="h-8"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs">Frete (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={channel.fees.shippingCost || ''}
                  onChange={(e) => handleFieldUpdate('fees.shippingCost', parseFloat(e.target.value) || 0)}
                  className="h-8"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs">Fulfillment (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={channel.fees.fulfillmentFee || ''}
                  onChange={(e) => handleFieldUpdate('fees.fulfillmentFee', parseFloat(e.target.value) || 0)}
                  className="h-8"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs">Publicidade (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={channel.fees.advertisingPercent || ''}
                  onChange={(e) => handleFieldUpdate('fees.advertisingPercent', parseFloat(e.target.value) || 0)}
                  className="h-8"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs">Outros (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={channel.fees.otherFees || ''}
                  onChange={(e) => handleFieldUpdate('fees.otherFees', parseFloat(e.target.value) || 0)}
                  className="h-8"
                />
              </div>
            </div>
          </div>

          {/* Calculation Results */}
          {calculation && (
            <>
              <Separator />
              
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Resultados</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Lucro Líquido:</span>
                      <span className={`font-semibold ${
                        calculation.netProfit > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatBRL(calculation.netProfit)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Margem:</span>
                      <span className={`font-semibold ${health?.color}`}>
                        {formatPercent(calculation.profitMarginPercent)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">ROI:</span>
                      <span className="font-semibold">
                        {formatPercent(calculation.roi)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Custos Canal:</span>
                      <span className="font-semibold">
                        {formatBRL(calculation.totalChannelCosts)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Markup:</span>
                      <span className="font-semibold">
                        {formatPercent(calculation.markupPercent)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {calculation.recommendations && calculation.recommendations.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {calculation.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <AlertTriangle className="h-3 w-3 text-yellow-600 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}


        </CardContent>
      )}
    </Card>
  );
}