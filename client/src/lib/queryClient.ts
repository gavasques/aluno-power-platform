import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes - longer cache for better performance
      gcTime: 30 * 60 * 1000, // 30 minutes - keep data in cache longer
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      refetchOnMount: 'always',
      networkMode: 'online',
      retry: (failureCount, error) => {
        // Don't retry 4xx errors (client errors)
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          return false;
        }
        return failureCount < 3;
      },
      queryFn: async ({ queryKey }) => {
        const url = queryKey[0] as string;
        try {
          const response = await fetch(url);
          if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }
          return response.json();
        } catch (error) {
          console.error('Query error for:', url, error);
          throw error;
        }
      },
    },
    mutations: {
      retry: false,
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

// Enhanced API request helper with automatic auth headers
export async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  // Get token from localStorage for authenticated requests
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  // Handle empty responses (like 204 No Content)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.warn('Failed to parse JSON response:', text);
    return {} as T;
  }
}