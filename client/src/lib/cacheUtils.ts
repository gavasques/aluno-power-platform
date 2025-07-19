/**
 * Cache utilities for eliminating cache issues in preview mode
 */

interface NoCacheRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

/**
 * Make a request with cache disabled
 */
export async function noCacheRequest(url: string, options: NoCacheRequestOptions = {}) {
  const timestamp = Date.now();
  const separator = url.includes('?') ? '&' : '?';
  const noCacheUrl = `${url}${separator}nocache=${timestamp}`;

  const headers = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    ...options.headers,
  };

  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    headers,
    cache: 'no-store',
  };

  if (options.body) {
    fetchOptions.body = typeof options.body === 'string' 
      ? options.body 
      : JSON.stringify(options.body);
    
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
  }

  return fetch(noCacheUrl, fetchOptions);
}

/**
 * Clear cache via API endpoint
 */
export async function clearServerCache() {
  try {
    const response = await noCacheRequest('/api/cache/clear', {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error('Failed to clear server cache');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error clearing server cache:', error);
    throw error;
  }
}

/**
 * Force preview refresh without cache
 */
export async function forcePreviewRefresh() {
  try {
    // Clear server cache
    await clearServerCache();
    
    // Call preview refresh endpoint
    await noCacheRequest('/api/preview/refresh');
    
    // Clear browser cache for specific domains
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
    
    return true;
  } catch (error) {
    console.error('Error forcing preview refresh:', error);
    return false;
  }
}

/**
 * Add no-cache parameters to URL
 */
export function addNoCacheParams(url: string): string {
  const timestamp = Date.now();
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}nocache=${timestamp}&v=${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Disable cache for current session
 */
export function disableCacheForSession() {
  // Add meta tags to disable cache
  const metaTags = [
    { name: 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
    { name: 'Pragma', content: 'no-cache' },
    { name: 'Expires', content: '0' }
  ];

  metaTags.forEach(tag => {
    let meta = document.querySelector(`meta[name="${tag.name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', tag.name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', tag.content);
  });

  // Override fetch to add no-cache headers
  const originalFetch = window.fetch;
  window.fetch = function(input, init = {}) {
    const headers = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      ...init.headers,
    };

    return originalFetch(input, {
      ...init,
      headers,
      cache: 'no-store',
    });
  };
}