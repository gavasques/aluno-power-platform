import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface AsyncStateOptions {
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

export interface AsyncState {
  isLoading: boolean;
  error: string | null;
  execute: <T>(
    asyncFn: () => Promise<T>,
    options?: AsyncStateOptions
  ) => Promise<T>;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

/**
 * Hook para gerenciar estados assíncronos (loading, error) de forma centralizada
 * Elimina duplicação de código em componentes que fazem operações async
 * 
 * @example
 * const { isLoading, error, execute } = useAsyncState();
 * 
 * const handleSave = () => execute(
 *   () => api.save(data),
 *   { successMessage: "Dados salvos com sucesso!" }
 * );
 * 
 * if (isLoading) return <LoadingState />;
 * if (error) return <ErrorState error={error} />;
 */
export const useAsyncState = (initialError: string | null = null): AsyncState => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  const execute = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options: AsyncStateOptions = {}
  ): Promise<T> => {
    const {
      successMessage,
      errorMessage,
      showSuccessToast = true,
      showErrorToast = true,
      onSuccess,
      onError
    } = options;

    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      
      // Success handling
      if (successMessage && showSuccessToast) {
        toast({
          title: "Sucesso",
          description: successMessage,
        });
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMsg);
      
      // Error handling
      if (showErrorToast) {
        toast({
          title: errorMessage || "Erro na operação",
          description: errorMsg,
          variant: "destructive",
        });
      }
      
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMsg));
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    execute,
    setError,
    clearError,
    reset
  };
};

/**
 * Hook especializado para operações CRUD
 * Inclui mensagens padrão para create, update, delete
 */
export const useAsyncCrud = (entityName: string) => {
  const asyncState = useAsyncState();

  const createEntity = useCallback(
    <T>(asyncFn: () => Promise<T>) => asyncState.execute(
      asyncFn,
      { successMessage: `${entityName} criado com sucesso` }
    ),
    [asyncState, entityName]
  );

  const updateEntity = useCallback(
    <T>(asyncFn: () => Promise<T>) => asyncState.execute(
      asyncFn,
      { successMessage: `${entityName} atualizado com sucesso` }
    ),
    [asyncState, entityName]
  );

  const deleteEntity = useCallback(
    <T>(asyncFn: () => Promise<T>) => asyncState.execute(
      asyncFn,
      { successMessage: `${entityName} excluído com sucesso` }
    ),
    [asyncState, entityName]
  );

  return {
    ...asyncState,
    createEntity,
    updateEntity,
    deleteEntity
  };
};

/**
 * Hook para múltiplas operações assíncronas independentes
 * Útil quando há várias operações que podem acontecer em paralelo
 */
export const useMultipleAsyncStates = (keys: string[]) => {
  const states = keys.reduce((acc, key) => {
    acc[key] = useAsyncState();
    return acc;
  }, {} as Record<string, AsyncState>);

  const isAnyLoading = Object.values(states).some(state => state.isLoading);
  const hasAnyError = Object.values(states).some(state => state.error);
  const allErrors = Object.entries(states)
    .filter(([, state]) => state.error)
    .reduce((acc, [key, state]) => {
      acc[key] = state.error!;
      return acc;
    }, {} as Record<string, string>);

  const resetAll = useCallback(() => {
    Object.values(states).forEach(state => state.reset());
  }, [states]);

  return {
    states,
    isAnyLoading,
    hasAnyError,
    allErrors,
    resetAll
  };
};