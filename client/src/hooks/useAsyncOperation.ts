import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { LoadingCoordinator } from '@/utils/loadingDebounce';

/**
 * 🚀 Unified Async Operation Hook
 * 
 * Este hook unifica padrões de loading, error e notificações toast encontrados em:
 * - useLoadingState.ts
 * - useApiRequest.ts  
 * - useBackgroundRemoval.ts
 * - useImageProcessing.ts
 * - useOptimizedQuery.ts
 * 
 * ## ✨ Benefícios:
 * - ✅ Padrão único para operações assíncronas
 * - ✅ Notificações consistentes em toda aplicação
 * - ✅ Coordenação global de loading
 * - ✅ Gerenciamento automático de erro
 * - ✅ Estados de progresso configuráveis
 * - ✅ Cleanup automático
 * 
 * ## 📖 Como usar:
 * 
 * ### 1. Básico - Operação simples:
 * ```typescript
 * const { execute, isLoading, error, data } = useAsyncOperation({
 *   successMessage: "Operação concluída!",
 *   errorMessage: "Erro na operação"
 * });
 * 
 * const handleClick = () => {
 *   execute(async () => {
 *     const response = await fetch('/api/data');
 *     return response.json();
 *   });
 * };
 * ```
 * 
 * ### 2. Com múltiplos estados:
 * ```typescript
 * const upload = useAsyncOperation({
 *   loadingKey: 'upload',
 *   successMessage: "Upload concluído!",
 *   progressSteps: ['Validando...', 'Enviando...', 'Processando...']
 * });
 * 
 * const process = useAsyncOperation({
 *   loadingKey: 'process',
 *   successMessage: "Processamento concluído!"
 * });
 * ```
 * 
 * ### 3. Com transformação de dados:
 * ```typescript
 * const { execute } = useAsyncOperation<User[], User>({
 *   transform: (users) => users[0],
 *   successMessage: "Usuário carregado!"
 * });
 * ```
 */

interface ToastConfig {
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

interface AsyncOperationConfig<TInput = any, TOutput = TInput> {
  /** Chave única para coordenação global de loading */
  loadingKey?: string;
  
  /** Configurações de toast */
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  
  /** Função para transformar dados de entrada */
  transform?: (input: TInput) => TOutput;
  
  /** Mensagens de progresso para operações longas */
  progressSteps?: string[];
  
  /** Callback executado em caso de sucesso */
  onSuccess?: (data: TOutput) => void;
  
  /** Callback executado em caso de erro */
  onError?: (error: Error) => void;
  
  /** Auto-reset após sucesso (em ms) */
  autoResetAfter?: number;
}

interface AsyncOperationState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  progress: {
    step: string;
    stepIndex: number;
    totalSteps: number;
  } | null;
  lastExecutedAt: number | null;
}

