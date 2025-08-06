import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { insertBoxSchema } from '@shared/schema';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Validation schemas
const createBoxSchema = insertBoxSchema.extend({
  code: z.string().min(1, 'Código da caixa é obrigatório'),
  type: z.string().min(1, 'Tipo da caixa é obrigatório'),
  length: z.number().min(1, 'Comprimento deve ser maior que 0'),
  width: z.number().min(1, 'Largura deve ser maior que 0'),
  height: z.number().min(1, 'Altura deve ser maior que 0'),
  weight: z.number().min(1, 'Peso deve ser maior que 0'),
  waveType: z.string().min(1, 'Tipo de onda é obrigatório'),
});

const updateBoxSchema = insertBoxSchema.partial();

// GET /api/boxes - Lista caixas do usuário
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { search } = req.query;

    let boxes;
    if (search && typeof search === 'string') {
      boxes = await storage.searchBoxes(userId, search);
    } else {
      boxes = await storage.getBoxes(userId);
    }

    res.json(boxes);
  } catch (error) {
    console.error('Error fetching boxes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// GET /api/boxes/:id - Busca caixa específica
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const box = await storage.getBox(id);

    if (!box) {
      return res.status(404).json({ 
        success: false, 
        error: 'Caixa não encontrada' 
      });
    }

    // Verifica se a caixa pertence ao usuário
    if (box.userId !== req.user!.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Acesso negado' 
      });
    }

    res.json(box);
  } catch (error) {
    console.error('Error fetching box:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// POST /api/boxes - Cria nova caixa
router.post('/', requireAuth, async (req, res) => {
  try {
    const validatedData = createBoxSchema.parse({
      ...req.body,
      userId: req.user!.id,
    });

    const box = await storage.createBox(validatedData);

    res.status(201).json({
      success: true,
      data: box,
      message: 'Caixa criada com sucesso',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors,
      });
    }

    console.error('Error creating box:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// PUT /api/boxes/:id - Atualiza caixa
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Verifica se a caixa existe e pertence ao usuário
    const existingBox = await storage.getBox(id);
    if (!existingBox) {
      return res.status(404).json({ 
        success: false, 
        error: 'Caixa não encontrada' 
      });
    }

    if (existingBox.userId !== req.user!.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Acesso negado' 
      });
    }

    const validatedData = updateBoxSchema.parse(req.body);
    
    // Filter out null values
    const cleanData = Object.fromEntries(
      Object.entries(validatedData).filter(([key, value]) => value !== null && value !== undefined)
    );
    
    const box = await storage.updateBox(id, cleanData);

    res.json({
      success: true,
      data: box,
      message: 'Caixa atualizada com sucesso',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors,
      });
    }

    console.error('Error updating box:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// DELETE /api/boxes/:id - Remove caixa
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Verifica se a caixa existe e pertence ao usuário
    const existingBox = await storage.getBox(id);
    if (!existingBox) {
      return res.status(404).json({ 
        success: false, 
        error: 'Caixa não encontrada' 
      });
    }

    if (existingBox.userId !== req.user!.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Acesso negado' 
      });
    }

    await storage.deleteBox(id);

    res.json({
      success: true,
      message: 'Caixa removida com sucesso',
    });
  } catch (error) {
    console.error('Error deleting box:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

export default router;