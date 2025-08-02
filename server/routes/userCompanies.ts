import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { insertUserCompanySchema } from '@shared/schema';
import { requireAuth } from '../middleware/auth';
import { ObjectStorageService } from '../objectStorage';

const router = Router();

// Validation schemas
const createUserCompanySchema = insertUserCompanySchema.extend({
  corporateName: z.string().min(1, 'Razão social é obrigatória'),
  tradeName: z.string().min(1, 'Nome fantasia é obrigatório'),
});

const updateUserCompanySchema = insertUserCompanySchema.partial();

// GET /api/user-companies - Lista empresas do usuário
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { search } = req.query;

    let companies;
    if (search && typeof search === 'string') {
      companies = await storage.searchUserCompanies(userId, search);
    } else {
      companies = await storage.getUserCompanies(userId);
    }

    res.json(companies);
  } catch (error) {
    console.error('Error fetching user companies:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// GET /api/user-companies/:id - Busca empresa específica
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const company = await storage.getUserCompany(id);

    if (!company) {
      return res.status(404).json({ 
        success: false, 
        error: 'Empresa não encontrada' 
      });
    }

    // Verifica se a empresa pertence ao usuário
    if (company.userId !== req.user!.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Acesso negado' 
      });
    }

    res.json(company);
  } catch (error) {
    console.error('Error fetching user company:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// POST /api/user-companies - Cria nova empresa
router.post('/', requireAuth, async (req, res) => {
  try {
    const validatedData = createUserCompanySchema.parse({
      ...req.body,
      userId: req.user!.id,
    });

    const company = await storage.createUserCompany(validatedData);

    res.status(201).json({
      success: true,
      data: company,
      message: 'Empresa criada com sucesso',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors,
      });
    }

    console.error('Error creating user company:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// PUT /api/user-companies/:id - Atualiza empresa
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Verifica se a empresa existe e pertence ao usuário
    const existingCompany = await storage.getUserCompany(id);
    if (!existingCompany) {
      return res.status(404).json({ 
        success: false, 
        error: 'Empresa não encontrada' 
      });
    }

    if (existingCompany.userId !== req.user!.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Acesso negado' 
      });
    }

    const validatedData = updateUserCompanySchema.parse(req.body);
    const company = await storage.updateUserCompany(id, validatedData);

    res.json({
      success: true,
      data: company,
      message: 'Empresa atualizada com sucesso',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors,
      });
    }

    console.error('Error updating user company:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// DELETE /api/user-companies/:id - Remove empresa (soft delete)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Verifica se a empresa existe e pertence ao usuário
    const existingCompany = await storage.getUserCompany(id);
    if (!existingCompany) {
      return res.status(404).json({ 
        success: false, 
        error: 'Empresa não encontrada' 
      });
    }

    if (existingCompany.userId !== req.user!.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Acesso negado' 
      });
    }

    await storage.deleteUserCompany(id);

    res.json({
      success: true,
      message: 'Empresa removida com sucesso',
    });
  } catch (error) {
    console.error('Error deleting user company:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// Logo upload endpoint
router.post('/upload-logo', requireAuth, async (req, res) => {
  try {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  } catch (error) {
    console.error('Erro ao obter URL de upload do logo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Update logo endpoint
router.put('/:id/logo', requireAuth, async (req, res) => {
  try {
    const companyId = parseInt(req.params.id);
    const { logoURL } = req.body;
    
    if (!logoURL) {
      return res.status(400).json({ error: 'logoURL é obrigatório' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    const objectStorageService = new ObjectStorageService();
    const normalizedPath = objectStorageService.normalizeObjectEntityPath(logoURL);

    // Update company with logo URL
    const company = await storage.updateUserCompany(companyId, { logoUrl: normalizedPath });
    
    if (!company) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    res.json({
      success: true,
      data: company,
      message: 'Logo atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar logo da empresa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;