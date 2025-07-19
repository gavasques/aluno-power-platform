/**
 * Product Suppliers Hook
 * 
 * SOLID Principles Applied:
 * - SRP: Single responsibility for product supplier state management
 * - OCP: Open for extension with new supplier operations
 * - LSP: Consistent hook interface
 * - ISP: Interface segregation with focused hook returns
 * - DIP: Depends on abstractions through API calls
 */

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { 
  ProductSupplier, 
  ProductSupplierStats, 
  ProductSupplierFormData, 
  SupplierOption,
  UseProductSuppliersReturn,
  UseSupplierSelectionReturn
} from '@/shared/types/productSupplier';

/**
 * Main hook for managing product suppliers
 */
export const useProductSuppliers = (productId: number): UseProductSuppliersReturn => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for product suppliers
  const {
    data: suppliers = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<ProductSupplier[]>({
    queryKey: ['product-suppliers', productId],
    queryFn: async () => {
      const response = await apiRequest(`/api/products/${productId}/suppliers`);
      return response.data;
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Query for supplier statistics
  const {
    data: supplierStats = {
      totalSuppliers: 0,
      activeSuppliers: 0,
      inactiveSuppliers: 0,
      primarySupplier: undefined,
      avgCost: 0,
      lowestCost: 0,
      highestCost: 0,
      avgLeadTime: 0
    }
  } = useQuery<ProductSupplierStats>({
    queryKey: ['product-suppliers-stats', productId],
    queryFn: async () => {
      const response = await apiRequest(`/api/products/${productId}/suppliers/stats`);
      return response.data;
    },
    enabled: !!productId && suppliers.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Add supplier mutation
  const addSupplierMutation = useMutation({
    mutationFn: async (data: ProductSupplierFormData) => {
      const response = await apiRequest(`/api/products/${productId}/suppliers`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-suppliers', productId] });
      queryClient.invalidateQueries({ queryKey: ['product-suppliers-stats', productId] });
      // Invalidate supplier products cache for bidirectional sync
      queryClient.invalidateQueries({ queryKey: ['supplier-products'] });
      toast({
        title: 'Fornecedor adicionado',
        description: 'Fornecedor foi adicionado com sucesso ao produto.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao adicionar fornecedor',
        description: error.message || 'Ocorreu um erro ao adicionar o fornecedor.',
        variant: 'destructive'
      });
    }
  });

  // Update supplier mutation
  const updateSupplierMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ProductSupplierFormData> }) => {
      const response = await apiRequest(`/api/products/${productId}/suppliers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-suppliers', productId] });
      queryClient.invalidateQueries({ queryKey: ['product-suppliers-stats', productId] });
      // Invalidate supplier products cache for bidirectional sync
      queryClient.invalidateQueries({ queryKey: ['supplier-products'] });
      toast({
        title: 'Fornecedor atualizado',
        description: 'Fornecedor foi atualizado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar fornecedor',
        description: error.message || 'Ocorreu um erro ao atualizar o fornecedor.',
        variant: 'destructive'
      });
    }
  });

  // Delete supplier mutation
  const deleteSupplierMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/products/${productId}/suppliers/${id}`, {
        method: 'DELETE'
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-suppliers', productId] });
      queryClient.invalidateQueries({ queryKey: ['product-suppliers-stats', productId] });
      // Invalidate supplier products cache for bidirectional sync
      queryClient.invalidateQueries({ queryKey: ['supplier-products'] });
      toast({
        title: 'Fornecedor removido',
        description: 'Fornecedor foi removido com sucesso do produto.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover fornecedor',
        description: error.message || 'Ocorreu um erro ao remover o fornecedor.',
        variant: 'destructive'
      });
    }
  });

  // Set primary supplier mutation
  const setPrimarySupplierMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/products/${productId}/suppliers/${id}/set-primary`, {
        method: 'PUT'
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-suppliers', productId] });
      queryClient.invalidateQueries({ queryKey: ['product-suppliers-stats', productId] });
      // Invalidate supplier products cache for bidirectional sync
      queryClient.invalidateQueries({ queryKey: ['supplier-products'] });
      toast({
        title: 'Fornecedor principal definido',
        description: 'Fornecedor foi definido como principal com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao definir fornecedor principal',
        description: error.message || 'Ocorreu um erro ao definir o fornecedor principal.',
        variant: 'destructive'
      });
    }
  });

  // Helper function to check if supplier is already linked
  const hasSupplier = (supplierId: number): boolean => {
    return suppliers.some(supplier => supplier.supplierId === supplierId);
  };

  return {
    // Data
    suppliers,
    supplierStats,
    stats: supplierStats, // Alias for compatibility
    
    // Loading states
    isLoading,
    isError,
    error: error as Error | null,
    
    // Mutation states
    isAdding: addSupplierMutation.isPending,
    isUpdating: updateSupplierMutation.isPending,
    isDeleting: deleteSupplierMutation.isPending,
    isSettingPrimary: setPrimarySupplierMutation.isPending,
    
    // Actions
    addSupplier: addSupplierMutation.mutateAsync,
    updateSupplier: async (id: number, data: Partial<ProductSupplierFormData>) => {
      return updateSupplierMutation.mutateAsync({ id, data });
    },
    deleteSupplier: deleteSupplierMutation.mutateAsync,
    setPrimarySupplier: setPrimarySupplierMutation.mutateAsync,
    hasSupplier,
    refetch
  };
};

/**
 * Hook for supplier selection (getting all available suppliers)
 */
export const useSupplierSelection = (): UseSupplierSelectionReturn => {
  const {
    data: suppliers = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<SupplierOption[]>({
    queryKey: ['suppliers-selection'],
    queryFn: async () => {
      const response = await apiRequest('/api/suppliers');
      return response.data.map((supplier: any) => ({
        id: supplier.id,
        tradeName: supplier.tradeName,
        corporateName: supplier.corporateName,
        logo: supplier.logo,
        description: supplier.description,
        active: supplier.active ?? true
      }));
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  const getSupplierById = (id: number): SupplierOption | null => {
    return suppliers.find(supplier => supplier.id === id) || null;
  };

  return {
    suppliers,
    isLoading,
    isError,
    error: error as Error | null,
    getSupplierById,
    refetch
  };
};

/**
 * Hook for managing product supplier operations in bulk
 */
export const useProductSupplierBulkOperations = (productId: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const bulkDeleteMutation = useMutation({
    mutationFn: async (supplierIds: number[]) => {
      const promises = supplierIds.map(id => 
        apiRequest(`/api/products/${productId}/suppliers/${id}`, {
          method: 'DELETE'
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-suppliers', productId] });
      queryClient.invalidateQueries({ queryKey: ['product-suppliers-stats', productId] });
      toast({
        title: 'Fornecedores removidos',
        description: 'Fornecedores selecionados foram removidos com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover fornecedores',
        description: error.message || 'Ocorreu um erro ao remover os fornecedores.',
        variant: 'destructive'
      });
    }
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ supplierIds, data }: { supplierIds: number[]; data: Partial<ProductSupplierFormData> }) => {
      const promises = supplierIds.map(id => 
        apiRequest(`/api/products/${productId}/suppliers/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-suppliers', productId] });
      queryClient.invalidateQueries({ queryKey: ['product-suppliers-stats', productId] });
      toast({
        title: 'Fornecedores atualizados',
        description: 'Fornecedores selecionados foram atualizados com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar fornecedores',
        description: error.message || 'Ocorreu um erro ao atualizar os fornecedores.',
        variant: 'destructive'
      });
    }
  });

  return {
    bulkDelete: bulkDeleteMutation.mutateAsync,
    bulkUpdate: bulkUpdateMutation.mutateAsync,
    isBulkDeleting: bulkDeleteMutation.isPending,
    isBulkUpdating: bulkUpdateMutation.isPending
  };
};