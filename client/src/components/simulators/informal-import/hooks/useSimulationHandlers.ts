import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  SimulacaoCompleta,
  ConfiguracoesGerais,
  ProdutoSimulacao,
  DEFAULT_PRODUCT,
  DEFAULT_SIMULATION,
  SimulationEventHandlers,
  UIState
} from '../types';
import { generateProductId, validateSimulation, generatePDF } from '../utils';

/**
 * Custom hook for simulation event handlers
 * Follows Single Responsibility Principle - only handles event logic
 * All handlers are memoized for optimal performance
 */
export const useSimulationHandlers = (
  activeSimulation: SimulacaoCompleta,
  setActiveSimulation: React.Dispatch<React.SetStateAction<SimulacaoCompleta>>,
  setUIState: React.Dispatch<React.SetStateAction<UIState>>,
  setSelectedSimulationId: React.Dispatch<React.SetStateAction<number | null>>,
  onSaveMutation: any,
  calculatedResults: any
): SimulationEventHandlers => {
  const { toast } = useToast();

  // Simulation metadata handlers
  const handleSimulationChange = useCallback((updates: Partial<SimulacaoCompleta>) => {
    setActiveSimulation(prev => ({ ...prev, ...updates }));
  }, [setActiveSimulation]);

  // Configuration handlers
  const handleConfigChange = useCallback((field: keyof ConfiguracoesGerais, value: any) => {
    setActiveSimulation(prev => ({
      ...prev,
      configuracoesGerais: { ...prev.configuracoesGerais, [field]: value }
    }));
  }, [setActiveSimulation]);

  // Product management handlers
  const handleProductAdd = useCallback(() => {
    const newProduct: ProdutoSimulacao = {
      ...DEFAULT_PRODUCT,
      id_produto_interno: generateProductId(),
    };
    setActiveSimulation(prev => ({
      ...prev,
      produtos: [...prev.produtos, newProduct]
    }));
  }, [setActiveSimulation]);

  const handleProductUpdate = useCallback((index: number, field: keyof ProdutoSimulacao, value: any) => {
    setActiveSimulation(prev => ({
      ...prev,
      produtos: prev.produtos.map((p, i) => 
        i === index ? { ...p, [field]: value } : p
      )
    }));
  }, [setActiveSimulation]);

  const handleProductRemove = useCallback((index: number) => {
    setActiveSimulation(prev => ({
      ...prev,
      produtos: prev.produtos.filter((_, i) => i !== index)
    }));
  }, [setActiveSimulation]);

  // Simulation actions handlers
  const handleSave = useCallback(() => {
    const validation = validateSimulation(activeSimulation);
    if (validation.errors.length > 0) {
      toast({
        title: "Erro de validação",
        description: validation.errors[0].message,
        variant: "destructive"
      });
      return;
    }
    setUIState(prev => ({ ...prev, showSaveDialog: true }));
  }, [activeSimulation, setUIState, toast]);

  const handleLoad = useCallback((simulation: SimulacaoCompleta) => {
    setActiveSimulation({
      ...simulation,
      nomeFornecedor: simulation.nomeFornecedor || "",
      observacoes: simulation.observacoes || "",
    });
    setSelectedSimulationId(simulation.id || null);
    setUIState(prev => ({ ...prev, showLoadDialog: false }));
  }, [setActiveSimulation, setSelectedSimulationId, setUIState]);

  const handleNew = useCallback(() => {
    setActiveSimulation(DEFAULT_SIMULATION);
    setSelectedSimulationId(null);
    setUIState(prev => ({
      ...prev,
      showSaveDialog: false,
      showLoadDialog: false,
      showDeleteConfirm: false
    }));
  }, [setActiveSimulation, setSelectedSimulationId, setUIState]);

  // Export handlers
  const handleExportPDF = useCallback(() => {
    try {
      // Safety checks
      if (!activeSimulation) {
        throw new Error('Simulação não encontrada');
      }

      if (!calculatedResults) {
        throw new Error('Resultados calculados não encontrados');
      }

      generatePDF(activeSimulation, calculatedResults);
      toast({
        title: "PDF exportado",
        description: "Arquivo PDF gerado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF.",
        variant: "destructive"
      });
    }
  }, [activeSimulation, calculatedResults, toast]);

  return {
    onSimulationChange: handleSimulationChange,
    onConfigChange: handleConfigChange,
    onProductAdd: handleProductAdd,
    onProductUpdate: handleProductUpdate,
    onProductRemove: handleProductRemove,
    onSave: handleSave,
    onLoad: handleLoad,
    onNew: handleNew,
    onExportPDF: handleExportPDF,
  };
};