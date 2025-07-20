import { apiRequest } from "@/lib/queryClient";
import { Product as DbProduct, InsertProduct } from "@shared/schema";
import { 
  SalesChannel, 
  ChannelUpdateData, 
  ProductUpdateData,
  ProductFilterData,
  ProductSortData,
  ProductBulkUpdateData,
  ProductMetrics
} from "@/types/core";

class ProductService {
  async getAll(search?: string): Promise<DbProduct[]> {
    const queryParams = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiRequest<DbProduct[]>(`/api/products${queryParams}`);
  }

  async getById(id: number): Promise<DbProduct> {
    return apiRequest<DbProduct>(`/api/products/${id}`);
  }

  async create(data: InsertProduct): Promise<DbProduct> {
    return apiRequest<DbProduct>("/api/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async update(id: number, data: ProductUpdateData): Promise<DbProduct> {
    return apiRequest<DbProduct>(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(id: number): Promise<void> {
    return apiRequest(`/api/products/${id}`, {
      method: "DELETE",
    });
  }

  async toggleStatus(id: number): Promise<DbProduct> {
    return apiRequest<DbProduct>(`/api/products/${id}/toggle-status`, {
      method: "PATCH",
    });
  }

  async updateChannels(id: number, channels: SalesChannel[]): Promise<DbProduct> {
    const updateData: ChannelUpdateData = { channels };
    return apiRequest<DbProduct>(`/api/products/${id}/channels`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  }

  async updateCosts(id: number, costs: ProductUpdateData): Promise<DbProduct> {
    return apiRequest<DbProduct>(`/api/products/${id}/costs`, {
      method: "PUT",
      body: JSON.stringify(costs),
    });
  }

  async getFiltered(filters: ProductFilterData, sort?: ProductSortData): Promise<DbProduct[]> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.brandName) params.append('brandName', filters.brandName);
    if (filters.active !== undefined) params.append('active', filters.active.toString());
    if (filters.hasChannels !== undefined) params.append('hasChannels', filters.hasChannels.toString());
    if (filters.costRange) {
      params.append('costMin', filters.costRange.min.toString());
      params.append('costMax', filters.costRange.max.toString());
    }
    if (filters.dateRange) {
      params.append('startDate', filters.dateRange.start.toISOString());
      params.append('endDate', filters.dateRange.end.toISOString());
    }
    if (sort) {
      params.append('sortField', sort.field);
      params.append('sortDirection', sort.direction);
    }

    return apiRequest<DbProduct[]>(`/api/products/filter?${params.toString()}`);
  }

  async bulkUpdate(updateData: ProductBulkUpdateData): Promise<DbProduct[]> {
    return apiRequest<DbProduct[]>("/api/products/bulk-update", {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  }

  async getMetrics(): Promise<ProductMetrics> {
    return apiRequest<ProductMetrics>("/api/products/metrics");
  }
}

export const productService = new ProductService();