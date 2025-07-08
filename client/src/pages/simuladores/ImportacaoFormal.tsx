import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calculator, Download, FileSpreadsheet, Plus, Save, Trash2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ImportSimulation {
  id?: number;
  nomeSimulacao: string;
  codigoSimulacao?: string;
  nomeFornecedor?: string;
  observacoes?: string;
  configuracoesGerais: {
    taxaDolar: number;
    valorFreteDolar: number;
    metodoRateio: "valor" | "peso" | "quantidade" | "volume" | "personalizado";
    impostos: Array<{
      tipo: string;
      aliquota: number;
      valor: number;
      incideSobre: string;
    }>;
    despesasAdicionais: Array<{
      descricao: string;
      valor_real: number;
      metodo_rateio?: string;
    }>;
  };
  produtos: Array<ImportProduct>;
}

interface ImportProduct {
  id?: number;
  referencia?: string;
  descricao: string;
  ncm?: string;
  quantidade: number;
  valorUnitarioUsd: number;
  pesoUnitarioKg?: number;
  comprimento?: number;
  largura?: number;
  altura?: number;
  percentualPersonalizado?: number;
}

const METODOS_RATEIO = [
  { value: "valor", label: "Por Valor FOB (Padrão)" },
  { value: "peso", label: "Por Peso" },
  { value: "quantidade", label: "Por Quantidade" },
  { value: "volume", label: "Por Volume" },
  { value: "personalizado", label: "Personalizado" }
];

const TIPOS_IMPOSTO = [
  { value: "ii", label: "II - Imposto de Importação", incideSobre: "FOB" },
  { value: "ipi", label: "IPI - Imposto sobre Produtos Industrializados", incideSobre: "FOB + II" },
  { value: "pis", label: "PIS - Contribuição para o PIS", incideSobre: "Aduaneiro + Frete + Seguro" },
  { value: "cofins", label: "COFINS - Contribuição para o COFINS", incideSobre: "Aduaneiro + Frete + Seguro" },
  { value: "icms", label: "ICMS - Imposto sobre Circulação de Mercadorias", incideSobre: "Todos" }
];

