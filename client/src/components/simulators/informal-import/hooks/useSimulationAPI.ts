import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { SimulacaoCompleta } from '../types';

/**
 * Custom hook for simulation API operations
 * Follows Single Responsibility Principle - only handles API operations
 */
export const useSimulationAPI = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query for fetching simulations
  const useSimulations = () => {
    return useQuery({
      queryKey: ['/api/simulations/import'],
      enabled: true,
      select: (data: any) => data?.data || [] // Extract data from paginated response
    });
  };

  // Mutation for saving simulations
  const useSaveSimulation = () => {
    return useMutation({
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
        queryClient.invalidateQueries({ queryKey: ['/api/simulations/import'] });
        toast({ title: "Simulação salva com sucesso!" });
        return savedSimulation;
      },
      onError: () => {
        toast({ title: "Erro ao salvar simulação", variant: "destructive" });
      }
    });
  };

  // Mutation for deleting simulations
  const useDeleteSimulation = () => {
    return useMutation({
      mutationFn: (id: number) => apiRequest(`/api/simulations/import/${id}`, { method: 'DELETE' }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/simulations/import'] });
        toast({ title: "Simulação excluída com sucesso!" });
      },
      onError: () => {
        toast({ title: "Erro ao excluir simulação", variant: "destructive" });
      }
    });
  };

  // Mutation for duplicating simulations
  const useDuplicateSimulation = () => {
    return useMutation({
      mutationFn: (id: number) => apiRequest(`/api/simulations/import/${id}/duplicate`, { method: 'POST' }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/simulations/import'] });
        toast({ title: "Simulação duplicada com sucesso!" });
      },
      onError: () => {
        toast({ title: "Erro ao duplicar simulação", variant: "destructive" });
      }
    });
  };

  return {
    useSimulations,
    useSaveSimulation,
    useDeleteSimulation,
    useDuplicateSimulation,
  };
};