import express from 'express';
import { db } from '../db.js';
import { eq, and } from 'drizzle-orm';
import { importedProductSuppliers, importedProducts, suppliers } from '../../shared/schema.js';
import { insertImportedProductSupplierSchema } from '../../shared/schema.js';
import { requireAuth } from '../security.js';

const router = express.Router();

// Aplicar middleware de autenticação para todas as rotas
router.use(requireAuth);

// GET /api/imported-products/:productId/suppliers - Listar fornecedores de um produto importado
router.get('/:productId/suppliers', async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user!.id;

    // Verificar se o produto pertence ao usuário
    const product = await db
      .select()
      .from(importedProducts)
      .where(and(
        eq(importedProducts.id, productId),
        eq(importedProducts.userId, userId)
      ))
      .limit(1);

    if (product.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Produto não encontrado' 
      });
    }

    // Buscar fornecedores do produto com informações do fornecedor
    const productSuppliers = await db
      .select({
        id: importedProductSuppliers.id,
        productId: importedProductSuppliers.productId,
        supplierId: importedProductSuppliers.supplierId,
        supplierProductCode: importedProductSuppliers.supplierProductCode,
        supplierProductName: importedProductSuppliers.supplierProductName,
        moq: importedProductSuppliers.moq,
        leadTimeDays: importedProductSuppliers.leadTimeDays,
        createdAt: importedProductSuppliers.createdAt,
        updatedAt: importedProductSuppliers.updatedAt,
        supplierTradeName: suppliers.tradeName,
        supplierCorporateName: suppliers.corporateName,
        supplierEmail: suppliers.commercialEmail,
      })
      .from(importedProductSuppliers)
      .innerJoin(suppliers, eq(importedProductSuppliers.supplierId, suppliers.id))
      .where(eq(importedProductSuppliers.productId, productId));

    res.json({
      success: true,
      data: productSuppliers
    });
  } catch (error) {
    console.error('Erro ao buscar fornecedores do produto:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// POST /api/imported-products/:productId/suppliers - Adicionar fornecedor ao produto
router.post('/:productId/suppliers', async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user!.id;

    // Verificar se o produto pertence ao usuário
    const product = await db
      .select()
      .from(importedProducts)
      .where(and(
        eq(importedProducts.id, productId),
        eq(importedProducts.userId, userId)
      ))
      .limit(1);

    if (product.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Produto não encontrado' 
      });
    }

    // Validar dados de entrada
    const validatedData = insertImportedProductSupplierSchema.parse({
      ...req.body,
      productId
    });

    // Verificar se a relação já existe
    const existingRelation = await db
      .select()
      .from(importedProductSuppliers)
      .where(and(
        eq(importedProductSuppliers.productId, productId),
        eq(importedProductSuppliers.supplierId, validatedData.supplierId)
      ))
      .limit(1);

    if (existingRelation.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Este fornecedor já está associado ao produto'
      });
    }

    // Criar nova relação
    const [newRelation] = await db
      .insert(importedProductSuppliers)
      .values(validatedData)
      .returning();

    res.status(201).json({
      success: true,
      data: newRelation
    });
  } catch (error) {
    console.error('Erro ao adicionar fornecedor ao produto:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// PUT /api/imported-products/:productId/suppliers/:supplierId - Atualizar fornecedor do produto
router.put('/:productId/suppliers/:supplierId', async (req, res) => {
  try {
    const { productId, supplierId } = req.params;
    const userId = req.user!.id;

    // Verificar se o produto pertence ao usuário
    const product = await db
      .select()
      .from(importedProducts)
      .where(and(
        eq(importedProducts.id, productId),
        eq(importedProducts.userId, userId)
      ))
      .limit(1);

    if (product.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Produto não encontrado' 
      });
    }

    // Verificar se a relação existe
    const existingRelation = await db
      .select()
      .from(importedProductSuppliers)
      .where(and(
        eq(importedProductSuppliers.productId, productId),
        eq(importedProductSuppliers.supplierId, parseInt(supplierId))
      ))
      .limit(1);

    if (existingRelation.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Relação produto-fornecedor não encontrada'
      });
    }

    // Atualizar dados
    const updateData = {
      supplierProductCode: req.body.supplierProductCode,
      supplierProductName: req.body.supplierProductName,
      moq: req.body.moq,
      leadTimeDays: req.body.leadTimeDays,
      updatedAt: new Date()
    };

    const [updatedRelation] = await db
      .update(importedProductSuppliers)
      .set(updateData)
      .where(and(
        eq(importedProductSuppliers.productId, productId),
        eq(importedProductSuppliers.supplierId, parseInt(supplierId))
      ))
      .returning();

    res.json({
      success: true,
      data: updatedRelation
    });
  } catch (error) {
    console.error('Erro ao atualizar fornecedor do produto:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// DELETE /api/imported-products/:productId/suppliers/:supplierId - Remover fornecedor do produto
router.delete('/:productId/suppliers/:supplierId', async (req, res) => {
  try {
    const { productId, supplierId } = req.params;
    const userId = req.user!.id;

    // Verificar se o produto pertence ao usuário
    const product = await db
      .select()
      .from(importedProducts)
      .where(and(
        eq(importedProducts.id, productId),
        eq(importedProducts.userId, userId)
      ))
      .limit(1);

    if (product.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Produto não encontrado' 
      });
    }

    // Remover relação
    const deletedRelation = await db
      .delete(importedProductSuppliers)
      .where(and(
        eq(importedProductSuppliers.productId, productId),
        eq(importedProductSuppliers.supplierId, parseInt(supplierId))
      ))
      .returning();

    if (deletedRelation.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Relação produto-fornecedor não encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Fornecedor removido do produto com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover fornecedor do produto:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

export default router;