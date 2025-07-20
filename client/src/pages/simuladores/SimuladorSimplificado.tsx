import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Calculator, Download, FileText, ArrowLeft, Save } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Product {
  id: string;
  description: string;
  quantity: number;
  unitValueUSD: number;
  weightKg: number;
}

interface SimulationConfig {
  exchangeRate: number;
  importTaxRate: number;
  icmsRate: number;
  internationalFreightUSD: number;
  otherExpensesBRL: number;
}

interface SimulationMetadata {
  id?: number;
  nomeSimulacao: string;
  codigoSimulacao?: string;
  nomeFornecedor?: string;
  observacoes?: string;
  dataCreated?: string;
  dataLastModified?: string;
}

interface SimulationResult {
  productCostBRL: number;
  importTax: number;
  icms: number;
  freight: number;
  otherExpenses: number;
  totalCostBRL: number;
  unitCostBRL: number;
}

interface ImportSimulation extends SimulationMetadata {
  configuracoesGerais: SimulationConfig;
  produtos: Product[];
}

const FEATURE_CODE = 'simulators.import_calculator';

const SimuladorSimplificado: React.FC = () => {
  const [, setLocation] = useLocation();
  
  // Hooks
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { checkCredits, showInsufficientCreditsToast, logAIGeneration } = useCreditSystem();
  
  // State
  const [activeSimulation, setActiveSimulation] = useState<ImportSimulation>({
    nomeSimulacao: 'Nova Simulação',
    nomeFornecedor: '',
    observacoes: '',
    configuracoesGerais: {
      exchangeRate: 5.2,
      importTaxRate: 0.6,
      icmsRate: 0.17,
      internationalFreightUSD: 300,
      otherExpensesBRL: 250
    },
    produtos: []
  });
  const [simulationId, setSimulationId] = useState<number | null>(null);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // API queries
  const { data: simulations = [], isLoading } = useQuery({
    queryKey: ['/api/simulations/import'],
    enabled: true,
  });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async (data: ImportSimulation) => {
      if (simulationId) {
        return apiRequest(`/api/simulations/import/${simulationId}`, {
          method: 'PUT',
          body: data
        });
      } else {
        return apiRequest('/api/simulations/import', {
          method: 'POST',
          body: data
        });
      }
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['/api/simulations/import'] });
      setSimulationId(data.id);
      toast({
        title: "Sucesso",
        description: "Simulação salva com sucesso",
      });
      
      // Log de uso
      await logAIGeneration({
        featureCode: FEATURE_CODE,
        provider: 'simulation',
        model: 'calculation',
        prompt: `Nova simulação ${activeSimulation.nomeSimulacao}`,
        response: `Simulação criada com sucesso`,
        inputTokens: 0,
        outputTokens: 0,
        cost: 0
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao salvar simulação",
        variant: "destructive",
      });
    }
  });

  // Add new product
  const addProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitValueUSD: 0,
      weightKg: 0
    };
    setActiveSimulation(prev => ({
      ...prev,
      produtos: [...prev.produtos, newProduct]
    }));
  };

  // Update product
  const updateProduct = (id: string, field: keyof Product, value: string | number) => {
    setActiveSimulation(prev => ({
      ...prev,
      produtos: prev.produtos.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  // Remove product
  const removeProduct = (id: string) => {
    setActiveSimulation(prev => ({
      ...prev,
      produtos: prev.produtos.filter(p => p.id !== id)
    }));
  };

  // Update config
  const updateConfig = (field: keyof SimulationConfig, value: number) => {
    setActiveSimulation(prev => ({
      ...prev,
      configuracoesGerais: {
        ...prev.configuracoesGerais,
        [field]: value
      }
    }));
  };

  // Save simulation
  const handleSave = async () => {
    const hasCredits = await checkCredits(FEATURE_CODE);
    if (!hasCredits) {
      showInsufficientCreditsToast();
      return;
    }

    // Generate simulation code if new
    if (!simulationId) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setActiveSimulation(prev => ({
        ...prev,
        codigoSimulacao: code
      }));
    }

    await saveMutation.mutateAsync(activeSimulation);
  };

  // Calculate simulation
  const calculateSimulation = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const newResults: SimulationResult[] = activeSimulation.produtos.map(product => {
        const config = activeSimulation.configuracoesGerais;
        const productCostBRL = product.quantity * product.unitValueUSD * config.exchangeRate;
        const importTax = productCostBRL * config.importTaxRate;
        const icms = (productCostBRL + importTax) * config.icmsRate;
        const freight = (config.internationalFreightUSD * config.exchangeRate) * (product.weightKg / getTotalWeight());
        const otherExpenses = config.otherExpensesBRL * (product.quantity / getTotalQuantity());
        const totalCostBRL = productCostBRL + importTax + icms + freight + otherExpenses;
        const unitCostBRL = totalCostBRL / product.quantity;

        return {
          productCostBRL,
          importTax,
          icms,
          freight,
          otherExpenses,
          totalCostBRL,
          unitCostBRL
        };
      });

      setResults(newResults);
      setIsCalculating(false);
    }, 500);
  };

  // Helper functions
  const getTotalWeight = () => activeSimulation.produtos.reduce((sum, p) => sum + p.weightKg, 0);
  const getTotalQuantity = () => activeSimulation.produtos.reduce((sum, p) => sum + p.quantity, 0);
  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;
  
  // Generate simulation code
  const generateSimulationCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/simuladores')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Simulador Simplificado</h1>
            <p className="text-muted-foreground mt-2">
              Calcule custos de importação de forma rápida e simples
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Configurações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="exchangeRate">Taxa de Câmbio (USD → BRL)</Label>
                <Input
                  id="exchangeRate"
                  type="number"
                  step="0.01"
                  value={activeSimulation.configuracoesGerais.exchangeRate}
                  onChange={(e) => updateConfig('exchangeRate', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="importTax">Alíquota II (%)</Label>
                <Input
                  id="importTax"
                  type="number"
                  step="0.01"
                  value={activeSimulation.configuracoesGerais.importTaxRate * 100}
                  onChange={(e) => updateConfig('importTaxRate', (parseFloat(e.target.value) || 0) / 100)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="icms">Alíquota ICMS (%)</Label>
                <Input
                  id="icms"
                  type="number"
                  step="0.01"
                  value={activeSimulation.configuracoesGerais.icmsRate * 100}
                  onChange={(e) => updateConfig('icmsRate', (parseFloat(e.target.value) || 0) / 100)}
                />
              </div>
              <div>
                <Label htmlFor="freight">Frete Internacional (USD)</Label>
                <Input
                  id="freight"
                  type="number"
                  step="0.01"
                  value={activeSimulation.configuracoesGerais.internationalFreightUSD}
                  onChange={(e) => updateConfig('internationalFreightUSD', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="otherExpenses">Outras Despesas (BRL)</Label>
              <Input
                id="otherExpenses"
                type="number"
                step="0.01"
                value={activeSimulation.configuracoesGerais.otherExpensesBRL}
                onChange={(e) => updateConfig('otherExpensesBRL', parseFloat(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Products Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Produtos ({activeSimulation.produtos.length})
              </div>
              <Button onClick={addProduct} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeSimulation.produtos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum produto adicionado</p>
                <p className="text-sm">Clique em "Adicionar" para começar</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activeSimulation.produtos.map((product, index) => (
                  <div key={product.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Produto {index + 1}</h4>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => removeProduct(product.id)}
                      >
                        Remover
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Descrição do produto"
                        value={product.description}
                        onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          type="number"
                          placeholder="Qtd"
                          value={product.quantity}
                          onChange={(e) => updateProduct(product.id, 'quantity', parseInt(e.target.value) || 0)}
                        />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Valor USD"
                          value={product.unitValueUSD}
                          onChange={(e) => updateProduct(product.id, 'unitValueUSD', parseFloat(e.target.value) || 0)}
                        />
                        <Input
                          type="number"
                          step="0.001"
                          placeholder="Peso (kg)"
                          value={product.weightKg}
                          onChange={(e) => updateProduct(product.id, 'weightKg', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      {activeSimulation.produtos.length > 0 && (
        <div className="flex justify-center gap-4">
          <Button 
            onClick={handleSave} 
            disabled={saveMutation.isPending}
            variant="outline"
            className="flex items-center gap-2 px-6"
          >
            {saveMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Simulação
              </>
            )}
          </Button>
          
          <Button 
            onClick={calculateSimulation} 
            disabled={isCalculating}
            className="flex items-center gap-2 px-8 py-3"
            size="lg"
          >
            {isCalculating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Calculando...
              </>
            ) : (
              <>
                <Calculator className="w-5 h-5" />
                Calcular Simulação
              </>
            )}
          </Button>
        </div>
      )}

      {/* Metadata Fields */}
      {activeSimulation.produtos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Informações da Simulação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nomeSimulacao">Nome da Simulação</Label>
                <Input
                  id="nomeSimulacao"
                  value={activeSimulation.nomeSimulacao}
                  onChange={(e) => setActiveSimulation(prev => ({...prev, nomeSimulacao: e.target.value}))}
                />
              </div>
              <div>
                <Label htmlFor="nomeFornecedor">Nome do Fornecedor</Label>
                <Input
                  id="nomeFornecedor"
                  value={activeSimulation.nomeFornecedor || ''}
                  onChange={(e) => setActiveSimulation(prev => ({...prev, nomeFornecedor: e.target.value}))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                value={activeSimulation.observacoes || ''}
                onChange={(e) => setActiveSimulation(prev => ({...prev, observacoes: e.target.value}))}
                placeholder="Observações sobre a simulação..."
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Resultados da Simulação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">
                    {activeSimulation.produtos[index].description || `Produto ${index + 1}`}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Custo do Produto:</p>
                      <p className="font-medium">{formatCurrency(result.productCostBRL)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Imposto de Importação:</p>
                      <p className="font-medium">{formatCurrency(result.importTax)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">ICMS:</p>
                      <p className="font-medium">{formatCurrency(result.icms)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Frete:</p>
                      <p className="font-medium">{formatCurrency(result.freight)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Outras Despesas:</p>
                      <p className="font-medium">{formatCurrency(result.otherExpenses)}</p>
                    </div>
                    <div className="border-l-2 border-blue-500 pl-3">
                      <p className="text-gray-600">Custo Total:</p>
                      <p className="font-bold text-lg text-blue-600">
                        {formatCurrency(result.totalCostBRL)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(result.unitCostBRL)} por unidade
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SimuladorSimplificado;