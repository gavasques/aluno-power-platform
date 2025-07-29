/**
 * Hook otimizado para recursos com cache inteligente e otimizações de performance
 * Versão aprimorada do useFinancasResource com cache, prefetch e otimizações
 */

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useManagerState } from './useManagerState';
import { 
  BaseFinancasEntity, 
  BaseFormData
} from '@/types/financas360';

interface CacheStrategy {
  staleTime?: number; // Tempo que os dados ficam "frescos"
  cacheTime?: number; // Tempo que os dados ficam no cache
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  retry?: number | boolean;
}

interface OptimisticUpdateConfig {
  enabled: boolean;
  onMutate?: (variables: any) => any;
  onError?: (error: any, variables: any, context: any) => void;
  onSettled?: () => void;
}

interface UseOptimizedResourceProps<TEntity extends BaseFinancasEntity, TFormData extends BaseFormData> {
  resource: string;
  initialFormData: TFormData;
  mapEntityToForm?: (entity: TEntity) => TFormData;
  cacheStrategy?: CacheStrategy;
  optimisticUpdates?: OptimisticUpdateConfig;
  prefetchRelated?: string[]; // Recursos relacionados para prefetch
  customMessages?: {
    create?: string;
    update?: string;
    delete?: string;
    deleteConfirm?: string;
    loading?: string;
  };
}

