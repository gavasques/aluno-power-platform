/**
 * Hook para recursos paginados automaticamente
 * Estende o useFinancasResource com funcionalidades de paginação
 */

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/UserContext';
import { useManagerState } from './useManagerState';
import { 
  BaseFinancasEntity, 
  BaseFormData
} from '@/types/financas360';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

interface UsePaginatedResourceProps<TEntity extends BaseFinancasEntity, TFormData extends BaseFormData> {
  resource: string;
  initialFormData: TFormData;
  mapEntityToForm?: (entity: TEntity) => TFormData;
  pageSize?: number;
  customMessages?: {
    create?: string;
    update?: string;
    delete?: string;
    deleteConfirm?: string;
    loading?: string;
  };
}

export function usePaginatedResource<TEntity extends BaseFinancasEntity, TFormData extends BaseFormData>({
  resource,
  initialFormData,
  mapEntityToForm,
  pageSize = 20,
  customMessages = {}
}: UsePaginatedResourceProps<TEntity, TFormData>) {
  const { token, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estado da paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(pageSize);

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

  // Query para buscar dados paginados
  const { data: paginatedData, isLoading, error, refetch } = useQuery({
    queryKey: [`financas360-${resource}`, currentPage, limit, state.filters],
    queryFn: async (): Promise<PaginatedResponse<TEntity>> => {
      console.log(`Fetching paginated ${resource}...`);
      
      // Construir query params
      const searchParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString()
      });

      // Adicionar filtros à query
      if (state.filters.searchTerm) {
        searchParams.append('search', state.filters.searchTerm);
      }
      if (state.filters.statusFilter && state.filters.statusFilter !== 'all') {
        searchParams.append('status', state.filters.statusFilter);
      }
      if (state.filters.typeFilter && state.filters.typeFilter !== 'all') {
        searchParams.append('type', state.filters.typeFilter);
      }

      const response = await fetch(`/api/financas360/${resource}?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log(`${resource} paginated response status:`, response.status);
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar ${resource}`);
      }
      
      const result = await response.json();
      console.log(`${resource} paginated result:`, result);
      return result;
    },
    enabled: !!token && !authLoading,
    keepPreviousData: true // Manter dados anteriores durante transições
  });

  // Dados e metadados derivados
  const items = paginatedData?.data || [];
  const meta = paginatedData?.meta || {
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  };

  // Items filtrados (filtro client-side adicional se necessário)
  const filteredItems = useMemo(() => {
    return state.filterItems(items);
  }, [items, state]);

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
      // Invalidar todas as páginas
      queryClient.invalidateQueries({ 
        queryKey: [`financas360-${resource}`],
        exact: false 
      });
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
      queryClient.invalidateQueries({ 
        queryKey: [`financas360-${resource}`],
        exact: false 
      });
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
      queryClient.invalidateQueries({ 
        queryKey: [`financas360-${resource}`],
        exact: false 
      });
      
      // Se a página atual ficou vazia, voltar uma página
      if (items.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
      
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

  // Handlers de paginação
  const goToPage = (page: number) => {
    if (page >= 1 && page <= meta.totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (meta.hasNext) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (meta.hasPrev) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const changePageSize = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1); // Reset to first page
  };

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

  // Reset página ao alterar filtros
  const updateFilter = (filter: string, value: any) => {
    state.updateFilter(filter, value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Estados derivados
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  console.log(`${resource}PaginatedManager render - authLoading:`, authLoading, 'isLoading:', isLoading, 'error:', error, 'items:', items, 'meta:', meta);

  return {
    // Dados
    items,
    filteredItems,
    
    // Paginação
    meta,
    currentPage,
    limit,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    
    // Estados de loading/error
    isLoading: authLoading || isLoading,
    error,
    isSubmitting,
    isDeleting,

    // Estados do manager
    ...state,
    updateFilter, // Override para reset page

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