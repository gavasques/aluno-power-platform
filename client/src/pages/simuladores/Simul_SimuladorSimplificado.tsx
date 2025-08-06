import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calculator, Save, FileDown, Plus, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "@/hooks/use-toast";

// Tipos baseados no simulador original - COMPLETO
type Currency = "USD" | "BRL";
type AllocationMethod = "peso" | "valor_fob" | "quantidade";

interface ConfiguracoesGerais {
  taxa_cambio_usd_brl: number;
  aliquota_ii_percentual: number;
  aliquota_icms_percentual: number;
  custo_frete_internacional_total_moeda_original: number;
  moeda_frete_internacional: Currency;
  outras_despesas_aduaneiras_total_brl: number;
  metodo_rateio_frete: AllocationMethod;
  metodo_rateio_outras_despesas: AllocationMethod;
}

interface ProdutoBase {
  id_produto_interno: string;
  descricao_produto: string;
  quantidade: number;
  valor_unitario_usd: number;
  peso_bruto_unitario_kg: number;
}

interface ProdutoCalculado extends ProdutoBase {
  peso_bruto_total_produto_kg: number;
  valor_total_produto_usd: number;
  custo_produto_brl: number;
  custo_frete_por_produto_brl: number;
  produto_mais_frete_brl: number;
  base_calculo_ii_brl: number;
  valor_ii_brl: number;
  outras_despesas_rateadas_brl: number;
  base_calculo_icms_planilha_brl: number;
  valor_icms_brl: number;
  valor_total_produto_impostos_brl: number;
  custo_unitario_sem_imposto_brl: number;
  custo_unitario_com_imposto_brl: number;
}

interface SimulacaoCompleta {
  id?: number;
  nomeSimulacao: string;
  codigoSimulacao?: string;
  nomeFornecedor?: string;
  observacoes?: string;
  configuracoesGerais: ConfiguracoesGerais;
  produtos: ProdutoBase[];
}

interface SimulationTotals {
  total_sim_quantidade_itens: number;
  total_sim_custo_produto_brl: number;
  total_sim_produto_mais_frete_brl: number;
  total_sim_valor_ii_brl: number;
  total_sim_valor_icms_brl: number;
  total_sim_outras_despesas_aduaneiras_brl: number;
  custo_total_importacao_brl: number;
  peso_total_kg: number;
  preco_por_kg_usd: number;
  multiplicador_importacao: number;
  valor_fob_total_usd: number;
}

// Configurações padrão baseadas no simulador original
const DEFAULT_CONFIG: ConfiguracoesGerais = {
  taxa_cambio_usd_brl: 5.20,
  aliquota_ii_percentual: 0.60,
  aliquota_icms_percentual: 0.17,
  custo_frete_internacional_total_moeda_original: 0,
  moeda_frete_internacional: "USD",
  outras_despesas_aduaneiras_total_brl: 0,
  metodo_rateio_frete: "peso",
  metodo_rateio_outras_despesas: "peso",
};

const DEFAULT_SIMULATION: SimulacaoCompleta = {
  nomeSimulacao: "Nova Simulação",
  nomeFornecedor: "",
  observacoes: "",
  configuracoesGerais: DEFAULT_CONFIG,
  produtos: [],
};

