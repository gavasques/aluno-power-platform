import { db } from '../db';
import { conversionEvents } from '../../shared/schema';
import { eq, and, gte, lte, desc, sql, count } from 'drizzle-orm';

interface ConversionEventData {
  userId?: number;
  sessionId?: string;
  eventType: string;
  eventData?: any;
  url?: string;
  referer?: string;
  userAgent?: string;
  ipAddress?: string;
  metadata?: any;
}

class AnalyticsService {
  // Registrar evento de conversão
  async trackEvent(eventData: ConversionEventData): Promise<any> {
    try {
      const newEvent = await db.insert(conversionEvents)
        .values({
          userId: eventData.userId,
          sessionId: eventData.sessionId,
          eventType: eventData.eventType,
          eventData: eventData.eventData,
          url: eventData.url,
          referer: eventData.referer,
          userAgent: eventData.userAgent,
          ipAddress: eventData.ipAddress,
          timestamp: new Date(),
          metadata: eventData.metadata,
        })
        .returning();

      return newEvent[0];
    } catch (error) {
      console.error('Erro ao registrar evento:', error);
      throw error;
    }
  }

  // Obter funil de conversão
  async getConversionFunnel(days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Definir eventos do funil
      const funnelEvents = [
        'page_view',
        'signup_started',
        'signup_completed',
        'trial_started',
        'checkout_started',
        'payment_success'
      ];

      const funnelData = [];

      for (const eventType of funnelEvents) {
        const eventCount = await db.select({ count: count() })
          .from(conversionEvents)
          .where(and(
            eq(conversionEvents.eventType, eventType),
            gte(conversionEvents.timestamp, startDate)
          ));

        funnelData.push({
          eventType,
          count: eventCount[0].count,
          step: funnelEvents.indexOf(eventType) + 1
        });
      }

      // Calcular taxas de conversão entre etapas
      const funnelWithRates = funnelData.map((step, index) => {
        let conversionRate = 0;
        if (index > 0 && funnelData[index - 1].count > 0) {
          conversionRate = (step.count / funnelData[index - 1].count) * 100;
        }
        return {
          ...step,
          conversionRate: index === 0 ? 100 : conversionRate
        };
      });

      return funnelWithRates;
    } catch (error) {
      console.error('Erro ao obter funil de conversão:', error);
      return [];
    }
  }

  // Obter eventos por usuário
  async getUserEvents(userId: number, days: number = 30): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      return await db.select()
        .from(conversionEvents)
        .where(and(
          eq(conversionEvents.userId, userId),
          gte(conversionEvents.timestamp, startDate)
        ))
        .orderBy(desc(conversionEvents.timestamp));
    } catch (error) {
      console.error('Erro ao obter eventos do usuário:', error);
      return [];
    }
  }

  // Obter eventos por sessão
  async getSessionEvents(sessionId: string): Promise<any[]> {
    try {
      return await db.select()
        .from(conversionEvents)
        .where(eq(conversionEvents.sessionId, sessionId))
        .orderBy(desc(conversionEvents.timestamp));
    } catch (error) {
      console.error('Erro ao obter eventos da sessão:', error);
      return [];
    }
  }

  // Obter estatísticas de origem de tráfego
  async getTrafficSources(days: number = 30): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const refererStats = await db.select({
        referer: conversionEvents.referer,
        visits: count(),
      })
        .from(conversionEvents)
        .where(and(
          eq(conversionEvents.eventType, 'page_view'),
          gte(conversionEvents.timestamp, startDate)
        ))
        .groupBy(conversionEvents.referer)
        .orderBy(desc(count()));

      return refererStats.map(stat => ({
        source: this.categorizeReferer(stat.referer),
        visits: stat.visits,
        referer: stat.referer
      }));
    } catch (error) {
      console.error('Erro ao obter origens de tráfego:', error);
      return [];
    }
  }

  // Obter páginas mais visitadas
  async getTopPages(days: number = 30): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      return await db.select({
        url: conversionEvents.url,
        visits: count(),
      })
        .from(conversionEvents)
        .where(and(
          eq(conversionEvents.eventType, 'page_view'),
          gte(conversionEvents.timestamp, startDate)
        ))
        .groupBy(conversionEvents.url)
        .orderBy(desc(count()));
    } catch (error) {
      console.error('Erro ao obter páginas mais visitadas:', error);
      return [];
    }
  }

  // Obter taxa de conversão por origem
  async getConversionBySource(days: number = 30): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Buscar visitantes únicos por origem
      const visitors = await db.select({
        referer: conversionEvents.referer,
        sessionId: conversionEvents.sessionId,
      })
        .from(conversionEvents)
        .where(and(
          eq(conversionEvents.eventType, 'page_view'),
          gte(conversionEvents.timestamp, startDate)
        ));

      // Buscar conversões por origem
      const conversions = await db.select({
        referer: conversionEvents.referer,
        sessionId: conversionEvents.sessionId,
      })
        .from(conversionEvents)
        .where(and(
          eq(conversionEvents.eventType, 'payment_success'),
          gte(conversionEvents.timestamp, startDate)
        ));

      // Agrupar por origem
      const sourceStats = {};
      
      visitors.forEach(visitor => {
        const source = this.categorizeReferer(visitor.referer);
        if (!sourceStats[source]) {
          sourceStats[source] = { visitors: new Set(), conversions: new Set() };
        }
        sourceStats[source].visitors.add(visitor.sessionId);
      });

      conversions.forEach(conversion => {
        const source = this.categorizeReferer(conversion.referer);
        if (sourceStats[source]) {
          sourceStats[source].conversions.add(conversion.sessionId);
        }
      });

      return Object.entries(sourceStats).map(([source, data]) => ({
        source,
        visitors: data.visitors.size,
        conversions: data.conversions.size,
        conversionRate: data.visitors.size > 0 ? (data.conversions.size / data.visitors.size) * 100 : 0
      }));
    } catch (error) {
      console.error('Erro ao obter conversão por origem:', error);
      return [];
    }
  }

  // Obter dados de cohort (análise de coorte)
  async getCohortAnalysis(days: number = 90): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Buscar usuários que se registraram por semana
      const signups = await db.select()
        .from(conversionEvents)
        .where(and(
          eq(conversionEvents.eventType, 'signup_completed'),
          gte(conversionEvents.timestamp, startDate)
        ))
        .orderBy(conversionEvents.timestamp);

      // Buscar conversões por usuário
      const conversions = await db.select()
        .from(conversionEvents)
        .where(and(
          eq(conversionEvents.eventType, 'payment_success'),
          gte(conversionEvents.timestamp, startDate)
        ));

      // Agrupar por semana de cadastro
      const cohorts = {};
      signups.forEach(signup => {
        const weekStart = this.getWeekStart(signup.timestamp);
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!cohorts[weekKey]) {
          cohorts[weekKey] = {
            signups: [],
            conversions: []
          };
        }
        cohorts[weekKey].signups.push(signup);
      });

      // Associar conversões aos cohorts
      conversions.forEach(conversion => {
        const userSignup = signups.find(s => s.userId === conversion.userId);
        if (userSignup) {
          const weekStart = this.getWeekStart(userSignup.timestamp);
          const weekKey = weekStart.toISOString().split('T')[0];
          if (cohorts[weekKey]) {
            cohorts[weekKey].conversions.push(conversion);
          }
        }
      });

      return Object.entries(cohorts).map(([week, data]) => ({
        cohortWeek: week,
        signups: data.signups.length,
        conversions: data.conversions.length,
        conversionRate: data.signups.length > 0 ? (data.conversions.length / data.signups.length) * 100 : 0
      }));
    } catch (error) {
      console.error('Erro ao obter análise de coorte:', error);
      return [];
    }
  }

  // Obter relatório de abandono de checkout
  async getCheckoutAbandonmentReport(days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const checkoutStarts = await db.select({ count: count() })
        .from(conversionEvents)
        .where(and(
          eq(conversionEvents.eventType, 'checkout_started'),
          gte(conversionEvents.timestamp, startDate)
        ));

      const checkoutCompletions = await db.select({ count: count() })
        .from(conversionEvents)
        .where(and(
          eq(conversionEvents.eventType, 'payment_success'),
          gte(conversionEvents.timestamp, startDate)
        ));

      const starts = checkoutStarts[0].count;
      const completions = checkoutCompletions[0].count;
      const abandonments = starts - completions;
      const abandonmentRate = starts > 0 ? (abandonments / starts) * 100 : 0;

      return {
        checkoutStarts: starts,
        checkoutCompletions: completions,
        abandonments,
        abandonmentRate,
        completionRate: starts > 0 ? (completions / starts) * 100 : 0
      };
    } catch (error) {
      console.error('Erro ao obter relatório de abandono:', error);
      return null;
    }
  }

  // Limpar eventos antigos
  async cleanOldEvents(days: number = 365): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const oldEvents = await db.select({ count: count() })
        .from(conversionEvents)
        .where(lte(conversionEvents.timestamp, cutoffDate));

      if (oldEvents[0].count > 0) {
        await db.delete(conversionEvents)
          .where(lte(conversionEvents.timestamp, cutoffDate));
      }

      return oldEvents[0].count;
    } catch (error) {
      console.error('Erro ao limpar eventos antigos:', error);
      return 0;
    }
  }

  // Utilitários privados
  private categorizeReferer(referer: string | null): string {
    if (!referer || referer === '') return 'Direct';
    
    const url = referer.toLowerCase();
    
    if (url.includes('google')) return 'Google';
    if (url.includes('facebook')) return 'Facebook';
    if (url.includes('instagram')) return 'Instagram';
    if (url.includes('youtube')) return 'YouTube';
    if (url.includes('linkedin')) return 'LinkedIn';
    if (url.includes('twitter') || url.includes('x.com')) return 'Twitter/X';
    if (url.includes('tiktok')) return 'TikTok';
    if (url.includes('pinterest')) return 'Pinterest';
    if (url.includes('bing')) return 'Bing';
    if (url.includes('yahoo')) return 'Yahoo';
    
    // Verificar se é email
    if (url.includes('mail') || url.includes('gmail') || url.includes('outlook')) return 'Email';
    
    // Verificar se é outro site
    try {
      const domain = new URL(referer).hostname;
      return domain;
    } catch {
      return 'Other';
    }
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }
}

export const analyticsService = new AnalyticsService();