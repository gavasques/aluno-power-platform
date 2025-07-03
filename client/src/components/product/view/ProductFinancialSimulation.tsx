import { useState } from "react";
import { Product, BaseChannel } from "@/types/product";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, AlertTriangle } from "lucide-react";
import { calculateChannelResults, formatCurrency, formatPercentage, channelNames } from "@/utils/productCalculations";

interface ProductFinancialSimulationProps {
  product: Product;
}

export default function ProductFinancialSimulation({ product }: ProductFinancialSimulationProps) {
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [simulationData, setSimulationData] = useState<BaseChannel>({
    enabled: true,
    price: 0,
    shippingCost: 0,
    platformFee: 0,
    paymentFee: 0,
    advertisingCost: 0,
    operationalCost: 0,
    otherCosts: 0,
  });

  const availableChannels = Object.keys(channelNames);

  const handleSimulation = () => {
    if (!selectedChannel) return;
    
    // Usar dados do canal existente como base ou valores padrão
    const existingChannel = product.channels?.[selectedChannel as keyof typeof product.channels];
    if (existingChannel && simulationData.price === 0) {
      setSimulationData(existingChannel);
    }
  };

  const results = selectedChannel && simulationData.price > 0 
    ? calculateChannelResults(product, selectedChannel, simulationData)
    : null;

  const getChannelRecommendations = () => {
    if (!results) return null;

    const recommendations = [];
    
    if (results.margin < 15) {
      recommendations.push({
        type: "warning",
        message: "Margem baixa. Considere aumentar o preço ou reduzir custos.",
      });
    }
    
    if (results.roi < 20) {
      recommendations.push({
        type: "warning", 
        message: "ROI baixo. Pode não compensar o investimento.",
      });
    }
    
    if (results.profit < 0) {
      recommendations.push({
        type: "error",
        message: "Operação com prejuízo. Revise a estrutura de custos.",
      });
    }
    
    if (results.margin > 30) {
      recommendations.push({
        type: "success",
        message: "Excelente margem! Produto muito competitivo.",
      });
    }

    return recommendations;
  };

  const recommendations = getChannelRecommendations();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            <CardTitle>Simulação Financeira</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção do Canal */}
          <div className="space-y-2">
            <Label>Canal de Venda</Label>
            <Select value={selectedChannel} onValueChange={setSelectedChannel}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um canal para simular" />
              </SelectTrigger>
              <SelectContent>
                {availableChannels.map((channel) => (
                  <SelectItem key={channel} value={channel}>
                    {channelNames[channel as keyof typeof channelNames]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedChannel && (
            <>
              {/* Configurações de Preço e Custos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço de Venda (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={simulationData.price}
                    onChange={(e) => setSimulationData(prev => ({ 
                      ...prev, 
                      price: parseFloat(e.target.value) || 0 
                    }))}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frete (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={simulationData.shippingCost}
                    onChange={(e) => setSimulationData(prev => ({ 
                      ...prev, 
                      shippingCost: parseFloat(e.target.value) || 0 
                    }))}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Taxa da Plataforma (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={simulationData.platformFee}
                    onChange={(e) => setSimulationData(prev => ({ 
                      ...prev, 
                      platformFee: parseFloat(e.target.value) || 0 
                    }))}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Taxa de Pagamento (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={simulationData.paymentFee}
                    onChange={(e) => setSimulationData(prev => ({ 
                      ...prev, 
                      paymentFee: parseFloat(e.target.value) || 0 
                    }))}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Custo de Publicidade (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={simulationData.advertisingCost}
                    onChange={(e) => setSimulationData(prev => ({ 
                      ...prev, 
                      advertisingCost: parseFloat(e.target.value) || 0 
                    }))}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Custo Operacional (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={simulationData.operationalCost}
                    onChange={(e) => setSimulationData(prev => ({ 
                      ...prev, 
                      operationalCost: parseFloat(e.target.value) || 0 
                    }))}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <Button onClick={handleSimulation} className="w-full">
                <TrendingUp className="w-4 h-4 mr-2" />
                Atualizar Simulação
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Resultados da Simulação */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Simulação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Receita</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(results.revenue)}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Custos Totais</p>
                <p className="text-xl font-bold text-gray-600">
                  {formatCurrency(results.totalCosts)}
                </p>
              </div>
              <div className={`text-center p-4 rounded-lg ${results.profit > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className="text-sm text-muted-foreground">Lucro</p>
                <p className={`text-xl font-bold ${results.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(results.profit)}
                </p>
              </div>
              <div className={`text-center p-4 rounded-lg ${results.margin > 20 ? 'bg-green-50' : results.margin > 0 ? 'bg-yellow-50' : 'bg-red-50'}`}>
                <p className="text-sm text-muted-foreground">Margem</p>
                <p className={`text-xl font-bold ${results.margin > 20 ? 'text-green-600' : results.margin > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {formatPercentage(results.margin)}
                </p>
              </div>
            </div>

            {/* ROI */}
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Retorno sobre Investimento (ROI)</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatPercentage(results.roi)}
              </p>
            </div>

            {/* Recomendações */}
            {recommendations && recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Recomendações
                </h4>
                <div className="space-y-2">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Badge 
                        variant={rec.type === 'error' ? 'destructive' : rec.type === 'warning' ? 'secondary' : 'default'}
                        className="text-xs"
                      >
                        {rec.type === 'error' ? 'Crítico' : rec.type === 'warning' ? 'Atenção' : 'Sucesso'}
                      </Badge>
                      <p className="text-sm">{rec.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}