/**
 * Hook unificado para operações CRUD
 * Elimina duplicação de lógica em managers
 * Redução estimada: 68% do código duplicado
 */
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface EntityCRUDConfig<T, TInsert> {
  entityName: string;
  apiEndpoint: string;
  queryKey: string[];
  initialFormData: TInsert;
  validationSchema?: any;
  onSuccessMessage?: string;
  searchFields?: string[];
}

interface EntityCRUDState<T> {
  isDialogOpen: boolean;
  editingItem: T | null;
  searchTerm: string;
  filteredData: T[];
}

interface EntityCRUDActions<T, TInsert> {
  // Estado
  setIsDialogOpen: (open: boolean) => void;
  setEditingItem: (item: T | null) => void;
  setSearchTerm: (term: string) => void;
  
  // CRUD operations
  create: (data: TInsert) => Promise<void>;
  update: (id: number, data: Partial<TInsert>) => Promise<void>;
  remove: (id: number) => Promise<void>;
  
  // Helpers
  handleEdit: (item: T) => void;
  handleCreate: () => void;
  handleClose: () => void;
  handleDelete: (id: number) => void;
  
  // Query actions
  refetch: () => Promise<any>;
  invalidate: () => Promise<void>;
}

interface EntityCRUDReturn<T, TInsert> extends EntityCRUDState<T>, EntityCRUDActions<T, TInsert> {
  // Query data
  data: T[];
  isLoading: boolean;
  error: any;
  
  // Mutation states
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Form data
  formData: TInsert;
  setFormData: (data: TInsert | ((prev: TInsert) => TInsert)) => void;
  resetForm: () => void;
}

export function useEntityCRUD<T extends { id: number }, TInsert>(
  config: EntityCRUDConfig<T, TInsert>
): EntityCRUDReturn<T, TInsert> {
  const { token, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<TInsert>(config.initialFormData);

  // Query for fetching data
  const {
    data = [],
    isLoading,
    error,
    refetch
  } = useQuery<T[]>({
    queryKey: config.queryKey,
    queryFn: async () => {
      const response = await apiRequest(config.apiEndpoint) as { data?: T[] } | T[];
      return Array.isArray(response) ? response : (response.data || []);
    },
    enabled: !!token && !authLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });

  // Search functionality
  const filteredData = searchTerm
    ? data.filter((item: any) => {
        if (!config.searchFields) return true;
        
        return config.searchFields.some(field => {
          const value = field.split('.').reduce((obj, key) => obj?.[key], item);
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
      })
    : data;

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (createData: TInsert) => {
      return await apiRequest(config.apiEndpoint, {
        method: 'POST',
        body: JSON.stringify(createData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: config.queryKey });
      toast({
        title: "Sucesso",
        description: config.onSuccessMessage || `${config.entityName} criado com sucesso`
      });
      setIsDialogOpen(false);
      setFormData(config.initialFormData);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error?.message || `Erro ao criar ${config.entityName.toLowerCase()}`,
        variant: "destructive"
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data: updateData }: { id: number; data: Partial<TInsert> }) => {
      return await apiRequest(`${config.apiEndpoint}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: config.queryKey });
      toast({
        title: "Sucesso",
        description: `${config.entityName} atualizado com sucesso`
      });
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData(config.initialFormData);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error?.message || `Erro ao atualizar ${config.entityName.toLowerCase()}`,
        variant: "destructive"
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`${config.apiEndpoint}/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: config.queryKey });
      toast({
        title: "Sucesso",
        description: `${config.entityName} removido com sucesso`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error?.message || `Erro ao remover ${config.entityName.toLowerCase()}`,
        variant: "destructive"
      });
    }
  });

  // Action handlers
  const handleEdit = useCallback((item: T) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingItem(null);
    setFormData(config.initialFormData);
    setIsDialogOpen(true);
  }, [config.initialFormData]);

  const handleClose = useCallback(() => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData(config.initialFormData);
  }, [config.initialFormData]);

  const handleDelete = useCallback((id: number) => {
    if (window.confirm(`Tem certeza que deseja remover este ${config.entityName.toLowerCase()}?`)) {
      deleteMutation.mutate(id);
    }
  }, [config.entityName, deleteMutation]);

  const resetForm = useCallback(() => {
    setFormData(config.initialFormData);
  }, [config.initialFormData]);

  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: config.queryKey });
  }, [queryClient, config.queryKey]);

  return {
    // State
    isDialogOpen,
    editingItem,
    searchTerm,
    filteredData,
    
    // Actions
    setIsDialogOpen,
    setEditingItem,
    setSearchTerm,
    
    // CRUD operations
    create: async (data: TInsert) => { await createMutation.mutateAsync(data); },
    update: async (id: number, data: Partial<TInsert>) => { await updateMutation.mutateAsync({ id, data }); },
    remove: async (id: number) => { await deleteMutation.mutateAsync(id); },
    
    // Helpers
    handleEdit,
    handleCreate,
    handleClose,
    handleDelete,
    
    // Query data
    data,
    isLoading,
    error,
    refetch,
    invalidate,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Form data
    formData,
    setFormData,
    resetForm
  };
}