import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Save, Calculator, FileText, AlertTriangle, FolderOpen } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Formatação brasileira de números com formato específico R$ X.XXX.XXXX,XX
const formatBrazilianNumber = (value: number, decimals: number = 2): string => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

const formatCurrency = (value: number): string => {
  return `R$ ${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
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
  const [showLoadDialog, setShowLoadDialog] = useState(false);

  // Queries
  const savedSimulationsQuery = useQuery({
    queryKey: ['/api/simulations/simples-nacional'],
    staleTime: 5 * 60 * 1000,
  });

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
    setShowLoadDialog(false);
    toast({
      title: "Simulação carregada",
      description: `Simulação "${simulation.nomeSimulacao}" carregada com sucesso!`,
    });
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
          <Button onClick={() => setShowLoadDialog(true)} variant="outline">
            <FolderOpen className="w-4 h-4 mr-2" />
            Carregar
          </Button>
          <Button onClick={handleSaveClick} disabled={!calculoResult || !!calculoResult?.erro}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>
      {/* Header da Simulação */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="flex-1 max-w-md">
                <Label htmlFor="nomeSimulacao" className="text-sm font-medium">Nome da Simulação</Label>
                <Input
                  id="nomeSimulacao"
                  value={activeSimulation.nomeSimulacao}
                  onChange={(e) => updateSimulation('nomeSimulacao', e.target.value)}
                  className="text-lg font-semibold mt-1"
                  placeholder="Digite o nome da simulação..."
                />
              </div>
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

      {/* Dialog para carregar simulações */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Carregar Simulação</DialogTitle>
            <DialogDescription>
              Selecione uma simulação salva para carregar.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {savedSimulationsQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="text-muted-foreground">Carregando simulações...</div>
                </div>
              </div>
            ) : savedSimulationsQuery.data?.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <div className="text-muted-foreground mb-4">Nenhuma simulação salva encontrada</div>
                  <Button onClick={() => setShowLoadDialog(false)}>
                    Fechar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {savedSimulationsQuery.data?.map((simulation: any) => (
                  <div key={simulation.id} className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer" onClick={() => loadSimulation(simulation)}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{simulation.nomeSimulacao}</h3>
                        <Badge variant="secondary">{simulation.codigoSimulacao}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(simulation.dataUltimaModificacao).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">12 meses:</span> {formatCurrency(parseFloat(simulation.faturamento12Meses))}
                      </div>
                      <div>
                        <span className="font-medium">Sem ST:</span> {formatCurrency(parseFloat(simulation.faturamentoSemST))}
                      </div>
                      <div>
                        <span className="font-medium">Com ST:</span> {formatCurrency(parseFloat(simulation.faturamentoComST))}
                      </div>
                      <div>
                        <span className="font-medium">Total Simples:</span> {formatCurrency(parseFloat(simulation.valorTotalSimples))}
                      </div>
                    </div>

                    {simulation.observacoes && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <span className="font-medium">Observações:</span> {simulation.observacoes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}