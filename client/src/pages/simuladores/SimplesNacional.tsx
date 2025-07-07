import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Save, Calculator, FileText, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Formatação brasileira de números
const formatBrazilianNumber = (value: number, decimals: number = 2): string => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

const formatPercent = (value: number): string => {
  return (value * 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + '%';
};

// Tabela de faixas do Simples Nacional
const tabelaFaixas = [
  { faixa: "1ª Faixa", aliquota: 0.04, valorReduzir: 0, inicio: 0, fim: 180000 },
  { faixa: "2ª Faixa", aliquota: 0.073, valorReduzir: 5940, inicio: 180000.01, fim: 360000 },
  { faixa: "3ª Faixa", aliquota: 0.095, valorReduzir: 13860, inicio: 360000.01, fim: 720000 },
  { faixa: "4ª Faixa", aliquota: 0.107, valorReduzir: 22500, inicio: 720000.01, fim: 1800000 },
  { faixa: "5ª Faixa", aliquota: 0.143, valorReduzir: 87300, inicio: 1800000.01, fim: 3600000 }
];

// Função para calcular tarifa do Simples Nacional
function calcularTarifaSimples(faturamento12Meses: number, faturamentoSemST: number, faturamentoComST: number) {
  // 1. Calcular faturamento total do mês
  const faturamentoTotal = faturamentoSemST + faturamentoComST;
  
  // 2. Determinar faixa de alíquota
  let faixaAtual = null;
  for (const faixa of tabelaFaixas) {
    if (faturamento12Meses >= faixa.inicio && faturamento12Meses <= faixa.fim) {
      faixaAtual = faixa;
      break;
    }
  }
  
  // Verificar se está acima da última faixa
  if (!faixaAtual && faturamento12Meses > tabelaFaixas[tabelaFaixas.length - 1].fim) {
    return {
      erro: "Faturamento acima do limite do Simples Nacional (R$ 3.600.000,00)"
    };
  }
  
  if (!faixaAtual) {
    return {
      erro: "Não foi possível determinar a faixa de alíquota"
    };
  }
  
  // 3. Calcular alíquota efetiva
  const aliquotaBase = faixaAtual.aliquota;
  const valorReduzir = faixaAtual.valorReduzir;
  const aliquotaEfetiva = (faturamento12Meses * aliquotaBase - valorReduzir) / faturamento12Meses;
  
  // 4. Determinar percentual de ICMS
  const percentualICMS = faturamento12Meses < 360000 ? 0.34 : 0.335;
  
  // 5. Calcular valor do Simples sem ST
  const valorSimplesSemST = faturamentoSemST * aliquotaEfetiva;
  
  // 6. Calcular valor do Simples com ST (com redução do ICMS)
  const valorSimplesComST = faturamentoComST * aliquotaEfetiva * (1 - percentualICMS);
  
  // 7. Calcular valor total do Simples
  const valorTotalSimples = valorSimplesSemST + valorSimplesComST;
  
  return {
    faturamentoTotal,
    aliquotaBase,
    valorReduzir,
    aliquotaEfetiva,
    percentualICMS,
    valorSimplesSemST,
    valorSimplesComST,
    valorTotalSimples,
    faixaDescricao: faixaAtual.faixa
  };
}

interface SimulacaoCompleta {
  nomeSimulacao: string;
  observacoes: string;
  faturamento12Meses: number;
  faturamentoSemST: number;
  faturamentoComST: number;
}

const defaultSimulation: SimulacaoCompleta = {
  nomeSimulacao: "Nova Simulação",
  observacoes: "",
  faturamento12Meses: 0,
  faturamentoSemST: 0,
  faturamentoComST: 0
};

export default function SimplesNacional() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [activeSimulation, setActiveSimulation] = useState<SimulacaoCompleta>(defaultSimulation);
  const [selectedSimulationId, setSelectedSimulationId] = useState<number | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [activeTab, setActiveTab] = useState("simulation");

  // API queries
  const { data: simulations = [], isLoading } = useQuery({
    queryKey: ['/api/simulations/simples-nacional'],
    enabled: true,
  });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (selectedSimulationId) {
        return apiRequest(`/api/simulations/simples-nacional/${selectedSimulationId}`, {
          method: 'PUT',
          body: data
        });
      } else {
        return apiRequest('/api/simulations/simples-nacional', {
          method: 'POST',
          body: data
        });
      }
    },
    onSuccess: () => {
      toast({
        title: "Simulação salva",
        description: "Simulação salva com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/simulations/simples-nacional'] });
      setShowSaveDialog(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar simulação",
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/simulations/simples-nacional/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: "Simulação excluída",
        description: "Simulação excluída com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/simulations/simples-nacional'] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir simulação",
        variant: "destructive",
      });
    }
  });

  // Calcular resultados em tempo real
  const calculoResult = useMemo(() => {
    if (activeSimulation.faturamento12Meses <= 0) return null;
    return calcularTarifaSimples(
      activeSimulation.faturamento12Meses,
      activeSimulation.faturamentoSemST,
      activeSimulation.faturamentoComST
    );
  }, [activeSimulation.faturamento12Meses, activeSimulation.faturamentoSemST, activeSimulation.faturamentoComST]);

  // Handlers
  const novaSimulacao = () => {
    setActiveSimulation(defaultSimulation);
    setSelectedSimulationId(null);
    setActiveTab("simulation");
  };

  const loadSimulation = (simulation: any) => {
    setActiveSimulation({
      nomeSimulacao: simulation.nomeSimulacao,
      observacoes: simulation.observacoes || "",
      faturamento12Meses: parseFloat(simulation.faturamento12Meses) || 0,
      faturamentoSemST: parseFloat(simulation.faturamentoSemST) || 0,
      faturamentoComST: parseFloat(simulation.faturamentoComST) || 0
    });
    setSelectedSimulationId(simulation.id);
    setActiveTab("simulation");
  };

  const handleSaveClick = () => {
    if (!calculoResult || calculoResult.erro) {
      toast({
        title: "Erro",
        description: "Complete os campos corretamente antes de salvar",
        variant: "destructive",
      });
      return;
    }
    setShowSaveDialog(true);
  };

  const handleSave = () => {
    saveMutation.mutate({
      nomeSimulacao: activeSimulation.nomeSimulacao,
      observacoes: activeSimulation.observacoes,
      faturamento12Meses: activeSimulation.faturamento12Meses,
      faturamentoSemST: activeSimulation.faturamentoSemST,
      faturamentoComST: activeSimulation.faturamentoComST
    });
  };

  const updateSimulation = (field: keyof SimulacaoCompleta, value: string | number) => {
    setActiveSimulation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Simulador Simplificado do Simples Nacional</h1>
          <p className="text-muted-foreground">
            Calcule a tarifa do Simples Nacional com precisão incluindo II, ICMS e despesas aduaneiras
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={novaSimulacao} variant="outline">
            Nova Simulação
          </Button>
          <Button onClick={handleSaveClick} disabled={!calculoResult || !!calculoResult?.erro}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="simulation">Simulação Ativa</TabsTrigger>
          <TabsTrigger value="saved">Simulações Salvas</TabsTrigger>
        </TabsList>

        <TabsContent value="simulation">
          {/* Header da Simulação */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {isEditingName ? (
                    <Input
                      value={activeSimulation.nomeSimulacao}
                      onChange={(e) => updateSimulation('nomeSimulacao', e.target.value)}
                      onBlur={() => setIsEditingName(false)}
                      onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                      className="text-lg font-semibold"
                      autoFocus
                    />
                  ) : (
                    <h2 
                      className="text-lg font-semibold cursor-pointer hover:text-blue-600"
                      onClick={() => setIsEditingName(true)}
                    >
                      {activeSimulation.nomeSimulacao}
                    </h2>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Adicione observações sobre esta simulação..."
                    value={activeSimulation.observacoes}
                    onChange={(e) => updateSimulation('observacoes', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Campos de Entrada */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Dados de Entrada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="faturamento12meses">Faturamento dos últimos 12 meses (R$)</Label>
                  <Input
                    id="faturamento12meses"
                    type="number"
                    placeholder="0,00"
                    value={activeSimulation.faturamento12Meses || ''}
                    onChange={(e) => updateSimulation('faturamento12Meses', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-muted-foreground">
                    Valor que determina a faixa de alíquota
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="faturamentoSemST">Faturamento do mês sem ST (R$)</Label>
                  <Input
                    id="faturamentoSemST"
                    type="number"
                    placeholder="0,00"
                    value={activeSimulation.faturamentoSemST || ''}
                    onChange={(e) => updateSimulation('faturamentoSemST', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-muted-foreground">
                    Faturamento mensal sem Substituição Tributária
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="faturamentoComST">Faturamento do mês com ST (R$)</Label>
                  <Input
                    id="faturamentoComST"
                    type="number"
                    placeholder="0,00"
                    value={activeSimulation.faturamentoComST || ''}
                    onChange={(e) => updateSimulation('faturamentoComST', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-muted-foreground">
                    Faturamento mensal com Substituição Tributária
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resultados */}
          {calculoResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Resultados da Simulação
                </CardTitle>
              </CardHeader>
              <CardContent>
                {calculoResult.erro ? (
                  <div className="flex items-center gap-2 p-4 border rounded-lg bg-red-50 border-red-200">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800 font-medium">{calculoResult.erro}</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Faturamento Total do Mês</div>
                        <div className="text-lg font-semibold text-blue-600">
                          {formatCurrency(calculoResult.faturamentoTotal)}
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Faixa</div>
                        <div className="text-lg font-semibold">
                          {calculoResult.faixaDescricao}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Alíquota Base</div>
                        <div className="text-lg font-semibold">
                          {formatPercent(calculoResult.aliquotaBase)}
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Valor a Reduzir</div>
                        <div className="text-lg font-semibold">
                          {formatCurrency(calculoResult.valorReduzir)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Alíquota Efetiva</div>
                        <div className="text-lg font-semibold text-green-600">
                          {formatPercent(calculoResult.aliquotaEfetiva)}
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Percentual ICMS</div>
                        <div className="text-lg font-semibold">
                          {formatPercent(calculoResult.percentualICMS)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Simples sem ST</div>
                        <div className="text-lg font-semibold">
                          {formatCurrency(calculoResult.valorSimplesSemST)}
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Simples com ST</div>
                        <div className="text-lg font-semibold">
                          {formatCurrency(calculoResult.valorSimplesComST)}
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 lg:col-span-4">
                      <div className="p-6 border rounded-lg bg-blue-50 border-blue-200">
                        <div className="text-sm text-blue-700 mb-1">Valor Total do Simples Nacional</div>
                        <div className="text-2xl font-bold text-blue-800">
                          {formatCurrency(calculoResult.valorTotalSimples)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Aviso legal */}
                <div className="mt-6 p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <strong>Aviso importante:</strong> Este simulador é apenas para fins de estimativa. 
                      Para valores oficiais e orientações específicas, consulte sempre um contador qualificado.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Simulações Salvas</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Carregando simulações...</div>
              ) : simulations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma simulação salva</p>
                  <p className="text-sm">Crie e salve uma simulação para vê-la aqui</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {simulations.map((simulation: any) => (
                    <div key={simulation.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{simulation.nomeSimulacao}</h3>
                          {simulation.codigoSimulacao && (
                            <Badge variant="outline" className="text-xs">
                              {simulation.codigoSimulacao}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => loadSimulation(simulation)}>
                            Carregar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteMutation.mutate(simulation.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {formatCurrency(parseFloat(simulation.valorTotalSimples))}
                          </div>
                          <div className="text-xs text-muted-foreground">Valor Total Simples</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {formatPercent(parseFloat(simulation.aliquotaEfetiva))}
                          </div>
                          <div className="text-xs text-muted-foreground">Alíquota Efetiva</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">
                            {formatCurrency(parseFloat(simulation.faturamento12Meses))}
                          </div>
                          <div className="text-xs text-muted-foreground">Faturamento 12M</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">
                            Atualizada em
                          </div>
                          <div className="text-sm font-medium">
                            {new Date(simulation.dataLastModified).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para salvar */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Simulação</DialogTitle>
            <DialogDescription>
              Confirme os dados da simulação antes de salvar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">
                Nome
              </Label>
              <Input
                id="nome"
                value={activeSimulation.nomeSimulacao}
                onChange={(e) => updateSimulation('nomeSimulacao', e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}