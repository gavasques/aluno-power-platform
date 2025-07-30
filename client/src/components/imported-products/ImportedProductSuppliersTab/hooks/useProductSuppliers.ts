import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { ProductSupplier, SupplierFormData, ImportedProductSuppliersState } from '../types';

const defaultFormData: SupplierFormData = {
  supplierId: 0,
  isMainSupplier: false,
  costPrice: 0,
  minimumOrder: 1,
  leadTime: 7,
  notes: ''
};

export const useProductSuppliers = (productId: number) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [state, setState] = useState<Omit<ImportedProductSuppliersState, 'suppliers' | 'availableSuppliers' | 'loading' | 'error'>>({
    editingId: null,
    deletingId: null,
    showForm: false,
    formData: defaultFormData,
    searchTerm: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Fetch product suppliers
  const { data: suppliers = [], isLoading: loading, error } = useQuery<ProductSupplier[]>({
    queryKey: ['/api/products', productId, 'suppliers'],
    queryFn: async () => {
      const response = await apiRequest(`/api/products/${productId}/suppliers`);
      return response.data;
    },
    enabled: !!productId
  });

  // Fetch available suppliers for dropdown
  const { data: availableSuppliers = [] } = useQuery({
    queryKey: ['/api/suppliers'],
    queryFn: async () => {
      const response = await apiRequest('/api/suppliers');
      return response.data;
    },
    staleTime: 60000
  });

  // Filter and sort suppliers
  const filteredSuppliers = useMemo(() => {
    let filtered = suppliers.filter(supplier => {
      if (!state.searchTerm) return true;
      const searchLower = state.searchTerm.toLowerCase();
      return (
        supplier.supplier?.name?.toLowerCase().includes(searchLower) ||
        supplier.supplier?.company?.toLowerCase().includes(searchLower) ||
        supplier.supplier?.country?.toLowerCase().includes(searchLower)
      );
    });

    // Sort suppliers
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (state.sortBy) {
        case 'name':
          aValue = a.supplier?.name || '';
          bValue = b.supplier?.name || '';
          break;
        case 'cost':
          aValue = a.costPrice;
          bValue = b.costPrice;
          break;
        case 'leadTime':
          aValue = a.leadTime;
          bValue = b.leadTime;
          break;
        case 'rating':
          aValue = a.supplier?.rating || 0;
          bValue = b.supplier?.rating || 0;
          break;
        default:
          return 0;
      }

      if (state.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [suppliers, state.searchTerm, state.sortBy, state.sortOrder]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: SupplierFormData) => {
      return apiRequest(`/api/products/${productId}/suppliers`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products', productId, 'suppliers'] });
      setState(prev => ({ ...prev, showForm: false, formData: defaultFormData }));
      toast({
        title: "Sucesso",
        description: "Fornecedor adicionado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar fornecedor.",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: SupplierFormData) => {
      return apiRequest(`/api/products/${productId}/suppliers/${state.editingId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products', productId, 'suppliers'] });
      setState(prev => ({ ...prev, showForm: false, formData: defaultFormData, editingId: null }));
      toast({
        title: "Sucesso",
        description: "Fornecedor atualizado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar fornecedor.",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/products/${productId}/suppliers/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products', productId, 'suppliers'] });
      setState(prev => ({ ...prev, deletingId: null }));
      toast({
        title: "Sucesso",
        description: "Fornecedor removido com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover fornecedor.",
        variant: "destructive",
      });
      setState(prev => ({ ...prev, deletingId: null }));
    },
  });

  // Set main supplier mutation
  const setMainSupplierMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/products/${productId}/suppliers/${id}/set-main`, {
        method: 'PUT',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products', productId, 'suppliers'] });
      toast({
        title: "Sucesso",
        description: "Fornecedor principal definido!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao definir fornecedor principal.",
        variant: "destructive",
      });
    },
  });

  const handleAdd = useCallback(() => {
    setState(prev => ({
      ...prev,
      showForm: true,
      editingId: null,
      formData: defaultFormData
    }));
  }, []);

  const handleEdit = useCallback((supplier: ProductSupplier) => {
    setState(prev => ({
      ...prev,
      showForm: true,
      editingId: supplier.id,
      formData: {
        supplierId: supplier.supplierId,
        isMainSupplier: supplier.isMainSupplier,
        costPrice: supplier.costPrice,
        minimumOrder: supplier.minimumOrder,
        leadTime: supplier.leadTime,
        notes: supplier.notes || ''
      }
    }));
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, deletingId: id }));
    await deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  const handleSetMainSupplier = useCallback(async (id: number) => {
    await setMainSupplierMutation.mutateAsync(id);
  }, [setMainSupplierMutation]);

  const handleSave = useCallback(async () => {
    if (state.editingId) {
      await updateMutation.mutateAsync(state.formData);
    } else {
      await createMutation.mutateAsync(state.formData);
    }
  }, [state.editingId, state.formData, updateMutation, createMutation]);

  const handleCancel = useCallback(() => {
    setState(prev => ({
      ...prev,
      showForm: false,
      editingId: null,
      formData: defaultFormData
    }));
  }, []);

  const updateFormField = useCallback((field: keyof SupplierFormData, value: any) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value }
    }));
  }, []);

  const updateSearch = useCallback((term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
  }, []);

  const updateSort = useCallback((field: 'name' | 'cost' | 'leadTime' | 'rating') => {
    setState(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/products', productId, 'suppliers'] });
  }, [queryClient, productId]);

  return {
    suppliers: filteredSuppliers,
    availableSuppliers,
    loading,
    error,
    state,
    isUpdating: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isSettingMain: setMainSupplierMutation.isPending,
    actions: {
      handleAdd,
      handleEdit,
      handleDelete,
      handleSetMainSupplier,
      handleSave,
      handleCancel,
      updateFormField,
      updateSearch,
      updateSort,
      refreshData
    }
  };
};