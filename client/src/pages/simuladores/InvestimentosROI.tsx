import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Download, RotateCcw } from 'lucide-react';

// Interfaces
interface ConfiguracaoSimulacao {
  investimentoInicial: number;
  roiPorGiro: number;
  duracaoGiro: number;
  unidadeTempo: 'dias' | 'semanas' | 'meses';
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

// Funções de formatação
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
};

const formatPercent = (value: number): string => {
  return `${(value || 0).toFixed(2)}%`;
};

export default function InvestimentosROI() {
  const { toast } = useToast();
  
  // Estado da configuração
  const [config, setConfig] = useState<ConfiguracaoSimulacao>({
    investimentoInicial: 10000,
    roiPorGiro: 10,
    duracaoGiro: 45,
    unidadeTempo: 'dias',
    numeroGiros: 12
  });

  // Estado para aportes e retiradas editáveis
  const [aportes, setAportes] = useState<number[]>(Array(12).fill(0));
  const [retiradas, setRetiradas] = useState<number[]>(Array(12).fill(0));

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem('investimentos-roi-config', JSON.stringify(config));
    localStorage.setItem('investimentos-roi-aportes', JSON.stringify(aportes));
    localStorage.setItem('investimentos-roi-retiradas', JSON.stringify(retiradas));
  }, [config, aportes, retiradas]);

  // Carregar do localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('investimentos-roi-config');
    const savedAportes = localStorage.getItem('investimentos-roi-aportes');
    const savedRetiradas = localStorage.getItem('investimentos-roi-retiradas');
    
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.warn('Erro ao carregar configuração salva:', error);
      }
    }
    
    if (savedAportes) {
      try {
        setAportes(JSON.parse(savedAportes));
      } catch (error) {
        console.warn('Erro ao carregar aportes salvos:', error);
      }
    }
    
    if (savedRetiradas) {
      try {
        setRetiradas(JSON.parse(savedRetiradas));
      } catch (error) {
        console.warn('Erro ao carregar retiradas salvas:', error);
      }
    }
  }, []);

  // Ajustar arrays quando número de giros mudar
  useEffect(() => {
    if (aportes.length !== config.numeroGiros) {
      setAportes(prev => {
        const newAportes = [...prev];
        while (newAportes.length < config.numeroGiros) {
          newAportes.push(0);
        }
        return newAportes.slice(0, config.numeroGiros);
      });
    }
    
    if (retiradas.length !== config.numeroGiros) {
      setRetiradas(prev => {
        const newRetiradas = [...prev];
        while (newRetiradas.length < config.numeroGiros) {
          newRetiradas.push(0);
        }
        return newRetiradas.slice(0, config.numeroGiros);
      });
    }
  }, [config.numeroGiros, aportes.length, retiradas.length]);

  // Calcular giros com base na configuração
  const giros = useMemo(() => {
    const girosCalculados: GiroCalculado[] = [];
    let investimentoAtual = config.investimentoInicial;
    
    for (let i = 1; i <= config.numeroGiros; i++) {
      const retorno = investimentoAtual * (config.roiPorGiro / 100);
      const aporte = aportes[i - 1] || 0;
      const retirada = retiradas[i - 1] || 0;
      
      const saldo = investimentoAtual + retorno + aporte - retirada;
      const roiGiro = investimentoAtual > 0 ? (retorno / investimentoAtual) * 100 : 0;
      const tempoDecorrido = i * config.duracaoGiro;
      
      girosCalculados.push({
        numero: i,
        investimento: investimentoAtual,
        retorno,
        aporte,
        retirada,
        saldo,
        roiGiro,
        tempoDecorrido
      });
      
      investimentoAtual = saldo;
    }
    
    return girosCalculados;
  }, [config, aportes, retiradas]);

  // Atualizar configuração
  const updateConfig = (key: keyof ConfiguracaoSimulacao, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // Atualizar aporte
  const updateAporte = (index: number, value: number) => {
    setAportes(prev => {
      const newAportes = [...prev];
      newAportes[index] = value;
      return newAportes;
    });
  };

  // Atualizar retirada
  const updateRetirada = (index: number, value: number) => {
    setRetiradas(prev => {
      const newRetiradas = [...prev];
      newRetiradas[index] = value;
      return newRetiradas;
    });
  };

  // Resetar configuração
  const resetConfig = () => {
    setConfig({
      investimentoInicial: 10000,
      roiPorGiro: 10,
      duracaoGiro: 45,
      unidadeTempo: 'dias',
      numeroGiros: 12
    });
    setAportes(Array(12).fill(0));
    setRetiradas(Array(12).fill(0));
    toast({
      title: "Configuração resetada",
      description: "Todos os valores foram restaurados para o padrão"
    });
  };

  // Exportar para CSV
  const exportarCSV = () => {
    const headers = [
      'Giro',
      'Investimento',
      'Retorno',
      'Aporte',
      'Retirada',
      'Saldo',
      'ROI do Giro (%)',
      'Tempo (' + config.unidadeTempo + ')'
    ];
    
    const rows = giros.map(giro => [
      giro.numero,
      giro.investimento.toFixed(2),
      giro.retorno.toFixed(2),
      giro.aporte.toFixed(2),
      giro.retirada.toFixed(2),
      giro.saldo.toFixed(2),
      giro.roiGiro.toFixed(2),
      giro.tempoDecorrido
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'simulacao-investimentos-roi.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Exportação concluída",
      description: "Arquivo CSV baixado com sucesso"
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Calculator className="h-8 w-8 text-blue-600" />
          Simulador de Investimentos e ROI
        </h1>
        <p className="text-muted-foreground">
          Calcule o crescimento de capital através de giros de investimento e visualize o tempo para atingir suas metas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Painel de Configuração */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Configuração
              </CardTitle>
              <CardDescription>
                Defina os parâmetros da simulação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Investimento Inicial */}
              <div>
                <Label htmlFor="investimentoInicial">Investimento Inicial</Label>
                <Input
                  id="investimentoInicial"
                  type="number"
                  value={config.investimentoInicial}
                  onChange={(e) => updateConfig('investimentoInicial', Number(e.target.value))}
                  min="0"
                  step="1000"
                />
              </div>

              {/* ROI por Giro */}
              <div>
                <Label htmlFor="roiPorGiro">ROI por Giro (%)</Label>
                <Input
                  id="roiPorGiro"
                  type="number"
                  value={config.roiPorGiro}
                  onChange={(e) => updateConfig('roiPorGiro', Number(e.target.value))}
                  min="0"
                  step="0.1"
                />
              </div>

              {/* Duração do Giro */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="duracaoGiro">Duração do Giro</Label>
                  <Input
                    id="duracaoGiro"
                    type="number"
                    value={config.duracaoGiro}
                    onChange={(e) => updateConfig('duracaoGiro', Number(e.target.value))}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="unidadeTempo">Unidade</Label>
                  <Select value={config.unidadeTempo} onValueChange={(value) => updateConfig('unidadeTempo', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dias">Dias</SelectItem>
                      <SelectItem value="semanas">Semanas</SelectItem>
                      <SelectItem value="meses">Meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Número de Giros */}
              <div>
                <Label htmlFor="numeroGiros">Número de Giros</Label>
                <Input
                  id="numeroGiros"
                  type="number"
                  value={config.numeroGiros}
                  onChange={(e) => updateConfig('numeroGiros', Number(e.target.value))}
                  min="1"
                  max="100"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={resetConfig} variant="outline" size="sm" className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Resetar
                </Button>
                <Button onClick={exportarCSV} variant="outline" size="sm" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela Principal */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento por Giro</CardTitle>
              <CardDescription>
                Análise detalhada de cada giro da simulação - campos editáveis: Aporte e Retirada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Giro</th>
                      <th className="text-right p-2">Investimento</th>
                      <th className="text-right p-2">Retorno</th>
                      <th className="text-right p-2">Aporte</th>
                      <th className="text-right p-2">Retirada</th>
                      <th className="text-right p-2">Saldo</th>
                      <th className="text-right p-2">ROI</th>
                      <th className="text-right p-2">Tempo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {giros.map((giro, index) => (
                      <tr key={giro.numero} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{giro.numero}</td>
                        <td className="p-2 text-right">{formatCurrency(giro.investimento)}</td>
                        <td className="p-2 text-right text-green-600 font-medium">{formatCurrency(giro.retorno)}</td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={giro.aporte}
                            onChange={(e) => updateAporte(index, Number(e.target.value) || 0)}
                            className="w-24 h-8 text-right text-xs"
                            min="0"
                            step="100"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={giro.retirada}
                            onChange={(e) => updateRetirada(index, Number(e.target.value) || 0)}
                            className="w-24 h-8 text-right text-xs"
                            min="0"
                            step="100"
                          />
                        </td>
                        <td className="p-2 text-right font-semibold text-blue-600">{formatCurrency(giro.saldo)}</td>
                        <td className="p-2 text-right">{formatPercent(giro.roiGiro)}</td>
                        <td className="p-2 text-right">{giro.tempoDecorrido}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Resumo na parte inferior */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Capital Final</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(giros[giros.length - 1]?.saldo || 0)}
                  </p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Aportes</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(aportes.reduce((sum, aporte) => sum + aporte, 0))}
                  </p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Retiradas</p>
                  <p className="text-lg font-bold text-red-600">
                    {formatCurrency(retiradas.reduce((sum, retirada) => sum + retirada, 0))}
                  </p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Tempo Total</p>
                  <p className="text-lg font-bold text-purple-600">
                    {config.numeroGiros * config.duracaoGiro} {config.unidadeTempo}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}