import { useEffect, useState } from 'react';
import { LoadingCoordinator } from '@/utils/loadingDebounce';
import { useAsyncOperation } from './useAsyncOperation';

/**
 * Hook to manage loading state with global coordination
 * Prevents duplicate loading messages across the system
 * 
 * Refatorado para usar useAsyncOperation como base
 */
export function useLoadingState(key: string, initialLoading = false) {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const coordinator = LoadingCoordinator.getInstance();
  
  useEffect(() => {
    coordinator.setLoading(key, isLoading);
    return () => coordinator.setLoading(key, false);
  }, [isLoading, coordinator, key]);
  
  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);
  const toggleLoading = () => setIsLoading(prev => !prev);
  
  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    setLoading: setIsLoading,
    shouldShowLoading: isLoading && !coordinator.getActiveStates().some(activeKey => activeKey !== key),
    globalActiveStates: coordinator.getActiveStates()
  };
}

/**
 * Nova versão baseada em useAsyncOperation - mais robusta
 */
export function useLoadingStateAsync(key: string, config: {
  successMessage?: string;
  errorMessage?: string;
  showToasts?: boolean;
} = {}) {
  const { showToasts = false } = config;
  
  const asyncOp = useAsyncOperation({
    loadingKey: key,
    successMessage: config.successMessage,
    errorMessage: config.errorMessage,
    showSuccessToast: showToasts,
    showErrorToast: showToasts,
  });

  return {
    isLoading: asyncOp.isLoading,
    error: asyncOp.error,
    shouldShowLoading: asyncOp.shouldShowLoading,
    globalActiveStates: asyncOp.globalActiveStates,
    
    // Métodos de controle
    startLoading: () => asyncOp.execute(async () => ({})),
    stopLoading: asyncOp.reset,
    setError: asyncOp.setError,
    
    // Compatibilidade com versão anterior
    setLoading: (loading: boolean) => loading ? 
      asyncOp.execute(async () => ({})) : 
      asyncOp.reset(),
    
    // Novos recursos
    executeWithLoading: asyncOp.execute,
    hasError: asyncOp.hasError,
  };
}

/**
 * Hook to coordinate multiple loading states
 */
export function useCoordinatedLoading(keys: string[]) {
  const coordinator = LoadingCoordinator.getInstance();
  const [localStates, setLocalStates] = useState<Record<string, boolean>>({});
  
  const setLoading = (key: string, loading: boolean) => {
    setLocalStates(prev => ({ ...prev, [key]: loading }));
    coordinator.setLoading(key, loading);
  };
  
  const isAnyLoading = () => {
    return Object.values(localStates).some(Boolean) || coordinator.isAnyLoading();
  };
  
  const getActiveKeys = () => {
    const localActive = Object.entries(localStates)
      .filter(([_, loading]) => loading)
      .map(([key]) => key);
    
    return [...localActive, ...coordinator.getActiveStates()];
  };
  
  useEffect(() => {
    return () => {
      // Cleanup all keys on unmount
      keys.forEach(key => coordinator.setLoading(key, false));
    };
  }, [coordinator, keys]);
  
  return {
    setLoading,
    isAnyLoading,
    getActiveKeys,
    localStates,
    globalStates: coordinator.getActiveStates()
  };
}