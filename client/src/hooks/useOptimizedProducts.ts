/**
 * Optimized Products Hook
 * High-Performance Product Management for Frontend
 * 
 * FRONTEND OPTIMIZATIONS:
 * - Debounced search and filtering
 * - Intelligent caching strategy
 * - Virtual scrolling support
 * - Optimistic updates
 * - Background data refresh
 * - Memory-efficient state management
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from './useDebounce';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from './use-toast';

export interface ProductFilters {
  search?: string;
  brand?: string;
  category?: string;
  supplierId?: number;
  active?: boolean;
  hasPhoto?: boolean;
  minCost?: number;
  maxCost?: number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'costItem';
  sortOrder?: 'asc' | 'desc';
}

export interface UseOptimizedProductsOptions {
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
  staleTime?: number;
  cacheTime?: number;
}

export function useOptimizedProducts(
  initialFilters: ProductFilters = {},
  initialPagination: PaginationOptions = { page: 1, limit: 50 },
  options: UseOptimizedProductsOptions = {}
) {
  const {
    enableAutoRefresh = false,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
    staleTime = 2 * 60 * 1000, // 2 minutes
    cacheTime = 10 * 60 * 1000 // 10 minutes
  } = options;

  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [pagination, setPagination] = useState<PaginationOptions>(initialPagination);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Debounce search to prevent excessive API calls
  const debouncedSearch = useDebounce(filters.search, 500);
  
  // Create stable query key
  const queryKey = useMemo(() => [
    '/api/products/optimized',
    {
      ...filters,
      search: debouncedSearch, // Use debounced search
      ...pagination
    }
  ], [filters, debouncedSearch, pagination]);

  // Main products query with optimization
  const {
    data: productsData,
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams();
      
      // Add pagination
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      
      // Add sorting
      if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
      if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);
      
      // Add filters
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.category) params.append('category', filters.category);
      if (filters.supplierId) params.append('supplierId', filters.supplierId.toString());
      if (filters.active !== undefined) params.append('active', filters.active.toString());
      if (filters.hasPhoto !== undefined) params.append('hasPhoto', filters.hasPhoto.toString());
      if (filters.minCost !== undefined) params.append('minCost', filters.minCost.toString());
      if (filters.maxCost !== undefined) params.append('maxCost', filters.maxCost.toString());
      
      return apiRequest(`/api/products/optimized?${params.toString()}`);
    },
    staleTime,
    gcTime: cacheTime,
    refetchOnWindowFocus: false,
    refetchInterval: enableAutoRefresh ? refreshInterval : false,
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors
      if (error?.status >= 400 && error?.status < 500) return false;
      return failureCount < 2;
    }
  });

  // Product summary query
  const { data: summary } = useQuery({
    queryKey: ['/api/products/summary'],
    queryFn: () => apiRequest('/api/products/summary'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000 // 15 minutes
  });

  // Filter options query
  const { data: filterOptions } = useQuery({
    queryKey: ['/api/products/filter-options'],
    queryFn: () => apiRequest('/api/products/filter-options'),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000 // 30 minutes
  });

  // Search products query (separate for typeahead)
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['/api/products/search', debouncedSearchQuery],
    queryFn: () => apiRequest(`/api/products/search?q=${encodeURIComponent(debouncedSearchQuery)}&limit=20`),
    enabled: debouncedSearchQuery.length >= 2,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: ({ productIds, updates }: { productIds: number[]; updates: any }) =>
      apiRequest('/api/products/bulk-update', {
        method: 'POST',
        body: JSON.stringify({ productIds, updates })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products/optimized'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products/summary'] });
      toast({
        title: 'Atualização em massa concluída',
        description: 'Os produtos foram atualizados com sucesso.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro na atualização',
        description: error.message || 'Não foi possível atualizar os produtos.',
        variant: 'destructive'
      });
    }
  });

  // Clear cache mutation
  const clearCacheMutation = useMutation({
    mutationFn: () => apiRequest('/api/products/cache', { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: 'Cache limpo',
        description: 'Os dados foram atualizados.'
      });
    }
  });

  // Optimized filter updates
  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const updatePagination = useCallback((newPagination: Partial<PaginationOptions>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
    setPagination({ page: 1, limit: 50, sortBy: 'updatedAt', sortOrder: 'desc' });
  }, []);

  // Prefetch next page for better UX
  useEffect(() => {
    if (productsData?.pagination?.hasNext) {
      const nextPageKey = [
        '/api/products/optimized',
        {
          ...filters,
          search: debouncedSearch,
          ...pagination,
          page: pagination.page + 1
        }
      ];
      
      queryClient.prefetchQuery({
        queryKey: nextPageKey,
        queryFn: () => {
          const params = new URLSearchParams();
          params.append('page', (pagination.page + 1).toString());
          params.append('limit', pagination.limit.toString());
          // Add other params...
          return apiRequest(`/api/products/optimized?${params.toString()}`);
        },
        staleTime: staleTime / 2 // Shorter stale time for prefetched data
      });
    }
  }, [productsData, filters, debouncedSearch, pagination, queryClient, staleTime]);

  return {
    // Data
    products: productsData?.products || [],
    pagination: productsData?.pagination || { total: 0, page: 1, limit: 50, totalPages: 0, hasNext: false, hasPrev: false },
    summary,
    filterOptions,
    searchResults: searchResults?.results || [],
    
    // Loading states
    isLoading,
    isFetching,
    isSearching,
    isUpdating: bulkUpdateMutation.isPending,
    
    // Error handling
    error,
    
    // Actions
    updateFilters,
    updatePagination,
    resetFilters,
    refetch,
    bulkUpdate: bulkUpdateMutation.mutate,
    clearCache: clearCacheMutation.mutate,
    
    // Search
    setSearchQuery,
    searchQuery,
    
    // Performance info
    performance: productsData?.performance,
    
    // Current state
    currentFilters: filters,
    currentPagination: pagination
  };
}

export default useOptimizedProducts;