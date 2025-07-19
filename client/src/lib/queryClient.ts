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
      // Enable query deduplication and performance optimizations
      structuralSharing: true,
      notifyOnChangeProps: 'all', // Fine-grained re-render control
      // Optimize retry logic for better performance
      retry: (failureCount, error) => {
        // Don't retry 4xx errors (client errors)
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          return false;
        }
        return failureCount < 2; // Reduced retry count for faster failure handling
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Cap retry delay
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
            // Handle authentication errors gracefully
            if (response.status === 401) {
              // Token might be expired or invalid
              localStorage.removeItem('auth_token');
              throw new Error('Authentication required - please login again');
            }
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }
          return response.json();
        } catch (error) {
          if (signal?.aborted) {
            throw new Error('Query was cancelled');
          }
          // Only log in development
          if (import.meta.env.DEV) {
            console.error('Query error for:', url, error);
          }
          throw error;
        }
      },
    },
    mutations: {
      retry: false,
      // Optimize mutation performance
      networkMode: 'online',
      onError: (error) => {
        console.error('Mutation error:', error);
      },
      // Add global mutation success handler for cache management
      onSuccess: () => {
        // Optional: Add global success tracking
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
  
  // Serialize body to JSON if it's an object (but not FormData)
  let body = options?.body;
  if (body && !(body instanceof FormData) && typeof body === 'object') {
    body = JSON.stringify(body);
    (headers as any)['Content-Type'] = 'application/json';
  } else if (!(body instanceof FormData)) {
    (headers as any)['Content-Type'] = 'application/json';
  }
  
  const response = await fetch(url, {
    headers,
    ...options,
    body,
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
    const data = JSON.parse(text);
    
    // Debug log for product suppliers endpoint
    if (url.includes('/api/products/') && url.includes('/suppliers')) {
      console.log('🔍 apiRequest - Raw response text:', text);
      console.log('🔍 apiRequest - Parsed data:', data);
      if (data?.data && Array.isArray(data.data)) {
        console.log('🔍 apiRequest - Supplier IDs in response:', data.data.map((s: any) => s.id));
      }
    }
    
    return data;
  } catch (error) {
    console.warn('Failed to parse JSON response:', text);
    return {} as T;
  }
}