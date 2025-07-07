import { Router } from 'express';
import { db } from '../db';
import { importSimulations, insertImportSimulationSchema, simplesNacionalSimulations, insertSimplesNacionalSimulationSchema } from '../../shared/schema';
import { requireAuth } from '../security';
import { eq, desc } from 'drizzle-orm';
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

// Simples Nacional Simulator Routes

// Tabela de faixas do Simples Nacional
const tabelaFaixas = [
  { faixa: "1ª Faixa", aliquota: 0.04, valorReduzir: 0, inicio: 0, fim: 180000 },
  { faixa: "2ª Faixa", aliquota: 0.073, valorReduzir: 5940, inicio: 180000.01, fim: 360000 },
  { faixa: "3ª Faixa", aliquota: 0.095, valorReduzir: 13860, inicio: 360000.01, fim: 720000 },
  { faixa: "4ª Faixa", aliquota: 0.107, valorReduzir: 22500, inicio: 720000.01, fim: 1800000 },
  { faixa: "5ª Faixa", aliquota: 0.143, valorReduzir: 87300, inicio: 1800000.01, fim: 3600000 }
];

// Função para calcular tarifa do Simples Nacional
function calcularTarifaSimples(faturamento12Meses: number, faturamentoSemST: number, faturamentoComST: number) {
  // 1. Calcular faturamento total do mês
  const faturamentoTotal = faturamentoSemST + faturamentoComST;
  
  // 2. Determinar faixa de alíquota
  let faixaAtual = null;
  for (const faixa of tabelaFaixas) {
    if (faturamento12Meses >= faixa.inicio && faturamento12Meses <= faixa.fim) {
      faixaAtual = faixa;
      break;
    }
  }
  
  // Verificar se está acima da última faixa
  if (!faixaAtual && faturamento12Meses > tabelaFaixas[tabelaFaixas.length - 1].fim) {
    return {
      erro: "Faturamento acima do limite do Simples Nacional (R$ 3.600.000,00)"
    };
  }
  
  if (!faixaAtual) {
    return {
      erro: "Não foi possível determinar a faixa de alíquota"
    };
  }
  
  // 3. Calcular alíquota efetiva
  const aliquotaBase = faixaAtual.aliquota;
  const valorReduzir = faixaAtual.valorReduzir;
  const aliquotaEfetiva = (faturamento12Meses * aliquotaBase - valorReduzir) / faturamento12Meses;
  
  // 4. Determinar percentual de ICMS
  const percentualICMS = faturamento12Meses < 360000 ? 0.34 : 0.335;
  
  // 5. Calcular valor do Simples sem ST
  const valorSimplesSemST = faturamentoSemST * aliquotaEfetiva;
  
  // 6. Calcular valor do Simples com ST (com redução do ICMS)
  const valorSimplesComST = faturamentoComST * aliquotaEfetiva * (1 - percentualICMS);
  
  // 7. Calcular valor total do Simples
  const valorTotalSimples = valorSimplesSemST + valorSimplesComST;
  
  return {
    faturamentoTotal,
    aliquotaBase,
    valorReduzir,
    aliquotaEfetiva,
    percentualICMS,
    valorSimplesSemST,
    valorSimplesComST,
    valorTotalSimples
  };
}

