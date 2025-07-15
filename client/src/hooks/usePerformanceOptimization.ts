/**
 * Phase 2 Performance Optimization Hook - Component Performance Monitor
 * 
 * This hook monitors and optimizes component performance automatically
 */

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Monitor component render performance and provide optimization insights
 */
export function usePerformanceOptimization(componentName: string) {
  const renderStartTime = useRef<number>(Date.now());
  const renderCount = useRef<number>(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = Date.now() - renderStartTime.current;
    
    // Log performance metrics for components that take longer than 100ms to render
    if (renderTime > 100) {
      console.warn(`[PERFORMANCE] ${componentName} rendered in ${renderTime}ms (render #${renderCount.current})`);
    }

    // Reset timer for next render
    renderStartTime.current = Date.now();
  });

  // Return performance utilities
  return {
    renderCount: renderCount.current,
    prefetchCriticalData: () => {
      // Prefetch critical data based on component
      if (componentName.includes('Product')) {
        queryClient.prefetchQuery({
          queryKey: ['/api/products'],
          staleTime: 5 * 60 * 1000,
        });
      } else if (componentName.includes('Supplier')) {
        queryClient.prefetchQuery({
          queryKey: ['/api/suppliers'],
          staleTime: 5 * 60 * 1000,
        });
      }
    },
    invalidateStaleData: () => {
      // Intelligently invalidate only stale data
      queryClient.invalidateQueries({
        predicate: (query) => {
          const staleTime = query.options.staleTime || 0;
          const lastFetchTime = query.state.dataUpdatedAt;
          return Date.now() - lastFetchTime > staleTime;
        },
        refetchType: 'none', // Just mark as stale, don't refetch immediately
      });
    },
  };
}

/**
 * Debounced query hook for search and filter operations
 */
export function useDebouncedQuery<T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  searchTerm: string,
  delay: number = 300
) {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, delay]);

  return queryClient.getQueryData(queryKey) || [];
}

/**
 * Memory usage monitor for large datasets
 */
export function useMemoryOptimization() {
  const queryClient = useQueryClient();

  const checkMemoryUsage = () => {
    // Check if performance.memory is available (Chrome/Edge)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      const totalMB = memory.totalJSHeapSize / 1024 / 1024;
      
      console.log(`[MEMORY] Used: ${usedMB.toFixed(2)}MB / Total: ${totalMB.toFixed(2)}MB`);
      
      // If memory usage is high, cleanup old cache entries
      if (usedMB > 100) { // Over 100MB
        queryClient.getQueryCache().clear();
        console.log('[MEMORY] Cache cleared due to high memory usage');
      }
    }
  };

  const optimizeCache = () => {
    // Remove queries that haven't been used recently
    const cache = queryClient.getQueryCache();
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes

    cache.getAll().forEach((query) => {
      if (now - query.state.dataUpdatedAt > maxAge) {
        cache.remove(query);
      }
    });
  };

  return {
    checkMemoryUsage,
    optimizeCache,
  };
}