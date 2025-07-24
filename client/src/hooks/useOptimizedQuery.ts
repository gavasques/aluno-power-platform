import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useEffect } from 'react';
import { LoadingCoordinator } from '@/utils/loadingDebounce';
import { useAsyncOperation } from './useAsyncOperation';

/**
 * Optimized version of useQuery that coordinates loading states
 * to prevent duplicate loading messages across the system
 * 
 * Refatorado para usar useAsyncOperation para coordenação
 */
export function useOptimizedQuery<T>(
  options: UseQueryOptions<T> & { loadingKey?: string }
): UseQueryResult<T> & { isOptimizedLoading: boolean; shouldShowLoading: boolean } {
  const { loadingKey, ...queryOptions } = options;
  const result = useQuery<T>(queryOptions);
  const coordinator = LoadingCoordinator.getInstance();
  
  const key = loadingKey || `query-${JSON.stringify(options.queryKey)}`;
  
  useEffect(() => {
    if (result.isLoading || result.isFetching) {
      coordinator.setLoading(key, true);
    } else {
      coordinator.setLoading(key, false);
    }
    
    return () => {
      coordinator.setLoading(key, false);
    };
  }, [result.isLoading, result.isFetching, coordinator, key]);
  
  // Return a custom isLoading that considers global state
  const isOptimizedLoading = result.isLoading && !coordinator.isAnyLoading();
  const shouldShowLoading = result.isLoading && !coordinator.getActiveStates().some(
    activeKey => activeKey !== key
  );
  
  return {
    ...result,
    isOptimizedLoading,
    shouldShowLoading
  };
}

/**
 * Nova versão que usa useAsyncOperation internamente
 */
export function useOptimizedQueryAsync<T>(
  queryFn: () => Promise<T>,
  options: {
    queryKey: any[];
    loadingKey?: string;
    enabled?: boolean;
    successMessage?: string;
    errorMessage?: string;
    staleTime?: number;
    gcTime?: number;
  }
): {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  shouldShowLoading: boolean;
  refetch: () => Promise<T | null>;
  reset: () => void;
} {
  const asyncOp = useAsyncOperation<T>({
    loadingKey: options.loadingKey || `query-${JSON.stringify(options.queryKey)}`,
    successMessage: options.successMessage,
    errorMessage: options.errorMessage,
    showSuccessToast: false, // Queries não precisam de toast de sucesso
    showErrorToast: !!options.errorMessage,
  });

  // Auto-executar quando enabled
  useEffect(() => {
    if (options.enabled !== false && !asyncOp.data && !asyncOp.isLoading) {
      asyncOp.execute(queryFn);
    }
  }, [options.enabled, queryFn, asyncOp]);

  return {
    data: asyncOp.data,
    isLoading: asyncOp.isLoading,
    error: asyncOp.error,
    shouldShowLoading: asyncOp.shouldShowLoading,
    refetch: () => asyncOp.execute(queryFn),
    reset: asyncOp.reset,
  };
}

/**
 * Smart loading component that only shows if no other loading is active
 */
export function SmartLoadingWrapper({ 
  isLoading, 
  children, 
  loadingComponent,
  loadingKey = 'smart-loading'
}: {
  isLoading: boolean;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  loadingKey?: string;
}) {
  const coordinator = LoadingCoordinator.getInstance();
  
  useEffect(() => {
    coordinator.setLoading(loadingKey, isLoading);
    return () => coordinator.setLoading(loadingKey, false);
  }, [isLoading, coordinator, loadingKey]);
  
  if (isLoading) {
    return loadingComponent || <div>Carregando...</div>;
  }
  
  return <>{children}</>;
}