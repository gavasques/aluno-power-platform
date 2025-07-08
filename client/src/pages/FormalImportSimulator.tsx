import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Plus, Trash2, Copy, Save, Download, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLocation, useRoute } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

interface Tax {
  nome: string;
  aliquota: number;
  baseCalculo: string;
  valor: number;
}

interface Expense {
  nome: string;
  valorDolar: number;
  valorReal: number;
}

interface Product {
  id?: string;
  nome: string;
  ncm: string;
  quantidade: number;
  valorUnitarioUsd: number;
  comprimento: number; // cm
  largura: number; // cm
  altura: number; // cm
  cbmUnitario?: number;
  cbmTotal?: number;
  percentualContainer?: number;
  valorTotalUSD?: number;
  valorTotalBRL?: number;
  freteRateio?: number;
  despesasRateio?: number;
  impostos?: {
    ii: number;
    ipi: number;
    pis: number;
    cofins: number;
    icms: number;
  };
  custoTotal?: number;
  custoUnitario?: number;
}

interface FormalImportSimulation {
  id?: number;
  nome: string;
  fornecedor: string;
  despachante: string;
  agenteCargas: string;
  status: string;
  taxaDolar: number;
  valorFobDolar: number;
  valorFreteDolar: number;
  percentualSeguro: number;
  impostos: Tax[];
  despesasAdicionais: Expense[];
  produtos: Product[];
  resultados: {
    valorFobReal?: number;
    valorFreteReal?: number;
    valorCfrDolar?: number;
    valorCfrReal?: number;
    valorSeguro?: number;
    totalImpostos?: number;
    totalDespesas?: number;
    custoTotal?: number;
    cbmTotal?: number;
  };
  codigoSimulacao?: string;
  dataCriacao?: string;
  dataModificacao?: string;
}

const defaultTaxes: Tax[] = [
  { nome: "Imposto de Importação (II)", aliquota: 60, baseCalculo: "valor_fob_real", valor: 0 },
  { nome: "IPI", aliquota: 15, baseCalculo: "base_ii_ipi", valor: 0 },
  { nome: "PIS", aliquota: 2.33, baseCalculo: "total_base_calculo", valor: 0 },
  { nome: "COFINS", aliquota: 10.74, baseCalculo: "total_base_calculo", valor: 0 },
  { nome: "ICMS", aliquota: 17, baseCalculo: "total_base_calculo", valor: 0 }
];

const defaultExpenses: Expense[] = [
  { nome: "Taxa SISCOMEX", valorDolar: 0, valorReal: 214.50 },
  { nome: "Honorários Despachante", valorDolar: 0, valorReal: 500.00 },
  { nome: "Armazenagem", valorDolar: 0, valorReal: 0 },
  { nome: "Transporte Interno", valorDolar: 0, valorReal: 0 }
];

