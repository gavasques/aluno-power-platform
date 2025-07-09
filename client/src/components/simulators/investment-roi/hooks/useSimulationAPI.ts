import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { InvestmentSimulation, ConfiguracaoSimulacao, GiroEditavel } from '../types';
import { validateSimulation } from '../utils';

/**
 * Custom hook for Investment Simulation API operations
 * Handles all CRUD operations with error handling and user feedback
 */
export const useSimulationAPI = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for loading user simulations
  const { data: simulations = [], isLoading: isLoadingSimulations } = useQuery({
    queryKey: ['investment-simulations'],
    queryFn: () => apiRequest('/api/investment-simulations'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for saving simulations
  const saveSimulationMutation = useMutation({
    mutationFn: async (data: {
      simulation: Partial<InvestmentSimulation>;
      currentId?: number | null;
    }) => {
      const { simulation, currentId } = data;
      
      // Validate simulation before saving
      const errors = validateSimulation({
        name: simulation.name || '',
        numberOfCycles: simulation.numberOfCycles || 0
      });
      
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      if (currentId) {
        return apiRequest(`/api/investment-simulations/${currentId}`, {
          method: 'PUT',
          body: JSON.stringify(simulation)
        });
      } else {
        return apiRequest('/api/investment-simulations', {
          method: 'POST',
          body: JSON.stringify(simulation)
        });
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['investment-simulations'] });
      toast({
        title: "Simulação salva",
        description: `${variables.simulation.name} foi salva com sucesso!`
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar a simulação.",
        variant: "destructive"
      });
    }
  });

  // Mutation for deleting simulations
  const deleteSimulationMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/investment-simulations/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment-simulations'] });
      toast({
        title: "Simulação excluída",
        description: "A simulação foi excluída com sucesso."
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a simulação.",
        variant: "destructive"
      });
    }
  });

  // Helper function to save a simulation
  const saveSimulation = (
    name: string,
    config: ConfiguracaoSimulacao,
    girosData: { [key: number]: GiroEditavel },
    currentSimulationId?: number | null
  ) => {
    const simulation: Partial<InvestmentSimulation> = {
      name,
      initialInvestment: config.investimentoInicial,
      cycleDuration: config.duracaoGiro,
      cycleUnit: config.unidadeTempo,
      numberOfCycles: config.numeroGiros,
      cycles: girosData
    };

    saveSimulationMutation.mutate({ 
      simulation, 
      currentId: currentSimulationId 
    });
  };

  // Helper function to load a simulation
  const loadSimulation = (
    simulation: InvestmentSimulation,
    setConfig: (config: ConfiguracaoSimulacao) => void,
    setGirosData: (data: { [key: number]: GiroEditavel }) => void,
    setCurrentSimulationId: (id: number | null) => void,
    setSimulationName: (name: string) => void
  ) => {
    setConfig({
      investimentoInicial: simulation.initialInvestment,
      duracaoGiro: simulation.cycleDuration,
      unidadeTempo: simulation.cycleUnit as 'Dias' | 'Semanas' | 'Meses',
      numeroGiros: simulation.numberOfCycles,
    });
    setGirosData(simulation.cycles || {});
    setCurrentSimulationId(simulation.id || null);
    setSimulationName(simulation.name);
    
    toast({
      title: "Simulação carregada",
      description: `"${simulation.name}" carregada com sucesso!`
    });
  };

  // Helper function to delete a simulation
  const deleteSimulation = (id: number) => {
    deleteSimulationMutation.mutate(id);
  };

  return {
    // Data
    simulations,
    isLoadingSimulations,
    
    // Mutations
    saveSimulationMutation,
    deleteSimulationMutation,
    
    // Helper functions
    saveSimulation,
    loadSimulation,
    deleteSimulation,
    
    // Loading states
    isSaving: saveSimulationMutation.isPending,
    isDeleting: deleteSimulationMutation.isPending,
  };
};