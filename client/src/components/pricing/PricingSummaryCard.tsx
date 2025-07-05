import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  PricingProduct,
  PricingCalculation,
  ChannelType
} from "@/types/pricing";
import { 
  formatBRL, 
  formatPercent,
  getPricingHealth 
} from "@/utils/pricingCalculations";
import { 
  TrendingUp, 
  Package, 
  DollarSign,
  BarChart3,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

interface PricingSummaryCardProps {
  product: PricingProduct;
  calculations: PricingCalculation[];
}

export default function PricingSummaryCard({ product, calculations }: PricingSummaryCardProps) {
  // Calculate summary statistics
  const profitableChannels = calculations.filter(calc => calc.isProfitable);
  const averageMargin = calculations.length > 0
    ? calculations.reduce((sum, calc) => sum + calc.profitMarginPercent, 0) / calculations.length
    : 0;
  
  const bestChannel = calculations.reduce((best, current) => 
    current.netProfit > (best?.netProfit || -Infinity) ? current : best
  , calculations[0]);
  
  const worstChannel = calculations.reduce((worst, current) => 
    current.netProfit < (worst?.netProfit || Infinity) ? current : worst
  , calculations[0]);

  const totalPotentialProfit = calculations.reduce((sum, calc) => sum + Math.max(0, calc.netProfit), 0);
  
  const health = getPricingHealth(averageMargin);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Resumo de Precificação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Info */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Package className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-sm text-muted-foreground">
              Custo Total: {formatBRL(product.costs.totalCost)}
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Canais Ativos</span>
              <span className="font-semibold">{product.channels.filter(c => c.enabled).length}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Canais Lucrativos</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold">{profitableChannels.length}</span>
                {profitableChannels.length === calculations.length ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : profitableChannels.length === 0 ? (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                ) : null}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Margem Média</span>
              <span className={`font-semibold ${health.color}`}>
                {formatPercent(averageMargin)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Lucro Potencial</span>
              <span className="font-semibold text-green-600">
                {formatBRL(totalPotentialProfit)}
              </span>
            </div>
          </div>
        </div>

        {/* Best and Worst Channels */}
        {calculations.length > 0 && (
          <div className="space-y-3 pt-2 border-t">
            {bestChannel && bestChannel.netProfit > 0 && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Melhor Canal</p>
                    <p className="text-xs text-muted-foreground">
                      {getChannelDisplayName(bestChannel.channelType)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">
                    {formatBRL(bestChannel.netProfit)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatPercent(bestChannel.profitMarginPercent)} margem
                  </p>
                </div>
              </div>
            )}
            
            {worstChannel && worstChannel.netProfit < 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">Canal com Prejuízo</p>
                    <p className="text-xs text-muted-foreground">
                      {getChannelDisplayName(worstChannel.channelType)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-600">
                    {formatBRL(worstChannel.netProfit)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatPercent(worstChannel.profitMarginPercent)} margem
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Overall Health Status */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status Geral</span>
            <Badge variant={
              health.status === 'excellent' ? 'default' :
              health.status === 'good' ? 'secondary' :
              health.status === 'fair' ? 'outline' :
              'destructive'
            }>
              {health.icon} {getHealthStatusText(health.status)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions
function getChannelDisplayName(channelType: ChannelType): string {
  const names: Record<ChannelType, string> = {
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
  return names[channelType] || channelType;
}

function getHealthStatusText(status: string): string {
  const statusTexts: Record<string, string> = {
    'excellent': 'Excelente',
    'good': 'Bom',
    'fair': 'Regular',
    'poor': 'Ruim',
    'loss': 'Prejuízo'
  };
  return statusTexts[status] || status;
}