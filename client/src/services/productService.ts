import { apiRequest } from "@/lib/queryClient";
import { Product as DbProduct, InsertProduct } from "@shared/schema";

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

  async update(id: number, data: Partial<InsertProduct>): Promise<DbProduct> {
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

  async updateChannels(id: number, channels: any[]): Promise<DbProduct> {
    return apiRequest<DbProduct>(`/api/products/${id}/channels`, {
      method: "PUT",
      body: JSON.stringify({ channels }),
    });
  }

  async updateCosts(id: number, costs: any): Promise<DbProduct> {
    return apiRequest<DbProduct>(`/api/products/${id}/costs`, {
      method: "PUT",
      body: JSON.stringify(costs),
    });
  }
}

export const productService = new ProductService();