export function useOptimizedResource<TEntity extends BaseFinancasEntity, TFormData extends BaseFormData>({
  resource,
  initialFormData,
  mapEntityToForm,
  cacheStrategy = {},
  optimisticUpdates = { enabled: false },
  prefetchRelated = [],
  customMessages = {}
}: UseOptimizedResourceProps<TEntity, TFormData>) {
  const { token, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Configurações de cache com defaults otimizados
  const cache = {
    staleTime: cacheStrategy.staleTime ?? 5 * 60 * 1000, // 5 minutos
    cacheTime: cacheStrategy.cacheTime ?? 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: cacheStrategy.refetchOnWindowFocus ?? false,
    refetchOnReconnect: cacheStrategy.refetchOnReconnect ?? true,
    retry: cacheStrategy.retry ?? 3,
    ...cacheStrategy
  };

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

  // Query otimizada com cache inteligente
  const { data: items = [], isLoading, error, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: [`financas360-${resource}`],
    queryFn: async (): Promise<TEntity[]> => {
      console.log(`Fetching optimized ${resource}...`);
      
      const response = await fetch(`/api/financas360/${resource}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'max-age=300' // 5 minutos de cache HTTP
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar ${resource}`);
      }
      
      const result = await response.json();
      
      // Prefetch recursos relacionados em background
      if (prefetchRelated.length > 0) {
        prefetchRelated.forEach(relatedResource => {
          queryClient.prefetchQuery({
            queryKey: [`financas360-${relatedResource}`],
            queryFn: async () => {
              const relatedResponse = await fetch(`/api/financas360/${relatedResource}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              return relatedResponse.ok ? relatedResponse.json() : null;
            },
            staleTime: cache.staleTime,
            cacheTime: cache.cacheTime
          });
        });
      }
      
      return result.data;
    },
    enabled: !!token && !authLoading,
    staleTime: cache.staleTime,
    cacheTime: cache.cacheTime,
    refetchOnWindowFocus: cache.refetchOnWindowFocus,
    refetchOnReconnect: cache.refetchOnReconnect,
    retry: cache.retry,
    placeholderData: keepPreviousData // Manter dados anteriores durante refetch
  });

  // Items filtrados com memoização
  const filteredItems = useMemo(() => {
    return state.filterItems(items);
  }, [items, state.filters, state.filterItems]);

  // Create mutation com optimistic updates
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
    onMutate: async (variables) => {
      if (!optimisticUpdates.enabled) return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [`financas360-${resource}`] });

      // Snapshot previous value
      const previousItems = queryClient.getQueryData([`financas360-${resource}`]);

      // Optimistically update cache
      if (optimisticUpdates.onMutate) {
        const optimisticItem = optimisticUpdates.onMutate(variables);
        if (optimisticItem) {
          queryClient.setQueryData([`financas360-${resource}`], (old: TEntity[] = []) => [
            ...old,
            { ...optimisticItem, id: Date.now(), isOptimistic: true }
          ]);
        }
      }

      return { previousItems };
    },
    onError: (err, variables, context) => {
      // Revert optimistic update
      if (context?.previousItems) {
        queryClient.setQueryData([`financas360-${resource}`], context.previousItems);
      }
      
      if (optimisticUpdates.onError) {
        optimisticUpdates.onError(err, variables, context);
      }
      
      toast({
        title: 'Erro',
        description: err.message,
        variant: 'destructive'
      });
    },
    onSuccess: () => {
      state.closeDialog();
      toast({
        title: 'Sucesso',
        description: messages.create
      });
    },
    onSettled: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: [`financas360-${resource}`] });
      
      if (optimisticUpdates.onSettled) {
        optimisticUpdates.onSettled();
      }
    }
  });

  // Update mutation com optimistic updates
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
    onMutate: async ({ id, data }) => {
      if (!optimisticUpdates.enabled) return;

      await queryClient.cancelQueries({ queryKey: [`financas360-${resource}`] });
      const previousItems = queryClient.getQueryData([`financas360-${resource}`]);

      // Optimistically update item
      queryClient.setQueryData([`financas360-${resource}`], (old: TEntity[] = []) =>
        old.map(item => item.id === id ? { ...item, ...data } : item)
      );

      return { previousItems };
    },
    onError: (err, variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData([`financas360-${resource}`], context.previousItems);
      }
      
      toast({
        title: 'Erro',
        description: err.message,
        variant: 'destructive'
      });
    },
    onSuccess: () => {
      state.closeDialog();
      toast({
        title: 'Sucesso',
        description: messages.update
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [`financas360-${resource}`] });
    }
  });

  // Delete mutation com optimistic updates
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
    onMutate: async (id) => {
      if (!optimisticUpdates.enabled) return;

      await queryClient.cancelQueries({ queryKey: [`financas360-${resource}`] });
      const previousItems = queryClient.getQueryData([`financas360-${resource}`]);

      // Optimistically remove item
      queryClient.setQueryData([`financas360-${resource}`], (old: TEntity[] = []) =>
        old.filter(item => item.id !== id)
      );

      return { previousItems };
    },
    onError: (err, variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData([`financas360-${resource}`], context.previousItems);
      }
      
      toast({
        title: 'Erro',
        description: err.message,
        variant: 'destructive'
      });
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: messages.delete
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [`financas360-${resource}`] });
    }
  });

  // Prefetch individual item
  const prefetchItem = useCallback((id: number) => {
    queryClient.prefetchQuery({
      queryKey: [`financas360-${resource}`, id],
      queryFn: async () => {
        const response = await fetch(`/api/financas360/${resource}/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        return response.ok ? response.json() : null;
      },
      staleTime: cache.staleTime
    });
  }, [queryClient, resource, token, cache.staleTime]);

  // Invalidate cache
  const invalidateCache = useCallback(() => {
    queryClient.invalidateQueries({ 
      queryKey: [`financas360-${resource}`],
      exact: false 
    });
  }, [queryClient, resource]);

  // Background refresh
  const backgroundRefresh = useCallback(() => {
    queryClient.refetchQueries({ 
      queryKey: [`financas360-${resource}`],
      type: 'active'
    });
  }, [queryClient, resource]);

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

  // Estados derivados
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  // Debug info (development only)
  const debugInfo = useMemo(() => ({
    cacheStatus: {
      isStale: Date.now() - dataUpdatedAt > cache.staleTime,
      lastUpdated: new Date(dataUpdatedAt).toLocaleTimeString(),
      isFetching,
      itemsCount: items.length,
      filteredCount: filteredItems.length
    },
    performance: {
      prefetchedResources: prefetchRelated.length,
      optimisticUpdatesEnabled: optimisticUpdates.enabled,
      cacheSettings: {
        staleTime: `${cache.staleTime / 1000}s`,
        cacheTime: `${cache.cacheTime / 1000}s`
      }
    }
  }), [dataUpdatedAt, cache.staleTime, isFetching, items.length, filteredItems.length, prefetchRelated.length, optimisticUpdates.enabled, cache.cacheTime]);

  if (process.env.NODE_ENV === 'development') {
    console.log(`${resource}OptimizedManager render:`, debugInfo);
  }

  return {
    // Dados
    items,
    filteredItems,
    
    // Estados de loading/error
    isLoading: authLoading || isLoading,
    isFetching,
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

    // Cache management
    prefetchItem,
    invalidateCache,
    backgroundRefresh,

    // Metadados e performance
    resource,
    messages,
    debugInfo,
    
    // Performance metrics
    cacheMetrics: {
      isStale: Date.now() - dataUpdatedAt > cache.staleTime,
      lastFetch: new Date(dataUpdatedAt),
      hitRate: items.length > 0 ? 'cached' : 'fetched'
    }
  };
}