export default function ImportacaoFormal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("info");
  const [currentSimulation, setCurrentSimulation] = useState<ImportSimulation>({
    nomeSimulacao: "Nova Simulação",
    configuracoesGerais: {
      taxaDolar: 5.50,
      valorFreteDolar: 0,
      metodoRateio: "valor",
      impostos: [],
      despesasAdicionais: []
    },
    produtos: []
  });
  // Products are now stored in currentSimulation.produtos
  const [newProduct, setNewProduct] = useState<ImportProduct>({
    descricao: "",
    quantidade: 1,
    valorUnitarioUsd: 0
  });
  
  // Fetch simulations
  const { data: simulations = [], isLoading } = useQuery({
    queryKey: ["/api/import-simulations"],
    retry: false
  });

  // Create simulation mutation
  const createSimulationMutation = useMutation({
    mutationFn: async (data: Partial<ImportSimulation>) => {
      return apiRequest("/api/import-simulations", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: (data) => {
      setCurrentSimulation(data);
      queryClient.invalidateQueries({ queryKey: ["/api/import-simulations"] });
      toast({
        title: "Simulação criada",
        description: "Nova simulação de importação criada com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar simulação: " + error.message,
        variant: "destructive"
      });
    }
  });

  // Update simulation mutation
  const updateSimulationMutation = useMutation({
    mutationFn: async (data: Partial<ImportSimulation>) => {
      return apiRequest(`/api/import-simulations/${currentSimulation.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: (data) => {
      setCurrentSimulation(data);
      queryClient.invalidateQueries({ queryKey: ["/api/import-simulations"] });
      toast({
        title: "Simulação salva",
        description: "Simulação atualizada com sucesso."
      });
    }
  });

  // Add product mutation
  const addProductMutation = useMutation({
    mutationFn: async (product: ImportProduct) => {
      return apiRequest(`/api/import-simulations/${currentSimulation.id}/products`, {
        method: "POST",
        body: JSON.stringify(product),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: (data) => {
      setCurrentSimulation(prev => ({
        ...prev,
        produtos: [...prev.produtos, data]
      }));
      setNewProduct({
        descricao: "",
        quantidade: 1,
        valorUnitarioUsd: 0
      });
      toast({
        title: "Produto adicionado",
        description: "Produto adicionado à simulação."
      });
    }
  });

  // Calculate results mutation  
  const calculateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/import-simulations/${currentSimulation.id}/calculate`, {
        method: "POST"
      });
    },
    onSuccess: (data) => {
      setCurrentSimulation(data);
      toast({
        title: "Cálculo concluído",
        description: "Simulação calculada com sucesso."
      });
    }
  });

  const handleSaveSimulation = () => {
    if (currentSimulation.id) {
      updateSimulationMutation.mutate(currentSimulation);
    } else {
      createSimulationMutation.mutate(currentSimulation);
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.descricao || newProduct.valorUnitarioUsd <= 0) {
      toast({
        title: "Erro",
        description: "Preencha a descrição e valor do produto.",
        variant: "destructive"
      });
      return;
    }
    
    if (!currentSimulation.id) {
      toast({
        title: "Erro",
        description: "Salve a simulação antes de adicionar produtos.",
        variant: "destructive"
      });
      return;
    }
    
    addProductMutation.mutate(newProduct);
  };

  const addImposto = () => {
    setCurrentSimulation({
      ...currentSimulation,
      configuracoesGerais: {
        ...currentSimulation.configuracoesGerais,
        impostos: [...currentSimulation.configuracoesGerais.impostos, {
          tipo: "ii",
          aliquota: 0,
          valor: 0,
          incideSobre: "FOB"
        }]
      }
    });
  };

  const addDespesa = () => {
    setCurrentSimulation({
      ...currentSimulation,
      configuracoesGerais: {
        ...currentSimulation.configuracoesGerais,
        despesasAdicionais: [...currentSimulation.configuracoesGerais.despesasAdicionais, {
          descricao: "",
          valor_real: 0
        }]
      }
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatCurrencyUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Simulador de Importação Formal</h1>
          <p className="text-muted-foreground">
            Calcule custos completos de importação com rateio por produto
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSaveSimulation} disabled={updateSimulationMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
          <Button 
            onClick={() => calculateMutation.mutate()} 
            disabled={!currentSimulation.id || calculateMutation.isPending}
          >
            <Calculator className="h-4 w-4 mr-2" />
            Calcular
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">Informações Gerais</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="taxes">Impostos e Despesas</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados da Simulação</CardTitle>
              <CardDescription>
                Configure as informações básicas da importação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nomeSimulacao">Nome da Simulação</Label>
                  <Input
                    id="nomeSimulacao"
                    value={currentSimulation.nomeSimulacao}
                    onChange={(e) => setCurrentSimulation({
                      ...currentSimulation,
                      nomeSimulacao: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="nomeFornecedor">Fornecedor</Label>
                  <Input
                    id="nomeFornecedor"
                    value={currentSimulation.nomeFornecedor || ""}
                    onChange={(e) => setCurrentSimulation({
                      ...currentSimulation,
                      nomeFornecedor: e.target.value
                    })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={currentSimulation.observacoes || ""}
                    onChange={(e) => setCurrentSimulation({
                      ...currentSimulation,
                      observacoes: e.target.value
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações de Câmbio e Valores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taxaDolar">Taxa do Dólar (R$)</Label>
                  <Input
                    id="taxaDolar"
                    type="number"
                    step="0.01"
                    value={currentSimulation.configuracoesGerais.taxaDolar}
                    onChange={(e) => setCurrentSimulation({
                      ...currentSimulation,
                      configuracoesGerais: {
                        ...currentSimulation.configuracoesGerais,
                        taxaDolar: parseFloat(e.target.value) || 0
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="valorFreteDolar">Valor Frete (USD)</Label>
                  <Input
                    id="valorFreteDolar"
                    type="number"
                    step="0.01"
                    value={currentSimulation.configuracoesGerais.valorFreteDolar}
                    onChange={(e) => setCurrentSimulation({
                      ...currentSimulation,
                      configuracoesGerais: {
                        ...currentSimulation.configuracoesGerais,
                        valorFreteDolar: parseFloat(e.target.value) || 0
                      }
                    })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="metodoRateio">Método de Rateio</Label>
                <Select 
                  value={currentSimulation.configuracoesGerais.metodoRateio} 
                  onValueChange={(value) => setCurrentSimulation({
                    ...currentSimulation,
                    configuracoesGerais: {
                      ...currentSimulation.configuracoesGerais,
                      metodoRateio: value as any
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o método de rateio" />
                  </SelectTrigger>
                  <SelectContent>
                    {METODOS_RATEIO.map(metodo => (
                      <SelectItem key={metodo.value} value={metodo.value}>
                        {metodo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Produto</CardTitle>
              <CardDescription>
                Adicione produtos à simulação de importação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="produtoDescricao">Descrição do Produto</Label>
                  <Input
                    id="produtoDescricao"
                    value={newProduct.descricao}
                    onChange={(e) => setNewProduct({
                      ...newProduct,
                      descricao: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="produtoQuantidade">Quantidade</Label>
                  <Input
                    id="produtoQuantidade"
                    type="number"
                    value={newProduct.quantidade}
                    onChange={(e) => setNewProduct({
                      ...newProduct,
                      quantidade: parseInt(e.target.value) || 1
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="produtoValor">Valor Unitário (USD)</Label>
                  <Input
                    id="produtoValor"
                    type="number"
                    step="0.01"
                    value={newProduct.valorUnitarioUsd}
                    onChange={(e) => setNewProduct({
                      ...newProduct,
                      valorUnitarioUsd: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
              </div>
              <Button onClick={handleAddProduct} disabled={addProductMutation.isPending}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Produto
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Valor Unit. (USD)</TableHead>
                    <TableHead>Total (USD)</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentSimulation.produtos.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>{product.descricao}</TableCell>
                      <TableCell>{product.quantidade}</TableCell>
                      <TableCell>{formatCurrencyUSD(product.valorUnitarioUsd)}</TableCell>
                      <TableCell>{formatCurrencyUSD(product.quantidade * product.valorUnitarioUsd)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setCurrentSimulation(prev => ({
                              ...prev,
                              produtos: prev.produtos.filter((_, i) => i !== index)
                            }));
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Impostos</CardTitle>
              <CardDescription>
                Configure os impostos de importação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={addImposto} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Imposto
              </Button>
              
              <div className="space-y-3">
                {currentSimulation.configuracoesGerais.impostos.map((imposto, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded">
                    <Select 
                      value={imposto.tipo}
                      onValueChange={(value) => {
                        const novosImpostos = [...currentSimulation.configuracoesGerais.impostos];
                        novosImpostos[index].tipo = value;
                        setCurrentSimulation({
                          ...currentSimulation,
                          configuracoesGerais: {
                            ...currentSimulation.configuracoesGerais,
                            impostos: novosImpostos
                          }
                        });
                      }}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_IMPOSTO.map(tipo => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="flex items-center gap-2">
                      <Label>Alíquota:</Label>
                      <Input
                        type="number"
                        step="0.01"
                        className="w-20"
                        value={imposto.aliquota}
                        onChange={(e) => {
                          const novosImpostos = [...currentSimulation.configuracoesGerais.impostos];
                          novosImpostos[index].aliquota = parseFloat(e.target.value) || 0;
                          setCurrentSimulation({
                            ...currentSimulation,
                            configuracoesGerais: {
                              ...currentSimulation.configuracoesGerais,
                              impostos: novosImpostos
                            }
                          });
                        }}
                      />
                      <span>%</span>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        const novosImpostos = currentSimulation.configuracoesGerais.impostos.filter((_, i) => i !== index);
                        setCurrentSimulation({
                          ...currentSimulation,
                          configuracoesGerais: {
                            ...currentSimulation.configuracoesGerais,
                            impostos: novosImpostos
                          }
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Despesas Adicionais</CardTitle>
              <CardDescription>
                Adicione despesas extras da importação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={addDespesa} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Despesa
              </Button>
              
              <div className="space-y-3">
                {currentSimulation.configuracoesGerais.despesasAdicionais.map((despesa, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded">
                    <Input
                      placeholder="Descrição da despesa"
                      value={despesa.descricao}
                      onChange={(e) => {
                        const novasDespesas = [...currentSimulation.configuracoesGerais.despesasAdicionais];
                        novasDespesas[index].descricao = e.target.value;
                        setCurrentSimulation({
                          ...currentSimulation,
                          configuracoesGerais: {
                            ...currentSimulation.configuracoesGerais,
                            despesasAdicionais: novasDespesas
                          }
                        });
                      }}
                    />
                    
                    <div className="flex items-center gap-2">
                      <Label>Valor:</Label>
                      <Input
                        type="number"
                        step="0.01"
                        className="w-32"
                        value={despesa.valor_real}
                        onChange={(e) => {
                          const novasDespesas = [...currentSimulation.configuracoesGerais.despesasAdicionais];
                          novasDespesas[index].valor_real = parseFloat(e.target.value) || 0;
                          setCurrentSimulation({
                            ...currentSimulation,
                            configuracoesGerais: {
                              ...currentSimulation.configuracoesGerais,
                              despesasAdicionais: novasDespesas
                            }
                          });
                        }}
                      />
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        const novasDespesas = currentSimulation.configuracoesGerais.despesasAdicionais.filter((_, i) => i !== index);
                        setCurrentSimulation({
                          ...currentSimulation,
                          configuracoesGerais: {
                            ...currentSimulation.configuracoesGerais,
                            despesasAdicionais: novasDespesas
                          }
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo dos Resultados</CardTitle>
              <CardDescription>
                Resultados calculados da simulação de importação
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentSimulation.configuracoesGerais && Object.keys(currentSimulation.configuracoesGerais).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Taxa do Dólar</Label>
                    <div className="text-lg font-semibold">
                      {formatCurrency(currentSimulation.configuracoesGerais.taxaDolar)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Valor Frete (USD)</Label>
                    <div className="text-lg font-semibold">
                      {formatCurrencyUSD(currentSimulation.configuracoesGerais.valorFreteDolar)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Produtos Cadastrados</Label>
                    <div className="text-lg font-semibold">
                      {currentSimulation.produtos.length} produto(s)
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Valor FOB Total (USD)</Label>
                    <div className="text-lg font-semibold">
                      {formatCurrencyUSD(currentSimulation.produtos.reduce((sum, p) => sum + (p.valorUnitarioUsd * p.quantidade), 0))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Método de Rateio</Label>
                    <div className="text-lg font-semibold">
                      {METODOS_RATEIO.find(m => m.value === currentSimulation.configuracoesGerais.metodoRateio)?.label || "Não definido"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div className="text-lg font-semibold">
                      <Badge variant="outline">Em configuração</Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                  <p>Clique em "Calcular" para ver os resultados da simulação</p>
                </div>
              )}
            </CardContent>
          </Card>

          {currentSimulation.produtos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Exportar Resultados</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button variant="outline">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}