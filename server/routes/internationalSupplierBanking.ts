import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { db } from "../db";
import { suppliers } from "@shared/schema";
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

    // Get all suppliers for this user
    const userSuppliers = await db
      .select()
      .from(suppliers)
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

export default router;