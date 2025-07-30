/**
 * USE DEBOUNCE HOOK - PERFORMANCE OPTIMIZATION
 * Hook para otimizar performance de searches e inputs
 * 
 * BENEFÍCIOS:
 * - Reduz chamadas de API desnecessárias
 * - Melhora responsividade da UI
 * - Evita spam de re-renders em componentes filhos
 */

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set debouncedValue to value (passed in) after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Return a cleanup function that will be called every time ...
    // ... useEffect is re-called. useEffect will only be re-called ...
    // ... if value or delay changes (see the inputs array below). 
    // This is how we prevent debouncedValue from changing if value is ...
    // ... changed within the delay period. Timeout gets cleared and restarted.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-call effect if value or delay changes

  return debouncedValue;
}

/**
 * USE DEBOUNCED CALLBACK - Para funções
 * Hook para debounce de funções callback
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const [debouncedFn, setDebouncedFn] = useState<T | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFn(() => callback);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [callback, delay]);

  return (debouncedFn || callback) as T;
}