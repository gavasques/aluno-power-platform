/**
 * Hook personalizado para operações CRUD padronizadas
 * Elimina duplicação de lógica de gerenciamento de entidades
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';

interface EntityManagerOptions {
  autoRefetch?: boolean;
  successMessages?: {
    create?: string;
    update?: string;
    delete?: string;
  };
  onError?: (error: Error, operation: string) => void;
  onSuccess?: (data: any, operation: string) => void;
}

interface UseEntityManagerReturn<T> {
  // Dados
  entities: T[];
  isLoading: boolean;
  error: Error | null;
  
  // Operações
  create: (entity: Omit<T, 'id'>) => Promise<T>;
  update: (id: number | string, updates: Partial<T>) => Promise<T>;
  delete: (id: number | string) => Promise<void>;
  refetch: () => void;
  
  // Estados das operações
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Helpers
  getById: (id: number | string) => T | undefined;
  filter: (predicate: (entity: T) => boolean) => T[];
  search: (query: string, fields: (keyof T)[]) => T[];
}

export const useEntityManager = <T extends { id: number | string }>(
  entityName: string,
  apiEndpoint: string,
  options: EntityManagerOptions = {}
): UseEntityManagerReturn<T> => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const {
    autoRefetch = true,
    successMessages = {},
    onError,
    onSuccess
  } = options;

  // Query para buscar entidades
  const { data: entities = [], isLoading, error, refetch } = useQuery<T[]>({
    queryKey: [entityName],
    queryFn: async () => {
      const response = await fetch(apiEndpoint);
      if (!response.ok) {
        throw new Error(`Erro ao carregar ${entityName}`);
      }
      const result = await response.json();
      return result.data || result;
    },
    refetchOnWindowFocus: autoRefetch,
  });

  // Mutation para criar
  const createMutation = useMutation({
    mutationFn: async (newEntity: Omit<T, 'id'>): Promise<T> => {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntity)
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao criar ${entityName}`);
      }
      
      const result = await response.json();
      return result.data || result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entityName] });
      toast({
        title: "Sucesso",
        description: successMessages.create || `${entityName} criado com sucesso`
      });
      onSuccess?.(data, 'create');
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
      onError?.(error, 'create');
    }
  });

  // Mutation para atualizar
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number | string; updates: Partial<T> }): Promise<T> => {
      const response = await fetch(`${apiEndpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao atualizar ${entityName}`);
      }
      
      const result = await response.json();
      return result.data || result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entityName] });
      toast({
        title: "Sucesso",
        description: successMessages.update || `${entityName} atualizado com sucesso`
      });
      onSuccess?.(data, 'update');
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
      onError?.(error, 'update');
    }
  });

  // Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: async (id: number | string): Promise<void> => {
      const response = await fetch(`${apiEndpoint}/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao excluir ${entityName}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entityName] });
      toast({
        title: "Sucesso",
        description: successMessages.delete || `${entityName} excluído com sucesso`
      });
      onSuccess?.(null, 'delete');
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
      onError?.(error, 'delete');
    }
  });

  // Helper functions
  const getById = useCallback((id: number | string): T | undefined => {
    return entities.find(entity => entity.id === id);
  }, [entities]);

  const filter = useCallback((predicate: (entity: T) => boolean): T[] => {
    return entities.filter(predicate);
  }, [entities]);

  const search = useCallback((query: string, fields: (keyof T)[]): T[] => {
    if (!query.trim()) return entities;
    
    const lowerQuery = query.toLowerCase();
    return entities.filter(entity =>
      fields.some(field => {
        const value = entity[field];
        return value && String(value).toLowerCase().includes(lowerQuery);
      })
    );
  }, [entities]);

  // Wrapper functions for mutations
  const create = useCallback(async (entity: Omit<T, 'id'>): Promise<T> => {
    return createMutation.mutateAsync(entity);
  }, [createMutation]);

  const update = useCallback(async (id: number | string, updates: Partial<T>): Promise<T> => {
    return updateMutation.mutateAsync({ id, updates });
  }, [updateMutation]);

  const deleteEntity = useCallback(async (id: number | string): Promise<void> => {
    return deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  return {
    // Dados
    entities,
    isLoading,
    error: error as Error | null,
    
    // Operações
    create,
    update,
    delete: deleteEntity,
    refetch,
    
    // Estados das operações
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Helpers
    getById,
    filter,
    search
  };
};