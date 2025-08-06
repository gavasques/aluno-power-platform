import { useCallback } from 'react';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export const useAuthFetch = () => {
  const authFetch = useCallback(async (url: string, options: FetchOptions = {}) => {
    const { skipAuth = false, headers = {}, ...restOptions } = options;
    
    const token = localStorage.getItem('auth_token');
    
    const finalHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };
    
    if (!skipAuth && token) {
      finalHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      ...restOptions,
      headers: finalHeaders,
      credentials: 'include',
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    
    // Handle non-JSON responses (like file downloads)
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      return response;
    }
    
    return response.json();
  }, []);
  
  return { authFetch };
};

export default useAuthFetch;