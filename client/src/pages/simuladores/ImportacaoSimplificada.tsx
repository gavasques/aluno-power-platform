import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Save, FileDown, Calculator, Copy } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Types based on the specification
interface ConfiguracoesGerais {
  taxa_cambio_usd_brl: number;
  aliquota_ii_percentual: number;
  aliquota_icms_percentual: number;
  custo_frete_internacional_total_moeda_original: number;
  moeda_frete_internacional: "USD" | "BRL";
  outras_despesas_aduaneiras_total_brl: number;
  metodo_rateio_frete: "peso" | "valor_fob" | "quantidade";
  metodo_rateio_outras_despesas: "peso" | "valor_fob" | "quantidade";
}

interface ProdutoSimulacao {
  id_produto_interno: string;
  descricao_produto: string;
  quantidade: number;
  valor_unitario_usd: number;
  peso_bruto_unitario_kg: number;
  // Calculated fields
  peso_bruto_total_produto_kg?: number;
  valor_total_produto_usd?: number;
  custo_produto_brl?: number;
  custo_frete_por_produto_brl?: number;
  produto_mais_frete_brl?: number;
  base_calculo_ii_brl?: number;
  valor_ii_brl?: number;
  outras_despesas_rateadas_brl?: number;
  base_calculo_icms_planilha_brl?: number;
  valor_icms_brl?: number;
  valor_total_produto_impostos_brl?: number;
  custo_unitario_sem_imposto_brl?: number;
  custo_unitario_com_imposto_brl?: number;
}

interface SimulacaoCompleta {
  id?: number;
  nomeSimulacao: string;
  configuracoesGerais: ConfiguracoesGerais;
  produtos: ProdutoSimulacao[];
}

// Default values
const defaultConfig: ConfiguracoesGerais = {
  taxa_cambio_usd_brl: 5.20,
  aliquota_ii_percentual: 0.60,
  aliquota_icms_percentual: 0.17,
  custo_frete_internacional_total_moeda_original: 0,
  moeda_frete_internacional: "USD",
  outras_despesas_aduaneiras_total_brl: 0,
  metodo_rateio_frete: "peso",
  metodo_rateio_outras_despesas: "quantidade",
};

const defaultProduct: Omit<ProdutoSimulacao, 'id_produto_interno'> = {
  descricao_produto: "",
  quantidade: 1,
  valor_unitario_usd: 0,
  peso_bruto_unitario_kg: 0,
};

