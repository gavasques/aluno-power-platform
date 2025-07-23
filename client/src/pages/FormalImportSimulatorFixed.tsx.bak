import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calculator, Plus, Trash2, Copy, Save, Download, ArrowLeft, ArrowRight, X, History, Check, FileText } from 'lucide-react';

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
  { nome: "Imposto de Importação (II)", aliquota: 14.4, baseCalculo: "fob_frete_seguro", valor: 0 },
  { nome: "IPI", aliquota: 3.25, baseCalculo: "fob_frete_seguro", valor: 0 },
  { nome: "PIS", aliquota: 2.1, baseCalculo: "fob_frete_seguro", valor: 0 },
  { nome: "COFINS", aliquota: 9.65, baseCalculo: "fob_frete_seguro", valor: 0 },
  { nome: "ICMS", aliquota: 12, baseCalculo: "fob_frete_seguro", valor: 0 }
];

const defaultExpenses: Expense[] = [
  { nome: "AFRMM (Marinha Mercante)", valorDolar: 300, valorReal: 1650.00 },
  { nome: "CAPATAZIA", valorDolar: 236.36, valorReal: 1300.00 },
  { nome: "TX LIBER./BL/AWB", valorDolar: 106.36, valorReal: 585.00 },
  { nome: "THC Movimentação", valorDolar: 112.73, valorReal: 620.00 },
  { nome: "Desconsolidação", valorDolar: 63.64, valorReal: 350.00 },
  { nome: "ISPS", valorDolar: 36.36, valorReal: 200.00 },
  { nome: "Container/Lacre", valorDolar: 49.09, valorReal: 270.00 },
  { nome: "Damage Fee", valorDolar: 45.00, valorReal: 247.50 },
  { nome: "Taxa SISCOMEX", valorDolar: 29.53, valorReal: 162.42 },
  { nome: "Frete Nacional", valorDolar: 1818.36, valorReal: 10001.00 },
  { nome: "Honorários Despachante", valorDolar: 272.73, valorReal: 1500.00 },
  { nome: "DOC Fee", valorDolar: 35.45, valorReal: 195.00 },
  { nome: "DAS", valorDolar: 47.71, valorReal: 262.40 }
];

