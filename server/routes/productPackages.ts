import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { db } from "../db";
import { productPackages, importedProducts } from "@shared/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

// Package schema for validation
const packageSchema = z.object({
  productId: z.string().min(1),
  packageNumber: z.number().int().min(1),
  packageType: z.string().min(1),
  contentsDescription: z.string().optional(),
  packageEan: z.string().optional(),
  dimensionsLength: z.number().optional(),
  dimensionsWidth: z.number().optional(),
  dimensionsHeight: z.number().optional(),
  weightGross: z.number().optional(),
  weightNet: z.number().optional(),
  volumeCbm: z.number().optional(),
  unitsInPackage: z.number().int().min(1).default(1),
  packagingMaterial: z.string().optional(),
  specialHandling: z.string().optional(),
});

// GET /api/product-packages/product/:productId - Get all packages for a product
router.get("/product/:productId", requireAuth, async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user!.id;

    // Verify that the user owns this product
    const [product] = await db
      .select({ id: importedProducts.id })
      .from(importedProducts)
      .where(and(eq(importedProducts.id, productId), eq(importedProducts.userId, userId)))
      .limit(1);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produto não encontrado",
      });
    }

    // Get all packages for this product
    const packages = await db
      .select()
      .from(productPackages)
      .where(eq(productPackages.productId, productId))
      .orderBy(productPackages.packageNumber);

    res.json({
      success: true,
      data: packages,
    });
  } catch (error) {
    console.error("Error fetching product packages:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

// POST /api/product-packages - Create a new package
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Validate request body
    const validation = packageSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: validation.error.errors,
      });
    }

    const data = validation.data;

    // Verify that the user owns this product
    const [product] = await db
      .select({ id: importedProducts.id })
      .from(importedProducts)
      .where(and(eq(importedProducts.id, data.productId), eq(importedProducts.userId, userId)))
      .limit(1);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produto não encontrado",
      });
    }

    // Create the package
    const [newPackage] = await db
      .insert(productPackages)
      .values({
        productId: data.productId,
        packageNumber: data.packageNumber,
        packageType: data.packageType,
        contentsDescription: data.contentsDescription || null,
        packageEan: data.packageEan || null,
        dimensionsLength: data.dimensionsLength ? data.dimensionsLength.toString() : null,
        dimensionsWidth: data.dimensionsWidth ? data.dimensionsWidth.toString() : null,
        dimensionsHeight: data.dimensionsHeight ? data.dimensionsHeight.toString() : null,
        weightGross: data.weightGross ? data.weightGross.toString() : null,
        weightNet: data.weightNet ? data.weightNet.toString() : null,
        volumeCbm: data.volumeCbm ? data.volumeCbm.toString() : null,
        unitsInPackage: data.unitsInPackage,
        packagingMaterial: data.packagingMaterial || null,
        specialHandling: data.specialHandling || null,
      })
      .returning();

    res.status(201).json({
      success: true,
      data: newPackage,
      message: "Embalagem criada com sucesso",
    });
  } catch (error) {
    console.error("Error creating product package:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

// PUT /api/product-packages/:id - Update a package
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const packageId = req.params.id;
    const userId = req.user!.id;

    // Validate request body
    const validation = packageSchema.omit({ productId: true }).safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: validation.error.errors,
      });
    }

    const data = validation.data;

    // Verify that the user owns this package (through the product)
    const [existingPackage] = await db
      .select({
        id: productPackages.id,
        productId: productPackages.productId,
      })
      .from(productPackages)
      .innerJoin(importedProducts, eq(productPackages.productId, importedProducts.id))
      .where(and(eq(productPackages.id, packageId), eq(importedProducts.userId, userId)))
      .limit(1);

    if (!existingPackage) {
      return res.status(404).json({
        success: false,
        message: "Embalagem não encontrada",
      });
    }

    // Update the package
    const [updatedPackage] = await db
      .update(productPackages)
      .set({
        packageNumber: data.packageNumber,
        packageType: data.packageType,
        contentsDescription: data.contentsDescription || null,
        packageEan: data.packageEan || null,
        dimensionsLength: data.dimensionsLength ? data.dimensionsLength.toString() : null,
        dimensionsWidth: data.dimensionsWidth ? data.dimensionsWidth.toString() : null,
        dimensionsHeight: data.dimensionsHeight ? data.dimensionsHeight.toString() : null,
        weightGross: data.weightGross ? data.weightGross.toString() : null,
        weightNet: data.weightNet ? data.weightNet.toString() : null,
        volumeCbm: data.volumeCbm ? data.volumeCbm.toString() : null,
        unitsInPackage: data.unitsInPackage,
        packagingMaterial: data.packagingMaterial || null,
        specialHandling: data.specialHandling || null,
      })
      .where(eq(productPackages.id, packageId))
      .returning();

    res.json({
      success: true,
      data: updatedPackage,
      message: "Embalagem atualizada com sucesso",
    });
  } catch (error) {
    console.error("Error updating product package:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

// DELETE /api/product-packages/:id - Delete a package
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const packageId = req.params.id;
    const userId = req.user!.id;

    // Verify that the user owns this package (through the product)
    const [existingPackage] = await db
      .select({
        id: productPackages.id,
        productId: productPackages.productId,
      })
      .from(productPackages)
      .innerJoin(importedProducts, eq(productPackages.productId, importedProducts.id))
      .where(and(eq(productPackages.id, packageId), eq(importedProducts.userId, userId)))
      .limit(1);

    if (!existingPackage) {
      return res.status(404).json({
        success: false,
        message: "Embalagem não encontrada",
      });
    }

    // Delete the package
    await db
      .delete(productPackages)
      .where(eq(productPackages.id, packageId));

    res.json({
      success: true,
      message: "Embalagem removida com sucesso",
    });
  } catch (error) {
    console.error("Error deleting product package:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

export default router;