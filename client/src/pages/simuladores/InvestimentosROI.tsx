import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Download, RotateCcw, Copy, Save, FolderOpen } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Interfaces
interface ConfiguracaoSimulacao {
  investimentoInicial: number;
  duracaoGiro: number;
  unidadeTempo: 'Dias' | 'Semanas' | 'Meses';
  numeroGiros: number;
}

interface GiroCalculado {
  numero: number;
  investimento: number;
  retorno: number;
  aporte: number;
  retirada: number;
  saldo: number;
  roiGiro: number;
  tempoDecorrido: number;
}

interface InvestmentSimulation {
  id?: number;
  name: string;
  initialInvestment: number;
  cycleDuration: number;
  cycleUnit: string;
  numberOfCycles: number;
  cycles: any;
}

// Funções de formatação
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const formatPercent = (value: number): string => {
  return `${(value || 0).toFixed(2)}%`;
};

// Componente de input de moeda brasileira para valores inteiros
const CurrencyInput = ({ value, onChange, className = "", placeholder = "R$ 0" }: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
}) => {
  const [displayValue, setDisplayValue] = useState<string>('');

  useEffect(() => {
    if (value === 0) {
      setDisplayValue('');
    } else {
      // Formatar como moeda brasileira sem decimais
      setDisplayValue(value.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Remove tudo exceto números
    const numbersOnly = inputValue.replace(/[^\d]/g, '');
    
    // Se estiver vazio, zera o valor
    if (numbersOnly === '') {
      setDisplayValue('');
      onChange(0);
      return;
    }
    
    // Converte para número inteiro
    const numericValue = parseInt(numbersOnly) || 0;
    onChange(numericValue);
  };

  return (
    <Input
      type="text"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
};

export default function InvestimentosROI() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estado da configuração
  const [config, setConfig] = useState<ConfiguracaoSimulacao>({
    investimentoInicial: 10000,
    duracaoGiro: 45,
    unidadeTempo: 'Dias',
    numeroGiros: 12,
  });

  // Estado para dados de cada giro editáveis
  const [girosData, setGirosData] = useState<{[key: number]: {aporte: number, retirada: number, roiGiro: number}}>({});
  
  // Estados para aplicação em lote
  const [bulkROI, setBulkROI] = useState<number>(20);
  const [bulkAporte, setBulkAporte] = useState<number>(0);
  const [bulkRetirada, setBulkRetirada] = useState<number>(0);
  
  // Estado da simulação atual
  const [currentSimulationId, setCurrentSimulationId] = useState<number | null>(null);
  const [simulationName, setSimulationName] = useState<string>('Nova Simulação');

  // Query para carregar simulações do usuário
  const { data: simulations = [] } = useQuery({
    queryKey: ['investment-simulations'],
    queryFn: () => apiRequest('/api/investment-simulations')
  });

  // Mutation para salvar simulação
  const saveSimulationMutation = useMutation({
    mutationFn: async (simulation: Partial<InvestmentSimulation>) => {
      if (currentSimulationId) {
        return apiRequest(`/api/investment-simulations/${currentSimulationId}`, {
          method: 'PUT',
          body: JSON.stringify(simulation)
        });
      } else {
        return apiRequest('/api/investment-simulations', {
          method: 'POST',
          body: JSON.stringify(simulation)
        });
      }
    },
    onSuccess: (data) => {
      setCurrentSimulationId(data.id);
      queryClient.invalidateQueries({ queryKey: ['investment-simulations'] });
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

  // Carregar dados do localStorage para preservar dados temporários
  useEffect(() => {
    const savedConfig = localStorage.getItem('investimentoConfig');
    const savedGirosData = localStorage.getItem('investimentoGirosData');

    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
    if (savedGirosData) {
      setGirosData(JSON.parse(savedGirosData));
    }
  }, []);

  // Salvar no localStorage sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem('investimentoConfig', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('investimentoGirosData', JSON.stringify(girosData));
  }, [girosData]);

  // Função para aplicar valores em lote
  const aplicarEmLote = (tipo: 'roi' | 'aporte' | 'retirada') => {
    const novoGirosData = { ...girosData };
    
    for (let i = 1; i <= config.numeroGiros; i++) {
      if (!novoGirosData[i]) {
        novoGirosData[i] = { aporte: 0, retirada: 0, roiGiro: 20 };
      }
      
      switch (tipo) {
        case 'roi':
          novoGirosData[i].roiGiro = bulkROI;
          break;
        case 'aporte':
          novoGirosData[i].aporte = bulkAporte;
          break;
        case 'retirada':
          novoGirosData[i].retirada = bulkRetirada;
          break;
      }
    }
    
    setGirosData(novoGirosData);
    
    toast({
      title: "Aplicado com sucesso",
      description: `${tipo.toUpperCase()} aplicado a todos os giros.`
    });
  };

  // Cálculo dos giros com base na configuração e dados editáveis
  const girosCalculados = useMemo(() => {
    const giros: GiroCalculado[] = [];
    let saldoAnterior = config.investimentoInicial;

    for (let i = 1; i <= config.numeroGiros; i++) {
      const giroData = girosData[i] || { aporte: 0, retirada: 0, roiGiro: 20 };
      
      const investimento = saldoAnterior + giroData.aporte;
      const roiDecimal = giroData.roiGiro / 100;
      const retorno = investimento * roiDecimal;
      const saldoBruto = investimento + retorno;
      const saldoFinal = saldoBruto - giroData.retirada;

      // Cálculo do tempo decorrido baseado na configuração
      let tempoDecorrido = 0;
      switch (config.unidadeTempo) {
        case 'Dias':
          tempoDecorrido = config.duracaoGiro * i;
          break;
        case 'Semanas':
          tempoDecorrido = config.duracaoGiro * i * 7;
          break;
        case 'Meses':
          tempoDecorrido = config.duracaoGiro * i * 30;
          break;
      }

      const giro: GiroCalculado = {
        numero: i,
        investimento,
        retorno,
        aporte: giroData.aporte,
        retirada: giroData.retirada,
        saldo: saldoFinal,
        roiGiro: giroData.roiGiro,
        tempoDecorrido
      };

      giros.push(giro);
      saldoAnterior = saldoFinal;
    }

    return giros;
  }, [config, girosData]);

  // Funções para atualizar dados de giros específicos
  const updateGiroData = (giroNum: number, field: 'aporte' | 'retirada' | 'roiGiro', value: number) => {
    setGirosData(prev => ({
      ...prev,
      [giroNum]: {
        ...prev[giroNum] || { aporte: 0, retirada: 0, roiGiro: 20 },
        [field]: value
      }
    }));
  };

  // Calcular totais
  const totais = useMemo(() => {
    const totalAportes = girosCalculados.reduce((sum, giro) => sum + giro.aporte, 0);
    const totalRetiradas = girosCalculados.reduce((sum, giro) => sum + giro.retirada, 0);
    const totalRetornos = girosCalculados.reduce((sum, giro) => sum + giro.retorno, 0);
    const saldoFinal = girosCalculados[girosCalculados.length - 1]?.saldo || 0;
    const totalInvestido = config.investimentoInicial + totalAportes;
    const ganhoLiquido = saldoFinal + totalRetiradas - totalInvestido;
    const roiTotal = totalInvestido > 0 ? (ganhoLiquido / totalInvestido) * 100 : 0;

    return {
      totalAportes,
      totalRetiradas,
      totalRetornos,
      saldoFinal,
      totalInvestido,
      ganhoLiquido,
      roiTotal
    };
  }, [girosCalculados, config.investimentoInicial]);

  // Função para salvar simulação
  const salvarSimulacao = () => {
    const simulation: Partial<InvestmentSimulation> = {
      name: simulationName,
      initialInvestment: config.investimentoInicial,
      cycleDuration: config.duracaoGiro,
      cycleUnit: config.unidadeTempo,
      numberOfCycles: config.numeroGiros,
      cycles: girosData
    };

    saveSimulationMutation.mutate(simulation);
  };

  // Função para carregar simulação
  const carregarSimulacao = (simulation: InvestmentSimulation) => {
    setConfig({
      investimentoInicial: simulation.initialInvestment,
      duracaoGiro: simulation.cycleDuration,
      unidadeTempo: simulation.cycleUnit as 'Dias' | 'Semanas' | 'Meses',
      numeroGiros: simulation.numberOfCycles,
    });
    setGirosData(simulation.cycles || {});
    setCurrentSimulationId(simulation.id || null);
    setSimulationName(simulation.name);
    
    toast({
      title: "Simulação carregada",
      description: `Simulação "${simulation.name}" carregada com sucesso!`
    });
  };

  // Função para exportar para CSV
  const exportarCSV = () => {
    const headers = ['Giro', 'Investimento', 'ROI%', 'Retorno', 'Aporte', 'Retirada', 'Saldo', 'Tempo (dias)'];
    const rows = girosCalculados.map(giro => [
      giro.numero,
      giro.investimento,
      giro.roiGiro,
      giro.retorno,
      giro.aporte,
      giro.retirada,
      giro.saldo,
      giro.tempoDecorrido
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `simulacao_investimentos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "CSV exportado",
      description: "Arquivo CSV baixado com sucesso!"
    });
  };

  // Função para exportar PDF
  const exportarPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(18);
      doc.text('Simulação de Investimentos e ROI', 20, 20);
      
      // Configurações
      doc.setFontSize(12);
      doc.text(`Nome: ${simulationName}`, 20, 35);
      doc.text(`Investimento Inicial: ${formatCurrency(config.investimentoInicial)}`, 20, 45);
      doc.text(`Duração por Giro: ${config.duracaoGiro} ${config.unidadeTempo.toLowerCase()}`, 20, 55);
      doc.text(`Número de Giros: ${config.numeroGiros}`, 20, 65);
      
      // Resumo
      doc.text('Resumo:', 20, 80);
      doc.text(`Total Investido: ${formatCurrency(totais.totalInvestido)}`, 30, 90);
      doc.text(`Saldo Final: ${formatCurrency(totais.saldoFinal)}`, 30, 100);
      doc.text(`Ganho Líquido: ${formatCurrency(totais.ganhoLiquido)}`, 30, 110);
      doc.text(`ROI Total: ${formatPercent(totais.roiTotal)}`, 30, 120);

      // Tabela de giros
      const tableColumns = ['Giro', 'Investimento', 'ROI%', 'Retorno', 'Aporte', 'Retirada', 'Saldo'];
      const tableRows = girosCalculados.map(giro => [
        giro.numero.toString(),
        formatCurrency(giro.investimento),
        formatPercent(giro.roiGiro),
        formatCurrency(giro.retorno),
        formatCurrency(giro.aporte),
        formatCurrency(giro.retirada),
        formatCurrency(giro.saldo)
      ]);

      (doc as any).autoTable({
        head: [tableColumns],
        body: tableRows,
        startY: 135,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      });

      doc.save(`simulacao_investimentos_${new Date().toISOString().split('T')[0]}.pdf`);
      
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
    setConfig({
      investimentoInicial: 10000,
      duracaoGiro: 45,
      unidadeTempo: 'Dias',
      numeroGiros: 12,
    });
    setGirosData({});
    setCurrentSimulationId(null);
    setSimulationName('Nova Simulação');
    localStorage.removeItem('investimentoConfig');
    localStorage.removeItem('investimentoGirosData');
    
    toast({
      title: "Simulação resetada",
      description: "Todos os dados foram limpos."
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Simulador de Investimentos e ROI</h1>
        <p className="text-gray-600">
          Simule seus investimentos com aportes, retiradas e ROI personalizáveis por giro
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Configurações - 1/4 do espaço */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nome da Simulação */}
              <div>
                <Label htmlFor="simulation-name">Nome da Simulação</Label>
                <Input
                  id="simulation-name"
                  value={simulationName}
                  onChange={(e) => setSimulationName(e.target.value)}
                  placeholder="Nome da simulação"
                />
              </div>

              {/* Carregar Simulação Existente */}
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

              <div>
                <Label htmlFor="investimento-inicial">Investimento Inicial</Label>
                <CurrencyInput
                  value={config.investimentoInicial}
                  onChange={(value) => setConfig(prev => ({ ...prev, investimentoInicial: value }))}
                  placeholder="R$ 10.000"
                />
              </div>

              <div>
                <Label htmlFor="duracao-giro">Duração do Giro</Label>
                <Input
                  id="duracao-giro"
                  type="number"
                  value={config.duracaoGiro}
                  onChange={(e) => setConfig(prev => ({ ...prev, duracaoGiro: parseInt(e.target.value) || 0 }))}
                  min="1"
                />
              </div>

              <div>
                <Label htmlFor="unidade-tempo">Unidade de Tempo</Label>
                <Select 
                  value={config.unidadeTempo} 
                  onValueChange={(value: 'Dias' | 'Semanas' | 'Meses') => 
                    setConfig(prev => ({ ...prev, unidadeTempo: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dias">Dias</SelectItem>
                    <SelectItem value="Semanas">Semanas</SelectItem>
                    <SelectItem value="Meses">Meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="numero-giros">Número de Giros</Label>
                <Input
                  id="numero-giros"
                  type="number"
                  value={config.numeroGiros}
                  onChange={(e) => setConfig(prev => ({ ...prev, numeroGiros: parseInt(e.target.value) || 0 }))}
                  min="1"
                  max="50"
                />
              </div>

              {/* Aplicação em Lote */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium text-sm">Aplicar em Lote</h4>
                
                <div className="space-y-2">
                  <Label>ROI % (todos os giros)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={bulkROI}
                      onChange={(e) => setBulkROI(parseFloat(e.target.value) || 0)}
                      placeholder="20"
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() => aplicarEmLote('roi')}
                      className="px-3"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Aporte (todos os giros)</Label>
                  <div className="flex gap-2">
                    <CurrencyInput
                      value={bulkAporte}
                      onChange={setBulkAporte}
                      placeholder="R$ 0"
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() => aplicarEmLote('aporte')}
                      className="px-3"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Retirada (todos os giros)</Label>
                  <div className="flex gap-2">
                    <CurrencyInput
                      value={bulkRetirada}
                      onChange={setBulkRetirada}
                      placeholder="R$ 0"
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() => aplicarEmLote('retirada')}
                      className="px-3"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="space-y-2 pt-4 border-t">
                <Button onClick={salvarSimulacao} className="w-full" disabled={saveSimulationMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {saveSimulationMutation.isPending ? 'Salvando...' : 'Salvar Simulação'}
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={exportarCSV} variant="outline" size="sm">
                    CSV
                  </Button>
                  <Button onClick={exportarPDF} variant="outline" size="sm">
                    <Download className="h-3 w-3 mr-1" />
                    PDF
                  </Button>
                </div>
                
                <Button onClick={resetarSimulacao} variant="destructive" size="sm" className="w-full">
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Resetar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Resultados - 3/4 do espaço */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Resultados da Simulação</CardTitle>
              <CardDescription>
                Tabela interativa com campos editáveis para ROI, Aporte e Retirada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-2 text-left">Giro</th>
                      <th className="border border-gray-300 p-2 text-left">Investimento</th>
                      <th className="border border-gray-300 p-2 text-left bg-blue-50">ROI %</th>
                      <th className="border border-gray-300 p-2 text-left">Retorno</th>
                      <th className="border border-gray-300 p-2 text-left bg-green-50">Aporte</th>
                      <th className="border border-gray-300 p-2 text-left bg-red-50">Retirada</th>
                      <th className="border border-gray-300 p-2 text-left">Saldo</th>
                      <th className="border border-gray-300 p-2 text-left">Tempo ({config.unidadeTempo === 'Dias' ? 'dias' : config.unidadeTempo === 'Semanas' ? 'semanas' : 'meses'})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {girosCalculados.map((giro) => (
                      <tr key={giro.numero} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-2 font-medium">{giro.numero}</td>
                        <td className="border border-gray-300 p-2">{formatCurrency(giro.investimento)}</td>
                        <td className="border border-gray-300 p-2 bg-blue-50">
                          <Input
                            type="number"
                            value={girosData[giro.numero]?.roiGiro || 20}
                            onChange={(e) => updateGiroData(giro.numero, 'roiGiro', parseFloat(e.target.value) || 0)}
                            className="w-16 text-center"
                            min="0"
                            step="0.1"
                          />
                        </td>
                        <td className="border border-gray-300 p-2 text-green-600 font-medium">{formatCurrency(giro.retorno)}</td>
                        <td className="border border-gray-300 p-2 bg-green-50">
                          <CurrencyInput
                            value={girosData[giro.numero]?.aporte || 0}
                            onChange={(value) => updateGiroData(giro.numero, 'aporte', value)}
                            className="w-24"
                          />
                        </td>
                        <td className="border border-gray-300 p-2 bg-red-50">
                          <CurrencyInput
                            value={girosData[giro.numero]?.retirada || 0}
                            onChange={(value) => updateGiroData(giro.numero, 'retirada', value)}
                            className="w-24"
                          />
                        </td>
                        <td className="border border-gray-300 p-2 font-bold text-blue-600">{formatCurrency(giro.saldo)}</td>
                        <td className="border border-gray-300 p-2">{giro.tempoDecorrido}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-bold">
                      <td className="border border-gray-300 p-2">TOTAIS</td>
                      <td className="border border-gray-300 p-2">{formatCurrency(totais.totalInvestido)}</td>
                      <td className="border border-gray-300 p-2 text-blue-600">{formatPercent(totais.roiTotal)}</td>
                      <td className="border border-gray-300 p-2 text-green-600">{formatCurrency(totais.totalRetornos)}</td>
                      <td className="border border-gray-300 p-2 text-green-600">{formatCurrency(totais.totalAportes)}</td>
                      <td className="border border-gray-300 p-2 text-red-600">{formatCurrency(totais.totalRetiradas)}</td>
                      <td className="border border-gray-300 p-2 text-blue-700">{formatCurrency(totais.saldoFinal)}</td>
                      <td className="border border-gray-300 p-2">-</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Resumo dos Totais */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900">Total Investido</h4>
                  <p className="text-2xl font-bold text-blue-700">{formatCurrency(totais.totalInvestido)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900">Saldo Final</h4>
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(totais.saldoFinal)}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900">Ganho Líquido</h4>
                  <p className="text-2xl font-bold text-purple-700">{formatCurrency(totais.ganhoLiquido)}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-medium text-orange-900">ROI Total</h4>
                  <p className="text-2xl font-bold text-orange-700">{formatPercent(totais.roiTotal)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}