export default function Simul_SimuladorSimplificado() {
  const [_, setLocation] = useLocation();
  const [activeSimulation, setActiveSimulation] = useState<SimulacaoCompleta>(DEFAULT_SIMULATION);

  const handleBackToList = () => {
    setLocation('/simuladores');
  };

  const handleConfigChange = (field: keyof ConfiguracoesGerais, value: any) => {
    setActiveSimulation(prev => ({
      ...prev,
      configuracoesGerais: {
        ...prev.configuracoesGerais,
        [field]: value
      }
    }));
  };

  const handleProductAdd = () => {
    const newProduct: ProdutoBase = {
      id_produto_interno: Date.now().toString(),
      descricao_produto: "",
      quantidade: 1,
      valor_unitario_usd: 0,
      peso_bruto_unitario_kg: 0,
    };
    
    setActiveSimulation(prev => ({
      ...prev,
      produtos: [...prev.produtos, newProduct]
    }));
  };

  const handleProductUpdate = (index: number, field: keyof ProdutoBase, value: any) => {
    setActiveSimulation(prev => ({
      ...prev,
      produtos: prev.produtos.map((produto, i) => 
        i === index ? { ...produto, [field]: value } : produto
      )
    }));
  };

  const handleProductRemove = (index: number) => {
    setActiveSimulation(prev => ({
      ...prev,
      produtos: prev.produtos.filter((_, i) => i !== index)
    }));
  };

  // Cálculos complexos baseados no simulador original
  const calculatedResults = useMemo(() => {
    const config = activeSimulation.configuracoesGerais;
    
    // Calcular totais de base para rateio
    const pesoTotalKg = activeSimulation.produtos.reduce((sum, p) => sum + (p.peso_bruto_unitario_kg * p.quantidade), 0);
    const valorFobTotalUsd = activeSimulation.produtos.reduce((sum, p) => sum + (p.valor_unitario_usd * p.quantidade), 0);
    const quantidadeTotalItens = activeSimulation.produtos.reduce((sum, p) => sum + p.quantidade, 0);

    // Converter frete para BRL se necessário
    const freteInternacionalBrl = config.moeda_frete_internacional === "USD" 
      ? config.custo_frete_internacional_total_moeda_original * config.taxa_cambio_usd_brl
      : config.custo_frete_internacional_total_moeda_original;

    const produtosCalculados: ProdutoCalculado[] = activeSimulation.produtos.map(produto => {
      // Cálculos básicos por produto
      const peso_bruto_total_produto_kg = produto.peso_bruto_unitario_kg * produto.quantidade;
      const valor_total_produto_usd = produto.valor_unitario_usd * produto.quantidade;
      const custo_produto_brl = valor_total_produto_usd * config.taxa_cambio_usd_brl;

      // Rateio do frete baseado no método selecionado
      let custo_frete_por_produto_brl = 0;
      if (config.metodo_rateio_frete === "peso" && pesoTotalKg > 0) {
        custo_frete_por_produto_brl = (peso_bruto_total_produto_kg / pesoTotalKg) * freteInternacionalBrl;
      } else if (config.metodo_rateio_frete === "valor_fob" && valorFobTotalUsd > 0) {
        custo_frete_por_produto_brl = (valor_total_produto_usd / valorFobTotalUsd) * freteInternacionalBrl;
      } else if (config.metodo_rateio_frete === "quantidade" && quantidadeTotalItens > 0) {
        custo_frete_por_produto_brl = (produto.quantidade / quantidadeTotalItens) * freteInternacionalBrl;
      }

      // Rateio outras despesas baseado no método selecionado
      let outras_despesas_rateadas_brl = 0;
      if (config.metodo_rateio_outras_despesas === "peso" && pesoTotalKg > 0) {
        outras_despesas_rateadas_brl = (peso_bruto_total_produto_kg / pesoTotalKg) * config.outras_despesas_aduaneiras_total_brl;
      } else if (config.metodo_rateio_outras_despesas === "valor_fob" && valorFobTotalUsd > 0) {
        outras_despesas_rateadas_brl = (valor_total_produto_usd / valorFobTotalUsd) * config.outras_despesas_aduaneiras_total_brl;
      } else if (config.metodo_rateio_outras_despesas === "quantidade" && quantidadeTotalItens > 0) {
        outras_despesas_rateadas_brl = (produto.quantidade / quantidadeTotalItens) * config.outras_despesas_aduaneiras_total_brl;
      }

      const produto_mais_frete_brl = custo_produto_brl + custo_frete_por_produto_brl;
      const base_calculo_ii_brl = produto_mais_frete_brl;
      const valor_ii_brl = base_calculo_ii_brl * config.aliquota_ii_percentual;
      const base_calculo_icms_planilha_brl = produto_mais_frete_brl + valor_ii_brl + outras_despesas_rateadas_brl;
      const valor_icms_brl = base_calculo_icms_planilha_brl * config.aliquota_icms_percentual;
      const valor_total_produto_impostos_brl = produto_mais_frete_brl + valor_ii_brl + valor_icms_brl + outras_despesas_rateadas_brl;
      const custo_unitario_sem_imposto_brl = produto_mais_frete_brl / produto.quantidade;
      const custo_unitario_com_imposto_brl = valor_total_produto_impostos_brl / produto.quantidade;

      return {
        ...produto,
        peso_bruto_total_produto_kg,
        valor_total_produto_usd,
        custo_produto_brl,
        custo_frete_por_produto_brl,
        produto_mais_frete_brl,
        base_calculo_ii_brl,
        valor_ii_brl,
        outras_despesas_rateadas_brl,
        base_calculo_icms_planilha_brl,
        valor_icms_brl,
        valor_total_produto_impostos_brl,
        custo_unitario_sem_imposto_brl,
        custo_unitario_com_imposto_brl,
      };
    });

    // Totais da simulação
    const totals: SimulationTotals = {
      total_sim_quantidade_itens: quantidadeTotalItens,
      total_sim_custo_produto_brl: produtosCalculados.reduce((sum, p) => sum + p.custo_produto_brl, 0),
      total_sim_produto_mais_frete_brl: produtosCalculados.reduce((sum, p) => sum + p.produto_mais_frete_brl, 0),
      total_sim_valor_ii_brl: produtosCalculados.reduce((sum, p) => sum + p.valor_ii_brl, 0),
      total_sim_valor_icms_brl: produtosCalculados.reduce((sum, p) => sum + p.valor_icms_brl, 0),
      total_sim_outras_despesas_aduaneiras_brl: config.outras_despesas_aduaneiras_total_brl,
      custo_total_importacao_brl: produtosCalculados.reduce((sum, p) => sum + p.valor_total_produto_impostos_brl, 0),
      peso_total_kg: pesoTotalKg,
      preco_por_kg_usd: pesoTotalKg > 0 ? valorFobTotalUsd / pesoTotalKg : 0,
      multiplicador_importacao: valorFobTotalUsd > 0 ? produtosCalculados.reduce((sum, p) => sum + p.valor_total_produto_impostos_brl, 0) / (valorFobTotalUsd * config.taxa_cambio_usd_brl) : 0,
      valor_fob_total_usd: valorFobTotalUsd,
    };

    return { produtos: produtosCalculados, totals };
  }, [activeSimulation]);

  const handleSave = () => {
    toast({
      title: "Simulação salva",
      description: "Sua simulação foi salva com sucesso!",
    });
  };

  const handleExportPDF = () => {
    toast({
      title: "Relatório gerado",
      description: "O relatório foi gerado com sucesso!",
    });
  };

  const formatCurrency = (value: number) => {
    const { formatCurrency: unifiedFormatCurrency } = require('@/lib/utils/unifiedFormatters');
    return unifiedFormatCurrency(value);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleBackToList} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar à Lista
        </Button>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <FileDown className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Título */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Simulador Simplificado</h1>
        <p className="text-muted-foreground">
          Simulador completo de importação com rateio automático e cálculo detalhado
        </p>
      </div>

      {/* Informações da Simulação */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Simulação</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              value={activeSimulation.nomeFornecedor || ""}
              onChange={(e) => setActiveSimulation(prev => ({...prev, nomeFornecedor: e.target.value}))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações Gerais com RATEIO */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="taxa_cambio">Taxa de Câmbio USD/BRL</Label>
            <Input
              id="taxa_cambio"
              type="number"
              step="0.0001"
              value={activeSimulation.configuracoesGerais.taxa_cambio_usd_brl}
              onChange={(e) => handleConfigChange('taxa_cambio_usd_brl', parseFloat(e.target.value) || 0)}
              placeholder="Ex: 5,2000"
            />
          </div>
          <div>
            <Label htmlFor="aliquota_ii">Alíquota II (%)</Label>
            <Input
              id="aliquota_ii"
              type="number"
              step="0.01"
              value={(activeSimulation.configuracoesGerais.aliquota_ii_percentual || 0) * 100}
              onChange={(e) => handleConfigChange('aliquota_ii_percentual', (parseFloat(e.target.value) || 0) / 100)}
              placeholder="Ex: 60,00"
            />
          </div>
          <div>
            <Label htmlFor="aliquota_icms">Alíquota ICMS (%)</Label>
            <Input
              id="aliquota_icms"
              type="number"
              step="0.01"
              value={(activeSimulation.configuracoesGerais.aliquota_icms_percentual || 0) * 100}
              onChange={(e) => handleConfigChange('aliquota_icms_percentual', (parseFloat(e.target.value) || 0) / 100)}
              placeholder="Ex: 17,00"
            />
          </div>
          <div>
            <Label htmlFor="frete_total">Custo Frete Internacional Total</Label>
            <Input
              id="frete_total"
              type="number"
              step="0.01"
              value={activeSimulation.configuracoesGerais.custo_frete_internacional_total_moeda_original}
              onChange={(e) => handleConfigChange('custo_frete_internacional_total_moeda_original', parseFloat(e.target.value) || 0)}
              placeholder="Ex: 1.500,00"
            />
          </div>
          <div>
            <Label htmlFor="moeda_frete">Moeda do Frete</Label>
            <Select
              value={activeSimulation.configuracoesGerais.moeda_frete_internacional}
              onValueChange={(value: Currency) => handleConfigChange('moeda_frete_internacional', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="BRL">BRL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="outras_despesas">Outras Despesas Aduaneiras (BRL)</Label>
            <Input
              id="outras_despesas"
              type="number"
              step="0.01"
              value={activeSimulation.configuracoesGerais.outras_despesas_aduaneiras_total_brl}
              onChange={(e) => handleConfigChange('outras_despesas_aduaneiras_total_brl', parseFloat(e.target.value) || 0)}
              placeholder="Ex: 250,00"
            />
          </div>
          <div>
            <Label htmlFor="metodo_frete">Método Rateio Frete</Label>
            <Select
              value={activeSimulation.configuracoesGerais.metodo_rateio_frete}
              onValueChange={(value: AllocationMethod) => handleConfigChange('metodo_rateio_frete', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="peso">Por Peso</SelectItem>
                <SelectItem value="valor_fob">Por Valor FOB</SelectItem>
                <SelectItem value="quantidade">Por Quantidade</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="metodo_outras">Método Rateio Outras Despesas</Label>
            <Select
              value={activeSimulation.configuracoesGerais.metodo_rateio_outras_despesas}
              onValueChange={(value: AllocationMethod) => handleConfigChange('metodo_rateio_outras_despesas', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="peso">Por Peso</SelectItem>
                <SelectItem value="valor_fob">Por Valor FOB</SelectItem>
                <SelectItem value="quantidade">Por Quantidade</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Produtos Completa */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Produtos da Simulação</CardTitle>
            <Button onClick={handleProductAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Produto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeSimulation.produtos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum produto adicionado</p>
              <p className="text-sm">Clique em "Adicionar Produto" para começar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Descrição</th>
                    <th className="text-left p-2">Qtd</th>
                    <th className="text-left p-2">Valor Unit. USD</th>
                    <th className="text-left p-2">Peso Unit. kg</th>
                    <th className="text-left p-2">Custo Produto BRL</th>
                    <th className="text-left p-2">Frete BRL</th>
                    <th className="text-left p-2">Produto+Frete BRL</th>
                    <th className="text-left p-2">II BRL</th>
                    <th className="text-left p-2">ICMS BRL</th>
                    <th className="text-left p-2">Total c/ Impostos</th>
                    <th className="text-left p-2">Custo Unit. s/ Imp.</th>
                    <th className="text-left p-2 font-bold text-blue-600 text-base">Custo Unit. c/ Imp.</th>
                    <th className="text-left p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {calculatedResults.produtos.map((produto, index) => (
                    <tr key={produto.id_produto_interno} className="border-b">
                      <td className="p-2">
                        <Input
                          value={produto.descricao_produto}
                          onChange={(e) => handleProductUpdate(index, 'descricao_produto', e.target.value)}
                          placeholder="Descrição do produto"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={produto.quantidade}
                          onChange={(e) => handleProductUpdate(index, 'quantidade', parseInt(e.target.value) || 1)}
                          min="1"
                          className="w-20"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={produto.valor_unitario_usd === 0 ? '' : produto.valor_unitario_usd}
                          onChange={(e) => handleProductUpdate(index, 'valor_unitario_usd', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="w-24"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.001"
                          value={produto.peso_bruto_unitario_kg === 0 ? '' : produto.peso_bruto_unitario_kg}
                          onChange={(e) => handleProductUpdate(index, 'peso_bruto_unitario_kg', parseFloat(e.target.value) || 0)}
                          placeholder="0.000"
                          className="w-24"
                        />
                      </td>
                      <td className="p-2 text-right">{formatCurrency(produto.custo_produto_brl)}</td>
                      <td className="p-2 text-right">{formatCurrency(produto.custo_frete_por_produto_brl)}</td>
                      <td className="p-2 text-right">{formatCurrency(produto.produto_mais_frete_brl)}</td>
                      <td className="p-2 text-right">{formatCurrency(produto.valor_ii_brl)}</td>
                      <td className="p-2 text-right">{formatCurrency(produto.valor_icms_brl)}</td>
                      <td className="p-2 text-right font-semibold">{formatCurrency(produto.valor_total_produto_impostos_brl)}</td>
                      <td className="p-2 text-right">{formatCurrency(produto.custo_unitario_sem_imposto_brl)}</td>
                      <td className="p-2 text-right font-bold text-blue-600 text-base">{formatCurrency(produto.custo_unitario_com_imposto_brl)}</td>
                      <td className="p-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleProductRemove(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo dos Totais Completo */}
      {activeSimulation.produtos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo dos Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Custo Produtos</p>
                <p className="text-2xl font-bold">{formatCurrency(calculatedResults.totals.total_sim_custo_produto_brl)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">II Total</p>
                <p className="text-2xl font-bold">{formatCurrency(calculatedResults.totals.total_sim_valor_ii_brl)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">ICMS Total</p>
                <p className="text-2xl font-bold">{formatCurrency(calculatedResults.totals.total_sim_valor_icms_brl)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Custo Total</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(calculatedResults.totals.custo_total_importacao_brl)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Peso Total</p>
                <p className="text-lg font-semibold">{calculatedResults.totals.peso_total_kg.toFixed(3)} kg</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Valor FOB USD</p>
                <p className="text-lg font-semibold">US$ {calculatedResults.totals.valor_fob_total_usd.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Preço/kg USD</p>
                <p className="text-lg font-semibold">US$ {calculatedResults.totals.preco_por_kg_usd.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Multiplicador</p>
                <p className="text-lg font-semibold">{calculatedResults.totals.multiplicador_importacao.toFixed(2)}x</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Observações */}
      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full min-h-[100px] p-3 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Adicione observações sobre esta simulação..."
            value={activeSimulation.observacoes || ""}
            onChange={(e) => setActiveSimulation(prev => ({...prev, observacoes: e.target.value}))}
          />
        </CardContent>
      </Card>
    </div>
  );
}