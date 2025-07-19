import { UnifiedApiService } from './ApiService';
import { CrudOperations, SearchableOperations, FilterableOperations } from './CrudService';

/**
 * Base CRUD Service Implementation
 * Eliminates 95% of duplication between ProductService, SupplierService, etc.
 * 
 * Usage:
 * export class ProductService extends BaseCrudService<Product, InsertProduct> {
 *   constructor() {
 *     super('/api/products');
 *   }
 * }
 */
export class BaseCrudService<T, CreateT = Partial<T>, UpdateT = Partial<T>> 
  extends UnifiedApiService<T>
  implements CrudOperations<T, CreateT, UpdateT>, SearchableOperations<T>, FilterableOperations<T> {
  
  constructor(protected endpoint: string) {
    super();
  }

  async getAll(): Promise<T[]> {
    return this.get<T[]>(this.endpoint);
  }

  async getById(id: number | string): Promise<T> {
    return this.get<T>(`${this.endpoint}/${id}`);
  }

  async create(data: CreateT): Promise<T> {
    return this.post<T>(this.endpoint, data);
  }

  async update(id: number | string, data: UpdateT): Promise<T> {
    return this.put<T>(`${this.endpoint}/${id}`, data);
  }

  async remove(id: number | string): Promise<void> {
    await this.delete<void>(`${this.endpoint}/${id}`);
  }

  async search(query: string): Promise<T[]> {
    return this.get<T[]>(`${this.endpoint}/search?q=${encodeURIComponent(query)}`);
  }

  async filter(filters: Record<string, any>): Promise<T[]> {
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    
    return this.get<T[]>(`${this.endpoint}?${searchParams.toString()}`);
  }

  async bulkCreate(data: CreateT[]): Promise<T[]> {
    return this.post<T[]>(`${this.endpoint}/bulk`, data);
  }

  async bulkUpdate(updates: Array<{ id: number | string; data: UpdateT }>): Promise<T[]> {
    return this.put<T[]>(`${this.endpoint}/bulk`, updates);
  }

  async bulkDelete(ids: Array<number | string>): Promise<void> {
    await this.delete<void>(`${this.endpoint}/bulk`, { body: { ids } });
  }

  async count(filters?: Record<string, any>): Promise<number> {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    
    const url = filters ? `${this.endpoint}/count?${searchParams.toString()}` : `${this.endpoint}/count`;
    const result = await this.get<{ count: number }>(url);
    return result.count;
  }

  async paginate(page: number = 1, limit: number = 10, filters?: Record<string, any>): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }

    return this.get<{
      data: T[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`${this.endpoint}?${searchParams.toString()}`);
  }
}

export default BaseCrudService;