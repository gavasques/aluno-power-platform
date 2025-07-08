import { Request, Response, Router } from "express";
import { db } from "../db";
import { investmentSimulations, type InsertInvestmentSimulation } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../security";

const router = Router();

// Get all investment simulations for a user
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const simulations = await db
      .select()
      .from(investmentSimulations)
      .where(eq(investmentSimulations.userId, userId))
      .orderBy(desc(investmentSimulations.updatedAt));
    
    res.json(simulations);
  } catch (error) {
    console.error('Error fetching investment simulations:', error);
    res.status(500).json({ error: 'Failed to fetch simulations' });
  }
});

// Get a specific investment simulation
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const simulationId = parseInt(req.params.id);
    
    const [simulation] = await db
      .select()
      .from(investmentSimulations)
      .where(eq(investmentSimulations.id, simulationId));
    
    if (!simulation || simulation.userId !== userId) {
      return res.status(404).json({ error: 'Simulation not found' });
    }
    
    res.json(simulation);
  } catch (error) {
    console.error('Error fetching investment simulation:', error);
    res.status(500).json({ error: 'Failed to fetch simulation' });
  }
});

// Create a new investment simulation
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const simulationData: InsertInvestmentSimulation = {
      ...req.body,
      userId,
    };
    
    const [simulation] = await db
      .insert(investmentSimulations)
      .values(simulationData)
      .returning();
    
    res.status(201).json(simulation);
  } catch (error) {
    console.error('Error creating investment simulation:', error);
    res.status(500).json({ error: 'Failed to create simulation' });
  }
});

// Update an investment simulation
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const simulationId = parseInt(req.params.id);
    
    // Verify ownership
    const [existing] = await db
      .select()
      .from(investmentSimulations)
      .where(eq(investmentSimulations.id, simulationId));
    
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: 'Simulation not found' });
    }
    
    const [simulation] = await db
      .update(investmentSimulations)
      .set({ 
        ...req.body, 
        updatedAt: new Date() 
      })
      .where(eq(investmentSimulations.id, simulationId))
      .returning();
    
    res.json(simulation);
  } catch (error) {
    console.error('Error updating investment simulation:', error);
    res.status(500).json({ error: 'Failed to update simulation' });
  }
});

// Delete an investment simulation
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const simulationId = parseInt(req.params.id);
    
    // Verify ownership
    const [existing] = await db
      .select()
      .from(investmentSimulations)
      .where(eq(investmentSimulations.id, simulationId));
    
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: 'Simulation not found' });
    }
    
    await db
      .delete(investmentSimulations)
      .where(eq(investmentSimulations.id, simulationId));
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting investment simulation:', error);
    res.status(500).json({ error: 'Failed to delete simulation' });
  }
});

export default router;