import { apiRequest } from "@/lib/queryClient";
import { Supplier, InsertSupplier } from "@shared/schema";

class SupplierService {
  async getAll(): Promise<Supplier[]> {
    return apiRequest<Supplier[]>("/api/suppliers");
  }

  async getById(id: number): Promise<Supplier> {
    return apiRequest<Supplier>(`/api/suppliers/${id}`);
  }

  async create(data: InsertSupplier): Promise<Supplier> {
    return apiRequest<Supplier>("/api/suppliers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async update(id: number, data: Partial<InsertSupplier>): Promise<Supplier> {
    return apiRequest<Supplier>(`/api/suppliers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(id: number): Promise<void> {
    return apiRequest(`/api/suppliers/${id}`, {
      method: "DELETE",
    });
  }

  async toggleVerified(id: number): Promise<Supplier> {
    return apiRequest<Supplier>(`/api/suppliers/${id}/verify`, {
      method: "PATCH",
    });
  }
}

export const supplierService = new SupplierService();