import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CrudOptions {
  endpoint: string;
  queryKey: string | string[];
  messages?: {
    createSuccess?: string;
    updateSuccess?: string;
    deleteSuccess?: string;
    createError?: string;
    updateError?: string;
    deleteError?: string;
  };
}

export const useCrudMutations = <T = any>(options: CrudOptions) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const defaultMessages = {
    createSuccess: 'Item criado com sucesso',
    updateSuccess: 'Item atualizado com sucesso',
    deleteSuccess: 'Item removido com sucesso',
    createError: 'Erro ao criar item',
    updateError: 'Erro ao atualizar item',
    deleteError: 'Erro ao remover item',
  };
  
  const messages = { ...defaultMessages, ...options.messages };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: T) => {
      return apiRequest(options.endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: Array.isArray(options.queryKey) ? options.queryKey : [options.queryKey] 
      });
      toast({
        title: 'Sucesso',
        description: messages.createSuccess,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || messages.createError,
        variant: 'destructive',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: T }) => {
      return apiRequest(`${options.endpoint}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: Array.isArray(options.queryKey) ? options.queryKey : [options.queryKey] 
      });
      toast({
        title: 'Sucesso',
        description: messages.updateSuccess,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || messages.updateError,
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number | string) => {
      return apiRequest(`${options.endpoint}/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: Array.isArray(options.queryKey) ? options.queryKey : [options.queryKey] 
      });
      toast({
        title: 'Sucesso',
        description: messages.deleteSuccess,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || messages.deleteError,
        variant: 'destructive',
      });
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export default useCrudMutations;