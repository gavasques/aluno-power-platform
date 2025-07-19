import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { BaseCrudService } from '@/lib/services/base/BaseCrudService';

/**
 * Unified CRUD Query Hook
 * Eliminates duplicate React Query configurations across the codebase
 * 
 * Usage:
 * const productQueries = useCrudQuery('products', productService);
 * const { data: products, isLoading } = productQueries.useGetAll();
 * const createMutation = productQueries.useCreate();
 */
export function useCrudQuery<T, CreateT = Partial<T>, UpdateT = Partial<T>>(
  entityKey: string,
  service: BaseCrudService<T, CreateT, UpdateT>,
  options?: {
    defaultQueryOptions?: Partial<UseQueryOptions<T[], Error>>;
    successMessages?: {
      create?: string;
      update?: string;
      delete?: string;
    };
    errorMessages?: {
      create?: string;
      update?: string;
      delete?: string;
    };
  }
) {
  const queryClient = useQueryClient();
  
  const defaultOptions = {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options?.defaultQueryOptions,
  };

  const successMessages = {
    create: `${entityKey} criado com sucesso`,
    update: `${entityKey} atualizado com sucesso`,
    delete: `${entityKey} excluído com sucesso`,
    ...options?.successMessages,
  };

  const errorMessages = {
    create: `Erro ao criar ${entityKey}`,
    update: `Erro ao atualizar ${entityKey}`,
    delete: `Erro ao excluir ${entityKey}`,
    ...options?.errorMessages,
  };

  // Query Functions
  const useGetAll = (queryOptions?: Partial<UseQueryOptions<T[], Error>>) => {
    return useQuery({
      queryKey: [entityKey],
      queryFn: () => service.getAll(),
      ...defaultOptions,
      ...queryOptions,
    });
  };

  const useGetById = (id: number | string | undefined, queryOptions?: Partial<UseQueryOptions<T, Error>>) => {
    return useQuery({
      queryKey: [entityKey, id],
      queryFn: () => service.getById(id!),
      enabled: id !== undefined,
      ...defaultOptions,
      ...queryOptions,
    });
  };

  const useSearch = (query: string, queryOptions?: Partial<UseQueryOptions<T[], Error>>) => {
    return useQuery({
      queryKey: [entityKey, 'search', query],
      queryFn: () => service.search(query),
      enabled: query.length > 0,
      ...defaultOptions,
      ...queryOptions,
    });
  };

  const useFilter = (filters: Record<string, any>, queryOptions?: Partial<UseQueryOptions<T[], Error>>) => {
    return useQuery({
      queryKey: [entityKey, 'filter', filters],
      queryFn: () => service.filter(filters),
      enabled: Object.keys(filters).length > 0,
      ...defaultOptions,
      ...queryOptions,
    });
  };

  const usePagination = (
    page: number,
    limit: number,
    filters?: Record<string, any>,
    queryOptions?: Partial<UseQueryOptions<{
      data: T[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }, Error>>
  ) => {
    return useQuery({
      queryKey: [entityKey, 'paginate', { page, limit, filters }],
      queryFn: () => service.paginate(page, limit, filters),
      ...defaultOptions,
      ...queryOptions,
    });
  };

  const useCount = (filters?: Record<string, any>, queryOptions?: Partial<UseQueryOptions<number, Error>>) => {
    return useQuery({
      queryKey: [entityKey, 'count', filters],
      queryFn: () => service.count(filters),
      ...defaultOptions,
      ...queryOptions,
    });
  };

  // Mutation Functions
  const useCreate = (mutationOptions?: Partial<UseMutationOptions<T, Error, CreateT>>) => {
    return useMutation({
      mutationFn: (data: CreateT) => service.create(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [entityKey] });
        toast({
          title: "Sucesso",
          description: successMessages.create,
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Erro",
          description: error.message || errorMessages.create,
          variant: "destructive",
        });
      },
      ...mutationOptions,
    });
  };

  const useUpdate = (mutationOptions?: Partial<UseMutationOptions<T, Error, { id: number | string; data: UpdateT }>>) => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number | string; data: UpdateT }) => service.update(id, data),
      onSuccess: (data, { id }) => {
        queryClient.invalidateQueries({ queryKey: [entityKey] });
        queryClient.invalidateQueries({ queryKey: [entityKey, id] });
        toast({
          title: "Sucesso",
          description: successMessages.update,
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Erro",
          description: error.message || errorMessages.update,
          variant: "destructive",
        });
      },
      ...mutationOptions,
    });
  };

  const useDelete = (mutationOptions?: Partial<UseMutationOptions<void, Error, number | string>>) => {
    return useMutation({
      mutationFn: (id: number | string) => service.remove(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [entityKey] });
        toast({
          title: "Sucesso",
          description: successMessages.delete,
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Erro",
          description: error.message || errorMessages.delete,
          variant: "destructive",
        });
      },
      ...mutationOptions,
    });
  };

  const useBulkCreate = (mutationOptions?: Partial<UseMutationOptions<T[], Error, CreateT[]>>) => {
    return useMutation({
      mutationFn: (data: CreateT[]) => service.bulkCreate(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [entityKey] });
        toast({
          title: "Sucesso",
          description: `${data.length} ${entityKey}(s) criado(s) com sucesso`,
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Erro",
          description: error.message || `Erro ao criar ${entityKey}(s) em lote`,
          variant: "destructive",
        });
      },
      ...mutationOptions,
    });
  };

  const useBulkDelete = (mutationOptions?: Partial<UseMutationOptions<void, Error, Array<number | string>>>) => {
    return useMutation({
      mutationFn: (ids: Array<number | string>) => service.bulkDelete(ids),
      onSuccess: (data, ids) => {
        queryClient.invalidateQueries({ queryKey: [entityKey] });
        toast({
          title: "Sucesso",
          description: `${ids.length} ${entityKey}(s) excluído(s) com sucesso`,
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Erro",
          description: error.message || `Erro ao excluir ${entityKey}(s) em lote`,
          variant: "destructive",
        });
      },
      ...mutationOptions,
    });
  };

  // Utility Functions
  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: [entityKey] });
  };

  const prefetchAll = () => {
    queryClient.prefetchQuery({
      queryKey: [entityKey],
      queryFn: () => service.getAll(),
      ...defaultOptions,
    });
  };

  const prefetchById = (id: number | string) => {
    queryClient.prefetchQuery({
      queryKey: [entityKey, id],
      queryFn: () => service.getById(id),
      ...defaultOptions,
    });
  };

  return {
    // Query hooks
    useGetAll,
    useGetById,
    useSearch,
    useFilter,
    usePagination,
    useCount,
    
    // Mutation hooks
    useCreate,
    useUpdate,
    useDelete,
    useBulkCreate,
    useBulkDelete,
    
    // Utility functions
    invalidateQueries,
    prefetchAll,
    prefetchById,
  };
}

export default useCrudQuery;