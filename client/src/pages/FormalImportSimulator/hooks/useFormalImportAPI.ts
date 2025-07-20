import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { FormalImportSimulation } from './useFormalImportState';

const FEATURE_CODE = 'formal-import-simulator';

export const useFormalImportAPI = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { logAIGeneration } = useCreditSystem();

  // Calculate simulation
  const calculateMutation = useMutation({
    mutationFn: async (data: FormalImportSimulation) => {
      try {
        return await apiRequest(`/api/simulators/formal-import/calculate`, {
          method: 'POST',
          body: JSON.stringify(data)
        });
      } catch (error) {
        console.error('Calculate mutation error:', error);
        throw error;
      }
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
    mutationFn: async (data: { simulation: FormalImportSimulation; simulationId?: string }) => {
      try {
        if (data.simulationId) {
          return await apiRequest(`/api/simulators/formal-import/${data.simulationId}`, {
            method: 'PUT',
            body: JSON.stringify(data.simulation)
          });
        } else {
          return await apiRequest(`/api/simulators/formal-import`, {
            method: 'POST',
            body: JSON.stringify(data.simulation)
          });
        }
      } catch (error) {
        console.error('Save mutation error:', error);
        throw error;
      }
    },
    onSuccess: async (data: any, variables) => {
      toast({
        title: "Simulação salva com sucesso!",
        description: `Código: ${data.codigoSimulacao || data.nome}`
      });
      
      // Registrar log de uso com dedução automática de créditos apenas para novas simulações
      if (!variables.simulationId) {
        await logAIGeneration({
          featureCode: FEATURE_CODE,
          provider: 'formal-import',
          model: 'simulation',
          prompt: `Simulação formal: ${variables.simulation.nome}`,
          response: `Simulação criada com ${variables.simulation.produtos.length} produtos`,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          cost: 0,
          duration: 0
        });
      }
      
      // Invalidar cache imediatamente e forçar refetch
      queryClient.invalidateQueries({ queryKey: ['/api/simulators/formal-import'] });
      queryClient.refetchQueries({ queryKey: ['/api/simulators/formal-import'] });
      
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

  // Delete simulation
  const deleteMutation = useMutation({
    mutationFn: async (simulationId: string) => {
      try {
        return await apiRequest(`/api/simulators/formal-import/${simulationId}`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.error('Delete mutation error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Simulação excluída com sucesso!",
        description: "A simulação foi removida permanentemente"
      });
      
      // Invalidar cache e voltar para lista
      queryClient.invalidateQueries({ queryKey: ['/api/simulators/formal-import'] });
      setLocation("/simuladores/importacao-formal-direta");
    },
    onError: (error) => {
      console.error('Erro ao excluir simulação:', error);
      toast({
        title: "Erro ao excluir",
        description: "Verifique os dados e tente novamente",
        variant: "destructive"
      });
    }
  });

  const handleCalculate = (simulation: FormalImportSimulation) => {
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

  const handleSave = async (simulation: FormalImportSimulation, simulationId?: string) => {
    try {
      // Validar dados antes de salvar
      if (!simulation.nome || simulation.nome.trim() === "") {
        toast({
          title: "Aviso",
          description: "Informe um nome para a simulação",
          variant: "destructive"
        });
        return;
      }

      if (!simulation.produtos || simulation.produtos.length === 0) {
        toast({
          title: "Aviso",
          description: "Adicione pelo menos um produto para salvar",
          variant: "destructive"
        });
        return;
      }

      saveMutation.mutate({ simulation, simulationId });
    } catch (error) {
      console.error('Erro ao salvar simulação:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (simulationId: string) => {
    deleteMutation.mutate(simulationId);
  };

  return {
    calculateMutation,
    saveMutation,
    deleteMutation,
    handleCalculate,
    handleSave,
    handleDelete,
    isCalculating: calculateMutation.isPending,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
}; 