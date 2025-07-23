import express from 'express';
import { requireAuth } from '../security';
import { requirePermission } from '../middleware/permissions';
import { db } from '../db';
import { importedProducts, insertImportedProductSchema } from '../../shared/schema';
import { eq, and, desc, asc, ilike, count } from 'drizzle-orm';

const router = express.Router();

// GET - Listar produtos importados
router.get('/', requireAuth, requirePermission('importacao.manage_products'), async (req, res) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as string || 'desc';
    
    const offset = (page - 1) * limit;
    
    // Build where conditions
    const whereConditions = [eq(importedProducts.userId, userId)];
    
    if (search) {
      whereConditions.push(ilike(importedProducts.name, `%${search}%`));
    }
    
    if (status) {
      whereConditions.push(eq(importedProducts.status, status));
    }
    
    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(importedProducts)
      .where(and(...whereConditions));
    
    const total = totalResult[0]?.count || 0;
    
    // Get products
    const orderColumn = sortBy === 'name' ? importedProducts.name :
                       sortBy === 'status' ? importedProducts.status :
                       sortBy === 'updatedAt' ? importedProducts.updatedAt :
                       importedProducts.createdAt;
    
    const orderDirection = sortOrder === 'asc' ? asc(orderColumn) : desc(orderColumn);
    
    const products = await db
      .select()
      .from(importedProducts)
      .where(and(...whereConditions))
      .orderBy(orderDirection)
      .limit(limit)
      .offset(offset);

    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    };

    res.json({
      success: true,
      data: {
        products,
        pagination
      }
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET - Buscar produto por ID
router.get('/:id', requireAuth, requirePermission('importacao.manage_products'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    const product = await db
      .select()
      .from(importedProducts)
      .where(and(
        eq(importedProducts.id, id),
        eq(importedProducts.userId, userId)
      ))
      .limit(1);
    
    if (!product.length) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: product[0]
    });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST - Criar novo produto
router.post('/', requireAuth, requirePermission('importacao.manage_products'), async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Validate input
    const validatedData = insertImportedProductSchema.parse({
      ...req.body,
      userId
    });
    
    // Create product
    const newProduct = await db
      .insert(importedProducts)
      .values(validatedData)
      .returning();
    
    res.status(201).json({
      success: true,
      data: newProduct[0],
      message: 'Produto criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// PUT - Atualizar produto
router.put('/:id', requireAuth, requirePermission('importacao.manage_products'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    // Check if product exists and belongs to user
    const existingProduct = await db
      .select()
      .from(importedProducts)
      .where(and(
        eq(importedProducts.id, id),
        eq(importedProducts.userId, userId)
      ))
      .limit(1);
    
    if (!existingProduct.length) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }
    
    // Validate input (excluding userId since it shouldn't change)
    const validatedData = insertImportedProductSchema.omit({ userId: true }).parse(req.body);
    
    // Update product
    const updatedProduct = await db
      .update(importedProducts)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(eq(importedProducts.id, id))
      .returning();
    
    res.json({
      success: true,
      data: updatedProduct[0],
      message: 'Produto atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// DELETE - Remover produto
router.delete('/:id', requireAuth, requirePermission('importacao.manage_products'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    // Check if product exists and belongs to user
    const existingProduct = await db
      .select()
      .from(importedProducts)
      .where(and(
        eq(importedProducts.id, id),
        eq(importedProducts.userId, userId)
      ))
      .limit(1);
    
    if (!existingProduct.length) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }
    
    // Delete product
    await db
      .delete(importedProducts)
      .where(eq(importedProducts.id, id));
    
    res.json({
      success: true,
      message: 'Produto removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover produto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

export default router;