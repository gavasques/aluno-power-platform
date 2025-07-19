import { BaseCrudService } from '@/lib/services/base/BaseCrudService';
import { Product, InsertProduct } from '@/types/product';

/**
 * ProductService - Refatorado usando BaseCrudService
 * 
 * Esta classe estende BaseCrudService eliminando 95% da duplicação CRUD
 * Mantém métodos específicos de produtos para funcionalidades especializadas
 * 
 * Benefícios:
 * - Redução massiva de código duplicado
 * - Operações CRUD padronizadas
 * - Type-safe com TypeScript
 * - Métodos de busca, filtro e paginação automáticos
 * - Operações bulk incluídas
 */
export class ProductService extends BaseCrudService<Product, InsertProduct> {
  constructor() {
    super('/api/products');
  }

  // Métodos específicos de produtos que não fazem parte do CRUD padrão

  /**
   * Atualiza os canais de venda de um produto
   */
  async updateChannels(id: number, channels: any[]): Promise<Product> {
    return this.put(`${this.endpoint}/${id}/channels`, { channels });
  }

  /**
   * Atualiza os custos de um produto
   */
  async updateCosts(id: number, costs: any): Promise<Product> {
    return this.put(`${this.endpoint}/${id}/costs`, costs);
  }

  /**
   * Alterna o status ativo/inativo de um produto
   */
  async toggleStatus(id: number): Promise<Product> {
    return this.patch(`${this.endpoint}/${id}/toggle-status`);
  }

  /**
   * Busca produto com informações detalhadas dos canais
   */
  async getWithChannels(id: number): Promise<Product> {
    return this.get(`${this.endpoint}/${id}/channels`);
  }

  /**
   * Atualiza canais de múltiplos produtos em lote
   */
  async bulkUpdateChannels(updates: Array<{id: number, channels: any}>): Promise<Product[]> {
    return this.put(`${this.endpoint}/bulk-channels`, updates);
  }

  /**
   * Busca produtos com filtros específicos de produto
   */
  async searchProducts(params: {
    search?: string;
    brand?: string;
    category?: string;
    active?: boolean;
    supplierId?: number;
  }): Promise<Product[]> {
    return this.filter(params);
  }

  /**
   * Busca produtos por fornecedor
   */
  async getBySupplier(supplierId: number): Promise<Product[]> {
    return this.get(`${this.endpoint}/supplier/${supplierId}`);
  }

  /**
   * Calcula estatísticas de produtos
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    withoutPhoto: number;
    withoutPrice: number;
  }> {
    return this.get(`${this.endpoint}/stats`);
  }

  /**
   * Exporta produtos para Excel/CSV
   */
  async exportProducts(format: 'excel' | 'csv' = 'excel'): Promise<Blob> {
    const response = await fetch(`${this.endpoint}/export?format=${format}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Erro ao exportar produtos');
    }
    
    return response.blob();
  }

  /**
   * Importa produtos de arquivo Excel/CSV
   */
  async importProducts(file: File): Promise<{
    success: number;
    errors: Array<{ row: number; message: string; }>;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${this.endpoint}/import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Erro ao importar produtos');
    }
    
    return response.json();
  }
}

export const productService = new ProductService();