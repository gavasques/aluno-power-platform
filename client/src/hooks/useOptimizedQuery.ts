import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useEffect } from 'react';
import { LoadingCoordinator } from '@/utils/loadingDebounce';

/**
 * Optimized version of useQuery that coordinates loading states
 * to prevent duplicate loading messages across the system
 */
export function useOptimizedQuery<T>(
  options: UseQueryOptions<T> & { loadingKey?: string }
): UseQueryResult<T> & { isOptimizedLoading: boolean } {
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
  
  return {
    ...result,
    isOptimizedLoading
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