import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface State {
  id: number;
  name: string;
  code: string;
}

interface Channel {
  id: number;
  channelType: string;
  serviceType: string;
  displayName: string;
  description: string;
}

interface Product {
  id: number;
  name: string;
  costItem: string;
  packCost: string;
  weight: string;
}

export default function PricingCalculator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [salePrice, setSalePrice] = useState<string>('');
  const [taxPercentage, setTaxPercentage] = useState<string>('');

  // Calculation result state
  const [calculationResult, setCalculationResult] = useState<any>(null);

  // Fetch states
  const { data: states } = useQuery({
    queryKey: ['/api/pricing/states']
  });

  // Fetch channels
  const { data: channels } = useQuery({
    queryKey: ['/api/pricing/channels']
  });

  // Fetch products
  const { data: products } = useQuery({
    queryKey: ['/api/products']
  });

  // Save user settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/pricing/user-settings', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram salvas com sucesso."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pricing/user-settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Erro ao salvar as configurações",
        variant: "destructive"
      });
    }
  });

  // Calculate pricing mutation
  const calculateMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/pricing/calculate', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (result) => {
      setCalculationResult(result);
      toast({
        title: "Cálculo realizado",
        description: "Precificação calculada com sucesso."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no cálculo",
        description: error.message || "Erro ao calcular a precificação",
        variant: "destructive"
      });
    }
  });

  // Handle save settings
  const handleSaveSettings = () => {
    if (!selectedStateId || !taxPercentage) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um estado e informe o percentual de impostos",
        variant: "destructive"
      });
      return;
    }

    saveSettingsMutation.mutate({
      stateId: selectedStateId,
      taxPercentage: parseFloat(taxPercentage)
    });
  };

  // Handle calculate pricing
  const handleCalculate = () => {
    if (!selectedProductId || !selectedChannelId || !salePrice) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um produto, canal e informe o preço de venda",
        variant: "destructive"
      });
      return;
    }

    const calculationInput = {
      productId: selectedProductId,
      channelId: selectedChannelId,
      salePrice: parseFloat(salePrice)
    };

    calculateMutation.mutate(calculationInput);
  };

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Simulador de Preços</h1>
          <p className="text-muted-foreground">
            Sistema de cálculo de precificação hierárquica
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações do Usuário</CardTitle>
            <CardDescription>
              Configure suas informações básicas para os cálculos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Select
                value={selectedStateId?.toString() || ""}
                onValueChange={(value) => setSelectedStateId(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione seu estado" />
                </SelectTrigger>
                <SelectContent>
                  {states?.map((state: State) => (
                    <SelectItem key={state.id} value={state.id.toString()}>
                      {state.name} ({state.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax">Percentual de Impostos (%)</Label>
              <Input
                id="tax"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(e.target.value)}
                placeholder="Ex: 8.5"
              />
            </div>

            <Button
              onClick={handleSaveSettings}
              disabled={saveSettingsMutation.isPending}
              className="w-full"
            >
              {saveSettingsMutation.isPending ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </CardContent>
        </Card>

        {/* Calculation Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Calculadora de Preços</CardTitle>
            <CardDescription>
              Calcule a precificação de um produto em um canal específico
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product">Produto</Label>
              <Select
                value={selectedProductId?.toString() || ""}
                onValueChange={(value) => setSelectedProductId(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product: Product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel">Canal de Vendas</Label>
              <Select
                value={selectedChannelId?.toString() || ""}
                onValueChange={(value) => setSelectedChannelId(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um canal" />
                </SelectTrigger>
                <SelectContent>
                  {channels?.map((channel: Channel) => (
                    <SelectItem key={channel.id} value={channel.id.toString()}>
                      {channel.displayName} ({channel.channelType} - {channel.serviceType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preço de Venda (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="Ex: 99.90"
              />
            </div>

            <Button
              onClick={handleCalculate}
              disabled={calculateMutation.isPending}
              className="w-full"
            >
              {calculateMutation.isPending ? "Calculando..." : "Calcular Precificação"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results Panel */}
      {calculationResult && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado do Cálculo</CardTitle>
            <CardDescription>
              Detalhamento completo da precificação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Lucro Líquido</div>
                <div className="text-2xl font-bold text-green-600">
                  R$ {calculationResult.profit?.toFixed(2)}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Margem</div>
                <div className="text-2xl font-bold">
                  {calculationResult.margin?.toFixed(2)}%
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">ROI</div>
                <div className="text-2xl font-bold">
                  {calculationResult.roi?.toFixed(2)}%
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-3">Breakdown de Custos</h4>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Custo Base:</span>
                  <span>R$ {calculationResult.breakdown?.baseCost?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Embalagem:</span>
                  <span>R$ {calculationResult.breakdown?.packagingCost?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete:</span>
                  <span>R$ {calculationResult.breakdown?.freightCost?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Comissão:</span>
                  <span>R$ {calculationResult.breakdown?.commissionCost?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impostos:</span>
                  <span>R$ {calculationResult.breakdown?.taxCost?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total de Custos:</span>
                  <span>R$ {calculationResult.totalCost?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Preço de Venda:</span>
                  <span>R$ {calculationResult.salePrice?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {calculationResult.calculationSteps && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3">Passos do Cálculo</h4>
                <div className="space-y-2 text-sm">
                  {calculationResult.calculationSteps.map((step: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="font-medium">{step.description}:</span>
                      <span>{step.calculation}</span>
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