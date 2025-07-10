/**
 * Phase 2 Performance Optimizations - Frontend Query Optimizations
 * 
 * This module provides advanced React Query optimizations including:
 * - Intelligent cache configuration based on data types
 * - Background sync with smart intervals
 * - Query deduplication and batching
 * - Context-aware prefetching
 */

import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

// Data classification for optimal cache strategies
export const DATA_TYPES = {
  STATIC: 'static',       // Rarely changes (agents, tools, partners)
  SEMI_STATIC: 'semi_static', // Changes occasionally (materials, templates)
  DYNAMIC: 'dynamic',     // Changes frequently (products, suppliers)
  REAL_TIME: 'real_time'  // Changes constantly (user sessions, credits)
} as const;

// Optimized cache configurations by data type
export const CACHE_STRATEGIES = {
  [DATA_TYPES.STATIC]: {
    staleTime: 60 * 60 * 1000,      // 1 hour
    gcTime: 4 * 60 * 60 * 1000,     // 4 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  },
  [DATA_TYPES.SEMI_STATIC]: {
    staleTime: 30 * 60 * 1000,      // 30 minutes
    gcTime: 2 * 60 * 60 * 1000,     // 2 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
  },
  [DATA_TYPES.DYNAMIC]: {
    staleTime: 5 * 60 * 1000,       // 5 minutes
    gcTime: 30 * 60 * 1000,         // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
  },
  [DATA_TYPES.REAL_TIME]: {
    staleTime: 30 * 1000,           // 30 seconds
    gcTime: 5 * 60 * 1000,          // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  }
};

// Query key classification for automatic optimization
export const QUERY_CLASSIFICATIONS = {
  '/api/agents': DATA_TYPES.STATIC,
  '/api/partners': DATA_TYPES.STATIC,
  '/api/tools': DATA_TYPES.STATIC,
  '/api/tool-types': DATA_TYPES.STATIC,
  '/api/departments': DATA_TYPES.STATIC,
  '/api/materials': DATA_TYPES.SEMI_STATIC,
  '/api/templates': DATA_TYPES.SEMI_STATIC,
  '/api/prompts': DATA_TYPES.SEMI_STATIC,
  '/api/youtube-videos': DATA_TYPES.SEMI_STATIC,
  '/api/products': DATA_TYPES.DYNAMIC,
  '/api/suppliers': DATA_TYPES.DYNAMIC,
  '/api/brands': DATA_TYPES.DYNAMIC,
  '/api/dashboard/summary': DATA_TYPES.REAL_TIME,
  '/api/auth/me': DATA_TYPES.REAL_TIME,
  '/api/permissions/user-features': DATA_TYPES.REAL_TIME,
} as const;

/**
 * Get optimized query options based on query key
 */
export function getOptimizedQueryOptions(queryKey: string | readonly unknown[]) {
  const key = Array.isArray(queryKey) ? queryKey[0] as string : queryKey;
  const dataType = QUERY_CLASSIFICATIONS[key as keyof typeof QUERY_CLASSIFICATIONS] || DATA_TYPES.DYNAMIC;
  
  return {
    ...CACHE_STRATEGIES[dataType],
    structuralSharing: true,
    retry: (failureCount: number, error: any) => {
      // Don't retry client errors
      if (error?.message?.includes('HTTP 4')) return false;
      return failureCount < 2; // Reduced retry count for better performance
    }
  };
}

/**
 * Background sync hook for keeping cache fresh without blocking UI
 */
export function useBackgroundSync() {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Background sync every 10 minutes for critical data
    intervalRef.current = setInterval(() => {
      const criticalQueries = [
        '/api/dashboard/summary',
        '/api/permissions/user-features',
        '/api/auth/me'
      ];

      criticalQueries.forEach(queryKey => {
        queryClient.invalidateQueries({ 
          queryKey: [queryKey],
          refetchType: 'none' // Don't refetch immediately, just mark as stale
        });
      });
    }, 10 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [queryClient]);
}

/**
 * Intelligent query invalidation - only invalidate related queries
 */
export const INVALIDATION_PATTERNS = {
  products: ['/api/products', '/api/dashboard/summary'],
  suppliers: ['/api/suppliers', '/api/products', '/api/dashboard/summary'],
  brands: ['/api/brands', '/api/products'],
  agents: ['/api/agents'],
  partners: ['/api/partners'],
  materials: ['/api/materials'],
  tools: ['/api/tools'],
} as const;

export function invalidateRelatedQueries(
  queryClient: QueryClient, 
  entityType: keyof typeof INVALIDATION_PATTERNS
) {
  const patterns = INVALIDATION_PATTERNS[entityType];
  patterns.forEach(pattern => {
    queryClient.invalidateQueries({ 
      queryKey: [pattern],
      exact: false 
    });
  });
}

/**
 * Query batching for multiple related requests
 */
export function useBatchedQueries<T>(
  queries: Array<{ queryKey: readonly unknown[]; enabled?: boolean }>,
  batchDelay = 50
) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Execute all enabled queries in parallel
      const enabledQueries = queries.filter(q => q.enabled !== false);
      
      Promise.allSettled(
        enabledQueries.map(query => 
          queryClient.ensureQueryData({
            queryKey: query.queryKey,
            ...getOptimizedQueryOptions(query.queryKey)
          })
        )
      );
    }, batchDelay);

    return () => clearTimeout(timeout);
  }, [queries, queryClient, batchDelay]);
}

/**
 * Context-aware cache warming
 */
export function warmContextCache(queryClient: QueryClient, route: string) {
  const routeQueries: Record<string, string[]> = {
    '/dashboard': ['/api/dashboard/summary', '/api/youtube-videos'],
    '/agentes': ['/api/agents', '/api/permissions/user-features'],
    '/ferramentas': ['/api/tools', '/api/tool-types'],
    '/hub': ['/api/materials', '/api/partners', '/api/templates'],
    '/minha-area': ['/api/products', '/api/suppliers', '/api/brands'],
  };

  const queries = routeQueries[route] || [];
  queries.forEach(queryKey => {
    queryClient.prefetchQuery({
      queryKey: [queryKey],
      ...getOptimizedQueryOptions(queryKey)
    });
  });
}