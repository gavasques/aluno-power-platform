/**
 * HOOK: useCanaisPagamento
 * Gerencia estado e operações de canais de pagamento
 * Extraído de CanaisPagamentoManager.tsx para modularização
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  CanaisPagamentoManagerState,
  UseCanaisPagamentoReturn,
  CanalPagamento,
  ProcessadoraPagamento,
  TransacaoPagamento,
  CanalPagamentoFormData,
  CanalPagamentoFilters,
  CanalPagamentoSort,
  CanalPagamentoSortField,
  CanalPagamentoTipo,
  CanalPagamentoStatus,
  CanalPagamentoAnalytics,
  TestConnectionResult,
  validateCanalPagamentoForm,
  CANAL_PAGAMENTO_STATUS,
  CANAL_PAGAMENTO_TIPOS,
  CANAL_PAGAMENTO_STATUS_COLORS
} from '../types/canaisPagamento';

export const useCanaisPagamento = (
  userId?: number,
  defaultFilters?: Partial<CanalPagamentoFilters>
): UseCanaisPagamentoReturn => {
  // ===== EXTERNAL HOOKS =====
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ===== STATE =====
  const [state, setState] = useState<CanaisPagamentoManagerState>({
    // Data
    canais: [],
    processadoras: [],
    transacoes: [],
    selectedCanal: null,
    
    // Loading states
    isLoading: false,
    isSaving: false,
    isDeleting: false,
    isTesting: false,
    isLoadingTransacoes: false,
    isLoadingProcessadoras: false,
    
    // UI state
    showForm: false,
    showTransacoesDialog: false,
    showConfigDialog: false,
    showTaxasDialog: false,
    expandedRows: new Set(),
    selectedItems: [],
    
    // Form state
    formData: {
      nome: '',
      tipo: 'pix',
      descricao: '',
      configuracao: {
        moedaPadrao: 'BRL',
        permiteParcelas: false,
        aceitaCredito: true,
        aceitaDebito: true,
        bandeirasSuportadas: [],
        webhookEvents: []
      },
      taxas: {
        taxaPercentual: 0,
        taxaFixa: 0,
        diasRepasse: 1,
        antecipacaoAutomatica: false
      },
      limitesTransacao: {
        valorMinimo: 0.01,
        valorMaximo: 100000
      },
      isAtivo: true,
      prioridade: 5,
      observacoes: ''
    },
    editingCanal: null,
    
    // Filters and search
    filters: {
      searchTerm: '',
      tipoFilter: 'all',
      statusFilter: 'all',
      ativoFilter: 'all',
      processadoraFilter: 'all',
      dataInicio: undefined,
      dataFim: undefined,
      valorMinimo: undefined,
      valorMaximo: undefined,
      ...defaultFilters
    },
    sort: {
      field: 'prioridade',
      direction: 'asc'
    },
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    
    // Test state
    testResult: null,
    
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
    ativo: state.filters.ativoFilter !== 'all' ? state.filters.ativoFilter === 'ativo' : undefined,
    processadoraId: state.filters.processadoraFilter !== 'all' ? state.filters.processadoraFilter : undefined,
    dataInicio: state.filters.dataInicio,
    dataFim: state.filters.dataFim,
    sortField: state.sort.field,
    sortDirection: state.sort.direction,
    userId
  }), [state.currentPage, state.itemsPerPage, state.filters, state.sort, userId]);

  // ===== QUERIES =====
  const canaisQuery = useQuery({
    queryKey: ['/api/financas360/canais-pagamento', queryParams],
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: (data) => ({
      canais: data?.data || [],
      totalItems: data?.total || 0
    }),
    onSuccess: (data) => {
      setState(prev => ({
        ...prev,
        canais: data.canais,
        totalItems: data.totalItems
      }));
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao carregar canais',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const processadorasQuery = useQuery({
    queryKey: ['/api/financas360/processadoras-pagamento'],
    staleTime: 10 * 60 * 1000, // 10 minutes
    select: (data) => data || [],
    onSuccess: (data) => {
      setState(prev => ({ ...prev, processadoras: data }));
    }
  });

  const analyticsQuery = useQuery({
    queryKey: ['/api/financas360/canais-pagamento/analytics', { 
      startDate: state.filters.dataInicio,
      endDate: state.filters.dataFim,
      userId 
    }],
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!(state.filters.dataInicio && state.filters.dataFim)
  });

  // ===== MUTATIONS =====
  const createMutation = useMutation({
    mutationFn: async (data: CanalPagamentoFormData) => {
      setState(prev => ({ ...prev, isSaving: true }));
      return apiRequest('/api/financas360/canais-pagamento', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (newCanal) => {
      queryClient.invalidateQueries({ queryKey: ['/api/financas360/canais-pagamento'] });
      setState(prev => ({ 
        ...prev, 
        showForm: false, 
        editingCanal: null
      }));
      toast({
        title: 'Canal criado',
        description: 'O canal de pagamento foi criado com sucesso.'
      });
      return newCanal;
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar canal',
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
    mutationFn: async ({ id, data }: { id: number; data: Partial<CanalPagamentoFormData> }) => {
      setState(prev => ({ ...prev, isSaving: true }));
      return apiRequest(`/api/financas360/canais-pagamento/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/financas360/canais-pagamento'] });
      setState(prev => ({ 
        ...prev, 
        showForm: false,
        editingCanal: null
      }));
      toast({
        title: 'Canal atualizado',
        description: 'O canal de pagamento foi atualizado com sucesso.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar canal',
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
      return apiRequest(`/api/financas360/canais-pagamento/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/financas360/canais-pagamento'] });
      setState(prev => ({ ...prev, selectedCanal: null }));
      toast({
        title: 'Canal excluído',
        description: 'O canal de pagamento foi excluído com sucesso.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir canal',
        description: error.message,
        variant: 'destructive'
      });
    },
    onSettled: () => {
      setState(prev => ({ ...prev, isDeleting: false }));
    }
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (id: number) => {
      setState(prev => ({ ...prev, isTesting: true }));
      return apiRequest(`/api/financas360/canais-pagamento/${id}/test`, {
        method: 'POST'
      });
    },
    onSuccess: (result: TestConnectionResult) => {
      setState(prev => ({ ...prev, testResult: result }));
      if (result.success) {
        toast({
          title: 'Conexão testada',
          description: 'A conexão com o canal foi testada com sucesso.'
        });
      } else {
        toast({
          title: 'Erro na conexão',
          description: result.message,
          variant: 'destructive'
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao testar conexão',
        description: error.message,
        variant: 'destructive'
      });
    },
    onSettled: () => {
      setState(prev => ({ ...prev, isTesting: false }));
    }
  });

  // ===== SIDE EFFECTS =====
  useEffect(() => {
    setState(prev => ({ ...prev, isLoading: canaisQuery.isLoading }));
  }, [canaisQuery.isLoading]);

  useEffect(() => {
    setState(prev => ({ ...prev, isLoadingProcessadoras: processadorasQuery.isLoading }));
  }, [processadorasQuery.isLoading]);

  // ===== COMPUTED VALUES =====
  const filteredCanais = useMemo(() => {
    let filtered = state.canais;

    // Apply additional client-side filtering if needed
    return filtered;
  }, [state.canais, state.filters]);

  // ===== ACTIONS =====
  const actions = {
    // CRUD operations
    createCanal: useCallback(async (data: CanalPagamentoFormData) => {
      const errors = validateCanalPagamentoForm(data);
      if (Object.keys(errors).length > 0) {
        setState(prev => ({ ...prev, errors }));
        throw new Error('Dados inválidos');
      }
      
      setState(prev => ({ ...prev, errors: {} }));
      return await createMutation.mutateAsync(data);
    }, [createMutation]),

    updateCanal: useCallback(async (id: number, data: Partial<CanalPagamentoFormData>) => {
      return await updateMutation.mutateAsync({ id, data });
    }, [updateMutation]),

    deleteCanal: useCallback(async (id: number) => {
      await deleteMutation.mutateAsync(id);
    }, [deleteMutation]),

    bulkDelete: useCallback(async (ids: number[]) => {
      setState(prev => ({ ...prev, isDeleting: true }));
      try {
        await Promise.all(ids.map(id => 
          apiRequest(`/api/financas360/canais-pagamento/${id}`, { method: 'DELETE' })
        ));
        queryClient.invalidateQueries({ queryKey: ['/api/financas360/canais-pagamento'] });
        setState(prev => ({ 
          ...prev, 
          selectedItems: [],
          selectedCanal: null
        }));
        toast({
          title: 'Canais excluídos',
          description: `${ids.length} canais foram excluídos com sucesso.`
        });
      } catch (error: any) {
        toast({
          title: 'Erro ao excluir canais',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setState(prev => ({ ...prev, isDeleting: false }));
      }
    }, [queryClient, toast]),

    // Canal operations
    activateCanal: useCallback(async (id: number) => {
      await updateMutation.mutateAsync({ id, data: { isAtivo: true } });
    }, [updateMutation]),

    deactivateCanal: useCallback(async (id: number) => {
      await updateMutation.mutateAsync({ id, data: { isAtivo: false } });
    }, [updateMutation]),

    suspendCanal: useCallback(async (id: number, motivo: string) => {
      await updateMutation.mutateAsync({ 
        id, 
        data: { 
          isAtivo: false,
          observacoes: motivo
        } 
      });
    }, [updateMutation]),

    testConnection: useCallback(async (id: number) => {
      return await testConnectionMutation.mutateAsync(id);
    }, [testConnectionMutation]),

    // Configuration operations
    updateConfiguracao: useCallback(async (id: number, config: any) => {
      await updateMutation.mutateAsync({ id, data: { configuracao: config } });
    }, [updateMutation]),

    updateTaxas: useCallback(async (id: number, taxas: any) => {
      await updateMutation.mutateAsync({ id, data: { taxas } });
    }, [updateMutation]),

    updateLimites: useCallback(async (id: number, limites: any) => {
      await updateMutation.mutateAsync({ id, data: { limitesTransacao: limites } });
    }, [updateMutation]),

    // Selection and UI
    selectCanal: useCallback((canal: CanalPagamento | null) => {
      setState(prev => ({ ...prev, selectedCanal: canal }));
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
        selectedItems: prev.canais.map(c => c.id)
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

    filterByTipo: useCallback((tipo: CanalPagamentoTipo | 'all') => {
      setState(prev => ({
        ...prev,
        filters: { ...prev.filters, tipoFilter: tipo },
        currentPage: 1
      }));
    }, []),

    filterByStatus: useCallback((status: CanalPagamentoStatus | 'all') => {
      setState(prev => ({
        ...prev,
        filters: { ...prev.filters, statusFilter: status },
        currentPage: 1
      }));
    }, []),

    filterByAtivo: useCallback((ativo: 'all' | 'ativo' | 'inativo') => {
      setState(prev => ({
        ...prev,
        filters: { ...prev.filters, ativoFilter: ativo },
        currentPage: 1
      }));
    }, []),

    filterByProcessadora: useCallback((processadoraId: number | 'all') => {
      setState(prev => ({
        ...prev,
        filters: { ...prev.filters, processadoraFilter: processadoraId },
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

    clearFilters: useCallback(() => {
      setState(prev => ({
        ...prev,
        filters: {
          searchTerm: '',
          tipoFilter: 'all',
          statusFilter: 'all',
          ativoFilter: 'all',
          processadoraFilter: 'all',
          dataInicio: undefined,
          dataFim: undefined,
          valorMinimo: undefined,
          valorMaximo: undefined
        },
        currentPage: 1
      }));
    }, []),

    // Sorting and pagination
    sortBy: useCallback((field: CanalPagamentoSortField, direction?: 'asc' | 'desc') => {
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
        editingCanal: null,
        formData: {
          nome: '',
          tipo: 'pix',
          descricao: '',
          configuracao: {
            moedaPadrao: 'BRL',
            permiteParcelas: false,
            aceitaCredito: true,
            aceitaDebito: true,
            bandeirasSuportadas: [],
            webhookEvents: []
          },
          taxas: {
            taxaPercentual: 0,
            taxaFixa: 0,
            diasRepasse: 1,
            antecipacaoAutomatica: false
          },
          limitesTransacao: {
            valorMinimo: 0.01,
            valorMaximo: 100000
          },
          isAtivo: true,
          prioridade: 5,
          observacoes: ''
        },
        errors: {}
      }));
    }, []),

    showEditForm: useCallback((canal: CanalPagamento) => {
      setState(prev => ({
        ...prev,
        showForm: true,
        editingCanal: canal,
        formData: {
          nome: canal.nome,
          tipo: canal.tipo,
          descricao: canal.descricao || '',
          configuracao: canal.configuracao,
          taxas: canal.taxas,
          limitesTransacao: canal.limitesTransacao,
          isAtivo: canal.isAtivo,
          prioridade: canal.prioridade,
          observacoes: canal.observacoes || ''
        },
        errors: {}
      }));
    }, []),

    hideForm: useCallback(() => {
      setState(prev => ({
        ...prev,
        showForm: false,
        editingCanal: null,
        errors: {}
      }));
    }, []),

    showTransacoesDialog: useCallback((canal: CanalPagamento) => {
      setState(prev => ({
        ...prev,
        showTransacoesDialog: true,
        selectedCanal: canal
      }));
      // Load transactions for this canal
    }, []),

    hideTransacoesDialog: useCallback(() => {
      setState(prev => ({ ...prev, showTransacoesDialog: false }));
    }, []),

    showConfigDialog: useCallback((canal: CanalPagamento) => {
      setState(prev => ({
        ...prev,
        showConfigDialog: true,
        selectedCanal: canal
      }));
    }, []),

    hideConfigDialog: useCallback(() => {
      setState(prev => ({ ...prev, showConfigDialog: false }));
    }, []),

    showTaxasDialog: useCallback((canal: CanalPagamento) => {
      setState(prev => ({
        ...prev,
        showTaxasDialog: true,
        selectedCanal: canal
      }));
    }, []),

    hideTaxasDialog: useCallback(() => {
      setState(prev => ({ ...prev, showTaxasDialog: false }));
    }, []),

    // Export operations
    exportCanais: useCallback(async (format: 'xlsx' | 'csv' | 'pdf') => {
      try {
        const response = await fetch('/api/financas360/canais-pagamento/export', {
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
        a.download = `canais-pagamento-${Date.now()}.${format}`;
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

    exportTransacoes: useCallback(async (canalId: number, format: 'xlsx' | 'csv') => {
      // Implementation for transaction export
    }, []),

    exportAnalytics: useCallback(async (format: 'xlsx' | 'pdf') => {
      // Implementation for analytics export
    }, []),

    // Validation
    validateForm: useCallback((data: CanalPagamentoFormData): boolean => {
      const errors = validateCanalPagamentoForm(data);
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

    formatPercentage: useCallback((value: number): string => {
      return `${value.toFixed(2)}%`;
    }, []),

    formatDate: useCallback((date: string): string => {
      return new Date(date).toLocaleDateString('pt-BR');
    }, []),

    formatStatus: useCallback((status: CanalPagamentoStatus): string => {
      return CANAL_PAGAMENTO_STATUS[status] || status;
    }, []),

    formatTipo: useCallback((tipo: CanalPagamentoTipo): string => {
      return CANAL_PAGAMENTO_TIPOS[tipo] || tipo;
    }, []),

    getStatusColor: useCallback((status: CanalPagamentoStatus): string => {
      return CANAL_PAGAMENTO_STATUS_COLORS[status] || 'text-gray-600 bg-gray-100';
    }, []),

    getTipoIcon: useCallback((tipo: CanalPagamentoTipo): React.ReactNode => {
      // Return appropriate icon based on tipo
      return null; // To be implemented with actual icons
    }, []),

    calculateTaxaTotal: useCallback((taxas: any, valor: number): number => {
      const taxaPercentual = (valor * taxas.taxaPercentual) / 100;
      return taxaPercentual + (taxas.taxaFixa || 0);
    }, []),

    isWithinLimites: useCallback((canal: CanalPagamento, valor: number): boolean => {
      const limites = canal.limitesTransacao;
      return valor >= limites.valorMinimo && valor <= limites.valorMaximo;
    }, []),

    canProcessTransaction: useCallback((canal: CanalPagamento): boolean => {
      return canal.isAtivo && canal.status === 'ativo';
    }, []),

    getPriorityLevel: useCallback((prioridade: number): 'alta' | 'media' | 'baixa' => {
      if (prioridade <= 3) return 'alta';
      if (prioridade <= 7) return 'media';
      return 'baixa';
    }, []),

    formatTransactionId: useCallback((id: string): string => {
      return id.toUpperCase();
    }, []),

    maskCardNumber: useCallback((number: string): string => {
      return number.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '**** **** **** $4');
    }, []),

    validateConfiguration: useCallback((tipo: CanalPagamentoTipo, config: any): string[] => {
      const errors: string[] = [];
      
      // Add validation logic based on tipo
      switch (tipo) {
        case 'pix':
          if (!config.pixKey) errors.push('Chave PIX é obrigatória');
          break;
        case 'cartao_credito':
        case 'cartao_debito':
          if (!config.apiKey) errors.push('API Key é obrigatória');
          if (!config.merchantId) errors.push('Merchant ID é obrigatório');
          break;
        case 'boleto':
          if (!config.agenciaBancaria) errors.push('Agência bancária é obrigatória');
          if (!config.contaBancaria) errors.push('Conta bancária é obrigatória');
          break;
      }
      
      return errors;
    }, [])
  };

  // ===== RETURN OBJECT =====
  return {
    state,
    canais: {
      data: state.canais,
      filteredData: filteredCanais,
      isLoading: canaisQuery.isLoading,
      error: canaisQuery.error?.message || null,
      refetch: canaisQuery.refetch
    },
    processadoras: {
      data: state.processadoras,
      isLoading: processadorasQuery.isLoading,
      error: processadorasQuery.error?.message || null
    },
    transacoes: {
      data: state.transacoes,
      isLoading: state.isLoadingTransacoes,
      error: null,
      loadByCanal: (canalId: number) => {
        // Load transactions for specific canal
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