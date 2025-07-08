import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Download, RotateCcw, Save, FolderOpen, Plus, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Interfaces
interface Imposto {
  nome: string;
  aliquota: number;
  baseCalculo: string;
  valor: number;
}

interface DespesaAdicional {
  nome: string;
  valorDolar: number;
  valorReal: number;
}

interface ResultadosCalculo {
  valorFobReal: number;
  valorFreteReal: number;
  valorCfrDolar: number;
  valorCfrReal: number;
  totalBaseCalculo: number;
  totalImpostos: number;
  totalDespesas: number;
  custoTotal: number;
}

interface SimulacaoImportacao {
  id?: number;
  nome: string;
  dataCriacao?: Date;
  dataModificacao?: Date;
  fornecedor: string;
  despachante: string;
  agenteCargas: string;
  status: string;
  taxaDolar: number;
  valorFobDolar: number;
  valorFreteDolar: number;
  impostos: Imposto[];
  despesasAdicionais: DespesaAdicional[];
  resultados: ResultadosCalculo;
}

interface ImportSimulation {
  id?: number;
  name: string;
  supplier: string;
  customsBroker: string;
  cargoAgent: string;
  status: string;
  dollarRate: number;
  fobValueUsd: number;
  freightValueUsd: number;
  taxes: any;
  additionalExpenses: any;
  results: any;
}

// Funções de formatação
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
};

const formatUSD = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
};

const formatPercent = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

// Impostos padrão
const impostosDefault: Imposto[] = [
  {
    nome: "Imposto de Importação (II)",
    aliquota: 0.60,
    baseCalculo: "valor_fob_real",
    valor: 0
  },
  {
    nome: "IPI",
    aliquota: 0.15,
    baseCalculo: "base_ii_ipi",
    valor: 0
  },
  {
    nome: "PIS",
    aliquota: 0.0233,
    baseCalculo: "total_base_calculo",
    valor: 0
  },
  {
    nome: "COFINS",
    aliquota: 0.1074,
    baseCalculo: "total_base_calculo",
    valor: 0
  },
  {
    nome: "ICMS",
    aliquota: 0.17,
    baseCalculo: "total_base_calculo",
    valor: 0
  }
];

// Despesas padrão
const despesasDefault: DespesaAdicional[] = [
  {
    nome: "Taxa SISCOMEX",
    valorDolar: 0,
    valorReal: 214.50
  },
  {
    nome: "Honorários Despachante",
    valorDolar: 0,
    valorReal: 500.00
  },
  {
    nome: "Armazenagem",
    valorDolar: 0,
    valorReal: 0
  },
  {
    nome: "Transporte Interno",
    valorDolar: 0,
    valorReal: 0
  }
];