export default function ImportacaoSimplificada() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [activeSimulation, setActiveSimulation] = useState<SimulacaoCompleta>({
    nomeSimulacao: "Nova Simulação",
    configuracoesGerais: defaultConfig,
    produtos: []
  });
  
  const [selectedSimulationId, setSelectedSimulationId] = useState<number | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  // API queries
  const { data: simulations = [], isLoading } = useQuery({
    queryKey: ['/api/simulations/import'],
    enabled: true,
  });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (data: SimulacaoCompleta) => {
      if (data.id) {
        return apiRequest(`/api/simulations/import/${data.id}`, {
          method: 'PUT',
          body: data,
        });
      } else {
        return apiRequest('/api/simulations/import', {
          method: 'POST', 
          body: data,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/simulations/import'] });
      toast({ title: "Simulação salva com sucesso!" });
      setShowSaveDialog(false);
    },
    onError: () => {
      toast({ title: "Erro ao salvar simulação", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/simulations/import/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/simulations/import'] });
      toast({ title: "Simulação excluída com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir simulação", variant: "destructive" });
    }
  });

  // Calculation functions based on specification
  const calculatedResults = useMemo(() => {
    const cfg = activeSimulation.configuracoesGerais;
    const produtos = activeSimulation.produtos;

    // Global calculations
    const peso_bruto_total_simulacao_kg = produtos.reduce((sum, p) => sum + (p.quantidade * p.peso_bruto_unitario_kg), 0);
    const valor_fob_total_simulacao_usd = produtos.reduce((sum, p) => sum + (p.quantidade * p.valor_unitario_usd), 0);
    const quantidade_total_itens_simulacao = produtos.reduce((sum, p) => sum + p.quantidade, 0);

    const custo_frete_internacional_total_brl = cfg.moeda_frete_internacional === "USD" 
      ? cfg.custo_frete_internacional_total_moeda_original * cfg.taxa_cambio_usd_brl
      : cfg.custo_frete_internacional_total_moeda_original;

    // Calculate per product
    const produtosCalculados = produtos.map(p => {
      const peso_bruto_total_produto_kg = p.quantidade * p.peso_bruto_unitario_kg;
      const valor_total_produto_usd = p.quantidade * p.valor_unitario_usd;
      const custo_produto_brl = valor_total_produto_usd * cfg.taxa_cambio_usd_brl;

      // Freight cost per product
      let custo_frete_por_produto_brl = 0;
      if (cfg.metodo_rateio_frete === "peso" && peso_bruto_total_simulacao_kg > 0) {
        custo_frete_por_produto_brl = (peso_bruto_total_produto_kg / peso_bruto_total_simulacao_kg) * custo_frete_internacional_total_brl;
      } else if (cfg.metodo_rateio_frete === "valor_fob" && valor_fob_total_simulacao_usd > 0) {
        custo_frete_por_produto_brl = (valor_total_produto_usd / valor_fob_total_simulacao_usd) * custo_frete_internacional_total_brl;
      } else if (cfg.metodo_rateio_frete === "quantidade" && quantidade_total_itens_simulacao > 0) {
        custo_frete_por_produto_brl = (p.quantidade / quantidade_total_itens_simulacao) * custo_frete_internacional_total_brl;
      }

      const produto_mais_frete_brl = custo_produto_brl + custo_frete_por_produto_brl;
      const base_calculo_ii_brl = produto_mais_frete_brl;
      const valor_ii_brl = base_calculo_ii_brl * cfg.aliquota_ii_percentual;

      // Other expenses allocation
      let outras_despesas_rateadas_brl = 0;
      if (cfg.metodo_rateio_outras_despesas === "peso" && peso_bruto_total_simulacao_kg > 0) {
        outras_despesas_rateadas_brl = (peso_bruto_total_produto_kg / peso_bruto_total_simulacao_kg) * cfg.outras_despesas_aduaneiras_total_brl;
      } else if (cfg.metodo_rateio_outras_despesas === "valor_fob" && valor_fob_total_simulacao_usd > 0) {
        outras_despesas_rateadas_brl = (valor_total_produto_usd / valor_fob_total_simulacao_usd) * cfg.outras_despesas_aduaneiras_total_brl;
      } else if (cfg.metodo_rateio_outras_despesas === "quantidade" && quantidade_total_itens_simulacao > 0) {
        outras_despesas_rateadas_brl = (p.quantidade / quantidade_total_itens_simulacao) * cfg.outras_despesas_aduaneiras_total_brl;
      }

      // ICMS calculation following spreadsheet logic
      const base_calculo_icms_planilha_brl = (produto_mais_frete_brl + valor_ii_brl) / (1 - cfg.aliquota_icms_percentual);
      const valor_icms_brl = base_calculo_icms_planilha_brl * cfg.aliquota_icms_percentual;

      const valor_total_produto_impostos_brl = produto_mais_frete_brl + valor_ii_brl + valor_icms_brl;
      const custo_unitario_sem_imposto_brl = p.quantidade > 0 ? produto_mais_frete_brl / p.quantidade : 0;
      const custo_unitario_com_imposto_brl = p.quantidade > 0 ? valor_total_produto_impostos_brl / p.quantidade : 0;

      return {
        ...p,
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

    // Totals
    const totals = {
      total_sim_quantidade_itens: quantidade_total_itens_simulacao,
      total_sim_custo_produto_brl: produtosCalculados.reduce((sum, p) => sum + (p.custo_produto_brl || 0), 0),
      total_sim_produto_mais_frete_brl: produtosCalculados.reduce((sum, p) => sum + (p.produto_mais_frete_brl || 0), 0),
      total_sim_valor_ii_brl: produtosCalculados.reduce((sum, p) => sum + (p.valor_ii_brl || 0), 0),
      total_sim_valor_icms_brl: produtosCalculados.reduce((sum, p) => sum + (p.valor_icms_brl || 0), 0),
      total_sim_outras_despesas_aduaneiras_brl: cfg.outras_despesas_aduaneiras_total_brl,
    };

    const custo_total_importacao_brl = totals.total_sim_produto_mais_frete_brl + totals.total_sim_valor_ii_brl + totals.total_sim_valor_icms_brl + totals.total_sim_outras_despesas_aduaneiras_brl;

    return {
      produtos: produtosCalculados,
      totals: { ...totals, custo_total_importacao_brl }
    };
  }, [activeSimulation]);

  // Helper functions
  const addProduct = () => {
    const newProduct: ProdutoSimulacao = {
      ...defaultProduct,
      id_produto_interno: Date.now().toString(),
    };
    setActiveSimulation(prev => ({
      ...prev,
      produtos: [...prev.produtos, newProduct]
    }));
  };

  const updateProduct = (index: number, field: keyof ProdutoSimulacao, value: any) => {
    setActiveSimulation(prev => ({
      ...prev,
      produtos: prev.produtos.map((p, i) => 
        i === index ? { ...p, [field]: value } : p
      )
    }));
  };

  const removeProduct = (index: number) => {
    setActiveSimulation(prev => ({
      ...prev,
      produtos: prev.produtos.filter((_, i) => i !== index)
    }));
  };

  const updateConfig = (field: keyof ConfiguracoesGerais, value: any) => {
    setActiveSimulation(prev => ({
      ...prev,
      configuracoesGerais: { ...prev.configuracoesGerais, [field]: value }
    }));
  };

  const loadSimulation = (simulation: any) => {
    setActiveSimulation({
      ...simulation,
      configuracoesGerais: simulation.configuracoesGerais,
      produtos: simulation.produtos
    });
    setSelectedSimulationId(simulation.id);
  };

  const newSimulation = () => {
    setActiveSimulation({
      nomeSimulacao: "Nova Simulação",
      configuracoesGerais: defaultConfig,
      produtos: []
    });
    setSelectedSimulationId(null);
  };

  const duplicateSimulation = () => {
    setActiveSimulation(prev => ({
      ...prev,
      nomeSimulacao: prev.nomeSimulacao + " (Cópia)",
      id: undefined
    }));
    setSelectedSimulationId(null);
  };

  const exportToCsv = () => {
    const headers = [
      "Descrição", "Quantidade", "Valor Unit. USD", "Peso Unit. kg", 
      "Custo Produto BRL", "Frete BRL", "Produto+Frete BRL", "II BRL", 
      "ICMS BRL", "Total c/ Impostos BRL", "Custo Unit. s/ Imposto BRL", "Custo Unit. c/ Imposto BRL"
    ];
    
    const rows = calculatedResults.produtos.map(p => [
      p.descricao_produto,
      p.quantidade,
      p.valor_unitario_usd,
      p.peso_bruto_unitario_kg,
      p.custo_produto_brl?.toFixed(2),
      p.custo_frete_por_produto_brl?.toFixed(2),
      p.produto_mais_frete_brl?.toFixed(2),
      p.valor_ii_brl?.toFixed(2),
      p.valor_icms_brl?.toFixed(2),
      p.valor_total_produto_impostos_brl?.toFixed(2),
      p.custo_unitario_sem_imposto_brl?.toFixed(2),
      p.custo_unitario_com_imposto_brl?.toFixed(2)
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${activeSimulation.nomeSimulacao}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Simulador de Custo de Importação Simplificada</h1>
          <p className="text-muted-foreground mt-2">
            Calcule custos de importação com precisão incluindo II, ICMS e despesas aduaneiras
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={newSimulation} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Nova Simulação
          </Button>
          <Button onClick={duplicateSimulation} variant="outline">
            <Copy className="w-4 h-4 mr-2" />
            Duplicar
          </Button>
          <Button onClick={() => setShowSaveDialog(true)}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="simulation" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="simulation">Simulação Ativa</TabsTrigger>
          <TabsTrigger value="saved">Simulações Salvas</TabsTrigger>
        </TabsList>

        <TabsContent value="simulation" className="space-y-6">
          {/* Simulation Name */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                {isEditingName ? (
                  <Input
                    value={activeSimulation.nomeSimulacao}
                    onChange={(e) => setActiveSimulation(prev => ({ ...prev, nomeSimulacao: e.target.value }))}
                    onBlur={() => setIsEditingName(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                    className="text-xl font-semibold"
                    autoFocus
                  />
                ) : (
                  <CardTitle 
                    className="text-xl cursor-pointer hover:text-primary"
                    onClick={() => setIsEditingName(true)}
                  >
                    {activeSimulation.nomeSimulacao}
                  </CardTitle>
                )}
                <Badge variant="secondary">
                  {selectedSimulationId ? "Salva" : "Não Salva"}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Configuration */}
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
                  step="0.01"
                  value={activeSimulation.configuracoesGerais.taxa_cambio_usd_brl}
                  onChange={(e) => updateConfig('taxa_cambio_usd_brl', parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <Label htmlFor="aliquota_ii">Alíquota II (%)</Label>
                <Input
                  id="aliquota_ii"
                  type="number"
                  step="0.01"
                  value={(activeSimulation.configuracoesGerais.aliquota_ii_percentual * 100).toFixed(2)}
                  onChange={(e) => updateConfig('aliquota_ii_percentual', (parseFloat(e.target.value) || 0) / 100)}
                />
              </div>

              <div>
                <Label htmlFor="aliquota_icms">Alíquota ICMS (%)</Label>
                <Input
                  id="aliquota_icms"
                  type="number"
                  step="0.01"
                  value={(activeSimulation.configuracoesGerais.aliquota_icms_percentual * 100).toFixed(2)}
                  onChange={(e) => updateConfig('aliquota_icms_percentual', (parseFloat(e.target.value) || 0) / 100)}
                />
              </div>

              <div>
                <Label htmlFor="frete_total">Custo Frete Internacional Total</Label>
                <Input
                  id="frete_total"
                  type="number"
                  step="0.01"
                  value={activeSimulation.configuracoesGerais.custo_frete_internacional_total_moeda_original}
                  onChange={(e) => updateConfig('custo_frete_internacional_total_moeda_original', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label htmlFor="moeda_frete">Moeda do Frete</Label>
                <Select 
                  value={activeSimulation.configuracoesGerais.moeda_frete_internacional}
                  onValueChange={(value: "USD" | "BRL") => updateConfig('moeda_frete_internacional', value)}
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
                  onChange={(e) => updateConfig('outras_despesas_aduaneiras_total_brl', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label htmlFor="metodo_frete">Método Rateio Frete</Label>
                <Select 
                  value={activeSimulation.configuracoesGerais.metodo_rateio_frete}
                  onValueChange={(value: "peso" | "valor_fob" | "quantidade") => updateConfig('metodo_rateio_frete', value)}
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
                  onValueChange={(value: "peso" | "valor_fob" | "quantidade") => updateConfig('metodo_rateio_outras_despesas', value)}
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

          {/* Products Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Produtos da Simulação</CardTitle>
                <Button onClick={addProduct}>
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
                        <th className="text-left p-2">Custo Unit. c/ Imp.</th>
                        <th className="text-left p-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculatedResults.produtos.map((produto, index) => (
                        <tr key={produto.id_produto_interno} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <Input
                              value={produto.descricao_produto}
                              onChange={(e) => updateProduct(index, 'descricao_produto', e.target.value)}
                              placeholder="Descrição do produto"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              value={produto.quantidade}
                              onChange={(e) => updateProduct(index, 'quantidade', parseInt(e.target.value) || 0)}
                              className="w-20"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={produto.valor_unitario_usd}
                              onChange={(e) => updateProduct(index, 'valor_unitario_usd', parseFloat(e.target.value) || 0)}
                              className="w-24"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              step="0.001"
                              value={produto.peso_bruto_unitario_kg}
                              onChange={(e) => updateProduct(index, 'peso_bruto_unitario_kg', parseFloat(e.target.value) || 0)}
                              className="w-24"
                            />
                          </td>
                          <td className="p-2 text-sm text-right">
                            R$ {produto.custo_produto_brl?.toFixed(2) || '0.00'}
                          </td>
                          <td className="p-2 text-sm text-right">
                            R$ {produto.custo_frete_por_produto_brl?.toFixed(2) || '0.00'}
                          </td>
                          <td className="p-2 text-sm text-right font-medium">
                            R$ {produto.produto_mais_frete_brl?.toFixed(2) || '0.00'}
                          </td>
                          <td className="p-2 text-sm text-right">
                            R$ {produto.valor_ii_brl?.toFixed(2) || '0.00'}
                          </td>
                          <td className="p-2 text-sm text-right">
                            R$ {produto.valor_icms_brl?.toFixed(2) || '0.00'}
                          </td>
                          <td className="p-2 text-sm text-right font-bold text-primary">
                            R$ {produto.valor_total_produto_impostos_brl?.toFixed(2) || '0.00'}
                          </td>
                          <td className="p-2 text-sm text-right">
                            R$ {produto.custo_unitario_sem_imposto_brl?.toFixed(2) || '0.00'}
                          </td>
                          <td className="p-2 text-sm text-right font-medium">
                            R$ {produto.custo_unitario_com_imposto_brl?.toFixed(2) || '0.00'}
                          </td>
                          <td className="p-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeProduct(index)}
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
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          {activeSimulation.produtos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resumo da Simulação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {calculatedResults.totals.total_sim_quantidade_itens}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Itens</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      R$ {calculatedResults.totals.total_sim_produto_mais_frete_brl.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">Produto + Frete</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      R$ {calculatedResults.totals.total_sim_valor_ii_brl.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total II</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      R$ {calculatedResults.totals.total_sim_valor_icms_brl.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total ICMS</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      R$ {calculatedResults.totals.total_sim_outras_despesas_aduaneiras_brl.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">Outras Despesas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">
                      R$ {calculatedResults.totals.custo_total_importacao_brl.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">Custo Total</div>
                  </div>
                </div>
                
                <div className="flex justify-center mt-6">
                  <Button onClick={exportToCsv} variant="outline">
                    <FileDown className="w-4 h-4 mr-2" />
                    Exportar CSV
                  </Button>
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
                    <div key={simulation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{simulation.nomeSimulacao}</h3>
                        <p className="text-sm text-muted-foreground">
                          {simulation.produtos?.length || 0} produtos • 
                          Atualizada em {new Date(simulation.dataLastModified).toLocaleDateString('pt-BR')}
                        </p>
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Simulação</DialogTitle>
            <DialogDescription>
              {selectedSimulationId ? "Atualizar simulação existente" : "Salvar nova simulação"}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="save-name">Nome da Simulação</Label>
            <Input
              id="save-name"
              value={activeSimulation.nomeSimulacao}
              onChange={(e) => setActiveSimulation(prev => ({ ...prev, nomeSimulacao: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => saveMutation.mutate(activeSimulation)} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}