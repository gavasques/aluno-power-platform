import { QueryClient } from '@tanstack/react-query';

// Strategic Cache Configuration Constants
export const CACHE_STRATEGIES = {
  // Static data - rarely changes
  STATIC_DATA: {
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 4 * 60 * 60 * 1000, // 4 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },
  
  // Semi-static data - types, categories, etc.
  SEMI_STATIC: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: 10 * 60 * 1000, // Background refresh every 10 minutes
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
  },
  
  // User data - moderately dynamic
  USER_DATA: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // Background refresh every 5 minutes
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
  },
  
  // Dynamic data - frequently changes
  DYNAMIC_DATA: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  },
  
  // Real-time data - always fresh
  REAL_TIME: {
    staleTime: 0,
    gcTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  }
} as const;

// Helper function to get cache strategy for specific endpoints
export function getCacheStrategy(endpoint: string) {
  // Static data patterns
  if (endpoint.includes('/types') || 
      endpoint.includes('/categories') ||
      endpoint.includes('/feature-costs') ||
      endpoint.includes('/config')) {
    return CACHE_STRATEGIES.STATIC_DATA;
  }
  
  // User profile and auth data
  if (endpoint.includes('/auth/me') || 
      endpoint.includes('/user/profile')) {
    return CACHE_STRATEGIES.USER_DATA;
  }
  
  // Semi-static data
  if (endpoint.includes('/suppliers') ||
      endpoint.includes('/materials') ||
      endpoint.includes('/tools') ||
      endpoint.includes('/news/published') ||
      endpoint.includes('/updates/published')) {
    return CACHE_STRATEGIES.SEMI_STATIC;
  }
  
  // Dynamic data for products and user-specific content
  if (endpoint.includes('/products') ||
      endpoint.includes('/credits') ||
      endpoint.includes('/dashboard')) {
    return CACHE_STRATEGIES.DYNAMIC_DATA;
  }
  
  // Default strategy
  return {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  };
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - optimized for performance
      gcTime: 15 * 60 * 1000, // 15 minutes - memory optimized
      refetchOnWindowFocus: false,
      refetchOnReconnect: false, // Reduced for performance
      refetchOnMount: true,
      networkMode: 'online',
      // Enhanced performance optimizations
      structuralSharing: true,
      notifyOnChangeProps: 'tracked', // Only notify when specific props change
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
  } else if (!(body instanceof FormData) && options?.body) {
    (headers as any)['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    headers,
    ...options,
    body,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '{}');
    let error;
    try {
      error = JSON.parse(errorText);
    } catch {
      error = { message: 'Request failed' };
    }
    
    throw new Error(error.message || error.error || `HTTP ${response.status}`);
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
      if (data?.data && Array.isArray(data.data)) {
      }
    }
    
    return data;
  } catch (error) {
    console.warn('Failed to parse JSON response:', text);
    return {} as T;
  }
}