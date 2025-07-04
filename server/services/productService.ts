import { db } from "../db";
import { 
  userProducts, 
  productChannels, 
  departments, 
  suppliers,
  type UserProduct,
  type InsertUserProduct,
  type ProductWithChannels
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export class ProductService {
  // Listar produtos do usuário com relacionamentos
  async getProductsByUserId(userId: number): Promise<ProductWithChannels[]> {
    try {
      const products = await db.query.userProducts.findMany({
        where: eq(userProducts.userId, userId),
        with: {
          category: true,
          supplier: true,
          channels: true,
        },
        orderBy: [desc(userProducts.createdAt)],
      });

      return products as ProductWithChannels[];
    } catch (error) {
      console.error("Error fetching products:", error);
      throw new Error("Failed to fetch products");
    }
  }

  // Obter produto específico com relacionamentos
  async getProductById(productId: number, userId: number): Promise<ProductWithChannels | null> {
    try {
      const product = await db.query.userProducts.findFirst({
        where: and(
          eq(userProducts.id, productId),
          eq(userProducts.userId, userId)
        ),
        with: {
          category: true,
          supplier: true,
          channels: true,
        },
      });

      return product as ProductWithChannels || null;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw new Error("Failed to fetch product");
    }
  }

  // Criar novo produto
  async createProduct(productData: InsertUserProduct): Promise<UserProduct> {
    try {
      const [newProduct] = await db
        .insert(userProducts)
        .values({
          ...productData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return newProduct;
    } catch (error) {
      console.error("Error creating product:", error);
      throw new Error("Failed to create product");
    }
  }

  // Atualizar produto
  async updateProduct(productId: number, userId: number, productData: Partial<InsertUserProduct>): Promise<UserProduct | null> {
    try {
      const [updatedProduct] = await db
        .update(userProducts)
        .set({
          ...productData,
          updatedAt: new Date(),
        })
        .where(and(
          eq(userProducts.id, productId),
          eq(userProducts.userId, userId)
        ))
        .returning();

      return updatedProduct || null;
    } catch (error) {
      console.error("Error updating product:", error);
      throw new Error("Failed to update product");
    }
  }

  // Deletar produto
  async deleteProduct(productId: number, userId: number): Promise<boolean> {
    try {
      const result = await db
        .delete(userProducts)
        .where(and(
          eq(userProducts.id, productId),
          eq(userProducts.userId, userId)
        ))
        .returning();

      return result.length > 0;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw new Error("Failed to delete product");
    }
  }

  // Alternar status ativo/inativo
  async toggleProductStatus(productId: number, userId: number): Promise<UserProduct | null> {
    try {
      // Primeiro buscar o produto atual
      const currentProduct = await this.getProductById(productId, userId);
      if (!currentProduct) {
        return null;
      }

      // Inverter o status
      const [updatedProduct] = await db
        .update(userProducts)
        .set({
          isActive: !currentProduct.isActive,
          updatedAt: new Date(),
        })
        .where(and(
          eq(userProducts.id, productId),
          eq(userProducts.userId, userId)
        ))
        .returning();

      return updatedProduct || null;
    } catch (error) {
      console.error("Error toggling product status:", error);
      throw new Error("Failed to toggle product status");
    }
  }

  // Buscar produtos por termo
  async searchProducts(userId: number, searchTerm: string): Promise<ProductWithChannels[]> {
    try {
      const products = await db.query.userProducts.findMany({
        where: and(
          eq(userProducts.userId, userId),
          // Aqui você pode implementar busca por nome, EAN, etc.
          // Para simplicidade, vamos buscar por nome que contenha o termo
        ),
        with: {
          category: true,
          supplier: true,
          channels: true,
        },
        orderBy: [desc(userProducts.createdAt)],
      });

      // Filtrar no JavaScript por enquanto (pode ser otimizado com SQL later)
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.ean && product.ean.includes(searchTerm)) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      return filtered as ProductWithChannels[];
    } catch (error) {
      console.error("Error searching products:", error);
      throw new Error("Failed to search products");
    }
  }

  // Obter categorias disponíveis
  async getCategories() {
    try {
      console.log("🔍 ProductService: Getting categories from departments table");
      const result = await db.select().from(departments).orderBy(departments.name);
      console.log("📋 ProductService: Categories result:", result?.length || 0);
      return result;
    } catch (error) {
      console.error("❌ ProductService: Error fetching categories:", error);
      throw new Error(`Failed to fetch categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Obter fornecedores disponíveis
  async getSuppliers() {
    try {
      console.log("🔍 ProductService: Getting suppliers from suppliers table");
      const result = await db.select().from(suppliers).orderBy(suppliers.name);
      console.log("🏭 ProductService: Suppliers result:", result?.length || 0);
      return result;
    } catch (error) {
      console.error("❌ ProductService: Error fetching suppliers:", error);
      throw new Error(`Failed to fetch suppliers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const productService = new ProductService();