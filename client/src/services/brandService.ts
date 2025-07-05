import { apiRequest } from "@/lib/queryClient";
import { Brand } from "@shared/schema";

class BrandService {
  async getAll(): Promise<Brand[]> {
    return apiRequest<Brand[]>("/api/brands");
  }

  async create(name: string): Promise<Brand> {
    return apiRequest<Brand>("/api/brands", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  async update(id: number, name: string): Promise<Brand> {
    return apiRequest<Brand>(`/api/brands/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    });
  }

  async delete(id: number): Promise<void> {
    return apiRequest(`/api/brands/${id}`, {
      method: "DELETE",
    });
  }
}

export const brandService = new BrandService();