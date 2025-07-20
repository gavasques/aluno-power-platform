import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface Tax {
  nome: string;
  aliquota: number;
  baseCalculo: string;
  valor: number;
}

export interface Expense {
  nome: string;
  valorDolar: number;
  valorReal: number;
}

export interface Product {
  id?: string;
  nome: string;
  ncm: string;
  quantidade: number;
  valorUnitarioUsd: number;
  comprimento: number;
  largura: number;
  altura: number;
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

export interface FormalImportSimulation {
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

export const useFormalImportState = (simulationId?: string | null) => {
  const [activeTab, setActiveTab] = useState("info");
  const [showAddTaxDialog, setShowAddTaxDialog] = useState(false);
  const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false);
  
  const [newTax, setNewTax] = useState<Tax>({
    nome: "",
    aliquota: 0,
    baseCalculo: "fob_frete_seguro",
    valor: 0
  });

  const [newExpense, setNewExpense] = useState<Expense>({
    nome: "",
    valorDolar: 0,
    valorReal: 0
  });

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

  const simulationIdNumber = simulationId ? parseInt(simulationId) : null;

  // Load existing simulation
  const { data: existingSimulation, isLoading } = useQuery({
    queryKey: [`/api/simulators/formal-import/${simulationIdNumber}`],
    enabled: !!simulationIdNumber
  });

  useEffect(() => {
    if (existingSimulation) {
      const processedSimulation: FormalImportSimulation = {
        ...existingSimulation as FormalImportSimulation,
        taxaDolar: parseFloat(String((existingSimulation as any).taxaDolar || 0)) || 5.50,
        valorFobDolar: parseFloat(String((existingSimulation as any).valorFobDolar || 0)) || 0,
        valorFreteDolar: parseFloat(String((existingSimulation as any).valorFreteDolar || 0)) || 0,
        percentualSeguro: parseFloat(String((existingSimulation as any).percentualSeguro || 0)) || 0.18,
        impostos: (existingSimulation as any).impostos || defaultTaxes,
        despesasAdicionais: (existingSimulation as any).despesasAdicionais || defaultExpenses,
        produtos: (existingSimulation as any).produtos || []
      };
      setSimulation(processedSimulation);
    }
  }, [existingSimulation]);

  const updateSimulation = (updates: Partial<FormalImportSimulation>) => {
    setSimulation(prev => ({ ...prev, ...updates }));
  };

  const resetNewTaxForm = () => {
    setNewTax({
      nome: "",
      aliquota: 0,
      baseCalculo: "fob_frete_seguro",
      valor: 0
    });
  };

  const resetNewExpenseForm = () => {
    setNewExpense({
      nome: "",
      valorDolar: 0,
      valorReal: 0
    });
  };

  return {
    simulation,
    setSimulation,
    updateSimulation,
    activeTab,
    setActiveTab,
    showAddTaxDialog,
    setShowAddTaxDialog,
    showAddExpenseDialog,
    setShowAddExpenseDialog,
    newTax,
    setNewTax,
    newExpense,
    setNewExpense,
    resetNewTaxForm,
    resetNewExpenseForm,
    isLoading,
    defaultTaxNames: ["Imposto de Importação (II)", "IPI", "PIS", "COFINS", "ICMS"]
  };
}; 