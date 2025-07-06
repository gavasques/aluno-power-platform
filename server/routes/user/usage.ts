import { Router, Request, Response } from 'express';
import { db } from '../../db';
import { users, aiGenerationLogs, aiImgGenerationLogs, userCreditBalance } from '../../../shared/schema';
import { eq, and, gte, lte, desc, sql, count } from 'drizzle-orm';

const router = Router();

interface UsageTransaction {
  id: string;
  timestamp: Date;
  featureName: string;
  category: string;
  creditsUsed: number;
  description: string;
  status: 'success' | 'failed' | 'partial';
  metadata: {
    projectId?: string;
    duration?: number;
    fileSize?: number;
    quality?: number;
    model?: string;
    provider?: string;
  };
}

interface UsageAnalytics {
  totalCredits: number;
  averageDaily: number;
  topFeatures: Array<{name: string, usage: number, percentage: number}>;
  patterns: {
    peakHours: number[];
    activeDays: string[];
    efficiency: number;
  };
  insights: string[];
  recommendations: string[];
  dailyUsage: Array<{date: string, usage: number}>;
  categoryBreakdown: Array<{category: string, usage: number, percentage: number}>;
}

// GET /api/user/usage/summary - Resumo do período
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { period = '30d' } = req.query;
    
    // Calcular data de início baseada no período
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Buscar logs de geração AI no período
    const aiLogs = await db.select()
      .from(aiGenerationLogs)
      .where(and(
        eq(aiGenerationLogs.userId, user.id.toString()),
        gte(aiGenerationLogs.createdAt, startDate)
      ))
      .orderBy(desc(aiGenerationLogs.createdAt));

    // Buscar logs de imagem AI no período
    const imgLogs = await db.select()
      .from(aiImgGenerationLogs)
      .where(and(
        eq(aiImgGenerationLogs.userId, user.id.toString()),
        gte(aiImgGenerationLogs.createdAt, startDate)
      ))
      .orderBy(desc(aiImgGenerationLogs.createdAt));

    // Calcular estatísticas
    const totalCreditsUsed = [...aiLogs, ...imgLogs].reduce((sum, log) => {
      const cost = parseFloat(log.costUsd || '0');
      return sum + (cost * 100); // Converter para créditos (assumindo 1 USD = 100 créditos)
    }, 0);

    const days = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const averageDaily = totalCreditsUsed / days;

    // Top funcionalidades
    const featureUsage: Record<string, number> = {};
    [...aiLogs, ...imgLogs].forEach(log => {
      const feature = log.feature || 'Unknown';
      featureUsage[feature] = (featureUsage[feature] || 0) + parseFloat(log.costUsd || '0') * 100;
    });

    const topFeatures = Object.entries(featureUsage)
      .map(([name, usage]) => ({
        name,
        usage,
        percentage: totalCreditsUsed > 0 ? (usage / totalCreditsUsed) * 100 : 0
      }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 5);

    // Buscar saldo atual de créditos
    const creditBalance = await db.select()
      .from(userCreditBalance)
      .where(eq(userCreditBalance.userId, user.id))
      .limit(1);

    const currentBalance = creditBalance[0]?.currentBalance || 0;

    const summary = {
      period,
      totalCreditsUsed: Math.round(totalCreditsUsed),
      averageDaily: Math.round(averageDaily),
      currentBalance,
      totalTransactions: aiLogs.length + imgLogs.length,
      topFeatures,
      comparisonWithPrevious: {
        creditsChange: 0, // TODO: Implementar comparação com período anterior
        percentChange: 0
      }
    };

    res.json(summary);
  } catch (error: any) {
    console.error('❌ [USAGE_SUMMARY] Error:', error);
    res.status(500).json({ 
      error: 'Falha ao buscar resumo de uso',
      details: error.message
    });
  }
});

