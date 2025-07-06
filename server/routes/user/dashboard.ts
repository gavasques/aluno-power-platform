import { Router, Request, Response } from 'express';
import { db } from '../../db';
import { users } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Dashboard Summary
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    // Get user info
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
      
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Return sample dashboard data
    const dashboardData = {
      user: {
        name: user.name,
        plan: {
          name: 'Sem Plano',
          level: 'basic' as const,
          credits: 0,
          nextBilling: 'N/A',
          status: 'cancelled' as const
        },
        creditBalance: 250,
        totalSpent: 0,
        savings: 0
      },
      usage: {
        thisMonth: 0,
        lastMonth: 0,
        topFeatures: [],
        projection: 0,
        dailyUsage: []
      },
      activity: [],
      recommendations: [
        {
          id: 'start-subscription',
          title: 'Comece com um plano',
          description: 'Escolha um plano para ter acesso a mais créditos e funcionalidades.',
          type: 'upgrade' as const,
          priority: 'high' as const,
          actionText: 'Ver Planos',
          actionUrl: '/minha-area/assinaturas?tab=plans'
        },
        {
          id: 'try-agents',
          title: 'Experimente nossos agentes IA',
          description: 'Use nossos agentes especializados para otimizar suas vendas na Amazon.',
          type: 'feature' as const,
          priority: 'medium' as const,
          actionText: 'Ver Agentes',
          actionUrl: '/agents'
        }
      ],
      stats: {
        totalGenerations: 0,
        averageSessionTime: 0,
        featuresUsed: 0,
        successRate: 100
      }
    };
    
    res.json(dashboardData);

  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;