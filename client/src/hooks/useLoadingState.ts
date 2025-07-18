import { useState, useCallback } from 'react';

export interface UseLoadingStateOptions {
  initialLoading?: boolean;
  onLoadingChange?: (isLoading: boolean) => void;
}

export interface LoadingStateResult {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T>(operation: () => Promise<T>) => Promise<T>;
}

/**
 * Hook reutilizável para estados de loading
 * 
 * Consolida padrões de loading encontrados nos componentes:
 * - Estados de loading simples
 * - Operações com loading automático
 * - Callbacks para mudanças de estado
 * 
 * @param options Configurações do estado de loading
 * @returns Objeto com estados e funções de controle
 */
export function useLoadingState(options: UseLoadingStateOptions = {}): LoadingStateResult {
  const [isLoading, setIsLoadingState] = useState(options.initialLoading || false);

  const setIsLoading = useCallback((loading: boolean) => {
    setIsLoadingState(loading);
    options.onLoadingChange?.(loading);
  }, [options]);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, [setIsLoading]);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  const withLoading = useCallback(async <T>(operation: () => Promise<T>): Promise<T> => {
    startLoading();
    try {
      const result = await operation();
      return result;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    isLoading,
    setIsLoading,
    startLoading,
    stopLoading,
    withLoading
  };
}

/**
 * Hook para múltiplos estados de loading
 */
export function useMultipleLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }));
  }, []);

  const startLoading = useCallback((key: string) => {
    setLoading(key, true);
  }, [setLoading]);

  const stopLoading = useCallback((key: string) => {
    setLoading(key, false);
  }, [setLoading]);

  const withLoading = useCallback(async <T>(key: string, operation: () => Promise<T>): Promise<T> => {
    startLoading(key);
    try {
      const result = await operation();
      return result;
    } finally {
      stopLoading(key);
    }
  }, [startLoading, stopLoading]);

  const isAnyLoading = Object.values(loadingStates).some(Boolean);

  return {
    loadingStates,
    setLoading,
    startLoading,
    stopLoading,
    withLoading,
    isAnyLoading
  };
} 