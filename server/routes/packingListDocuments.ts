import { Router } from 'express';
import { storage } from '../storage';
import { requireAuth } from '../security';
import { z } from 'zod';
import { insertPackingListDocumentSchema } from '@shared/schema';

const router = Router();

// Middleware de autenticação aplicado a todas as rotas
router.use(requireAuth);

// GET /api/packing-list-documents - Lista todos os documentos do usuário
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const documents = await storage.getPackingListDocuments(userId);
    
    res.json({
      success: true,
      data: documents,
      total: documents.length
    });
  } catch (error) {
    console.error('Error fetching packing list documents:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar documentos'
    });
  }
});

// GET /api/packing-list-documents/search/:query - Busca documentos
router.get('/search/:query', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { query } = req.params;
    
    const documents = await storage.searchPackingListDocuments(userId, query);
    
    res.json({
      success: true,
      data: documents,
      total: documents.length
    });
  } catch (error) {
    console.error('Error searching packing list documents:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar documentos'
    });
  }
});

// GET /api/packing-list-documents/:id - Busca um documento específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const document = await storage.getPackingListDocument(Number(id));
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Documento não encontrado'
      });
    }
    
    // Verificar se o documento pertence ao usuário
    const userId = (req as any).user.id;
    if (document.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }
    
    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Error fetching packing list document:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar documento'
    });
  }
});

// POST /api/packing-list-documents - Cria um novo documento
router.post('/', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    
    // Validar dados de entrada
    const validatedData = insertPackingListDocumentSchema.parse({
      ...req.body,
      userId
    });
    
    const document = await storage.createPackingListDocument(validatedData);
    
    res.status(201).json({
      success: true,
      data: document,
      message: 'Documento criado com sucesso'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    }
    
    console.error('Error creating packing list document:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar documento'
    });
  }
});

// PUT /api/packing-list-documents/:id - Atualiza um documento
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    // Verificar se o documento existe e pertence ao usuário
    const existingDocument = await storage.getPackingListDocument(Number(id));
    if (!existingDocument) {
      return res.status(404).json({
        success: false,
        error: 'Documento não encontrado'
      });
    }
    
    if (existingDocument.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }
    
    // Validar dados de entrada (parcial)
    const partialSchema = insertPackingListDocumentSchema.partial();
    const validatedData = partialSchema.parse(req.body);
    
    const document = await storage.updatePackingListDocument(Number(id), validatedData);
    
    res.json({
      success: true,
      data: document,
      message: 'Documento atualizado com sucesso'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    }
    
    console.error('Error updating packing list document:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar documento'
    });
  }
});

// DELETE /api/packing-list-documents/:id - Deleta um documento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    // Verificar se o documento existe e pertence ao usuário
    const existingDocument = await storage.getPackingListDocument(Number(id));
    if (!existingDocument) {
      return res.status(404).json({
        success: false,
        error: 'Documento não encontrado'
      });
    }
    
    if (existingDocument.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }
    
    await storage.deletePackingListDocument(Number(id));
    
    res.json({
      success: true,
      message: 'Documento deletado com sucesso'
    });
  } catch (error) {
    console.error('Error deleting packing list document:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar documento'
    });
  }
});

export default router;