/**
 * Base API Service implementing Single Responsibility Principle
 * Handles common HTTP operations with error handling and type safety
 */
export abstract class ApiService<T> {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  protected async request<R = T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<R> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${url}:`, error);
      throw error;
    }
  }

  protected async get<R = T>(endpoint: string): Promise<R> {
    return this.request<R>(endpoint, { method: 'GET' });
  }

  protected async post<R = T>(endpoint: string, data?: any): Promise<R> {
    return this.request<R>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected async put<R = T>(endpoint: string, data?: any): Promise<R> {
    return this.request<R>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected async delete<R = T>(endpoint: string): Promise<R> {
    return this.request<R>(endpoint, { method: 'DELETE' });
  }
}