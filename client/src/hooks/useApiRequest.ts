import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ApiRequestState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiRequestOptions {
  successMessage?: string;
  errorMessage?: string;
}

export function useApiRequest<T = any>(options: UseApiRequestOptions = {}) {
  const [state, setState] = useState<ApiRequestState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { toast } = useToast();

  const execute = async (
    requestFn: () => Promise<Response>,
    transform?: (data: any) => T
  ): Promise<T | null> => {
    setState({ data: null, loading: true, error: null });

    try {
      const response = await requestFn();
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const rawData = await response.json();
      const data = transform ? transform(rawData) : rawData;

      setState({ data, loading: false, error: null });

      if (options.successMessage) {
        toast({
          title: "Sucesso",
          description: options.successMessage,
        });
      }

      return data;
    } catch (error: any) {
      const errorMessage = error.message || options.errorMessage || 'Erro inesperado';
      setState({ data: null, loading: false, error: errorMessage });

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    }
  };

  const reset = () => {
    setState({ data: null, loading: false, error: null });
  };

  return {
    ...state,
    execute,
    reset,
  };
}