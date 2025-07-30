import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { ContaBancaria, PixChave, ContasBancariasState } from '../types';

const defaultFormData: Partial<ContaBancaria> = {
  banco: '',
  agencia: '',
  conta: '',
  digito: '',
  tipo: 'corrente',
  titular: '',
  documento: '',
  saldoAtual: 0,
  saldoInicial: 0,
  pixChaves: [],
  ativo: true,
  descricao: '',
  observacoes: ''
};

export const useContasBancarias = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [state, setState] = useState<Omit<ContasBancariasState, 'contas' | 'filteredContas' | 'loading' | 'error'>>({
    searchTerm: '',
    filterTipo: '',
    filterBanco: '',
    showInactive: false,
    selectedConta: null,
    isEditing: false,
    isCreating: false,
    formData: defaultFormData
  });

  // Fetch contas
  const { data: contas = [], isLoading, error } = useQuery<ContaBancaria[]>({
    queryKey: ['/api/financas360/contas-bancarias'],
    queryFn: async () => {
      const response = await apiRequest('/api/financas360/contas-bancarias');
      return response.data;
    }
  });

  // Filter contas based on search and filters
  const filteredContas = useMemo(() => {
    return contas.filter(conta => {
      const matchesSearch = !state.searchTerm || 
        conta.banco.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        conta.titular.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        conta.conta.includes(state.searchTerm);

      const matchesTipo = !state.filterTipo || conta.tipo === state.filterTipo;
      const matchesBanco = !state.filterBanco || conta.banco === state.filterBanco;
      const matchesActive = state.showInactive || conta.ativo;

      return matchesSearch && matchesTipo && matchesBanco && matchesActive;
    });
  }, [contas, state.searchTerm, state.filterTipo, state.filterBanco, state.showInactive]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<ContaBancaria>) => {
      if (state.isEditing && state.selectedConta) {
        return apiRequest(`/api/financas360/contas-bancarias/${state.selectedConta.id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      } else {
        return apiRequest('/api/financas360/contas-bancarias', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/financas360/contas-bancarias'] });
      setState(prev => ({
        ...prev,
        isEditing: false,
        isCreating: false,
        selectedConta: null,
        formData: defaultFormData
      }));
      toast({
        title: "Sucesso",
        description: state.isEditing ? "Conta atualizada com sucesso!" : "Conta criada com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar conta bancária.",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/financas360/contas-bancarias/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/financas360/contas-bancarias'] });
      setState(prev => ({
        ...prev,
        selectedConta: null,
        isEditing: false
      }));
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
    },
  });

  const refreshContas = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/financas360/contas-bancarias'] });
  }, [queryClient]);

  const searchContas = useCallback((term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
  }, []);

  const filterByTipo = useCallback((tipo: string) => {
    setState(prev => ({ ...prev, filterTipo: tipo }));
  }, []);

  const filterByBanco = useCallback((banco: string) => {
    setState(prev => ({ ...prev, filterBanco: banco }));
  }, []);

  const toggleShowInactive = useCallback(() => {
    setState(prev => ({ ...prev, showInactive: !prev.showInactive }));
  }, []);

  const selectConta = useCallback((conta: ContaBancaria | null) => {
    setState(prev => ({ ...prev, selectedConta: conta }));
  }, []);

  const startEditing = useCallback((conta: ContaBancaria) => {
    setState(prev => ({
      ...prev,
      selectedConta: conta,
      isEditing: true,
      isCreating: false,
      formData: { ...conta }
    }));
  }, []);

  const startCreating = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedConta: null,
      isEditing: false,
      isCreating: true,
      formData: defaultFormData
    }));
  }, []);

  const updateFormField = useCallback((field: keyof ContaBancaria, value: any) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value }
    }));
  }, []);

  const addPixChave = useCallback((chave: Omit<PixChave, 'id'>) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        pixChaves: [
          ...(prev.formData.pixChaves || []),
          { ...chave, id: Date.now() }
        ]
      }
    }));
  }, []);

  const removePixChave = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        pixChaves: (prev.formData.pixChaves || []).filter((_, i) => i !== index)
      }
    }));
  }, []);

  const saveConta = useCallback(async () => {
    await saveMutation.mutateAsync(state.formData);
  }, [state.formData, saveMutation]);

  const deleteConta = useCallback(async (id: number) => {
    await deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  const cancelEditing = useCallback(() => {
    setState(prev => ({
      ...prev,
      isEditing: false,
      isCreating: false,
      selectedConta: null,
      formData: defaultFormData
    }));
  }, []);

  return {
    state: {
      ...state,
      contas,
      filteredContas,
      loading: isLoading,
      error: error?.message || null
    },
    actions: {
      refreshContas,
      searchContas,
      filterByTipo,
      filterByBanco,
      toggleShowInactive,
      selectConta,
      startEditing,
      startCreating,
      updateFormField,
      addPixChave,
      removePixChave,
      saveConta,
      deleteConta,
      cancelEditing
    },
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};