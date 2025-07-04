import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Package, DollarSign, TrendingUp, Plus, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Types for pricing system
type ChannelType = 'site' | 'amazon_fbm' | 'amazon_fba_onsite' | 'amazon_dba' | 'amazon_fba' | 'ml_me1' | 'ml_flex' | 'ml_envios' | 'ml_full';

interface ChannelInput {
  price: number;
  costItem: number;
  packCost?: number;
  inboundFreight?: number;
  outboundFreight?: number;
  prepCenter?: number;
  fixedFee?: number;
  commissionPct?: number;
  adsPct?: number;
  otherPct?: number;
  otherValue?: number;
  mlFlexRevenue?: number;
  taxPct?: number;
}

interface ChannelResult {
  price: number;
  totalCosts: number;
  unitCosts: number;
  percentageCosts: number;
  profit: number;
  marginPct: number;
  roiPct: number;
  breakdown: {
    costItem: number;
    packCost: number;
    inboundFreight: number;
    outboundFreight: number;
    prepCenter: number;
    fixedFee: number;
    otherValue: number;
    commission: number;
    ads: number;
    otherPct: number;
    tax: number;
    mlFlexRevenue: number;
  };
}

interface Product {
  id: number;
  name: string;
  sku: string;
  costPrice: number;
  channels?: ProductChannel[];
}

interface ProductChannel {
  id: number;
  channelType: ChannelType;
  price: number;
  marginPct: number;
  isActive: boolean;
}

const CHANNEL_CONFIGS = {
  site: { name: 'Site Próprio', defaultCommission: 0, color: 'bg-blue-500' },
  amazon_fbm: { name: 'Amazon FBM', defaultCommission: 15, color: 'bg-orange-500' },
  amazon_fba_onsite: { name: 'Amazon FBA Onsite', defaultCommission: 15, color: 'bg-orange-600' },
  amazon_dba: { name: 'Amazon DBA', defaultCommission: 15, color: 'bg-orange-700' },
  amazon_fba: { name: 'Amazon FBA', defaultCommission: 15, color: 'bg-orange-800' },
  ml_me1: { name: 'Mercado Livre ME1', defaultCommission: 18, color: 'bg-yellow-500' },
  ml_flex: { name: 'Mercado Livre Flex', defaultCommission: 18, color: 'bg-yellow-600' },
  ml_envios: { name: 'Mercado Livre Envios', defaultCommission: 18, color: 'bg-yellow-700' },
  ml_full: { name: 'Mercado Livre Full', defaultCommission: 18, color: 'bg-yellow-800' }
};

