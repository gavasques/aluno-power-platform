/**
 * Hooks personalizados para ContasBancariasManager
 * Separando lógica de negócio da UI
 */

import { useReducer, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/UserContext';

import { contasBancariasReducer, initialContasBancariasState } from './reducer';
import type { ContaBancaria, ContaBancariaFormData, Empresa, Banco } from './types';

export const useContasBancariasManager = () => {
  const [state, dispatch] = useReducer(contasBancariasReducer, initialContasBancariasState);
  const { toast } = useToast();
  const { token, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  // Fetch empresas
  const { data: empresas = [] } = useQuery<Empresa[]>({
    queryKey: ['financas360-empresas'],
    queryFn: async () => {
      const response = await fetch('/api/financas360/empresas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar empresas');
      }
      
      const result = await response.json();
      return result.data;
    },
    enabled: !!token && !authLoading
  });

  // Fetch bancos
  const { data: bancos = [] } = useQuery<Banco[]>({
    queryKey: ['financas360-bancos'],
    queryFn: async () => {
      const response = await fetch('/api/financas360/bancos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar bancos');
      }
      
      const result = await response.json();
      return result.data;
    },
    enabled: !!token && !authLoading
  });

  // Fetch contas bancárias
  const { data: contas = [], isLoading } = useQuery<ContaBancaria[]>({
    queryKey: ['financas360-contas-bancarias'],
    queryFn: async () => {
      const response = await fetch('/api/financas360/contas-bancarias', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar contas bancárias');
      }
      
      const result = await response.json();
      return result.data;
    },
    enabled: !!token && !authLoading
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: ContaBancariaFormData) => {
      const response = await fetch('/api/financas360/contas-bancarias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar conta bancária');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-contas-bancarias'] });
      dispatch({ type: 'RESET_FORM' });
      toast({
        title: 'Sucesso',
        description: 'Conta bancária criada com sucesso!'
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

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ContaBancariaFormData> }) => {
      const response = await fetch(`/api/financas360/contas-bancarias/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar conta bancária');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-contas-bancarias'] });
      dispatch({ type: 'RESET_FORM' });
      toast({
        title: 'Sucesso',
        description: 'Conta bancária atualizada com sucesso!'
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

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/financas360/contas-bancarias/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir conta bancária');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-contas-bancarias'] });
      toast({
        title: 'Sucesso',
        description: 'Conta bancária excluída com sucesso!'
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

  // Helper functions
  const openCreateDialog = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
    dispatch({ type: 'SET_DIALOG_OPEN', payload: true });
  }, []);

  const openEditDialog = useCallback((conta: ContaBancaria) => {
    dispatch({ type: 'LOAD_CONTA_FOR_EDIT', payload: conta });
  }, []);

  const closeDialog = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
  }, []);

  const updateFormField = useCallback((field: keyof ContaBancariaFormData, value: any) => {
    dispatch({ type: 'UPDATE_FORM_FIELD', field, value });
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: term });
  }, []);

  const handleSubmit = useCallback(() => {
    if (state.ui.isEditMode && state.selected.contaId) {
      updateMutation.mutate({ id: state.selected.contaId, data: state.form });
    } else {
      createMutation.mutate(state.form);
    }
  }, [state.ui.isEditMode, state.selected.contaId, state.form, updateMutation, createMutation]);

  const handleDelete = useCallback((id: number) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  // Memoized filter contas by search term
  const filteredContas = useMemo(() => {
    if (!state.ui.searchTerm) return contas;
    
    const searchLower = state.ui.searchTerm.toLowerCase();
    return contas.filter((conta: ContaBancaria) =>
      conta.empresa.razaoSocial.toLowerCase().includes(searchLower) ||
      conta.banco.nome.toLowerCase().includes(searchLower) ||
      conta.agencia.includes(state.ui.searchTerm) ||
      conta.conta.includes(state.ui.searchTerm)
    );
  }, [contas, state.ui.searchTerm]);

  // Memoized return object to prevent unnecessary re-renders
  return useMemo(() => ({
    state,
    data: {
      contas: filteredContas,
      empresas,
      bancos,
      isLoading,
    },
    mutations: {
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,
    },
    actions: {
      openCreateDialog,
      openEditDialog,
      closeDialog,
      updateFormField,
      setSearchTerm,
      handleSubmit,
      handleDelete,
    }
  }), [
    state, filteredContas, empresas, bancos, isLoading,
    createMutation.isPending, updateMutation.isPending, deleteMutation.isPending,
    openCreateDialog, openEditDialog, closeDialog, updateFormField, setSearchTerm, handleSubmit, handleDelete
  ]);
};