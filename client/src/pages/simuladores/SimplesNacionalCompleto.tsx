import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Download, AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Formatação brasileira de moeda - formato R$ X.XXX.XXXX,XX
const formatCurrency = (value: number): string => {
  return `R$ ${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const formatPercent = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

// Interface para dados de cada mês
interface MesSimulacao {
  id: string;
  mesAno: string;
  faturamentoSemST: number;
  faturamentoComST: number;
  faturamento: number; // Total (sem ST + com ST)
  anexo: "Anexo I" | "Anexo II";
  // Campos calculados
  faturamentoTotal: number;
  faturamentoAcumulado12Meses: number;
  rbt12: number;
  media12Meses: number;
  disponivelMedia: number;
  disponivelAnual: number;
  aliquotaEfetiva: number;
  percentualICMS: number;
  aliquotaFinal: number;
  valorDevidoSemST: number;
  valorDevidoComST: number;
  valorDevidoTotal: number;
}

// Tabelas de alíquotas Anexo I (Comércio)
const tabelaAnexoI = [
  { apartirDe: 0, aliquotaNominal: 0.04, valorDeduzir: 0, percentualICMS: 0.34 },
  { apartirDe: 180000, aliquotaNominal: 0.073, valorDeduzir: 5940, percentualICMS: 0.34 },
  { apartirDe: 360000, aliquotaNominal: 0.095, valorDeduzir: 13830, percentualICMS: 0.335 },
  { apartirDe: 720000, aliquotaNominal: 0.107, valorDeduzir: 22500, percentualICMS: 0.335 },
  { apartirDe: 1800000, aliquotaNominal: 0.143, valorDeduzir: 87300, percentualICMS: 0.335 }
];

// Tabelas de alíquotas Anexo II (Indústria)
const tabelaAnexoII = [
  { apartirDe: 0, aliquotaNominal: 0.045, valorDeduzir: 0, percentualICMS: 0.34 },
  { apartirDe: 180000, aliquotaNominal: 0.078, valorDeduzir: 5940, percentualICMS: 0.34 },
  { apartirDe: 360000, aliquotaNominal: 0.10, valorDeduzir: 13830, percentualICMS: 0.335 },
  { apartirDe: 720000, aliquotaNominal: 0.112, valorDeduzir: 22500, percentualICMS: 0.335 },
  { apartirDe: 1800000, aliquotaNominal: 0.147, valorDeduzir: 85500, percentualICMS: 0.335 }
];

// Funções auxiliares para buscar valores nas tabelas
function buscarDadosTabela(rbt12: number, anexo: "Anexo I" | "Anexo II") {
  const tabela = anexo === "Anexo I" ? tabelaAnexoI : tabelaAnexoII;
  
  for (let i = tabela.length - 1; i >= 0; i--) {
    if (rbt12 >= tabela[i].apartirDe) {
      return tabela[i];
    }
  }
  
  return tabela[0];
}

// Função para calcular soma dos últimos 12 meses
function calcularSomaUltimos12Meses(meses: MesSimulacao[], indiceAtual: number): number {
  if (indiceAtual < 12) {
    return meses.slice(0, indiceAtual + 1)
      .reduce((soma, mes) => soma + mes.faturamento, 0);
  }
  
  return meses.slice(indiceAtual - 11, indiceAtual + 1)
    .reduce((soma, mes) => soma + mes.faturamento, 0);
}

// Função para calcular média dos últimos 12 meses
function calcularMediaUltimos12Meses(meses: MesSimulacao[], indiceAtual: number): number {
  if (indiceAtual < 12) {
    const mesesDisponiveis = meses.slice(0, indiceAtual + 1);
    return mesesDisponiveis.reduce((soma, mes) => soma + mes.faturamento, 0) / mesesDisponiveis.length;
  }
  
  const ultimos12Meses = meses.slice(indiceAtual - 11, indiceAtual + 1);
  return ultimos12Meses.reduce((soma, mes) => soma + mes.faturamento, 0) / 12;
}

// Função para calcular todos os campos de um mês
function calcularCamposMes(meses: MesSimulacao[], indiceAtual: number): Partial<MesSimulacao> {
  const mesAtual = meses[indiceAtual];
  
  // 1. Faturamento Total
  const faturamentoTotal = mesAtual.faturamento;
  
  // 2. Faturamento Acumulado 12 meses
  const faturamentoAcumulado12Meses = calcularSomaUltimos12Meses(meses, indiceAtual);
  
  // 3. RBT12
  const rbt12 = faturamentoAcumulado12Meses;
  
  // 4. Média 12 meses
  const media12Meses = calcularMediaUltimos12Meses(meses, indiceAtual);
  
  // 5. Disponível Média
  const disponivelMedia = 300000 - media12Meses;
  
  // 6. Disponível Anual
  const disponivelAnual = 3600000 - rbt12;
  
  // 7. Buscar dados da tabela
  const dadosTabela = buscarDadosTabela(rbt12, mesAtual.anexo);
  
  // 8. Alíquota Efetiva
  const aliquotaEfetiva = rbt12 > 0 ? (rbt12 * dadosTabela.aliquotaNominal - dadosTabela.valorDeduzir) / rbt12 : 0;
  
  // 9. Percentual ICMS
  const percentualICMS = dadosTabela.percentualICMS;
  
  // 10. Alíquota Final
  const aliquotaFinal = aliquotaEfetiva * (1 - percentualICMS);
  
  // 11. Valores Devidos
  const valorDevidoSemST = mesAtual.faturamentoSemST * aliquotaEfetiva;
  const valorDevidoComST = 0; // ST não paga Simples Nacional, apenas ICMS-ST
  const valorDevidoTotal = valorDevidoSemST + valorDevidoComST;
  
  return {
    faturamentoTotal,
    faturamentoAcumulado12Meses,
    rbt12,
    media12Meses,
    disponivelMedia,
    disponivelAnual,
    aliquotaEfetiva,
    percentualICMS,
    aliquotaFinal,
    valorDevidoSemST,
    valorDevidoComST,
    valorDevidoTotal
  };
}

export default function SimplesNacionalCompleto() {
  const [meses, setMeses] = useState<MesSimulacao[]>([]);
  const [novoMes, setNovoMes] = useState({
    mesAno: "",
    faturamentoSemST: "",
    faturamentoComST: "",
    anexo: "Anexo I" as "Anexo I" | "Anexo II"
  });

  // Carregar dados salvos no localStorage
  useEffect(() => {
    const dadosSalvos = localStorage.getItem('simplesNacionalCompleto');
    if (dadosSalvos) {
      try {
        const mesesSalvos = JSON.parse(dadosSalvos);
        setMeses(mesesSalvos);
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
      }
    }
  }, []);

  // Salvar no localStorage sempre que os meses mudarem
  useEffect(() => {
    if (meses.length > 0) {
      localStorage.setItem('simplesNacionalCompleto', JSON.stringify(meses));
    }
  }, [meses]);

  const adicionarMes = () => {
    if (!novoMes.mesAno || (!novoMes.faturamentoSemST && !novoMes.faturamentoComST)) {
      alert("Por favor, preencha pelo menos um tipo de faturamento");
      return;
    }

    const faturamentoSemST = parseFloat(novoMes.faturamentoSemST.replace(/\./g, '').replace(',', '.')) || 0;
    const faturamentoComST = parseFloat(novoMes.faturamentoComST.replace(/\./g, '').replace(',', '.')) || 0;
    const faturamento = faturamentoSemST + faturamentoComST;
    
    const novoMesData: MesSimulacao = {
      id: Date.now().toString(),
      mesAno: novoMes.mesAno,
      faturamentoSemST,
      faturamentoComST,
      faturamento,
      anexo: novoMes.anexo,
      faturamentoTotal: 0,
      faturamentoAcumulado12Meses: 0,
      rbt12: 0,
      media12Meses: 0,
      disponivelMedia: 0,
      disponivelAnual: 0,
      aliquotaEfetiva: 0,
      percentualICMS: 0,
      aliquotaFinal: 0,
      valorDevidoSemST: 0,
      valorDevidoComST: 0,
      valorDevidoTotal: 0
    };

    const novosMeses = [...meses, novoMesData];
    
    // Calcular campos para todos os meses
    const mesesComCalculos = novosMeses.map((mes, index) => {
      const camposCalculados = calcularCamposMes(novosMeses, index);
      return { ...mes, ...camposCalculados };
    });

    setMeses(mesesComCalculos);
    setNovoMes({ mesAno: "", faturamentoSemST: "", faturamentoComST: "", anexo: "Anexo I" });
  };

  const removerMes = (id: string) => {
    const novosMeses = meses.filter(mes => mes.id !== id);
    
    // Recalcular todos os meses após remoção
    const mesesComCalculos = novosMeses.map((mes, index) => {
      const camposCalculados = calcularCamposMes(novosMeses, index);
      return { ...mes, ...camposCalculados };
    });
    
    setMeses(mesesComCalculos);
  };

  const limparTodos = () => {
    if (confirm("Tem certeza que deseja limpar todos os dados?")) {
      setMeses([]);
      localStorage.removeItem('simplesNacionalCompleto');
    }
  };

  const exportarCSV = () => {
    if (meses.length === 0) return;
    
    const headers = [
      "Mês/Ano", "Fat. sem ST", "Fat. com ST", "Total", "Anexo", "Fat. Acumulado 12M",
      "RBT12", "Média 12M", "Disponível Média", "Disponível Anual", 
      "Alíquota Efetiva", "% ICMS", "Alíquota Final", "Valor Devido sem ST", "Valor Devido com ST", "Valor Devido Total"
    ];
    
    const rows = meses.map(mes => [
      mes.mesAno,
      mes.faturamentoSemST.toFixed(2),
      mes.faturamentoComST.toFixed(2),
      mes.faturamento.toFixed(2),
      mes.anexo,
      mes.faturamentoAcumulado12Meses.toFixed(2),
      mes.rbt12.toFixed(2),
      mes.media12Meses.toFixed(2),
      mes.disponivelMedia.toFixed(2),
      mes.disponivelAnual.toFixed(2),
      (mes.aliquotaEfetiva * 100).toFixed(4),
      (mes.percentualICMS * 100).toFixed(2),
      (mes.aliquotaFinal * 100).toFixed(4),
      mes.valorDevidoSemST.toFixed(2),
      mes.valorDevidoComST.toFixed(2),
      mes.valorDevidoTotal.toFixed(2)
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `simples_nacional_completo_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calcular resumo
  const faturamentoTotalAcumulado = meses.reduce((sum, mes) => sum + mes.faturamento, 0);
  const faturamentoSemSTTotal = meses.reduce((sum, mes) => sum + mes.faturamentoSemST, 0);
  const faturamentoComSTTotal = meses.reduce((sum, mes) => sum + mes.faturamentoComST, 0);
  const valorTotalImpostos = meses.reduce((sum, mes) => sum + mes.valorDevidoTotal, 0);
  const mediaFaturamento = meses.length > 0 ? faturamentoTotalAcumulado / meses.length : 0;
  const aliquotaEfetivaMedia = meses.length > 0 ? meses.reduce((sum, mes) => sum + mes.aliquotaEfetiva, 0) / meses.length : 0;

  // Verificar alertas
  const ultimoMes = meses[meses.length - 1];
  const proximoLimiteMedia = ultimoMes?.disponivelMedia < 50000;
  const proximoLimiteAnual = ultimoMes?.disponivelAnual < 360000;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Simulador Completo do Simples Nacional</h1>
        <p className="text-muted-foreground mt-2">
          Sistema avançado com separação de faturamento com e sem Substituição Tributária (ST)
        </p>
      </div>

      {/* Aviso importante */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Este simulador é apenas para fins de estimativa. 
          Consulte sempre um contador para cálculos oficiais e tomada de decisões fiscais.
        </AlertDescription>
      </Alert>

      {/* Alertas de limites */}
      {(proximoLimiteMedia || proximoLimiteAnual) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {proximoLimiteMedia && (
              <div>⚠️ Atenção: Próximo ao limite de média mensal (restam {formatCurrency(ultimoMes.disponivelMedia)})</div>
            )}
            {proximoLimiteAnual && (
              <div>⚠️ Atenção: Próximo ao limite anual (restam {formatCurrency(ultimoMes.disponivelAnual)})</div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Formulário para adicionar novo mês */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Novo Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="mesAno">Mês/Ano</Label>
              <Input
                id="mesAno"
                placeholder="MM/AAAA"
                value={novoMes.mesAno}
                onChange={(e) => {
                  let value = e.target.value.replace(/[^\d/]/g, '');
                  if (value.length >= 2 && value.charAt(2) !== '/') {
                    value = value.slice(0, 2) + '/' + value.slice(2);
                  }
                  if (value.length > 7) {
                    value = value.slice(0, 7);
                  }
                  setNovoMes(prev => ({ ...prev, mesAno: value }));
                }}
              />
            </div>
            
            <div>
              <Label htmlFor="faturamentoSemST">Faturamento sem ST</Label>
              <Input
                id="faturamentoSemST"
                placeholder="0,00"
                value={novoMes.faturamentoSemST}
                onChange={(e) => {
                  let value = e.target.value.replace(/[^\d,]/g, '');
                  // Formato brasileiro: permitir apenas vírgula como separador decimal
                  if (value.includes(',')) {
                    const parts = value.split(',');
                    if (parts.length > 2) {
                      value = parts[0] + ',' + parts[1];
                    }
                  }
                  setNovoMes(prev => ({ ...prev, faturamentoSemST: value }));
                }}
              />
            </div>

            <div>
              <Label htmlFor="faturamentoComST">Faturamento com ST</Label>
              <Input
                id="faturamentoComST"
                placeholder="0,00"
                value={novoMes.faturamentoComST}
                onChange={(e) => {
                  let value = e.target.value.replace(/[^\d,]/g, '');
                  // Formato brasileiro: permitir apenas vírgula como separador decimal
                  if (value.includes(',')) {
                    const parts = value.split(',');
                    if (parts.length > 2) {
                      value = parts[0] + ',' + parts[1];
                    }
                  }
                  setNovoMes(prev => ({ ...prev, faturamentoComST: value }));
                }}
              />
            </div>
            
            <div>
              <Label htmlFor="anexo">Anexo</Label>
              <Select value={novoMes.anexo} onValueChange={(value: "Anexo I" | "Anexo II") => setNovoMes(prev => ({ ...prev, anexo: value }))}>
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
      {meses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(faturamentoTotalAcumulado)}
                </div>
                <div className="text-sm text-muted-foreground">Total Geral</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(faturamentoSemSTTotal)}
                </div>
                <div className="text-sm text-muted-foreground">Total sem ST</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600">
                  {formatCurrency(faturamentoComSTTotal)}
                </div>
                <div className="text-sm text-muted-foreground">Total com ST</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-cyan-600">
                  {formatCurrency(mediaFaturamento)}
                </div>
                <div className="text-sm text-muted-foreground">Média Mensal</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-600">
                  {formatCurrency(valorTotalImpostos)}
                </div>
                <div className="text-sm text-muted-foreground">Total Impostos</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">
                  {formatPercent(aliquotaEfetivaMedia)}
                </div>
                <div className="text-sm text-muted-foreground">Alíq. Média</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de resultados */}
      {meses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Simulação Detalhada ({meses.length} meses)</span>
              <div className="flex gap-2">
                <Button onClick={exportarCSV} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
                <Button onClick={limparTodos} variant="outline" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar Todos
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Mês/Ano</th>
                    <th className="p-2 text-right">Fat. sem ST</th>
                    <th className="p-2 text-right">Fat. com ST</th>
                    <th className="p-2 text-right">Total</th>
                    <th className="p-2 text-center">Anexo</th>
                    <th className="p-2 text-right">Fat. Acum. 12M</th>
                    <th className="p-2 text-right">Média 12M</th>
                    <th className="p-2 text-right">Disp. Média</th>
                    <th className="p-2 text-right">Disp. Anual</th>
                    <th className="p-2 text-right">Alíq. Efetiva</th>
                    <th className="p-2 text-right">Valor Devido</th>
                    <th className="p-2 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {meses.map((mes) => (
                    <tr key={mes.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{mes.mesAno}</td>
                      <td className="p-2 text-right">{formatCurrency(mes.faturamentoSemST)}</td>
                      <td className="p-2 text-right">{formatCurrency(mes.faturamentoComST)}</td>
                      <td className="p-2 text-right font-medium">{formatCurrency(mes.faturamento)}</td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          mes.anexo === "Anexo I" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                        }`}>
                          {mes.anexo}
                        </span>
                      </td>
                      <td className="p-2 text-right">{formatCurrency(mes.faturamentoAcumulado12Meses)}</td>
                      <td className="p-2 text-right">{formatCurrency(mes.media12Meses)}</td>
                      <td className={`p-2 text-right ${mes.disponivelMedia < 50000 ? 'text-red-600 font-bold' : ''}`}>
                        {formatCurrency(mes.disponivelMedia)}
                      </td>
                      <td className={`p-2 text-right ${mes.disponivelAnual < 360000 ? 'text-red-600 font-bold' : ''}`}>
                        {formatCurrency(mes.disponivelAnual)}
                      </td>
                      <td className="p-2 text-right">{formatPercent(mes.aliquotaEfetiva)}</td>
                      <td className="p-2 text-right font-bold text-blue-600">{formatCurrency(mes.valorDevidoTotal)}</td>
                      <td className="p-2 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removerMes(mes.id)}
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

      {meses.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum mês adicionado ainda.</p>
              <p className="text-sm">Preencha os campos de faturamento sem ST e/ou com ST para começar.</p>
              <p className="text-xs text-muted-foreground mt-2">
                ST = Substituição Tributária (produtos que não pagam Simples Nacional)
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}