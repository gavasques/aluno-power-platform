import { Router } from 'express';
import { requireAuth } from '../security';
import { db } from '../db';
import { users, userCreditBalance, creditTransactions, userSubscriptions, userPlans, billingHistory, userActivityLogs, aiGenerationLogs, aiImgGenerationLogs } from '../../shared/schema';
import { eq, desc, gte, sql } from 'drizzle-orm';

const router = Router();

// Get dashboard summary with user info, credits, and basic stats
router.get('/summary', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get user info with credits
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true, name: true, email: true, role: true, credits: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get current credit balance from user table (primary source)
    const currentBalance = parseFloat(user.credits?.toString() || '0');
    
    // Get legacy credit data for backwards compatibility
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
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const creditUsageThisMonth = await db
      .select({ 
        totalSpent: sql<number>`COALESCE(SUM(CASE WHEN ${creditTransactions.amount} < 0 THEN ABS(${creditTransactions.amount}) ELSE 0 END), 0)`
      })
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

    const [imageRequests] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(aiImgGenerationLogs)
      .where(
        sql`${aiImgGenerationLogs.userId} = ${userId} AND ${aiImgGenerationLogs.createdAt} >= ${startOfMonth}`
      );

    // Calculate estimated savings (simplified calculation)
    const estimatedMonthlySpend = (aiRequests?.count || 0) * 0.05 + (imageRequests?.count || 0) * 0.20;
    const currentPlanCost = subscription?.plan?.price || 0;
    const estimatedSavings = Math.max(0, estimatedMonthlySpend - currentPlanCost);

    const dashboardData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: planName,
        creditBalance: currentBalance
      },
      credits: {
        current: currentBalance,
        totalEarned: creditData?.totalEarned || 0,
        totalSpent: creditData?.totalSpent || 0,
        usageThisMonth: creditUsageThisMonth[0]?.totalSpent || 0
      },
      subscription: subscription ? {
        planName: planName,
        status: subscription.status,
        nextBilling: subscription.nextBillingDate ? subscription.nextBillingDate.toISOString() : null,
        billingCycle: subscription.billingCycle
      } : null,
      usage: {
        aiRequests: aiRequests?.count || 0,
        imageRequests: imageRequests?.count || 0,
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

// Get detailed credit information
router.get('/credits', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
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
      balance: creditData?.balance || 0,
      totalEarned: creditData?.totalEarned || 0,
      totalSpent: creditData?.totalSpent || 0,
      recentTransactions
    });
  } catch (error) {
    console.error('Credit details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get subscription details
router.get('/subscription', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const subscription = await db.query.userSubscriptions.findFirst({
      where: eq(userSubscriptions.userId, userId),
      with: {
        plan: true
      }
    });

    // Get billing history
    const billingHistoryData = await db.query.billingHistory.findMany({
      where: eq(billingHistory.userId, userId),
      orderBy: [desc(billingHistory.createdAt)],
      limit: 5
    });

    res.json({
      subscription,
      billingHistory: billingHistoryData
    });
  } catch (error) {
    console.error('Subscription details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get activity feed
router.get('/activity', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get recent activity logs
    const logs = await db.query.userActivityLogs.findMany({
      where: eq(userActivityLogs.userId, userId),
      orderBy: [desc(userActivityLogs.createdAt)],
      limit: 20
    });

    // Get recent AI generation features used
    const recentAiFeatures = await db.query.ai_generation_logs.findMany({
      where: eq(ai_generation_logs.userId, userId),
      orderBy: [desc(ai_generation_logs.createdAt)],
      limit: 10,
      columns: {
        id: true,
        feature: true,
        provider: true,
        model: true,
        cost: true,
        createdAt: true
      }
    });

    // Get recent image processing features
    const recentImageFeatures = await db.query.ai_img_generation_logs.findMany({
      where: eq(ai_img_generation_logs.userId, userId),
      orderBy: [desc(ai_img_generation_logs.createdAt)],
      limit: 10,
      columns: {
        id: true,
        feature: true,
        provider: true,
        model: true,
        cost: true,
        createdAt: true
      }
    });

    // Combine and format recent features
    const recentFeatures = [
      ...recentAiFeatures.map(f => ({
        type: 'ai_generation',
        feature: f.feature || 'ai-text',
        model: f.model,
        cost: f.cost,
        date: f.createdAt
      })),
      ...recentImageFeatures.map(f => ({
        type: 'image_processing',
        feature: f.feature || 'image-processing',
        model: f.model,
        cost: f.cost,
        date: f.createdAt
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 15);

    res.json({
      logs,
      recentFeatures
    });
  } catch (error) {
    console.error('Activity feed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get personalized recommendations
router.get('/recommendations', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get user's credit balance and subscription info
    const creditData = await db.query.userCredits.findFirst({
      where: eq(userCredits.userId, userId)
    });

    const subscription = await db.query.userSubscriptions.findFirst({
      where: eq(userSubscriptions.userId, userId),
      with: { plan: true }
    });

    const recommendations = [];

    // Low credits recommendation
    if ((creditData?.balance || 0) < 100) {
      recommendations.push({
        type: 'credits',
        title: 'Créditos Baixos',
        description: 'Seus créditos estão acabando. Recarregue agora para continuar usando nossas ferramentas.',
        action: 'Comprar Créditos',
        url: '/credits/buy',
        priority: 'urgent'
      });
    }

    // Upgrade recommendation for free users
    if (!subscription || subscription.plan?.name === 'Gratuito') {
      recommendations.push({
        type: 'upgrade',
        title: 'Upgrade para Premium',
        description: 'Desbloqueie recursos avançados e obtenha mais créditos mensais com um plano premium.',
        action: 'Ver Planos',
        url: '/subscription/plans',
        priority: 'high'
      });
    }

    // Feature recommendation based on usage
    const recentAiUsage = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(ai_generation_logs)
      .where(
        sql`${ai_generation_logs.userId} = ${userId} AND ${ai_generation_logs.createdAt} >= ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}`
      );

    if ((recentAiUsage[0]?.count || 0) === 0) {
      recommendations.push({
        type: 'feature',
        title: 'Explore Nossos Agentes IA',
        description: 'Descubra como nossos agentes IA podem otimizar seus listings da Amazon e gerar conteúdo profissional.',
        action: 'Ver Agentes',
        url: '/agentes',
        priority: 'medium'
      });
    }

    res.json({ recommendations });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle quick actions
router.post('/quick-action', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { action, data } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    let result = { success: true, message: '', redirectUrl: '' };

    switch (action) {
      case 'buy_credits':
        result.message = 'Redirecionando para compra de créditos...';
        result.redirectUrl = '/credits/buy';
        break;

      case 'upgrade_plan':
        result.message = 'Redirecionando para planos premium...';
        result.redirectUrl = '/subscription/plans';
        break;

      case 'contact_support':
        result.message = 'Redirecionando para suporte...';
        result.redirectUrl = 'mailto:support@aluno-power.com';
        break;

      case 'view_tutorials':
        result.message = 'Redirecionando para tutoriais...';
        result.redirectUrl = '/hub/materiais';
        break;

      case 'view_documentation':
        result.message = 'Redirecionando para documentação...';
        result.redirectUrl = '/hub/materiais';
        break;

      case 'schedule_demo':
        result.message = 'Funcionalidade em desenvolvimento';
        result.redirectUrl = '';
        break;

      default:
        result.success = false;
        result.message = 'Ação não reconhecida';
    }

    res.json(result);
  } catch (error) {
    console.error('Quick action error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;