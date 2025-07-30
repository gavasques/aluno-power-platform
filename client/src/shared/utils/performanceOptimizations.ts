/**
 * Utilitários para otimizações de performance
 * Funções auxiliares para melhorar performance de componentes React
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import React from 'react';

/**
 * Hook para debounce de funções
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;
};

/**
 * Hook para throttle de funções
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastCallRef = useRef<number>(0);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  ) as T;
};

/**
 * Hook para memoização de cálculos pesados
 */
export const useExpensiveCalculation = <T>(
  calculation: () => T,
  dependencies: React.DependencyList
): T => {
  return useMemo(calculation, dependencies);
};

/**
 * Hook para cache de resultados
 */
export const useCache = <K, V>(maxSize: number = 100) => {
  const cacheRef = useRef<Map<K, V>>(new Map());

  const get = useCallback((key: K): V | undefined => {
    return cacheRef.current.get(key);
  }, []);

  const set = useCallback((key: K, value: V): void => {
    const cache = cacheRef.current;
    
    // Remove oldest entry if cache is full
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }
    
    cache.set(key, value);
  }, [maxSize]);

  const has = useCallback((key: K): boolean => {
    return cacheRef.current.has(key);
  }, []);

  const clear = useCallback((): void => {
    cacheRef.current.clear();
  }, []);

  return { get, set, has, clear };
};

/**
 * Hook para otimização de arrays grandes
 */
export const useVirtualizedList = <T>(
  items: T[],
  containerHeight: number,
  itemHeight: number
) => {
  const itemsPerPage = Math.ceil(containerHeight / itemHeight);
  const [startIndex, setStartIndex] = useState(0);

  const visibleItems = useMemo(() => {
    const endIndex = Math.min(startIndex + itemsPerPage + 2, items.length);
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, itemsPerPage]);

  const scrollToIndex = useCallback((index: number) => {
    setStartIndex(Math.max(0, index - 1));
  }, []);

  return {
    visibleItems,
    startIndex,
    scrollToIndex,
    totalHeight: items.length * itemHeight,
  };
};

/**
 * HOC para React.memo com comparação personalizada
 */
export const createMemoComponent = <P>(
  Component: React.ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  return React.memo(Component, areEqual);
};

/**
 * Utilitário para shallow comparison
 */
export const shallowEqual = (obj1: any, obj2: any): boolean => {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
};

/**
 * Hook para lazy loading de componentes
 */
export const useLazyComponent = <T>(
  loader: () => Promise<{ default: React.ComponentType<T> }>
) => {
  const [Component, setComponent] = useState<React.ComponentType<T> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadComponent = useCallback(async () => {
    if (Component) return;

    setLoading(true);
    setError(null);

    try {
      const module = await loader();
      setComponent(() => module.default);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [loader, Component]);

  return { Component, loading, error, loadComponent };
};