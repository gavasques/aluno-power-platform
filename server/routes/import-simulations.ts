import { Request, Response, Router } from "express";
import { db } from "../db";
import { importSimulations, type InsertImportSimulation } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../security";

const router = Router();

// Get all import simulations for a user
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const simulations = await db
      .select()
      .from(importSimulations)
      .where(eq(importSimulations.userId, userId))
      .orderBy(desc(importSimulations.updatedAt));
    
    res.json(simulations);
  } catch (error) {
    console.error('Error fetching import simulations:', error);
    res.status(500).json({ error: 'Failed to fetch simulations' });
  }
});

// Get a specific import simulation
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const simulationId = parseInt(req.params.id);
    
    const [simulation] = await db
      .select()
      .from(importSimulations)
      .where(eq(importSimulations.id, simulationId));
    
    if (!simulation || simulation.userId !== userId) {
      return res.status(404).json({ error: 'Simulation not found' });
    }
    
    res.json(simulation);
  } catch (error) {
    console.error('Error fetching import simulation:', error);
    res.status(500).json({ error: 'Failed to fetch simulation' });
  }
});

// Create a new import simulation
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const simulationData: InsertImportSimulation = {
      ...req.body,
      userId,
    };
    
    const [simulation] = await db
      .insert(importSimulations)
      .values(simulationData)
      .returning();
    
    res.status(201).json(simulation);
  } catch (error) {
    console.error('Error creating import simulation:', error);
    res.status(500).json({ error: 'Failed to create simulation' });
  }
});

// Update an import simulation
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const simulationId = parseInt(req.params.id);
    
    // Verify ownership
    const [existing] = await db
      .select()
      .from(importSimulations)
      .where(eq(importSimulations.id, simulationId));
    
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: 'Simulation not found' });
    }
    
    const [simulation] = await db
      .update(importSimulations)
      .set({ 
        ...req.body, 
        updatedAt: new Date() 
      })
      .where(eq(importSimulations.id, simulationId))
      .returning();
    
    res.json(simulation);
  } catch (error) {
    console.error('Error updating import simulation:', error);
    res.status(500).json({ error: 'Failed to update simulation' });
  }
});

// Delete an import simulation
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const simulationId = parseInt(req.params.id);
    
    // Verify ownership
    const [existing] = await db
      .select()
      .from(importSimulations)
      .where(eq(importSimulations.id, simulationId));
    
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: 'Simulation not found' });
    }
    
    await db
      .delete(importSimulations)
      .where(eq(importSimulations.id, simulationId));
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting import simulation:', error);
    res.status(500).json({ error: 'Failed to delete simulation' });
  }
});

export default router;