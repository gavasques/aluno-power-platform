import { Router } from "express";
import { db } from "../db";
import { importSimulations, type ImportSimulation, insertImportSimulationSchema } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../security";

const router = Router();

// Get all import simulations for current user
router.get("/", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const simulations = await db
      .select()
      .from(importSimulations)
      .where(eq(importSimulations.userId, userId))
      .orderBy(desc(importSimulations.dataCreated));

    // Add product count from produtos JSON field
    const simulationsWithCounts = simulations.map((simulation) => {
      const produtos = Array.isArray(simulation.produtos) ? simulation.produtos : [];
      return {
        ...simulation,
        productCount: produtos.length
      };
    });

    res.json(simulationsWithCounts);
  } catch (error) {
    console.error("Error fetching import simulations:", error);
    res.status(500).json({ message: "Failed to fetch import simulations" });
  }
});

// Get single import simulation
router.get("/:id", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const simulationId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const simulation = await db
      .select()
      .from(importSimulations)
      .where(and(
        eq(importSimulations.id, simulationId),
        eq(importSimulations.userId, userId)
      ))
      .limit(1);

    if (!simulation.length) {
      return res.status(404).json({ message: "Simulation not found" });
    }

    res.json(simulation[0]);
  } catch (error) {
    console.error("Error fetching import simulation:", error);
    res.status(500).json({ message: "Failed to fetch import simulation" });
  }
});

// Create new import simulation
router.post("/", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Generate unique 8-character code
    const codigoSimulacao = Math.random().toString(36).substring(2, 10).toUpperCase();

    const validatedData = insertImportSimulationSchema.parse({
      ...req.body,
      userId,
      codigoSimulacao,
      configuracoesGerais: req.body.configuracoesGerais || {},
      produtos: req.body.produtos || []
    });

    const [simulation] = await db
      .insert(importSimulations)
      .values(validatedData)
      .returning();

    res.status(201).json(simulation);
  } catch (error) {
    console.error("Error creating import simulation:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create import simulation" });
  }
});

// Update import simulation
router.put("/:id", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const simulationId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify ownership
    const existing = await db
      .select()
      .from(importSimulations)
      .where(and(
        eq(importSimulations.id, simulationId),
        eq(importSimulations.userId, userId)
      ))
      .limit(1);

    if (!existing.length) {
      return res.status(404).json({ message: "Simulation not found" });
    }

    const updateData = insertImportSimulationSchema.partial().parse(req.body);
    
    const [updated] = await db
      .update(importSimulations)
      .set({
        ...updateData,
        dataLastModified: new Date()
      })
      .where(eq(importSimulations.id, simulationId))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("Error updating import simulation:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to update import simulation" });
  }
});

// Delete import simulation
router.delete("/:id", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const simulationId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify ownership
    const existing = await db
      .select()
      .from(importSimulations)
      .where(and(
        eq(importSimulations.id, simulationId),
        eq(importSimulations.userId, userId)
      ))
      .limit(1);

    if (!existing.length) {
      return res.status(404).json({ message: "Simulation not found" });
    }

    // Delete simulation (products will be deleted via CASCADE)
    await db
      .delete(importSimulations)
      .where(eq(importSimulations.id, simulationId));

    res.json({ message: "Simulation deleted successfully" });
  } catch (error) {
    console.error("Error deleting import simulation:", error);
    res.status(500).json({ message: "Failed to delete import simulation" });
  }
});

// PRODUCT ROUTES - Managing products within simulation JSON

// Add product to simulation
router.post("/:id/products", async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const simulationId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get simulation
    const simulation = await db
      .select()
      .from(importSimulations)
      .where(and(
        eq(importSimulations.id, simulationId),
        eq(importSimulations.userId, userId)
      ))
      .limit(1);

    if (!simulation.length) {
      return res.status(404).json({ message: "Simulation not found" });
    }

    // Add product to produtos JSON array
    const currentProducts = Array.isArray(simulation[0].produtos) ? simulation[0].produtos : [];
    const newProduct = {
      id: Date.now(), // Simple ID for JSON array
      ...req.body
    };
    
    const updatedProducts = [...currentProducts, newProduct];

    await db
      .update(importSimulations)
      .set({
        produtos: updatedProducts,
        dataLastModified: new Date()
      })
      .where(eq(importSimulations.id, simulationId));

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Failed to add product" });
  }
});

