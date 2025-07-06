import { Router } from 'express';
import { requireAuth } from '../security';
import { db } from '../db';
import { users, userCreditBalance, creditTransactions, userSubscriptions, userPlans, billingHistory, userActivityLogs, aiGenerationLogs } from '../../shared/schema';
import { eq, desc, gte, sql } from 'drizzle-orm';

const router = Router();

// Dashboard summary endpoint
router.get('/summary', requireAuth, async (req, res) => {
  try {
    const userId = Number((req as any).user?.id);
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get user info
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get current credit balance
    const creditData = await db.query.userCreditBalance.findFirst({
      where: eq(userCreditBalance.userId, userId)
    });

    // Get current subscription with plan
    const subscription = await db.query.userSubscriptions.findFirst({
      where: eq(userSubscriptions.userId, userId)
    });

    let planName = 'Gratuito';
    if (subscription) {
      const plan = await db.query.userPlans.findFirst({
        where: eq(userPlans.id, subscription.planId)
      });
      planName = plan?.displayName || plan?.name || 'Gratuito';
    }

    // Get this month's credit usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [creditUsageThisMonth] = await db
      .select({ totalSpent: sql<number>`SUM(ABS(${creditTransactions.amount}))` })
      .from(creditTransactions)
      .where(
        sql`${creditTransactions.userId} = ${userId} AND ${creditTransactions.createdAt} >= ${startOfMonth}`
      );

    // Get AI usage stats for this month
    const [aiRequests] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(aiGenerationLogs)
      .where(
        sql`${aiGenerationLogs.userId} = ${userId} AND ${aiGenerationLogs.createdAt} >= ${startOfMonth}`
      );

    // Get estimated costs and savings (placeholder for now)
    const estimatedMonthlySpend = 50; // TODO: Calculate based on actual usage
    const estimatedSavings = 200; // TODO: Calculate compared to alternatives

    const dashboardData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: planName,
        creditBalance: creditData?.currentBalance || 0
      },
      credits: {
        current: creditData?.currentBalance || 0,
        totalEarned: creditData?.totalEarned || 0,
        totalSpent: creditData?.totalSpent || 0,
        usageThisMonth: creditUsageThisMonth?.totalSpent || 0
      },
      subscription: subscription ? {
        planName: planName,
        status: subscription.status,
        nextBilling: subscription.nextBillingDate ? subscription.nextBillingDate.toISOString() : null,
        billingCycle: subscription.billingCycle
      } : null,
      usage: {
        aiRequests: aiRequests?.count || 0,
        imageRequests: 0, // TODO: Add from image generation logs
        toolRequests: 0, // TODO: Track tool usage
        totalCost: estimatedMonthlySpend,
        totalTokens: 0 // TODO: Sum tokens from AI logs
      },
      savings: {
        estimatedMonthly: estimatedSavings,
        currency: 'BRL'
      }
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Credits details endpoint
router.get('/credits', requireAuth, async (req, res) => {
  try {
    const userId = Number((req as any).user?.id);
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const creditData = await db.query.userCreditBalance.findFirst({
      where: eq(userCreditBalance.userId, userId)
    });

    // Get recent credit transactions
    const recentTransactions = await db.query.creditTransactions.findMany({
      where: eq(creditTransactions.userId, userId),
      orderBy: [desc(creditTransactions.createdAt)],
      limit: 10
    });

    res.json({
      balance: creditData?.currentBalance || 0,
      totalEarned: creditData?.totalEarned || 0,
      totalSpent: creditData?.totalSpent || 0,
      recentTransactions: recentTransactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        createdAt: t.createdAt.toISOString()
      }))
    });
  } catch (error) {
    console.error('Credits error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Subscription details endpoint
router.get('/subscription', requireAuth, async (req, res) => {
  try {
    const userId = Number((req as any).user?.id);
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const subscription = await db.query.userSubscriptions.findFirst({
      where: eq(userSubscriptions.userId, userId)
    });

    if (!subscription) {
      return res.json({ subscription: null });
    }

    const plan = await db.query.userPlans.findFirst({
      where: eq(userPlans.id, subscription.planId)
    });

    // Get billing history
    const billingHistoryData = await db.query.billingHistory.findMany({
      where: eq(billingHistory.userId, userId),
      orderBy: [desc(billingHistory.createdAt)],
      limit: 5
    });

    res.json({
      subscription: {
        id: subscription.id,
        planName: plan?.displayName || plan?.name || 'Unknown',
        status: subscription.status,
        billingCycle: subscription.billingCycle,
        startDate: subscription.startDate.toISOString(),
        nextBillingDate: subscription.nextBillingDate?.toISOString() || null,
        cancelledAt: subscription.cancelledAt?.toISOString() || null
      },
      plan: plan ? {
        id: plan.id,
        name: plan.name,
        displayName: plan.displayName,
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice,
        credits: plan.credits,
        features: plan.features
      } : null,
      billingHistory: billingHistoryData.map(b => ({
        id: b.id,
        amount: b.amount,
        currency: b.currency,
        status: b.status,
        description: b.description,
        createdAt: b.createdAt.toISOString()
      }))
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Activity logs endpoint
router.get('/activity', requireAuth, async (req, res) => {
  try {
    const userId = Number((req as any).user?.id);
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get recent activity logs
    const activityLogs = await db.query.userActivityLogs.findMany({
      where: eq(userActivityLogs.userId, userId),
      orderBy: [desc(userActivityLogs.createdAt)],
      limit: 20
    });

    // Get recent AI generation activity
    const recentAiActivity = await db.query.aiGenerationLogs.findMany({
      where: eq(aiGenerationLogs.userId, userId),
      orderBy: [desc(aiGenerationLogs.createdAt)],
      limit: 10
    });

    // Group activities by type for UI display
    const groupedActivities = {
      auth: activityLogs.filter(log => log.action.includes('login') || log.action.includes('logout')),
      products: activityLogs.filter(log => log.action.includes('product')),
      ai: recentAiActivity.map(log => ({
        id: log.id,
        action: `AI Generation: ${log.feature || 'Unknown'}`,
        description: `Used ${log.model} for AI processing`,
        createdAt: log.createdAt,
        metadata: { cost: log.costUsd, tokens: log.totalTokens }
      }))
    };

    res.json({
      logs: activityLogs.map(log => ({
        id: log.id,
        action: log.action,
        description: log.description || '',
        createdAt: log.createdAt.toISOString(),
        metadata: log.metadata
      })),
      recentFeatures: [...groupedActivities.ai, ...groupedActivities.products].slice(0, 5),
      totalActivities: activityLogs.length
    });
  } catch (error) {
    console.error('Activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Recommendations endpoint
router.get('/recommendations', requireAuth, async (req, res) => {
  try {
    const userId = Number((req as any).user?.id);
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Generate personalized recommendations based on user activity
    const creditData = await db.query.userCreditBalance.findFirst({
      where: eq(userCreditBalance.userId, userId)
    });

    const recentAiActivity = await db.query.aiGenerationLogs.findMany({
      where: eq(aiGenerationLogs.userId, userId),
      orderBy: [desc(aiGenerationLogs.createdAt)],
      limit: 5
    });

    const recommendations = [];

    // Credit-based recommendations
    if (creditData && creditData.currentBalance < 10) {
      recommendations.push({
        type: 'credits',
        title: 'Créditos Baixos',
        description: 'Seus créditos estão acabando. Considere recarregar para continuar usando os recursos.',
        action: 'Recarregar Créditos',
        url: '/credits/purchase',
        priority: 'urgent' as const
      });
    }

    // Feature recommendations based on usage
    if (recentAiActivity.length === 0) {
      recommendations.push({
        type: 'feature',
        title: 'Experimente os Agentes de IA',
        description: 'Use nossos agentes especializados para otimizar seus produtos Amazon.',
        action: 'Explorar Agentes',
        url: '/agents',
        priority: 'high' as const
      });
    }

    // General tips
    recommendations.push({
      type: 'tip',
      title: 'Organize seus Fornecedores',
      description: 'Mantenha informações atualizadas dos seus fornecedores para melhor gestão.',
      action: 'Ver Fornecedores',
      url: '/minha-area/fornecedores',
      priority: 'medium' as const
    });

    recommendations.push({
      type: 'resource',
      title: 'Hub de Recursos',
      description: 'Acesse materiais exclusivos e ferramentas para acelerar seu negócio.',
      action: 'Explorar Recursos',
      url: '/hub-de-recursos',
      priority: 'low' as const
    });

    res.json({
      recommendations
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;