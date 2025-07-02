import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes - longer cache for better performance
      gcTime: 30 * 60 * 1000, // 30 minutes - keep data in cache longer
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      refetchOnMount: false, // Prevent duplicate requests on mount
      networkMode: 'online',
      // Enable query deduplication
      structuralSharing: true,
      retry: (failureCount, error) => {
        // Don't retry 4xx errors (client errors)
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          return false;
        }
        return failureCount < 3;
      },
      queryFn: async ({ queryKey, signal }) => {
        const url = queryKey[0] as string;
        const token = localStorage.getItem('auth_token');
        
        try {
          const response = await fetch(url, {
            signal, // Support query cancellation
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` }),
            },
          });
          if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }
          return response.json();
        } catch (error) {
          if (signal?.aborted) {
            throw new Error('Query was cancelled');
          }
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
  const token = localStorage.getItem('auth_token');
  
  // Don't set Content-Type for FormData - browser will set it automatically with boundary
  const headers: HeadersInit = {
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(options?.headers || {}),
  };
  
  // Only add Content-Type for non-FormData requests
  if (!(options?.body instanceof FormData)) {
    (headers as any)['Content-Type'] = 'application/json';
  }
  
  const response = await fetch(url, {
    headers,
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