export function useAsyncOperation<TInput = any, TOutput = TInput>(
  config: AsyncOperationConfig<TInput, TOutput> = {}
) {
  const {
    loadingKey = `async-${Math.random().toString(36).substr(2, 9)}`,
    successMessage,
    errorMessage,
    showSuccessToast = true,
    showErrorToast = true,
    transform,
    progressSteps = [],
    onSuccess,
    onError,
    autoResetAfter
  } = config;

  const [state, setState] = useState<AsyncOperationState<TOutput>>({
    data: null,
    isLoading: false,
    error: null,
    progress: null,
    lastExecutedAt: null,
  });

  const coordinator = LoadingCoordinator.getInstance();
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Limpar timeout no unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      coordinator.setLoading(loadingKey, false);
    };
  }, [coordinator, loadingKey]);

  const setProgress = useCallback((stepIndex: number) => {
    if (progressSteps.length === 0) return;
    
    setState(prev => ({
      ...prev,
      progress: {
        step: progressSteps[stepIndex] || '',
        stepIndex,
        totalSteps: progressSteps.length
      }
    }));
  }, [progressSteps]);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
    coordinator.setLoading(loadingKey, loading);
  }, [coordinator, loadingKey]);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setData = useCallback((data: TOutput | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      progress: null,
      lastExecutedAt: null,
    });
    coordinator.setLoading(loadingKey, false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [coordinator, loadingKey]);

  const execute = useCallback(async (
    operationFn: () => Promise<TInput>
  ): Promise<TOutput | null> => {
    // Limpar estado anterior
    setError(null);
    setProgress(0);
    setLoading(true);

    const startTime = Date.now();

    try {
      // Executar operação com progresso
      let rawData: TInput;
      
      if (progressSteps.length > 0) {
        // Simular progresso para operações longas
        for (let i = 0; i < progressSteps.length - 1; i++) {
          setProgress(i);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        setProgress(progressSteps.length - 1);
      }

      rawData = await operationFn();
      
      // Transformar dados se necessário
      const finalData = transform ? transform(rawData) : (rawData as unknown as TOutput);
      
      setState(prev => ({
        ...prev,
        data: finalData,
        isLoading: false,
        error: null,
        progress: null,
        lastExecutedAt: Date.now()
      }));
      
      coordinator.setLoading(loadingKey, false);

      // Notificação de sucesso
      if (showSuccessToast && successMessage) {
        toast({
          title: "Sucesso",
          description: successMessage,
        });
      }

      // Callback de sucesso
      if (onSuccess) {
        onSuccess(finalData);
      }

      // Auto-reset se configurado
      if (autoResetAfter) {
        timeoutRef.current = setTimeout(reset, autoResetAfter);
      }

      return finalData;

    } catch (error: any) {
      const errorMessage = error.message || config.errorMessage || 'Erro inesperado';
      
      setState(prev => ({
        ...prev,
        data: null,
        isLoading: false,
        error: errorMessage,
        progress: null,
        lastExecutedAt: Date.now()
      }));
      
      coordinator.setLoading(loadingKey, false);

      // Notificação de erro
      if (showErrorToast) {
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        });
      }

      // Callback de erro
      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage));
      }

      return null;
    }
  }, [
    setLoading,
    setError,
    setProgress,
    progressSteps,
    transform,
    showSuccessToast,
    showErrorToast,
    successMessage,
    config.errorMessage,
    onSuccess,
    onError,
    autoResetAfter,
    reset,
    coordinator,
    loadingKey
  ]);

  // Verificar se deve mostrar loading (coordenado globalmente)
  const shouldShowLoading = state.isLoading && !coordinator.getActiveStates().some(
    activeKey => activeKey !== loadingKey
  );

  return {
    // Estado
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    progress: state.progress,
    lastExecutedAt: state.lastExecutedAt,
    
    // Estado coordenado
    shouldShowLoading,
    globalActiveStates: coordinator.getActiveStates(),
    
    // Ações
    execute,
    reset,
    setError,
    setData,
    
    // Utilitários
    isExecuting: state.isLoading,
    hasData: state.data !== null,
    hasError: state.error !== null,
    executionTime: state.lastExecutedAt ? Date.now() - state.lastExecutedAt : null,
  };
}

/**
 * Hook especializado para operações de upload
 */
export function useAsyncUpload<T = any>(config: Omit<AsyncOperationConfig<File, T>, 'progressSteps'> = {}) {
  return useAsyncOperation<File, T>({
    ...config,
    progressSteps: ['Validando arquivo...', 'Enviando...', 'Processando...'],
    successMessage: config.successMessage || 'Upload concluído com sucesso!',
    errorMessage: config.errorMessage || 'Erro no upload'
  });
}

/**
 * Hook especializado para operações de processamento
 */
export function useAsyncProcessing<T = any>(config: Omit<AsyncOperationConfig<any, T>, 'progressSteps'> = {}) {
  return useAsyncOperation<any, T>({
    ...config,
    progressSteps: ['Iniciando processamento...', 'Processando...', 'Finalizando...'],
    successMessage: config.successMessage || 'Processamento concluído!',
    errorMessage: config.errorMessage || 'Erro no processamento'
  });
}

export default useAsyncOperation;