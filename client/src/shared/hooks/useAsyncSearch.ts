/**
 * Hook personalizado para busca assíncrona com debounce
 * Centraliza lógica de busca em tempo real
 */

import { useState, useCallback, useEffect, useRef } from 'react';

interface UseAsyncSearchOptions<T> {
  searchFn: (query: string) => Promise<T[]>;
  debounceMs?: number;
  minQueryLength?: number;
  initialResults?: T[];
  onError?: (error: Error) => void;
  onResults?: (results: T[], query: string) => void;
}

interface UseAsyncSearchReturn<T> {
  query: string;
  results: T[];
  isSearching: boolean;
  hasSearched: boolean;
  error: string | null;
  setQuery: (query: string) => void;
  clearSearch: () => void;
  search: (query: string) => Promise<void>;
}

export const useAsyncSearch = <T = any>(
  options: UseAsyncSearchOptions<T>
): UseAsyncSearchReturn<T> => {
  const {
    searchFn,
    debounceMs = 300,
    minQueryLength = 2,
    initialResults = [],
    onError,
    onResults
  } = options;

  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<T[]>(initialResults);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  const search = useCallback(async (searchQuery: string) => {
    // Cancel any ongoing search
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear previous error
    setError(null);

    // Don't search if query is too short
    if (searchQuery.length < minQueryLength) {
      setResults(initialResults);
      setIsSearching(false);
      setHasSearched(false);
      return;
    }

    // Create new abort controller for this search
    abortControllerRef.current = new AbortController();
    
    setIsSearching(true);
    setHasSearched(true);

    try {
      const searchResults = await searchFn(searchQuery);
      
      // Check if this search was aborted
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      setResults(searchResults);
      onResults?.(searchResults, searchQuery);
    } catch (err: any) {
      // Don't set error if the request was aborted
      if (err.name !== 'AbortError') {
        const errorMessage = err.message || 'Erro na busca';
        setError(errorMessage);
        onError?.(err);
      }
    } finally {
      setIsSearching(false);
    }
  }, [searchFn, minQueryLength, initialResults, onError, onResults]);

  const debouncedSearch = useCallback((searchQuery: string) => {
    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout
    debounceRef.current = setTimeout(() => {
      search(searchQuery);
    }, debounceMs);
  }, [search, debounceMs]);

  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
    debouncedSearch(newQuery);
  }, [debouncedSearch]);

  const clearSearch = useCallback(() => {
    // Cancel any pending search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Cancel any ongoing search
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setQueryState('');
    setResults(initialResults);
    setIsSearching(false);
    setHasSearched(false);
    setError(null);
  }, [initialResults]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    query,
    results,
    isSearching,
    hasSearched,
    error,
    setQuery,
    clearSearch,
    search,
  };
};

// Specialized hook for searching with filters
export const useFilteredAsyncSearch = <T = any>(
  options: UseAsyncSearchOptions<T> & {
    filterFn?: (item: T, query: string) => boolean;
    sortFn?: (a: T, b: T) => number;
  }
) => {
  const { filterFn, sortFn, ...searchOptions } = options;
  const searchHook = useAsyncSearch(searchOptions);

  const filteredResults = searchHook.results
    .filter(item => filterFn ? filterFn(item, searchHook.query) : true)
    .sort(sortFn || (() => 0));

  return {
    ...searchHook,
    results: filteredResults,
  };
};