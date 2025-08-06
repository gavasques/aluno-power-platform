import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { insertBoxSchema } from '@shared/schema';
import { requireAuth } from '../security';
import ExcelJS from 'exceljs';

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

// GET /api/boxes/export/excel - Export boxes to Excel
router.get('/export/excel', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const boxes = await storage.getBoxes(userId);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Caixas');

    // Define headers
    worksheet.columns = [
      { header: 'Código', key: 'code', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Tipo', key: 'type', width: 20 },
      { header: 'Comprimento (mm)', key: 'length', width: 18 },
      { header: 'Largura (mm)', key: 'width', width: 15 },
      { header: 'Altura (mm)', key: 'height', width: 15 },
      { header: 'Peso (g)', key: 'weight', width: 12 },
      { header: 'Tipo de Onda', key: 'waveType', width: 15 },
      { header: 'Papel', key: 'paper', width: 20 },
      { header: 'Tem Logo', key: 'hasLogo', width: 12 },
      { header: 'Colorida', key: 'isColored', width: 12 },
      { header: 'Full Color', key: 'isFullColor', width: 12 },
      { header: 'Impressão Premium', key: 'isPremiumPrint', width: 18 },
      { header: 'Custo Unitário', key: 'unitCost', width: 15 },
      { header: 'MOQ', key: 'moq', width: 10 },
      { header: 'Ideal Para', key: 'idealFor', width: 30 },
      { header: 'Observações', key: 'notes', width: 40 }
    ];

    // Add data rows
    boxes.forEach(box => {
      worksheet.addRow({
        code: box.code,
        status: box.status,
        type: box.type,
        length: box.length,
        width: box.width,
        height: box.height,
        weight: box.weight,
        waveType: box.waveType,
        paper: box.paper,
        hasLogo: box.hasLogo ? 'Sim' : 'Não',
        isColored: box.isColored ? 'Sim' : 'Não',
        isFullColor: box.isFullColor ? 'Sim' : 'Não',
        isPremiumPrint: box.isPremiumPrint ? 'Sim' : 'Não',
        unitCost: box.unitCost,
        moq: box.moq,
        idealFor: box.idealFor,
        notes: box.notes
      });
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF6B00' } // Orange header
    };

    // Set response headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=caixas.xlsx');

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error exporting boxes to Excel:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao exportar para Excel' 
    });
  }
});

// GET /api/boxes/export/txt - Export boxes to TXT
router.get('/export/txt', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const boxes = await storage.getBoxes(userId);

    let txtContent = 'LISTAGEM DE CAIXAS\n';
    txtContent += '==================\n\n';

    boxes.forEach((box, index) => {
      txtContent += `${index + 1}. ${box.code}\n`;
      txtContent += `   Tipo: ${box.type}\n`;
      txtContent += `   Dimensões: ${box.length}mm x ${box.width}mm x ${box.height}mm\n`;
      txtContent += `   Peso: ${box.weight}g\n`;
      txtContent += `   Onda: ${box.waveType}\n`;
      txtContent += `   Papel: ${box.paper}\n`;
      txtContent += `   Status: ${box.status}\n`;
      if (box.unitCost) txtContent += `   Custo: R$ ${box.unitCost}\n`;
      if (box.moq) txtContent += `   MOQ: ${box.moq}\n`;
      if (box.idealFor) txtContent += `   Ideal para: ${box.idealFor}\n`;
      if (box.notes) txtContent += `   Obs: ${box.notes}\n`;
      txtContent += '\n';
    });

    txtContent += `\nTotal de caixas: ${boxes.length}\n`;
    txtContent += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n`;

    // Set response headers for file download
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=caixas.txt');

    res.send(txtContent);

  } catch (error) {
    console.error('Error exporting boxes to TXT:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao exportar para TXT' 
    });
  }
});

// Box Product Compatibility Routes

// GET /api/boxes/:id/compatibility - Get products compatible with a box
router.get('/:id/compatibility', requireAuth, async (req, res) => {
  try {
    const boxId = parseInt(req.params.id);
    
    // Verify box exists and belongs to user
    const box = await storage.getBox(boxId);
    if (!box || box.userId !== req.user!.id) {
      return res.status(404).json({ 
        success: false, 
        error: 'Caixa não encontrada' 
      });
    }

    const compatibleProducts = await storage.getBoxProductCompatibility(boxId);
    
    res.json(compatibleProducts);

  } catch (error) {
    console.error('Error fetching box compatibility:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// POST /api/boxes/:id/compatibility - Add product compatibility
router.post('/:id/compatibility', requireAuth, async (req, res) => {
  try {
    const boxId = parseInt(req.params.id);
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'ID do produto é obrigatório'
      });
    }

    // Verify box exists and belongs to user
    const box = await storage.getBox(boxId);
    if (!box || box.userId !== req.user!.id) {
      return res.status(404).json({ 
        success: false, 
        error: 'Caixa não encontrada' 
      });
    }

    await storage.addBoxProductCompatibility(boxId, productId, req.user!.id);
    
    res.json({
      success: true,
      message: 'Compatibilidade adicionada com sucesso'
    });

  } catch (error) {
    console.error('Error adding box compatibility:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// DELETE /api/boxes/:id/compatibility/:productId - Remove product compatibility
router.delete('/:id/compatibility/:productId', requireAuth, async (req, res) => {
  try {
    const boxId = parseInt(req.params.id);
    const productId = parseInt(req.params.productId);
    
    // Verify box exists and belongs to user
    const box = await storage.getBox(boxId);
    if (!box || box.userId !== req.user!.id) {
      return res.status(404).json({ 
        success: false, 
        error: 'Caixa não encontrada' 
      });
    }

    await storage.removeBoxProductCompatibility(boxId, productId);
    
    res.json({
      success: true,
      message: 'Compatibilidade removida com sucesso'
    });

  } catch (error) {
    console.error('Error removing box compatibility:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// GET /api/boxes/product/:productId/compatible - Get boxes compatible with a product
router.get('/product/:productId/compatible', requireAuth, async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const userId = req.user!.id;
    
    const compatibleBoxes = await storage.getBoxesForProduct(productId, userId);
    
    res.json({
      success: true,
      data: compatibleBoxes
    });

  } catch (error) {
    console.error('Error fetching compatible boxes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

export default router;