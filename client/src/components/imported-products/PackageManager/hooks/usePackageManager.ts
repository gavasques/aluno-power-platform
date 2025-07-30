import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { ProductPackage, PackageFormData, PackageManagerState } from '../types';

const defaultFormData: PackageFormData = {
  name: '',
  description: '',
  supplier: '',
  totalValue: 0,
  totalWeight: 0,
  shippingCost: 0,
  customsCost: 0,
  otherCosts: 0,
  status: 'pending',
  trackingCode: '',
  orderDate: new Date().toISOString().split('T')[0],
  expectedDelivery: '',
  notes: ''
};

export const usePackageManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [state, setState] = useState<Omit<PackageManagerState, 'packages' | 'loading' | 'error'>>({
    editingId: null,
    deletingId: null,
    showForm: false,
    showProducts: false,
    selectedPackageId: null,
    formData: defaultFormData,
    searchTerm: '',
    statusFilter: '',
    supplierFilter: ''
  });

  // Fetch packages
  const { data: packages = [], isLoading: loading, error } = useQuery<ProductPackage[]>({
    queryKey: ['/api/packages'],
    queryFn: async () => {
      const response = await apiRequest('/api/packages');
      return response.data;
    },
  });

  // Filter packages based on search and filters
  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => {
      const matchesSearch = !state.searchTerm || 
        pkg.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        pkg.supplier.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        (pkg.trackingCode && pkg.trackingCode.toLowerCase().includes(state.searchTerm.toLowerCase()));

      const matchesStatus = !state.statusFilter || pkg.status === state.statusFilter;
      const matchesSupplier = !state.supplierFilter || 
        pkg.supplier.toLowerCase().includes(state.supplierFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesSupplier;
    });
  }, [packages, state.searchTerm, state.statusFilter, state.supplierFilter]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: PackageFormData) => {
      const finalCost = data.totalValue + data.shippingCost + data.customsCost + data.otherCosts;
      return apiRequest('/api/packages', {
        method: 'POST',
        body: JSON.stringify({ ...data, finalCost }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/packages'] });
      setState(prev => ({ ...prev, showForm: false, formData: defaultFormData }));
      toast({
        title: "Sucesso",
        description: "Pacote criado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar pacote.",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: PackageFormData) => {
      const finalCost = data.totalValue + data.shippingCost + data.customsCost + data.otherCosts;
      return apiRequest(`/api/packages/${state.editingId}`, {
        method: 'PUT',
        body: JSON.stringify({ ...data, finalCost }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/packages'] });
      setState(prev => ({ ...prev, showForm: false, formData: defaultFormData, editingId: null }));
      toast({
        title: "Sucesso",
        description: "Pacote atualizado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar pacote.",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/packages/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/packages'] });
      setState(prev => ({ ...prev, deletingId: null }));
      toast({
        title: "Sucesso",
        description: "Pacote excluído com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir pacote.",
        variant: "destructive",
      });
      setState(prev => ({ ...prev, deletingId: null }));
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

  const handleEdit = useCallback((pkg: ProductPackage) => {
    setState(prev => ({
      ...prev,
      showForm: true,
      editingId: pkg.id,
      formData: {
        name: pkg.name,
        description: pkg.description || '',
        supplier: pkg.supplier,
        totalValue: pkg.totalValue,
        totalWeight: pkg.totalWeight,
        shippingCost: pkg.shippingCost,
        customsCost: pkg.customsCost,
        otherCosts: pkg.otherCosts,
        status: pkg.status,
        trackingCode: pkg.trackingCode || '',
        orderDate: pkg.orderDate.split('T')[0],
        expectedDelivery: pkg.expectedDelivery ? pkg.expectedDelivery.split('T')[0] : '',
        notes: pkg.notes || ''
      }
    }));
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, deletingId: id }));
    await deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  const handleViewProducts = useCallback((id: number) => {
    setState(prev => ({ 
      ...prev, 
      showProducts: true, 
      selectedPackageId: id 
    }));
  }, []);

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
      showProducts: false,
      editingId: null,
      selectedPackageId: null,
      formData: defaultFormData
    }));
  }, []);

  const updateFormField = useCallback((field: keyof PackageFormData, value: any) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value }
    }));
  }, []);

  const updateSearch = useCallback((term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
  }, []);

  const updateStatusFilter = useCallback((status: string) => {
    setState(prev => ({ ...prev, statusFilter: status }));
  }, []);

  const updateSupplierFilter = useCallback((supplier: string) => {
    setState(prev => ({ ...prev, supplierFilter: supplier }));
  }, []);

  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/packages'] });
  }, [queryClient]);

  return {
    packages: filteredPackages,
    loading,
    error,
    state,
    isUpdating: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    actions: {
      handleAdd,
      handleEdit,
      handleDelete,
      handleViewProducts,
      handleSave,
      handleCancel,
      updateFormField,
      updateSearch,
      updateStatusFilter,
      updateSupplierFilter,
      refreshData
    }
  };
};