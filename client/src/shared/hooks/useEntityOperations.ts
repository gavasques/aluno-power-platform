/**
 * Hook consolidado para operações CRUD de entidades
 * Elimina duplicação de lógica de estado de loading/error entre componentes
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useNotifications } from '@/contexts/UIContext';
import { useGlobalLoading } from '@/contexts/UIContext';

interface EntityOperationsConfig<T> {
  entityName: string;
  entityDisplayName?: string;
  queryKey: string;
  endpoints?: {
    create?: string;
    update?: string;
    delete?: string;
  };
  onSuccess?: {
    create?: (data: T) => void;
    update?: (data: T) => void;
    delete?: (id: number | string) => void;
  };
  notifications?: {
    create?: { success: string; error: string };
    update?: { success: string; error: string };
    delete?: { success: string; error: string };
  };
}

export function useEntityOperations<T = any>(config: EntityOperationsConfig<T>) {
  const queryClient = useQueryClient();
  const { add: addNotification } = useNotifications();
  const { setOperation } = useGlobalLoading();

  const {
    entityName,
    entityDisplayName = entityName,
    queryKey,
    endpoints = {},
    onSuccess = {},
    notifications = {}
  } = config;

  // Default endpoints
  const defaultEndpoints = {
    create: endpoints.create || `/api/${entityName}`,
    update: endpoints.update || `/api/${entityName}`,
    delete: endpoints.delete || `/api/${entityName}`,
  };

  // Default notifications
  const defaultNotifications = {
    create: {
      success: notifications.create?.success || `${entityDisplayName} criado com sucesso`,
      error: notifications.create?.error || `Erro ao criar ${entityDisplayName.toLowerCase()}`
    },
    update: {
      success: notifications.update?.success || `${entityDisplayName} atualizado com sucesso`,
      error: notifications.update?.error || `Erro ao atualizar ${entityDisplayName.toLowerCase()}`
    },
    delete: {
      success: notifications.delete?.success || `${entityDisplayName} excluído com sucesso`,
      error: notifications.delete?.error || `Erro ao excluir ${entityDisplayName.toLowerCase()}`
    }
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: Partial<T>) => {
      setOperation(`create-${entityName}`, true);
      try {
        return await apiRequest<T>(defaultEndpoints.create, {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } finally {
        setOperation(`create-${entityName}`, false);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      addNotification({
        type: 'success',
        title: 'Sucesso',
        message: defaultNotifications.create.success,
      });
      onSuccess.create?.(data);
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: error.message || defaultNotifications.create.error,
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: Partial<T> }) => {
      setOperation(`update-${entityName}`, true);
      try {
        return await apiRequest<T>(`${defaultEndpoints.update}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      } finally {
        setOperation(`update-${entityName}`, false);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      addNotification({
        type: 'success',
        title: 'Sucesso',
        message: defaultNotifications.update.success,
      });
      onSuccess.update?.(data);
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: error.message || defaultNotifications.update.error,
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number | string) => {
      setOperation(`delete-${entityName}`, true);
      try {
        return await apiRequest(`${defaultEndpoints.delete}/${id}`, {
          method: 'DELETE',
        });
      } finally {
        setOperation(`delete-${entityName}`, false);
      }
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      addNotification({
        type: 'success',
        title: 'Sucesso',
        message: defaultNotifications.delete.success,
      });
      onSuccess.delete?.(id);
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: error.message || defaultNotifications.delete.error,
      });
    },
  });

  // Convenience methods
  const create = useCallback((data: Partial<T>) => {
    createMutation.mutate(data);
  }, [createMutation]);

  const update = useCallback((id: number | string, data: Partial<T>) => {
    updateMutation.mutate({ id, data });
  }, [updateMutation]);

  const remove = useCallback((id: number | string) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  // Batch operations
  const createMany = useCallback(async (items: Partial<T>[]) => {
    setOperation(`create-many-${entityName}`, true);
    try {
      const promises = items.map(item => createMutation.mutateAsync(item));
      await Promise.all(promises);
      addNotification({
        type: 'success',
        title: 'Sucesso',
        message: `${items.length} ${entityDisplayName.toLowerCase()}(s) criado(s) com sucesso`,
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: `Erro ao criar ${entityDisplayName.toLowerCase()}s em lote`,
      });
    } finally {
      setOperation(`create-many-${entityName}`, false);
    }
  }, [createMutation, entityName, entityDisplayName, setOperation, addNotification]);

  const updateMany = useCallback(async (updates: Array<{ id: number | string; data: Partial<T> }>) => {
    setOperation(`update-many-${entityName}`, true);
    try {
      const promises = updates.map(({ id, data }) => updateMutation.mutateAsync({ id, data }));
      await Promise.all(promises);
      addNotification({
        type: 'success',
        title: 'Sucesso',
        message: `${updates.length} ${entityDisplayName.toLowerCase()}(s) atualizado(s) com sucesso`,
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: `Erro ao atualizar ${entityDisplayName.toLowerCase()}s em lote`,
      });
    } finally {
      setOperation(`update-many-${entityName}`, false);
    }
  }, [updateMutation, entityName, entityDisplayName, setOperation, addNotification]);

  const removeMany = useCallback(async (ids: (number | string)[]) => {
    setOperation(`delete-many-${entityName}`, true);
    try {
      const promises = ids.map(id => deleteMutation.mutateAsync(id));
      await Promise.all(promises);
      addNotification({
        type: 'success',
        title: 'Sucesso',
        message: `${ids.length} ${entityDisplayName.toLowerCase()}(s) excluído(s) com sucesso`,
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: `Erro ao excluir ${entityDisplayName.toLowerCase()}s em lote`,
      });
    } finally {
      setOperation(`delete-many-${entityName}`, false);
    }
  }, [deleteMutation, entityName, entityDisplayName, setOperation, addNotification]);

  return {
    // Individual operations
    create,
    update,
    remove,
    
    // Batch operations
    createMany,
    updateMany,
    removeMany,
    
    // Mutation objects (for advanced usage)
    createMutation,
    updateMutation,
    deleteMutation,
    
    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    
    // Error states
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    
    // Reset methods
    resetCreateError: createMutation.reset,
    resetUpdateError: updateMutation.reset,
    resetDeleteError: deleteMutation.reset,
    resetAllErrors: () => {
      createMutation.reset();
      updateMutation.reset();
      deleteMutation.reset();
    },
  };
}