/**
 * Unified API Service implementing centralized authentication and error handling
 * Eliminates duplicate API patterns across the codebase
 */
export class UnifiedApiService<T> {
  protected baseUrl: string;
  private tokenStorageKey: string;

  constructor(baseUrl: string = '', tokenStorageKey: string = 'auth_token') {
    this.baseUrl = baseUrl;
    this.tokenStorageKey = tokenStorageKey;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem(this.tokenStorageKey);
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private async handleResponse<R>(response: Response): Promise<R> {
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem(this.tokenStorageKey);
        throw new Error('Authentication required - please login again');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as R;
    }

    const text = await response.text();
    if (!text) {
      return {} as R;
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      console.warn('Failed to parse JSON response:', text);
      return {} as R;
    }
  }

  protected async request<R = T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<R> {
    const url = this.baseUrl ? `${this.baseUrl}${endpoint}` : endpoint;
    
    const headers: HeadersInit = {
      ...this.getAuthHeaders(),
      ...options?.headers,
    };

    let body = options?.body;
    if (body && !(body instanceof FormData) && typeof body === 'object') {
      body = JSON.stringify(body);
      (headers as any)['Content-Type'] = 'application/json';
    } else if (!(body instanceof FormData)) {
      (headers as any)['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        headers,
        ...options,
        body,
      });

      return await this.handleResponse<R>(response);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`API request failed for ${url}:`, error);
      }
      throw error;
    }
  }

  protected async get<R = T>(endpoint: string, options?: RequestInit): Promise<R> {
    return this.request<R>(endpoint, { method: 'GET', ...options });
  }

  protected async post<R = T>(endpoint: string, data?: any, options?: RequestInit): Promise<R> {
    return this.request<R>(endpoint, {
      method: 'POST',
      body: data,
      ...options,
    });
  }

  protected async put<R = T>(endpoint: string, data?: any, options?: RequestInit): Promise<R> {
    return this.request<R>(endpoint, {
      method: 'PUT',
      body: data,
      ...options,
    });
  }

  protected async delete<R = T>(endpoint: string, options?: RequestInit): Promise<R> {
    return this.request<R>(endpoint, { method: 'DELETE', ...options });
  }

  protected async patch<R = T>(endpoint: string, data?: any, options?: RequestInit): Promise<R> {
    return this.request<R>(endpoint, {
      method: 'PATCH',
      body: data,
      ...options,
    });
  }
}

export const apiService = new UnifiedApiService();

export async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  return apiService.request<T>(url, options);
}