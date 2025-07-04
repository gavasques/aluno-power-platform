import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Product, BaseChannel, ProductChannels } from "@/types/product";
import { calculateChannelResults, formatCurrency, formatPercentage, channelNames } from "@/utils/productCalculations";
import { 
  Calculator, 
  TrendingUp, 
  AlertTriangle, 
  Package,
  DollarSign,
  Percent,
  BarChart3,
  Save,
  ArrowLeft,
  ShoppingCart,
  Target,
  Zap,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

export default function ProductPricing() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTab, setSelectedTab] = useState("costs");

  // Pricing data state
  const [costData, setCostData] = useState({
    costItem: 0,
    packCost: 0,
    taxPercent: 0,
    targetMargin: 30, // Target margin percentage
    competitorPrice: 0 // For competitive analysis
  });

  const [channelPricing, setChannelPricing] = useState<ProductChannels>({} as ProductChannels);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) {
        throw new Error('Failed to load product');
      }
      const productData = await response.json();
      if (productData) {
        setProduct(productData);
        setCostData({
          costItem: Number(productData.costItem) || 0,
          packCost: Number(productData.packCost) || 0,
          taxPercent: Number(productData.taxPercent) || 0,
          targetMargin: 30,
          competitorPrice: 0
        });
        setChannelPricing(productData.channels || {} as ProductChannels);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do produto.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!product || !id) return;

    try {
      setSaving(true);
      await apiRequest(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          costItem: costData.costItem,
          packCost: costData.packCost,
          taxPercent: costData.taxPercent,
          channels: channelPricing
        })
      });

      toast({
        title: "Sucesso",
        description: "Precificação salva com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a precificação.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateChannelPrice = (channelKey: keyof ProductChannels, field: keyof BaseChannel, value: any) => {
    setChannelPricing(prev => ({
      ...prev,
      [channelKey]: {
        ...prev[channelKey],
        [field]: value
      }
    }));
  };

  const calculateSuggestedPrice = (channel: keyof ProductChannels): number => {
    const baseCost = costData.costItem + costData.packCost;
    const taxCost = baseCost * (costData.taxPercent / 100);
    const totalCost = baseCost + taxCost;
    
    // Apply target margin
    const suggestedPrice = totalCost / (1 - costData.targetMargin / 100);
    
    // Round to .90 or .99 for psychological pricing
    const rounded = Math.ceil(suggestedPrice);
    return rounded - 0.10;
  };

  const applyPricingSuggestions = () => {
    const updatedChannels = { ...channelPricing };
    
    Object.keys(channelNames).forEach((channel) => {
      const channelKey = channel as keyof ProductChannels;
      if (updatedChannels[channelKey]?.enabled) {
        updatedChannels[channelKey] = {
          ...updatedChannels[channelKey],
          price: calculateSuggestedPrice(channelKey)
        };
      }
    });
    
    setChannelPricing(updatedChannels);
    
    toast({
      title: "Sugestões aplicadas",
      description: "Os preços foram calculados com base na margem alvo."
    });
  };

  const getTotalCost = () => {
    const baseCost = costData.costItem + costData.packCost;
    const taxCost = baseCost * (costData.taxPercent / 100);
    return baseCost + taxCost;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Produto não encontrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/myarea/produtos")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Precificação do Produto</h1>
            <p className="text-muted-foreground">{product.name}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Salvando..." : "Salvar Precificação"}
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="costs">
            <DollarSign className="h-4 w-4 mr-2" />
            Custos
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Precificação
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <BarChart3 className="h-4 w-4 mr-2" />
            Análise
          </TabsTrigger>
          <TabsTrigger value="strategies">
            <Target className="h-4 w-4 mr-2" />
            Estratégias
          </TabsTrigger>
        </TabsList>

        {/* Costs Tab */}
        <TabsContent value="costs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estrutura de Custos</CardTitle>
              <CardDescription>
                Configure os custos base do produto para cálculo de preços
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="costItem">Custo do Item (R$)</Label>
                  <Input
                    id="costItem"
                    type="number"
                    step="0.01"
                    value={costData.costItem}
                    onChange={(e) => setCostData(prev => ({ ...prev, costItem: parseFloat(e.target.value) || 0 }))}
                  />
                  <p className="text-xs text-muted-foreground">Custo unitário do produto</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="packCost">Custo de Embalagem (R$)</Label>
                  <Input
                    id="packCost"
                    type="number"
                    step="0.01"
                    value={costData.packCost}
                    onChange={(e) => setCostData(prev => ({ ...prev, packCost: parseFloat(e.target.value) || 0 }))}
                  />
                  <p className="text-xs text-muted-foreground">Embalagem, etiquetas, etc.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxPercent">Impostos (%)</Label>
                  <Input
                    id="taxPercent"
                    type="number"
                    step="0.01"
                    value={costData.taxPercent}
                    onChange={(e) => setCostData(prev => ({ ...prev, taxPercent: parseFloat(e.target.value) || 0 }))}
                  />
                  <p className="text-xs text-muted-foreground">Percentual de impostos</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Resumo de Custos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Custo Base</p>
                    <p className="text-xl font-bold">{formatCurrency(costData.costItem + costData.packCost)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Impostos</p>
                    <p className="text-xl font-bold">{formatCurrency((costData.costItem + costData.packCost) * (costData.taxPercent / 100))}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Custo Total</p>
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(getTotalCost())}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Margem Alvo</p>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="1"
                        value={costData.targetMargin}
                        onChange={(e) => setCostData(prev => ({ ...prev, targetMargin: parseFloat(e.target.value) || 0 }))}
                        className="w-20"
                      />
                      <span className="text-xl font-bold">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Precificação por Canal</CardTitle>
                  <CardDescription>
                    Configure os preços e custos específicos de cada canal de venda
                  </CardDescription>
                </div>
                <Button onClick={applyPricingSuggestions} variant="outline">
                  <Zap className="h-4 w-4 mr-2" />
                  Aplicar Sugestões
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(channelNames).map(([channelKey, channelName]) => {
                const channel = channelPricing[channelKey as keyof ProductChannels] || {
                  enabled: false,
                  price: 0,
                  shippingCost: 0,
                  platformFee: 0,
                  paymentFee: 0,
                  advertisingCost: 0,
                  operationalCost: 0,
                  otherCosts: 0
                };
                const results = channel.enabled && channel.price > 0 
                  ? calculateChannelResults(product, channelKey, channel)
                  : null;

                return (
                  <Card key={channelKey} className={channel.enabled ? "border-primary/20" : ""}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{channelName}</CardTitle>
                        <Switch
                          checked={channel.enabled}
                          onCheckedChange={(checked) => updateChannelPrice(channelKey as keyof ProductChannels, 'enabled', checked)}
                        />
                      </div>
                    </CardHeader>
                    {channel.enabled && (
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label>Preço de Venda (R$)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={channel.price || ''}
                              onChange={(e) => updateChannelPrice(channelKey as keyof ProductChannels, 'price', parseFloat(e.target.value) || 0)}
                              className="font-semibold"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Frete (R$)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={channel.shippingCost || ''}
                              onChange={(e) => updateChannelPrice(channelKey as keyof ProductChannels, 'shippingCost', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Taxa Plataforma (R$)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={channel.platformFee || ''}
                              onChange={(e) => updateChannelPrice(channelKey as keyof ProductChannels, 'platformFee', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Taxa Pagamento (R$)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={channel.paymentFee || ''}
                              onChange={(e) => updateChannelPrice(channelKey as keyof ProductChannels, 'paymentFee', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>

                        {results && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Lucro</p>
                                <p className={`font-semibold ${results.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatCurrency(results.profit)}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Margem</p>
                                <p className={`font-semibold ${results.margin > 20 ? 'text-green-600' : results.margin > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {formatPercentage(results.margin)}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">ROI</p>
                                <p className={`font-semibold ${results.roi > 30 ? 'text-green-600' : results.roi > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {formatPercentage(results.roi)}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Preço Sugerido</p>
                                <p className="font-semibold text-blue-600">
                                  {formatCurrency(calculateSuggestedPrice(channelKey as keyof ProductChannels))}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Rentabilidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(channelNames).map(([channelKey, channelName]) => {
                    const channel = channelPricing[channelKey as keyof ProductChannels];
                    if (!channel?.enabled || !channel.price) return null;

                    const results = calculateChannelResults(product, channelKey, channel);
                    const profitStatus = results.profit > 0 ? 'lucro' : 'prejuízo';
                    const marginStatus = results.margin > 20 ? 'ótima' : results.margin > 10 ? 'boa' : results.margin > 0 ? 'baixa' : 'negativa';

                    return (
                      <div key={channelKey} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{channelName}</h4>
                          <Badge variant={results.profit > 0 ? 'default' : 'destructive'}>
                            {profitStatus}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Lucro: </span>
                            <span className={results.profit > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                              {formatCurrency(results.profit)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Margem: </span>
                            <span className="font-semibold">{formatPercentage(results.margin)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">ROI: </span>
                            <span className="font-semibold">{formatPercentage(results.roi)}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Margem {marginStatus} • {results.roi > 30 ? 'Excelente retorno' : results.roi > 15 ? 'Bom retorno' : 'Retorno baixo'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comparativo de Canais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    const enabledChannels = Object.entries(channelPricing)
                      .filter(([_, channel]) => channel?.enabled && channel.price > 0)
                      .map(([key, channel]) => ({
                        key,
                        name: channelNames[key as keyof typeof channelNames],
                        channel,
                        results: calculateChannelResults(product, key, channel)
                      }))
                      .sort((a, b) => b.results.profit - a.results.profit);

                    if (enabledChannels.length === 0) {
                      return <p className="text-center text-muted-foreground">Nenhum canal configurado</p>;
                    }

                    return enabledChannels.map((item, index) => (
                      <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`text-2xl font-bold ${index === 0 ? 'text-yellow-500' : 'text-gray-400'}`}>
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Preço: {formatCurrency(item.channel.price)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${item.results.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(item.results.profit)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatPercentage(item.results.margin)} margem
                          </p>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts and Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Alertas e Recomendações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(channelPricing).map(([channelKey, channel]) => {
                  if (!channel?.enabled || !channel.price) return null;
                  
                  const results = calculateChannelResults(product, channelKey, channel);
                  const alerts = [];

                  if (results.profit < 0) {
                    alerts.push({
                      type: 'error',
                      message: `${channelNames[channelKey as keyof typeof channelNames]}: Operação com prejuízo de ${formatCurrency(results.profit)}`
                    });
                  } else if (results.margin < 10) {
                    alerts.push({
                      type: 'warning',
                      message: `${channelNames[channelKey as keyof typeof channelNames]}: Margem muito baixa (${formatPercentage(results.margin)})`
                    });
                  } else if (results.margin > 40) {
                    alerts.push({
                      type: 'success',
                      message: `${channelNames[channelKey as keyof typeof channelNames]}: Excelente margem de ${formatPercentage(results.margin)}`
                    });
                  }

                  return alerts.map((alert, index) => (
                    <div key={`${channelKey}-${index}`} className={`flex items-start gap-3 p-3 rounded-lg ${
                      alert.type === 'error' ? 'bg-red-50' : 
                      alert.type === 'warning' ? 'bg-yellow-50' : 
                      'bg-green-50'
                    }`}>
                      {alert.type === 'error' ? (
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      ) : alert.type === 'warning' ? (
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      )}
                      <p className="text-sm">{alert.message}</p>
                    </div>
                  ));
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strategies Tab */}
        <TabsContent value="strategies" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estratégias de Precificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Penetração de Mercado
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Ideal para novos produtos. Use margens menores (15-20%) para ganhar market share rapidamente.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setCostData(prev => ({ ...prev, targetMargin: 15 }));
                      applyPricingSuggestions();
                    }}
                  >
                    Aplicar Estratégia
                  </Button>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Premium/Diferenciação
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Para produtos de alta qualidade. Use margens maiores (35-50%) e destaque os diferenciais.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setCostData(prev => ({ ...prev, targetMargin: 40 }));
                      applyPricingSuggestions();
                    }}
                  >
                    Aplicar Estratégia
                  </Button>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Preço Psicológico
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Termine os preços em .90 ou .99 para parecerem mais acessíveis aos consumidores.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const updated = { ...channelPricing };
                      Object.keys(updated).forEach(key => {
                        const channel = updated[key as keyof ProductChannels];
                        if (channel?.enabled && channel.price > 0) {
                          const rounded = Math.floor(channel.price);
                          channel.price = rounded + 0.90;
                        }
                      });
                      setChannelPricing(updated);
                    }}
                  >
                    Ajustar Preços
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análise Competitiva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Preço Médio dos Concorrentes (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={costData.competitorPrice}
                    onChange={(e) => setCostData(prev => ({ ...prev, competitorPrice: parseFloat(e.target.value) || 0 }))}
                    placeholder="Digite o preço médio"
                  />
                </div>

                {costData.competitorPrice > 0 && (
                  <div className="space-y-3 pt-4">
                    {Object.entries(channelPricing).map(([channelKey, channel]) => {
                      if (!channel?.enabled || !channel.price) return null;
                      
                      const diff = channel.price - costData.competitorPrice;
                      const diffPercent = (diff / costData.competitorPrice) * 100;

                      return (
                        <div key={channelKey} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{channelNames[channelKey as keyof typeof channelNames]}</span>
                            <span className={`font-semibold ${diff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {diff > 0 ? '+' : ''}{formatCurrency(diff)} ({diffPercent > 0 ? '+' : ''}{formatPercentage(diffPercent)})
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {Math.abs(diffPercent) < 5 ? 'Preço competitivo' : 
                             diffPercent > 0 ? 'Acima do mercado' : 'Abaixo do mercado'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Simulador de Cenários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Veja como diferentes margens afetam seus preços e lucros
                </p>
                <div className="space-y-3">
                  {[10, 20, 30, 40, 50].map(margin => {
                    const totalCost = getTotalCost();
                    const price = totalCost / (1 - margin / 100);
                    const profit = price - totalCost;

                    return (
                      <div key={margin} className="grid grid-cols-4 gap-4 p-3 border rounded-lg items-center">
                        <div>
                          <p className="text-sm font-medium">Margem {margin}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Preço</p>
                          <p className="font-semibold">{formatCurrency(price)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Lucro</p>
                          <p className="font-semibold text-green-600">{formatCurrency(profit)}</p>
                        </div>
                        <div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setCostData(prev => ({ ...prev, targetMargin: margin }));
                              applyPricingSuggestions();
                            }}
                          >
                            Aplicar
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}