import { BaseCrudService } from "@/lib/services/base/BaseCrudService";
import { Supplier, InsertSupplier } from "@shared/schema";

class SupplierService extends BaseCrudService<Supplier, InsertSupplier, Partial<InsertSupplier>> {
  constructor() {
    super('/api/suppliers');
  }

  async toggleVerified(id: number): Promise<Supplier> {
    return this.patch<Supplier>(`${this.endpoint}/${id}/verify`);
  }
}

export const supplierService = new SupplierService();