export default function ImportacaoFormal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estado da simulação
  const [simulacao, setSimulacao] = useState<SimulacaoImportacao>({
    nome: 'Nova Simulação de Importação',
    fornecedor: '',
    despachante: '',
    agenteCargas: '',
    status: 'Em andamento',
    taxaDolar: 5.50,
    valorFobDolar: 10000,
    valorFreteDolar: 1000,
    impostos: [...impostosDefault],
    despesasAdicionais: [...despesasDefault],
    resultados: {
      valorFobReal: 0,
      valorFreteReal: 0,
      valorCfrDolar: 0,
      valorCfrReal: 0,
      totalBaseCalculo: 0,
      totalImpostos: 0,
      totalDespesas: 0,
      custoTotal: 0
    }
  });

  const [currentSimulationId, setCurrentSimulationId] = useState<number | null>(null);

  // Query para carregar simulações do usuário
  const { data: simulations = [] } = useQuery({
    queryKey: ['import-simulations'],
    queryFn: () => apiRequest('/api/import-simulations'),
    retry: false
  });

  // Mutation para salvar simulação
  const saveSimulationMutation = useMutation({
    mutationFn: async (simulation: Partial<ImportSimulation>) => {
      if (currentSimulationId) {
        return apiRequest(`/api/import-simulations/${currentSimulationId}`, {
          method: 'PUT',
          body: JSON.stringify(simulation)
        });
      } else {
        return apiRequest('/api/import-simulations', {
          method: 'POST',
          body: JSON.stringify(simulation)
        });
      }
    },
    onSuccess: (data) => {
      setCurrentSimulationId(data.id);
      queryClient.invalidateQueries({ queryKey: ['import-simulations'] });
      toast({
        title: "Simulação salva",
        description: "Seus dados foram salvos com sucesso!"
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a simulação.",
        variant: "destructive"
      });
    }
  });

  // Funções de cálculo
  const calcularImpostos = (simulacao: SimulacaoImportacao): SimulacaoImportacao => {
    const valorFobReal = simulacao.valorFobDolar * simulacao.taxaDolar;
    const valorFreteReal = simulacao.valorFreteDolar * simulacao.taxaDolar;
    
    // Cálculo do II (Imposto de Importação)
    const impostoII = simulacao.impostos.find(i => i.nome.includes("II"));
    if (impostoII) {
      impostoII.valor = valorFobReal * impostoII.aliquota;
    }
    
    // Cálculo do IPI
    const impostoIPI = simulacao.impostos.find(i => i.nome.includes("IPI"));
    if (impostoIPI && impostoII) {
      const baseIPI = valorFobReal + valorFreteReal + impostoII.valor;
      impostoIPI.valor = baseIPI * impostoIPI.aliquota;
    }
    
    // Cálculo da base total para outros impostos
    const totalBaseCalculo = valorFobReal + valorFreteReal + (impostoII?.valor || 0) + (impostoIPI?.valor || 0);
    
    // Cálculo dos demais impostos
    simulacao.impostos.forEach(imposto => {
      if (!imposto.nome.includes("II") && !imposto.nome.includes("IPI")) {
        imposto.valor = totalBaseCalculo * imposto.aliquota;
      }
    });
    
    // Atualiza resultados
    simulacao.resultados.valorFobReal = valorFobReal;
    simulacao.resultados.valorFreteReal = valorFreteReal;
    simulacao.resultados.valorCfrDolar = simulacao.valorFobDolar + simulacao.valorFreteDolar;
    simulacao.resultados.valorCfrReal = valorFobReal + valorFreteReal;
    simulacao.resultados.totalBaseCalculo = totalBaseCalculo;
    simulacao.resultados.totalImpostos = simulacao.impostos.reduce((total, imposto) => total + imposto.valor, 0);
    
    return simulacao;
  };

  const calcularDespesas = (simulacao: SimulacaoImportacao): SimulacaoImportacao => {
    let totalDespesas = 0;
    
    simulacao.despesasAdicionais.forEach(despesa => {
      if (despesa.valorDolar > 0) {
        despesa.valorReal = despesa.valorDolar * simulacao.taxaDolar;
      }
      totalDespesas += despesa.valorReal;
    });
    
    simulacao.resultados.totalDespesas = totalDespesas;
    return simulacao;
  };

  const calcularCustoTotal = (simulacao: SimulacaoImportacao): SimulacaoImportacao => {
    simulacao = calcularImpostos(simulacao);
    simulacao = calcularDespesas(simulacao);
    
    simulacao.resultados.custoTotal = 
      simulacao.resultados.valorCfrReal + 
      simulacao.resultados.totalImpostos + 
      simulacao.resultados.totalDespesas;
    
    return simulacao;
  };

  // Recalcular sempre que houver mudanças
  const simulacaoCalculada = useMemo(() => {
    return calcularCustoTotal({ ...simulacao });
  }, [simulacao]);

  // Atualizar simulação com cálculos
  useEffect(() => {
    setSimulacao(simulacaoCalculada);
  }, [simulacaoCalculada.resultados.custoTotal]);

  // Função para salvar simulação
  const salvarSimulacao = () => {
    const simulation: Partial<ImportSimulation> = {
      name: simulacao.nome,
      supplier: simulacao.fornecedor,
      customsBroker: simulacao.despachante,
      cargoAgent: simulacao.agenteCargas,
      status: simulacao.status,
      dollarRate: simulacao.taxaDolar,
      fobValueUsd: simulacao.valorFobDolar,
      freightValueUsd: simulacao.valorFreteDolar,
      taxes: simulacao.impostos,
      additionalExpenses: simulacao.despesasAdicionais,
      results: simulacao.resultados
    };

    saveSimulationMutation.mutate(simulation);
  };

  // Função para carregar simulação
  const carregarSimulacao = (simulation: ImportSimulation) => {
    setSimulacao({
      nome: simulation.name,
      fornecedor: simulation.supplier || '',
      despachante: simulation.customsBroker || '',
      agenteCargas: simulation.cargoAgent || '',
      status: simulation.status || 'Em andamento',
      taxaDolar: simulation.dollarRate || 5.50,
      valorFobDolar: simulation.fobValueUsd || 0,
      valorFreteDolar: simulation.freightValueUsd || 0,
      impostos: simulation.taxes || [...impostosDefault],
      despesasAdicionais: simulation.additionalExpenses || [...despesasDefault],
      resultados: simulation.results || {
        valorFobReal: 0,
        valorFreteReal: 0,
        valorCfrDolar: 0,
        valorCfrReal: 0,
        totalBaseCalculo: 0,
        totalImpostos: 0,
        totalDespesas: 0,
        custoTotal: 0
      }
    });
    setCurrentSimulationId(simulation.id || null);
    
    toast({
      title: "Simulação carregada",
      description: `Simulação "${simulation.name}" carregada com sucesso!`
    });
  };

  // Função para exportar PDF
  const exportarPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(18);
      doc.text('Simulação de Importação Formal', 20, 20);
      
      // Informações gerais
      doc.setFontSize(12);
      doc.text(`Nome: ${simulacao.nome}`, 20, 35);
      doc.text(`Fornecedor: ${simulacao.fornecedor}`, 20, 45);
      doc.text(`Taxa USD: ${simulacao.taxaDolar.toFixed(4)}`, 20, 55);
      doc.text(`Valor FOB: ${formatUSD(simulacao.valorFobDolar)}`, 20, 65);
      doc.text(`Frete: ${formatUSD(simulacao.valorFreteDolar)}`, 20, 75);
      
      // Resultados
      doc.text('Resultados:', 20, 90);
      doc.text(`Custo Total: ${formatCurrency(simulacao.resultados.custoTotal)}`, 30, 100);
      doc.text(`Total Impostos: ${formatCurrency(simulacao.resultados.totalImpostos)}`, 30, 110);
      doc.text(`Total Despesas: ${formatCurrency(simulacao.resultados.totalDespesas)}`, 30, 120);

      doc.save(`simulacao_importacao_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "PDF exportado",
        description: "Arquivo PDF gerado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF.",
        variant: "destructive"
      });
    }
  };

  // Função para resetar simulação
  const resetarSimulacao = () => {
    setSimulacao({
      nome: 'Nova Simulação de Importação',
      fornecedor: '',
      despachante: '',
      agenteCargas: '',
      status: 'Em andamento',
      taxaDolar: 5.50,
      valorFobDolar: 10000,
      valorFreteDolar: 1000,
      impostos: [...impostosDefault],
      despesasAdicionais: [...despesasDefault],
      resultados: {
        valorFobReal: 0,
        valorFreteReal: 0,
        valorCfrDolar: 0,
        valorCfrReal: 0,
        totalBaseCalculo: 0,
        totalImpostos: 0,
        totalDespesas: 0,
        custoTotal: 0
      }
    });
    setCurrentSimulationId(null);
    
    toast({
      title: "Simulação resetada",
      description: "Todos os dados foram limpos."
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Simulador de Importação Formal</h1>
        <p className="text-gray-600">
          Calcule custos de importação com impostos e despesas adicionais
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurações e Controles - 1/3 do espaço */}
        <div className="lg:col-span-1 space-y-6">
          {/* Controles de Simulação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Controles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="simulation-name">Nome da Simulação</Label>
                <Input
                  id="simulation-name"
                  value={simulacao.nome}
                  onChange={(e) => setSimulacao(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Nome da simulação"
                />
              </div>

              {simulations.length > 0 && (
                <div>
                  <Label>Simulações Salvas</Label>
                  <Select onValueChange={(value) => {
                    const simulation = simulations.find((s: any) => s.id === parseInt(value));
                    if (simulation) carregarSimulacao(simulation);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar simulação" />
                    </SelectTrigger>
                    <SelectContent>
                      {simulations.map((simulation: any) => (
                        <SelectItem key={simulation.id} value={simulation.id.toString()}>
                          {simulation.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Button onClick={salvarSimulacao} className="w-full" disabled={saveSimulationMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {saveSimulationMutation.isPending ? 'Salvando...' : 'Salvar Simulação'}
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={exportarPDF} variant="outline" size="sm">
                    <Download className="h-3 w-3 mr-1" />
                    PDF
                  </Button>
                  <Button onClick={resetarSimulacao} variant="destructive" size="sm">
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Resetar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Gerais */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fornecedor">Fornecedor</Label>
                <Input
                  id="fornecedor"
                  value={simulacao.fornecedor}
                  onChange={(e) => setSimulacao(prev => ({ ...prev, fornecedor: e.target.value }))}
                  placeholder="Nome do fornecedor"
                />
              </div>

              <div>
                <Label htmlFor="despachante">Despachante</Label>
                <Input
                  id="despachante"
                  value={simulacao.despachante}
                  onChange={(e) => setSimulacao(prev => ({ ...prev, despachante: e.target.value }))}
                  placeholder="Nome do despachante"
                />
              </div>

              <div>
                <Label htmlFor="agente-cargas">Agente de Cargas</Label>
                <Input
                  id="agente-cargas"
                  value={simulacao.agenteCargas}
                  onChange={(e) => setSimulacao(prev => ({ ...prev, agenteCargas: e.target.value }))}
                  placeholder="Nome do agente de cargas"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={simulacao.status} 
                  onValueChange={(value) => setSimulacao(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Em andamento">Em andamento</SelectItem>
                    <SelectItem value="Finalizada">Finalizada</SelectItem>
                    <SelectItem value="Cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Valores Principais */}
          <Card>
            <CardHeader>
              <CardTitle>Valores Principais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="taxa-dolar">Taxa do Dólar (R$)</Label>
                <Input
                  id="taxa-dolar"
                  type="number"
                  step="0.0001"
                  value={simulacao.taxaDolar}
                  onChange={(e) => setSimulacao(prev => ({ ...prev, taxaDolar: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <Label htmlFor="valor-fob">Valor FOB (USD)</Label>
                <Input
                  id="valor-fob"
                  type="number"
                  step="0.01"
                  value={simulacao.valorFobDolar}
                  onChange={(e) => setSimulacao(prev => ({ ...prev, valorFobDolar: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <Label htmlFor="valor-frete">Valor do Frete (USD)</Label>
                <Input
                  id="valor-frete"
                  type="number"
                  step="0.01"
                  value={simulacao.valorFreteDolar}
                  onChange={(e) => setSimulacao(prev => ({ ...prev, valorFreteDolar: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Impostos e Despesas - 2/3 do espaço */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resumo de Resultados */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo de Custos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900">Valor CFR</h4>
                  <p className="text-xl font-bold text-blue-700">{formatCurrency(simulacao.resultados.valorCfrReal)}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-900">Total Impostos</h4>
                  <p className="text-xl font-bold text-red-700">{formatCurrency(simulacao.resultados.totalImpostos)}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-900">Total Despesas</h4>
                  <p className="text-xl font-bold text-yellow-700">{formatCurrency(simulacao.resultados.totalDespesas)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900">Custo Total</h4>
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(simulacao.resultados.custoTotal)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Impostos */}
          <Card>
            <CardHeader>
              <CardTitle>Impostos</CardTitle>
              <CardDescription>Alíquotas e valores calculados automaticamente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left">Imposto</th>
                      <th className="border border-gray-300 p-3 text-left">Alíquota</th>
                      <th className="border border-gray-300 p-3 text-left">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulacao.impostos.map((imposto, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-3 font-medium">{imposto.nome}</td>
                        <td className="border border-gray-300 p-3">
                          <Input
                            type="number"
                            step="0.0001"
                            value={imposto.aliquota}
                            onChange={(e) => {
                              const novosImpostos = [...simulacao.impostos];
                              novosImpostos[index].aliquota = parseFloat(e.target.value) || 0;
                              setSimulacao(prev => ({ ...prev, impostos: novosImpostos }));
                            }}
                            className="w-20"
                          />
                          <span className="ml-2 text-sm text-gray-500">({formatPercent(imposto.aliquota)})</span>
                        </td>
                        <td className="border border-gray-300 p-3 font-bold text-red-600">
                          {formatCurrency(imposto.valor)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Despesas Adicionais */}
          <Card>
            <CardHeader>
              <CardTitle>Despesas Adicionais</CardTitle>
              <CardDescription>Custos adicionais da importação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left">Despesa</th>
                      <th className="border border-gray-300 p-3 text-left">Valor USD</th>
                      <th className="border border-gray-300 p-3 text-left">Valor R$</th>
                      <th className="border border-gray-300 p-3 text-left">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulacao.despesasAdicionais.map((despesa, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-3">
                          <Input
                            value={despesa.nome}
                            onChange={(e) => {
                              const novasDespesas = [...simulacao.despesasAdicionais];
                              novasDespesas[index].nome = e.target.value;
                              setSimulacao(prev => ({ ...prev, despesasAdicionais: novasDespesas }));
                            }}
                            placeholder="Nome da despesa"
                          />
                        </td>
                        <td className="border border-gray-300 p-3">
                          <Input
                            type="number"
                            step="0.01"
                            value={despesa.valorDolar}
                            onChange={(e) => {
                              const novasDespesas = [...simulacao.despesasAdicionais];
                              novasDespesas[index].valorDolar = parseFloat(e.target.value) || 0;
                              setSimulacao(prev => ({ ...prev, despesasAdicionais: novasDespesas }));
                            }}
                            placeholder="0.00"
                          />
                        </td>
                        <td className="border border-gray-300 p-3">
                          <Input
                            type="number"
                            step="0.01"
                            value={despesa.valorReal}
                            onChange={(e) => {
                              const novasDespesas = [...simulacao.despesasAdicionais];
                              novasDespesas[index].valorReal = parseFloat(e.target.value) || 0;
                              novasDespesas[index].valorDolar = 0; // Zera USD quando edita R$
                              setSimulacao(prev => ({ ...prev, despesasAdicionais: novasDespesas }));
                            }}
                            placeholder="0.00"
                          />
                        </td>
                        <td className="border border-gray-300 p-3">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              const novasDespesas = simulacao.despesasAdicionais.filter((_, i) => i !== index);
                              setSimulacao(prev => ({ ...prev, despesasAdicionais: novasDespesas }));
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <Button
                className="mt-4"
                onClick={() => {
                  const novasDespesas = [...simulacao.despesasAdicionais, {
                    nome: '',
                    valorDolar: 0,
                    valorReal: 0
                  }];
                  setSimulacao(prev => ({ ...prev, despesasAdicionais: novasDespesas }));
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Despesa
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}