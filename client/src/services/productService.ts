import { BaseCrudService } from "@/lib/services/base/BaseCrudService";
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

class ProductService extends BaseCrudService<DbProduct, InsertProduct, Partial<InsertProduct>> {
  constructor() {
    super('/api/products');
  }

  async toggleStatus(id: number): Promise<DbProduct> {
    return this.patch<DbProduct>(`${this.endpoint}/${id}/toggle-status`);
  }

  async updateChannels(id: number, channels: SalesChannel[]): Promise<DbProduct> {
    const updateData: ChannelUpdateData = { channels };
    return this.put<DbProduct>(`${this.endpoint}/${id}/channels`, updateData);
  }

  async updateCosts(id: number, costs: ProductUpdateData): Promise<DbProduct> {
    return this.put<DbProduct>(`${this.endpoint}/${id}/costs`, costs);
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

    return this.get<DbProduct[]>(`${this.endpoint}/filter?${params.toString()}`);
  }

  async bulkUpdate(updateData: ProductBulkUpdateData): Promise<DbProduct[]> {
    return this.put<DbProduct[]>(`${this.endpoint}/bulk-update`, updateData);
  }

  async getMetrics(): Promise<ProductMetrics> {
    return this.get<ProductMetrics>(`${this.endpoint}/metrics`);
  }
}

export const productService = new ProductService();