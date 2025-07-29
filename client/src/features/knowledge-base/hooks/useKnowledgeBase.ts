/**
 * HOOK: useKnowledgeBase
 * Gerencia estado e operações da base de conhecimento
 * Extraído de KnowledgeBaseManager.tsx para modularização
 */
import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  KnowledgeBaseState, 
  UseKnowledgeBaseReturn,
  KnowledgeBaseDoc,
  KnowledgeBaseCollection,
  FileUploadData,
  DocFormData,
  CollectionFormData,
  SearchDocumentsRequest
} from '../types';

export const useKnowledgeBase = (): UseKnowledgeBaseReturn => {
  // ===== EXTERNAL HOOKS =====
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ===== STATE =====
  const [state, setState] = useState<KnowledgeBaseState>({
    documents: [],
    collections: [],
    selectedDoc: null,
    selectedCollection: null,
    isLoading: false,
    isSaving: false,
    isUploading: false,
    searchQuery: '',
    selectedTags: [],
    selectedCollectionFilter: null,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    viewMode: 'grid',
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0
  });

  // ===== QUERIES =====
  const documentsQuery = useQuery({
    queryKey: ['/api/knowledge-base/documents'],
    staleTime: 30 * 1000,
    select: (data) => data || []
  });

  const collectionsQuery = useQuery({
    queryKey: ['/api/knowledge-base/collections'],
    staleTime: 60 * 1000,
    select: (data) => data || []
  });

  // ===== MUTATIONS =====
  const createDocumentMutation = useMutation({
    mutationFn: async (data: DocFormData): Promise<KnowledgeBaseDoc> => {
      return apiRequest('/api/knowledge-base/documents', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Documento criado',
        description: 'Documento criado com sucesso.'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge-base/documents'] });
      setState(prev => ({ ...prev, selectedDoc: data }));
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar documento',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<DocFormData> }): Promise<KnowledgeBaseDoc> => {
      return apiRequest(`/api/knowledge-base/documents/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Documento atualizado',
        description: 'Alterações salvas com sucesso.'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge-base/documents'] });
      setState(prev => ({ ...prev, selectedDoc: data }));
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar documento',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number): Promise<void> => {
      return apiRequest(`/api/knowledge-base/documents/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: 'Documento excluído',
        description: 'Documento removido com sucesso.'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge-base/documents'] });
      setState(prev => ({ ...prev, selectedDoc: null }));
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir documento',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (data: FileUploadData): Promise<KnowledgeBaseDoc> => {
      setState(prev => ({ ...prev, isUploading: true }));
      
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('title', data.title);
      formData.append('tags', JSON.stringify(data.tags));
      if (data.collectionId) {
        formData.append('collectionId', data.collectionId.toString());
      }
      if (data.extractText) {
        formData.append('extractText', 'true');
      }
      if (data.autoSummary) {
        formData.append('autoSummary', 'true');
      }
      if (data.processVectors) {
        formData.append('processVectors', 'true');
      }

      const response = await fetch('/api/knowledge-base/documents/upload', {
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
        title: 'Arquivo enviado',
        description: 'Arquivo processado e adicionado à base de conhecimento.'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge-base/documents'] });
      setState(prev => ({ ...prev, isUploading: false, selectedDoc: data }));
    },
    onError: (error: any) => {
      toast({
        title: 'Erro no upload',
        description: error.message,
        variant: 'destructive'
      });
      setState(prev => ({ ...prev, isUploading: false }));
    }
  });

  const createCollectionMutation = useMutation({
    mutationFn: async (data: CollectionFormData): Promise<KnowledgeBaseCollection> => {
      return apiRequest('/api/knowledge-base/collections', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Coleção criada',
        description: 'Coleção criada com sucesso.'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge-base/collections'] });
      setState(prev => ({ ...prev, selectedCollection: data }));
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar coleção',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // ===== FILTERED DATA =====
  const filteredDocuments = useMemo(() => {
    let filtered = documentsQuery.data || [];

    // Search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(query) ||
        doc.content.toLowerCase().includes(query) ||
        doc.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Tags filter
    if (state.selectedTags.length > 0) {
      filtered = filtered.filter(doc =>
        state.selectedTags.every(tag => doc.tags.includes(tag))
      );
    }

    // Collection filter
    if (state.selectedCollectionFilter) {
      filtered = filtered.filter(doc => doc.collectionId === state.selectedCollectionFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[state.sortBy];
      const bValue = b[state.sortBy];
      
      if (state.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [documentsQuery.data, state.searchQuery, state.selectedTags, state.selectedCollectionFilter, state.sortBy, state.sortOrder]);

  // ===== ACTIONS =====
  const createDocument = useCallback(async (data: DocFormData): Promise<KnowledgeBaseDoc> => {
    return createDocumentMutation.mutateAsync(data);
  }, [createDocumentMutation]);

  const updateDocument = useCallback(async (id: number, data: Partial<DocFormData>): Promise<KnowledgeBaseDoc> => {
    return updateDocumentMutation.mutateAsync({ id, data });
  }, [updateDocumentMutation]);

  const deleteDocument = useCallback(async (id: number): Promise<void> => {
    return deleteDocumentMutation.mutateAsync(id);
  }, [deleteDocumentMutation]);

  const duplicateDocument = useCallback(async (id: number): Promise<KnowledgeBaseDoc> => {
    const doc = documentsQuery.data?.find(d => d.id === id);
    if (!doc) throw new Error('Documento não encontrado');
    
    const duplicateData: DocFormData = {
      title: `${doc.title} (Cópia)`,
      content: doc.content,
      tags: [...doc.tags],
      collectionId: doc.collectionId || null,
      summary: doc.summary,
      metadata: doc.metadata
    };
    
    return createDocument(duplicateData);
  }, [documentsQuery.data, createDocument]);

  const uploadFile = useCallback(async (data: FileUploadData): Promise<KnowledgeBaseDoc> => {
    return uploadFileMutation.mutateAsync(data);
  }, [uploadFileMutation]);

  const downloadDocument = useCallback(async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/knowledge-base/documents/${id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (!response.ok) throw new Error('Erro no download');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `document-${id}.txt`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: 'Erro no download',
        description: error.message,
        variant: 'destructive'
      });
    }
  }, [toast]);

  const extractText = useCallback(async (id: number): Promise<string> => {
    try {
      const response = await apiRequest(`/api/knowledge-base/documents/${id}/extract-text`, {
        method: 'POST'
      });
      return response.text;
    } catch (error: any) {
      toast({
        title: 'Erro na extração',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  }, [toast]);

  const createCollection = useCallback(async (data: CollectionFormData): Promise<KnowledgeBaseCollection> => {
    return createCollectionMutation.mutateAsync(data);
  }, [createCollectionMutation]);

  const updateCollection = useCallback(async (id: number, data: Partial<CollectionFormData>): Promise<KnowledgeBaseCollection> => {
    // Implementation similar to updateDocument
    throw new Error('Not implemented yet');
  }, []);

  const deleteCollection = useCallback(async (id: number): Promise<void> => {
    // Implementation similar to deleteDocument
    throw new Error('Not implemented yet');
  }, []);

  // Search and filter actions
  const search = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query, currentPage: 1 }));
  }, []);

  const filterByTags = useCallback((tags: string[]) => {
    setState(prev => ({ ...prev, selectedTags: tags, currentPage: 1 }));
  }, []);

  const filterByCollection = useCallback((collectionId: number | null) => {
    setState(prev => ({ ...prev, selectedCollectionFilter: collectionId, currentPage: 1 }));
  }, []);

  const sortDocuments = useCallback((field: KnowledgeBaseState['sortBy'], order: KnowledgeBaseState['sortOrder']) => {
    setState(prev => ({ ...prev, sortBy: field, sortOrder: order }));
  }, []);

  // View actions
  const setViewMode = useCallback((mode: KnowledgeBaseState['viewMode']) => {
    setState(prev => ({ ...prev, viewMode: mode }));
  }, []);

  const selectDocument = useCallback((doc: KnowledgeBaseDoc | null) => {
    setState(prev => ({ ...prev, selectedDoc: doc }));
  }, []);

  const selectCollection = useCallback((collection: KnowledgeBaseCollection | null) => {
    setState(prev => ({ ...prev, selectedCollection: collection }));
  }, []);

  // Pagination
  const goToPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  }, []);

  const setItemsPerPage = useCallback((items: number) => {
    setState(prev => ({ ...prev, itemsPerPage: items, currentPage: 1 }));
  }, []);

  // Bulk actions
  const bulkDelete = useCallback(async (ids: number[]): Promise<void> => {
    for (const id of ids) {
      await deleteDocument(id);
    }
  }, [deleteDocument]);

  const bulkMove = useCallback(async (ids: number[], collectionId: number): Promise<void> => {
    for (const id of ids) {
      await updateDocument(id, { collectionId });
    }
  }, [updateDocument]);

  const bulkTag = useCallback(async (ids: number[], tags: string[]): Promise<void> => {
    for (const id of ids) {
      const doc = documentsQuery.data?.find(d => d.id === id);
      if (doc) {
        const newTags = [...new Set([...doc.tags, ...tags])];
        await updateDocument(id, { tags: newTags });
      }
    }
  }, [documentsQuery.data, updateDocument]);

  return {
    state,
    documents: {
      data: documentsQuery.data || [],
      filteredData: filteredDocuments,
      isLoading: documentsQuery.isLoading,
      error: documentsQuery.error?.message || null,
      refetch: documentsQuery.refetch
    },
    collections: {
      data: collectionsQuery.data || [],
      isLoading: collectionsQuery.isLoading,
      error: collectionsQuery.error?.message || null,
      refetch: collectionsQuery.refetch
    },
    actions: {
      createDocument,
      updateDocument,
      deleteDocument,
      duplicateDocument,
      uploadFile,
      downloadDocument,
      extractText,
      createCollection,
      updateCollection,
      deleteCollection,
      search,
      filterByTags,
      filterByCollection,
      sortDocuments,
      setViewMode,
      selectDocument,
      selectCollection,
      goToPage,
      setItemsPerPage,
      bulkDelete,
      bulkMove,
      bulkTag
    },
    search: {
      query: state.searchQuery,
      results: filteredDocuments,
      isSearching: false,
      suggestions: [],
      filters: {
        tags: state.selectedTags,
        collections: collectionsQuery.data || [],
        dateRange: {},
        fileTypes: []
      }
    },
    upload: {
      isUploading: state.isUploading,
      progress: 0,
      queue: [],
      errors: [],
      completed: 0,
      total: 0
    }
  };
};