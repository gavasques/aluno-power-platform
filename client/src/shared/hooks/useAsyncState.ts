/**
 * USE ASYNC STATE - HOOK UNIFICADO PARA GERENCIAMENTO DE ESTADOS ASSÍNCRONOS
 * Consolidação definitiva de todos os hooks de estado async duplicados
 * Elimina: useAsyncState patterns duplicados em múltiplos componentes
 * 
 * ETAPA 5 - DRY REFACTORING PHASE 2
 * Status: ✅ EXECUTANDO - Consolidação de Estados Assíncronos
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// =============================================================================
// INTERFACES UNIFICADAS
// =============================================================================

export interface AsyncState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface AsyncOptions {
  // Configurações de execução
  executeOnMount?: boolean;        // Executar automaticamente ao montar
  resetOnCall?: boolean;          // Resetar estado ao chamar execute
  debounceMs?: number;            // Debounce para evitar chamadas excessivas
  
  // Callbacks opcionais
  onSuccess?: (data: any) => void;    // Callback de sucesso
  onError?: (error: string) => void;  // Callback de erro
  onFinally?: () => void;             // Callback sempre executado
  
  // Configurações de retry
  retryAttempts?: number;         // Número de tentativas
  retryDelayMs?: number;          // Delay entre tentativas
  
  // Cache e persistência
  cacheKey?: string;              // Chave para cache
  cacheDurationMs?: number;       // Duração do cache em ms
}

export interface AsyncActions<T = any> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  retry: () => Promise<T | null>;
  setData: (data: T | null) => void;
  setError: (error: string | null) => void;
}

// =============================================================================
// CACHE SIMPLES PARA RESULTADOS
// =============================================================================

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

const asyncCache = new Map<string, CacheEntry>();

const getFromCache = <T>(key: string): T | null => {
  const entry = asyncCache.get(key);
  if (!entry || Date.now() > entry.expiresAt) {
    asyncCache.delete(key);
    return null;
  }
  return entry.data;
};

const setToCache = <T>(key: string, data: T, durationMs: number): void => {
  const timestamp = Date.now();
  asyncCache.set(key, {
    data,
    timestamp,
    expiresAt: timestamp + durationMs
  });
};

// =============================================================================
// HOOK PRINCIPAL - USE ASYNC STATE
// =============================================================================

export const useAsyncState = <T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: AsyncOptions = {}
): AsyncState<T> & AsyncActions<T> => {
  
  const {
    executeOnMount = false,
    resetOnCall = true,
    debounceMs = 0,
    onSuccess,
    onError,
    onFinally,
    retryAttempts = 0,
    retryDelayMs = 1000,
    cacheKey,
    cacheDurationMs = 5 * 60 * 1000 // 5 minutos padrão
  } = options;
  
  // Estado principal
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false
  });
  
  // Refs para controle interno
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastArgsRef = useRef<any[]>([]);
  const attemptCountRef = useRef(0);
  const mountedRef = useRef(true);
  
  // Cleanup na desmontagem
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Função interna para execução com retry
  const executeWithRetry = useCallback(
    async (args: any[], attempt: number = 0): Promise<T | null> => {
      if (!mountedRef.current) return null;
      
      try {
        // Verificar cache se configurado
        if (cacheKey && attempt === 0) {
          const cachedData = getFromCache<T>(cacheKey);
          if (cachedData) {
            setState(prev => ({ 
              ...prev, 
              data: cachedData, 
              loading: false, 
              error: null, 
              success: true 
            }));
            onSuccess?.(cachedData);
            onFinally?.();
            return cachedData;
          }
        }
        
        // Executar função assíncrona
        const result = await asyncFunction(...args);
        
        if (!mountedRef.current) return null;
        
        // Salvar no cache se configurado
        if (cacheKey && cacheDurationMs > 0) {
          setToCache(cacheKey, result, cacheDurationMs);
        }
        
        // Atualizar estado de sucesso
        setState(prev => ({
          ...prev,
          data: result,
          loading: false,
          error: null,
          success: true
        }));
        
        // Callbacks de sucesso
        onSuccess?.(result);
        onFinally?.();
        
        return result;
        
      } catch (error: any) {
        if (!mountedRef.current) return null;
        
        const errorMessage = error?.message || 'Erro inesperado';
        
        // Tentar retry se configurado
        if (attempt < retryAttempts) {
          setTimeout(() => {
            if (mountedRef.current) {
              executeWithRetry(args, attempt + 1);
            }
          }, retryDelayMs);
          return null;
        }
        
        // Atualizar estado de erro
        setState(prev => ({
          ...prev,
          data: null,
          loading: false,
          error: errorMessage,
          success: false
        }));
        
        // Callbacks de erro
        onError?.(errorMessage);
        onFinally?.();
        
        return null;
      }
    },
    [asyncFunction, retryAttempts, retryDelayMs, cacheKey, cacheDurationMs, onSuccess, onError, onFinally]
  );
  
  // Função principal de execução com debounce
  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      // Limpar timeout anterior se existir
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Salvar argumentos para retry
      lastArgsRef.current = args;
      attemptCountRef.current = 0;
      
      // Resetar estado se configurado
      if (resetOnCall) {
        setState(prev => ({
          ...prev,
          loading: true,
          error: null,
          success: false
        }));
      } else {
        setState(prev => ({ ...prev, loading: true }));
      }
      
      // Executar com ou sem debounce
      if (debounceMs > 0) {
        return new Promise((resolve) => {
          timeoutRef.current = setTimeout(async () => {
            const result = await executeWithRetry(args);
            resolve(result);
          }, debounceMs);
        });
      } else {
        return executeWithRetry(args);
      }
    },
    [executeWithRetry, resetOnCall, debounceMs]
  );
  
  // Função de reset
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false
    });
    
    // Limpar cache se existir
    if (cacheKey) {
      asyncCache.delete(cacheKey);
    }
  }, [cacheKey]);
  
  // Função de retry (reutiliza últimos argumentos)
  const retry = useCallback(async (): Promise<T | null> => {
    return execute(...lastArgsRef.current);
  }, [execute]);
  
  // Função para definir dados manualmente
  const setData = useCallback((data: T | null) => {
    setState(prev => ({
      ...prev,
      data,
      loading: false,
      error: null,
      success: data !== null
    }));
  }, []);
  
  // Função para definir erro manualmente
  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      data: null,
      loading: false,
      error,
      success: false
    }));
  }, []);
  
  // Executar automaticamente na montagem se configurado
  useEffect(() => {
    if (executeOnMount) {
      execute();
    }
  }, [executeOnMount, execute]);
  
  return {
    // Estado
    ...state,
    
    // Ações
    execute,
    reset,
    retry,
    setData,
    setError
  };
};

// =============================================================================
// HOOKS ESPECIALIZADOS BASEADOS NO USEASYNCSTATE
// =============================================================================

/**
 * Hook especializado para operações de API
 */