export default function ProductPricing() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [calculatorInputs, setCalculatorInputs] = useState<ChannelInput>({
    price: 0,
    costItem: 0,
    packCost: 0,
    commissionPct: 15
  });
  const [selectedChannel, setSelectedChannel] = useState<ChannelType>('amazon_fbm');
  const [calculationResult, setCalculationResult] = useState<ChannelResult | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products with pricing data
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['/api/products/pricing'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate pricing mutation
  const calculatePricing = useMutation({
    mutationFn: async (data: { channelType: ChannelType } & ChannelInput) => {
      const response = await fetch('/api/products/pricing/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erro no cálculo');
      return response.json();
    },
    onSuccess: (result) => {
      setCalculationResult(result);
      toast({
        title: "Cálculo realizado",
        description: "Precificação calculada com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no cálculo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle calculator form submission
  const handleCalculate = () => {
    if (!calculatorInputs.price || !calculatorInputs.costItem) {
      toast({
        title: "Campos obrigatórios",
        description: "Preço e custo do item são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    calculatePricing.mutate({
      channelType: selectedChannel,
      ...calculatorInputs,
    });
  };

  // Update calculator inputs when channel changes
  useEffect(() => {
    const config = CHANNEL_CONFIGS[selectedChannel];
    setCalculatorInputs(prev => ({
      ...prev,
      commissionPct: config.defaultCommission,
    }));
  }, [selectedChannel]);

  if (loadingProducts) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calculator className="h-8 w-8" />
            Gestão de Precificação
          </h1>
          <p className="text-muted-foreground mt-2">
            Calcule e gerencie preços em múltiplos canais de venda
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <Tabs defaultValue="calculator" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calculator">Calculadora</TabsTrigger>
          <TabsTrigger value="products">Meus Produtos</TabsTrigger>
          <TabsTrigger value="bulk">Análise em Lote</TabsTrigger>
        </TabsList>

        {/* Calculator Tab */}
        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuração do Cálculo
                </CardTitle>
                <CardDescription>
                  Configure os valores para calcular a precificação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Channel Selection */}
                <div className="space-y-2">
                  <Label htmlFor="channel">Canal de Venda</Label>
                  <Select value={selectedChannel} onValueChange={(value: ChannelType) => setSelectedChannel(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o canal" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CHANNEL_CONFIGS).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${config.color}`} />
                            {config.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Basic Costs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço de Venda (R$) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={calculatorInputs.price || ''}
                      onChange={(e) => setCalculatorInputs(prev => ({
                        ...prev,
                        price: parseFloat(e.target.value) || 0
                      }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="costItem">Custo do Item (R$) *</Label>
                    <Input
                      id="costItem"
                      type="number"
                      step="0.01"
                      value={calculatorInputs.costItem || ''}
                      onChange={(e) => setCalculatorInputs(prev => ({
                        ...prev,
                        costItem: parseFloat(e.target.value) || 0
                      }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Additional Costs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="packCost">Custo Embalagem (R$)</Label>
                    <Input
                      id="packCost"
                      type="number"
                      step="0.01"
                      value={calculatorInputs.packCost || ''}
                      onChange={(e) => setCalculatorInputs(prev => ({
                        ...prev,
                        packCost: parseFloat(e.target.value) || 0
                      }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commissionPct">Comissão (%)</Label>
                    <Input
                      id="commissionPct"
                      type="number"
                      step="0.1"
                      value={calculatorInputs.commissionPct || ''}
                      onChange={(e) => setCalculatorInputs(prev => ({
                        ...prev,
                        commissionPct: parseFloat(e.target.value) || 0
                      }))}
                      placeholder="15.0"
                    />
                  </div>
                </div>

                {/* Channel-specific fields would be rendered conditionally here */}
                
                <Button 
                  onClick={handleCalculate} 
                  className="w-full"
                  disabled={calculatePricing.isPending}
                >
                  {calculatePricing.isPending ? 'Calculando...' : 'Calcular Precificação'}
                </Button>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Resultado da Precificação
                </CardTitle>
                <CardDescription>
                  Análise detalhada da margem de lucro
                </CardDescription>
              </CardHeader>
              <CardContent>
                {calculationResult ? (
                  <div className="space-y-4">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">
                          R$ {calculationResult.profit.toFixed(2)}
                        </div>
                        <div className="text-sm text-green-600">Lucro</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">
                          {calculationResult.marginPct.toFixed(1)}%
                        </div>
                        <div className="text-sm text-blue-600">Margem</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-700">
                          R$ {calculationResult.totalCosts.toFixed(2)}
                        </div>
                        <div className="text-sm text-orange-600">Custos Totais</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-700">
                          {calculationResult.roiPct.toFixed(1)}%
                        </div>
                        <div className="text-sm text-purple-600">ROI</div>
                      </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Detalhamento dos Custos:</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Item:</span>
                          <span>R$ {calculationResult.breakdown.costItem.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Embalagem:</span>
                          <span>R$ {calculationResult.breakdown.packCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Comissão:</span>
                          <span>R$ {calculationResult.breakdown.commission.toFixed(2)}</span>
                        </div>
                        {calculationResult.breakdown.ads > 0 && (
                          <div className="flex justify-between">
                            <span>Anúncios:</span>
                            <span>R$ {calculationResult.breakdown.ads.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Configure os valores e clique em "Calcular" para ver os resultados</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products?.map((product: Product) => (
              <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="h-5 w-5" />
                    {product.name}
                  </CardTitle>
                  <CardDescription>
                    SKU: {product.sku} • Custo: R$ {product.costPrice?.toFixed(2)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Canais configurados:</span>
                      <Badge variant="secondary">
                        {product.channels?.length || 0}
                      </Badge>
                    </div>
                    {product.channels?.map((channel: ProductChannel) => (
                      <div key={channel.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${CHANNEL_CONFIGS[channel.channelType]?.color}`} />
                          <span>{CHANNEL_CONFIGS[channel.channelType]?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>R$ {channel.price?.toFixed(2)}</span>
                          <Badge variant={channel.marginPct > 20 ? "default" : "secondary"}>
                            {channel.marginPct?.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Bulk Analysis Tab */}
        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise Comparativa de Canais</CardTitle>
              <CardDescription>
                Compare a performance de um produto em diferentes canais de venda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Funcionalidade em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}