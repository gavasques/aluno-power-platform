import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Save, FileDown, Calculator, FileText, FolderOpen } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Brazilian number formatting utilities
const formatBrazilianNumber = (value: number, decimals: number = 2): string => {
  if (value === 0) return '';
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

const parseBrazilianNumber = (value: string): number => {
  if (!value || value.trim() === '') return 0;
  
  // Remove all dots (thousand separators) and replace comma with dot for parsing
  const cleanValue = value
    .replace(/\./g, '')  // Remove dots
    .replace(',', '.');  // Replace comma with dot
  
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

// Custom Brazilian number input component
interface BrazilianNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  decimals?: number;
  min?: number;
  max?: number;
  step?: string;
  className?: string;
  id?: string;
  placeholder?: string;
}

const BrazilianNumberInput = ({ 
  value, 
  onChange, 
  decimals = 2, 
  min, 
  max, 
  className, 
  id, 
  placeholder 
}: BrazilianNumberInputProps) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value === 0 ? '' : formatBrazilianNumber(value, decimals));
    }
  }, [value, decimals, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    const numericValue = parseBrazilianNumber(inputValue);
    
    // Apply min/max constraints
    let constrainedValue = numericValue;
    if (min !== undefined && constrainedValue < min) constrainedValue = min;
    if (max !== undefined && constrainedValue > max) constrainedValue = max;
    
    onChange(constrainedValue);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Re-format the display value on blur
    if (value !== 0) {
      setDisplayValue(formatBrazilianNumber(value, decimals));
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <Input
      id={id}
      className={className}
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
    />
  );
};

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
  codigoSimulacao?: string;
  nomeFornecedor?: string;
  observacoes?: string;
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
    nomeFornecedor: "",
    observacoes: "",
    configuracoesGerais: defaultConfig,
    produtos: []
  });
  
  const [selectedSimulationId, setSelectedSimulationId] = useState<number | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
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
    onSuccess: (savedSimulation) => {
      // Invalidar todas as queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['/api/simulations/import'] });
      
      // Atualizar a simulação ativa com os dados retornados do servidor
      if (savedSimulation) {
        setActiveSimulation({
          ...savedSimulation,
          nomeFornecedor: savedSimulation.nomeFornecedor || "",
          observacoes: savedSimulation.observacoes || "",
        });
        setSelectedSimulationId(savedSimulation.id);
      }
      
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
    const peso_bruto_total_simulacao_kg = produtos.reduce((sum, p) => {
      const pesoTotal = p.quantidade * p.peso_bruto_unitario_kg;
      console.log(`Produto: ${p.descricao_produto}, Qtd: ${p.quantidade}, Peso Unit: ${p.peso_bruto_unitario_kg}, Peso Total: ${pesoTotal}`);
      return sum + pesoTotal;
    }, 0);
    const valor_fob_total_simulacao_usd = produtos.reduce((sum, p) => sum + (p.quantidade * p.valor_unitario_usd), 0);
    const quantidade_total_itens_simulacao = produtos.reduce((sum, p) => sum + p.quantidade, 0);

    const custo_frete_internacional_total_brl = cfg.moeda_frete_internacional === "USD" 
      ? cfg.custo_frete_internacional_total_moeda_original * cfg.taxa_cambio_usd_brl
      : cfg.custo_frete_internacional_total_moeda_original;

    // Calculate per product
    const produtosCalculados = produtos.map(p => {
      const peso_bruto_total_produto_kg = Number(p.quantidade) * Number(p.peso_bruto_unitario_kg);
      const valor_total_produto_usd = Number(p.quantidade) * Number(p.valor_unitario_usd);
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
    
    // Additional calculations
    const peso_total_kg = Number(peso_bruto_total_simulacao_kg.toFixed(2));
    const preco_por_kg_usd = peso_total_kg > 0 ? cfg.custo_frete_internacional_total_moeda_original / peso_total_kg : 0;
    const multiplicador_importacao = valor_fob_total_simulacao_usd > 0 ? custo_total_importacao_brl / (valor_fob_total_simulacao_usd * cfg.taxa_cambio_usd_brl) : 0;

    return {
      produtos: produtosCalculados,
      totals: { 
        ...totals, 
        custo_total_importacao_brl,
        peso_total_kg,
        preco_por_kg_usd,
        multiplicador_importacao,
        valor_fob_total_usd: valor_fob_total_simulacao_usd
      }
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
    // Garantir que todos os dados sejam carregados corretamente
    setActiveSimulation({
      ...simulation,
      id: simulation.id, // Incluir o ID para manter a referência
      nomeSimulacao: simulation.nomeSimulacao || "Nova Simulação",
      nomeFornecedor: simulation.nomeFornecedor || "",
      observacoes: simulation.observacoes || "",
      configuracoesGerais: simulation.configuracoesGerais || defaultConfig,
      produtos: simulation.produtos || []
    });
    setSelectedSimulationId(simulation.id);
    setActiveTab("simulation"); // Switch to active simulation tab
    
    // Invalidar queries para garantir que dados estejam atualizados
    queryClient.invalidateQueries({ queryKey: ['/api/simulations/import'] });
  };

  const newSimulation = () => {
    setActiveSimulation({
      nomeSimulacao: "Nova Simulação",
      nomeFornecedor: "",
      observacoes: "",
      configuracoesGerais: defaultConfig,
      produtos: [],
      id: undefined // Garantir que não há ID para nova simulação
    });
    setSelectedSimulationId(null);
  };

  // PDF Export function
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Relatório de Simulação de Importação', 105, 30, { align: 'center' });
      
      // Simulation info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      let yPos = 50;
      
      // Simulation details
      doc.text(`Nome da Simulação: ${activeSimulation.nomeSimulacao}`, 20, yPos);
      yPos += 10;
      
      if (activeSimulation.nomeFornecedor) {
        doc.text(`Fornecedor: ${activeSimulation.nomeFornecedor}`, 20, yPos);
        yPos += 10;
      }
      
      // Configuration summary
      const cfg = activeSimulation.configuracoesGerais;
      doc.text(`Taxa de Câmbio USD/BRL: R$ ${formatBrazilianNumber(cfg.taxa_cambio_usd_brl)}`, 20, yPos);
      yPos += 8;
      doc.text(`Alíquota II: ${(cfg.aliquota_ii_percentual * 100).toFixed(1)}%`, 20, yPos);
      yPos += 8;
      doc.text(`Alíquota ICMS: ${(cfg.aliquota_icms_percentual * 100).toFixed(1)}%`, 20, yPos);
      yPos += 8;
      doc.text(`Frete Internacional: ${cfg.moeda_frete_internacional} ${formatBrazilianNumber(cfg.custo_frete_internacional_total_moeda_original)}`, 20, yPos);
      yPos += 8;
      doc.text(`Outras Despesas: R$ ${formatBrazilianNumber(cfg.outras_despesas_aduaneiras_total_brl)}`, 20, yPos);
      yPos += 15;

      // Products table
      const tableData = calculatedResults.produtos.map(produto => [
        produto.descricao_produto,
        produto.quantidade.toString(),
        `US$ ${formatBrazilianNumber(produto.valor_unitario_usd)}`,
        `${formatBrazilianNumber(produto.peso_bruto_unitario_kg, 2)} kg`,
        `R$ ${formatBrazilianNumber(produto.custo_produto_brl || 0)}`,
        `R$ ${formatBrazilianNumber(produto.custo_frete_por_produto_brl || 0)}`,
        `R$ ${formatBrazilianNumber(produto.valor_ii_brl || 0)}`,
        `R$ ${formatBrazilianNumber(produto.valor_icms_brl || 0)}`,
        `R$ ${formatBrazilianNumber(produto.custo_unitario_com_imposto_brl || 0)}`
      ]);

      autoTable(doc, {
        head: [['Produto', 'Qtd', 'Valor Unit. USD', 'Peso Unit.', 'Custo Produto BRL', 'Frete BRL', 'II BRL', 'ICMS BRL', 'Custo Unit. c/ Imp.']],
        body: tableData,
        startY: yPos,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        columnStyles: {
          8: { fontStyle: 'bold', textColor: [59, 130, 246] } // Custo Unit. c/ Imp. column
        }
      });

      yPos = (doc as any).lastAutoTable.finalY + 20;

      // Summary totals
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Resumo da Simulação:', 20, yPos);
      yPos += 15;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      
      const totals = calculatedResults.totals;
      doc.text(`Total de Itens: ${totals.total_sim_quantidade_itens}`, 20, yPos);
      yPos += 8;
      doc.text(`Produto + Frete: R$ ${formatBrazilianNumber(totals.total_sim_produto_mais_frete_brl)}`, 20, yPos);
      yPos += 8;
      doc.text(`Total II: R$ ${formatBrazilianNumber(totals.total_sim_valor_ii_brl)}`, 20, yPos);
      yPos += 8;
      doc.text(`Total ICMS: R$ ${formatBrazilianNumber(totals.total_sim_valor_icms_brl)}`, 20, yPos);
      yPos += 8;
      doc.text(`Outras Despesas: R$ ${formatBrazilianNumber(totals.total_sim_outras_despesas_aduaneiras_brl)}`, 20, yPos);
      yPos += 10;
      
      // Total final em destaque
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(59, 130, 246);
      doc.text(`CUSTO TOTAL: R$ ${formatBrazilianNumber(totals.custo_total_importacao_brl)}`, 20, yPos);

      // Observations
      if (activeSimulation.observacoes) {
        yPos += 20;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Observações:', 20, yPos);
        yPos += 10;
        
        doc.setFont('helvetica', 'normal');
        const observacoes = doc.splitTextToSize(activeSimulation.observacoes, 170);
        doc.text(observacoes, 20, yPos);
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(128, 128, 128);
        doc.text(`Página ${i} de ${pageCount}`, 105, 285, { align: 'center' });
        doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 285);
      }

      // Save the PDF
      const fileName = `Simulacao_Importacao_${activeSimulation.nomeSimulacao.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
      toast({ title: "PDF exportado com sucesso!" });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({ title: "Erro ao gerar PDF", variant: "destructive" });
    }
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
      formatBrazilianNumber(p.valor_unitario_usd),
      formatBrazilianNumber(p.peso_bruto_unitario_kg, 3),
      formatBrazilianNumber(p.custo_produto_brl || 0),
      formatBrazilianNumber(p.custo_frete_por_produto_brl || 0),
      formatBrazilianNumber(p.produto_mais_frete_brl || 0),
      formatBrazilianNumber(p.valor_ii_brl || 0),
      formatBrazilianNumber(p.valor_icms_brl || 0),
      formatBrazilianNumber(p.valor_total_produto_impostos_brl || 0),
      formatBrazilianNumber(p.custo_unitario_sem_imposto_brl || 0),
      formatBrazilianNumber(p.custo_unitario_com_imposto_brl || 0)
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
            Nova Simulação
          </Button>
          <Button onClick={() => setShowLoadDialog(true)} variant="outline">
            <FolderOpen className="w-4 h-4 mr-2" />
            Carregar
          </Button>
          <Button onClick={() => setShowSaveDialog(true)}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="space-y-6">
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
                  <div className="flex flex-col">
                    <CardTitle 
                      className="text-xl cursor-pointer hover:text-primary"
                      onClick={() => setIsEditingName(true)}
                    >
                      {activeSimulation.nomeSimulacao}
                    </CardTitle>
                    {activeSimulation.codigoSimulacao && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Código: {activeSimulation.codigoSimulacao}
                      </p>
                    )}
                  </div>
                )}
                <Badge variant="secondary">
                  {selectedSimulationId ? "Salva" : "Não Salva"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nomeFornecedor">Nome do Fornecedor</Label>
                  <Input
                    id="nomeFornecedor"
                    value={activeSimulation.nomeFornecedor || ""}
                    onChange={(e) => setActiveSimulation(prev => ({ ...prev, nomeFornecedor: e.target.value }))}
                    placeholder="Digite o nome do fornecedor"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={activeSimulation.observacoes || ""}
                  onChange={(e) => setActiveSimulation(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Digite observações sobre esta simulação..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="taxa_cambio">Taxa de Câmbio USD/BRL</Label>
                <BrazilianNumberInput
                  id="taxa_cambio"
                  value={activeSimulation.configuracoesGerais.taxa_cambio_usd_brl}
                  onChange={(value) => updateConfig('taxa_cambio_usd_brl', value)}
                  decimals={4}
                  min={0}
                  placeholder="Ex: 5,20"
                />
              </div>
              
              <div>
                <Label htmlFor="aliquota_ii">Alíquota II (%)</Label>
                <BrazilianNumberInput
                  id="aliquota_ii"
                  value={activeSimulation.configuracoesGerais.aliquota_ii_percentual * 100}
                  onChange={(value) => updateConfig('aliquota_ii_percentual', value / 100)}
                  decimals={2}
                  min={0}
                  max={100}
                  placeholder="Ex: 60,00"
                />
              </div>

              <div>
                <Label htmlFor="aliquota_icms">Alíquota ICMS (%)</Label>
                <BrazilianNumberInput
                  id="aliquota_icms"
                  value={activeSimulation.configuracoesGerais.aliquota_icms_percentual * 100}
                  onChange={(value) => updateConfig('aliquota_icms_percentual', value / 100)}
                  decimals={2}
                  min={0}
                  max={100}
                  placeholder="Ex: 17,00"
                />
              </div>

              <div>
                <Label htmlFor="frete_total">Custo Frete Internacional Total</Label>
                <BrazilianNumberInput
                  id="frete_total"
                  value={activeSimulation.configuracoesGerais.custo_frete_internacional_total_moeda_original}
                  onChange={(value) => updateConfig('custo_frete_internacional_total_moeda_original', value)}
                  decimals={2}
                  min={0}
                  placeholder="Ex: 1.500,00"
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
                <BrazilianNumberInput
                  id="outras_despesas"
                  value={activeSimulation.configuracoesGerais.outras_despesas_aduaneiras_total_brl}
                  onChange={(value) => updateConfig('outras_despesas_aduaneiras_total_brl', value)}
                  decimals={2}
                  min={0}
                  placeholder="Ex: 250,00"
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
                        <th className="text-left p-2 font-bold text-blue-600 text-base">Custo Unit. c/ Imp.</th>
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
                              min="1"
                              value={produto.quantidade.toString()}
                              onChange={(e) => {
                                const value = e.target.value === '' ? 1 : parseInt(e.target.value);
                                if (!isNaN(value) && value > 0) {
                                  updateProduct(index, 'quantidade', value);
                                }
                              }}
                              className="w-20"
                            />
                          </td>
                          <td className="p-2">
                            <BrazilianNumberInput
                              value={produto.valor_unitario_usd}
                              onChange={(value) => updateProduct(index, 'valor_unitario_usd', value)}
                              decimals={2}
                              min={0}
                              className="w-24"
                              placeholder="0,00"
                            />
                          </td>
                          <td className="p-2">
                            <BrazilianNumberInput
                              value={produto.peso_bruto_unitario_kg}
                              onChange={(value) => updateProduct(index, 'peso_bruto_unitario_kg', value)}
                              decimals={2}
                              min={0}
                              className="w-24"
                              placeholder="0,00"
                            />
                          </td>
                          <td className="p-2 text-sm text-right">
                            R$ {formatBrazilianNumber(produto.custo_produto_brl || 0)}
                          </td>
                          <td className="p-2 text-sm text-right">
                            R$ {formatBrazilianNumber(produto.custo_frete_por_produto_brl || 0)}
                          </td>
                          <td className="p-2 text-sm text-right font-medium">
                            R$ {formatBrazilianNumber(produto.produto_mais_frete_brl || 0)}
                          </td>
                          <td className="p-2 text-sm text-right">
                            R$ {formatBrazilianNumber(produto.valor_ii_brl || 0)}
                          </td>
                          <td className="p-2 text-sm text-right">
                            R$ {formatBrazilianNumber(produto.valor_icms_brl || 0)}
                          </td>
                          <td className="p-2 text-sm text-right font-bold text-primary">
                            R$ {formatBrazilianNumber(produto.valor_total_produto_impostos_brl || 0)}
                          </td>
                          <td className="p-2 text-sm text-right">
                            R$ {formatBrazilianNumber(produto.custo_unitario_sem_imposto_brl || 0)}
                          </td>
                          <td className="p-2 text-base text-right font-bold text-blue-600">
                            R$ {formatBrazilianNumber(produto.custo_unitario_com_imposto_brl || 0)}
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
                {/* First row: Key metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {calculatedResults.totals.total_sim_quantidade_itens}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Itens</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {formatBrazilianNumber(calculatedResults.totals.peso_total_kg, 2)} kg
                    </div>
                    <div className="text-sm text-muted-foreground">Peso Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-600">
                      US$ {formatBrazilianNumber(calculatedResults.totals.preco_por_kg_usd)}
                    </div>
                    <div className="text-sm text-muted-foreground">Preço/Kg Frete</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">
                      {formatBrazilianNumber(calculatedResults.totals.multiplicador_importacao)}x
                    </div>
                    <div className="text-sm text-muted-foreground">Multiplicador</div>
                  </div>
                </div>
                
                {/* Second row: Cost breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      R$ {formatBrazilianNumber(calculatedResults.totals.total_sim_produto_mais_frete_brl)}
                    </div>
                    <div className="text-sm text-muted-foreground">Produto + Frete</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      R$ {formatBrazilianNumber(calculatedResults.totals.total_sim_valor_ii_brl)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total II</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      R$ {formatBrazilianNumber(calculatedResults.totals.total_sim_valor_icms_brl)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total ICMS</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      R$ {formatBrazilianNumber(calculatedResults.totals.total_sim_outras_despesas_aduaneiras_brl)}
                    </div>
                    <div className="text-sm text-muted-foreground">Outras Despesas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">
                      R$ {formatBrazilianNumber(calculatedResults.totals.custo_total_importacao_brl)}
                    </div>
                    <div className="text-sm text-muted-foreground">CUSTO TOTAL</div>
                  </div>
                </div>
                
                <div className="flex justify-center gap-4 mt-6">
                  <Button onClick={exportToCsv} variant="outline">
                    <FileDown className="w-4 h-4 mr-2" />
                    Exportar CSV
                  </Button>
                  <Button onClick={exportToPDF} variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Exportar PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
      </div>

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

      {/* Load Dialog */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Carregar Simulação</DialogTitle>
            <DialogDescription>
              Selecione uma simulação salva para carregar.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="text-muted-foreground">Carregando simulações...</div>
                </div>
              </div>
            ) : simulations.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <div className="text-muted-foreground mb-4">Nenhuma simulação salva encontrada</div>
                  <Button onClick={() => setShowLoadDialog(false)}>
                    Fechar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {simulations.map((simulation: any) => {
                  const produtos = simulation.produtos || [];
                  const config = simulation.configuracoesGerais || {};
                  
                  // Calcular valor total da importação
                  let valorTotalImportacao = 0;
                  produtos.forEach((produto: any) => {
                    const valorFOB = produto.quantidade * produto.valor_unitario_usd;
                    const valorFOBBRL = valorFOB * config.taxa_cambio_usd_brl;
                    
                    // Calcular frete por produto
                    const pesoTotalKg = produtos.reduce((acc: number, p: any) => acc + (p.quantidade * p.peso_bruto_unitario_kg), 0);
                    let custoProdutoFrete = 0;
                    if (config.metodo_rateio_frete === "peso") {
                      const pesoTotalProduto = produto.quantidade * produto.peso_bruto_unitario_kg;
                      const proporcaoFrete = pesoTotalKg > 0 ? pesoTotalProduto / pesoTotalKg : 0;
                      custoProdutoFrete = proporcaoFrete * (config.custo_frete_internacional_total_moeda_original * config.taxa_cambio_usd_brl);
                    }
                    
                    // Calcular II
                    const baseCalculoII = valorFOBBRL + custoProdutoFrete;
                    const valorII = baseCalculoII * config.aliquota_ii_percentual;
                    
                    // Calcular ICMS
                    const valorComII = valorFOBBRL + custoProdutoFrete + valorII;
                    const baseCalculoICMS = valorComII / (1 - config.aliquota_icms_percentual);
                    const valorICMS = baseCalculoICMS - valorComII;
                    
                    valorTotalImportacao += baseCalculoICMS;
                  });
                  
                  return (
                    <div key={simulation.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{simulation.nomeSimulacao}</h3>
                          {simulation.codigoSimulacao && (
                            <Badge variant="outline" className="text-xs">
                              {simulation.codigoSimulacao}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => {
                            loadSimulation(simulation);
                            setShowLoadDialog(false);
                          }}>
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
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            R$ {formatBrazilianNumber(valorTotalImportacao)}
                          </div>
                          <div className="text-xs text-muted-foreground">Valor Total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {produtos.length}
                          </div>
                          <div className="text-xs text-muted-foreground">Itens</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">
                            R$ {formatBrazilianNumber(config.taxa_cambio_usd_brl || 0)}
                          </div>
                          <div className="text-xs text-muted-foreground">Cotação USD</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">
                            Atualizada em
                          </div>
                          <div className="text-sm font-medium">
                            {simulation.dataLastModified 
                              ? new Date(simulation.dataLastModified).toLocaleDateString('pt-BR')
                              : 'Não disponível'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoadDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}