// GET /api/user/usage/transactions - Lista de transações
router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { 
      period = '30d',
      feature,
      category,
      status,
      page = 1,
      limit = 50,
      search 
    } = req.query;
    
    const startDate = new Date();
    const now = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Buscar logs de AI
    let aiLogsQuery = db.select()
      .from(aiGenerationLogs)
      .where(and(
        eq(aiGenerationLogs.userId, user.id.toString()),
        gte(aiGenerationLogs.createdAt, startDate)
      ));

    // Aplicar filtros se especificados
    if (feature) {
      aiLogsQuery = aiLogsQuery.where(eq(aiGenerationLogs.feature, feature as string));
    }

    const aiLogs = await aiLogsQuery.orderBy(desc(aiGenerationLogs.createdAt));

    // Buscar logs de imagem
    const imgLogs = await db.select()
      .from(aiImgGenerationLogs)
      .where(and(
        eq(aiImgGenerationLogs.userId, user.id.toString()),
        gte(aiImgGenerationLogs.createdAt, startDate)
      ))
      .orderBy(desc(aiImgGenerationLogs.createdAt));

    // Combinar e formatar transações
    const allTransactions: UsageTransaction[] = [
      ...aiLogs.map(log => ({
        id: log.id,
        timestamp: log.createdAt,
        featureName: log.feature || 'Geração AI',
        category: 'AI Text Generation',
        creditsUsed: Math.round(parseFloat(log.costUsd || '0') * 100),
        description: `Geração AI com ${log.model || 'modelo padrão'}`,
        status: log.status === 'completed' ? 'success' as const : 
                log.status === 'failed' ? 'failed' as const : 'partial' as const,
        metadata: {
          duration: log.processingTimeMs,
          model: log.model,
          provider: log.provider,
          quality: log.inputTokens && log.outputTokens ? 
            Math.round((log.outputTokens / (log.inputTokens + log.outputTokens)) * 100) : undefined
        }
      })),
      ...imgLogs.map(log => ({
        id: log.id,
        timestamp: log.createdAt,
        featureName: log.feature || 'Geração de Imagem',
        category: 'AI Image Generation',
        creditsUsed: Math.round(parseFloat(log.costUsd || '0') * 100),
        description: `Geração de imagem com ${log.model || 'modelo padrão'}`,
        status: log.status === 'completed' ? 'success' as const : 
                log.status === 'failed' ? 'failed' as const : 'partial' as const,
        metadata: {
          duration: log.processingTimeMs,
          model: log.model,
          provider: log.provider
        }
      }))
    ];

    // Ordenar por timestamp
    allTransactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Aplicar busca se especificada
    let filteredTransactions = allTransactions;
    if (search) {
      const searchTerm = search.toString().toLowerCase();
      filteredTransactions = allTransactions.filter(t => 
        t.featureName.toLowerCase().includes(searchTerm) ||
        t.description.toLowerCase().includes(searchTerm) ||
        t.category.toLowerCase().includes(searchTerm)
      );
    }

    // Aplicar paginação
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    const paginatedTransactions = filteredTransactions.slice(offset, offset + parseInt(limit as string));

    res.json({
      transactions: paginatedTransactions,
      pagination: {
        total: filteredTransactions.length,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(filteredTransactions.length / parseInt(limit as string))
      }
    });
  } catch (error: any) {
    console.error('❌ [USAGE_TRANSACTIONS] Error:', error);
    res.status(500).json({ 
      error: 'Falha ao buscar transações',
      details: error.message
    });
  }
});

