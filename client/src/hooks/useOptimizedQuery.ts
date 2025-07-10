/**
 * Phase 2 Performance Hook - Optimized Query Hook
 * 
 * This hook provides automatic query optimization based on data type
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getOptimizedQueryOptions } from '@/lib/queryOptimizations';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey'> {
  queryKey: readonly unknown[];
  dataType?: 'static' | 'semi_static' | 'dynamic' | 'real_time';
}

/**
 * Enhanced useQuery hook with automatic performance optimizations
 */
export function useOptimizedQuery<T = unknown>(options: OptimizedQueryOptions<T>) {
  const optimizedOptions = getOptimizedQueryOptions(options.queryKey);
  
  return useQuery<T>({
    ...options,
    ...optimizedOptions,
    // Allow manual overrides while keeping optimization defaults
    ...(options.staleTime !== undefined && { staleTime: options.staleTime }),
    ...(options.gcTime !== undefined && { gcTime: options.gcTime }),
    ...(options.refetchOnWindowFocus !== undefined && { refetchOnWindowFocus: options.refetchOnWindowFocus }),
    ...(options.refetchOnMount !== undefined && { refetchOnMount: options.refetchOnMount }),
    ...(options.refetchOnReconnect !== undefined && { refetchOnReconnect: options.refetchOnReconnect }),
  });
}

/**
 * Pre-configured hooks for common data types
 */
export const useStaticQuery = <T = unknown>(options: Omit<OptimizedQueryOptions<T>, 'dataType'>) =>
  useOptimizedQuery<T>({ ...options, dataType: 'static' });

export const useSemiStaticQuery = <T = unknown>(options: Omit<OptimizedQueryOptions<T>, 'dataType'>) =>
  useOptimizedQuery<T>({ ...options, dataType: 'semi_static' });

export const useDynamicQuery = <T = unknown>(options: Omit<OptimizedQueryOptions<T>, 'dataType'>) =>
  useOptimizedQuery<T>({ ...options, dataType: 'dynamic' });

export const useRealTimeQuery = <T = unknown>(options: Omit<OptimizedQueryOptions<T>, 'dataType'>) =>
  useOptimizedQuery<T>({ ...options, dataType: 'real_time' });