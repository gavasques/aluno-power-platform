/**
 * HOOK: useSimulationData
 * Gerencia dados principais da simulação de importação formal
 * Extraído de FormalImportSimulatorFixed.tsx para modularização
 */
import { useState, useCallback } from 'react';
import { FormalImportSimulation, SimulationResults, UseSimulationDataReturn } from '../types';

const DEFAULT_SIMULATION: FormalImportSimulation = {
  nome: '',
  fornecedor: '',
  despachante: '',
  agenteCargas: '',
  status: 'Rascunho',
  taxaDolar: 5.50,
  valorFobDolar: 0,
  valorFreteDolar: 0,
  percentualSeguro: 0.2,
  impostos: [],
  despesasAdicionais: [],
  produtos: [],
  resultados: {},
  dataSimulacao: new Date().toISOString().split('T')[0],
  observacoes: ''
};

export const useSimulationData = (): UseSimulationDataReturn => {
  // ===== STATE =====
  const [simulation, setSimulation] = useState<FormalImportSimulation>(DEFAULT_SIMULATION);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== ACTIONS =====
  const updateSimulation = useCallback((data: Partial<FormalImportSimulation>) => {
    setSimulation(prev => ({ ...prev, ...data }));
  }, []);

  const saveSimulation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/formal-import-simulations', {
        method: simulation.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simulation)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar simulação');
      }

      const savedSimulation = await response.json();
      setSimulation(savedSimulation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, [simulation]);

  const loadSimulation = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/formal-import-simulations/${id}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar simulação');
      }

      const loadedSimulation = await response.json();
      setSimulation(loadedSimulation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetSimulation = useCallback(() => {
    setSimulation(DEFAULT_SIMULATION);
    setError(null);
  }, []);

  return {
    simulation,
    isLoading,
    error,
    updateSimulation,
    saveSimulation,
    loadSimulation,
    resetSimulation
  };
};