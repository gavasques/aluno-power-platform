import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Download, Trash2, AlertTriangle, FileDown, Save, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Formatação brasileira de moeda
const formatCurrency = (value: number): string => {
  return `R$ ${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const formatPercentage = (value: number): string => {
  return `${(value * 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}%`;
};

// Interfaces
interface MesSimulacao {
  id: string;
  mesAno: string;
  faturamentoSemST: number;
  faturamentoComST: number;
  anexo: 'Anexo I' | 'Anexo II';
  // Campos calculados
  faturamentoTotal: number;
  faturamentoAcumulado12Meses: number;
  rbt12: number;
  media12Meses: number;
  disponivelMedia: number;
  disponivelAnual: number;
  aliquotaEfetiva: number;
  percentualICMS: number;
  valorSemST: number;
  valorComST: number;
  valorTotal: number;
}

// Tabelas de alíquotas - Anexo I (Comércio)
const ANEXO_I_FAIXAS = [
  { apartir: 0, aliquotaNominal: 0.04, valorDeduzir: 0, percentualICMS: 0.34 },
  { apartir: 180000, aliquotaNominal: 0.073, valorDeduzir: 5940, percentualICMS: 0.34 },
  { apartir: 360000, aliquotaNominal: 0.095, valorDeduzir: 13830, percentualICMS: 0.335 },
  { apartir: 720000, aliquotaNominal: 0.107, valorDeduzir: 22500, percentualICMS: 0.335 },
  { apartir: 1800000, aliquotaNominal: 0.143, valorDeduzir: 87300, percentualICMS: 0.335 }
];

// Tabelas de alíquotas - Anexo II (Indústria)
const ANEXO_II_FAIXAS = [
  { apartir: 0, aliquotaNominal: 0.045, valorDeduzir: 0, percentualICMS: 0.34 },
  { apartir: 180000, aliquotaNominal: 0.078, valorDeduzir: 5940, percentualICMS: 0.34 },
  { apartir: 360000, aliquotaNominal: 0.10, valorDeduzir: 13830, percentualICMS: 0.335 },
  { apartir: 720000, aliquotaNominal: 0.112, valorDeduzir: 22500, percentualICMS: 0.335 },
  { apartir: 1800000, aliquotaNominal: 0.147, valorDeduzir: 85500, percentualICMS: 0.335 }
];

// Funções auxiliares para buscar valores nas tabelas
const buscarFaixaAnexo = (rbt12: number, anexo: 'Anexo I' | 'Anexo II') => {
  const tabela = anexo === 'Anexo I' ? ANEXO_I_FAIXAS : ANEXO_II_FAIXAS;
  
  for (let i = tabela.length - 1; i >= 0; i--) {
    if (rbt12 >= tabela[i].apartir) {
      return tabela[i];
    }
  }
  
  return tabela[0];
};

// Função para calcular a soma dos últimos 12 meses (mês atual + 11 anteriores)
const calcularSomaUltimos12Meses = (meses: MesSimulacao[], indiceAtual: number): number => {
  // Se temos menos de 12 meses, somar todos desde o início até o mês atual (incluindo)
  if (indiceAtual < 11) {
    const somaParcial = meses.slice(0, indiceAtual + 1)
      .reduce((soma, mes) => soma + (mes.faturamentoTotal || 0), 0);
    console.log(`RBT12 parcial (${indiceAtual + 1} meses):`, formatCurrency(somaParcial));
    return somaParcial;
  }
  
  // Se temos 12 ou mais meses, pegar os últimos 12 meses (índices de indiceAtual-11 até indiceAtual)
  const inicio = indiceAtual - 11;
  const fim = indiceAtual + 1;
  const mesesPara12 = meses.slice(inicio, fim);
  
  const soma12Meses = mesesPara12.reduce((soma, mes) => soma + (mes.faturamentoTotal || 0), 0);
  console.log(`RBT12 completo (12 meses do índice ${inicio} ao ${indiceAtual}):`, formatCurrency(soma12Meses));
  
  return soma12Meses;
};

// Função para calcular a média dos últimos 12 meses
const calcularMediaUltimos12Meses = (meses: MesSimulacao[], indiceAtual: number): number => {
  if (indiceAtual < 11) {
    const mesesDisponiveis = meses.slice(0, indiceAtual + 1);
    return mesesDisponiveis.reduce((soma, mes) => soma + (mes.faturamentoTotal || 0), 0) / mesesDisponiveis.length;
  }
  
  const ultimos12Meses = meses.slice(indiceAtual - 11, indiceAtual + 1);
  return ultimos12Meses.reduce((soma, mes) => soma + (mes.faturamentoTotal || 0), 0) / 12;
};

// Função auxiliar para debug - vamos adicionar logs para verificar os cálculos
const debugCalculos = (meses: any[], indice: number, rbt12: number) => {
  console.log(`=== DEBUG MÊS ${indice + 1} ===`);
  console.log(`Mês atual: ${meses[indice]?.mesAno} - Fat. Total: ${formatCurrency(meses[indice]?.faturamentoTotal || 0)}`);
  
  const inicio = Math.max(0, indice - 11);
  const fim = indice + 1;
  console.log(`Calculando RBT12 do índice ${inicio} ao ${fim - 1} (${fim - inicio} meses)`);
  
  for (let i = inicio; i < fim; i++) {
    if (meses[i]) {
      console.log(`  ${i}: ${meses[i].mesAno} = ${formatCurrency(meses[i].faturamentoTotal)}`);
    }
  }
  
  console.log(`RBT12 Total: ${formatCurrency(rbt12)}`);
  console.log(`========================`);
};

export default function SimplesNacionalCompleto() {
  const { toast } = useToast();
  
  // Estados
  const [meses, setMeses] = useState<MesSimulacao[]>([]);
  const [novoMes, setNovoMes] = useState({
    mesAno: '',
    faturamentoSemST: 0,
    faturamentoComST: 0,
    anexo: 'Anexo I' as 'Anexo I' | 'Anexo II'
  });

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const dadosSalvos = localStorage.getItem('simplesnacional-completo-dados');
    if (dadosSalvos) {
      try {
        const dados = JSON.parse(dadosSalvos);
        setMeses(dados);
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
      }
    }
  }, []);

  // Salvar dados no localStorage sempre que meses mudarem
  useEffect(() => {
    if (meses.length > 0) {
      localStorage.setItem('simplesnacional-completo-dados', JSON.stringify(meses));
    }
  }, [meses]);

  // Recalcular todos os meses quando algum for alterado
  const mesesCalculados = useMemo(() => {
    // Primeiro, atualizar apenas os faturamentos totais
    const mesesComFaturamentoTotal = meses.map(mes => ({
      ...mes,
      faturamentoTotal: mes.faturamentoSemST + mes.faturamentoComST
    }));
    
    // Depois, calcular todos os campos derivados com base nos faturamentos atualizados
    return mesesComFaturamentoTotal.map((mes, index) => {
      // Usar mesesComFaturamentoTotal para os cálculos de soma
      const faturamentoAcumulado12Meses = calcularSomaUltimos12Meses(mesesComFaturamentoTotal, index);
      const rbt12 = faturamentoAcumulado12Meses;
      
      // Debug: verificar se o cálculo está correto
      if (index === mesesComFaturamentoTotal.length - 1) {
        debugCalculos(mesesComFaturamentoTotal, index, rbt12);
      }
      const media12Meses = calcularMediaUltimos12Meses(mesesComFaturamentoTotal, index);
      
      const disponivelMedia = 300000 - media12Meses;
      const disponivelAnual = 3600000 - rbt12;
      
      const faixa = buscarFaixaAnexo(rbt12, mes.anexo);
      
      // Fórmula correta da alíquota efetiva do Simples Nacional
      // Alíquota Efetiva = (RBT12 x Alíquota Nominal – Valor a Deduzir) / RBT12
      const aliquotaEfetiva = rbt12 > 0 ? ((rbt12 * faixa.aliquotaNominal) - faixa.valorDeduzir) / rbt12 : 0;
      
      // Debug: verificar cálculo da alíquota efetiva
      if (index === mesesComFaturamentoTotal.length - 1) {
        console.log(`Anexo: ${mes.anexo}`);
        console.log(`RBT12: ${formatCurrency(rbt12)}`);
        console.log(`Alíquota Nominal: ${(faixa.aliquotaNominal * 100).toFixed(2)}%`);
        console.log(`Valor a Deduzir: ${formatCurrency(faixa.valorDeduzir)}`);
        console.log(`Cálculo: (${formatCurrency(rbt12)} × ${(faixa.aliquotaNominal * 100).toFixed(2)}% - ${formatCurrency(faixa.valorDeduzir)}) ÷ ${formatCurrency(rbt12)}`);
        console.log(`Alíquota Efetiva: ${(aliquotaEfetiva * 100).toFixed(4)}%`);
      }
      const percentualICMS = faixa.percentualICMS;
      
      const valorSemST = mes.faturamentoSemST * aliquotaEfetiva;
      const valorComST = mes.faturamentoComST * aliquotaEfetiva * (1 - percentualICMS);
      const valorTotal = valorSemST + valorComST;
      
      return {
        ...mes,
        faturamentoTotal: mes.faturamentoTotal,
        faturamentoAcumulado12Meses,
        rbt12,
        media12Meses,
        disponivelMedia,
        disponivelAnual,
        aliquotaEfetiva,
        percentualICMS,
        valorSemST,
        valorComST,
        valorTotal
      };
    });
  }, [meses]);

  // Adicionar novo mês
  const adicionarMes = () => {
    if (!novoMes.mesAno.match(/^\d{2}\/\d{4}$/)) {
      toast({
        title: "Formato inválido",
        description: "Use o formato MM/AAAA para o mês/ano",
        variant: "destructive"
      });
      return;
    }

    if (novoMes.faturamentoSemST < 0 || novoMes.faturamentoComST < 0) {
      toast({
        title: "Valores inválidos",
        description: "Os valores de faturamento devem ser positivos",
        variant: "destructive"
      });
      return;
    }

    const novoMesCompleto: MesSimulacao = {
      id: Date.now().toString(),
      ...novoMes,
      faturamentoTotal: 0,
      faturamentoAcumulado12Meses: 0,
      rbt12: 0,
      media12Meses: 0,
      disponivelMedia: 0,
      disponivelAnual: 0,
      aliquotaEfetiva: 0,
      percentualICMS: 0,
      valorSemST: 0,
      valorComST: 0,
      valorTotal: 0
    };

    setMeses([...meses, novoMesCompleto]);
    
    // Limpar formulário
    setNovoMes({
      mesAno: '',
      faturamentoSemST: 0,
      faturamentoComST: 0,
      anexo: 'Anexo I'
    });

    toast({
      title: "Mês adicionado",
      description: "O mês foi adicionado com sucesso à simulação"
    });
  };

  // Remover mês
  const removerMes = (id: string) => {
    setMeses(meses.filter(mes => mes.id !== id));
    toast({
      title: "Mês removido",
      description: "O mês foi removido da simulação"
    });
  };

  // Limpar todos os dados
  const limparTodos = () => {
    setMeses([]);
    localStorage.removeItem('simplesnacional-completo-dados');
    toast({
      title: "Dados limpos",
      description: "Todos os dados foram removidos"
    });
  };

  // Exportar para CSV
  const exportarCSV = () => {
    if (mesesCalculados.length === 0) {
      toast({
        title: "Nenhum dado",
        description: "Adicione pelo menos um mês para exportar",
        variant: "destructive"
      });
      return;
    }

    const headers = [
      "Mês/Ano", "Fat. sem ST", "Fat. com ST", "Anexo", "Fat. Total", 
      "Acum. 12 meses", "RBT12", "Média 12 meses", "Disp. Média", "Disp. Anual",
      "Alíq. Efetiva", "% ICMS", "Valor sem ST", "Valor com ST", "Valor Total"
    ];

    const rows = mesesCalculados.map(mes => [
      mes.mesAno,
      formatCurrency(mes.faturamentoSemST),
      formatCurrency(mes.faturamentoComST),
      mes.anexo,
      formatCurrency(mes.faturamentoTotal),
      formatCurrency(mes.faturamentoAcumulado12Meses),
      formatCurrency(mes.rbt12),
      formatCurrency(mes.media12Meses),
      formatCurrency(mes.disponivelMedia),
      formatCurrency(mes.disponivelAnual),
      formatPercentage(mes.aliquotaEfetiva),
      formatPercentage(mes.percentualICMS),
      formatCurrency(mes.valorSemST),
      formatCurrency(mes.valorComST),
      formatCurrency(mes.valorTotal)
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `simples-nacional-completo-${Date.now()}.csv`;
    link.click();

    toast({
      title: "Arquivo exportado",
      description: "O arquivo CSV foi baixado com sucesso"
    });
  };

  // Calcular resumos
  const resumo = useMemo(() => {
    if (mesesCalculados.length === 0) return null;

    const ultimoMes = mesesCalculados[mesesCalculados.length - 1];
    const totalImpostos = mesesCalculados.reduce((total, mes) => total + mes.valorTotal, 0);
    const totalFaturamento = mesesCalculados.reduce((total, mes) => total + mes.faturamentoTotal, 0);
    const aliquotaMedia = totalFaturamento > 0 ? totalImpostos / totalFaturamento : 0;

    return {
      totalMeses: mesesCalculados.length,
      ultimoRBT12: ultimoMes.rbt12,
      ultimaMedia: ultimoMes.media12Meses,
      totalImpostos,
      totalFaturamento,
      aliquotaMedia,
      disponivelAnual: ultimoMes.disponivelAnual,
      disponivelMedia: ultimoMes.disponivelMedia
    };
  }, [mesesCalculados]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Simulador Simples Nacional Completo</h1>
        <p className="text-muted-foreground">
          Simulador avançado com distinção entre faturamento com e sem ST
        </p>
      </div>

      {/* Aviso legal */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Aviso:</strong> Este simulador é apenas para fins de estimativa. 
          Consulte sempre um contador para valores oficiais e orientações específicas.
        </AlertDescription>
      </Alert>

      {/* Formulário para adicionar novo mês */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Novo Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="mesAno">Mês/Ano</Label>
              <Input
                id="mesAno"
                placeholder="01/2025"
                value={novoMes.mesAno}
                onChange={(e) => setNovoMes({ ...novoMes, mesAno: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="fatSemST">Faturamento sem ST</Label>
              <Input
                id="fatSemST"
                type="number"
                placeholder="0"
                value={novoMes.faturamentoSemST || ''}
                onChange={(e) => setNovoMes({ ...novoMes, faturamentoSemST: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="fatComST">Faturamento com ST</Label>
              <Input
                id="fatComST"
                type="number"
                placeholder="0"
                value={novoMes.faturamentoComST || ''}
                onChange={(e) => setNovoMes({ ...novoMes, faturamentoComST: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="anexo">Anexo</Label>
              <Select value={novoMes.anexo} onValueChange={(value: 'Anexo I' | 'Anexo II') => setNovoMes({ ...novoMes, anexo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Anexo I">Anexo I (Comércio)</SelectItem>
                  <SelectItem value="Anexo II">Anexo II (Indústria)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={adicionarMes} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      {resumo && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo da Simulação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {resumo.totalMeses}
                </div>
                <div className="text-sm text-muted-foreground">Meses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(resumo.ultimoRBT12)}
                </div>
                <div className="text-sm text-muted-foreground">RBT12 Atual</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(resumo.totalImpostos)}
                </div>
                <div className="text-sm text-muted-foreground">Total Impostos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatPercentage(resumo.aliquotaMedia)}
                </div>
                <div className="text-sm text-muted-foreground">Alíquota Média</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <div className={`text-xl font-bold ${resumo.disponivelAnual > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(resumo.disponivelAnual)}
                </div>
                <div className="text-sm text-muted-foreground">Disponível Anual</div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold ${resumo.disponivelMedia > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(resumo.disponivelMedia)}
                </div>
                <div className="text-sm text-muted-foreground">Disponível Média</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de meses */}
      {mesesCalculados.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Meses Adicionados</CardTitle>
              <div className="flex gap-2">
                <Button onClick={exportarCSV} variant="outline" size="sm">
                  <FileDown className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
                <Button onClick={limparTodos} variant="outline" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar Tudo
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Mês/Ano</th>
                    <th className="text-right p-2">Fat. sem ST</th>
                    <th className="text-right p-2">Fat. com ST</th>
                    <th className="text-center p-2">Anexo</th>
                    <th className="text-right p-2">Fat. Total</th>
                    <th className="text-right p-2">RBT12</th>
                    <th className="text-right p-2">Alíq. Efetiva</th>
                    <th className="text-right p-2">% ICMS</th>
                    <th className="text-right p-2">Valor sem ST</th>
                    <th className="text-right p-2">Valor com ST</th>
                    <th className="text-right p-2 font-bold">Valor Total</th>
                    <th className="text-center p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {mesesCalculados.map((mes) => (
                    <tr key={mes.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{mes.mesAno}</td>
                      <td className="p-2 text-right">{formatCurrency(mes.faturamentoSemST)}</td>
                      <td className="p-2 text-right">{formatCurrency(mes.faturamentoComST)}</td>
                      <td className="p-2 text-center">
                        <Badge variant={mes.anexo === 'Anexo I' ? 'default' : 'secondary'}>
                          {mes.anexo}
                        </Badge>
                      </td>
                      <td className="p-2 text-right font-medium">{formatCurrency(mes.faturamentoTotal)}</td>
                      <td className="p-2 text-right">{formatCurrency(mes.rbt12)}</td>
                      <td className="p-2 text-right">{formatPercentage(mes.aliquotaEfetiva)}</td>
                      <td className="p-2 text-right">{formatPercentage(mes.percentualICMS)}</td>
                      <td className="p-2 text-right">{formatCurrency(mes.valorSemST)}</td>
                      <td className="p-2 text-right">{formatCurrency(mes.valorComST)}</td>
                      <td className="p-2 text-right font-bold text-blue-600">{formatCurrency(mes.valorTotal)}</td>
                      <td className="p-2 text-center">
                        <Button
                          onClick={() => removerMes(mes.id)}
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado vazio */}
      {mesesCalculados.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhum mês adicionado</h3>
              <p>Adicione o primeiro mês para começar a simulação</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}