import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Plus, Trash2, Copy, Save, Download, ArrowLeft, ArrowRight, X, History, Check, FileText } from 'lucide-react';
import { useLocation, useRoute } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import jsPDF from 'jspdf';

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

// Função de formatação CBM específica para PDF
const formatCBM = (value: number) => `${value.toFixed(6)} m³`;

// Função de formatação USD
const formatUSD = (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Função de formatação de moeda brasileira
const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Função de exportar PDF
const exportToPDF = (simulation: FormalImportSimulation) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = 30;

  // Configuração de fonte padrão
  doc.setFont('helvetica');

  // CABEÇALHO
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SIMULAÇÃO DE IMPORTAÇÃO FORMAL', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${simulation.nome || 'Simulação'} - ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // INFORMAÇÕES DA SIMULAÇÃO
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMAÇÕES DA SIMULAÇÃO', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const infoItems = [
    `Fornecedor: ${simulation.fornecedor || 'Não informado'}`,
    `Despachante: ${simulation.despachante || 'Não informado'}`,
    `Agente de Cargas: ${simulation.agenteCargas || 'Não informado'}`,
    `Taxa do Dólar: R$ ${(simulation.taxaDolar || 0).toFixed(4)}`,
    `CBM Total: ${formatCBM((simulation.resultados || {}).cbmTotal || 0)}`
  ];

  infoItems.forEach(item => {
    doc.text(item, margin, yPosition);
    yPosition += 7;
  });
  yPosition += 15;

  // VALORES RESUMO
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMO FINANCEIRO', margin, yPosition);
  yPosition += 10;

  // Valores em USD (coluna esquerda)
  doc.setFontSize(12);
  doc.text('Valores em USD:', margin, yPosition);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPosition += 8;

  const usdValues = [
    `FOB: ${formatUSD(simulation.valorFobDolar || 0)}`,
    `Frete: ${formatUSD(simulation.valorFreteDolar || 0)}`,
    `CFR: ${formatUSD((simulation.resultados || {}).valorCfrDolar || 0)}`,
    `Seguro: ${formatUSD((simulation.resultados || {}).valorSeguro || 0)}`
  ];

  usdValues.forEach(item => {
    doc.text(item, margin, yPosition);
    yPosition += 6;
  });

  // Valores em BRL (coluna direita)
  let yPositionBRL = yPosition - (usdValues.length * 6) - 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Valores em BRL:', pageWidth / 2, yPositionBRL);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPositionBRL += 8;

  const brlValues = [
    `FOB: ${formatCurrency((simulation.resultados || {}).valorFobReal || 0)}`,
    `Frete: ${formatCurrency((simulation.resultados || {}).valorFreteReal || 0)}`,
    `Impostos: ${formatCurrency((simulation.resultados || {}).totalImpostos || 0)}`,
    `Despesas: ${formatCurrency((simulation.resultados || {}).totalDespesas || 0)}`
  ];

  brlValues.forEach(item => {
    doc.text(item, pageWidth / 2, yPositionBRL);
    yPositionBRL += 6;
  });

  // TOTAL DESTACADO
  yPosition += 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 100, 200);
  doc.text(`TOTAL GERAL: ${formatCurrency((simulation.resultados || {}).custoTotal || 0)}`, margin, yPosition);
  doc.setTextColor(0, 0, 0);
  yPosition += 20;

  // Nova página para produtos se necessário
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 30;
  }

  // DETALHAMENTO POR PRODUTO
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DETALHAMENTO POR PRODUTO', margin, yPosition);
  yPosition += 15;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  (simulation.produtos || []).forEach((produto, index) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }

    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${produto.nome}`, margin, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    const produtoInfo = [
      `NCM: ${produto.ncm}  |  Qtd: ${produto.quantidade}  |  Valor Unit. USD: ${formatUSD(produto.valorUnitarioUsd || 0)}`,
      `Dimensões: ${produto.comprimento}x${produto.largura}x${produto.altura} cm  |  CBM: ${formatCBM(produto.cbmTotal || 0)}`,
      `Valor Total BRL: ${formatCurrency(produto.valorTotalBRL || 0)}`,
      `Frete Rateio: ${formatCurrency(produto.freteRateio || 0)}  |  Despesas Rateio: ${formatCurrency(produto.despesasRateio || 0)}`,
      `Impostos - II: ${formatCurrency(produto.impostos?.ii || 0)}  |  IPI: ${formatCurrency(produto.impostos?.ipi || 0)}`,
      `PIS: ${formatCurrency(produto.impostos?.pis || 0)}  |  COFINS: ${formatCurrency(produto.impostos?.cofins || 0)}  |  ICMS: ${formatCurrency(produto.impostos?.icms || 0)}`,
      `CUSTO TOTAL: ${formatCurrency(produto.custoTotal || 0)}  |  CUSTO UNITÁRIO: ${formatCurrency(produto.custoUnitario || 0)}`
    ];

    produtoInfo.forEach(info => {
      doc.text(info, margin + 5, yPosition);
      yPosition += 5;
    });
    yPosition += 10;
  });

  // RODAPÉ
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Simulação gerada em ${new Date().toLocaleString('pt-BR')} - Página ${i} de ${pageCount}`, 
      pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  }

  // Salvar arquivo
  const fileName = `simulacao-importacao-${simulation.nome?.replace(/[^a-zA-Z0-9]/g, '-') || 'simulacao'}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export default function FormalImportSimulator() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
  
  // Extrair ID da simulação dos parâmetros da URL
  const urlParams = new URLSearchParams(window.location.search);
  const simulationId = urlParams.get('id');
  
  const [activeTab, setActiveTab] = useState("info");
  // Estado para impostos personalizados
  const [showAddTaxDialog, setShowAddTaxDialog] = useState(false);
  const [newTax, setNewTax] = useState<Tax>({
    nome: "",
    aliquota: 0,
    baseCalculo: "fob_frete_seguro",
    valor: 0
  });

  // Estado para despesas adicionais personalizadas
  const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false);
  const [newExpense, setNewExpense] = useState<Expense>({
    nome: "",
    valorDolar: 0,
    valorReal: 0
  });

  // Lista de impostos padrão que não podem ser removidos
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
    impostos: [...defaultTaxes], // Use spread to create new array
    despesasAdicionais: [...defaultExpenses], // Use spread to create new array
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

  const simulationIdNumber = simulationId ? parseInt(simulationId) : null;

  // Load existing simulation
  const { data: existingSimulation, isLoading } = useQuery({
    queryKey: [`/api/simulators/formal-import/${simulationIdNumber}`],
    enabled: !!simulationIdNumber
  });

  useEffect(() => {
    if (existingSimulation) {
      // Ensure all required arrays are properly initialized and convert strings to numbers
      const processedSimulation = {
        ...existingSimulation,
        taxaDolar: parseFloat(existingSimulation.taxaDolar) || 5.50,
        valorFobDolar: parseFloat(existingSimulation.valorFobDolar) || 0,
        valorFreteDolar: parseFloat(existingSimulation.valorFreteDolar) || 0,
        percentualSeguro: parseFloat(existingSimulation.percentualSeguro) || 0.18,
        impostos: existingSimulation.impostos || defaultTaxes,
        despesasAdicionais: existingSimulation.despesasAdicionais || defaultExpenses,
        produtos: existingSimulation.produtos || []
      };
      setSimulation(processedSimulation);
    }
  }, [existingSimulation]);

  // Real-time calculation
  const calculateMutation = useMutation({
    mutationFn: async (data: FormalImportSimulation) => {
      try {
        return await apiRequest(`/api/simulators/formal-import/calculate`, {
          method: 'POST',
          body: data
        });
      } catch (error) {
        console.error('Calculate mutation error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      setSimulation(prev => ({
        ...prev,
        produtos: data?.produtos || prev.produtos || [],
        resultados: data?.resultados || prev.resultados || {},
        impostos: prev.impostos || defaultTaxes,
        despesasAdicionais: prev.despesasAdicionais || defaultExpenses
      }));
    },
    onError: (error) => {
      console.error('Erro no cálculo:', error);
      toast({
        title: "Erro no cálculo",
        description: "Verifique os dados e tente novamente",
        variant: "destructive"
      });
    }
  });

  // Save simulation
  const saveMutation = useMutation({
    mutationFn: async (data: FormalImportSimulation) => {
      try {
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
      } catch (error) {
        console.error('Save mutation error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Simulação salva com sucesso!",
        description: `Código: ${data.codigoSimulacao || data.nome}`
      });
      
      // Invalidar cache imediatamente
      queryClient.invalidateQueries({ queryKey: ['/api/simulators/formal-import'] });
      
      // Voltar para a lista ao invés de navegar para URL específica
      setTimeout(() => {
        setLocation("/simuladores/importacao-formal-direta");
      }, 1000);
    },
    onError: (error) => {
      console.error('Erro ao salvar simulação:', error);
      toast({
        title: "Erro ao salvar",
        description: "Verifique os dados e tente novamente",
        variant: "destructive"
      });
    }
  });

  const handleCalculate = () => {
    try {
      // Validar dados antes de calcular
      if (!simulation.produtos || simulation.produtos.length === 0) {
        toast({
          title: "Aviso",
          description: "Adicione pelo menos um produto para calcular",
          variant: "destructive"
        });
        return;
      }
      
      calculateMutation.mutate(simulation);
    } catch (error) {
      console.error('Erro ao iniciar cálculo:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao calcular",
        variant: "destructive"
      });
    }
  };

  const handleSave = () => {
    try {
      // Verificar se simulação tem dados mínimos necessários
      if (!simulation.nome || !simulation.produtos || simulation.produtos.length === 0) {
        toast({
          title: "Dados incompletos",
          description: "Preencha ao menos o nome da simulação e adicione produtos",
          variant: "destructive"
        });
        return;
      }
      
      saveMutation.mutate(simulation);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar",
        variant: "destructive"
      });
    }
  };

  const handleCompleteSimulation = () => {
    try {
      const completedSimulation = {
        ...simulation,
        status: "Concluída"
      };
      saveMutation.mutate(completedSimulation);
    } catch (error) {
      console.error('Erro ao concluir simulação:', error);
      toast({
        title: "Erro",
        description: "Erro ao concluir simulação",
        variant: "destructive"
      });
    }
  };

  // Delete simulation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/simulators/formal-import/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: "Simulação excluída",
        description: "A simulação foi excluída com sucesso"
      });
      
      // Invalidar cache imediatamente
      queryClient.invalidateQueries({ queryKey: ['/api/simulators/formal-import'] });
      
      setTimeout(() => {
        setLocation("/simuladores/importacao-formal-direta");
      }, 1000);
    },
    onError: (error) => {
      console.error('Erro ao excluir simulação:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a simulação",
        variant: "destructive"
      });
    }
  });

  const handleDeleteSimulation = () => {
    if (simulationId && window.confirm('Tem certeza que deseja excluir esta simulação?')) {
      deleteMutation.mutate(simulationId);
    }
  };

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
            const comp = parseFloat(updatedProduct.comprimento) || 0;
            const larg = parseFloat(updatedProduct.largura) || 0;
            const alt = parseFloat(updatedProduct.altura) || 0;
            const quant = parseFloat(updatedProduct.quantidade) || 0;
            
            const cbmUnitario = comp > 0 && larg > 0 && alt > 0 ? (comp * larg * alt) / 1000000 : 0;
            const cbmTotal = cbmUnitario * quant;
            
            // CBM calculation completed
            
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

      // Calcular percentuais de container e rateio automaticamente
      const totalCBM = updatedProducts.reduce((sum, p) => sum + (p.cbmTotal || 0), 0);
      const productsWithPercentages = updatedProducts.map(product => ({
        ...product,
        percentualContainer: totalCBM > 0 ? (product.cbmTotal || 0) / totalCBM : 0
      }));

      // CBM total calculation completed

      return {
        ...prev,
        produtos: productsWithPercentages
      };
    });

    // Não fazer cálculo automático - apenas quando clicar no botão "Calcular"
    // setTimeout removido para melhorar performance
  };

  const removeProduct = (index: number) => {
    setSimulation(prev => ({
      ...prev,
      produtos: (prev.produtos || []).filter((_, i) => i !== index)
    }));
  };





  // Função para calcular valores estimados dos impostos em tempo real
  const calculateTaxEstimate = (tax: Tax) => {
    const valorFobReal = simulation.valorFobDolar * simulation.taxaDolar;
    const valorFreteReal = simulation.valorFreteDolar * simulation.taxaDolar;
    const valorCfrReal = valorFobReal + valorFreteReal;
    const valorSeguro = valorCfrReal * (simulation.percentualSeguro / 100);
    const baseTotal = valorFobReal + valorFreteReal + valorSeguro;
    
    let baseValue = 0;
    
    switch (tax.baseCalculo) {
      case 'fob_frete_seguro':
        // FOB + Frete + Seguro (para todos os impostos padrão)
        baseValue = baseTotal;
        break;
      case 'fob_apenas':
        // Apenas FOB (para impostos personalizados)
        baseValue = valorFobReal;
        break;
      default:
        baseValue = baseTotal;
    }
    
    return baseValue * (tax.aliquota / 100);
  };

  // Funções para gerenciar impostos personalizados
  const addCustomTax = () => {
    if (!newTax.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome do imposto é obrigatório",
        variant: "destructive",
      });
      return;
    }

    // Verificar se já existe um imposto com o mesmo nome
    if ((simulation.impostos || []).some(tax => tax.nome.toLowerCase() === newTax.nome.toLowerCase())) {
      toast({
        title: "Erro",
        description: "Já existe um imposto com esse nome",
        variant: "destructive",
      });
      return;
    }

    const newImpostos = [...(simulation.impostos || []), { ...newTax }];
    setSimulation(prev => ({ ...prev, impostos: newImpostos }));
    
    // Resetar formulário
    setNewTax({
      nome: "",
      aliquota: 0,
      baseCalculo: "fob_frete_seguro",
      valor: 0
    });
    setShowAddTaxDialog(false);

    toast({
      title: "Sucesso",
      description: "Imposto personalizado adicionado",
    });
  };

  const removeCustomTax = (index: number) => {
    const tax = (simulation.impostos || [])[index];
    
    // Não permitir remover impostos padrão
    if (defaultTaxNames.includes(tax.nome)) {
      toast({
        title: "Erro",
        description: "Não é possível remover impostos padrão",
        variant: "destructive",
      });
      return;
    }

    const newImpostos = (simulation.impostos || []).filter((_, i) => i !== index);
    setSimulation(prev => ({ ...prev, impostos: newImpostos }));

    toast({
      title: "Sucesso",
      description: "Imposto personalizado removido",
    });
  };

  const resetNewTaxForm = () => {
    setNewTax({
      nome: "",
      aliquota: 0,
      baseCalculo: "fob_frete_seguro",
      valor: 0
    });
    setShowAddTaxDialog(false);
  };

  // Funções para despesas adicionais personalizadas
  const addNewExpense = () => {
    if (!newExpense.nome || (newExpense.valorDolar === 0 && newExpense.valorReal === 0)) {
      toast({
        title: "Erro",
        description: "Preencha o nome da despesa e pelo menos um valor",
        variant: "destructive"
      });
      return;
    }

    const novasDespesas = [...simulation.despesasAdicionais, { ...newExpense }];
    setSimulation(prev => ({ ...prev, despesasAdicionais: novasDespesas }));
    
    // Resetar formulário
    setNewExpense({
      nome: "",
      valorDolar: 0,
      valorReal: 0
    });
    setShowAddExpenseDialog(false);

    toast({
      title: "Sucesso",
      description: "Despesa adicional adicionada com sucesso",
    });
  };

  const removeExpense = (index: number) => {
    const novasDespesas = simulation.despesasAdicionais.filter((_, i) => i !== index);
    setSimulation(prev => ({ ...prev, despesasAdicionais: novasDespesas }));
    
    toast({
      title: "Sucesso",
      description: "Despesa removida com sucesso",
    });
  };

  const resetNewExpenseForm = () => {
    setNewExpense({
      nome: "",
      valorDolar: 0,
      valorReal: 0
    });
    setShowAddExpenseDialog(false);
  };

  // Função para conversão automática USD -> Real
  const handleExpenseUSDChange = (index: number, value: number) => {
    const novasDespesas = [...(simulation.despesasAdicionais || [])];
    novasDespesas[index].valorDolar = value;
    novasDespesas[index].valorReal = value * simulation.taxaDolar;
    setSimulation(prev => ({ ...prev, despesasAdicionais: novasDespesas }));
  };

  const handleExpenseRealChange = (index: number, value: number) => {
    const novasDespesas = [...(simulation.despesasAdicionais || [])];
    novasDespesas[index].valorReal = value;
    novasDespesas[index].valorDolar = value / simulation.taxaDolar;
    setSimulation(prev => ({ ...prev, despesasAdicionais: novasDespesas }));
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

  // Verificação de segurança para evitar tela branca
  if (!simulation) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p>Erro ao carregar simulação. Tente novamente.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Recarregar
          </Button>
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
            onClick={() => setLocation('/simuladores/importacao-formal-direta')}
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
          <Button 
            variant="outline" 
            onClick={() => setLocation('/simuladores/importacao-formal-direta')}
          >
            <History className="h-4 w-4 mr-2" />
            Voltar à Lista
          </Button>
          <Button onClick={handleCalculate} disabled={calculateMutation.isPending}>
            <Calculator className="h-4 w-4 mr-2" />
            Calcular
          </Button>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            
            <Button 
              onClick={handleCompleteSimulation} 
              disabled={saveMutation.isPending}
              variant="outline"
              className="bg-green-50 hover:bg-green-100 text-green-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Concluir
            </Button>
            
            {simulationId && (
              <Button 
                onClick={handleDeleteSimulation} 
                disabled={deleteMutation.isPending}
                variant="destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            )}
          </div>
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
                        value={simulation.nome || ""}
                        onChange={(e) => setSimulation(prev => ({ ...prev, nome: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fornecedor">Fornecedor</Label>
                      <Input
                        id="fornecedor"
                        value={simulation.fornecedor || ""}
                        onChange={(e) => setSimulation(prev => ({ ...prev, fornecedor: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="despachante">Despachante</Label>
                      <Input
                        id="despachante"
                        value={simulation.despachante || ""}
                        onChange={(e) => setSimulation(prev => ({ ...prev, despachante: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="agenteCargas">Agente de Cargas</Label>
                      <Input
                        id="agenteCargas"
                        value={simulation.agenteCargas || ""}
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
                        placeholder="Ex: 5.50"
                        className="no-spin"
                        value={simulation.taxaDolar === 0 ? "" : simulation.taxaDolar}
                        onChange={(e) => {
                          const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                          setSimulation(prev => ({ ...prev, taxaDolar: isNaN(value) ? 0 : value }));
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="valorFobDolar">Valor FOB (USD)</Label>
                      <Input
                        id="valorFobDolar"
                        type="number"
                        step="0.01"
                        placeholder="Ex: 1000.00"
                        className="no-spin"
                        value={simulation.valorFobDolar === 0 ? "" : simulation.valorFobDolar}
                        onChange={(e) => {
                          const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                          setSimulation(prev => ({ ...prev, valorFobDolar: isNaN(value) ? 0 : value }));
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="valorFreteDolar">Valor Frete (USD)</Label>
                      <Input
                        id="valorFreteDolar"
                        type="number"
                        step="0.01"
                        placeholder="Ex: 500.00"
                        className="no-spin"
                        value={simulation.valorFreteDolar === 0 ? "" : simulation.valorFreteDolar}
                        onChange={(e) => {
                          const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                          setSimulation(prev => ({ ...prev, valorFreteDolar: isNaN(value) ? 0 : value }));
                        }}
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
                        className="no-spin"
                        value={simulation.percentualSeguro || 0}
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
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Impostos de Nacionalização</CardTitle>
                      <CardDescription>
                        Configure as alíquotas dos impostos de importação
                      </CardDescription>
                    </div>
                    <Dialog open={showAddTaxDialog} onOpenChange={setShowAddTaxDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Imposto
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Adicionar Imposto Personalizado</DialogTitle>
                          <DialogDescription>
                            Crie um novo imposto personalizado para sua simulação.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                          <div>
                            <Label htmlFor="taxName">Nome do Imposto</Label>
                            <Input
                              id="taxName"
                              value={newTax.nome || ""}
                              onChange={(e) => setNewTax(prev => ({ ...prev, nome: e.target.value }))}
                              placeholder="Ex: Taxa Especial"
                            />
                          </div>
                          <div>
                            <Label htmlFor="taxRate">Alíquota (%)</Label>
                            <Input
                              id="taxRate"
                              type="number"
                              step="0.01"
                              className="no-spin"
                              value={newTax.aliquota || 0}
                              onChange={(e) => setNewTax(prev => ({ ...prev, aliquota: parseFloat(e.target.value) || 0 }))}
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label htmlFor="taxBase">Base de Cálculo</Label>
                            <Select value={newTax.baseCalculo || ""} onValueChange={(value) => setNewTax(prev => ({ ...prev, baseCalculo: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a base de cálculo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fob_frete_seguro">FOB + Frete + Seguro</SelectItem>
                                <SelectItem value="fob_apenas">FOB Apenas</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={resetNewTaxForm}>
                            Cancelar
                          </Button>
                          <Button onClick={addCustomTax}>
                            Adicionar Imposto
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
                        <TableHead>Base de Cálculo</TableHead>
                        <TableHead>Valor Estimado</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(simulation.impostos || []).map((tax, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{tax.nome}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              className="no-spin"
                              value={tax.aliquota || 0}
                              onChange={(e) => {
                                const newImpostos = [...(simulation.impostos || [])];
                                newImpostos[index].aliquota = parseFloat(e.target.value) || 0;
                                setSimulation(prev => ({ ...prev, impostos: newImpostos }));
                              }}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {tax.baseCalculo === "fob_frete_seguro" && "FOB + Frete + Seguro"}
                              {tax.baseCalculo === "fob_apenas" && "FOB Apenas"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {formatCurrency(calculateTaxEstimate(tax))}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {!defaultTaxNames.includes(tax.nome) ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCustomTax(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            ) : (
                              <span className="text-xs text-gray-400">Padrão</span>
                            )}
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
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(simulation.despesasAdicionais || []).map((expense, index) => {
                        // Buscar valor de referência padrão se existir
                        const defaultExpense = index < defaultExpenses.length ? defaultExpenses[index] : null;
                        
                        return (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{expense.nome}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                className="w-24 no-spin"
                                value={expense.valorDolar === 0 ? "" : expense.valorDolar}
                                placeholder="0.00"
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  handleExpenseUSDChange(index, value);
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <Input
                                  type="number"
                                  step="0.01"
                                  className="no-spin"
                                  value={expense.valorReal === 0 ? "" : expense.valorReal}
                                  placeholder="0.00"
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 0;
                                    handleExpenseRealChange(index, value);
                                  }}
                                  className="w-24"
                                />
                                {defaultExpense && defaultExpense.valorReal && (
                                  <span className="text-xs text-muted-foreground">
                                    Ref: R$ {defaultExpense.valorReal.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {/* Só permite remover despesas que não sejam padrão */}
                              {index >= defaultExpenses.length && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => removeExpense(index)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {/* Botão para adicionar nova despesa */}
                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => setShowAddExpenseDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Despesa
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Dialog para adicionar nova despesa */}
              <Dialog open={showAddExpenseDialog} onOpenChange={setShowAddExpenseDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Despesa Adicional</DialogTitle>
                    <DialogDescription>
                      Adicione uma nova despesa à sua simulação de importação
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="expenseName">Nome da Despesa</Label>
                      <Input
                        id="expenseName"
                        value={newExpense.nome || ""}
                        onChange={(e) => setNewExpense(prev => ({ ...prev, nome: e.target.value }))}
                        placeholder="Ex: Certificado de Origem"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expenseUSD">Valor USD</Label>
                        <Input
                          id="expenseUSD"
                          type="number"
                          step="0.01"
                          className="no-spin"
                          value={newExpense.valorDolar === 0 ? "" : newExpense.valorDolar}
                          onChange={(e) => {
                            const usdValue = parseFloat(e.target.value) || 0;
                            setNewExpense(prev => ({ 
                              ...prev, 
                              valorDolar: usdValue,
                              valorReal: usdValue * simulation.taxaDolar
                            }));
                          }}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="expenseBRL">Valor BRL</Label>
                        <Input
                          id="expenseBRL"
                          type="number"
                          step="0.01"
                          className="no-spin"
                          value={newExpense.valorReal === 0 ? "" : newExpense.valorReal}
                          onChange={(e) => {
                            const brlValue = parseFloat(e.target.value) || 0;
                            setNewExpense(prev => ({ 
                              ...prev, 
                              valorReal: brlValue,
                              valorDolar: brlValue / simulation.taxaDolar
                            }));
                          }}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Taxa de câmbio: R$ {(simulation.taxaDolar || 0).toFixed(4)}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={resetNewExpenseForm}>
                      Cancelar
                    </Button>
                    <Button onClick={addNewExpense}>
                      Adicionar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Seção 5: Produtos */}
            <TabsContent value="products" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Produtos</CardTitle>
                  <CardDescription>
                    Configure os produtos com dimensões para cálculo do CBM
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(simulation.produtos || []).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum produto configurado. Os produtos serão adicionados automaticamente quando você calcular a simulação.
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
                            <TableHead className="bg-blue-100">CBM Unit.</TableHead>
                            <TableHead className="bg-green-100">CBM Total</TableHead>
                            <TableHead className="bg-yellow-100">% Container</TableHead>
                            <TableHead>Custo Unitário</TableHead>
                            <TableHead>Custo Total</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(simulation.produtos || []).map((produto, index) => (
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
                                  className="w-16 no-spin"
                                  value={produto.quantidade || ''}
                                  onChange={(e) => updateProduct(index, 'quantidade', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                                  placeholder="Qtd"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  step="0.01"
                                  className="w-20 no-spin"
                                  value={produto.valorUnitarioUsd || ''}
                                  onChange={(e) => updateProduct(index, 'valorUnitarioUsd', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                                  placeholder="USD"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  className="w-16 no-spin"
                                  value={produto.comprimento || ''}
                                  onChange={(e) => updateProduct(index, 'comprimento', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                                  placeholder="cm"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  className="w-16 no-spin"
                                  value={produto.largura || ''}
                                  onChange={(e) => updateProduct(index, 'largura', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                                  placeholder="cm"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  className="w-16 no-spin"
                                  value={produto.altura || ''}
                                  onChange={(e) => updateProduct(index, 'altura', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                                  placeholder="cm"
                                />
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {produto.cbmUnitario !== undefined && produto.cbmUnitario >= 0 ? formatCBM(produto.cbmUnitario) : '-'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {produto.cbmTotal !== undefined && produto.cbmTotal >= 0 ? formatCBM(produto.cbmTotal) : '-'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {produto.percentualContainer !== undefined && produto.percentualContainer >= 0 ? formatPercentage(produto.percentualContainer) : '-'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-bold text-blue-600">
                                  {produto.custoUnitario ? formatCurrency(produto.custoUnitario) : '-'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-bold">
                                  {produto.custoTotal ? formatCurrency(produto.custoTotal) : '-'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeProduct(index)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {/* Botão para adicionar produto */}
                      <div className="mt-4 flex justify-between items-center">
                        <Button onClick={addProduct}>
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Produto
                        </Button>
                        
                        {/* Resumo totais */}
                        <div className="flex gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-muted-foreground">CBM Total</div>
                            <div className="font-bold">
                              {formatCBM((simulation.produtos || []).reduce((sum, p) => sum + (p.cbmTotal || 0), 0))}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground">Custo Total</div>
                            <div className="font-bold text-blue-600">
                              {formatCurrency((simulation.resultados || {}).custoTotal || 0)}
                            </div>
                          </div>
                        </div>
                      </div>
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
                  {(simulation.produtos || []).length === 0 ? (
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
                              {formatCurrency((simulation.resultados || {}).valorFobReal || 0)}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm text-muted-foreground">Frete Real</div>
                            <div className="text-lg font-bold">
                              {formatCurrency((simulation.resultados || {}).valorFreteReal || 0)}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm text-muted-foreground">Total Impostos</div>
                            <div className="text-lg font-bold">
                              {formatCurrency((simulation.resultados || {}).totalImpostos || 0)}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm text-muted-foreground">CBM Total</div>
                            <div className="text-lg font-bold">
                              {formatCBM((simulation.resultados || {}).cbmTotal || 0)}
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
                            {(simulation.produtos || []).map((produto, index) => (
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
                          <span className="font-bold">{formatUSD((simulation.resultados || {}).valorCfrDolar || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Seguro:</span>
                          <span className="font-bold">{formatUSD((simulation.resultados || {}).valorSeguro || 0)}</span>
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
                          <span className="font-bold">{formatCurrency((simulation.resultados || {}).valorFobReal || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Frete:</span>
                          <span className="font-bold">{formatCurrency((simulation.resultados || {}).valorFreteReal || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Impostos:</span>
                          <span className="font-bold">{formatCurrency((simulation.resultados || {}).totalImpostos || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Despesas:</span>
                          <span className="font-bold">{formatCurrency((simulation.resultados || {}).totalDespesas || 0)}</span>
                        </div>
                        <hr />
                        <div className="flex justify-between text-lg">
                          <span className="font-bold">Total:</span>
                          <span className="font-bold text-blue-600">{formatCurrency((simulation.resultados || {}).custoTotal || 0)}</span>
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
                          <div className="p-2 bg-gray-50 rounded">R$ {(simulation.taxaDolar || 0).toFixed(4)}</div>
                        </div>
                        <div>
                          <Label>CBM Total:</Label>
                          <div className="p-2 bg-gray-50 rounded">{formatCBM((simulation.resultados || {}).cbmTotal || 0)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Removido duplicação - esta seção está na aba "total" abaixo */}
          </Tabs>

          {/* Navigation and Action Buttons */}
          <div className="flex justify-between items-center mt-6">
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

            {/* Central Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => exportToPDF(simulation)}
                disabled={!simulation.resultados?.custoTotal}
                className="bg-blue-50 hover:bg-blue-100 border-blue-300"
              >
                <FileText className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>

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