import { Router, Request, Response } from 'express';
import { db } from '../db';
import { featureCosts } from '../../shared/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '../security';
import { cache } from '../cache';

const router = Router();

// Buscar todos os custos de features ativas
router.get('/', async (req: Request, res: Response) => {
  try {
    const cacheKey = 'feature-costs-all';
    
    // Tentar buscar do cache primeiro
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const costs = await db.select()
      .from(featureCosts)
      .where(eq(featureCosts.isActive, true))
      .orderBy(featureCosts.category, featureCosts.featureName);

    // Organizar por categoria para facilitar uso no frontend
    const costsByCategory = costs.reduce((acc: any, cost) => {
      const category = cost.category || 'Outros';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        featureName: cost.featureName,
        costPerUse: cost.costPerUse,
        description: cost.description
      });
      return acc;
    }, {});

    // Também criar um mapa simples feature -> custo para facilitar lookup
    const costsMap = costs.reduce((acc: any, cost) => {
      acc[cost.featureName] = cost.costPerUse;
      return acc;
    }, {});

    const result = {
      success: true,
      data: {
        byCategory: costsByCategory,
        costsMap: costsMap,
        totalFeatures: costs.length
      }
    };

    // Cache por 5 minutos (300 segundos)
    await cache.set(cacheKey, result, 300);

    res.json(result);
  } catch (error) {
    console.error('Error fetching feature costs:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar custos das ferramentas'
    });
  }
});

// Buscar custo de uma feature específica
router.get('/:featureName', async (req: Request, res: Response) => {
  try {
    const { featureName } = req.params;
    
    const cost = await db.select()
      .from(featureCosts)
      .where(eq(featureCosts.featureName, featureName))
      .limit(1);

    if (cost.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ferramenta não encontrada'
      });
    }

    res.json({
      success: true,
      data: {
        featureName: cost[0].featureName,
        costPerUse: cost[0].costPerUse,
        description: cost[0].description,
        category: cost[0].category
      }
    });
  } catch (error) {
    console.error('Error fetching feature cost:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar custo da ferramenta'
    });
  }
});

// Endpoints protegidos para admin
router.use(requireAuth);

// Atualizar custo de uma feature (apenas admin)
router.put('/:featureName', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Apenas administradores podem alterar custos.'
      });
    }

    const { featureName } = req.params;
    const { costPerUse, description, category, isActive } = req.body;

    const updated = await db.update(featureCosts)
      .set({ 
        costPerUse,
        description,
        category,
        isActive,
        updatedAt: new Date()
      })
      .where(eq(featureCosts.featureName, featureName))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ferramenta não encontrada'
      });
    }

    // Invalidar cache quando custos são atualizados
    await cache.delete('feature-costs-all');

    res.json({
      success: true,
      data: updated[0],
      message: 'Custo da ferramenta atualizado com sucesso'
    });
  } catch (error) {
    console.error('Error updating feature cost:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar custo da ferramenta'
    });
  }
});

export default router;