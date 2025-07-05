import { UseFormReturn } from "react-hook-form";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  SalesChannel, 
  PricingProduct,
  PricingCalculation,
  ChannelType
} from "@/types/pricing";
import { 
  calculateChannelPricing,
  formatBRL,
  formatPercent,
  getPricingHealth
} from "@/utils/pricingCalculations";
import PricingSummaryCard from "@/components/pricing/PricingSummaryCard";
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Download,
  Calculator,
  DollarSign
} from "lucide-react";

interface ProductResultsTabProps {
  form: UseFormReturn<any>;
  calculatedCubicWeight: number;
}

// Channel display names
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

export default function ProductResultsTab({ form, calculatedCubicWeight }: ProductResultsTabProps) {
  const [calculations, setCalculations] = useState<PricingCalculation[]>([]);
  const [sortBy, setSortBy] = useState<"margin" | "profit" | "roi">("margin");

  // Watch form values
  const productName = form.watch("name") || "Produto";
  const productCost = form.watch("costs.currentCost") || 0;
  const taxPercent = form.watch("costs.taxPercent") || 0;
  const dimensions = form.watch("dimensions");
  const weight = form.watch("weight");
  const channels = form.watch("channels") || [];

  // Create product object for calculations
  const product: PricingProduct = {
    id: "temp",
    name: productName,
    categoryId: form.watch("categoryId") || "1",
    supplierId: form.watch("supplierId") || "1",
    dimensions: dimensions || { length: 0, width: 0, height: 0 },
    weight: weight || 0,
    calculatedWeight: Math.max(weight || 0, calculatedCubicWeight),
    costs: {
      currentCost: productCost,
      taxPercent: taxPercent,
      totalCost: productCost * (1 + taxPercent / 100),
      lastUpdated: new Date(),
      history: []
    },
    channels: channels,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    updatedBy: "user"
  };

  // Calculate all active channels
  useEffect(() => {
    const activeChannels = channels.filter((ch: SalesChannel) => ch.enabled);
    const newCalculations = activeChannels.map((channel: SalesChannel) => 
      calculateChannelPricing(product, channel)
    );
    setCalculations(newCalculations);
  }, [channels, productCost, taxPercent, weight, dimensions]);

  // Sort calculations
  const sortedCalculations = [...calculations].sort((a, b) => {
    switch (sortBy) {
      case "margin":
        return b.profitMarginPercent - a.profitMarginPercent;
      case "profit":
        return b.netProfit - a.netProfit;
      case "roi":
        return b.roi - a.roi;
      default:
        return 0;
    }
  });

  const activeChannelsCount = channels.filter((ch: SalesChannel) => ch.enabled).length;
  const profitableChannelsCount = calculations.filter(calc => calc.isProfitable).length;

  if (activeChannelsCount === 0) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Nenhum canal de venda foi ativado. Vá para a aba "Canais" e configure pelo menos um canal para ver os resultados.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <PricingSummaryCard product={product} calculations={calculations} />

      {/* Results by Channel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Resultados por Canal
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="margin">Margem %</option>
                <option value="profit">Lucro R$</option>
                <option value="roi">ROI %</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedCalculations.map((calc, index) => {
              const health = getPricingHealth(calc.profitMarginPercent);
              const channel = channels.find((ch: SalesChannel) => ch.id === calc.channelId);
              
              return (
                <div
                  key={calc.channelId}
                  className={`p-4 rounded-lg border ${
                    calc.isProfitable ? "bg-white" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {index + 1}º
                      </Badge>
                      <h4 className="font-semibold">
                        {channelDisplayNames[calc.channelType]}
                      </h4>
                      <span className={health.color}>{health.icon}</span>
                    </div>
                    <Badge variant={calc.isProfitable ? "default" : "destructive"}>
                      {calc.isProfitable ? "Lucrativo" : "Prejuízo"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Preço de Venda</p>
                      <p className="font-semibold">{formatBRL(calc.sellingPrice)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Custos Totais</p>
                      <p className="font-semibold">{formatBRL(calc.totalCost + calc.totalChannelCosts)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                      <p className={`font-semibold ${
                        calc.netProfit > 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {formatBRL(calc.netProfit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Margem</p>
                      <p className={`font-semibold ${health.color}`}>
                        {formatPercent(calc.profitMarginPercent)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ROI</p>
                      <p className="font-semibold">
                        {formatPercent(calc.roi)}
                      </p>
                    </div>
                  </div>

                  {calc.recommendations && calc.recommendations.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium mb-2">Recomendações:</p>
                      <div className="space-y-1">
                        {calc.recommendations.map((rec, idx) => (
                          <p key={idx} className="text-sm text-muted-foreground">
                            {rec}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Comparative Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Análise Comparativa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="costs">Breakdown de Custos</TabsTrigger>
              <TabsTrigger value="optimization">Otimização</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Margem Média</p>
                  <p className="text-2xl font-bold">
                    {formatPercent(
                      calculations.reduce((sum, calc) => sum + calc.profitMarginPercent, 0) / calculations.length || 0
                    )}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">ROI Médio</p>
                  <p className="text-2xl font-bold">
                    {formatPercent(
                      calculations.reduce((sum, calc) => sum + calc.roi, 0) / calculations.length || 0
                    )}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Canais Lucrativos</p>
                  <p className="text-2xl font-bold">
                    {profitableChannelsCount} de {activeChannelsCount}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="costs" className="space-y-4">
              <div className="space-y-3">
                {sortedCalculations.map(calc => {
                  const channel = channels.find((ch: SalesChannel) => ch.id === calc.channelId);
                  const totalCosts = calc.totalCost + calc.totalChannelCosts;
                  
                  return (
                    <div key={calc.channelId} className="p-3 border rounded-lg">
                      <h5 className="font-medium mb-2">{channelDisplayNames[calc.channelType]}</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Custo Base:</span>
                          <p className="font-medium">{formatBRL(calc.totalCost)}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatPercent((calc.totalCost / totalCosts) * 100)} do total
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Comissão:</span>
                          <p className="font-medium">{formatBRL(calc.commissionValue)}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatPercent((calc.commissionValue / totalCosts) * 100)} do total
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Frete:</span>
                          <p className="font-medium">{formatBRL(calc.shippingCost)}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatPercent((calc.shippingCost / totalCosts) * 100)} do total
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Outros:</span>
                          <p className="font-medium">
                            {formatBRL(
                              calc.fixedFees + calc.fulfillmentCost + calc.advertisingCost
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatPercent(
                              ((calc.fixedFees + calc.fulfillmentCost + calc.advertisingCost) / totalCosts) * 100
                            )} do total
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="optimization" className="space-y-4">
              <Alert>
                <Calculator className="h-4 w-4" />
                <AlertDescription>
                  <strong>Sugestões de Otimização:</strong>
                  <ul className="mt-2 ml-4 list-disc space-y-1">
                    {calculations.filter(calc => calc.profitMarginPercent < 20).length > 0 && (
                      <li>
                        {calculations.filter(calc => calc.profitMarginPercent < 20).length} canais com margem abaixo de 20%. 
                        Considere aumentar preços ou reduzir custos.
                      </li>
                    )}
                    {calculations.filter(calc => !calc.isProfitable).length > 0 && (
                      <li className="text-red-600">
                        {calculations.filter(calc => !calc.isProfitable).length} canais com prejuízo. 
                        Ajuste urgente necessário ou desative estes canais.
                      </li>
                    )}
                    {calculations.filter(calc => calc.roi < 30).length > 0 && (
                      <li>
                        {calculations.filter(calc => calc.roi < 30).length} canais com ROI baixo (&lt;30%). 
                        Avalie se vale a pena manter estes canais ativos.
                      </li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}