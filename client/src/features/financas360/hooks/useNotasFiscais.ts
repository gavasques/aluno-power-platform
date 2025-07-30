/**
 * HOOK: useNotasFiscais
 * Gerencia estado e operações de notas fiscais
 * Extraído de NotasFiscaisManager.tsx para modularização
 */
import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  NotasFiscaisState, 
  UseNotasFiscaisReturn,
  NotaFiscal,
  NotaFiscalFormData,
  Fornecedor,
  Produto
} from '../types';

export const useNotasFiscais = (): UseNotasFiscaisReturn => {
  // ===== EXTERNAL HOOKS =====
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ===== STATE =====
  const [state, setState] = useState<NotasFiscaisState>({
    notas: [],
    selectedNota: null,
    isLoading: false,
    isSaving: false,
    isImporting: false,
    searchQuery: '',
    statusFilter: 'all',
    tipoFilter: 'all',
    fornecedorFilter: null,
    dateRange: {},
    sortBy: 'dataEmissao',
    sortOrder: 'desc',
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    showForm: false,
    showImportDialog: false,
    selectedItems: []
  });

  // ===== QUERIES =====
  const notasQuery = useQuery({
    queryKey: ['/api/financas360/notas-fiscais'],
    staleTime: 30 * 1000,
    select: (data) => data || []
  });

  const fornecedoresQuery = useQuery({
    queryKey: ['/api/financas360/fornecedores'],
    staleTime: 60 * 1000,
    select: (data) => data || []
  });

  const produtosQuery = useQuery({
    queryKey: ['/api/financas360/produtos'],
    staleTime: 60 * 1000,
    select: (data) => data || []
  });

  // ===== MUTATIONS =====
  const createNotaMutation = useMutation({
    mutationFn: async (data: NotaFiscalFormData): Promise<NotaFiscal> => {
      return apiRequest('/api/financas360/notas-fiscais', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Nota fiscal criada',
        description: `Nota ${data.numero}/${data.serie} criada com sucesso.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/financas360/notas-fiscais'] });
      setState(prev => ({ ...prev, selectedNota: data, showForm: false }));
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar nota fiscal',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const updateNotaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<NotaFiscalFormData> }): Promise<NotaFiscal> => {
      return apiRequest(`/api/financas360/notas-fiscais/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Nota fiscal atualizada',
        description: 'Alterações salvas com sucesso.'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/financas360/notas-fiscais'] });
      setState(prev => ({ ...prev, selectedNota: data, showForm: false }));
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar nota fiscal',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const deleteNotaMutation = useMutation({
    mutationFn: async (id: number): Promise<void> => {
      return apiRequest(`/api/financas360/notas-fiscais/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: 'Nota fiscal excluída',
        description: 'Nota fiscal removida com sucesso.'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/financas360/notas-fiscais'] });
      setState(prev => ({ ...prev, selectedNota: null }));
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir nota fiscal',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const importXMLMutation = useMutation({
    mutationFn: async (file: File): Promise<NotaFiscal> => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/financas360/notas-fiscais/import-xml', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'XML importado',
        description: `Nota fiscal ${data.numero}/${data.serie} importada com sucesso.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/financas360/notas-fiscais'] });
      setState(prev => ({ ...prev, selectedNota: data, showImportDialog: false }));
    },
    onError: (error: any) => {
      toast({
        title: 'Erro na importação',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // ===== FILTERED DATA =====
  const filteredNotas = useMemo(() => {
    let filtered = notasQuery.data || [];

    // Search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(nota =>
        nota.numero.toLowerCase().includes(query) ||
        nota.fornecedor?.razaoSocial?.toLowerCase().includes(query) ||
        nota.chaveAcesso?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (state.statusFilter !== 'all') {
      filtered = filtered.filter(nota => nota.status === state.statusFilter);
    }

    // Tipo filter
    if (state.tipoFilter !== 'all') {
      filtered = filtered.filter(nota => nota.tipo === state.tipoFilter);
    }

    // Fornecedor filter
    if (state.fornecedorFilter) {
      filtered = filtered.filter(nota => nota.fornecedorId === state.fornecedorFilter);
    }

    // Date range filter
    if (state.dateRange.start || state.dateRange.end) {
      filtered = filtered.filter(nota => {
        const notaDate = new Date(nota.dataEmissao);
        if (state.dateRange.start && notaDate < state.dateRange.start) return false;
        if (state.dateRange.end && notaDate > state.dateRange.end) return false;
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (state.sortBy) {
        case 'dataEmissao':
          aValue = new Date(a.dataEmissao).getTime();
          bValue = new Date(b.dataEmissao).getTime();
          break;
        case 'numero':
          aValue = parseInt(a.numero) || 0;
          bValue = parseInt(b.numero) || 0;
          break;
        case 'valorTotal':
          aValue = a.valorTotal;
          bValue = b.valorTotal;
          break;
        case 'fornecedor':
          aValue = a.fornecedor?.razaoSocial || '';
          bValue = b.fornecedor?.razaoSocial || '';
          break;
        default:
          aValue = a[state.sortBy];
          bValue = b[state.sortBy];
      }
      
      if (state.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [notasQuery.data, state.searchQuery, state.statusFilter, state.tipoFilter, state.fornecedorFilter, state.dateRange, state.sortBy, state.sortOrder]);

  // ===== CALCULATIONS =====
  const calculations = useMemo(() => {
    const notas = filteredNotas;
    const totalValue = notas.reduce((sum, nota) => sum + nota.valorTotal, 0);
    const totalTaxes = notas.reduce((sum, nota) => sum + nota.valorImpostos, 0);
    const totalNet = totalValue - totalTaxes;
    const averageValue = notas.length > 0 ? totalValue / notas.length : 0;

    // Status distribution
    const statusCounts = notas.reduce((acc, nota) => {
      acc[nota.status] = (acc[nota.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: (count / notas.length) * 100
    }));

    // Monthly trend (last 12 months)
    const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
      
      const monthValue = notas
        .filter(nota => nota.dataEmissao.slice(0, 7) === monthKey)
        .reduce((sum, nota) => sum + nota.valorTotal, 0);

      return {
        month: date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }),
        value: monthValue
      };
    }).reverse();

    // Top fornecedores
    const fornecedorCounts = notas.reduce((acc, nota) => {
      const key = nota.fornecedor?.razaoSocial || 'N/A';
      if (!acc[key]) {
        acc[key] = { count: 0, value: 0 };
      }
      acc[key].count++;
      acc[key].value += nota.valorTotal;
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    const topFornecedores = Object.entries(fornecedorCounts)
      .map(([fornecedor, data]) => ({ fornecedor, ...data }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return {
      totalValue,
      totalTaxes,
      totalNet,
      averageValue,
      monthlyTrend,
      statusDistribution,
      topFornecedores
    };
  }, [filteredNotas]);

  // ===== ACTIONS =====
  const createNota = useCallback(async (data: NotaFiscalFormData): Promise<NotaFiscal> => {
    return createNotaMutation.mutateAsync(data);
  }, [createNotaMutation]);

  const updateNota = useCallback(async (id: number, data: Partial<NotaFiscalFormData>): Promise<NotaFiscal> => {
    return updateNotaMutation.mutateAsync({ id, data });
  }, [updateNotaMutation]);

  const deleteNota = useCallback(async (id: number): Promise<void> => {
    return deleteNotaMutation.mutateAsync(id);
  }, [deleteNotaMutation]);

  const duplicateNota = useCallback(async (id: number): Promise<NotaFiscal> => {
    const nota = notasQuery.data?.find(n => n.id === id);
    if (!nota) throw new Error('Nota não encontrada');
    
    const duplicateData: NotaFiscalFormData = {
      numero: '',
      serie: nota.serie,
      dataEmissao: new Date().toISOString().split('T')[0],
      fornecedorId: nota.fornecedorId,
      clienteId: nota.clienteId,
      tipo: nota.tipo,
      observacoes: nota.observacoes,
      itens: nota.itens.map(item => ({
        produtoId: item.produtoId,
        descricao: item.descricao,
        codigo: item.codigo,
        quantidade: item.quantidade,
        unidade: item.unidade,
        valorUnitario: item.valorUnitario,
        aliquotaICMS: item.aliquotaICMS,
        aliquotaIPI: item.aliquotaIPI,
        ncm: item.ncm,
        cfop: item.cfop
      })),
      impostos: nota.impostos?.map(imposto => ({
        tipo: imposto.tipo,
        baseCalculo: imposto.baseCalculo,
        aliquota: imposto.aliquota,
        observacoes: imposto.observacoes
      }))
    };
    
    return createNota(duplicateData);
  }, [notasQuery.data, createNota]);

  // Status operations
  const approveNota = useCallback(async (id: number): Promise<void> => {
    await updateNota(id, { status: 'aprovada' } as any);
  }, [updateNota]);

  const rejectNota = useCallback(async (id: number, reason: string): Promise<void> => {
    await updateNota(id, { status: 'rejeitada', observacoes: reason } as any);
  }, [updateNota]);

  const cancelNota = useCallback(async (id: number, reason: string): Promise<void> => {
    await updateNota(id, { status: 'cancelada', observacoes: reason } as any);
  }, [updateNota]);

  // Import operations
  const importXML = useCallback(async (file: File): Promise<NotaFiscal> => {
    return importXMLMutation.mutateAsync(file);
  }, [importXMLMutation]);

  const importCSV = useCallback(async (file: File): Promise<NotaFiscal[]> => {
    // Implementation for CSV import
    throw new Error('CSV import not implemented yet');
  }, []);

  // Export operations
  const exportPDF = useCallback(async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/financas360/notas-fiscais/${id}/export-pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (!response.ok) throw new Error('Erro no export');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nota-fiscal-${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: 'Erro no export',
        description: error.message,
        variant: 'destructive'
      });
    }
  }, [toast]);

  const exportExcel = useCallback(async (ids: number[]): Promise<void> => {
    // Implementation for Excel export
    console.log('Excel export for IDs:', ids);
  }, []);

  // Filter and search actions
  const search = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query, currentPage: 1 }));
  }, []);

  const filterByStatus = useCallback((status: NotaFiscal['status'] | 'all') => {
    setState(prev => ({ ...prev, statusFilter: status, currentPage: 1 }));
  }, []);

  const filterByTipo = useCallback((tipo: NotaFiscal['tipo'] | 'all') => {
    setState(prev => ({ ...prev, tipoFilter: tipo, currentPage: 1 }));
  }, []);

  const filterByFornecedor = useCallback((fornecedorId: number | null) => {
    setState(prev => ({ ...prev, fornecedorFilter: fornecedorId, currentPage: 1 }));
  }, []);

  const filterByDateRange = useCallback((range: { start?: Date; end?: Date }) => {
    setState(prev => ({ ...prev, dateRange: range, currentPage: 1 }));
  }, []);

  const sortNotas = useCallback((field: NotasFiscaisState['sortBy'], order: NotasFiscaisState['sortOrder']) => {
    setState(prev => ({ ...prev, sortBy: field, sortOrder: order }));
  }, []);

  // Selection and UI actions
  const selectNota = useCallback((nota: NotaFiscal | null) => {
    setState(prev => ({ ...prev, selectedNota: nota }));
  }, []);

  const toggleItemSelection = useCallback((id: number) => {
    setState(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.includes(id)
        ? prev.selectedItems.filter(item => item !== id)
        : [...prev.selectedItems, id]
    }));
  }, []);

  const selectAllItems = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedItems: filteredNotas.map(nota => nota.id)
    }));
  }, [filteredNotas]);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedItems: [] }));
  }, []);

  // Form management
  const showCreateForm = useCallback(() => {
    setState(prev => ({ ...prev, showForm: true, selectedNota: null }));
  }, []);

  const showEditForm = useCallback((nota: NotaFiscal) => {
    setState(prev => ({ ...prev, showForm: true, selectedNota: nota }));
  }, []);

  const hideForm = useCallback(() => {
    setState(prev => ({ ...prev, showForm: false, selectedNota: null }));
  }, []);

  const showImportDialog = useCallback(() => {
    setState(prev => ({ ...prev, showImportDialog: true }));
  }, []);

  const hideImportDialog = useCallback(() => {
    setState(prev => ({ ...prev, showImportDialog: false }));
  }, []);

  // Pagination
  const goToPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  }, []);

  const setItemsPerPage = useCallback((items: number) => {
    setState(prev => ({ ...prev, itemsPerPage: items, currentPage: 1 }));
  }, []);

  // Bulk operations
  const bulkDelete = useCallback(async (ids: number[]): Promise<void> => {
    for (const id of ids) {
      await deleteNota(id);
    }
    clearSelection();
  }, [deleteNota, clearSelection]);

  const bulkApprove = useCallback(async (ids: number[]): Promise<void> => {
    for (const id of ids) {
      await approveNota(id);
    }
    clearSelection();
  }, [approveNota, clearSelection]);

  const bulkExport = useCallback(async (ids: number[]): Promise<void> => {
    await exportExcel(ids);
  }, [exportExcel]);

  return {
    state,
    notas: {
      data: notasQuery.data || [],
      filteredData: filteredNotas,
      isLoading: notasQuery.isLoading,
      error: notasQuery.error?.message || null,
      refetch: notasQuery.refetch
    },
    fornecedores: {
      data: fornecedoresQuery.data || [],
      isLoading: fornecedoresQuery.isLoading,
      error: fornecedoresQuery.error?.message || null
    },
    produtos: {
      data: produtosQuery.data || [],
      isLoading: produtosQuery.isLoading,
      error: produtosQuery.error?.message || null
    },
    actions: {
      createNota,
      updateNota,
      deleteNota,
      duplicateNota,
      approveNota,
      rejectNota,
      cancelNota,
      importXML,
      importCSV,
      exportPDF,
      exportExcel,
      search,
      filterByStatus,
      filterByTipo,
      filterByFornecedor,
      filterByDateRange,
      sortNotas,
      selectNota,
      toggleItemSelection,
      selectAllItems,
      clearSelection,
      showCreateForm,
      showEditForm,
      hideForm,
      showImportDialog,
      hideImportDialog,
      goToPage,
      setItemsPerPage,
      bulkDelete,
      bulkApprove,
      bulkExport
    },
    calculations
  };
};