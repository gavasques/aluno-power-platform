import { BaseCrudService } from "@/lib/services/base/BaseCrudService";
import { Brand } from "@shared/schema";

interface BrandCreateData {
  name: string;
}

class BrandService extends BaseCrudService<Brand, BrandCreateData, BrandCreateData> {
  constructor() {
    super('/api/brands');
  }

  async create(name: string): Promise<Brand> {
    return super.create({ name });
  }

  async update(id: number, name: string): Promise<Brand> {
    return super.update(id, { name });
  }
}

export const brandService = new BrandService();