// GET /api/user/usage/analytics - Analytics pessoais
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { period = '30d' } = req.query;
    
    const startDate = new Date();
    const now = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Buscar todos os logs
    const aiLogs = await db.select()
      .from(aiGenerationLogs)
      .where(and(
        eq(aiGenerationLogs.userId, user.id.toString()),
        gte(aiGenerationLogs.createdAt, startDate)
      ));

    const imgLogs = await db.select()
      .from(aiImgGenerationLogs)
      .where(and(
        eq(aiImgGenerationLogs.userId, user.id.toString()),
        gte(aiImgGenerationLogs.createdAt, startDate)
      ));

    // Análise de padrões temporais
    const hourlyUsage: Record<number, number> = {};
    const dailyUsage: Record<string, number> = {};
    const weeklyUsage: Record<string, number> = {};

    [...aiLogs, ...imgLogs].forEach(log => {
      const date = new Date(log.createdAt);
      const hour = date.getHours();
      const dayKey = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('pt-BR', { weekday: 'long' });
      const cost = parseFloat(log.costUsd || '0') * 100;

      hourlyUsage[hour] = (hourlyUsage[hour] || 0) + cost;
      dailyUsage[dayKey] = (dailyUsage[dayKey] || 0) + cost;
      weeklyUsage[dayName] = (weeklyUsage[dayName] || 0) + cost;
    });

    // Identificar horários de pico
    const peakHours = Object.entries(hourlyUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    // Dias mais ativos
    const activeDays = Object.entries(weeklyUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([day]) => day);

    // Uso diário para gráfico
    const dailyUsageArray = Object.entries(dailyUsage)
      .map(([date, usage]) => ({ date, usage: Math.round(usage) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Análise por categoria
    const categories = {
      'Texto': [...aiLogs].reduce((sum, log) => sum + parseFloat(log.costUsd || '0') * 100, 0),
      'Imagem': [...imgLogs].reduce((sum, log) => sum + parseFloat(log.costUsd || '0') * 100, 0)
    };

    const totalUsage = Object.values(categories).reduce((sum, val) => sum + val, 0);
    const categoryBreakdown = Object.entries(categories).map(([category, usage]) => ({
      category,
      usage: Math.round(usage),
      percentage: totalUsage > 0 ? Math.round((usage / totalUsage) * 100) : 0
    }));

    // Insights e recomendações
    const insights = [];
    const recommendations = [];

    if (peakHours.length > 0) {
      insights.push(`Você é mais ativo entre ${peakHours[0]}h-${peakHours[0] + 1}h`);
    }

    if (activeDays.length > 0) {
      insights.push(`Seu dia mais produtivo é ${activeDays[0]}`);
    }

    if (totalUsage < 100) {
      recommendations.push('Considere explorar mais funcionalidades para maximizar o valor do seu plano');
    }

    if (categories['Imagem'] > categories['Texto']) {
      recommendations.push('Você usa mais geração de imagens - considere o plano Premium para mais créditos');
    }

    const analytics: UsageAnalytics = {
      totalCredits: Math.round(totalUsage),
      averageDaily: Math.round(totalUsage / Math.max(dailyUsageArray.length, 1)),
      topFeatures: [], // TODO: Implementar análise detalhada de funcionalidades
      patterns: {
        peakHours,
        activeDays,
        efficiency: Math.round((aiLogs.filter(l => l.status === 'completed').length / Math.max(aiLogs.length, 1)) * 100)
      },
      insights,
      recommendations,
      dailyUsage: dailyUsageArray,
      categoryBreakdown
    };

    res.json(analytics);
  } catch (error: any) {
    console.error('❌ [USAGE_ANALYTICS] Error:', error);
    res.status(500).json({ 
      error: 'Falha ao buscar analytics',
      details: error.message
    });
  }
});

// GET /api/user/usage/patterns - Padrões de comportamento
router.get('/patterns', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Buscar dados dos últimos 90 dias para análise de padrões
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    const aiLogs = await db.select()
      .from(aiGenerationLogs)
      .where(and(
        eq(aiGenerationLogs.userId, user.id.toString()),
        gte(aiGenerationLogs.createdAt, startDate)
      ));

    // Análise de sessões (agrupamento por proximidade temporal)
    const sessions = [];
    let currentSession = [];
    let lastTimestamp = null;

    const sortedLogs = aiLogs.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    for (const log of sortedLogs) {
      if (!lastTimestamp || log.createdAt.getTime() - lastTimestamp > 30 * 60 * 1000) { // 30 min gap
        if (currentSession.length > 0) {
          sessions.push(currentSession);
        }
        currentSession = [log];
      } else {
        currentSession.push(log);
      }
      lastTimestamp = log.createdAt.getTime();
    }

    if (currentSession.length > 0) {
      sessions.push(currentSession);
    }

    // Calcular estatísticas de sessão
    const sessionDurations = sessions.map(session => {
      if (session.length === 1) return 0;
      return session[session.length - 1].createdAt.getTime() - session[0].createdAt.getTime();
    });

    const avgSessionDuration = sessionDurations.reduce((sum, dur) => sum + dur, 0) / Math.max(sessions.length, 1);
    const avgActionsPerSession = sessions.reduce((sum, session) => sum + session.length, 0) / Math.max(sessions.length, 1);

    const patterns = {
      totalSessions: sessions.length,
      averageSessionDuration: Math.round(avgSessionDuration / (1000 * 60)), // em minutos
      averageActionsPerSession: Math.round(avgActionsPerSession),
      mostActiveDay: 'Segunda-feira', // TODO: Calcular baseado em dados reais
      mostActiveHour: 14, // TODO: Calcular baseado em dados reais
      consistency: Math.min(100, (sessions.length / 90) * 100), // % de dias com atividade
      efficiency: Math.round((aiLogs.filter(l => l.status === 'completed').length / Math.max(aiLogs.length, 1)) * 100)
    };

    res.json(patterns);
  } catch (error: any) {
    console.error('❌ [USAGE_PATTERNS] Error:', error);
    res.status(500).json({ 
      error: 'Falha ao buscar padrões',
      details: error.message
    });
  }
});