export const useAsyncAPI = <T = any>(
  apiCall: (...args: any[]) => Promise<T>,
  options?: Omit<AsyncOptions, 'executeOnMount'>
) => {
  return useAsyncState(apiCall, { ...options, executeOnMount: false });
};

/**
 * Hook para carregamento automático na montagem
 */
export const useAsyncLoad = <T = any>(
  loadFunction: () => Promise<T>,
  options?: AsyncOptions
) => {
  return useAsyncState(loadFunction, { ...options, executeOnMount: true });
};

/**
 * Hook com debounce para busca/filtros
 */
export const useAsyncSearch = <T = any>(
  searchFunction: (query: string) => Promise<T>,
  debounceMs: number = 300,
  options?: Omit<AsyncOptions, 'debounceMs'>
) => {
  return useAsyncState(searchFunction, { 
    ...options, 
    debounceMs,
    resetOnCall: false 
  });
};

/**
 * Hook com cache para dados que mudam pouco
 */
export const useAsyncCache = <T = any>(
  fetchFunction: () => Promise<T>,
  cacheKey: string,
  cacheDurationMs: number = 5 * 60 * 1000,
  options?: Omit<AsyncOptions, 'cacheKey' | 'cacheDurationMs'>
) => {
  return useAsyncState(fetchFunction, {
    ...options,
    cacheKey,
    cacheDurationMs,
    executeOnMount: true
  });
};

/**
 * Hook com retry automático para operações críticas
 */
export const useAsyncWithRetry = <T = any>(
  criticalFunction: (...args: any[]) => Promise<T>,
  retryAttempts: number = 3,
  retryDelayMs: number = 1000,
  options?: Omit<AsyncOptions, 'retryAttempts' | 'retryDelayMs'>
) => {
  return useAsyncState(criticalFunction, {
    ...options,
    retryAttempts,
    retryDelayMs
  });
};

// =============================================================================
// UTILITIES PARA MÚLTIPLOS ASYNC STATES
// =============================================================================

/**
 * Combinar múltiplos estados async em um só
 */
export const combineAsyncStates = (...states: AsyncState[]): AsyncState => {
  const hasData = states.some(state => state.data !== null);
  const isLoading = states.some(state => state.loading);
  const hasError = states.some(state => state.error !== null);
  const allSuccess = states.every(state => state.success);
  
  return {
    data: hasData ? states.find(state => state.data !== null)?.data || null : null,
    loading: isLoading,
    error: hasError ? states.find(state => state.error !== null)?.error || null : null,
    success: allSuccess && !isLoading && !hasError
  };
};

/**
 * Aguardar que todos os estados async completem
 */
export const waitForAsyncStates = (...states: AsyncState[]): boolean => {
  return states.every(state => !state.loading);
};

// =============================================================================
// LEGACY COMPATIBILITY
// =============================================================================

/**
 * Aliases para compatibilidade com código existente
 */
export const useAsync = useAsyncState;
export const useAsyncOperation = useAsyncAPI;
export const useAsyncFetch = useAsyncLoad;

// Export default para importação simplificada
export default useAsyncState;

/**
 * MIGRATION METRICS - ETAPA 5 CONCLUÍDA
 * =====================================
 * 
 * ✅ HOOK ASYNC STATE UNIFICADO CRIADO: 400+ linhas de funcionalidade
 * ✅ FUNCIONALIDADES IMPLEMENTADAS:
 * - Gerenciamento completo de estados async (loading, data, error, success)
 * - Sistema de cache inteligente
 * - Debounce para evitar chamadas excessivas
 * - Retry automático com configuração flexível
 * - Callbacks personalizáveis (onSuccess, onError, onFinally)
 * - Hooks especializados (API, Load, Search, Cache, Retry)
 * - Utilities para múltiplos estados
 * - Compatibilidade legacy
 * - Cleanup automático na desmontagem
 * 
 * ✅ HOOKS ESPECIALIZADOS:
 * - useAsyncAPI: Para operações de API
 * - useAsyncLoad: Para carregamento automático
 * - useAsyncSearch: Com debounce para busca
 * - useAsyncCache: Com cache inteligente
 * - useAsyncWithRetry: Com retry automático
 * 
 * 🎯 MIGRAÇÃO: Substituir padrões async duplicados nos componentes existentes
 */