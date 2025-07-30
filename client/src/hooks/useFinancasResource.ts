/**
 * Hook genérico para operações CRUD nos recursos do Finanças360
 * Elimina duplicação das operações de query e mutation nos managers
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/UserContext';
import { useManagerState } from './useManagerState';
import { 
  BaseFinancasEntity, 
  BaseFormData, 
  ResourceConfig, 
  ToastMessage 
} from '@/types/financas360';

interface UseFinancasResourceProps<TEntity extends BaseFinancasEntity, TFormData extends BaseFormData> {
  resource: string;
  initialFormData: TFormData;
  mapEntityToForm?: (entity: TEntity) => TFormData;
  customMessages?: {
    create?: string;
    update?: string;
    delete?: string;
    deleteConfirm?: string;
    loading?: string;
  };
}

export function useFinancasResource<TEntity extends BaseFinancasEntity, TFormData extends BaseFormData>({
  resource,
  initialFormData,
  mapEntityToForm,
  customMessages = {}
}: UseFinancasResourceProps<TEntity, TFormData>) {
  const { token, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Messages with defaults
  const messages = {
    create: customMessages.create || `${resource} criado com sucesso!`,
    update: customMessages.update || `${resource} atualizado com sucesso!`,
    delete: customMessages.delete || `${resource} excluído com sucesso!`,
    deleteConfirm: customMessages.deleteConfirm || `Tem certeza que deseja excluir este ${resource.toLowerCase()}?`,
    loading: customMessages.loading || `Carregando ${resource.toLowerCase()}s...`
  };

  // Estado do manager
  const state = useManagerState<TEntity, TFormData>({
    initialFormData,
    mapEntityToForm
  });

  // Query para buscar dados
  const { data: items = [], isLoading, error, refetch } = useQuery({
    queryKey: [`financas360-${resource}`],
    queryFn: async (): Promise<TEntity[]> => {
      console.log(`Fetching ${resource}...`);
      console.log('Token:', token ? 'presente' : 'ausente');
      
      const response = await fetch(`/api/financas360/${resource}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log(`${resource} response status:`, response.status);
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar ${resource}`);
      }
      
      const result = await response.json();
      console.log(`${resource} result data:`, result.data);
      console.log(`${resource} array length:`, result.data?.length);
      return result.data;
    },
    enabled: !!token && !authLoading
  });

  // Mutation para criar
  const createMutation = useMutation({
    mutationFn: async (data: TFormData): Promise<TEntity> => {
      const response = await fetch(`/api/financas360/${resource}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Erro ao criar ${resource}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`financas360-${resource}`] });
      state.closeDialog();
      toast({
        title: 'Sucesso',
        description: messages.create
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
    mutationFn: async ({ id, data }: { id: number; data: Partial<TFormData> }): Promise<TEntity> => {
      const response = await fetch(`/api/financas360/${resource}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Erro ao atualizar ${resource}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`financas360-${resource}`] });
      state.closeDialog();
      toast({
        title: 'Sucesso',
        description: messages.update
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
      const response = await fetch(`/api/financas360/${resource}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Erro ao excluir ${resource}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`financas360-${resource}`] });
      toast({
        title: 'Sucesso',
        description: messages.delete
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

  // Handler para submit do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (state.editingItem) {
      updateMutation.mutate({ 
        id: state.editingItem.id, 
        data: state.formData 
      });
    } else {
      createMutation.mutate(state.formData);
    }
  };

  // Handler para deletar com confirmação
  const handleDelete = (id: number) => {
    if (window.confirm(messages.deleteConfirm)) {
      deleteMutation.mutate(id);
    }
  };

  // Retry da query
  const handleRetry = () => {
    refetch();
  };

  // Items filtrados
  const filteredItems = state.filterItems(items);

  // Estados derivados
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  console.log(`${resource}Manager render - authLoading:`, authLoading, 'isLoading:', isLoading, 'error:', error, 'items:', items, 'items.length:', items?.length);

  return {
    // Dados
    items,
    filteredItems,
    
    // Estados de loading/error
    isLoading: authLoading || isLoading,
    error,
    isSubmitting,
    isDeleting,

    // Estados do manager
    ...state,

    // Mutations
    createMutation,
    updateMutation,
    deleteMutation,

    // Handlers
    handleSubmit,
    handleDelete,
    handleRetry,

    // Metadados
    resource,
    messages
  };
}