// Get last 30 Simples Nacional simulations for user
router.get('/simples-nacional', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    
    const simulations = await db
      .select()
      .from(simplesNacionalSimulations)
      .where(eq(simplesNacionalSimulations.userId, userId))
      .orderBy(desc(simplesNacionalSimulations.dataLastModified))
      .limit(30);

    res.json(simulations);
  } catch (error) {
    console.error('Error fetching Simples Nacional simulations:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get specific Simples Nacional simulation
router.get('/simples-nacional/:id', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const simulationId = parseInt(req.params.id);

    const simulation = await db
      .select()
      .from(simplesNacionalSimulations)
      .where(eq(simplesNacionalSimulations.id, simulationId))
      .limit(1);

    if (!simulation.length || simulation[0].userId !== userId) {
      return res.status(404).json({ error: 'Simulação não encontrada' });
    }

    res.json(simulation[0]);
  } catch (error) {
    console.error('Error fetching Simples Nacional simulation:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Create new Simples Nacional simulation
router.post('/simples-nacional', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    
    // Validate input
    const faturamento12Meses = parseFloat(req.body.faturamento12Meses);
    const faturamentoSemST = parseFloat(req.body.faturamentoSemST);
    const faturamentoComST = parseFloat(req.body.faturamentoComST);
    
    if (isNaN(faturamento12Meses) || isNaN(faturamentoSemST) || isNaN(faturamentoComST)) {
      return res.status(400).json({ error: 'Valores inválidos fornecidos' });
    }
    
    // Calculate values
    const calculoResult = calcularTarifaSimples(faturamento12Meses, faturamentoSemST, faturamentoComST);
    
    if (calculoResult.erro) {
      return res.status(400).json({ error: calculoResult.erro });
    }
    
    // Generate unique code
    const codigoSimulacao = generateSimulationCode();

    const newSimulation = await db
      .insert(simplesNacionalSimulations)
      .values({
        userId: userId,
        nomeSimulacao: req.body.nomeSimulacao || 'Nova Simulação',
        codigoSimulacao: codigoSimulacao,
        observacoes: req.body.observacoes || '',
        faturamento12Meses: faturamento12Meses.toString(),
        faturamentoSemST: faturamentoSemST.toString(),
        faturamentoComST: faturamentoComST.toString(),
        faturamentoTotal: calculoResult.faturamentoTotal.toString(),
        aliquotaBase: calculoResult.aliquotaBase.toString(),
        valorReduzir: calculoResult.valorReduzir.toString(),
        aliquotaEfetiva: calculoResult.aliquotaEfetiva.toString(),
        percentualICMS: calculoResult.percentualICMS.toString(),
        valorSimplesSemST: calculoResult.valorSimplesSemST.toString(),
        valorSimplesComST: calculoResult.valorSimplesComST.toString(),
        valorTotalSimples: calculoResult.valorTotalSimples.toString()
      })
      .returning();

    res.status(201).json(newSimulation[0]);
  } catch (error) {
    console.error('Error creating Simples Nacional simulation:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Update Simples Nacional simulation
router.put('/simples-nacional/:id', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const simulationId = parseInt(req.params.id);

    // Check if simulation exists and belongs to user
    const existingSimulation = await db
      .select()
      .from(simplesNacionalSimulations)
      .where(eq(simplesNacionalSimulations.id, simulationId))
      .limit(1);

    if (!existingSimulation.length || existingSimulation[0].userId !== userId) {
      return res.status(404).json({ error: 'Simulação não encontrada' });
    }

    // Validate input
    const faturamento12Meses = parseFloat(req.body.faturamento12Meses);
    const faturamentoSemST = parseFloat(req.body.faturamentoSemST);
    const faturamentoComST = parseFloat(req.body.faturamentoComST);
    
    if (isNaN(faturamento12Meses) || isNaN(faturamentoSemST) || isNaN(faturamentoComST)) {
      return res.status(400).json({ error: 'Valores inválidos fornecidos' });
    }
    
    // Calculate values
    const calculoResult = calcularTarifaSimples(faturamento12Meses, faturamentoSemST, faturamentoComST);
    
    if (calculoResult.erro) {
      return res.status(400).json({ error: calculoResult.erro });
    }

    // Update simulation
    const updatedSimulation = await db
      .update(simplesNacionalSimulations)
      .set({
        nomeSimulacao: req.body.nomeSimulacao || existingSimulation[0].nomeSimulacao,
        observacoes: req.body.observacoes || existingSimulation[0].observacoes,
        faturamento12Meses: faturamento12Meses.toString(),
        faturamentoSemST: faturamentoSemST.toString(),
        faturamentoComST: faturamentoComST.toString(),
        faturamentoTotal: calculoResult.faturamentoTotal.toString(),
        aliquotaBase: calculoResult.aliquotaBase.toString(),
        valorReduzir: calculoResult.valorReduzir.toString(),
        aliquotaEfetiva: calculoResult.aliquotaEfetiva.toString(),
        percentualICMS: calculoResult.percentualICMS.toString(),
        valorSimplesSemST: calculoResult.valorSimplesSemST.toString(),
        valorSimplesComST: calculoResult.valorSimplesComST.toString(),
        valorTotalSimples: calculoResult.valorTotalSimples.toString(),
        dataLastModified: new Date()
      })
      .where(eq(simplesNacionalSimulations.id, simulationId))
      .returning();

    res.json(updatedSimulation[0]);
  } catch (error) {
    console.error('Error updating Simples Nacional simulation:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Delete Simples Nacional simulation
router.delete('/simples-nacional/:id', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const simulationId = parseInt(req.params.id);

    // Check if simulation exists and belongs to user
    const existingSimulation = await db
      .select()
      .from(simplesNacionalSimulations)
      .where(eq(simplesNacionalSimulations.id, simulationId))
      .limit(1);

    if (!existingSimulation.length || existingSimulation[0].userId !== userId) {
      return res.status(404).json({ error: 'Simulação não encontrada' });
    }

    // Delete simulation
    await db
      .delete(simplesNacionalSimulations)
      .where(eq(simplesNacionalSimulations.id, simulationId));

    res.json({ message: 'Simulação excluída com sucesso' });
  } catch (error) {
    console.error('Error deleting Simples Nacional simulation:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;