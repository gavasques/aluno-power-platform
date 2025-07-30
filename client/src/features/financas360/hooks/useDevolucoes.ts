/**
 * HOOK: useDevolucoes
 * Gerencia estado e operações de devoluções
 * Extraído de DevolucaesManager.tsx para modularização
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  DevolucaesManagerState,
  UseDevolucaosReturn,
  Devolucao,
  NotaFiscal,
  DevolucaoFormData,
  DevolucaoFilters,
  DevolucaoSort,
  DevolucaoSortField,
  DevolucaoTipo,
  DevolucaoStatus,
  DevolucaoAnexo,
  DevolucaoAnalytics,
  validateDevolucaoForm,
  DEVOLUCAO_STATUS,
  DEVOLUCAO_TIPOS,
  DEVOLUCAO_STATUS_COLORS
} from '../types/devolucoes';

export const useDevolucoes = (
  userId?: number,
  defaultFilters?: Partial<DevolucaoFilters>
): UseDevolucaosReturn => {
  // ===== EXTERNAL HOOKS =====
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ===== STATE =====
  const [state, setState] = useState<DevolucaesManagerState>({
    // Data
    devolucoes: [],
    notasFiscais: [],
    selectedDevolucao: null,
    
    // Loading states
    isLoading: false,
    isSaving: false,
    isDeleting: false,
    isProcessing: false,
    isLoadingNotasFiscais: false,
    
    // UI state
    showForm: false,
    showItemsDialog: false,
    showAnexosDialog: false,
    showProcessingDialog: false,
    expandedRows: new Set(),
    selectedItems: [],
    
    // Form state
    formData: {
      notaFiscalId: 0,
      tipo: 'produto',
      motivo: '',
      dataDevolucao: '',
      valorDevolvido: 0,
      status: 'pendente',
      observacoes: '',
      itens: []
    },
    editingDevolucao: null,
    
    // Filters and search
    filters: {
      searchTerm: '',
      tipoFilter: 'all',
      statusFilter: 'all',
      dataInicio: undefined,
      dataFim: undefined,
      notaFiscalSerie: undefined,
      valorMinimo: undefined,
      valorMaximo: undefined,
      clienteId: undefined,
      ...defaultFilters
    },
    sort: {
      field: 'dataDevolucao',
      direction: 'desc'
    },
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    
    // Validation
    errors: {},
    validationErrors: [],
    isDirty: false
  });

  // ===== COMPUTED QUERY PARAMS =====
  const queryParams = useMemo(() => ({
    page: state.currentPage,
    limit: state.itemsPerPage,
    search: state.filters.searchTerm || undefined,
    tipo: state.filters.tipoFilter !== 'all' ? state.filters.tipoFilter : undefined,
    status: state.filters.statusFilter !== 'all' ? state.filters.statusFilter : undefined,
    dataInicio: state.filters.dataInicio,
    dataFim: state.filters.dataFim,
    valorMinimo: state.filters.valorMinimo,
    valorMaximo: state.filters.valorMaximo,
    sortField: state.sort.field,
    sortDirection: state.sort.direction,
    userId
  }), [state.currentPage, state.itemsPerPage, state.filters, state.sort, userId]);

  // ===== QUERIES =====
  const devolucaosQuery = useQuery({
    queryKey: ['/api/financas360/devolucoes', queryParams],
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: (data) => ({
      devolucoes: data?.data || [],
      totalItems: data?.total || 0
    }),
    onSuccess: (data) => {
      setState(prev => ({
        ...prev,
        devolucoes: data.devolucoes,
        totalItems: data.totalItems
      }));
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao carregar devoluções',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const notasFiscaisQuery = useQuery({
    queryKey: ['/api/financas360/notas-fiscais', { active: true }],
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => data || [],
    onSuccess: (data) => {
      setState(prev => ({ ...prev, notasFiscais: data }));
    }
  });

  const analyticsQuery = useQuery({
    queryKey: ['/api/financas360/devolucoes/analytics', { 
      startDate: state.filters.dataInicio,
      endDate: state.filters.dataFim,
      userId 
    }],
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!(state.filters.dataInicio && state.filters.dataFim)
  });

  // ===== MUTATIONS =====
  const createMutation = useMutation({
    mutationFn: async (data: DevolucaoFormData) => {
      setState(prev => ({ ...prev, isSaving: true }));
      return apiRequest('/api/financas360/devolucoes', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (newDevolucao) => {
      queryClient.invalidateQueries({ queryKey: ['/api/financas360/devolucoes'] });
      setState(prev => ({ 
        ...prev, 
        showForm: false, 
        formData: prev.formData, // Reset form
        editingDevolucao: null
      }));
      toast({
        title: 'Devolução criada',
        description: 'A devolução foi criada com sucesso.'
      });
      return newDevolucao;
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar devolução',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    },
    onSettled: () => {
      setState(prev => ({ ...prev, isSaving: false }));
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<DevolucaoFormData> }) => {
      setState(prev => ({ ...prev, isSaving: true }));
      return apiRequest(`/api/financas360/devolucoes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/financas360/devolucoes'] });
      setState(prev => ({ 
        ...prev, 
        showForm: false,
        editingDevolucao: null
      }));
      toast({
        title: 'Devolução atualizada',
        description: 'A devolução foi atualizada com sucesso.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar devolução',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    },
    onSettled: () => {
      setState(prev => ({ ...prev, isSaving: false }));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      setState(prev => ({ ...prev, isDeleting: true }));
      return apiRequest(`/api/financas360/devolucoes/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/financas360/devolucoes'] });
      setState(prev => ({ ...prev, selectedDevolucao: null }));
      toast({
        title: 'Devolução excluída',
        description: 'A devolução foi excluída com sucesso.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir devolução',
        description: error.message,
        variant: 'destructive'
      });
    },
    onSettled: () => {
      setState(prev => ({ ...prev, isDeleting: false }));
    }
  });

  const processMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { observacoesProcessamento?: string } }) => {
      setState(prev => ({ ...prev, isProcessing: true }));
      return apiRequest(`/api/financas360/devolucoes/${id}/process`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/financas360/devolucoes'] });
      setState(prev => ({ ...prev, showProcessingDialog: false }));
      toast({
        title: 'Devolução processada',
        description: 'A devolução foi processada com sucesso.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao processar devolução',
        description: error.message,
        variant: 'destructive'
      });
    },
    onSettled: () => {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  });

  // ===== SIDE EFFECTS =====
  useEffect(() => {
    setState(prev => ({ ...prev, isLoading: devolucaosQuery.isLoading }));
  }, [devolucaosQuery.isLoading]);

  useEffect(() => {
    setState(prev => ({ ...prev, isLoadingNotasFiscais: notasFiscaisQuery.isLoading }));
  }, [notasFiscaisQuery.isLoading]);

  // ===== COMPUTED VALUES =====
  const filteredDevolucoes = useMemo(() => {
    let filtered = state.devolucoes;

    // Apply filters here if needed for local filtering
    // (Usually done on backend, but can be used for additional client-side filtering)

    return filtered;
  }, [state.devolucoes, state.filters]);

  // ===== ACTIONS =====
  const actions = {
    // CRUD operations
    createDevolucao: useCallback(async (data: DevolucaoFormData) => {
      const errors = validateDevolucaoForm(data);
      if (Object.keys(errors).length > 0) {
        setState(prev => ({ ...prev, errors }));
        throw new Error('Dados inválidos');
      }
      
      setState(prev => ({ ...prev, errors: {} }));
      return await createMutation.mutateAsync(data);
    }, [createMutation]),

    updateDevolucao: useCallback(async (id: number, data: Partial<DevolucaoFormData>) => {
      return await updateMutation.mutateAsync({ id, data });
    }, [updateMutation]),

    deleteDevolucao: useCallback(async (id: number) => {
      await deleteMutation.mutateAsync(id);
    }, [deleteMutation]),

    bulkDelete: useCallback(async (ids: number[]) => {
      setState(prev => ({ ...prev, isDeleting: true }));
      try {
        await Promise.all(ids.map(id => 
          apiRequest(`/api/financas360/devolucoes/${id}`, { method: 'DELETE' })
        ));
        queryClient.invalidateQueries({ queryKey: ['/api/financas360/devolucoes'] });
        setState(prev => ({ 
          ...prev, 
          selectedItems: [],
          selectedDevolucao: null
        }));
        toast({
          title: 'Devoluções excluídas',
          description: `${ids.length} devoluções foram excluídas com sucesso.`
        });
      } catch (error: any) {
        toast({
          title: 'Erro ao excluir devoluções',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setState(prev => ({ ...prev, isDeleting: false }));
      }
    }, [queryClient, toast]),

    // Processing operations
    processDevolucao: useCallback(async (id: number, data: { observacoesProcessamento?: string }) => {
      await processMutation.mutateAsync({ id, data });
    }, [processMutation]),

    approveDevolucao: useCallback(async (id: number) => {
      await updateMutation.mutateAsync({ id, data: { status: 'aprovada' } });
    }, [updateMutation]),

    rejectDevolucao: useCallback(async (id: number, motivo: string) => {
      await updateMutation.mutateAsync({ 
        id, 
        data: { 
          status: 'rejeitada',
          observacoes: motivo
        } 
      });
    }, [updateMutation]),

    cancelDevolucao: useCallback(async (id: number, motivo: string) => {
      await updateMutation.mutateAsync({ 
        id, 
        data: { 
          status: 'cancelada',
          observacoes: motivo
        } 
      });
    }, [updateMutation]),

    // Selection and UI
    selectDevolucao: useCallback((devolucao: Devolucao | null) => {
      setState(prev => ({ ...prev, selectedDevolucao: devolucao }));
    }, []),

    toggleItemSelection: useCallback((id: number) => {
      setState(prev => ({
        ...prev,
        selectedItems: prev.selectedItems.includes(id)
          ? prev.selectedItems.filter(item => item !== id)
          : [...prev.selectedItems, id]
      }));
    }, []),

    selectAllItems: useCallback(() => {
      setState(prev => ({
        ...prev,
        selectedItems: prev.devolucoes.map(d => d.id)
      }));
    }, []),

    clearSelection: useCallback(() => {
      setState(prev => ({ ...prev, selectedItems: [] }));
    }, []),

    toggleRowExpansion: useCallback((id: number) => {
      setState(prev => {
        const newExpanded = new Set(prev.expandedRows);
        if (newExpanded.has(id)) {
          newExpanded.delete(id);
        } else {
          newExpanded.add(id);
        }
        return { ...prev, expandedRows: newExpanded };
      });
    }, []),

    // Search and filters
    search: useCallback((query: string) => {
      setState(prev => ({
        ...prev,
        filters: { ...prev.filters, searchTerm: query },
        currentPage: 1
      }));
    }, []),

    filterByTipo: useCallback((tipo: DevolucaoTipo | 'all') => {
      setState(prev => ({
        ...prev,
        filters: { ...prev.filters, tipoFilter: tipo },
        currentPage: 1
      }));
    }, []),

    filterByStatus: useCallback((status: DevolucaoStatus | 'all') => {
      setState(prev => ({
        ...prev,
        filters: { ...prev.filters, statusFilter: status },
        currentPage: 1
      }));
    }, []),

    filterByDateRange: useCallback((inicio: string, fim: string) => {
      setState(prev => ({
        ...prev,
        filters: { 
          ...prev.filters, 
          dataInicio: inicio,
          dataFim: fim
        },
        currentPage: 1
      }));
    }, []),

    filterByValorRange: useCallback((minimo: number, maximo: number) => {
      setState(prev => ({
        ...prev,
        filters: { 
          ...prev.filters, 
          valorMinimo: minimo,
          valorMaximo: maximo
        },
        currentPage: 1
      }));
    }, []),

    clearFilters: useCallback(() => {
      setState(prev => ({
        ...prev,
        filters: {
          searchTerm: '',
          tipoFilter: 'all',
          statusFilter: 'all',
          dataInicio: undefined,
          dataFim: undefined,
          notaFiscalSerie: undefined,
          valorMinimo: undefined,
          valorMaximo: undefined,
          clienteId: undefined
        },
        currentPage: 1
      }));
    }, []),

    // Sorting and pagination
    sortBy: useCallback((field: DevolucaoSortField, direction?: 'asc' | 'desc') => {
      const newDirection = direction || (
        state.sort.field === field && state.sort.direction === 'asc' ? 'desc' : 'asc'
      );
      setState(prev => ({
        ...prev,
        sort: { field, direction: newDirection }
      }));
    }, [state.sort]),

    setPage: useCallback((page: number) => {
      setState(prev => ({ ...prev, currentPage: page }));
    }, []),

    setItemsPerPage: useCallback((items: number) => {
      setState(prev => ({ 
        ...prev, 
        itemsPerPage: items,
        currentPage: 1
      }));
    }, []),

    // Forms and modals
    showCreateForm: useCallback(() => {
      setState(prev => ({
        ...prev,
        showForm: true,
        editingDevolucao: null,
        formData: {
          notaFiscalId: 0,
          tipo: 'produto',
          motivo: '',
          dataDevolucao: new Date().toISOString().split('T')[0],
          valorDevolvido: 0,
          status: 'pendente',
          observacoes: '',
          itens: []
        },
        errors: {}
      }));
    }, []),

    showEditForm: useCallback((devolucao: Devolucao) => {
      setState(prev => ({
        ...prev,
        showForm: true,
        editingDevolucao: devolucao,
        formData: {
          notaFiscalId: devolucao.notaFiscal.id,
          tipo: devolucao.tipo,
          motivo: devolucao.motivo,
          dataDevolucao: devolucao.dataDevolucao,
          valorDevolvido: devolucao.valorDevolvido,
          status: devolucao.status,
          observacoes: devolucao.observacoes || '',
          itens: devolucao.itens || []
        },
        errors: {}
      }));
    }, []),

    hideForm: useCallback(() => {
      setState(prev => ({
        ...prev,
        showForm: false,
        editingDevolucao: null,
        errors: {}
      }));
    }, []),

    showItemsDialog: useCallback((devolucao: Devolucao) => {
      setState(prev => ({
        ...prev,
        showItemsDialog: true,
        selectedDevolucao: devolucao
      }));
    }, []),

    hideItemsDialog: useCallback(() => {
      setState(prev => ({ ...prev, showItemsDialog: false }));
    }, []),

    showAnexosDialog: useCallback((devolucao: Devolucao) => {
      setState(prev => ({
        ...prev,
        showAnexosDialog: true,
        selectedDevolucao: devolucao
      }));
    }, []),

    hideAnexosDialog: useCallback(() => {
      setState(prev => ({ ...prev, showAnexosDialog: false }));
    }, []),

    showProcessingDialog: useCallback((devolucao: Devolucao) => {
      setState(prev => ({
        ...prev,
        showProcessingDialog: true,
        selectedDevolucao: devolucao
      }));
    }, []),

    hideProcessingDialog: useCallback(() => {
      setState(prev => ({ ...prev, showProcessingDialog: false }));
    }, []),

    // File operations
    uploadAnexos: useCallback(async (devolucaoId: number, files: File[]) => {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      try {
        await apiRequest(`/api/financas360/devolucoes/${devolucaoId}/anexos`, {
          method: 'POST',
          body: formData
        });
        queryClient.invalidateQueries({ queryKey: ['/api/financas360/devolucoes'] });
        toast({
          title: 'Anexos enviados',
          description: `${files.length} arquivo(s) enviado(s) com sucesso.`
        });
      } catch (error: any) {
        toast({
          title: 'Erro ao enviar anexos',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
    }, [queryClient, toast]),

    deleteAnexo: useCallback(async (anexoId: number) => {
      try {
        await apiRequest(`/api/financas360/devolucoes/anexos/${anexoId}`, {
          method: 'DELETE'
        });
        queryClient.invalidateQueries({ queryKey: ['/api/financas360/devolucoes'] });
        toast({
          title: 'Anexo excluído',
          description: 'O anexo foi excluído com sucesso.'
        });
      } catch (error: any) {
        toast({
          title: 'Erro ao excluir anexo',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
    }, [queryClient, toast]),

    downloadAnexo: useCallback((anexo: DevolucaoAnexo) => {
      const link = document.createElement('a');
      link.href = anexo.url;
      link.download = anexo.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, []),

    // Export operations
    exportDevolucoes: useCallback(async (format: 'xlsx' | 'csv' | 'pdf') => {
      try {
        const response = await fetch('/api/financas360/devolucoes/export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({
            format,
            filters: state.filters,
            sort: state.sort
          })
        });

        if (!response.ok) throw new Error('Erro na exportação');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `devolucoes-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: 'Exportação concluída',
          description: 'Os dados foram exportados com sucesso.'
        });
      } catch (error: any) {
        toast({
          title: 'Erro na exportação',
          description: error.message,
          variant: 'destructive'
        });
      }
    }, [state.filters, state.sort, toast]),

    exportAnalytics: useCallback(async (format: 'xlsx' | 'pdf') => {
      try {
        const response = await fetch('/api/financas360/devolucoes/analytics/export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({ format })
        });

        if (!response.ok) throw new Error('Erro na exportação');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-devolucoes-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: 'Relatório exportado',
          description: 'O relatório de análise foi exportado com sucesso.'
        });
      } catch (error: any) {
        toast({
          title: 'Erro na exportação',
          description: error.message,
          variant: 'destructive'
        });
      }
    }, [toast]),

    // Validation
    validateForm: useCallback((data: DevolucaoFormData): boolean => {
      const errors = validateDevolucaoForm(data);
      setState(prev => ({ ...prev, errors }));
      return Object.keys(errors).length === 0;
    }, []),

    clearErrors: useCallback(() => {
      setState(prev => ({ ...prev, errors: {}, validationErrors: [] }));
    }, [])
  };

  // ===== UTILITY FUNCTIONS =====
  const utils = {
    formatCurrency: useCallback((value: number): string => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    }, []),

    formatDate: useCallback((date: string): string => {
      return new Date(date).toLocaleDateString('pt-BR');
    }, []),

    formatStatus: useCallback((status: DevolucaoStatus): string => {
      return DEVOLUCAO_STATUS[status] || status;
    }, []),

    formatTipo: useCallback((tipo: DevolucaoTipo): string => {
      return DEVOLUCAO_TIPOS[tipo] || tipo;
    }, []),

    getStatusColor: useCallback((status: DevolucaoStatus): string => {
      return DEVOLUCAO_STATUS_COLORS[status] || 'text-gray-600 bg-gray-100';
    }, []),

    getTipoIcon: useCallback((tipo: DevolucaoTipo): React.ReactNode => {
      // Return appropriate icon based on tipo
      return null; // To be implemented with actual icons
    }, []),

    calculateDaysToProcess: useCallback((dataDevolucao: string): number => {
      const devolucaoDate = new Date(dataDevolucao);
      const today = new Date();
      const diffTime = today.getTime() - devolucaoDate.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }, []),

    canProcess: useCallback((devolucao: Devolucao): boolean => {
      return ['pendente', 'em_analise', 'aprovada'].includes(devolucao.status);
    }, []),

    canEdit: useCallback((devolucao: Devolucao): boolean => {
      return ['pendente', 'em_analise'].includes(devolucao.status);
    }, []),

    canDelete: useCallback((devolucao: Devolucao): boolean => {
      return ['pendente', 'cancelada', 'rejeitada'].includes(devolucao.status);
    }, []),

    validateCurrency: useCallback((value: string): boolean => {
      const numValue = parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.'));
      return !isNaN(numValue) && numValue >= 0;
    }, []),

    calculateItemTotal: useCallback((quantidade: number, valorUnitario: number): number => {
      return quantidade * valorUnitario;
    }, [])
  };

  // ===== RETURN OBJECT =====
  return {
    state,
    devolucoes: {
      data: state.devolucoes,
      filteredData: filteredDevolucoes,
      isLoading: devolucaosQuery.isLoading,
      error: devolucaosQuery.error?.message || null,
      refetch: devolucaosQuery.refetch
    },
    notasFiscais: {
      data: state.notasFiscais,
      isLoading: notasFiscaisQuery.isLoading,
      error: notasFiscaisQuery.error?.message || null,
      searchNotas: (query: string) => {
        queryClient.setQueryData(['/api/financas360/notas-fiscais', { search: query }], []);
        queryClient.invalidateQueries({ queryKey: ['/api/financas360/notas-fiscais'] });
      }
    },
    analytics: {
      data: analyticsQuery.data || null,
      isLoading: analyticsQuery.isLoading,
      error: analyticsQuery.error?.message || null
    },
    actions,
    utils
  };
};