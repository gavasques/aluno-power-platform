import { Router } from 'express';
import { db } from '../db';
import { 
  importSimulations, 
  insertImportSimulationSchema,
  simplesSimulations,
  mesSimulacao,
  faixaAliquota,
  insertSimplesSimulationSchema,
  insertMesSimulacaoSchema
} from '../../shared/schema';
import { requireAuth } from '../security';
import { eq, desc, and, asc } from 'drizzle-orm';
import { z } from 'zod';

// Função para gerar código único de 8 caracteres alfanuméricos
function generateSimulationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const router = Router();

// Get last 30 import simulations for user
router.get('/import', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    
    const simulations = await db
      .select()
      .from(importSimulations)
      .where(eq(importSimulations.userId, userId))
      .orderBy(desc(importSimulations.dataLastModified))
      .limit(30);

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

    // Gerar código único de simulação
    const codigoSimulacao = generateSimulationCode();

    const newSimulation = await db
      .insert(importSimulations)
      .values({
        userId: userId,
        nomeSimulacao: req.body.nomeSimulacao,
        codigoSimulacao: codigoSimulacao,
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

    // Gerar código único para a cópia
    const codigoSimulacao = generateSimulationCode();

    // Create duplicate
    const duplicatedSimulation = await db
      .insert(importSimulations)
      .values({
        userId: userId,
        nomeSimulacao: `${originalSimulation[0].nomeSimulacao} (Cópia)`,
        codigoSimulacao: codigoSimulacao,
        nomeFornecedor: originalSimulation[0].nomeFornecedor,
        observacoes: originalSimulation[0].observacoes,
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

// ========================================
// SIMPLES NACIONAL ROUTES
// ========================================

// Helper function for tax calculations
async function calculateSimplesNacional(simulationId: number, competencia: number, ano: number, faturamento: string, anexo: string) {
  try {
    // Get all months from this simulation, ordered by year and month
    const allMeses = await db
      .select()
      .from(mesSimulacao)
      .where(eq(mesSimulacao.idSimulacao, simulationId))
      .orderBy(asc(mesSimulacao.ano), asc(mesSimulacao.competencia));

    // Calculate RBT12 (sum of last 12 months including current)
    let soma12Meses = parseFloat(faturamento);
    let monthsCount = 1;
    
    for (let i = allMeses.length - 1; i >= 0 && monthsCount < 12; i--) {
      const mes = allMeses[i];
      if (mes.competencia !== competencia || mes.ano !== ano) {
        soma12Meses += parseFloat(mes.faturamento || '0');
        monthsCount++;
      }
    }

    // Calculate média 12 meses
    const media12Meses = soma12Meses / 12;

    // Calculate disponível média (using 20% of monthly limit = R$ 30,000)
    const limiteAnual = 3600000; // R$ 3.6M
    const limiteMensal = limiteAnual / 12; // R$ 300,000
    const disponivelMedia = limiteMensal - media12Meses;

    // Calculate disponível anual  
    const disponivelAnual = limiteAnual - soma12Meses;

    // Get tax brackets for this anexo
    const faixas = await db
      .select()
      .from(faixaAliquota)
      .where(eq(faixaAliquota.anexo, anexo))
      .orderBy(asc(faixaAliquota.faixaInicial));

    // Find applicable tax bracket
    let faixaAplicavel = faixas[0]; // Default to first bracket
    for (const faixa of faixas) {
      if (soma12Meses >= parseFloat(faixa.faixaInicial) && soma12Meses <= parseFloat(faixa.faixaFinal)) {
        faixaAplicavel = faixa;
        break;
      }
    }

    // Calculate effective tax rate
    const aliquotaEfetiva = ((soma12Meses * parseFloat(faixaAplicavel.aliquotaNominal)) - parseFloat(faixaAplicavel.valorDeduzir)) / soma12Meses;
    
    // Calculate monthly tax value
    const valorImposto = parseFloat(faturamento) * aliquotaEfetiva;

    return {
      soma12Meses: soma12Meses.toFixed(2),
      media12Meses: media12Meses.toFixed(2),
      disponivelMedia: disponivelMedia.toFixed(2),
      disponivelAnual: disponivelAnual.toFixed(2),
      aliquotaEfetiva: aliquotaEfetiva.toFixed(4),
      valorImposto: valorImposto.toFixed(2)
    };
  } catch (error) {
    console.error('Error calculating Simples Nacional:', error);
    throw error;
  }
}

// Get all simples simulations for user
router.get('/simples', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    
    const simulations = await db
      .select()
      .from(simplesSimulations)
      .where(eq(simplesSimulations.userId, userId))
      .orderBy(desc(simplesSimulations.dataLastModified))
      .limit(30);

    res.json(simulations);
  } catch (error) {
    console.error('Error fetching simples simulations:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get specific simples simulation with months
router.get('/simples/:id', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const simulationId = parseInt(req.params.id);

    const simulation = await db
      .select()
      .from(simplesSimulations)
      .where(eq(simplesSimulations.id, simulationId))
      .limit(1);

    if (!simulation.length || simulation[0].userId !== userId) {
      return res.status(404).json({ error: 'Simulação não encontrada' });
    }

    const meses = await db
      .select()
      .from(mesSimulacao)
      .where(eq(mesSimulacao.idSimulacao, simulationId))
      .orderBy(asc(mesSimulacao.ano), asc(mesSimulacao.competencia));

    res.json({
      ...simulation[0],
      meses
    });
  } catch (error) {
    console.error('Error fetching simples simulation:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Create new simples simulation
router.post('/simples', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    
    const validationResult = insertSimplesSimulationSchema.safeParse({
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
      .insert(simplesSimulations)
      .values({
        userId: userId,
        nomeSimulacao: req.body.nomeSimulacao
      })
      .returning();

    res.status(201).json(newSimulation[0]);
  } catch (error) {
    console.error('Error creating simples simulation:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Update simples simulation
router.put('/simples/:id', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const simulationId = parseInt(req.params.id);

    const existingSimulation = await db
      .select()
      .from(simplesSimulations)
      .where(eq(simplesSimulations.id, simulationId))
      .limit(1);

    if (!existingSimulation.length || existingSimulation[0].userId !== userId) {
      return res.status(404).json({ error: 'Simulação não encontrada' });
    }

    const updatedSimulation = await db
      .update(simplesSimulations)
      .set({
        nomeSimulacao: req.body.nomeSimulacao,
        dataLastModified: new Date()
      })
      .where(eq(simplesSimulations.id, simulationId))
      .returning();

    res.json(updatedSimulation[0]);
  } catch (error) {
    console.error('Error updating simples simulation:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Delete simples simulation
router.delete('/simples/:id', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const simulationId = parseInt(req.params.id);

    const existingSimulation = await db
      .select()
      .from(simplesSimulations)
      .where(eq(simplesSimulations.id, simulationId))
      .limit(1);

    if (!existingSimulation.length || existingSimulation[0].userId !== userId) {
      return res.status(404).json({ error: 'Simulação não encontrada' });
    }

    await db
      .delete(simplesSimulations)
      .where(eq(simplesSimulations.id, simulationId));

    res.json({ message: 'Simulação excluída com sucesso' });
  } catch (error) {
    console.error('Error deleting simples simulation:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Add month to simulation
router.post('/simples/:id/mes', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const simulationId = parseInt(req.params.id);

    // Check if simulation exists and belongs to user
    const simulation = await db
      .select()
      .from(simplesSimulations)
      .where(eq(simplesSimulations.id, simulationId))
      .limit(1);

    if (!simulation.length || simulation[0].userId !== userId) {
      return res.status(404).json({ error: 'Simulação não encontrada' });
    }

    const validationResult = insertMesSimulacaoSchema.safeParse({
      ...req.body,
      idSimulacao: simulationId
    });

    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: validationResult.error.errors
      });
    }

    // Calculate tax values
    const calculations = await calculateSimplesNacional(
      simulationId,
      req.body.competencia,
      req.body.ano,
      req.body.faturamento,
      req.body.anexo
    );

    const newMes = await db
      .insert(mesSimulacao)
      .values({
        idSimulacao: simulationId,
        competencia: req.body.competencia,
        ano: req.body.ano,
        faturamento: req.body.faturamento,
        anexo: req.body.anexo,
        ...calculations
      })
      .returning();

    // Update simulation last modified
    await db
      .update(simplesSimulations)
      .set({ dataLastModified: new Date() })
      .where(eq(simplesSimulations.id, simulationId));

    res.status(201).json(newMes[0]);
  } catch (error) {
    console.error('Error adding month to simulation:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Update month in simulation
router.put('/simples/:id/mes/:mesId', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const simulationId = parseInt(req.params.id);
    const mesId = parseInt(req.params.mesId);

    // Check if simulation exists and belongs to user
    const simulation = await db
      .select()
      .from(simplesSimulations)
      .where(eq(simplesSimulations.id, simulationId))
      .limit(1);

    if (!simulation.length || simulation[0].userId !== userId) {
      return res.status(404).json({ error: 'Simulação não encontrada' });
    }

    // Calculate new tax values
    const calculations = await calculateSimplesNacional(
      simulationId,
      req.body.competencia,
      req.body.ano,
      req.body.faturamento,
      req.body.anexo
    );

    const updatedMes = await db
      .update(mesSimulacao)
      .set({
        competencia: req.body.competencia,
        ano: req.body.ano,
        faturamento: req.body.faturamento,
        anexo: req.body.anexo,
        ...calculations
      })
      .where(and(
        eq(mesSimulacao.id, mesId),
        eq(mesSimulacao.idSimulacao, simulationId)
      ))
      .returning();

    if (!updatedMes.length) {
      return res.status(404).json({ error: 'Mês não encontrado' });
    }

    // Update simulation last modified
    await db
      .update(simplesSimulations)
      .set({ dataLastModified: new Date() })
      .where(eq(simplesSimulations.id, simulationId));

    res.json(updatedMes[0]);
  } catch (error) {
    console.error('Error updating month:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Delete month from simulation
router.delete('/simples/:id/mes/:mesId', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const simulationId = parseInt(req.params.id);
    const mesId = parseInt(req.params.mesId);

    // Check if simulation exists and belongs to user
    const simulation = await db
      .select()
      .from(simplesSimulations)
      .where(eq(simplesSimulations.id, simulationId))
      .limit(1);

    if (!simulation.length || simulation[0].userId !== userId) {
      return res.status(404).json({ error: 'Simulação não encontrada' });
    }

    await db
      .delete(mesSimulacao)
      .where(and(
        eq(mesSimulacao.id, mesId),
        eq(mesSimulacao.idSimulacao, simulationId)
      ));

    // Update simulation last modified
    await db
      .update(simplesSimulations)
      .set({ dataLastModified: new Date() })
      .where(eq(simplesSimulations.id, simulationId));

    res.json({ message: 'Mês excluído com sucesso' });
  } catch (error) {
    console.error('Error deleting month:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get tax brackets
router.get('/simples/faixas/:anexo', async (req, res) => {
  try {
    const anexo = req.params.anexo;
    
    if (!['Anexo I', 'Anexo II'].includes(anexo)) {
      return res.status(400).json({ error: 'Anexo inválido. Use "Anexo I" ou "Anexo II"' });
    }

    const faixas = await db
      .select()
      .from(faixaAliquota)
      .where(eq(faixaAliquota.anexo, anexo))
      .orderBy(asc(faixaAliquota.faixaInicial));

    res.json(faixas);
  } catch (error) {
    console.error('Error fetching tax brackets:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;