import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { db } from "../db";
import { 
  suppliers, 
  categories, 
  supplierFiles,
  supplierBrands,
  supplierReviews,
  supplierContacts,
  supplierConversations,
  supplierProducts,
  products,
  importedProducts,
  importedProductSuppliers
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

// Banking data schema
const bankingDataSchema = z.object({
  bankingData: z.string().optional(),
});

// GET /api/international-suppliers - Get all suppliers for the authenticated user
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get all suppliers for this user with category data
    const userSuppliers = await db
      .select({
        id: suppliers.id,
        tradeName: suppliers.tradeName,
        corporateName: suppliers.corporateName,
        country: suppliers.country,
        status: suppliers.status,
        averageRating: suppliers.averageRating,
        createdAt: suppliers.createdAt,
        updatedAt: suppliers.updatedAt,
        category: {
          id: categories.id,
          name: categories.name
        }
      })
      .from(suppliers)
      .leftJoin(categories, eq(suppliers.categoryId, categories.id))
      .where(eq(suppliers.userId, userId));

    res.json({
      success: true,
      data: userSuppliers,
    });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

// GET /api/international-suppliers/:id/banking - Get banking information for a supplier
router.get("/:id/banking", requireAuth, async (req, res) => {
  try {
    const supplierId = parseInt(req.params.id);
    const userId = req.user!.id;

    if (isNaN(supplierId)) {
      return res.status(400).json({
        success: false,
        message: "ID do fornecedor inválido",
      });
    }

    // Get supplier banking data (ensure user owns this supplier)
    const [supplier] = await db
      .select({
        id: suppliers.id,
        bankingData: suppliers.bankingData,
      })
      .from(suppliers)
      .where(and(eq(suppliers.id, supplierId), eq(suppliers.userId, userId)))
      .limit(1);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Fornecedor não encontrado",
      });
    }

    res.json({
      success: true,
      bankingData: supplier.bankingData || "",
    });
  } catch (error) {
    console.error("Error fetching supplier banking data:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

// PUT /api/international-suppliers/:id/banking - Update banking information for a supplier
router.put("/:id/banking", requireAuth, async (req, res) => {
  try {
    const supplierId = parseInt(req.params.id);
    const userId = req.user!.id;

    if (isNaN(supplierId)) {
      return res.status(400).json({
        success: false,
        message: "ID do fornecedor inválido",
      });
    }

    // Validate request body
    const validation = bankingDataSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: validation.error.errors,
      });
    }

    const { bankingData } = validation.data;

    // Check if supplier exists and belongs to user
    const [existingSupplier] = await db
      .select({ id: suppliers.id })
      .from(suppliers)
      .where(and(eq(suppliers.id, supplierId), eq(suppliers.userId, userId)))
      .limit(1);

    if (!existingSupplier) {
      return res.status(404).json({
        success: false,
        message: "Fornecedor não encontrado",
      });
    }

    // Update banking data
    await db
      .update(suppliers)
      .set({
        bankingData: bankingData || null,
        updatedAt: new Date(),
      })
      .where(and(eq(suppliers.id, supplierId), eq(suppliers.userId, userId)));

    res.json({
      success: true,
      message: "Informações bancárias atualizadas com sucesso",
    });
  } catch (error) {
    console.error("Error updating supplier banking data:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

// DELETE /api/international-suppliers/:id - Delete a supplier
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const supplierId = parseInt(req.params.id);
    const userId = req.user!.id;

    if (isNaN(supplierId)) {
      return res.status(400).json({
        success: false,
        message: "ID do fornecedor inválido",
      });
    }

    // Check if supplier exists and belongs to user
    const [existingSupplier] = await db
      .select({ 
        id: suppliers.id,
        tradeName: suppliers.tradeName 
      })
      .from(suppliers)
      .where(and(eq(suppliers.id, supplierId), eq(suppliers.userId, userId)))
      .limit(1);

    if (!existingSupplier) {
      return res.status(404).json({
        success: false,
        message: "Fornecedor não encontrado",
      });
    }

    // Excluir registros relacionados primeiro (em ordem para evitar foreign key constraints)
    
    // 1. Excluir conversas relacionadas
    await db
      .delete(supplierConversations)
      .where(and(eq(supplierConversations.supplierId, supplierId), eq(supplierConversations.userId, userId)));

    // 2. Excluir contatos relacionados
    await db
      .delete(supplierContacts)
      .where(and(eq(supplierContacts.supplierId, supplierId), eq(supplierContacts.userId, userId)));

    // 3. Excluir arquivos relacionados
    await db
      .delete(supplierFiles)
      .where(and(eq(supplierFiles.supplierId, supplierId), eq(supplierFiles.userId, userId)));

    // 4. Excluir marcas relacionadas
    await db
      .delete(supplierBrands)
      .where(and(eq(supplierBrands.supplierId, supplierId), eq(supplierBrands.userId, userId)));

    // 5. Excluir reviews relacionadas
    await db
      .delete(supplierReviews)
      .where(and(eq(supplierReviews.supplierId, supplierId), eq(supplierReviews.userId, userId)));

    // 6. Excluir produtos relacionados
    await db
      .delete(supplierProducts)
      .where(and(eq(supplierProducts.supplierId, supplierId), eq(supplierProducts.userId, userId)));

    // 7. Atualizar produtos que referenciam este fornecedor (definir como null)
    await db
      .update(products)
      .set({ supplierId: null })
      .where(and(eq(products.supplierId, supplierId), eq(products.userId, userId)));

    // 8. Excluir relações de produtos importados
    await db
      .delete(importedProductSuppliers)
      .where(eq(importedProductSuppliers.supplierId, supplierId));

    // 9. Atualizar produtos importados que referenciam este fornecedor
    await db
      .update(importedProducts)
      .set({ supplierId: null })
      .where(and(eq(importedProducts.supplierId, supplierId), eq(importedProducts.userId, userId)));

    // 10. Finalmente, excluir o fornecedor
    await db
      .delete(suppliers)
      .where(and(eq(suppliers.id, supplierId), eq(suppliers.userId, userId)));

    res.json({
      success: true,
      message: `Fornecedor "${existingSupplier.tradeName}" e todos os dados relacionados foram excluídos com sucesso`,
    });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

export default router;