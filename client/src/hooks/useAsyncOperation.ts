import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface UseAsyncOperationOptions {
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  showToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export interface AsyncOperationResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  execute: (operation: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook reutilizável para operações assíncronas
 * 
 * Consolida padrões de operações assíncronas encontrados nos componentes:
 * - Estados de loading e error
 * - Tratamento de erro padronizado
 * - Toasts automáticos
 * - Reset de estado
 * 
 * @param options Configurações da operação
 * @returns Objeto com estados e função execute
 */
export function useAsyncOperation<T = any>(options: UseAsyncOperationOptions = {}): AsyncOperationResult<T> {
  const { toast } = useToast();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (operation: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await operation();
      setData(result);
      
      if (options.showToast !== false && options.successMessage) {
        toast({
          title: "Sucesso",
          description: options.successMessage,
        });
      }
      
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na operação';
      setError(errorMessage);
      
      if (options.showToast !== false) {
        toast({
          title: "Erro",
          description: options.errorMessage || errorMessage,
          variant: "destructive",
        });
      }
      
      options.onError?.(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [options, toast]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    reset
  };
}

/**
 * Hook para operações de mutação (criar, atualizar, deletar)
 */
export function useMutation<T = any>(options: UseAsyncOperationOptions = {}): AsyncOperationResult<T> {
  return useAsyncOperation<T>({
    successMessage: 'Operação realizada com sucesso!',
    errorMessage: 'Erro ao realizar operação',
    ...options
  });
}

/**
 * Hook para operações de consulta
 */
export function useQuery<T = any>(options: UseAsyncOperationOptions = {}): AsyncOperationResult<T> {
  return useAsyncOperation<T>({
    showToast: false, // Queries geralmente não mostram toast
    ...options
  });
} 