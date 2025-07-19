/**
 * Product Supplier Controller
 * 
 * SOLID Principles Applied:
 * - SRP: Single responsibility for product supplier API operations
 * - OCP: Open for extension with new supplier operations
 * - LSP: Consistent controller interface
 * - ISP: Focused on supplier-specific endpoints
 * - DIP: Depends on abstractions through database operations
 */

import { Request, Response } from 'express';
import { eq, and, desc, asc } from 'drizzle-orm';
import { db } from '../db';
import { productSuppliers, suppliers, products, supplierProducts } from '../../shared/schema';
import { insertProductSupplierSchema } from '../../shared/schema';
import { z } from 'zod';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    role: string;
  };
}

export class ProductSupplierController {
  /**
   * Get all suppliers for a product
   */
  static async getProductSuppliers(req: AuthenticatedRequest, res: Response) {
    try {
      const productId = parseInt(req.params.productId);
      const userId = req.user.id;

      console.log(`🔍 [PRODUCT_SUPPLIERS] ProductId: ${productId}, UserId: ${userId}`);
      console.log(`🔍 [PRODUCT_SUPPLIERS] Full user object:`, JSON.stringify(req.user, null, 2));

      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do produto é obrigatório'
        });
      }

      // Verify product ownership
      const product = await db
        .select()
        .from(products)
        .where(and(
          eq(products.id, productId),
          eq(products.userId, userId)
        ))
        .limit(1);

      console.log(`🔍 [PRODUCT_SUPPLIERS] Product found: ${product.length > 0 ? 'Yes' : 'No'}`);
      if (product.length > 0) {
        console.log(`🔍 [PRODUCT_SUPPLIERS] Product: id=${product[0].id}, userId=${product[0].userId}, name=${product[0].name}`);
      }

      if (!product.length) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }

      // Get suppliers with supplier information
      const productSuppliersList = await db
        .select({
          id: productSuppliers.id,
          productId: productSuppliers.productId,
          supplierId: productSuppliers.supplierId,
          supplierCode: productSuppliers.supplierCode,
          cost: productSuppliers.cost,
          isPrimary: productSuppliers.isPrimary,
          
          
          notes: productSuppliers.notes,
          active: productSuppliers.active,
          createdAt: productSuppliers.createdAt,
          updatedAt: productSuppliers.updatedAt,
          supplier: {
            id: suppliers.id,
            tradeName: suppliers.tradeName,
            corporateName: suppliers.corporateName,
            logo: suppliers.logo,
            description: suppliers.description,
          }
        })
        .from(productSuppliers)
        .leftJoin(suppliers, eq(productSuppliers.supplierId, suppliers.id))
        .where(eq(productSuppliers.productId, productId))
        .orderBy(desc(productSuppliers.isPrimary), asc(productSuppliers.cost));

      return res.json({
        success: true,
        data: productSuppliersList
      });
    } catch (error) {
      console.error('Error fetching product suppliers:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Add a supplier to a product
   */
  static async addProductSupplier(req: AuthenticatedRequest, res: Response) {
    try {
      const productId = parseInt(req.params.productId);
      const userId = req.user.id;

      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do produto é obrigatório'
        });
      }

      // Verify product ownership
      const product = await db
        .select()
        .from(products)
        .where(and(
          eq(products.id, productId),
          eq(products.userId, userId)
        ))
        .limit(1);

      if (!product.length) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }

      // Validate request body
      const validatedData = insertProductSupplierSchema.parse({
        ...req.body,
        productId
      });

      // Check if supplier already exists for this product
      const existingSupplier = await db
        .select()
        .from(productSuppliers)
        .where(and(
          eq(productSuppliers.productId, productId),
          eq(productSuppliers.supplierId, validatedData.supplierId)
        ))
        .limit(1);

      if (existingSupplier.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Este fornecedor já está vinculado ao produto'
        });
      }

      // If setting as primary, remove primary flag from other suppliers
      if (validatedData.isPrimary) {
        await db
          .update(productSuppliers)
          .set({ isPrimary: false })
          .where(eq(productSuppliers.productId, productId));
      }

      // Insert new supplier
      const [newSupplier] = await db
        .insert(productSuppliers)
        .values(validatedData)
        .returning();

      // Update supplierProducts table to reflect the link (bidirectional sync)
      if (validatedData.supplierCode) {
        await db
          .update(supplierProducts)
          .set({ 
            productId: productId,
            linkStatus: 'linked',
            updatedAt: new Date()
          })
          .where(and(
            eq(supplierProducts.supplierId, validatedData.supplierId),
            eq(supplierProducts.supplierSku, validatedData.supplierCode)
          ));
      }

      // Get the complete supplier information
      const supplierWithInfo = await db
        .select({
          id: productSuppliers.id,
          productId: productSuppliers.productId,
          supplierId: productSuppliers.supplierId,
          supplierCode: productSuppliers.supplierCode,
          cost: productSuppliers.cost,
          isPrimary: productSuppliers.isPrimary,
          
          
          notes: productSuppliers.notes,
          active: productSuppliers.active,
          createdAt: productSuppliers.createdAt,
          updatedAt: productSuppliers.updatedAt,
          supplier: {
            id: suppliers.id,
            tradeName: suppliers.tradeName,
            corporateName: suppliers.corporateName,
            logo: suppliers.logo,
            description: suppliers.description,
          }
        })
        .from(productSuppliers)
        .leftJoin(suppliers, eq(productSuppliers.supplierId, suppliers.id))
        .where(eq(productSuppliers.id, newSupplier.id))
        .limit(1);

      return res.status(201).json({
        success: true,
        message: 'Fornecedor adicionado com sucesso',
        data: supplierWithInfo[0]
      });
    } catch (error) {
      console.error('Error adding product supplier:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.errors
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Update a product supplier
   */
  static async updateProductSupplier(req: AuthenticatedRequest, res: Response) {
    try {
      const productId = parseInt(req.params.productId);
      const supplierId = parseInt(req.params.supplierId);
      const userId = req.user.id;

      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do produto é obrigatório'
        });
      }

      if (!supplierId || isNaN(supplierId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do fornecedor é obrigatório'
        });
      }

      // Verify product ownership
      const product = await db
        .select()
        .from(products)
        .where(and(
          eq(products.id, productId),
          eq(products.userId, userId)
        ))
        .limit(1);

      if (!product.length) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }

      // Check if product supplier exists
      const existingSupplier = await db
        .select()
        .from(productSuppliers)
        .where(and(
          eq(productSuppliers.productId, productId),
          eq(productSuppliers.id, supplierId)
        ))
        .limit(1);

      if (!existingSupplier.length) {
        return res.status(404).json({
          success: false,
          message: 'Fornecedor do produto não encontrado'
        });
      }

      // Validate request body
      const updateSchema = insertProductSupplierSchema.partial().omit({
        productId: true,
        supplierId: true
      });
      
      const validatedData = updateSchema.parse(req.body);

      // If setting as primary, remove primary flag from other suppliers
      if (validatedData.isPrimary) {
        await db
          .update(productSuppliers)
          .set({ isPrimary: false })
          .where(and(
            eq(productSuppliers.productId, productId),
            eq(productSuppliers.id, supplierId)
          ));
      }

      // Update supplier
      await db
        .update(productSuppliers)
        .set({
          ...validatedData,
          updatedAt: new Date()
        })
        .where(eq(productSuppliers.id, supplierId));

      // Get updated supplier with info
      const updatedSupplier = await db
        .select({
          id: productSuppliers.id,
          productId: productSuppliers.productId,
          supplierId: productSuppliers.supplierId,
          supplierCode: productSuppliers.supplierCode,
          cost: productSuppliers.cost,
          isPrimary: productSuppliers.isPrimary,
          
          
          notes: productSuppliers.notes,
          active: productSuppliers.active,
          createdAt: productSuppliers.createdAt,
          updatedAt: productSuppliers.updatedAt,
          supplier: {
            id: suppliers.id,
            tradeName: suppliers.tradeName,
            corporateName: suppliers.corporateName,
            logo: suppliers.logo,
            description: suppliers.description,
          }
        })
        .from(productSuppliers)
        .leftJoin(suppliers, eq(productSuppliers.supplierId, suppliers.id))
        .where(eq(productSuppliers.id, supplierId))
        .limit(1);

      return res.json({
        success: true,
        message: 'Fornecedor atualizado com sucesso',
        data: updatedSupplier[0]
      });
    } catch (error) {
      console.error('Error updating product supplier:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.errors
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Delete a product supplier
   */
  static async deleteProductSupplier(req: AuthenticatedRequest, res: Response) {
    try {
      const productId = parseInt(req.params.productId);
      const supplierId = parseInt(req.params.supplierId);
      const userId = req.user.id;

      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do produto é obrigatório'
        });
      }

      if (!supplierId || isNaN(supplierId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do fornecedor é obrigatório'
        });
      }

      // Verify product ownership
      const product = await db
        .select()
        .from(products)
        .where(and(
          eq(products.id, productId),
          eq(products.userId, userId)
        ))
        .limit(1);

      if (!product.length) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }

      // Check if product supplier exists
      const existingSupplier = await db
        .select()
        .from(productSuppliers)
        .where(and(
          eq(productSuppliers.productId, productId),
          eq(productSuppliers.id, supplierId)
        ))
        .limit(1);

      if (!existingSupplier.length) {
        return res.status(404).json({
          success: false,
          message: 'Fornecedor do produto não encontrado'
        });
      }

      // Get supplier relationship details before deletion for synchronization
      const supplierRelation = await db
        .select({
          supplierId: productSuppliers.supplierId,
          productId: productSuppliers.productId,
          supplierCode: productSuppliers.supplierCode
        })
        .from(productSuppliers)
        .where(eq(productSuppliers.id, supplierId))
        .limit(1);

      // Delete supplier relationship
      await db
        .delete(productSuppliers)
        .where(eq(productSuppliers.id, supplierId));

      // Update supplierProducts table to reflect the unlink (bidirectional sync)
      if (supplierRelation.length > 0) {
        const relation = supplierRelation[0];
        
        // Find corresponding supplier product and update link status to 'pending'
        await db
          .update(supplierProducts)
          .set({ 
            productId: null,
            linkStatus: 'pending',
            updatedAt: new Date()
          })
          .where(and(
            eq(supplierProducts.supplierId, relation.supplierId),
            eq(supplierProducts.productId, relation.productId)
          ));
      }

      return res.json({
        success: true,
        message: 'Fornecedor removido com sucesso'
      });
    } catch (error) {
      console.error('Error deleting product supplier:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Set primary supplier for a product
   */
  static async setPrimarySupplier(req: AuthenticatedRequest, res: Response) {
    try {
      const productId = parseInt(req.params.productId);
      const supplierId = parseInt(req.params.supplierId);
      const userId = req.user.id;

      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do produto é obrigatório'
        });
      }

      if (!supplierId || isNaN(supplierId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do fornecedor é obrigatório'
        });
      }

      // Verify product ownership
      const product = await db
        .select()
        .from(products)
        .where(and(
          eq(products.id, productId),
          eq(products.userId, userId)
        ))
        .limit(1);

      if (!product.length) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }

      // Check if product supplier exists
      const existingSupplier = await db
        .select()
        .from(productSuppliers)
        .where(and(
          eq(productSuppliers.productId, productId),
          eq(productSuppliers.id, supplierId)
        ))
        .limit(1);

      if (!existingSupplier.length) {
        return res.status(404).json({
          success: false,
          message: 'Fornecedor do produto não encontrado'
        });
      }

      // Remove primary flag from all suppliers of this product
      await db
        .update(productSuppliers)
        .set({ isPrimary: false })
        .where(eq(productSuppliers.productId, productId));

      // Set as primary
      await db
        .update(productSuppliers)
        .set({ 
          isPrimary: true,
          updatedAt: new Date()
        })
        .where(eq(productSuppliers.id, supplierId));

      return res.json({
        success: true,
        message: 'Fornecedor definido como principal'
      });
    } catch (error) {
      console.error('Error setting primary supplier:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Get supplier statistics for a product
   */
  static async getSupplierStats(req: AuthenticatedRequest, res: Response) {
    try {
      const productId = parseInt(req.params.productId);
      const userId = req.user.id;

      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do produto é obrigatório'
        });
      }

      // Verify product ownership
      const product = await db
        .select()
        .from(products)
        .where(and(
          eq(products.id, productId),
          eq(products.userId, userId)
        ))
        .limit(1);

      if (!product.length) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }

      // Get all suppliers for statistics
      const suppliersList = await db
        .select({
          id: productSuppliers.id,
          cost: productSuppliers.cost,
          isPrimary: productSuppliers.isPrimary,
          
          active: productSuppliers.active,
          supplier: {
            id: suppliers.id,
            tradeName: suppliers.tradeName,
            corporateName: suppliers.corporateName,
          }
        })
        .from(productSuppliers)
        .leftJoin(suppliers, eq(productSuppliers.supplierId, suppliers.id))
        .where(eq(productSuppliers.productId, productId));

      // Calculate statistics
      const totalSuppliers = suppliersList.length;
      const activeSuppliers = suppliersList.filter(s => s.active).length;
      const inactiveSuppliers = totalSuppliers - activeSuppliers;
      const primarySupplier = suppliersList.find(s => s.isPrimary);

      const costs = suppliersList
        .filter(s => s.cost !== null && s.cost !== undefined)
        .map(s => parseFloat(s.cost.toString()))
        .filter(cost => !isNaN(cost));
      const avgCost = costs.length > 0 ? costs.reduce((a, b) => a + b, 0) / costs.length : 0;
      const lowestCost = costs.length > 0 ? Math.min(...costs) : 0;
      const highestCost = costs.length > 0 ? Math.max(...costs) : 0;


      return res.json({
        success: true,
        data: {
          totalSuppliers,
          activeSuppliers,
          inactiveSuppliers,
          primarySupplier,
          avgCost,
          lowestCost,
          highestCost,
        }
      });
    } catch (error) {
      console.error('Error getting supplier stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}