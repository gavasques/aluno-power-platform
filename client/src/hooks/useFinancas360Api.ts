// Hook reutilizável para operações CRUD do Finanças 360
// Seguindo princípios SOLID: Single Responsibility e DRY

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import type { ApiResponse } from '@/types/financas360';

// Interface para configuração do hook
interface UseFinancas360ApiConfig {
  endpoint: string;
  entityName: string;
  queryKey: string;
}

// Hook genérico para operações CRUD
export function useFinancas360Api<TEntity, TInsert = Partial<TEntity>>({
  endpoint,
  entityName,
  queryKey
}: UseFinancas360ApiConfig) {
  const { token, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar dados
  const query = useQuery({
    queryKey: [queryKey],
    queryFn: async (): Promise<TEntity[]> => {
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch(`/api/financas360/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao carregar ${entityName.toLowerCase()}`);
      }

      const result: ApiResponse<TEntity[]> = await response.json();
      return result.data || [];
    },
    enabled: !!token && !authLoading
  });

  // Mutation para criar
  const createMutation = useMutation({
    mutationFn: async (data: TInsert): Promise<TEntity> => {
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch(`/api/financas360/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Erro ao criar ${entityName.toLowerCase()}`);
      }

      const result: ApiResponse<TEntity> = await response.json();
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast({
        title: 'Sucesso',
        description: `${entityName} criado(a) com sucesso!`
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Mutation para atualizar
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<TInsert> }): Promise<TEntity> => {
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch(`/api/financas360/${endpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Erro ao atualizar ${entityName.toLowerCase()}`);
      }

      const result: ApiResponse<TEntity> = await response.json();
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast({
        title: 'Sucesso',
        description: `${entityName} atualizado(a) com sucesso!`
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: async (id: number): Promise<void> => {
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch(`/api/financas360/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Erro ao excluir ${entityName.toLowerCase()}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast({
        title: 'Sucesso',
        description: `${entityName} excluído(a) com sucesso!`
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    // Dados
    data: query.data || [],
    isLoading: query.isLoading || authLoading,
    error: query.error,

    // Mutations
    create: createMutation.mutate,
    update: updateMutation.mutate,
    remove: deleteMutation.mutate,

    // Estados das mutations
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Função para refetch
    refetch: query.refetch
  };
}

// Hooks específicos para cada entidade
export function useEmpresas() {
  return useFinancas360Api<any, any>({
    endpoint: 'empresas',
    entityName: 'Empresa',
    queryKey: 'financas360-empresas'
  });
}

export function useCanais() {
  return useFinancas360Api<any, any>({
    endpoint: 'canais',
    entityName: 'Canal',
    queryKey: 'financas360-canais'
  });
}

export function useBancos() {
  return useFinancas360Api<any, any>({
    endpoint: 'bancos',
    entityName: 'Banco',
    queryKey: 'financas360-bancos'
  });
}

export function useContasBancarias() {
  return useFinancas360Api<any, any>({
    endpoint: 'contas-bancarias',
    entityName: 'Conta Bancária',
    queryKey: 'financas360-contas-bancarias'
  });
}

export function useFormasPagamento() {
  return useFinancas360Api<any, any>({
    endpoint: 'formas-pagamento',
    entityName: 'Forma de Pagamento',
    queryKey: 'financas360-formas-pagamento'
  });
}

export function useParceiros() {
  return useFinancas360Api<any, any>({
    endpoint: 'parceiros',
    entityName: 'Parceiro',
    queryKey: 'financas360-parceiros'
  });
}

export function useCanaisPagamento() {
  return useFinancas360Api<any, any>({
    endpoint: 'canais-pagamento',
    entityName: 'Canal de Pagamento',
    queryKey: 'financas360-canais-pagamento'
  });
}

export function useEstruturaDRE() {
  return useFinancas360Api<any, any>({
    endpoint: 'estrutura-dre',
    entityName: 'Estrutura DRE',
    queryKey: 'financas360-estrutura-dre'
  });
}

export function useLancamentos() {
  return useFinancas360Api<any, any>({
    endpoint: 'lancamentos',
    entityName: 'Lançamento',
    queryKey: 'financas360-lancamentos'
  });
}

export function useNotasFiscais() {
  return useFinancas360Api<any, any>({
    endpoint: 'notas-fiscais',
    entityName: 'Nota Fiscal',
    queryKey: 'financas360-notas-fiscais'
  });
}

export function useDevolucoes() {
  return useFinancas360Api<any, any>({
    endpoint: 'devolucoes',
    entityName: 'Devolução',
    queryKey: 'financas360-devolucoes'
  });
}

// Hook para confirmação de exclusão
export function useDeleteConfirmation() {
  return (itemName: string, onConfirm: () => void) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir ${itemName}? Esta ação não pode ser desfeita.`
    );
    if (confirmed) {
      onConfirm();
    }
  };
}

// Hook para resetar formulários
export function useFormReset<T>() {
  return (initialState: T, setter: (state: T) => void) => {
    setter(initialState);
  };
}

// Utility para tratamento de erros
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Erro desconhecido';
};