/**
 * HOOK: useLancamentos
 * Gerencia estado e operações de lançamentos financeiros
 * Extraído de LancamentosManager.tsx (672 linhas) para modularização
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { 
  LancamentosState,
  UseLancamentosReturn,
  Lancamento,
  LancamentoFormData,
  LancamentoFilters,
  Empresa,
  Parceiro,
  ContaBancaria,
  FormaPagamento,
  Canal,
  EstruturaDRE,
  validateLancamentoForm,
  LANCAMENTO_FORM_DEFAULTS,
  LANCAMENTO_FILTERS_DEFAULTS,
  calculateLancamentoStats
} from '../types/lancamentos';

export const useLancamentos = (
  onSuccess?: (lancamento: Lancamento) => void,
  onCancel?: () => void,
  empresaId?: number
): UseLancamentosReturn => {
  // ===== EXTERNAL HOOKS =====
  const { token, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ===== STATE =====
  const [state, setState] = useState<LancamentosState>({
    // Data
    lancamentos: [],
    empresas: [],
    parceiros: [],
    contasBancarias: [],
    formasPagamento: [],
    canais: [],
    estruturasDre: [],
    
    // Loading states
    isLoading: false,
    isSaving: false,
    isDeleting: false,
    isLoadingEmpresas: false,
    isLoadingParceiros: false,
    isLoadingContasBancarias: false,
    isLoadingFormasPagamento: false,
    isLoadingCanais: false,
    isLoadingEstruturasDre: false,
    
    // Form state
    formData: { ...LANCAMENTO_FORM_DEFAULTS },
    originalData: null,
    isDirty: false,
    
    // UI state
    isDialogOpen: false,
    editingLancamento: null,
    filters: { ...LANCAMENTO_FILTERS_DEFAULTS },
    selectedItems: [],
    
    // Validation
    errors: {},
    validationErrors: [],
    
    // Statistics
    totalReceitas: 0,
    totalDespesas: 0,
    saldoTotal: 0,
    lancamentosPendentes: 0,
    lancamentosVencidos: 0
  });

  // ===== QUERIES =====
  const lancamentosQuery = useQuery({
    queryKey: ['financas360-lancamentos', empresaId],
    queryFn: async () => {
      const url = empresaId 
        ? `/api/financas360/lancamentos?empresaId=${empresaId}`
        : '/api/financas360/lancamentos';
        
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar lançamentos');
      }
      
      const result = await response.json();
      return result.data;
    },
    enabled: !!token && !authLoading,
    staleTime: 2 * 60 * 1000,
    onSuccess: (data) => {
      setState(prev => ({ ...prev, lancamentos: data }));
      
      // Calculate statistics
      const stats = calculateLancamentoStats(data);
      setState(prev => ({ 
        ...prev, 
        totalReceitas: stats.totalReceitas,
        totalDespesas: stats.totalDespesas,
        saldoTotal: stats.saldoTotal,
        lancamentosPendentes: stats.lancamentosPendentes,
        lancamentosVencidos: stats.lancamentosVencidos
      }));
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao carregar lançamentos',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const empresasQuery = useQuery({
    queryKey: ['financas360-empresas'],
    queryFn: async () => {
      const response = await fetch('/api/financas360/empresas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar empresas');
      }
      
      const result = await response.json();
      return result.data;
    },
    enabled: !!token && !authLoading,
    staleTime: 10 * 60 * 1000,
    onSuccess: (data) => {
      setState(prev => ({ ...prev, empresas: data }));
    }
  });

  const parceirosQuery = useQuery({
    queryKey: ['financas360-parceiros'],
    queryFn: async () => {
      const response = await fetch('/api/financas360/parceiros', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar parceiros');
      }
      
      const result = await response.json();
      return result.data;
    },
    enabled: !!token && !authLoading,
    staleTime: 10 * 60 * 1000,
    onSuccess: (data) => {
      setState(prev => ({ ...prev, parceiros: data }));
    }
  });

  // ===== MUTATIONS =====
  const createMutation = useMutation({
    mutationFn: async (data: LancamentoFormData) => {
      setState(prev => ({ ...prev, isSaving: true }));
      
      const response = await fetch('/api/financas360/lancamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar lançamento');
      }

      return response.json();
    },
    onSuccess: (newLancamento) => {
      queryClient.invalidateQueries({ queryKey: ['financas360-lancamentos'] });
      
      setState(prev => ({ 
        ...prev, 
        isDialogOpen: false,
        editingLancamento: null,
        formData: { ...LANCAMENTO_FORM_DEFAULTS },
        originalData: null,
        isDirty: false,
        errors: {},
        validationErrors: []
      }));
      
      toast({
        title: 'Sucesso',
        description: 'Lançamento criado com sucesso!'
      });
      
      if (onSuccess) {
        onSuccess(newLancamento);
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    },
    onSettled: () => {
      setState(prev => ({ ...prev, isSaving: false }));
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<LancamentoFormData> }) => {
      setState(prev => ({ ...prev, isSaving: true }));
      
      const response = await fetch(`/api/financas360/lancamentos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar lançamento');
      }

      return response.json();
    },
    onSuccess: (updatedLancamento) => {
      queryClient.invalidateQueries({ queryKey: ['financas360-lancamentos'] });
      
      setState(prev => ({ 
        ...prev, 
        isDialogOpen: false,
        editingLancamento: null,
        formData: { ...LANCAMENTO_FORM_DEFAULTS },
        originalData: null,
        isDirty: false,
        errors: {},
        validationErrors: []
      }));
      
      toast({
        title: 'Sucesso',
        description: 'Lançamento atualizado com sucesso!'
      });
      
      if (onSuccess) {
        onSuccess(updatedLancamento);
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    },
    onSettled: () => {
      setState(prev => ({ ...prev, isSaving: false }));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      setState(prev => ({ ...prev, isDeleting: true }));
      
      const response = await fetch(`/api/financas360/lancamentos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir lançamento');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-lancamentos'] });
      
      toast({
        title: 'Sucesso',
        description: 'Lançamento excluído com sucesso!'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    },
    onSettled: () => {
      setState(prev => ({ ...prev, isDeleting: false }));
    }
  });

  // ===== COMPUTED VALUES =====
  const filteredLancamentos = useMemo(() => {
    let result = state.lancamentos;

    // Apply filters
    if (state.filters.status !== 'all') {
      result = result.filter(l => l.status === state.filters.status);
    }

    if (state.filters.tipo !== 'all') {
      result = result.filter(l => l.tipo === state.filters.tipo);
    }

    if (state.filters.empresaId !== 'all') {
      result = result.filter(l => l.empresaId.toString() === state.filters.empresaId);
    }

    if (state.filters.search) {
      const search = state.filters.search.toLowerCase();
      result = result.filter(l => 
        l.descricao.toLowerCase().includes(search) ||
        l.categoria.toLowerCase().includes(search) ||
        (l.observacoes && l.observacoes.toLowerCase().includes(search))
      );
    }

    if (state.filters.dataInicio) {
      result = result.filter(l => l.dataVencimento >= state.filters.dataInicio);
    }

    if (state.filters.dataFim) {
      result = result.filter(l => l.dataVencimento <= state.filters.dataFim);
    }

    if (state.filters.valorMin !== undefined) {
      result = result.filter(l => l.valor >= state.filters.valorMin!);
    }

    if (state.filters.valorMax !== undefined) {
      result = result.filter(l => l.valor <= state.filters.valorMax!);
    }

    return result;
  }, [state.lancamentos, state.filters]);

  // ===== ACTIONS =====
  const actions = {
    // CRUD operations
    createLancamento: useCallback(async (data: LancamentoFormData) => {
      const errors = validateLancamentoForm(data);
      
      if (Object.keys(errors).length > 0) {
        setState(prev => ({ ...prev, errors }));
        throw new Error('Dados inválidos');
      }
      
      setState(prev => ({ ...prev, errors: {} }));
      await createMutation.mutateAsync(data);
    }, [createMutation]),

    updateLancamento: useCallback(async (id: number, data: Partial<LancamentoFormData>) => {
      await updateMutation.mutateAsync({ id, data });
    }, [updateMutation]),

    deleteLancamento: useCallback(async (id: number) => {
      await deleteMutation.mutateAsync(id);
    }, [deleteMutation]),

    duplicateLancamento: useCallback(async (id: number) => {
      const original = state.lancamentos.find(l => l.id === id);
      if (!original) return;

      const duplicatedData: LancamentoFormData = {
        empresaId: original.empresaId,
        tipo: original.tipo,
        descricao: `${original.descricao} (Cópia)`,
        valor: original.valor,
        dataVencimento: original.dataVencimento,
        status: 'pendente',
        categoria: original.categoria,
        observacoes: original.observacoes
      };

      await createMutation.mutateAsync(duplicatedData);
    }, [state.lancamentos, createMutation]),

    // Form actions
    updateFormData: useCallback((field: keyof LancamentoFormData, value: any) => {
      setState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          [field]: value
        },
        isDirty: true,
        errors: {
          ...prev.errors,
          [field]: undefined
        }
      }));
    }, []),

    resetForm: useCallback(() => {
      setState(prev => ({
        ...prev,
        formData: { ...LANCAMENTO_FORM_DEFAULTS },
        originalData: null,
        isDirty: false,
        errors: {},
        validationErrors: []
      }));
    }, []),

    openDialog: useCallback((lancamento?: Lancamento) => {
      if (lancamento) {
        const formData: LancamentoFormData = {
          empresaId: lancamento.empresaId,
          tipo: lancamento.tipo,
          descricao: lancamento.descricao,
          valor: lancamento.valor,
          dataVencimento: lancamento.dataVencimento.split('T')[0],
          dataPagamento: lancamento.dataPagamento ? lancamento.dataPagamento.split('T')[0] : '',
          status: lancamento.status,
          categoria: lancamento.categoria,
          observacoes: lancamento.observacoes || ''
        };
        
        setState(prev => ({
          ...prev,
          isDialogOpen: true,
          editingLancamento: lancamento,
          formData,
          originalData: { ...formData },
          isDirty: false,
          errors: {}
        }));
      } else {
        setState(prev => ({
          ...prev,
          isDialogOpen: true,
          editingLancamento: null,
          formData: { ...LANCAMENTO_FORM_DEFAULTS },
          originalData: null,
          isDirty: false,
          errors: {}
        }));
      }
    }, []),

    closeDialog: useCallback(() => {
      setState(prev => ({
        ...prev,
        isDialogOpen: false,
        editingLancamento: null,
        formData: { ...LANCAMENTO_FORM_DEFAULTS },
        originalData: null,
        isDirty: false,
        errors: {}
      }));
      
      if (onCancel) {
        onCancel();
      }
    }, [onCancel]),

    // Filter actions
    updateFilter: useCallback((field: keyof LancamentoFilters, value: any) => {
      setState(prev => ({
        ...prev,
        filters: {
          ...prev.filters,
          [field]: value
        }
      }));
    }, []),

    resetFilters: useCallback(() => {
      setState(prev => ({
        ...prev,
        filters: { ...LANCAMENTO_FILTERS_DEFAULTS }
      }));
    }, []),

    applyFilters: useCallback(() => {
      // Filters are applied automatically via useMemo
      // This function exists for explicit filter application if needed
    }, []),

    // Selection actions
    selectItem: useCallback((id: number) => {
      setState(prev => ({
        ...prev,
        selectedItems: prev.selectedItems.includes(id)
          ? prev.selectedItems.filter(i => i !== id)
          : [...prev.selectedItems, id]
      }));
    }, []),

    selectAll: useCallback(() => {
      setState(prev => ({
        ...prev,
        selectedItems: filteredLancamentos.map(l => l.id)
      }));
    }, [filteredLancamentos]),

    clearSelection: useCallback(() => {
      setState(prev => ({
        ...prev,
        selectedItems: []
      }));
    }, []),

    bulkDelete: useCallback(async () => {
      for (const id of state.selectedItems) {
        await deleteMutation.mutateAsync(id);
      }
      setState(prev => ({ ...prev, selectedItems: [] }));
    }, [state.selectedItems, deleteMutation]),

    bulkUpdateStatus: useCallback(async (status: string) => {
      for (const id of state.selectedItems) {
        await updateMutation.mutateAsync({ 
          id, 
          data: { status: status as any } 
        });
      }
      setState(prev => ({ ...prev, selectedItems: [] }));
    }, [state.selectedItems, updateMutation]),

    // Status actions
    markAsPaid: useCallback(async (id: number, dataPagamento?: string) => {
      await updateMutation.mutateAsync({
        id,
        data: {
          status: 'pago',
          dataPagamento: dataPagamento || new Date().toISOString().split('T')[0]
        }
      });
    }, [updateMutation]),

    markAsPending: useCallback(async (id: number) => {
      await updateMutation.mutateAsync({
        id,
        data: {
          status: 'pendente',
          dataPagamento: ''
        }
      });
    }, [updateMutation]),

    markAsCanceled: useCallback(async (id: number) => {
      await updateMutation.mutateAsync({
        id,
        data: { status: 'cancelado' }
      });
    }, [updateMutation]),

    // Validation
    validateForm: useCallback((): boolean => {
      const errors = validateLancamentoForm(state.formData);
      setState(prev => ({ ...prev, errors }));
      return Object.keys(errors).length === 0;
    }, [state.formData]),

    validateField: useCallback((field: keyof LancamentoFormData, value: any): string | null => {
      const tempData = { ...state.formData, [field]: value };
      const errors = validateLancamentoForm(tempData);
      return errors[field] || null;
    }, [state.formData]),

    clearErrors: useCallback(() => {
      setState(prev => ({ ...prev, errors: {}, validationErrors: [] }));
    }, []),

    // Data refresh
    refreshLancamentos: useCallback(() => {
      lancamentosQuery.refetch();
    }, [lancamentosQuery]),

    refreshEmpresas: useCallback(() => {
      empresasQuery.refetch();
    }, [empresasQuery]),

    refreshParceiros: useCallback(() => {
      parceirosQuery.refetch();
    }, [parceirosQuery]),

    refreshContasBancarias: useCallback(() => {
      // Add when implemented
    }, []),

    refreshFormasPagamento: useCallback(() => {
      // Add when implemented
    }, []),

    refreshCanais: useCallback(() => {
      // Add when implemented
    }, []),

    refreshEstruturasDre: useCallback(() => {
      // Add when implemented
    }, [])
  };

  // ===== UTILITY FUNCTIONS =====
  const utils = {
    // Filtering and search
    filterLancamentos: useCallback((lancamentos: Lancamento[]) => {
      return filteredLancamentos;
    }, [filteredLancamentos]),

    searchLancamentos: useCallback((lancamentos: Lancamento[], query: string) => {
      const search = query.toLowerCase();
      return lancamentos.filter(l => 
        l.descricao.toLowerCase().includes(search) ||
        l.categoria.toLowerCase().includes(search) ||
        (l.observacoes && l.observacoes.toLowerCase().includes(search))
      );
    }, []),

    sortLancamentos: useCallback((lancamentos: Lancamento[], field: string, direction: 'asc' | 'desc') => {
      return [...lancamentos].sort((a, b) => {
        const aVal = (a as any)[field];
        const bVal = (b as any)[field];
        
        if (direction === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }, []),

    // Formatting
    formatCurrency: useCallback((value: number): string => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    }, []),

    formatDate: useCallback((date: string): string => {
      return new Date(date).toLocaleDateString('pt-BR');
    }, []),

    formatDateTime: useCallback((date: string): string => {
      return new Date(date).toLocaleString('pt-BR');
    }, []),

    formatStatus: useCallback((status: string): string => {
      const statusMap: Record<string, string> = {
        pendente: 'Pendente',
        pago: 'Pago',
        cancelado: 'Cancelado',
        vencido: 'Vencido'
      };
      return statusMap[status] || status;
    }, []),

    formatTipo: useCallback((tipo: string): string => {
      const tipoMap: Record<string, string> = {
        receita: 'Receita',
        despesa: 'Despesa'
      };
      return tipoMap[tipo] || tipo;
    }, []),

    // Calculations
    calculateTotalReceitas: useCallback((lancamentos: Lancamento[]): number => {
      return lancamentos
        .filter(l => l.tipo === 'receita' && l.status === 'pago')
        .reduce((sum, l) => sum + l.valor, 0);
    }, []),

    calculateTotalDespesas: useCallback((lancamentos: Lancamento[]): number => {
      return lancamentos
        .filter(l => l.tipo === 'despesa' && l.status === 'pago')
        .reduce((sum, l) => sum + l.valor, 0);
    }, []),

    calculateSaldo: useCallback((lancamentos: Lancamento[]): number => {
      const receitas = utils.calculateTotalReceitas(lancamentos);
      const despesas = utils.calculateTotalDespesas(lancamentos);
      return receitas - despesas;
    }, [utils]),

    calculateLancamentosPendentes: useCallback((lancamentos: Lancamento[]): number => {
      return lancamentos.filter(l => l.status === 'pendente').length;
    }, []),

    calculateLancamentosVencidos: useCallback((lancamentos: Lancamento[]): number => {
      const hoje = new Date();
      hoje.setHours(23, 59, 59, 999);
      
      return lancamentos.filter(l => 
        l.status === 'pendente' && new Date(l.dataVencimento) < hoje
      ).length;
    }, []),

    // Status helpers
    isVencido: useCallback((lancamento: Lancamento): boolean => {
      if (lancamento.status !== 'pendente') return false;
      const hoje = new Date();
      hoje.setHours(23, 59, 59, 999);
      return new Date(lancamento.dataVencimento) < hoje;
    }, []),

    isPago: useCallback((lancamento: Lancamento): boolean => {
      return lancamento.status === 'pago';
    }, []),

    isPendente: useCallback((lancamento: Lancamento): boolean => {
      return lancamento.status === 'pendente';
    }, []),

    isCancelado: useCallback((lancamento: Lancamento): boolean => {
      return lancamento.status === 'cancelado';
    }, []),

    // Date helpers
    isToday: useCallback((date: string): boolean => {
      const today = new Date().toISOString().split('T')[0];
      return date.split('T')[0] === today;
    }, []),

    isThisMonth: useCallback((date: string): boolean => {
      const today = new Date();
      const targetDate = new Date(date);
      return today.getMonth() === targetDate.getMonth() && 
             today.getFullYear() === targetDate.getFullYear();
    }, []),

    isThisYear: useCallback((date: string): boolean => {
      const today = new Date();
      const targetDate = new Date(date);
      return today.getFullYear() === targetDate.getFullYear();
    }, []),

    daysBetween: useCallback((date1: string, date2: string): number => {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }, []),

    // Entity helpers
    getEmpresaName: useCallback((empresaId: number): string => {
      const empresa = state.empresas.find(e => e.id === empresaId);
      return empresa?.razaoSocial || 'Empresa não encontrada';
    }, [state.empresas]),

    getParceiroName: useCallback((parceiroId: number): string => {
      const parceiro = state.parceiros.find(p => p.id === parceiroId);
      return parceiro?.nome || 'Parceiro não encontrado';
    }, [state.parceiros]),

    getContaBancariaName: useCallback((contaBancariaId: number): string => {
      const conta = state.contasBancarias.find(c => c.id === contaBancariaId);
      return conta ? `${conta.banco} - ${conta.conta}` : 'Conta não encontrada';
    }, [state.contasBancarias]),

    getFormaPagamentoName: useCallback((formaPagamentoId: number): string => {
      const forma = state.formasPagamento.find(f => f.id === formaPagamentoId);
      return forma?.nome || 'Forma de pagamento não encontrada';
    }, [state.formasPagamento]),

    getCanalName: useCallback((canalId: number): string => {
      const canal = state.canais.find(c => c.id === canalId);
      return canal?.nome || 'Canal não encontrado';
    }, [state.canais]),

    getEstruturaDreName: useCallback((estruturaDreId: number): string => {
      const estrutura = state.estruturasDre.find(e => e.id === estruturaDreId);
      return estrutura?.descricao || 'Estrutura DRE não encontrada';
    }, [state.estruturasDre]),

    // Export helpers
    exportToCSV: useCallback((lancamentos: Lancamento[]) => {
      // Implementation for CSV export
    }, []),

    exportToExcel: useCallback((lancamentos: Lancamento[]) => {
      // Implementation for Excel export
    }, []),

    exportToPDF: useCallback((lancamentos: Lancamento[]) => {
      // Implementation for PDF export
    }, []),

    // Validation helpers
    isValidCurrency: useCallback((value: string): boolean => {
      return /^\d+(\.\d{1,2})?$/.test(value);
    }, []),

    isValidDate: useCallback((date: string): boolean => {
      return !isNaN(Date.parse(date));
    }, []),

    isValidDescription: useCallback((description: string): boolean => {
      return description.trim().length >= 3 && description.length <= 255;
    }, [])
  };

  // ===== SIDE EFFECTS =====
  useEffect(() => {
    setState(prev => ({ ...prev, isLoading: lancamentosQuery.isLoading }));
  }, [lancamentosQuery.isLoading]);

  useEffect(() => {
    setState(prev => ({ ...prev, isLoadingEmpresas: empresasQuery.isLoading }));
  }, [empresasQuery.isLoading]);

  useEffect(() => {
    setState(prev => ({ ...prev, isLoadingParceiros: parceirosQuery.isLoading }));
  }, [parceirosQuery.isLoading]);

  // ===== RETURN OBJECT =====
  return {
    state,
    lancamentosData: {
      data: filteredLancamentos,
      isLoading: lancamentosQuery.isLoading,
      error: lancamentosQuery.error?.message || null,
      refetch: lancamentosQuery.refetch
    },
    empresasData: {
      data: state.empresas,
      isLoading: empresasQuery.isLoading,
      error: empresasQuery.error?.message || null
    },
    parceirosData: {
      data: state.parceiros,
      isLoading: parceirosQuery.isLoading,
      error: parceirosQuery.error?.message || null
    },
    contasBancariasData: {
      data: state.contasBancarias,
      isLoading: state.isLoadingContasBancarias,
      error: null
    },
    formasPagamentoData: {
      data: state.formasPagamento,
      isLoading: state.isLoadingFormasPagamento,
      error: null
    },
    canaisData: {
      data: state.canais,
      isLoading: state.isLoadingCanais,
      error: null
    },
    estruturasDreData: {
      data: state.estruturasDre,
      isLoading: state.isLoadingEstruturasDre,
      error: null
    },
    actions,
    utils
  };
};
