import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";
import { calculateChannelResults, formatCurrency, formatPercentage } from "@/utils/productCalculations";
import { channelNames } from "@/config/channels";

interface ProductMetricsProps {
  product: Product;
}

export const ProductMetrics = ({ product }: ProductMetricsProps) => {
  const enabledChannels = Object.entries(product.channels).filter(([_, channel]) => channel?.enabled);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Performance por Canal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {enabledChannels.map(([channelKey, channel]) => {
              if (!channel) return null;
              
              const metrics = calculateChannelResults(product, channelKey, channel);
              const isProfit = metrics.profit > 0;
              const isGoodMargin = metrics.margin > 20;
              const isGoodROI = metrics.roi > 30;

              return (
                <div key={channelKey} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      {channelNames[channelKey as keyof typeof channelNames]}
                    </h3>
                    <Badge variant={isProfit ? 'default' : 'destructive'}>
                      {isProfit ? 'Lucrativo' : 'Prejuízo'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Lucro */}
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Lucro Bruto</p>
                      <p className={`text-2xl font-bold ${
                        isProfit ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(metrics.profit)}
                      </p>
                    </div>

                    {/* Margem */}
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Margem</p>
                      <p className={`text-2xl font-bold ${
                        isGoodMargin ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {formatPercentage(metrics.margin)}
                      </p>
                    </div>

                    {/* ROI */}
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">ROI</p>
                      <p className={`text-2xl font-bold ${
                        isGoodROI ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {formatPercentage(metrics.roi)}
                      </p>
                    </div>
                  </div>

                  {/* Detalhes dos Custos */}
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium mb-2">Receita</p>
                      <p>Preço de Venda: {formatCurrency(channel.salePrice)}</p>
                    </div>
                    <div>
                      <p className="font-medium mb-2">Custos Principais</p>
                      <p>Item: {formatCurrency(product.costItem)}</p>
                      <p>Embalagem: {formatCurrency(product.packCost)}</p>
                      <p>Comissão: {formatCurrency(channel.salePrice * (channel.commissionPct / 100))}</p>
                      {channel.adsPct > 0 && (
                        <p>Ads: {formatCurrency(channel.salePrice * (channel.adsPct / 100))}</p>
                      )}
                      {(channel as any).outboundFreight && (
                        <p>Frete: {formatCurrency((channel as any).outboundFreight)}</p>
                      )}
                      {(channel as any).inboundFreight && (
                        <p>Frete Inbound: {formatCurrency((channel as any).inboundFreight)}</p>
                      )}
                      {(channel as any).prepCenter && (
                        <p>Prep Center: {formatCurrency((channel as any).prepCenter)}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Comparativo entre Canais */}
      <Card>
        <CardHeader>
          <CardTitle>Comparativo de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Canal</th>
                  <th className="text-right p-2">Preço</th>
                  <th className="text-right p-2">Lucro</th>
                  <th className="text-right p-2">Margem</th>
                  <th className="text-right p-2">ROI</th>
                </tr>
              </thead>
              <tbody>
                {enabledChannels.map(([channelKey, channel]) => {
                  if (!channel) return null;
                  
                  const metrics = calculateChannelResults(product, channelKey, channel);
                  
                  return (
                    <tr key={channelKey} className="border-b">
                      <td className="p-2 font-medium">
                        {channelNames[channelKey as keyof typeof channelNames]}
                      </td>
                      <td className="p-2 text-right">{formatCurrency(channel.salePrice)}</td>
                      <td className={`p-2 text-right font-medium ${
                        metrics.profit > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(metrics.profit)}
                      </td>
                      <td className="p-2 text-right">{formatPercentage(metrics.margin)}</td>
                      <td className="p-2 text-right">{formatPercentage(metrics.roi)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
