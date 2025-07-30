/**
 * HOOK: useParceiros
 * Gerencia estado e operações de parceiros de negócios
 * Extraído de ParceirosManager.tsx para modularização
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  ParceirosManagerState,
  UseParceirosReturn,
  Parceiro,
  ParceiroFormData,
  ContatoFormData,
  ContratoFormData,
  MovimentacaoFormData,
  ParceiroCategoria,
  ParceiroStatus,
  ParceiroTipo,
  ParceirosSort,
  ParceiroTab,
  DocumentoTipo,
  MovimentacaoTotals
} from '../types/parceiros';

export const useParceiros = (): UseParceirosReturn => {
  // ===== EXTERNAL HOOKS =====
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ===== STATE =====
  const [state, setState] = useState<ParceirosManagerState>({
    parceiros: [],
    selectedParceiro: null,
    isLoading: false,
    isSaving: false,
    isDeleting: false,
    searchQuery: '',
    categoriaFilter: 'all',
    statusFilter: 'all',
    tipoFilter: 'all',
    sortBy: 'razaoSocial',
    sortOrder: 'asc',
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    selectedItems: [],
    showForm: false,
    showContatoForm: false,
    showContratoForm: false,
    showMovimentacaoForm: false,
    showDocumentUpload: false,
    activeTab: 'dados_basicos',
    errors: {},
    validationErrors: [],
    isDirty: false
  });

  // ===== QUERIES =====
  const parceirosQuery = useQuery({
    queryKey: ['/api/parceiros', {
      search: state.searchQuery,
      categoria: state.categoriaFilter,
      status: state.statusFilter,
      tipo: state.tipoFilter,
      page: state.currentPage,
      limit: state.itemsPerPage,
      sortBy: state.sortBy,
      sortOrder: state.sortOrder
    }],
    staleTime: 30 * 1000,
    select: (data) => data || { parceiros: [], total: 0 }
  });

  const contatosQuery = useQuery({
    queryKey: ['/api/parceiros', state.selectedParceiro?.id, 'contatos'],
    enabled: !!state.selectedParceiro?.id,
    staleTime: 60 * 1000,
    select: (data) => data || []
  });

  const contratosQuery = useQuery({
    queryKey: ['/api/parceiros', state.selectedParceiro?.id, 'contratos'],
    enabled: !!state.selectedParceiro?.id,
    staleTime: 60 * 1000,
    select: (data) => data || []
  });

  const movimentacoesQuery = useQuery({
    queryKey: ['/api/parceiros', state.selectedParceiro?.id, 'movimentacoes'],
    enabled: !!state.selectedParceiro?.id,
    staleTime: 30 * 1000,
    select: (data) => data || []
  });

  const documentosQuery = useQuery({
    queryKey: ['/api/parceiros', state.selectedParceiro?.id, 'documentos'],
    enabled: !!state.selectedParceiro?.id,
    staleTime: 60 * 1000,
    select: (data) => data || []
  });

  // ===== MUTATIONS =====
  const createParceiroMutation = useMutation({
    mutationFn: async (data: ParceiroFormData) => {
      return apiRequest('/api/parceiros', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Parceiro criado',
        description: `${data.razaoSocial} foi criado com sucesso.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/parceiros'] });
      setState(prev => ({ ...prev, showForm: false, isDirty: false }));
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar parceiro',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const updateParceiroMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ParceiroFormData> }) => {
      return apiRequest(`/api/parceiros/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Parceiro atualizado',
        description: `${data.razaoSocial} foi atualizado com sucesso.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/parceiros'] });
      setState(prev => ({ ...prev, showForm: false, isDirty: false, selectedParceiro: data }));
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar parceiro',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const deleteParceiroMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/parceiros/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: 'Parceiro excluído',
        description: 'Parceiro foi excluído com sucesso.'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/parceiros'] });
      setState(prev => ({ ...prev, selectedParceiro: null }));
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir parceiro',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      return apiRequest('/api/parceiros/bulk-delete', {
        method: 'DELETE',
        body: JSON.stringify({ ids })
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Parceiros excluídos',
        description: `${data.deleted} parceiro(s) excluído(s) com sucesso.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/parceiros'] });
      setState(prev => ({ ...prev, selectedItems: [] }));
    },
    onError: (error: any) => {
      toast({
        title: 'Erro na exclusão em lote',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Contact mutations
  const createContatoMutation = useMutation({
    mutationFn: async (data: ContatoFormData) => {
      if (!state.selectedParceiro) throw new Error('Nenhum parceiro selecionado');
      return apiRequest(`/api/parceiros/${state.selectedParceiro.id}/contatos`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({ title: 'Contato adicionado com sucesso' });
      queryClient.invalidateQueries({ queryKey: ['/api/parceiros', state.selectedParceiro?.id, 'contatos'] });
      setState(prev => ({ ...prev, showContatoForm: false }));
    }
  });

  const updateContatoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ContatoFormData> }) => {
      if (!state.selectedParceiro) throw new Error('Nenhum parceiro selecionado');
      return apiRequest(`/api/parceiros/${state.selectedParceiro.id}/contatos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({ title: 'Contato atualizado com sucesso' });
      queryClient.invalidateQueries({ queryKey: ['/api/parceiros', state.selectedParceiro?.id, 'contatos'] });
    }
  });

  const deleteContatoMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!state.selectedParceiro) throw new Error('Nenhum parceiro selecionado');
      return apiRequest(`/api/parceiros/${state.selectedParceiro.id}/contatos/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({ title: 'Contato excluído com sucesso' });
      queryClient.invalidateQueries({ queryKey: ['/api/parceiros', state.selectedParceiro?.id, 'contatos'] });
    }
  });

  // Contract mutations  
  const createContratoMutation = useMutation({
    mutationFn: async (data: ContratoFormData) => {
      if (!state.selectedParceiro) throw new Error('Nenhum parceiro selecionado');
      return apiRequest(`/api/parceiros/${state.selectedParceiro.id}/contratos`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({ title: 'Contrato criado com sucesso' });
      queryClient.invalidateQueries({ queryKey: ['/api/parceiros', state.selectedParceiro?.id, 'contratos'] });
      setState(prev => ({ ...prev, showContratoForm: false }));
    }
  });

  const updateContratoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ContratoFormData> }) => {
      if (!state.selectedParceiro) throw new Error('Nenhum parceiro selecionado');
      return apiRequest(`/api/parceiros/${state.selectedParceiro.id}/contratos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({ title: 'Contrato atualizado com sucesso' });
      queryClient.invalidateQueries({ queryKey: ['/api/parceiros', state.selectedParceiro?.id, 'contratos'] });
    }
  });

  const deleteContratoMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!state.selectedParceiro) throw new Error('Nenhum parceiro selecionado');
      return apiRequest(`/api/parceiros/${state.selectedParceiro.id}/contratos/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({ title: 'Contrato excluído com sucesso' });
      queryClient.invalidateQueries({ queryKey: ['/api/parceiros', state.selectedParceiro?.id, 'contratos'] });
    }
  });

  // Movement mutations
  const createMovimentacaoMutation = useMutation({
    mutationFn: async (data: MovimentacaoFormData) => {
      if (!state.selectedParceiro) throw new Error('Nenhum parceiro selecionado');
      return apiRequest(`/api/parceiros/${state.selectedParceiro.id}/movimentacoes`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({ title: 'Movimentação criada com sucesso' });
      queryClient.invalidateQueries({ queryKey: ['/api/parceiros', state.selectedParceiro?.id, 'movimentacoes'] });
      setState(prev => ({ ...prev, showMovimentacaoForm: false }));
    }
  });

  const updateMovimentacaoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<MovimentacaoFormData> }) => {
      if (!state.selectedParceiro) throw new Error('Nenhum parceiro selecionado');
      return apiRequest(`/api/parceiros/${state.selectedParceiro.id}/movimentacoes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({ title: 'Movimentação atualizada com sucesso' });
      queryClient.invalidateQueries({ queryKey: ['/api/parceiros', state.selectedParceiro?.id, 'movimentacoes'] });
    }
  });

  const deleteMovimentacaoMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!state.selectedParceiro) throw new Error('Nenhum parceiro selecionado');
      return apiRequest(`/api/parceiros/${state.selectedParceiro.id}/movimentacoes/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({ title: 'Movimentação excluída com sucesso' });
      queryClient.invalidateQueries({ queryKey: ['/api/parceiros', state.selectedParceiro?.id, 'movimentacoes'] });
    }
  });

  // Document mutations
  const uploadDocumentosMutation = useMutation({
    mutationFn: async ({ files, tipo }: { files: File[]; tipo: DocumentoTipo }) => {
      if (!state.selectedParceiro) throw new Error('Nenhum parceiro selecionado');
      
      const formData = new FormData();
      files.forEach(file => formData.append('documentos', file));
      formData.append('tipo', tipo);

      const response = await fetch(`/api/parceiros/${state.selectedParceiro.id}/documentos/upload`, {
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
        title: 'Documentos enviados',
        description: `${data.uploaded} documento(s) enviado(s) com sucesso.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/parceiros', state.selectedParceiro?.id, 'documentos'] });
      setState(prev => ({ ...prev, showDocumentUpload: false }));
    },
    onError: (error: any) => {
      toast({
        title: 'Erro no upload',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const deleteDocumentoMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!state.selectedParceiro) throw new Error('Nenhum parceiro selecionado');
      return apiRequest(`/api/parceiros/${state.selectedParceiro.id}/documentos/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({ title: 'Documento excluído com sucesso' });
      queryClient.invalidateQueries({ queryKey: ['/api/parceiros', state.selectedParceiro?.id, 'documentos'] });
    }
  });

  // ===== COMPUTED VALUES =====
  const filteredParceiros = useMemo(() => {
    let filtered = parceirosQuery.data?.parceiros || [];

    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(parceiro => 
        parceiro.razaoSocial.toLowerCase().includes(query) ||
        parceiro.nomeFantasia?.toLowerCase().includes(query) ||
        parceiro.cnpj.includes(query)
      );
    }

    if (state.categoriaFilter !== 'all') {
      filtered = filtered.filter(parceiro => parceiro.categoria === state.categoriaFilter);
    }

    if (state.statusFilter !== 'all') {
      filtered = filtered.filter(parceiro => parceiro.status === state.statusFilter);
    }

    if (state.tipoFilter !== 'all') {
      filtered = filtered.filter(parceiro => parceiro.tipo === state.tipoFilter);
    }

    return filtered;
  }, [parceirosQuery.data?.parceiros, state.searchQuery, state.categoriaFilter, state.statusFilter, state.tipoFilter]);

  const movimentacaoTotals = useMemo((): MovimentacaoTotals => {
    const movimentacoes = movimentacoesQuery.data || [];
    
    return movimentacoes.reduce((totals, mov) => {
      switch (mov.tipo) {
        case 'receita':
          totals.receitas += mov.valor;
          break;
        case 'despesa':
          totals.despesas += mov.valor;
          break;
        case 'comissao':
          totals.comissoes += mov.valor;
          break;
      }

      if (mov.status === 'pendente') {
        totals.pendentes += mov.valor;
      } else if (mov.status === 'vencido') {
        totals.vencidas += mov.valor;
      }

      return totals;
    }, {
      receitas: 0,
      despesas: 0,
      saldo: 0,
      comissoes: 0,
      pendentes: 0,
      vencidas: 0
    });
  }, [movimentacoesQuery.data]);

  // Update saldo
  movimentacaoTotals.saldo = movimentacaoTotals.receitas - movimentacaoTotals.despesas;

  // ===== ACTIONS =====
  const actions = {
    // CRUD operations
    createParceiro: useCallback(async (data: ParceiroFormData) => {
      setState(prev => ({ ...prev, isSaving: true }));
      try {
        const result = await createParceiroMutation.mutateAsync(data);
        return result;
      } finally {
        setState(prev => ({ ...prev, isSaving: false }));
      }
    }, [createParceiroMutation]),

    updateParceiro: useCallback(async (id: number, data: Partial<ParceiroFormData>) => {
      setState(prev => ({ ...prev, isSaving: true }));
      try {
        const result = await updateParceiroMutation.mutateAsync({ id, data });
        return result;
      } finally {
        setState(prev => ({ ...prev, isSaving: false }));
      }
    }, [updateParceiroMutation]),

    deleteParceiro: useCallback(async (id: number) => {
      setState(prev => ({ ...prev, isDeleting: true }));
      try {
        await deleteParceiroMutation.mutateAsync(id);
      } finally {
        setState(prev => ({ ...prev, isDeleting: false }));
      }
    }, [deleteParceiroMutation]),

    bulkDelete: useCallback(async (ids: number[]) => {
      setState(prev => ({ ...prev, isDeleting: true }));
      try {
        await bulkDeleteMutation.mutateAsync(ids);
      } finally {
        setState(prev => ({ ...prev, isDeleting: false }));
      }
    }, [bulkDeleteMutation]),

    // Selection and UI
    selectParceiro: useCallback((parceiro: Parceiro | null) => {
      setState(prev => ({ ...prev, selectedParceiro: parceiro, activeTab: 'dados_basicos' }));
    }, []),

    toggleItemSelection: useCallback((id: number) => {
      setState(prev => ({
        ...prev,
        selectedItems: prev.selectedItems.includes(id)
          ? prev.selectedItems.filter(itemId => itemId !== id)
          : [...prev.selectedItems, id]
      }));
    }, []),

    selectAllItems: useCallback(() => {
      setState(prev => ({
        ...prev,
        selectedItems: filteredParceiros.map(p => p.id)
      }));
    }, [filteredParceiros]),

    clearSelection: useCallback(() => {
      setState(prev => ({ ...prev, selectedItems: [] }));
    }, []),

    // Search and filters
    search: useCallback((query: string) => {
      setState(prev => ({ ...prev, searchQuery: query, currentPage: 1 }));
    }, []),

    filterByCategoria: useCallback((categoria: ParceiroCategoria | 'all') => {
      setState(prev => ({ ...prev, categoriaFilter: categoria, currentPage: 1 }));
    }, []),

    filterByStatus: useCallback((status: ParceiroStatus | 'all') => {
      setState(prev => ({ ...prev, statusFilter: status, currentPage: 1 }));
    }, []),

    filterByTipo: useCallback((tipo: ParceiroTipo | 'all') => {
      setState(prev => ({ ...prev, tipoFilter: tipo, currentPage: 1 }));
    }, []),

    sortBy: useCallback((field: ParceirosSort, order: 'asc' | 'desc' = 'asc') => {
      setState(prev => ({ ...prev, sortBy: field, sortOrder: order }));
    }, []),

    // Pagination
    setPage: useCallback((page: number) => {
      setState(prev => ({ ...prev, currentPage: page }));
    }, []),

    setItemsPerPage: useCallback((items: number) => {
      setState(prev => ({ ...prev, itemsPerPage: items, currentPage: 1 }));
    }, []),

    // Forms and modals
    showCreateForm: useCallback(() => {
      setState(prev => ({ ...prev, showForm: true, selectedParceiro: null }));
    }, []),

    showEditForm: useCallback((parceiro: Parceiro) => {
      setState(prev => ({ ...prev, showForm: true, selectedParceiro: parceiro }));
    }, []),

    hideForm: useCallback(() => {
      setState(prev => ({ ...prev, showForm: false, errors: {}, validationErrors: [], isDirty: false }));
    }, []),

    showContatoForm: useCallback(() => {
      setState(prev => ({ ...prev, showContatoForm: true }));
    }, []),

    hideContatoForm: useCallback(() => {
      setState(prev => ({ ...prev, showContatoForm: false }));
    }, []),

    showContratoForm: useCallback(() => {
      setState(prev => ({ ...prev, showContratoForm: true }));
    }, []),

    hideContratoForm: useCallback(() => {
      setState(prev => ({ ...prev, showContratoForm: false }));
    }, []),

    showMovimentacaoForm: useCallback(() => {
      setState(prev => ({ ...prev, showMovimentacaoForm: true }));
    }, []),

    hideMovimentacaoForm: useCallback(() => {
      setState(prev => ({ ...prev, showMovimentacaoForm: false }));
    }, []),

    showDocumentUpload: useCallback(() => {
      setState(prev => ({ ...prev, showDocumentUpload: true }));
    }, []),

    hideDocumentUpload: useCallback(() => {
      setState(prev => ({ ...prev, showDocumentUpload: false }));
    }, []),

    // Tabs
    setActiveTab: useCallback((tab: ParceiroTab) => {
      setState(prev => ({ ...prev, activeTab: tab }));
    }, []),

    // Validation
    validate: useCallback(() => {
      // TODO: Implement validation logic
      return true;
    }, []),

    clearErrors: useCallback(() => {
      setState(prev => ({ ...prev, errors: {}, validationErrors: [] }));
    }, [])
  };

  // ===== RETURN OBJECT =====
  return {
    state,
    parceiros: {
      data: parceirosQuery.data?.parceiros || [],
      filteredData: filteredParceiros,
      isLoading: parceirosQuery.isLoading,
      error: parceirosQuery.error?.message || null,
      refetch: parceirosQuery.refetch
    },
    actions,
    contatos: {
      data: contatosQuery.data || [],
      create: createContatoMutation.mutateAsync,
      update: ({ id, data }) => updateContatoMutation.mutateAsync({ id, data }),
      delete: deleteContatoMutation.mutateAsync
    },
    contratos: {
      data: contratosQuery.data || [],
      create: createContratoMutation.mutateAsync,  
      update: ({ id, data }) => updateContratoMutation.mutateAsync({ id, data }),
      delete: deleteContratoMutation.mutateAsync,
      getVencidos: () => {
        const contratos = contratosQuery.data || [];
        const hoje = new Date();
        return contratos.filter(contrato => 
          contrato.dataVencimento && new Date(contrato.dataVencimento) < hoje
        );
      },
      getProximosVencimento: (dias: number) => {
        const contratos = contratosQuery.data || [];
        const limite = new Date();
        limite.setDate(limite.getDate() + dias);
        return contratos.filter(contrato => 
          contrato.dataVencimento && 
          new Date(contrato.dataVencimento) <= limite &&
          new Date(contrato.dataVencimento) >= new Date()
        );
      }
    },
    movimentacoes: {
      data: movimentacoesQuery.data || [],
      create: createMovimentacaoMutation.mutateAsync,
      update: ({ id, data }) => updateMovimentacaoMutation.mutateAsync({ id, data }),
      delete: deleteMovimentacaoMutation.mutateAsync,
      getTotals: () => movimentacaoTotals,
      getByPeriodo: (inicio: string, fim: string) => {
        const movimentacoes = movimentacoesQuery.data || [];
        const dataInicio = new Date(inicio);
        const dataFim = new Date(fim);
        return movimentacoes.filter(mov => {
          const dataMovimentacao = new Date(mov.dataMovimentacao);
          return dataMovimentacao >= dataInicio && dataMovimentacao <= dataFim;
        });
      }
    },
    documentos: {
      data: documentosQuery.data || [],
      upload: ({ files, tipo }) => uploadDocumentosMutation.mutateAsync({ files, tipo }),
      delete: deleteDocumentoMutation.mutateAsync,
      getVencidos: () => {
        const documentos = documentosQuery.data || [];
        const hoje = new Date();
        return documentos.filter(doc => 
          doc.dataVencimento && new Date(doc.dataVencimento) < hoje
        );
      },
      getProximosVencimento: (dias: number) => {
        const documentos = documentosQuery.data || [];
        const limite = new Date();
        limite.setDate(limite.getDate() + dias);
        return documentos.filter(doc => 
          doc.dataVencimento && 
          new Date(doc.dataVencimento) <= limite &&
          new Date(doc.dataVencimento) >= new Date()
        );
      }
    }
  };
};