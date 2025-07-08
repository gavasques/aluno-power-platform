import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Target, Download, RotateCcw, Calculator, DollarSign, Calendar, AlertTriangle, Info } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Interfaces
interface ConfiguracaoSimulacao {
  investimentoInicial: number;
  roiPorGiro: number;
  roiTipo: 'fixo' | 'variavel';
  duracaoGiro: number;
  unidadeTempo: 'dias' | 'semanas' | 'meses';
  numeroGiros: number;
  metaRetorno: number;
  tipoAporte: 'nenhum' | 'fixo' | 'percentual';
  valorAporte: number;
  percentualAporte: number;
}

interface GiroCalculado {
  numero: number;
  investimento: number;
  retorno: number;
  aporte: number;
  saldoAcumulado: number;
  roiAcumulado: number;
  tempoDecorrido: number;
  retiradaSustentavel: number;
  atingiuMeta: boolean;
}

interface IndicadoresGerais {
  totalInvestido: number;
  totalRetornado: number;
  roiFinal: number;
  tempoParaMeta: number;
  girosParaMeta: number;
  retiradaSustentavelFinal: number;
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

// Funções de cálculo
const calcularGirosNecessariosParaMeta = (
  investimentoInicial: number, 
  roiPorGiro: number, 
  tipoAporte: string,
  valorAporte: number,
  percentualAporte: number,
  metaRetorno: number
): number => {
  let investimento = investimentoInicial;
  let saldoAcumulado = investimentoInicial;
  let giros = 0;
  
  while (saldoAcumulado < metaRetorno && giros < 1000) {
    const retorno = investimento * (roiPorGiro / 100);
    
    let aporte = 0;
    if (tipoAporte === 'fixo') {
      aporte = valorAporte;
    } else if (tipoAporte === 'percentual') {
      aporte = retorno * (percentualAporte / 100);
    }
    
    investimento = investimento + retorno + aporte;
    saldoAcumulado = investimento;
    giros++;
    
    if (investimento <= 0) break;
  }
  
  return giros >= 1000 ? -1 : giros;
};

const calcularRetiradaSustentavel = (investimento: number, roiPorGiro: number): number => {
  return investimento * (roiPorGiro / 100);
};

export default function InvestimentosROI() {
  const { toast } = useToast();
  
  // Estado da configuração
  const [config, setConfig] = useState<ConfiguracaoSimulacao>({
    investimentoInicial: 10000,
    roiPorGiro: 10,
    roiTipo: 'fixo',
    duracaoGiro: 30,
    unidadeTempo: 'dias',
    numeroGiros: 12,
    metaRetorno: 50000,
    tipoAporte: 'nenhum',
    valorAporte: 0,
    percentualAporte: 0
  });

  // Salvar configuração no localStorage
  useEffect(() => {
    localStorage.setItem('investimentos-roi-config', JSON.stringify(config));
  }, [config]);

  // Carregar configuração do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('investimentos-roi-config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (error) {
        console.warn('Erro ao carregar configuração salva:', error);
      }
    }
  }, []);

  // Calcular giros com base na configuração
  const { giros, indicadores } = useMemo(() => {
    const girosCalculados: GiroCalculado[] = [];
    let investimentoAtual = config.investimentoInicial;
    let totalInvestido = config.investimentoInicial;
    let totalRetornado = 0;
    
    for (let i = 1; i <= config.numeroGiros; i++) {
      const retorno = investimentoAtual * (config.roiPorGiro / 100);
      
      let aporte = 0;
      if (config.tipoAporte === 'fixo') {
        aporte = config.valorAporte;
      } else if (config.tipoAporte === 'percentual') {
        aporte = retorno * (config.percentualAporte / 100);
      }
      
      const saldoAcumulado = investimentoAtual + retorno + aporte;
      totalRetornado += retorno;
      totalInvestido += aporte;
      
      const roiAcumulado = totalInvestido > 0 ? (totalRetornado / totalInvestido) * 100 : 0;
      const tempoDecorrido = i * config.duracaoGiro;
      const retiradaSustentavel = calcularRetiradaSustentavel(saldoAcumulado, config.roiPorGiro);
      const atingiuMeta = saldoAcumulado >= config.metaRetorno;
      
      girosCalculados.push({
        numero: i,
        investimento: investimentoAtual,
        retorno,
        aporte,
        saldoAcumulado,
        roiAcumulado,
        tempoDecorrido,
        retiradaSustentavel,
        atingiuMeta
      });
      
      investimentoAtual = saldoAcumulado;
    }
    
    const girosParaMeta = calcularGirosNecessariosParaMeta(
      config.investimentoInicial,
      config.roiPorGiro,
      config.tipoAporte,
      config.valorAporte,
      config.percentualAporte,
      config.metaRetorno
    );
    
    const indicadoresGerais: IndicadoresGerais = {
      totalInvestido,
      totalRetornado,
      roiFinal: totalInvestido > 0 ? (totalRetornado / totalInvestido) * 100 : 0,
      tempoParaMeta: girosParaMeta > 0 ? girosParaMeta * config.duracaoGiro : -1,
      girosParaMeta,
      retiradaSustentavelFinal: girosCalculados.length > 0 ? girosCalculados[girosCalculados.length - 1].retiradaSustentavel : 0
    };
    
    return { giros: girosCalculados, indicadores: indicadoresGerais };
  }, [config]);

  // Atualizar configuração
  const updateConfig = (key: keyof ConfiguracaoSimulacao, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // Resetar configuração
  const resetConfig = () => {
    setConfig({
      investimentoInicial: 10000,
      roiPorGiro: 10,
      roiTipo: 'fixo',
      duracaoGiro: 30,
      unidadeTempo: 'dias',
      numeroGiros: 12,
      metaRetorno: 50000,
      tipoAporte: 'nenhum',
      valorAporte: 0,
      percentualAporte: 0
    });
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
      'Saldo Acumulado',
      'ROI Acumulado (%)',
      'Tempo Decorrido',
      'Retirada Sustentável',
      'Atingiu Meta'
    ];
    
    const rows = giros.map(giro => [
      giro.numero,
      giro.investimento.toFixed(2),
      giro.retorno.toFixed(2),
      giro.aporte.toFixed(2),
      giro.saldoAcumulado.toFixed(2),
      giro.roiAcumulado.toFixed(2),
      giro.tempoDecorrido,
      giro.retiradaSustentavel.toFixed(2),
      giro.atingiuMeta ? 'Sim' : 'Não'
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

  // Dados para gráficos
  const dadosGraficos = giros.map(giro => ({
    giro: giro.numero,
    saldoAcumulado: giro.saldoAcumulado,
    investimento: giro.investimento,
    retorno: giro.retorno,
    meta: config.metaRetorno,
    roiAcumulado: giro.roiAcumulado
  }));

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Configuração */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
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

              {/* Meta de Retorno */}
              <div>
                <Label htmlFor="metaRetorno">Meta de Retorno</Label>
                <Input
                  id="metaRetorno"
                  type="number"
                  value={config.metaRetorno}
                  onChange={(e) => updateConfig('metaRetorno', Number(e.target.value))}
                  min="0"
                  step="1000"
                />
              </div>

              {/* Tipo de Aporte */}
              <div>
                <Label htmlFor="tipoAporte">Aportes/Retiradas</Label>
                <Select value={config.tipoAporte} onValueChange={(value) => updateConfig('tipoAporte', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Nenhum</SelectItem>
                    <SelectItem value="fixo">Valor Fixo</SelectItem>
                    <SelectItem value="percentual">% do Retorno</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Valor do Aporte */}
              {config.tipoAporte === 'fixo' && (
                <div>
                  <Label htmlFor="valorAporte">Valor do Aporte</Label>
                  <Input
                    id="valorAporte"
                    type="number"
                    value={config.valorAporte}
                    onChange={(e) => updateConfig('valorAporte', Number(e.target.value))}
                    step="100"
                  />
                </div>
              )}

              {config.tipoAporte === 'percentual' && (
                <div>
                  <Label htmlFor="percentualAporte">Percentual do Retorno (%)</Label>
                  <Input
                    id="percentualAporte"
                    type="number"
                    value={config.percentualAporte}
                    onChange={(e) => updateConfig('percentualAporte', Number(e.target.value))}
                    min="0"
                    max="100"
                    step="1"
                  />
                </div>
              )}

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

        {/* Painel Principal */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="indicadores" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
              <TabsTrigger value="evolucao">Evolução</TabsTrigger>
              <TabsTrigger value="tabela">Tabela</TabsTrigger>
              <TabsTrigger value="cenarios">Cenários</TabsTrigger>
            </TabsList>

            {/* Aba Indicadores */}
            <TabsContent value="indicadores" className="space-y-4">
              {/* Cards de Métricas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">ROI Final</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatPercent(indicadores.roiFinal)}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Capital Final</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(giros[giros.length - 1]?.saldoAcumulado || 0)}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Giros p/ Meta</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {indicadores.girosParaMeta > 0 ? indicadores.girosParaMeta : 'N/A'}
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Tempo p/ Meta</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {indicadores.tempoParaMeta > 0 ? `${indicadores.tempoParaMeta} ${config.unidadeTempo}` : 'N/A'}
                        </p>
                      </div>
                      <Calendar className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Resumo Financeiro */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumo Financeiro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Investido</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(indicadores.totalInvestido)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Retornado</p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatCurrency(indicadores.totalRetornado)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Retirada Sustentável</p>
                      <p className="text-xl font-bold text-purple-600">
                        {formatCurrency(indicadores.retiradaSustentavelFinal)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alertas */}
              {indicadores.girosParaMeta > config.numeroGiros && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Para atingir sua meta de {formatCurrency(config.metaRetorno)}, você precisará de {indicadores.girosParaMeta} giros, 
                    mas a simulação atual mostra apenas {config.numeroGiros} giros.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* Aba Evolução */}
            <TabsContent value="evolucao" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Evolução do Capital</CardTitle>
                  <CardDescription>
                    Acompanhe o crescimento do capital ao longo dos giros
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dadosGraficos}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="giro" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip 
                        formatter={(value: number, name: string) => [formatCurrency(value), name]}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="saldoAcumulado" 
                        stroke="#2563eb" 
                        strokeWidth={3}
                        name="Capital Acumulado"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="meta" 
                        stroke="#dc2626" 
                        strokeDasharray="5 5"
                        name="Meta de Retorno"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Composição do Capital</CardTitle>
                  <CardDescription>
                    Veja a proporção entre investimento inicial, aportes e retornos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dadosGraficos}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="giro" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip 
                        formatter={(value: number, name: string) => [formatCurrency(value), name]}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="investimento" 
                        stackId="1" 
                        stroke="#8884d8" 
                        fill="#8884d8"
                        name="Investimento"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="retorno" 
                        stackId="1" 
                        stroke="#82ca9d" 
                        fill="#82ca9d"
                        name="Retorno"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Tabela */}
            <TabsContent value="tabela">
              <Card>
                <CardHeader>
                  <CardTitle>Detalhamento por Giro</CardTitle>
                  <CardDescription>
                    Análise detalhada de cada giro da simulação
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
                          <th className="text-right p-2">Saldo</th>
                          <th className="text-right p-2">ROI Acum.</th>
                          <th className="text-right p-2">Tempo</th>
                          <th className="text-center p-2">Meta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {giros.map((giro) => (
                          <tr key={giro.numero} className={`border-b ${giro.atingiuMeta ? 'bg-green-50' : ''}`}>
                            <td className="p-2 font-medium">{giro.numero}</td>
                            <td className="p-2 text-right">{formatCurrency(giro.investimento)}</td>
                            <td className="p-2 text-right text-green-600">{formatCurrency(giro.retorno)}</td>
                            <td className="p-2 text-right text-blue-600">{formatCurrency(giro.aporte)}</td>
                            <td className="p-2 text-right font-semibold">{formatCurrency(giro.saldoAcumulado)}</td>
                            <td className="p-2 text-right">{formatPercent(giro.roiAcumulado)}</td>
                            <td className="p-2 text-right">{giro.tempoDecorrido} {config.unidadeTempo}</td>
                            <td className="p-2 text-center">
                              {giro.atingiuMeta && (
                                <Badge variant="default" className="bg-green-600">
                                  ✓
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Cenários */}
            <TabsContent value="cenarios">
              <Card>
                <CardHeader>
                  <CardTitle>Análise de Cenários</CardTitle>
                  <CardDescription>
                    Compare diferentes cenários de ROI (Otimista, Realista, Pessimista)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Cenários:</strong> Otimista (+30%), Realista (configurado), Pessimista (-30%)
                      </AlertDescription>
                    </Alert>
                    
                    {/* Implementação de cenários seria adicionada aqui */}
                    <div className="text-center text-muted-foreground py-8">
                      Análise de cenários em desenvolvimento...
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}