export default function FormalImportSimulatorFixed() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/simuladores/importacao-formal-direta/editar/:id');
  const isEdit = !!match;
  const simulationId = params?.id;

  const [activeTab, setActiveTab] = useState("info");
  const [showAddTaxDialog, setShowAddTaxDialog] = useState(false);
  const [newTax, setNewTax] = useState<Tax>({
    nome: "",
    aliquota: 0,
    baseCalculo: "fob_frete_seguro",
    valor: 0
  });

  const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false);
  const [newExpense, setNewExpense] = useState<Expense>({
    nome: "",
    valorDolar: 0,
    valorReal: 0
  });

  const defaultTaxNames = ["Imposto de Importação (II)", "IPI", "PIS", "COFINS", "ICMS"];

  const [simulation, setSimulation] = useState<FormalImportSimulation>({
    nome: "Nova Simulação Formal",
    fornecedor: "",
    despachante: "",
    agenteCargas: "",
    status: "Em andamento",
    taxaDolar: 5.50,
    valorFobDolar: 1000,
    valorFreteDolar: 200,
    percentualSeguro: 0.18,
    impostos: [...defaultTaxes],
    despesasAdicionais: [...defaultExpenses],
    produtos: [
      {
        id: "1",
        nome: "Produto 1",
        ncm: "",
        quantidade: 1,
        valorUnitarioUsd: 100,
        comprimento: 30,
        largura: 20,
        altura: 15
      }
    ],
    resultados: {}
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && simulationId) {
      fetchSimulation(simulationId);
    }
  }, [isEdit, simulationId]);

  // Funções de formatação
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

  const formatPercentage = (value: number) => {
    return `${((value || 0) * 100).toFixed(2)}%`;
  };

  const formatCBM = (value: number) => `${value.toFixed(6)} m³`;

  const fetchSimulation = async (id: string) => {
    try {
      console.log('🚀 SIMULATOR: Loading simulation', id);
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/simulators/formal-import/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ SIMULATOR: Data loaded:', data);
      
      // Processar dados recebidos para garantir tipos corretos
      const processedSimulation = {
        ...simulation, // Manter estrutura atual
        ...data,
        taxaDolar: parseFloat(data.taxaDolar) || 5.50,
        valorFobDolar: parseFloat(data.valorFobDolar) || 0,
        valorFreteDolar: parseFloat(data.valorFreteDolar) || 0,
        percentualSeguro: parseFloat(data.percentualSeguro) || 0.18,
        impostos: data.impostos || [...defaultTaxes],
        despesasAdicionais: data.despesasAdicionais || [...defaultExpenses],
        produtos: data.produtos || [],
        resultados: data.resultados || {}
      };
      
      setSimulation(processedSimulation);
      setIsLoading(false);
    } catch (err: any) {
      console.error('❌ SIMULATOR: Error:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const saveSimulation = async () => {
    try {
      console.log('💾 SIMULATOR: Saving simulation...');
      setIsSaving(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      const url = isEdit 
        ? `/api/simulators/formal-import/${simulationId}`
        : '/api/simulators/formal-import';
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(simulation),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const savedData = await response.json();
      console.log('✅ SIMULATOR: Saved successfully:', savedData);
      
      // Update local state with saved data
      setSimulation(savedData);
      setIsSaving(false);

      // Navigate back to list after a short delay
      setTimeout(() => {
        setLocation('/simuladores/importacao-formal-direta');
      }, 1000);

    } catch (err: any) {
      console.error('❌ SIMULATOR: Save error:', err);
      setError(err.message);
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof FormalImportSimulation, value: any) => {
    setSimulation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Gestão de produtos
  const addProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      nome: `Produto ${(simulation.produtos || []).length + 1}`,
      ncm: "",
      quantidade: 1,
      valorUnitarioUsd: 0,
      comprimento: 0,
      largura: 0,
      altura: 0
    };
    setSimulation(prev => ({
      ...prev,
      produtos: [...(prev.produtos || []), newProduct]
    }));
  };

  const updateProduct = (index: number, field: keyof Product, value: any) => {
    setSimulation(prev => {
      const updatedProducts = (prev.produtos || []).map((produto, i) => {
        if (i === index) {
          const updatedProduct = { ...produto, [field]: value };
          
          // Calcular CBM automaticamente quando dimensões mudarem
          if (['comprimento', 'largura', 'altura', 'quantidade'].includes(field)) {
            const comp = parseFloat(String(updatedProduct.comprimento)) || 0;
            const larg = parseFloat(String(updatedProduct.largura)) || 0;
            const alt = parseFloat(String(updatedProduct.altura)) || 0;
            const quant = parseFloat(String(updatedProduct.quantidade)) || 0;
            
            const cbmUnitario = comp > 0 && larg > 0 && alt > 0 ? (comp * larg * alt) / 1000000 : 0;
            const cbmTotal = cbmUnitario * quant;
            
            return {
              ...updatedProduct,
              cbmUnitario: Number((cbmUnitario || 0).toFixed(6)),
              cbmTotal: Number((cbmTotal || 0).toFixed(6))
            };
          }
          
          return updatedProduct;
        }
        return produto;
      });

      return { ...prev, produtos: updatedProducts };
    });
  };

  const removeProduct = (index: number) => {
    setSimulation(prev => ({
      ...prev,
      produtos: (prev.produtos || []).filter((_, i) => i !== index)
    }));
  };

  // Gestão de impostos
  const addTax = () => {
    if (newTax.nome && newTax.aliquota > 0) {
      setSimulation(prev => ({
        ...prev,
        impostos: [...(prev.impostos || []), { ...newTax }]
      }));
      setNewTax({ nome: "", aliquota: 0, baseCalculo: "fob_frete_seguro", valor: 0 });
      setShowAddTaxDialog(false);
    }
  };

  const removeTax = (index: number) => {
    const tax = simulation.impostos[index];
    if (!defaultTaxNames.includes(tax.nome)) {
      setSimulation(prev => ({
        ...prev,
        impostos: (prev.impostos || []).filter((_, i) => i !== index)
      }));
    }
  };

  const updateTax = (index: number, field: keyof Tax, value: any) => {
    setSimulation(prev => ({
      ...prev,
      impostos: (prev.impostos || []).map((tax, i) => 
        i === index ? { ...tax, [field]: value } : tax
      )
    }));
  };

  // Gestão de despesas
  const addExpense = () => {
    if (newExpense.nome && (newExpense.valorDolar > 0 || newExpense.valorReal > 0)) {
      setSimulation(prev => ({
        ...prev,
        despesasAdicionais: [...(prev.despesasAdicionais || []), { ...newExpense }]
      }));
      setNewExpense({ nome: "", valorDolar: 0, valorReal: 0 });
      setShowAddExpenseDialog(false);
    }
  };

  const removeExpense = (index: number) => {
    setSimulation(prev => ({
      ...prev,
      despesasAdicionais: (prev.despesasAdicionais || []).filter((_, i) => i !== index)
    }));
  };

  const updateExpense = (index: number, field: keyof Expense, value: any) => {
    setSimulation(prev => ({
      ...prev,
      despesasAdicionais: (prev.despesasAdicionais || []).map((expense, i) => 
        i === index ? { ...expense, [field]: value } : expense
      )
    }));
  };

  const calculateResults = () => {
    const fobReal = simulation.valorFobDolar * simulation.taxaDolar;
    const freteReal = simulation.valorFreteDolar * simulation.taxaDolar;
    const seguroReal = (simulation.valorFobDolar + simulation.valorFreteDolar) * (simulation.percentualSeguro / 100) * simulation.taxaDolar;
    const cfrReal = fobReal + freteReal + seguroReal;
    
    // Calcular CBM total dos produtos
    const cbmTotal = (simulation.produtos || []).reduce((total, produto) => 
      total + (produto.cbmTotal || 0), 0);
    
    // Calcular impostos
    const baseCalculoValue = cfrReal;
    const totalImpostos = (simulation.impostos || []).reduce((total, imposto) => 
      total + (baseCalculoValue * (imposto.aliquota / 100)), 0);
    
    // Calcular despesas totais
    const totalDespesas = (simulation.despesasAdicionais || []).reduce((total, despesa) => 
      total + (despesa.valorReal || 0), 0);
    
    const custoTotal = cfrReal + totalImpostos + totalDespesas;

    return {
      valorFobReal: fobReal,
      valorFreteReal: freteReal,
      valorCfrDolar: simulation.valorFobDolar + simulation.valorFreteDolar,
      valorCfrReal: cfrReal,
      valorSeguro: seguroReal,
      totalImpostos,
      totalDespesas,
      custoTotal,
      cbmTotal
    };
  };

  const results = calculateResults();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando simulação...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar simulação</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={() => setLocation('/simuladores/importacao-formal-direta')} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Voltar à Lista
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setLocation('/simuladores/importacao-formal-direta')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? 'Editar Simulação' : 'Nova Simulação'}
            </h1>
            <p className="text-gray-600 mt-2">Simulação de Importação Formal</p>
          </div>
        </div>
        <Button 
          onClick={saveSimulation}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="impostos">Impostos</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
          <TabsTrigger value="resultados">Resultados</TabsTrigger>
        </TabsList>

        {/* Tab de Informações Básicas */}
        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome da Simulação *</Label>
                  <Input
                    id="nome"
                    value={simulation.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    placeholder="Ex: PO 4002"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={simulation.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Em andamento">Em andamento</SelectItem>
                      <SelectItem value="Concluída">Concluída</SelectItem>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="fornecedor">Fornecedor</Label>
                  <Input
                    id="fornecedor"
                    value={simulation.fornecedor}
                    onChange={(e) => handleInputChange('fornecedor', e.target.value)}
                    placeholder="Ex: AKIO"
                  />
                </div>
                <div>
                  <Label htmlFor="despachante">Despachante</Label>
                  <Input
                    id="despachante"
                    value={simulation.despachante}
                    onChange={(e) => handleInputChange('despachante', e.target.value)}
                    placeholder="Ex: 3S"
                  />
                </div>
                <div>
                  <Label htmlFor="agenteCargas">Agente de Cargas</Label>
                  <Input
                    id="agenteCargas"
                    value={simulation.agenteCargas}
                    onChange={(e) => handleInputChange('agenteCargas', e.target.value)}
                    placeholder="Ex: 3S"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Informações Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="taxaDolar">Taxa do Dólar (R$)</Label>
                  <Input
                    id="taxaDolar"
                    type="number"
                    step="0.0001"
                    value={simulation.taxaDolar}
                    onChange={(e) => handleInputChange('taxaDolar', parseFloat(e.target.value) || 0)}
                    placeholder="5.5000"
                    className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />
                </div>
                <div>
                  <Label htmlFor="valorFobDolar">Valor FOB (USD)</Label>
                  <Input
                    id="valorFobDolar"
                    type="number"
                    step="0.01"
                    value={simulation.valorFobDolar}
                    onChange={(e) => handleInputChange('valorFobDolar', parseFloat(e.target.value) || 0)}
                    placeholder="20940.00"
                    className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />
                </div>
                <div>
                  <Label htmlFor="valorFreteDolar">Valor Frete (USD)</Label>
                  <Input
                    id="valorFreteDolar"
                    type="number"
                    step="0.01"
                    value={simulation.valorFreteDolar}
                    onChange={(e) => handleInputChange('valorFreteDolar', parseFloat(e.target.value) || 0)}
                    placeholder="3750.00"
                    className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />
                </div>
                <div>
                  <Label htmlFor="percentualSeguro">Seguro (%)</Label>
                  <Input
                    id="percentualSeguro"
                    type="number"
                    step="0.01"
                    value={simulation.percentualSeguro}
                    onChange={(e) => handleInputChange('percentualSeguro', parseFloat(e.target.value) || 0)}
                    placeholder="0.18"
                    className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Produtos */}
        <TabsContent value="produtos" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Gestão de Produtos</CardTitle>
                <Button onClick={addProduct} className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Produto
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {simulation.produtos && simulation.produtos.length > 0 ? (
                <div className="space-y-4">
                  {simulation.produtos.map((produto, index) => (
                    <Card key={produto.id || index} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-lg font-medium">Produto {index + 1}</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeProduct(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <Label>Nome do Produto</Label>
                            <Input
                              value={produto.nome}
                              onChange={(e) => updateProduct(index, 'nome', e.target.value)}
                              placeholder="Nome do produto"
                            />
                          </div>
                          <div>
                            <Label>NCM</Label>
                            <Input
                              value={produto.ncm}
                              onChange={(e) => updateProduct(index, 'ncm', e.target.value)}
                              placeholder="0000.00.00"
                            />
                          </div>
                          <div>
                            <Label>Quantidade</Label>
                            <Input
                              type="number"
                              value={produto.quantidade}
                              onChange={(e) => updateProduct(index, 'quantidade', parseInt(e.target.value) || 0)}
                              placeholder="1"
                              className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                            />
                          </div>
                          <div>
                            <Label>Valor Unitário (USD)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={produto.valorUnitarioUsd}
                              onChange={(e) => updateProduct(index, 'valorUnitarioUsd', parseFloat(e.target.value) || 0)}
                              placeholder="100.00"
                              className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                            />
                          </div>
                          <div>
                            <Label>Comprimento (cm)</Label>
                            <Input
                              type="number"
                              value={produto.comprimento}
                              onChange={(e) => updateProduct(index, 'comprimento', parseFloat(e.target.value) || 0)}
                              placeholder="30"
                              className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                            />
                          </div>
                          <div>
                            <Label>Largura (cm)</Label>
                            <Input
                              type="number"
                              value={produto.largura}
                              onChange={(e) => updateProduct(index, 'largura', parseFloat(e.target.value) || 0)}
                              placeholder="20"
                              className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                            />
                          </div>
                          <div>
                            <Label>Altura (cm)</Label>
                            <Input
                              type="number"
                              value={produto.altura}
                              onChange={(e) => updateProduct(index, 'altura', parseFloat(e.target.value) || 0)}
                              placeholder="15"
                              className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                            />
                          </div>
                          <div>
                            <Label>CBM Unitário</Label>
                            <Input
                              value={formatCBM(produto.cbmUnitario || 0)}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                          <div>
                            <Label>CBM Total</Label>
                            <Input
                              value={formatCBM(produto.cbmTotal || 0)}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Nenhum produto adicionado</p>
                  <Button onClick={addProduct} className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Produto
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Impostos */}
        <TabsContent value="impostos" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Gestão de Impostos</CardTitle>
                <Dialog open={showAddTaxDialog} onOpenChange={setShowAddTaxDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Imposto
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Novo Imposto</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Nome do Imposto</Label>
                        <Input
                          value={newTax.nome}
                          onChange={(e) => setNewTax({...newTax, nome: e.target.value})}
                          placeholder="Ex: Taxa Adicional"
                        />
                      </div>
                      <div>
                        <Label>Alíquota (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newTax.aliquota}
                          onChange={(e) => setNewTax({...newTax, aliquota: parseFloat(e.target.value) || 0})}
                          placeholder="5.00"
                          className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddTaxDialog(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={addTax} className="bg-purple-600 hover:bg-purple-700 text-white">
                        Adicionar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imposto</TableHead>
                    <TableHead>Alíquota (%)</TableHead>
                    <TableHead>Valor Calculado</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {simulation.impostos?.map((imposto, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{imposto.nome}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={imposto.aliquota}
                          onChange={(e) => updateTax(index, 'aliquota', parseFloat(e.target.value) || 0)}
                          className="w-24 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                        />
                      </TableCell>
                      <TableCell>
                        {formatCurrency((results.valorCfrReal || 0) * (imposto.aliquota / 100))}
                      </TableCell>
                      <TableCell>
                        {!defaultTaxNames.includes(imposto.nome) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeTax(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Despesas */}
        <TabsContent value="despesas" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Gestão de Despesas</CardTitle>
                <Dialog open={showAddExpenseDialog} onOpenChange={setShowAddExpenseDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Despesa
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nova Despesa</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Nome da Despesa</Label>
                        <Input
                          value={newExpense.nome}
                          onChange={(e) => setNewExpense({...newExpense, nome: e.target.value})}
                          placeholder="Ex: Taxa Especial"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Valor em Dólar</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={newExpense.valorDolar}
                            onChange={(e) => setNewExpense({...newExpense, valorDolar: parseFloat(e.target.value) || 0})}
                            placeholder="100.00"
                            className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                          />
                        </div>
                        <div>
                          <Label>Valor em Real</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={newExpense.valorReal}
                            onChange={(e) => setNewExpense({...newExpense, valorReal: parseFloat(e.target.value) || 0})}
                            placeholder="550.00"
                            className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddExpenseDialog(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={addExpense} className="bg-orange-600 hover:bg-orange-700 text-white">
                        Adicionar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Despesa</TableHead>
                    <TableHead>Valor USD</TableHead>
                    <TableHead>Valor BRL</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {simulation.despesasAdicionais?.map((despesa, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{despesa.nome}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={despesa.valorDolar}
                          onChange={(e) => updateExpense(index, 'valorDolar', parseFloat(e.target.value) || 0)}
                          className="w-32 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={despesa.valorReal}
                          onChange={(e) => updateExpense(index, 'valorReal', parseFloat(e.target.value) || 0)}
                          className="w-32 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeExpense(index)}
                          className="text-red-600 hover:text-red-700"
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

        {/* Tab de Resultados */}
        <TabsContent value="resultados" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
              <CardDescription>
                Calculado automaticamente com base nos dados informados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium mb-2">FOB</div>
                  <div className="text-2xl font-bold text-blue-800">{formatCurrency(results.valorFobReal || 0)}</div>
                  <div className="text-sm text-blue-600">{formatUSD(simulation.valorFobDolar)}</div>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="text-sm text-green-600 font-medium mb-2">Frete</div>
                  <div className="text-2xl font-bold text-green-800">{formatCurrency(results.valorFreteReal || 0)}</div>
                  <div className="text-sm text-green-600">{formatUSD(simulation.valorFreteDolar)}</div>
                </div>
                
                <div className="bg-orange-50 p-6 rounded-lg">
                  <div className="text-sm text-orange-600 font-medium mb-2">Seguro</div>
                  <div className="text-2xl font-bold text-orange-800">{formatCurrency(results.valorSeguro || 0)}</div>
                  <div className="text-sm text-orange-600">{formatPercentage(simulation.percentualSeguro / 100)}</div>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium mb-2">CFR Total</div>
                  <div className="text-2xl font-bold text-purple-800">{formatCurrency(results.valorCfrReal || 0)}</div>
                  <div className="text-sm text-purple-600">{formatUSD(results.valorCfrDolar || 0)}</div>
                </div>
                
                <div className="bg-red-50 p-6 rounded-lg">
                  <div className="text-sm text-red-600 font-medium mb-2">Total Impostos</div>
                  <div className="text-2xl font-bold text-red-800">{formatCurrency(results.totalImpostos || 0)}</div>
                  <div className="text-sm text-red-600">{simulation.impostos?.length || 0} impostos</div>
                </div>
                
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <div className="text-sm text-yellow-600 font-medium mb-2">Total Despesas</div>
                  <div className="text-2xl font-bold text-yellow-800">{formatCurrency(results.totalDespesas || 0)}</div>
                  <div className="text-sm text-yellow-600">{simulation.despesasAdicionais?.length || 0} despesas</div>
                </div>
                
                <div className="bg-indigo-50 p-6 rounded-lg">
                  <div className="text-sm text-indigo-600 font-medium mb-2">CBM Total</div>
                  <div className="text-2xl font-bold text-indigo-800">{formatCBM(results.cbmTotal || 0)}</div>
                  <div className="text-sm text-indigo-600">{simulation.produtos?.length || 0} produtos</div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-300">
                  <div className="text-sm text-gray-600 font-medium mb-2">CUSTO TOTAL</div>
                  <div className="text-3xl font-bold text-gray-800">{formatCurrency(results.custoTotal || 0)}</div>
                  <div className="text-sm text-gray-600">Valor final da importação</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => setLocation('/simuladores/importacao-formal-direta')}
        >
          Cancelar
        </Button>
        <Button 
          onClick={saveSimulation}
          disabled={isSaving || !simulation.nome}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Salvando...' : isEdit ? 'Atualizar Simulação' : 'Criar Simulação'}
        </Button>
      </div>
    </div>
  );
}
