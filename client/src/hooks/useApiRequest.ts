import { useAsyncOperation } from './useAsyncOperation';

interface UseApiRequestOptions {
  successMessage?: string;
  errorMessage?: string;
  loadingKey?: string;
  showToasts?: boolean;
}

/**
 * Hook for API requests - Refatorado para usar useAsyncOperation
 * Mantém compatibilidade com versão anterior
 */
export function useApiRequest<T = any>(options: UseApiRequestOptions = {}) {
  const { 
    successMessage, 
    errorMessage, 
    loadingKey,
    showToasts = true 
  } = options;

  const asyncOp = useAsyncOperation<Response, T>({
    loadingKey: loadingKey || 'api-request',
    successMessage,
    errorMessage,
    showSuccessToast: showToasts && !!successMessage,
    showErrorToast: showToasts,
  });

  const execute = async (
    requestFn: () => Promise<Response>,
    transform?: (data: any) => T
  ): Promise<T | null> => {
    return await asyncOp.execute(async () => {
      const response = await requestFn();
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const rawData = await response.json();
      return transform ? transform(rawData) : rawData;
    });
  };

  return {
    // Compatibilidade com versão anterior
    data: asyncOp.data,
    loading: asyncOp.isLoading,
    error: asyncOp.error,
    execute,
    reset: asyncOp.reset,
    
    // Recursos adicionais do useAsyncOperation
    isLoading: asyncOp.isLoading,
    shouldShowLoading: asyncOp.shouldShowLoading,
    hasData: asyncOp.hasData,
    hasError: asyncOp.hasError,
    progress: asyncOp.progress,
    globalActiveStates: asyncOp.globalActiveStates,
  };
}

/**
 * Hook especializado para fetch requests
 */
export function useFetchRequest<T = any>(options: UseApiRequestOptions & {
  baseUrl?: string;
} = {}) {
  const { baseUrl = '', ...apiOptions } = options;
  const apiRequest = useApiRequest<T>(apiOptions);

  const fetchData = async (
    url: string,
    init?: RequestInit,
    transform?: (data: any) => T
  ): Promise<T | null> => {
    return await apiRequest.execute(
      () => fetch(`${baseUrl}${url}`, init),
      transform
    );
  };

  const get = (url: string, transform?: (data: any) => T) => 
    fetchData(url, { method: 'GET' }, transform);

  const post = (url: string, body: any, transform?: (data: any) => T) =>
    fetchData(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }, transform);

  const put = (url: string, body: any, transform?: (data: any) => T) =>
    fetchData(url, {
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }, transform);

  const del = (url: string, transform?: (data: any) => T) =>
    fetchData(url, { method: 'DELETE' }, transform);

  return {
    ...apiRequest,
    fetchData,
    get,
    post,
    put,
    delete: del,
  };
}