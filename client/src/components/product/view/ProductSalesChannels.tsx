import { Product } from "@/types/product";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateChannelResults, formatCurrency, formatPercentage, channelNames } from "@/utils/productCalculations";

interface ProductSalesChannelsProps {
  product: Product;
}

export default function ProductSalesChannels({ product }: ProductSalesChannelsProps) {
  const enabledChannels = Object.entries(product.channels || {}).filter(
    ([_, channel]) => channel?.enabled
  );

  if (enabledChannels.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Canais de Venda</h3>
        <div className="p-6 text-center bg-gray-50 rounded-lg">
          <p className="text-muted-foreground">Nenhum canal de venda ativo para este produto.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Canais de Venda Ativos</h3>
      <div className="grid gap-4">
        {enabledChannels.map(([channelKey, channel]) => {
          if (!channel) return null;
          
          const results = calculateChannelResults(product, channelKey, channel);
          const isProfit = results.profit > 0;
          const isGoodMargin = results.margin > 20;
          
          return (
            <Card key={channelKey} className="border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {channelNames[channelKey as keyof typeof channelNames] || channelKey}
                  </CardTitle>
                  <Badge variant={isProfit ? 'default' : 'destructive'}>
                    {isProfit ? 'Lucrativo' : 'Prejuízo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Preço de Venda</p>
                    <p className="font-semibold text-lg">{formatCurrency(channel.price)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Lucro</p>
                    <p className={`font-semibold text-lg ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(results.profit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Margem</p>
                    <p className={`font-semibold text-lg ${isGoodMargin ? 'text-green-600' : results.margin > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {formatPercentage(results.margin)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">ROI</p>
                    <p className={`font-semibold text-lg ${results.roi > 30 ? 'text-green-600' : results.roi > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {formatPercentage(results.roi)}
                    </p>
                  </div>
                </div>
                
                {/* Breakdown de custos */}
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Custos do Canal</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {results.fees.shipping > 0 && (
                      <div className="flex justify-between">
                        <span>Frete:</span>
                        <span>{formatCurrency(results.fees.shipping)}</span>
                      </div>
                    )}
                    {results.fees.platform > 0 && (
                      <div className="flex justify-between">
                        <span>Taxa Plataforma:</span>
                        <span>{formatCurrency(results.fees.platform)}</span>
                      </div>
                    )}
                    {results.fees.payment > 0 && (
                      <div className="flex justify-between">
                        <span>Taxa Pagamento:</span>
                        <span>{formatCurrency(results.fees.payment)}</span>
                      </div>
                    )}
                    {results.fees.advertising > 0 && (
                      <div className="flex justify-between">
                        <span>Publicidade:</span>
                        <span>{formatCurrency(results.fees.advertising)}</span>
                      </div>
                    )}
                    {results.fees.operational > 0 && (
                      <div className="flex justify-between">
                        <span>Operacional:</span>
                        <span>{formatCurrency(results.fees.operational)}</span>
                      </div>
                    )}
                    {results.fees.other > 0 && (
                      <div className="flex justify-between">
                        <span>Outros:</span>
                        <span>{formatCurrency(results.fees.other)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}