export default function FormalImportSimulator() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/simuladores/importacao-formal-direta/:id?');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("info");
  const [simulation, setSimulation] = useState<FormalImportSimulation>({
    nome: "Nova Simulação Formal",
    fornecedor: "",
    despachante: "",
    agenteCargas: "",
    status: "Em andamento",
    taxaDolar: 5.50,
    valorFobDolar: 0,
    valorFreteDolar: 0,
    percentualSeguro: 0.5,
    impostos: defaultTaxes,
    despesasAdicionais: defaultExpenses,
    produtos: [],
    resultados: {}
  });

  const simulationId = params?.id ? parseInt(params.id) : null;

  // Load existing simulation
  const { data: existingSimulation, isLoading } = useQuery({
    queryKey: ['/api/simulators/formal-import', simulationId],
    enabled: !!simulationId
  });

  useEffect(() => {
    if (existingSimulation) {
      setSimulation(existingSimulation);
    }
  }, [existingSimulation]);

  // Real-time calculation
  const calculateMutation = useMutation({
    mutationFn: async (data: FormalImportSimulation) => {
      return await apiRequest(`/api/simulators/formal-import/calculate`, {
        method: 'POST',
        body: data
      });
    },
    onSuccess: (data) => {
      setSimulation(prev => ({
        ...prev,
        produtos: data.produtos,
        resultados: data.resultados
      }));
    }
  });

  // Save simulation
  const saveMutation = useMutation({
    mutationFn: async (data: FormalImportSimulation) => {
      if (simulationId) {
        return await apiRequest(`/api/simulators/formal-import/${simulationId}`, {
          method: 'PUT',
          body: data
        });
      } else {
        return await apiRequest(`/api/simulators/formal-import`, {
          method: 'POST',
          body: data
        });
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Simulação salva com sucesso!",
        description: `Código: ${data.codigoSimulacao}`
      });
      if (!simulationId) {
        setLocation(`/simuladores/importacao-formal-direta/${data.id}`);
      }
      queryClient.invalidateQueries({ queryKey: ['/api/simulators/formal-import'] });
    }
  });

  const handleCalculate = () => {
    calculateMutation.mutate(simulation);
  };

  const handleSave = () => {
    saveMutation.mutate(simulation);
  };

  const addProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      nome: "",
      ncm: "",
      quantidade: 1,
      valorUnitarioUsd: 0,
      comprimento: 0,
      largura: 0,
      altura: 0
    };
    setSimulation(prev => ({
      ...prev,
      produtos: [...prev.produtos, newProduct]
    }));
  };

  const updateProduct = (index: number, field: keyof Product, value: any) => {
    setSimulation(prev => ({
      ...prev,
      produtos: prev.produtos.map((produto, i) => 
        i === index ? { ...produto, [field]: value } : produto
      )
    }));
  };

  const removeProduct = (index: number) => {
    setSimulation(prev => ({
      ...prev,
      produtos: prev.produtos.filter((_, i) => i !== index)
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatCBM = (value: number) => {
    return `${value.toFixed(6)} m³`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setLocation('/simuladores')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Simulador de Importação Formal</h1>
            <p className="text-muted-foreground">Cálculo com rateio por CBM</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {simulation.codigoSimulacao && (
            <Badge variant="secondary">{simulation.codigoSimulacao}</Badge>
          )}
          <Button onClick={handleCalculate} disabled={calculateMutation.isPending}>
            <Calculator className="h-4 w-4 mr-2" />
            Calcular
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="info">1. Info Inicial</TabsTrigger>
              <TabsTrigger value="insurance">2. Seguro</TabsTrigger>
              <TabsTrigger value="taxes">3. Impostos</TabsTrigger>
              <TabsTrigger value="expenses">4. Despesas</TabsTrigger>
              <TabsTrigger value="products">5. Produtos</TabsTrigger>
              <TabsTrigger value="results">6. Resultados</TabsTrigger>
              <TabsTrigger value="total">7. Total</TabsTrigger>
            </TabsList>

            {/* Seção 1: Informações Iniciais */}
            <TabsContent value="info" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Iniciais</CardTitle>
                  <CardDescription>
                    Configure os dados básicos da importação
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">Nome da Simulação</Label>
                      <Input
                        id="nome"
                        value={simulation.nome}
                        onChange={(e) => setSimulation(prev => ({ ...prev, nome: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fornecedor">Fornecedor</Label>
                      <Input
                        id="fornecedor"
                        value={simulation.fornecedor}
                        onChange={(e) => setSimulation(prev => ({ ...prev, fornecedor: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="despachante">Despachante</Label>
                      <Input
                        id="despachante"
                        value={simulation.despachante}
                        onChange={(e) => setSimulation(prev => ({ ...prev, despachante: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="agenteCargas">Agente de Cargas</Label>
                      <Input
                        id="agenteCargas"
                        value={simulation.agenteCargas}
                        onChange={(e) => setSimulation(prev => ({ ...prev, agenteCargas: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="taxaDolar">Taxa do Dólar (R$)</Label>
                      <Input
                        id="taxaDolar"
                        type="number"
                        step="0.0001"
                        value={simulation.taxaDolar}
                        onChange={(e) => setSimulation(prev => ({ ...prev, taxaDolar: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="valorFobDolar">Valor FOB (USD)</Label>
                      <Input
                        id="valorFobDolar"
                        type="number"
                        step="0.01"
                        value={simulation.valorFobDolar}
                        onChange={(e) => setSimulation(prev => ({ ...prev, valorFobDolar: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="valorFreteDolar">Valor Frete (USD)</Label>
                      <Input
                        id="valorFreteDolar"
                        type="number"
                        step="0.01"
                        value={simulation.valorFreteDolar}
                        onChange={(e) => setSimulation(prev => ({ ...prev, valorFreteDolar: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Seção 2: Seguro */}
            <TabsContent value="insurance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Seguro da Mercadoria</CardTitle>
                  <CardDescription>
                    Configure o percentual do seguro sobre o valor CFR
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="percentualSeguro">Percentual do Seguro (%)</Label>
                      <Input
                        id="percentualSeguro"
                        type="number"
                        step="0.01"
                        value={simulation.percentualSeguro}
                        onChange={(e) => setSimulation(prev => ({ ...prev, percentualSeguro: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label>Valor CFR (USD)</Label>
                      <div className="p-2 bg-gray-50 rounded border">
                        {formatUSD(simulation.valorFobDolar + simulation.valorFreteDolar)}
                      </div>
                    </div>
                    <div>
                      <Label>Valor do Seguro (USD)</Label>
                      <div className="p-2 bg-gray-50 rounded border">
                        {formatUSD((simulation.valorFobDolar + simulation.valorFreteDolar) * (simulation.percentualSeguro / 100))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Seção 3: Impostos */}
            <TabsContent value="taxes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Impostos de Nacionalização</CardTitle>
                  <CardDescription>
                    Configure as alíquotas dos impostos de importação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Imposto</TableHead>
                        <TableHead>Alíquota (%)</TableHead>
                        <TableHead>Base de Cálculo</TableHead>
                        <TableHead>Valor Estimado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {simulation.impostos.map((tax, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{tax.nome}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={tax.aliquota}
                              onChange={(e) => {
                                const newImpostos = [...simulation.impostos];
                                newImpostos[index].aliquota = parseFloat(e.target.value) || 0;
                                setSimulation(prev => ({ ...prev, impostos: newImpostos }));
                              }}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{tax.baseCalculo}</Badge>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(tax.valor || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Seção 4: Despesas Adicionais */}
            <TabsContent value="expenses" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Despesas Adicionais</CardTitle>
                  <CardDescription>
                    Configure as despesas adicionais da importação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Despesa</TableHead>
                        <TableHead>Valor USD</TableHead>
                        <TableHead>Valor BRL</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {simulation.despesasAdicionais.map((expense, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{expense.nome}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={expense.valorDolar}
                              onChange={(e) => {
                                const newDespesas = [...simulation.despesasAdicionais];
                                newDespesas[index].valorDolar = parseFloat(e.target.value) || 0;
                                setSimulation(prev => ({ ...prev, despesasAdicionais: newDespesas }));
                              }}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={expense.valorReal}
                              onChange={(e) => {
                                const newDespesas = [...simulation.despesasAdicionais];
                                newDespesas[index].valorReal = parseFloat(e.target.value) || 0;
                                setSimulation(prev => ({ ...prev, despesasAdicionais: newDespesas }));
                              }}
                              className="w-24"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Seção 5: Produtos */}
            <TabsContent value="products" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Produtos</CardTitle>
                      <CardDescription>
                        Adicione os produtos com dimensões para cálculo do CBM
                      </CardDescription>
                    </div>
                    <Button onClick={addProduct}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Produto
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {simulation.produtos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum produto adicionado. Clique em "Adicionar Produto" para começar.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>NCM</TableHead>
                            <TableHead>Qtd</TableHead>
                            <TableHead>Valor Unit. USD</TableHead>
                            <TableHead>Comp.(cm)</TableHead>
                            <TableHead>Larg.(cm)</TableHead>
                            <TableHead>Alt.(cm)</TableHead>
                            <TableHead>CBM Unit.</TableHead>
                            <TableHead>CBM Total</TableHead>
                            <TableHead>% Container</TableHead>
                            <TableHead>Custo Total</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {simulation.produtos.map((produto, index) => (
                            <TableRow key={produto.id || index}>
                              <TableCell>
                                <Input
                                  value={produto.nome}
                                  onChange={(e) => updateProduct(index, 'nome', e.target.value)}
                                  className="w-32"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={produto.ncm}
                                  onChange={(e) => updateProduct(index, 'ncm', e.target.value)}
                                  className="w-24"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={produto.quantidade}
                                  onChange={(e) => updateProduct(index, 'quantidade', parseFloat(e.target.value) || 0)}
                                  className="w-16"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={produto.valorUnitarioUsd}
                                  onChange={(e) => updateProduct(index, 'valorUnitarioUsd', parseFloat(e.target.value) || 0)}
                                  className="w-20"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={produto.comprimento}
                                  onChange={(e) => updateProduct(index, 'comprimento', parseFloat(e.target.value) || 0)}
                                  className="w-16"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={produto.largura}
                                  onChange={(e) => updateProduct(index, 'largura', parseFloat(e.target.value) || 0)}
                                  className="w-16"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={produto.altura}
                                  onChange={(e) => updateProduct(index, 'altura', parseFloat(e.target.value) || 0)}
                                  className="w-16"
                                />
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {produto.cbmUnitario ? formatCBM(produto.cbmUnitario) : '-'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {produto.cbmTotal ? formatCBM(produto.cbmTotal) : '-'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {produto.percentualContainer ? formatPercentage(produto.percentualContainer) : '-'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {produto.custoTotal ? formatCurrency(produto.custoTotal) : '-'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeProduct(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Seção 6: Resultados */}
            <TabsContent value="results" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resultados dos Cálculos</CardTitle>
                  <CardDescription>
                    Resumo detalhado dos cálculos por produto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {simulation.produtos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Adicione produtos na seção anterior para ver os resultados.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Resumo Geral */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm text-muted-foreground">FOB Real</div>
                            <div className="text-lg font-bold">
                              {formatCurrency(simulation.resultados.valorFobReal || 0)}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm text-muted-foreground">Frete Real</div>
                            <div className="text-lg font-bold">
                              {formatCurrency(simulation.resultados.valorFreteReal || 0)}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm text-muted-foreground">Total Impostos</div>
                            <div className="text-lg font-bold">
                              {formatCurrency(simulation.resultados.totalImpostos || 0)}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm text-muted-foreground">CBM Total</div>
                            <div className="text-lg font-bold">
                              {formatCBM(simulation.resultados.cbmTotal || 0)}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Detalhamento por Produto */}
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Produto</TableHead>
                              <TableHead>Valor Total BRL</TableHead>
                              <TableHead>Frete Rateio</TableHead>
                              <TableHead>Despesas Rateio</TableHead>
                              <TableHead>II</TableHead>
                              <TableHead>IPI</TableHead>
                              <TableHead>PIS</TableHead>
                              <TableHead>COFINS</TableHead>
                              <TableHead>ICMS</TableHead>
                              <TableHead>Custo Total</TableHead>
                              <TableHead>Custo Unitário</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {simulation.produtos.map((produto, index) => (
                              <TableRow key={produto.id || index}>
                                <TableCell className="font-medium">{produto.nome}</TableCell>
                                <TableCell>{formatCurrency(produto.valorTotalBRL || 0)}</TableCell>
                                <TableCell>{formatCurrency(produto.freteRateio || 0)}</TableCell>
                                <TableCell>{formatCurrency(produto.despesasRateio || 0)}</TableCell>
                                <TableCell>{formatCurrency(produto.impostos?.ii || 0)}</TableCell>
                                <TableCell>{formatCurrency(produto.impostos?.ipi || 0)}</TableCell>
                                <TableCell>{formatCurrency(produto.impostos?.pis || 0)}</TableCell>
                                <TableCell>{formatCurrency(produto.impostos?.cofins || 0)}</TableCell>
                                <TableCell>{formatCurrency(produto.impostos?.icms || 0)}</TableCell>
                                <TableCell className="font-bold">{formatCurrency(produto.custoTotal || 0)}</TableCell>
                                <TableCell className="font-bold text-blue-600">{formatCurrency(produto.custoUnitario || 0)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Seção 7: Total da Importação */}
            <TabsContent value="total" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total da Importação</CardTitle>
                  <CardDescription>
                    Resumo executivo completo da simulação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Valores em Dólar */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Valores em USD</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span>FOB:</span>
                          <span className="font-bold">{formatUSD(simulation.valorFobDolar)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Frete:</span>
                          <span className="font-bold">{formatUSD(simulation.valorFreteDolar)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CFR:</span>
                          <span className="font-bold">{formatUSD(simulation.resultados.valorCfrDolar || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Seguro:</span>
                          <span className="font-bold">{formatUSD(simulation.resultados.valorSeguro || 0)}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Valores em Real */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Valores em BRL</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span>FOB:</span>
                          <span className="font-bold">{formatCurrency(simulation.resultados.valorFobReal || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Frete:</span>
                          <span className="font-bold">{formatCurrency(simulation.resultados.valorFreteReal || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Impostos:</span>
                          <span className="font-bold">{formatCurrency(simulation.resultados.totalImpostos || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Despesas:</span>
                          <span className="font-bold">{formatCurrency(simulation.resultados.totalDespesas || 0)}</span>
                        </div>
                        <hr />
                        <div className="flex justify-between text-lg">
                          <span className="font-bold">Total:</span>
                          <span className="font-bold text-blue-600">{formatCurrency(simulation.resultados.custoTotal || 0)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Informações da Simulação */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Informações da Simulação</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Nome:</Label>
                          <div className="p-2 bg-gray-50 rounded">{simulation.nome}</div>
                        </div>
                        <div>
                          <Label>Fornecedor:</Label>
                          <div className="p-2 bg-gray-50 rounded">{simulation.fornecedor || 'Não informado'}</div>
                        </div>
                        <div>
                          <Label>Despachante:</Label>
                          <div className="p-2 bg-gray-50 rounded">{simulation.despachante || 'Não informado'}</div>
                        </div>
                        <div>
                          <Label>Agente de Cargas:</Label>
                          <div className="p-2 bg-gray-50 rounded">{simulation.agenteCargas || 'Não informado'}</div>
                        </div>
                        <div>
                          <Label>Taxa do Dólar:</Label>
                          <div className="p-2 bg-gray-50 rounded">R$ {simulation.taxaDolar.toFixed(4)}</div>
                        </div>
                        <div>
                          <Label>CBM Total:</Label>
                          <div className="p-2 bg-gray-50 rounded">{formatCBM(simulation.resultados.cbmTotal || 0)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => {
                const tabs = ["info", "insurance", "taxes", "expenses", "products", "results", "total"];
                const currentIndex = tabs.indexOf(activeTab);
                if (currentIndex > 0) {
                  setActiveTab(tabs[currentIndex - 1]);
                }
              }}
              disabled={activeTab === "info"}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            <Button
              onClick={() => {
                const tabs = ["info", "insurance", "taxes", "expenses", "products", "results", "total"];
                const currentIndex = tabs.indexOf(activeTab);
                if (currentIndex < tabs.length - 1) {
                  setActiveTab(tabs[currentIndex + 1]);
                }
              }}
              disabled={activeTab === "total"}
            >
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}