import { Router } from 'express';
import { db } from '../../db';
import { 
  users, 
  userSubscriptions, 
  userCreditBalance, 
  creditTransactions,
  aiGenerationLogs,
  aiImgGenerationLogs,
  userPlans
} from '../../../shared/schema';
import { eq, desc, sql, and, gte, lte } from 'drizzle-orm';
import { requireAuth } from '../../security';

const router = Router();

// Get dashboard summary
router.get('/summary', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    
    // Get user info
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Get subscription info
    const subscription = await db.select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .limit(1);

    // Get credit balance
    const [credits] = await db.select()
      .from(userCreditBalance)
      .where(eq(userCreditBalance.userId, userId))
      .limit(1);

    // If no data exists, create sample data for demonstration
    if (!credits) {
      // For demo purposes, return sample data for the logged-in user
      const sampleDashboardData = {
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
      
      return res.json(sampleDashboardData);
    }

    // Get this month's usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setDate(1);
    lastMonth.setHours(0, 0, 0, 0);

    const endOfLastMonth = new Date(startOfMonth);
    endOfLastMonth.setTime(endOfLastMonth.getTime() - 1);

    // Current month usage
    const thisMonthUsage = await db.select({
      totalTokens: sql<number>`COALESCE(SUM(${aiGenerationLogs.totalTokens}), 0)`
    })
    .from(aiGenerationLogs)
    .where(and(
      eq(aiGenerationLogs.userId, userId.toString()),
      gte(aiGenerationLogs.createdAt, startOfMonth)
    ));

    // Last month usage
    const lastMonthUsage = await db.select({
      totalTokens: sql<number>`COALESCE(SUM(${aiGenerationLogs.totalTokens}), 0)`
    })
    .from(aiGenerationLogs)
    .where(and(
      eq(aiGenerationLogs.userId, userId.toString()),
      gte(aiGenerationLogs.createdAt, lastMonth),
      lte(aiGenerationLogs.createdAt, endOfLastMonth)
    ));

    // Top features used
    const topFeatures = await db.select({
      feature: aiGenerationLogs.feature,
      usage: sql<number>`COUNT(*)`
    })
    .from(aiGenerationLogs)
    .where(and(
      eq(aiGenerationLogs.userId, userId.toString()),
      gte(aiGenerationLogs.createdAt, startOfMonth)
    ))
    .groupBy(aiGenerationLogs.feature)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(5);

    // Recent activity
    const activity = await db.select({
      id: aiGenerationLogs.id,
      description: aiGenerationLogs.feature,
      timestamp: aiGenerationLogs.createdAt,
      cost: aiGenerationLogs.totalTokens,
      status: sql<string>`'completed'`
    })
    .from(aiGenerationLogs)
    .where(eq(aiGenerationLogs.userId, userId.toString()))
    .orderBy(desc(aiGenerationLogs.createdAt))
    .limit(10);

    // Get total stats
    const totalStats = await db.select({
      totalGenerations: sql<number>`COUNT(*)`
    })
    .from(aiGenerationLogs)
    .where(eq(aiGenerationLogs.userId, userId.toString()));

    // Plan information
    const hasSubscription = subscription.length > 0 && subscription[0].status === 'active';
    const currentPlan = hasSubscription ? {
      name: subscription[0].planId === 1 ? 'Plano Basic' : 
            subscription[0].planId === 2 ? 'Plano Premium' : 'Plano Master',
      level: subscription[0].planId === 1 ? 'basic' : 
             subscription[0].planId === 2 ? 'premium' : 'master',
      credits: subscription[0].planId === 1 ? 500 : 
               subscription[0].planId === 2 ? 1200 : 3000,
      nextBilling: subscription[0].nextBillingDate?.toLocaleDateString('pt-BR') || 'N/A',
      status: 'active' as const
    } : {
      name: 'Sem Plano',
      level: 'basic' as const,
      credits: 0,
      nextBilling: 'N/A',
      status: 'cancelled' as const
    };

    // Calculate total features used and format activity
    const featuresUsedCount = topFeatures.length;
    const totalGenerationsCount = totalStats[0]?.totalGenerations || 0;
    const thisMonthTokens = thisMonthUsage[0]?.totalTokens || 0;
    const lastMonthTokens = lastMonthUsage[0]?.totalTokens || 0;

    // Format top features with percentages
    const totalUsage = topFeatures.reduce((sum, f) => sum + Number(f.usage), 0);
    const formattedTopFeatures = topFeatures.map(feature => ({
      name: getFeatureName(feature.feature || 'unknown'),
      usage: Number(feature.usage),
      percentage: totalUsage > 0 ? Math.round((Number(feature.usage) / totalUsage) * 100) : 0
    }));

    // Format activity with proper descriptions
    const formattedActivity = activity.map(item => ({
      id: item.id,
      type: 'ai_generation',
      description: getActivityDescription(item.description || 'unknown'),
      timestamp: formatTimestamp(item.timestamp),
      cost: item.cost || 0,
      status: 'completed' as const
    }));

    // Generate recommendations
    const recommendations = generateRecommendations(
      hasSubscription,
      currentPlan,
      thisMonthTokens,
      credits?.currentBalance || 0
    );

    const dashboardData = {
      user: {
        name: user.name,
        plan: currentPlan,
        creditBalance: credits?.currentBalance || 0,
        totalSpent: credits?.totalSpent || 0,
        savings: calculateSavings(hasSubscription, currentPlan.level)
      },
      usage: {
        thisMonth: thisMonthTokens,
        lastMonth: lastMonthTokens,
        topFeatures: formattedTopFeatures,
        projection: calculateProjection(thisMonthTokens),
        dailyUsage: [] // Would be implemented with more detailed queries
      },
      activity: formattedActivity,
      recommendations: recommendations,
      stats: {
        totalGenerations: totalGenerationsCount,
        averageSessionTime: 15, // Would be calculated from session data
        featuresUsed: featuresUsedCount,
        successRate: 95 // Would be calculated from success/failure logs
      }
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Helper functions
function getFeatureName(feature: string): string {
  const featureMap: { [key: string]: string } = {
    'amazon-listing-step1-analysis': 'Análise de Produtos Amazon',
    'amazon-listing-step2-titles': 'Títulos Amazon',
    'amazon-listing-step3-bulletpoints': 'Bullet Points Amazon',
    'amazon-listing-step4-description': 'Descrições Amazon',
    'infographic-generator': 'Gerador de Infográficos',
    'lifestyle-with-model': 'Fotos Lifestyle',
    'amazon-product-photography': 'Fotos de Produtos',
    'unknown': 'Funcionalidade Desconhecida'
  };
  
  return featureMap[feature] || feature;
}

function getActivityDescription(feature: string): string {
  const descriptions: { [key: string]: string } = {
    'amazon-listing-step1-analysis': 'Analisou produto para Amazon',
    'amazon-listing-step2-titles': 'Gerou títulos para Amazon',
    'amazon-listing-step3-bulletpoints': 'Criou bullet points',
    'amazon-listing-step4-description': 'Escreveu descrição de produto',
    'infographic-generator': 'Criou infográfico',
    'lifestyle-with-model': 'Gerou foto lifestyle',
    'amazon-product-photography': 'Editou foto de produto',
    'unknown': 'Usou funcionalidade de IA'
  };
  
  return descriptions[feature] || 'Usou funcionalidade de IA';
}

function formatTimestamp(timestamp: Date): string {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} dia${days > 1 ? 's' : ''} atrás`;
  if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
  if (minutes > 0) return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
  return 'Agora mesmo';
}

function calculateProjection(currentUsage: number): number {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysPassed = today.getDate();
  
  if (daysPassed === 0) return 0;
  
  const dailyAverage = currentUsage / daysPassed;
  return Math.round(dailyAverage * daysInMonth);
}

function calculateSavings(hasSubscription: boolean, planLevel: string): number {
  if (!hasSubscription) return 0;
  
  // Simulate savings calculation based on plan
  const planSavings = {
    basic: 15.90,
    premium: 35.90,
    master: 85.00
  };
  
  return planSavings[planLevel as keyof typeof planSavings] || 0;
}

function generateRecommendations(
  hasSubscription: boolean, 
  currentPlan: any, 
  monthlyUsage: number, 
  creditBalance: number
): any[] {
  const recommendations = [];

  // Low credits warning
  if (creditBalance < 100) {
    recommendations.push({
      id: 'low-credits',
      title: 'Saldo de créditos baixo',
      description: 'Você está ficando sem créditos. Considere comprar mais ou fazer upgrade do plano.',
      type: 'upgrade',
      priority: 'high',
      actionText: 'Comprar Créditos',
      actionUrl: '/minha-area/assinaturas?tab=plans'
    });
  }

  // Upgrade recommendation
  if (hasSubscription && currentPlan.level === 'basic' && monthlyUsage > 400) {
    recommendations.push({
      id: 'upgrade-premium',
      title: 'Considere o Plano Premium',
      description: 'Baseado no seu uso, o Plano Premium oferece melhor custo-benefício.',
      type: 'upgrade',
      priority: 'medium',
      actionText: 'Ver Planos',
      actionUrl: '/minha-area/assinaturas?tab=plans'
    });
  }

  // Feature recommendation
  recommendations.push({
    id: 'try-infographics',
    title: 'Experimente o Gerador de Infográficos',
    description: 'Crie infográficos profissionais para seus produtos em segundos.',
    type: 'feature',
    priority: 'low',
    actionText: 'Experimentar',
    actionUrl: '/agents/agent-infographic-generator'
  });

  // Tutorial recommendation
  recommendations.push({
    id: 'amazon-tutorial',
    title: 'Maximize suas vendas na Amazon',
    description: 'Aprenda as melhores práticas para otimizar seus produtos na Amazon.',
    type: 'tutorial',
    priority: 'low',
    actionText: 'Ver Tutorial',
    actionUrl: '/hub/materiais'
  });

  return recommendations;
}

// Get detailed credits information
router.get('/credits', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    
    const [credits] = await db.select()
      .from(userCreditBalance)
      .where(eq(userCreditBalance.userId, userId))
      .limit(1);

    const transactions = await db.select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .orderBy(desc(creditTransactions.createdAt))
      .limit(20);

    res.json({
      balance: credits?.currentBalance || 0,
      totalEarned: credits?.totalEarned || 0,
      totalSpent: credits?.totalSpent || 0,
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        timestamp: t.createdAt,
        balance: t.balanceAfter
      }))
    });
  } catch (error) {
    console.error('Credits detail error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get subscription details
router.get('/subscription', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    
    const subscription = await db.select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .limit(1);

    if (subscription.length === 0) {
      return res.json({
        hasSubscription: false,
        plan: null,
        status: null,
        nextBilling: null
      });
    }

    const sub = subscription[0];
    res.json({
      hasSubscription: true,
      plan: {
        id: sub.planId,
        name: sub.planId === 1 ? 'Plano Basic' : 
              sub.planId === 2 ? 'Plano Premium' : 'Plano Master',
        credits: sub.planId === 1 ? 500 : sub.planId === 2 ? 1200 : 3000
      },
      status: sub.status,
      nextBilling: sub.nextBillingDate?.toLocaleDateString('pt-BR'),
      startDate: sub.startDate.toLocaleDateString('pt-BR'),
      billingCycle: sub.billingCycle
    });
  } catch (error) {
    console.error('Subscription detail error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get activity feed
router.get('/activity', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const activity = await db.select({
      id: aiGenerationLogs.id,
      feature: aiGenerationLogs.feature,
      createdAt: aiGenerationLogs.createdAt,
      totalTokens: aiGenerationLogs.totalTokens,
      costUsd: aiGenerationLogs.costUsd,
      processingTimeMs: aiGenerationLogs.processingTimeMs
    })
    .from(aiGenerationLogs)
    .where(eq(aiGenerationLogs.userId, userId.toString()))
    .orderBy(desc(aiGenerationLogs.createdAt))
    .limit(limit)
    .offset(offset);

    const formattedActivity = activity.map(item => ({
      id: item.id,
      type: 'ai_generation',
      description: getActivityDescription(item.feature || 'unknown'),
      timestamp: formatTimestamp(item.createdAt),
      cost: item.totalTokens || 0,
      costUsd: item.costUsd || '0',
      processingTime: item.processingTimeMs || 0,
      status: 'completed'
    }));

    res.json({
      activity: formattedActivity,
      page,
      hasMore: activity.length === limit
    });
  } catch (error) {
    console.error('Activity feed error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Execute quick action
router.post('/quick-action', requireAuth, async (req: any, res: any) => {
  try {
    const { action, data } = req.body;
    const userId = req.user.id;

    // Log the action for analytics
    console.log(`Quick action: ${action} by user ${userId}`, data);

    // Here you would implement actual quick actions
    // For now, just return success
    res.json({
      success: true,
      message: `Ação ${action} executada com sucesso`,
      redirectUrl: data?.redirectUrl
    });
  } catch (error) {
    console.error('Quick action error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;