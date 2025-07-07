import { Router } from 'express';
import { db } from '../db';
import { importSimulations, insertImportSimulationSchema } from '../../shared/schema';
import { requireAuth } from '../security';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Get all import simulations for user
router.get('/import', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    
    const simulations = await db
      .select()
      .from(importSimulations)
      .where(eq(importSimulations.userId, userId))
      .orderBy(desc(importSimulations.dataLastModified));

    res.json(simulations);
  } catch (error) {
    console.error('Error fetching import simulations:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get specific import simulation
router.get('/import/:id', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const simulationId = parseInt(req.params.id);

    const simulation = await db
      .select()
      .from(importSimulations)
      .where(eq(importSimulations.id, simulationId))
      .limit(1);

    if (!simulation.length || simulation[0].userId !== userId) {
      return res.status(404).json({ error: 'Simulação não encontrada' });
    }

    res.json(simulation[0]);
  } catch (error) {
    console.error('Error fetching import simulation:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Create new import simulation
router.post('/import', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    
    // Validate request body
    const validationResult = insertImportSimulationSchema.safeParse({
      ...req.body,
      userId: userId
    });

    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: validationResult.error.errors
      });
    }

    const newSimulation = await db
      .insert(importSimulations)
      .values({
        userId: userId,
        nomeSimulacao: req.body.nomeSimulacao,
        nomeFornecedor: req.body.nomeFornecedor,
        observacoes: req.body.observacoes,
        configuracoesGerais: req.body.configuracoesGerais,
        produtos: req.body.produtos
      })
      .returning();

    res.status(201).json(newSimulation[0]);
  } catch (error) {
    console.error('Error creating import simulation:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Update import simulation
router.put('/import/:id', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const simulationId = parseInt(req.params.id);

    // Check if simulation exists and belongs to user
    const existingSimulation = await db
      .select()
      .from(importSimulations)
      .where(eq(importSimulations.id, simulationId))
      .limit(1);

    if (!existingSimulation.length || existingSimulation[0].userId !== userId) {
      return res.status(404).json({ error: 'Simulação não encontrada' });
    }

    // Update simulation
    const updatedSimulation = await db
      .update(importSimulations)
      .set({
        nomeSimulacao: req.body.nomeSimulacao,
        nomeFornecedor: req.body.nomeFornecedor,
        observacoes: req.body.observacoes,
        configuracoesGerais: req.body.configuracoesGerais,
        produtos: req.body.produtos,
        dataLastModified: new Date()
      })
      .where(eq(importSimulations.id, simulationId))
      .returning();

    res.json(updatedSimulation[0]);
  } catch (error) {
    console.error('Error updating import simulation:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Delete import simulation
router.delete('/import/:id', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const simulationId = parseInt(req.params.id);

    // Check if simulation exists and belongs to user
    const existingSimulation = await db
      .select()
      .from(importSimulations)
      .where(eq(importSimulations.id, simulationId))
      .limit(1);

    if (!existingSimulation.length || existingSimulation[0].userId !== userId) {
      return res.status(404).json({ error: 'Simulação não encontrada' });
    }

    // Delete simulation
    await db
      .delete(importSimulations)
      .where(eq(importSimulations.id, simulationId));

    res.json({ message: 'Simulação excluída com sucesso' });
  } catch (error) {
    console.error('Error deleting import simulation:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Duplicate import simulation
router.post('/import/:id/duplicate', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const simulationId = parseInt(req.params.id);

    // Get original simulation
    const originalSimulation = await db
      .select()
      .from(importSimulations)
      .where(eq(importSimulations.id, simulationId))
      .limit(1);

    if (!originalSimulation.length || originalSimulation[0].userId !== userId) {
      return res.status(404).json({ error: 'Simulação não encontrada' });
    }

    // Create duplicate
    const duplicatedSimulation = await db
      .insert(importSimulations)
      .values({
        userId: userId,
        nomeSimulacao: `${originalSimulation[0].nomeSimulacao} (Cópia)`,
        configuracoesGerais: originalSimulation[0].configuracoesGerais,
        produtos: originalSimulation[0].produtos
      })
      .returning();

    res.status(201).json(duplicatedSimulation[0]);
  } catch (error) {
    console.error('Error duplicating import simulation:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;