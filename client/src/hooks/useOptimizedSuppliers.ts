/**
 * useOptimizedSuppliers - High-performance hook for 400,000+ suppliers
 * 
 * Features:
 * - Optimized pagination with caching
 * - Debounced search to prevent excessive API calls
 * - Performance monitoring
 * - Memory-efficient data structures
 * - Automatic cache invalidation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { apiRequest } from '@/lib/queryClient';

interface UseOptimizedSuppliersOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  country?: string;
  state?: string;
  status?: string;
  sortBy?: 'name' | 'category' | 'country' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  enabled?: boolean;
  prefetch?: boolean;
}

interface SupplierStats {
  total: number;
  verified: number;
  byCategory: Record<string, number>;
  byCountry: Record<string, number>;
  byStatus: Record<string, number>;
  activeSuppliers: number;
}

interface PaginatedSuppliers {
  suppliers: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  stats: SupplierStats;
}

interface OptimizedSupplierService {
  getPaginated: (options: UseOptimizedSuppliersOptions) => Promise<PaginatedSuppliers>;
  getStats: () => Promise<SupplierStats>;
  search: (query: string, limit?: number) => Promise<any[]>;
  getDetails: (id: number) => Promise<any>;
  bulkUpdateStatus: (supplierIds: number[], status: string) => Promise<{ updatedCount: number }>;
  warmupCache: () => Promise<void>;
  invalidateCache: () => Promise<void>;
}

// Optimized supplier service with proper API calls
const optimizedSupplierService: OptimizedSupplierService = {
  async getPaginated(options: UseOptimizedSuppliersOptions): Promise<PaginatedSuppliers> {
    const response = await apiRequest('/api/suppliers/optimized', {
      method: 'GET',
      params: options,
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch suppliers');
    }
    
    return response.data;
  },

  async getStats(): Promise<SupplierStats> {
    const response = await apiRequest('/api/suppliers/stats', {
      method: 'GET',
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch supplier stats');
    }
    
    return response.data;
  },

  async search(query: string, limit = 20): Promise<any[]> {
    const response = await apiRequest('/api/suppliers/search', {
      method: 'GET',
      params: { q: query, limit },
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to search suppliers');
    }
    
    return response.data;
  },

  async getDetails(id: number): Promise<any> {
    const response = await apiRequest(`/api/suppliers/${id}/details`, {
      method: 'GET',
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch supplier details');
    }
    
    return response.data;
  },

  async bulkUpdateStatus(supplierIds: number[], status: string): Promise<{ updatedCount: number }> {
    const response = await apiRequest('/api/suppliers/bulk-status', {
      method: 'PUT',
      body: { supplierIds, status },
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to update supplier status');
    }
    
    return response.data;
  },

  async warmupCache(): Promise<void> {
    const response = await apiRequest('/api/suppliers/warmup-cache', {
      method: 'POST',
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to warm up cache');
    }
  },

  async invalidateCache(): Promise<void> {
    const response = await apiRequest('/api/suppliers/cache', {
      method: 'DELETE',
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to invalidate cache');
    }
  },
};

export function useOptimizedSuppliers(options: UseOptimizedSuppliersOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    page = 1,
    limit = 50,
    search,
    category,
    country,
    state,
    status,
    sortBy = 'name',
    sortOrder = 'asc',
    enabled = true,
    prefetch = false,
  } = options;

  // Debounce search to prevent excessive API calls
  const debouncedSearch = useDebounce(search, 500);

  // Generate query key for caching
  const queryKey = useMemo(() => [
    '/api/suppliers/optimized',
    page,
    limit,
    debouncedSearch,
    category,
    country,
    state,
    status,
    sortBy,
    sortOrder,
  ], [page, limit, debouncedSearch, category, country, state, status, sortBy, sortOrder]);

  // Main paginated suppliers query
  const {
    data: paginatedData,
    isLoading,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => optimizedSupplierService.getPaginated({
      page,
      limit,
      search: debouncedSearch,
      category,
      country,
      state,
      status,
      sortBy,
      sortOrder,
    }),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Supplier statistics query
  const {
    data: stats,
    isLoading: isStatsLoading,
  } = useQuery({
    queryKey: ['/api/suppliers/stats'],
    queryFn: optimizedSupplierService.getStats,
    enabled,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Prefetch next page if enabled
  const prefetchNextPage = useCallback(async () => {
    if (prefetch && paginatedData?.hasMore) {
      await queryClient.prefetchQuery({
        queryKey: [
          '/api/suppliers/optimized',
          page + 1,
          limit,
          debouncedSearch,
          category,
          country,
          state,
          status,
          sortBy,
          sortOrder,
        ],
        queryFn: () => optimizedSupplierService.getPaginated({
          page: page + 1,
          limit,
          search: debouncedSearch,
          category,
          country,
          state,
          status,
          sortBy,
          sortOrder,
        }),
        staleTime: 2 * 60 * 1000,
      });
    }
  }, [
    prefetch,
    paginatedData?.hasMore,
    page,
    limit,
    debouncedSearch,
    category,
    country,
    state,
    status,
    sortBy,
    sortOrder,
    queryClient,
  ]);

  // Auto-prefetch next page when current data is loaded
  if (paginatedData && prefetch) {
    prefetchNextPage();
  }

  // Bulk update status mutation
  const bulkUpdateStatusMutation = useMutation({
    mutationFn: ({ supplierIds, status }: { supplierIds: number[]; status: string }) =>
      optimizedSupplierService.bulkUpdateStatus(supplierIds, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers/optimized'] });
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers/stats'] });
      toast({
        title: 'Status atualizado',
        description: `${data.updatedCount} fornecedores atualizados com sucesso`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Cache warmup mutation
  const warmupCacheMutation = useMutation({
    mutationFn: optimizedSupplierService.warmupCache,
    onSuccess: () => {
      toast({
        title: 'Cache aquecido',
        description: 'Cache foi aquecido com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao aquecer cache',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Cache invalidation mutation
  const invalidateCacheMutation = useMutation({
    mutationFn: optimizedSupplierService.invalidateCache,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers/optimized'] });
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers/stats'] });
      toast({
        title: 'Cache invalidado',
        description: 'Cache foi invalidado com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao invalidar cache',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Memoized return values for performance
  const suppliers = paginatedData?.suppliers || [];
  const pagination = paginatedData ? {
    page: paginatedData.page,
    limit: paginatedData.limit,
    total: paginatedData.total,
    totalPages: paginatedData.totalPages,
    hasMore: paginatedData.hasMore,
  } : null;

  return {
    // Data
    suppliers,
    pagination,
    stats: stats || paginatedData?.stats,
    
    // Loading states
    isLoading,
    isStatsLoading,
    isFetching,
    
    // Error handling
    error,
    
    // Actions
    refetch,
    bulkUpdateStatus: bulkUpdateStatusMutation.mutateAsync,
    warmupCache: warmupCacheMutation.mutateAsync,
    invalidateCache: invalidateCacheMutation.mutateAsync,
    
    // Mutation states
    isBulkUpdating: bulkUpdateStatusMutation.isPending,
    isWarmingUp: warmupCacheMutation.isPending,
    isInvalidating: invalidateCacheMutation.isPending,
  };
}

// Hook for supplier search
export function useSupplierSearch(query: string, limit = 20) {
  const { toast } = useToast();
  
  const debouncedQuery = useDebounce(query, 300);
  
  return useQuery({
    queryKey: ['/api/suppliers/search', debouncedQuery, limit],
    queryFn: () => optimizedSupplierService.search(debouncedQuery, limit),
    enabled: !!debouncedQuery && debouncedQuery.length >= 2,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    onError: (error: Error) => {
      toast({
        title: 'Erro na busca',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Hook for supplier details
export function useSupplierDetails(id: number, enabled = true) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['/api/suppliers/details', id],
    queryFn: () => optimizedSupplierService.getDetails(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    onError: (error: Error) => {
      toast({
        title: 'Erro ao carregar detalhes',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}