// Update product in simulation
router.put("/:simulationId/products/:productId", async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const simulationId = parseInt(req.params.simulationId);
    const productId = parseInt(req.params.productId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get simulation
    const simulation = await db
      .select()
      .from(importSimulations)
      .where(and(
        eq(importSimulations.id, simulationId),
        eq(importSimulations.userId, userId)
      ))
      .limit(1);

    if (!simulation.length) {
      return res.status(404).json({ message: "Simulation not found" });
    }

    // Update product in produtos JSON array
    const currentProducts = Array.isArray(simulation[0].produtos) ? simulation[0].produtos : [];
    const updatedProducts = currentProducts.map((product: any) => 
      product.id === productId ? { ...product, ...req.body } : product
    );

    await db
      .update(importSimulations)
      .set({
        produtos: updatedProducts,
        dataLastModified: new Date()
      })
      .where(eq(importSimulations.id, simulationId));

    const updatedProduct = updatedProducts.find((p: any) => p.id === productId);
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// Delete product from simulation
router.delete("/:simulationId/products/:productId", async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const simulationId = parseInt(req.params.simulationId);
    const productId = parseInt(req.params.productId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get simulation
    const simulation = await db
      .select()
      .from(importSimulations)
      .where(and(
        eq(importSimulations.id, simulationId),
        eq(importSimulations.userId, userId)
      ))
      .limit(1);

    if (!simulation.length) {
      return res.status(404).json({ message: "Simulation not found" });
    }

    // Remove product from produtos JSON array
    const currentProducts = Array.isArray(simulation[0].produtos) ? simulation[0].produtos : [];
    const updatedProducts = currentProducts.filter((product: any) => product.id !== productId);

    await db
      .update(importSimulations)
      .set({
        produtos: updatedProducts,
        dataLastModified: new Date()
      })
      .where(eq(importSimulations.id, simulationId));

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

// Calculate simulation results
router.post("/:id/calculate", async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const simulationId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get simulation
    const simulation = await db
      .select()
      .from(importSimulations)
      .where(and(
        eq(importSimulations.id, simulationId),
        eq(importSimulations.userId, userId)
      ))
      .limit(1);

    if (!simulation.length) {
      return res.status(404).json({ message: "Simulation not found" });
    }

    const products = Array.isArray(simulation[0].produtos) ? simulation[0].produtos : [];

    // Implement calculation logic based on your specification
    const calculatedResults = calculateImportCosts(simulation[0], products);

    // Update simulation with results
    const [updated] = await db
      .update(importSimulations)
      .set({
        resultados: calculatedResults,
        updatedAt: new Date()
      })
      .where(eq(importSimulations.id, simulationId))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("Error calculating simulation:", error);
    res.status(500).json({ message: "Failed to calculate simulation" });
  }
});

// Helper function for calculation logic
function calculateImportCosts(simulation: ImportSimulation, products: any[]) {
  // Implement the complex calculation logic from your specification
  // This is a simplified version - you'll need to implement the full logic
  
  const config = simulation.configuracoesGerais as any || {};
  const taxaDolar = Number(config.taxaDolar || 5.5);
  const valorFobDolar = products.reduce((sum, p) => sum + (Number(p.valorUnitarioUsd || 0) * Number(p.quantidade || 1)), 0);
  const valorFreteDolar = Number(config.valorFreteDolar || 0);
  
  // Basic calculations
  const valorFobReal = valorFobDolar * taxaDolar;
  const valorFreteReal = valorFreteDolar * taxaDolar;
  const valorCfrDolar = valorFobDolar + valorFreteDolar;
  const valorCfrReal = valorCfrDolar * taxaDolar;
  
  // Calculate totals from products
  const pesoTotalKg = products.reduce((sum, p) => sum + (Number(p.pesoUnitarioKg || 0) * Number(p.quantidade || 1)), 0);
  const quantidadeTotalItens = products.reduce((sum, p) => sum + Number(p.quantidade || 1), 0);
  
  // Calculate taxes (simplified - implement full tax calculation chain)
  const impostos = Array.isArray(config.impostos) ? config.impostos : [];
  const totalImpostos = impostos.reduce((sum, imposto: any) => sum + (Number(imposto.valor) || 0), 0);
  
  // Calculate expenses
  const despesas = Array.isArray(config.despesasAdicionais) ? config.despesasAdicionais : [];
  const totalDespesas = despesas.reduce((sum, despesa: any) => sum + (Number(despesa.valor_real) || 0), 0);
  
  const custoTotal = valorFobReal + valorFreteReal + totalImpostos + totalDespesas;
  
  return {
    valorFobReal,
    valorFreteReal,
    valorCfrDolar,
    valorCfrReal,
    totalBaseCalculo: valorCfrReal,
    totalImpostos,
    totalDespesas,
    custoTotal,
    pesoTotalKg,
    quantidadeTotalItens,
    calculatedAt: new Date().toISOString()
  };
}

export default router;