// GET /api/user/usage/insights - Insights e recomendações
router.get('/insights', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Buscar dados para análise
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentLogs = await db.select()
      .from(aiGenerationLogs)
      .where(and(
        eq(aiGenerationLogs.userId, user.id.toString()),
        gte(aiGenerationLogs.createdAt, last30Days)
      ));

    const creditBalance = await db.select()
      .from(userCreditBalance)
      .where(eq(userCreditBalance.userId, user.id))
      .limit(1);

    const currentBalance = creditBalance[0]?.currentBalance || 0;
    const totalSpent = recentLogs.reduce((sum, log) => sum + parseFloat(log.costUsd || '0') * 100, 0);

    // Gerar insights
    const insights = [];
    const recommendations = [];
    const alerts = [];

    // Análise de uso
    if (totalSpent === 0) {
      insights.push('Você ainda não usou nenhuma funcionalidade este mês');
      recommendations.push('Experimente nossos agentes de IA para otimizar suas vendas');
    } else if (totalSpent < 50) {
      insights.push('Seu uso tem sido baixo este mês');
      recommendations.push('Considere explorar mais funcionalidades para maximizar o valor');
    } else if (totalSpent > 500) {
      insights.push('Você é um usuário muito ativo!');
      recommendations.push('Considere upgradar para um plano superior para economizar');
    }

    // Análise de saldo
    if (currentBalance < 100) {
      alerts.push('Saldo de créditos baixo - considere recarregar');
    } else if (currentBalance > 1000) {
      insights.push('Você tem muitos créditos disponíveis');
      recommendations.push('Aproveite para experimentar funcionalidades premium');
    }

    // Análise de eficiência
    const successRate = recentLogs.length > 0 ? 
      (recentLogs.filter(log => log.status === 'completed').length / recentLogs.length) * 100 : 100;

    if (successRate < 80) {
      alerts.push('Taxa de sucesso baixa - verifique a qualidade dos inputs');
    } else if (successRate > 95) {
      insights.push('Excelente taxa de sucesso nas suas operações!');
    }

    const data = {
      insights,
      recommendations,
      alerts,
      metrics: {
        totalSpent: Math.round(totalSpent),
        currentBalance,
        successRate: Math.round(successRate),
        totalOperations: recentLogs.length
      }
    };

    res.json(data);
  } catch (error: any) {
    console.error('❌ [USAGE_INSIGHTS] Error:', error);
    res.status(500).json({ 
      error: 'Falha ao buscar insights',
      details: error.message
    });
  }
});

// POST /api/user/usage/export - Exportar dados
router.post('/export', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { period = '30d', format = 'csv', includeMetadata = false } = req.body;
    
    const startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const aiLogs = await db.select()
      .from(aiGenerationLogs)
      .where(and(
        eq(aiGenerationLogs.userId, user.id.toString()),
        gte(aiGenerationLogs.createdAt, startDate)
      ))
      .orderBy(desc(aiGenerationLogs.createdAt));

    // Para este exemplo, retornamos uma URL de download simulada
    // Em produção, você geraria o arquivo e retornaria a URL real
    const exportData = {
      downloadUrl: `/api/exports/usage-${user.id}-${Date.now()}.${format}`,
      filename: `historico-uso-${period}.${format}`,
      recordsCount: aiLogs.length,
      generatedAt: new Date().toISOString()
    };

    res.json(exportData);
  } catch (error: any) {
    console.error('❌ [USAGE_EXPORT] Error:', error);
    res.status(500).json({ 
      error: 'Falha ao exportar dados',
      details: error.message
    });
  }
});

export default router;