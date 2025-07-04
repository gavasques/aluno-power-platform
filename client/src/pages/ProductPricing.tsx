import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Calculator, DollarSign, TrendingUp, Package } from 'lucide-react';

interface ChannelType {
  type: string;
  name: string;
}

interface Product {
  id: number;
  name: string;
  costItem: string;
  packCost: string;
  weight: string;
  category: string;
  taxPercent: string;
}

interface CalculationResult {
  profit: number;
  margin: number;
  roi: number;
  totalCost: number;
  breakdown: {
    baseCost: number;
    packagingCost: number;
    freightCost: number;
    commissionCost: number;
    adsCost: number;
    prepCenterCost: number;
    otherCosts: number;
    taxCost: number;
    totalCost: number;
  };
}

interface UserSettings {
  state?: string;
  taxPercentage?: string;
  activeChannels?: string[];
}

export default function ProductPricing() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [salePrice, setSalePrice] = useState<string>('');
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [adsPercentage, setAdsPercentage] = useState<string>('0');
  const [prepCenterCost, setPrepCenterCost] = useState<string>('0');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    retry: false
  });

  // Fetch channel types
  const { data: channelTypes = [] } = useQuery<ChannelType[]>({
    queryKey: ['/api/pricing/channel-types'],
    retry: false
  });

  // Fetch user settings
  const { data: userSettings } = useQuery<UserSettings>({
    queryKey: ['/api/user/pricing-settings'],
    retry: false
  });

  // Calculate pricing mutation
  const calculatePricing = useMutation({
    mutationFn: async ({ productId, channelType, salePrice, customCosts }: any) => {
      const response = await fetch(`/api/products/${productId}/channels/${channelType}/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ salePrice, customCosts })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao calcular preços');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setCalculation(data);
      toast({
        title: "Cálculo realizado",
        description: "Preços calculados com sucesso!"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no cálculo",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleCalculate = () => {
    if (!selectedProduct || !selectedChannel || !salePrice) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um produto, canal e defina o preço de venda",
        variant: "destructive"
      });
      return;
    }

    const customCosts = {
      adsPercentage: parseFloat(adsPercentage) || 0,
      prepCenterCost: parseFloat(prepCenterCost) || 0
    };

    calculatePricing.mutate({
      productId: selectedProduct.id,
      channelType: selectedChannel,
      salePrice: parseFloat(salePrice),
      customCosts
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Calculator className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Simulador de Preços</h1>
          <p className="text-gray-600">
            Calcule margens e lucros por canal de venda
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Configuração do Cálculo
            </CardTitle>
            <CardDescription>
              Selecione o produto e canal para calcular os preços
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Product Selection */}
            <div className="space-y-2">
              <Label>Produto</Label>
              <Select
                value={selectedProduct?.id.toString() || ''}
                onValueChange={(value) => {
                  const product = products.find(p => p.id === parseInt(value));
                  setSelectedProduct(product || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Channel Selection */}
            <div className="space-y-2">
              <Label>Canal de Venda</Label>
              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o canal" />
                </SelectTrigger>
                <SelectContent>
                  {channelTypes.map((channel) => (
                    <SelectItem key={channel.type} value={channel.type}>
                      {channel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sale Price */}
            <div className="space-y-2">
              <Label>Preço de Venda (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="0.00"
              />
            </div>

            {/* Custom Costs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ads (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={adsPercentage}
                  onChange={(e) => setAdsPercentage(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Prep Center (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={prepCenterCost}
                  onChange={(e) => setPrepCenterCost(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <Button 
              onClick={handleCalculate}
              disabled={calculatePricing.isPending}
              className="w-full"
            >
              {calculatePricing.isPending ? 'Calculando...' : 'Calcular Preços'}
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <div className="space-y-6">
          {/* Key Metrics */}
          {calculation && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div className="text-sm font-medium text-gray-600">Lucro</div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(calculation.profit)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <div className="text-sm font-medium text-gray-600">Margem</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPercentage(calculation.margin)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-purple-600" />
                    <div className="text-sm font-medium text-gray-600">ROI</div>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatPercentage(calculation.roi)}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Cost Breakdown */}
          {calculation && (
            <Card>
              <CardHeader>
                <CardTitle>Detalhamento de Custos</CardTitle>
                <CardDescription>
                  Breakdown completo dos custos por categoria
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Custo do Item:</span>
                  <span className="font-medium">{formatCurrency(calculation.breakdown.baseCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Embalagem:</span>
                  <span className="font-medium">{formatCurrency(calculation.breakdown.packagingCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete:</span>
                  <span className="font-medium">{formatCurrency(calculation.breakdown.freightCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Comissão:</span>
                  <span className="font-medium">{formatCurrency(calculation.breakdown.commissionCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ads:</span>
                  <span className="font-medium">{formatCurrency(calculation.breakdown.adsCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Prep Center:</span>
                  <span className="font-medium">{formatCurrency(calculation.breakdown.prepCenterCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impostos:</span>
                  <span className="font-medium">{formatCurrency(calculation.breakdown.taxCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Outros Custos:</span>
                  <span className="font-medium">{formatCurrency(calculation.breakdown.otherCosts)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total de Custos:</span>
                  <span>{formatCurrency(calculation.breakdown.totalCost)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Settings Info */}
          {userSettings && (
            <Alert>
              <AlertDescription>
                <strong>Configurações:</strong> Estado: {userSettings.state || 'Não definido'}, 
                Impostos: {userSettings.taxPercentage || '0'}%
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}