import { useCrudQuery } from '@/hooks/useCrudQuery';
import { productService } from '../services/ProductService';
import type { Product, InsertProduct } from '@/types/product';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

/**
 * Hook Unificado de Produtos - Refatorado
 * 
 * Substitui ProductContext.tsx eliminando 139 linhas de código duplicado
 * Usa useCrudQuery padronizado para operações CRUD consistentes
 * 
 * Benefícios:
 * - Elimina necessidade de Provider/Context
 * - Operações CRUD padronizadas com toast notifications
 * - Type-safe com TypeScript
 * - Cache e invalidação automática
 * - Suporte a busca, filtros e paginação
 * - Operações bulk incluídas
 * - Hooks especializados para funcionalidades específicas
 */
export function useProducts() {
  return useCrudQuery('products', productService, {
    successMessages: {
      create: 'Produto criado com sucesso',
      update: 'Produto atualizado com sucesso',
      delete: 'Produto excluído com sucesso',
    },
    errorMessages: {
      create: 'Erro ao criar produto',
      update: 'Erro ao atualizar produto',
      delete: 'Erro ao excluir produto',
    },
    defaultQueryOptions: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
      structuralSharing: true,
    }
  });
}

/**
 * Hook específico para gerenciamento de canais de um produto
 */
export function useProductChannels(productId: number) {
  const queryClient = useQueryClient();
  
  const updateChannelsMutation = useMutation({
    mutationFn: (channels: any[]) => productService.updateChannels(productId, channels),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', productId] });
      toast({
        title: "Sucesso",
        description: "Canais atualizados com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar canais",
        variant: "destructive",
      });
    },
  });

  const bulkUpdateChannelsMutation = useMutation({
    mutationFn: (updates: Array<{id: number, channels: any}>) => 
      productService.bulkUpdateChannels(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Sucesso",
        description: "Canais atualizados em lote com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar canais em lote",
        variant: "destructive",
      });
    },
  });

  return {
    updateChannels: updateChannelsMutation,
    bulkUpdateChannels: bulkUpdateChannelsMutation,
  };
}

/**
 * Hook específico para gerenciamento de custos de um produto
 */
export function useProductCosts(productId: number) {
  const queryClient = useQueryClient();
  
  const updateCostsMutation = useMutation({
    mutationFn: (costs: any) => productService.updateCosts(productId, costs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', productId] });
      toast({
        title: "Sucesso",
        description: "Custos atualizados com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar custos",
        variant: "destructive",
      });
    },
  });

  return {
    updateCosts: updateCostsMutation,
  };
}

/**
 * Hook para toggle de status de produtos
 */
export function useProductStatus() {
  const queryClient = useQueryClient();
  
  const toggleStatusMutation = useMutation({
    mutationFn: (id: number) => productService.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Sucesso",
        description: "Status do produto alterado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar status do produto",
        variant: "destructive",
      });
    },
  });

  return {
    toggleStatus: toggleStatusMutation,
  };
}

/**
 * Hook para busca avançada de produtos
 */
export function useProductSearch() {
  const queryClient = useQueryClient();
  
  const searchMutation = useMutation({
    mutationFn: (params: {
      search?: string;
      brand?: string;
      category?: string;
      active?: boolean;
      supplierId?: number;
    }) => productService.searchProducts(params),
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao buscar produtos",
        variant: "destructive",
      });
    },
  });

  return {
    searchProducts: searchMutation,
  };
}

/**
 * Hook para operações de importação/exportação
 */
export function useProductImportExport() {
  const queryClient = useQueryClient();
  
  const exportMutation = useMutation({
    mutationFn: (format: 'excel' | 'csv' = 'excel') => productService.exportProducts(format),
    onSuccess: (blob, format) => {
      // Criar URL para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `produtos.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Sucesso",
        description: "Produtos exportados com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao exportar produtos",
        variant: "destructive",
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => productService.importProducts(file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      if (result.errors.length > 0) {
        toast({
          title: "Importação Concluída com Avisos",
          description: `${result.success} produtos importados. ${result.errors.length} erros encontrados.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: `${result.success} produtos importados com sucesso`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao importar produtos",
        variant: "destructive",
      });
    },
  });

  return {
    exportProducts: exportMutation,
    importProducts: importMutation,
  };
}

/**
 * Hook para estatísticas de produtos
 */
export function useProductStats() {
  const queryClient = useQueryClient();
  
  const statsMutation = useMutation({
    mutationFn: () => productService.getStats(),
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar estatísticas",
        variant: "destructive",
      });
    },
  });

  return {
    getStats: statsMutation,
  };
}

/**
 * Hook legado para compatibilidade com código existente
 * @deprecated Use useProducts() diretamente
 */
export function useProductContext() {
  console.warn('useProductContext is deprecated. Use useProducts() directly.');
  
  const {
    useGetAll,
    useGetById,
    useCreate,
    useUpdate,
    useDelete,
    invalidateQueries,
  } = useProducts();
  
  const { data: products = [], isLoading: loading, error } = useGetAll();
  const createMutation = useCreate();
  const updateMutation = useUpdate();
  const deleteMutation = useDelete();
  const { toggleStatus } = useProductStatus();

  // Métodos compatíveis com interface antiga
  const addProduct = async (product: InsertProduct): Promise<void> => {
    await createMutation.mutateAsync(product);
  };

  const updateProduct = async (id: string, product: Partial<InsertProduct>): Promise<void> => {
    await updateMutation.mutateAsync({ id: parseInt(id), data: product });
  };

  const deleteProduct = async (id: string): Promise<void> => {
    await deleteMutation.mutateAsync(parseInt(id));
  };

  const toggleProductStatus = async (id: string): Promise<void> => {
    await toggleStatus.mutateAsync(parseInt(id));
  };

  const getProductById = (id: string): Product | undefined => {
    return products.find(product => product.id === parseInt(id));
  };

  const searchProducts = (query: string): Product[] => {
    if (!query) return products;
    return products.filter(product =>
      product.name?.toLowerCase().includes(query.toLowerCase()) ||
      (typeof product.descriptions === 'object' && 
       product.descriptions?.description?.toLowerCase().includes(query.toLowerCase()))
    );
  };

  const refetch = () => {
    invalidateQueries();
  };

  return {
    products,
    loading,
    error: error?.message || null,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    getProductById,
    searchProducts,
    refetch,
  };
}