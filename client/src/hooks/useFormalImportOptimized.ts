import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  FormalImportSimulation, 
  DEFAULT_TAXES, 
  DEFAULT_EXPENSES, 
  DEFAULT_TAX_NAMES 
} from '@/types/formal-import';
import { 
  calculateProductCBM, 
  calculateProductPercentages,
  validateProduct,
  validateSimulation 
} from '@/utils/formal-import-utils';

export const useFormalImportOptimized = (simulationId?: string | null) => {
  const [activeTab, setActiveTab] = useState("info");
  const [showAddTaxDialog, setShowAddTaxDialog] = useState(false);
  const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false);

  // Estado inicial otimizado
  const initialSimulation: FormalImportSimulation = useMemo(() => ({
    nome: "Nova Simulação Formal",
    fornecedor: "",
    despachante: "",
    agenteCargas: "",
    status: "Em andamento",
    taxaDolar: 5.50,
    valorFobDolar: 1000,
    valorFreteDolar: 200,
    percentualSeguro: 0.18,
    impostos: [...DEFAULT_TAXES],
    despesasAdicionais: [...DEFAULT_EXPENSES],
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
  }), []);

  const [simulation, setSimulation] = useState<FormalImportSimulation>(initialSimulation);

  // Carregar simulação existente
  const simulationIdNumber = simulationId ? parseInt(simulationId) : null;
  const { data: existingSimulation, isLoading } = useQuery({
    queryKey: [`/api/simulators/formal-import/${simulationIdNumber}`],
    enabled: !!simulationIdNumber,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Atualizar simulação quando dados existentes são carregados
  useMemo(() => {
    if (existingSimulation) {
      const processedSimulation: FormalImportSimulation = {
        ...existingSimulation,
        taxaDolar: parseFloat(String(existingSimulation.taxaDolar)) || 5.50,
        valorFobDolar: parseFloat(String(existingSimulation.valorFobDolar)) || 0,
        valorFreteDolar: parseFloat(String(existingSimulation.valorFreteDolar)) || 0,
        percentualSeguro: parseFloat(String(existingSimulation.percentualSeguro)) || 0.18,
        impostos: existingSimulation.impostos || DEFAULT_TAXES,
        despesasAdicionais: existingSimulation.despesasAdicionais || DEFAULT_EXPENSES,
        produtos: existingSimulation.produtos || []
      };
      setSimulation(processedSimulation);
    }
  }, [existingSimulation]);

  // Funções otimizadas com useCallback
  const updateSimulation = useCallback((updates: Partial<FormalImportSimulation>) => {
    setSimulation(prev => ({ ...prev, ...updates }));
  }, []);

  const addProduct = useCallback(() => {
    const newProduct = {
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
  }, [simulation.produtos?.length]);

  const updateProduct = useCallback((index: number, field: string, value: any) => {
    setSimulation(prev => {
      const updatedProducts = (prev.produtos || []).map((produto, i) => {
        if (i === index) {
          const updatedProduct = { ...produto, [field]: value };
          
          // Calcular CBM automaticamente quando dimensões mudarem
          if (['comprimento', 'largura', 'altura', 'quantidade'].includes(field)) {
            const { cbmUnitario, cbmTotal } = calculateProductCBM(updatedProduct);
            return { ...updatedProduct, cbmUnitario, cbmTotal };
          }
          
          return updatedProduct;
        }
        return produto;
      });

      // Calcular percentuais de container automaticamente
      const productsWithPercentages = calculateProductPercentages(updatedProducts);

      return {
        ...prev,
        produtos: productsWithPercentages
      };
    });
  }, []);

  const removeProduct = useCallback((index: number) => {
    setSimulation(prev => ({
      ...prev,
      produtos: (prev.produtos || []).filter((_, i) => i !== index)
    }));
  }, []);

  const addCustomTax = useCallback((newTax: any) => {
    if (!newTax.nome.trim()) {
      throw new Error("Nome do imposto é obrigatório");
    }

    if ((simulation.impostos || []).some(tax => tax.nome.toLowerCase() === newTax.nome.toLowerCase())) {
      throw new Error("Já existe um imposto com esse nome");
    }

    setSimulation(prev => ({
      ...prev,
      impostos: [...(prev.impostos || []), { ...newTax }]
    }));
  }, [simulation.impostos]);

  const removeCustomTax = useCallback((index: number) => {
    const tax = (simulation.impostos || [])[index];
    
    if (DEFAULT_TAX_NAMES.includes(tax.nome)) {
      throw new Error("Não é possível remover impostos padrão");
    }

    setSimulation(prev => ({
      ...prev,
      impostos: (prev.impostos || []).filter((_, i) => i !== index)
    }));
  }, [simulation.impostos]);

  const addNewExpense = useCallback((newExpense: any) => {
    if (!newExpense.nome || (newExpense.valorDolar === 0 && newExpense.valorReal === 0)) {
      throw new Error("Preencha o nome da despesa e pelo menos um valor");
    }

    setSimulation(prev => ({
      ...prev,
      despesasAdicionais: [...(prev.despesasAdicionais || []), { ...newExpense }]
    }));
  }, []);

  const removeExpense = useCallback((index: number) => {
    setSimulation(prev => ({
      ...prev,
      despesasAdicionais: (prev.despesasAdicionais || []).filter((_, i) => i !== index)
    }));
  }, []);

  // Validações memoizadas
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    
    // Validar simulação
    errors.push(...validateSimulation(simulation));
    
    // Validar produtos
    simulation.produtos?.forEach((product, index) => {
      const productErrors = validateProduct(product);
      productErrors.forEach(error => {
        errors.push(`Produto ${index + 1}: ${error}`);
      });
    });
    
    return errors;
  }, [simulation]);

  // Cálculos memoizados
  const calculatedProducts = useMemo(() => {
    return calculateProductPercentages(simulation.produtos || []);
  }, [simulation.produtos]);

  const totalCBM = useMemo(() => {
    return calculatedProducts.reduce((sum, p) => sum + (p.cbmTotal || 0), 0);
  }, [calculatedProducts]);

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
    isLoading,
    validationErrors,
    calculatedProducts,
    totalCBM,
    addProduct,
    updateProduct,
    removeProduct,
    addCustomTax,
    removeCustomTax,
    addNewExpense,
    removeExpense
  };
}; 