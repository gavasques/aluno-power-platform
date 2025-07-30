import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { ContaBancaria, ContaBancariaForm, ContasBancariasState } from '../types';

const defaultFormData: ContaBancariaForm = {
  empresaId: 0,
  bankName: '',
  accountType: '',
  agency: '',
  account: '',
  accountDigit: '',
  pixKey: '',
  pixKeyType: '',
  initialBalance: 0,
  isActive: true,
  observations: ''
};

export const useContasBancarias = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [state, setState] = useState<Omit<ContasBancariasState, 'contas' | 'loading' | 'error'>>({
    editingId: null,
    deletingId: null,
    showForm: false,
    formData: defaultFormData,
    searchTerm: '',
    filterActive: 'all',
    filterBank: ''
  });

  // Fetch contas bancárias
  const { data: contas = [], isLoading: loading, error } = useQuery<ContaBancaria[]>({
    queryKey: ['/api/contas-bancarias'],
    queryFn: async () => {
      const response = await apiRequest('/api/contas-bancarias');
      return response.data;
    },
  });

  // Fetch empresas for dropdown
  const { data: empresas = [] } = useQuery({
    queryKey: ['/api/empresas'],
    staleTime: 60000,
  });

  // Filter contas based on search and filters
  const filteredContas = useMemo(() => {
    return contas.filter(conta => {
      const matchesSearch = !state.searchTerm || 
        conta.bankName.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        conta.account.includes(state.searchTerm) ||
        conta.agency.includes(state.searchTerm);

      const matchesActiveFilter = state.filterActive === 'all' ||
        (state.filterActive === 'active' && conta.isActive) ||
        (state.filterActive === 'inactive' && !conta.isActive);

      const matchesBankFilter = !state.filterBank || 
        conta.bankName.toLowerCase().includes(state.filterBank.toLowerCase());

      return matchesSearch && matchesActiveFilter && matchesBankFilter;
    });
  }, [contas, state.searchTerm, state.filterActive, state.filterBank]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: ContaBancariaForm) => {
      return apiRequest('/api/contas-bancarias', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contas-bancarias'] });
      setState(prev => ({ ...prev, showForm: false, formData: defaultFormData }));
      toast({
        title: "Sucesso",
        description: "Conta bancária criada com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar conta bancária.",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: ContaBancariaForm) => {
      return apiRequest(`/api/contas-bancarias/${state.editingId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contas-bancarias'] });
      setState(prev => ({ ...prev, showForm: false, formData: defaultFormData, editingId: null }));
      toast({
        title: "Sucesso",
        description: "Conta bancária atualizada com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar conta bancária.",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/contas-bancarias/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contas-bancarias'] });
      setState(prev => ({ ...prev, deletingId: null }));
      toast({
        title: "Sucesso",
        description: "Conta bancária excluída com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir conta bancária.",
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

  const handleEdit = useCallback((conta: ContaBancaria) => {
    setState(prev => ({
      ...prev,
      showForm: true,
      editingId: conta.id,
      formData: {
        empresaId: conta.empresaId,
        bankName: conta.bankName,
        accountType: conta.accountType,
        agency: conta.agency,
        account: conta.account,
        accountDigit: conta.accountDigit || '',
        pixKey: conta.pixKey || '',
        pixKeyType: conta.pixKeyType || '',
        initialBalance: conta.initialBalance,
        isActive: conta.isActive,
        observations: conta.observations || ''
      }
    }));
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, deletingId: id }));
    await deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

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

  const updateFormField = useCallback((field: keyof ContaBancariaForm, value: any) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value }
    }));
  }, []);

  const updateSearch = useCallback((term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
  }, []);

  const updateFilter = useCallback((filter: 'all' | 'active' | 'inactive') => {
    setState(prev => ({ ...prev, filterActive: filter }));
  }, []);

  const updateBankFilter = useCallback((bank: string) => {
    setState(prev => ({ ...prev, filterBank: bank }));
  }, []);

  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/contas-bancarias'] });
  }, [queryClient]);

  return {
    contas: filteredContas,
    empresas,
    loading,
    error,
    state,
    isUpdating: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    actions: {
      handleAdd,
      handleEdit,
      handleDelete,
      handleSave,
      handleCancel,
      updateFormField,
      updateSearch,
      updateFilter,
      updateBankFilter,
      refreshData
    }
  };
};