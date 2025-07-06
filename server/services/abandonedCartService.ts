import { db } from '../db';
import { abandonedCarts, userPlans } from '../../shared/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

interface AbandonedCartData {
  userId?: number;
  sessionId: string;
  email?: string;
  planId: number;
  billingCycle: string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
  cartData: any;
  checkoutUrl?: string;
  metadata?: any;
}

class AbandonedCartService {
  // Criar carrinho abandonado
  async createAbandonedCart(cartData: AbandonedCartData): Promise<any> {
    try {
      const newCart = await db.insert(abandonedCarts)
        .values({
          userId: cartData.userId,
          sessionId: cartData.sessionId,
          email: cartData.email,
          planId: cartData.planId,
          billingCycle: cartData.billingCycle,
          amount: cartData.amount.toString(),
          currency: cartData.currency || 'BRL',
          paymentMethod: cartData.paymentMethod,
          cartData: cartData.cartData,
          checkoutUrl: cartData.checkoutUrl,
          lastActivityAt: new Date(),
          metadata: cartData.metadata,
        })
        .returning();

      return newCart[0];
    } catch (error) {
      console.error('Erro ao criar carrinho abandonado:', error);
      throw error;
    }
  }

  // Atualizar último acesso
  async updateLastActivity(sessionId: string): Promise<void> {
    try {
      await db.update(abandonedCarts)
        .set({
          lastActivityAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(abandonedCarts.sessionId, sessionId));
    } catch (error) {
      console.error('Erro ao atualizar atividade do carrinho:', error);
    }
  }

  // Buscar carrinhos abandonados para envio de email
  async getCartsForEmailCampaign(): Promise<any[]> {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Buscar carrinhos que precisam de email imediato (1 hora)
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const immediateEmails = await db.select()
        .from(abandonedCarts)
        .where(and(
          eq(abandonedCarts.converted, false),
          eq(abandonedCarts.emailSent, false),
          lte(abandonedCarts.lastActivityAt, oneHourAgo)
        ));

      // Buscar carrinhos para lembrete de 24h
      const reminder24h = await db.select()
        .from(abandonedCarts)
        .where(and(
          eq(abandonedCarts.converted, false),
          eq(abandonedCarts.emailsSent, 1),
          lte(abandonedCarts.lastActivityAt, oneDayAgo)
        ));

      // Buscar carrinhos para lembrete de 7 dias
      const reminder7d = await db.select()
        .from(abandonedCarts)
        .where(and(
          eq(abandonedCarts.converted, false),
          eq(abandonedCarts.emailsSent, 2),
          lte(abandonedCarts.lastActivityAt, oneWeekAgo)
        ));

      return [
        ...immediateEmails.map(cart => ({ ...cart, emailType: 'immediate' })),
        ...reminder24h.map(cart => ({ ...cart, emailType: 'reminder_24h' })),
        ...reminder7d.map(cart => ({ ...cart, emailType: 'reminder_7d' }))
      ];
    } catch (error) {
      console.error('Erro ao buscar carrinhos para campanha de email:', error);
      return [];
    }
  }

  // Marcar email como enviado
  async markEmailSent(cartId: number, emailType: string, discountOffered?: number): Promise<void> {
    try {
      const cart = await db.select()
        .from(abandonedCarts)
        .where(eq(abandonedCarts.id, cartId))
        .limit(1);

      if (cart.length === 0) return;

      const currentCart = cart[0];

      await db.update(abandonedCarts)
        .set({
          emailSent: true,
          emailsSent: currentCart.emailsSent + 1,
          emailType,
          lastEmailSent: new Date(),
          discountOffered: discountOffered?.toString(),
          updatedAt: new Date()
        })
        .where(eq(abandonedCarts.id, cartId));
    } catch (error) {
      console.error('Erro ao marcar email como enviado:', error);
    }
  }

  // Marcar como convertido
  async markAsConverted(sessionId: string, conversionAmount?: number): Promise<void> {
    try {
      await db.update(abandonedCarts)
        .set({
          converted: true,
          convertedAt: new Date(),
          conversionAmount: conversionAmount?.toString(),
          updatedAt: new Date()
        })
        .where(eq(abandonedCarts.sessionId, sessionId));
    } catch (error) {
      console.error('Erro ao marcar carrinho como convertido:', error);
    }
  }

  // Obter carrinho por sessão
  async getCartBySession(sessionId: string): Promise<any> {
    try {
      const cart = await db.select()
        .from(abandonedCarts)
        .where(eq(abandonedCarts.sessionId, sessionId))
        .limit(1);

      return cart.length > 0 ? cart[0] : null;
    } catch (error) {
      console.error('Erro ao buscar carrinho por sessão:', error);
      return null;
    }
  }

  // Obter carrinhos do usuário
  async getUserCarts(userId: number): Promise<any[]> {
    try {
      return await db.select()
        .from(abandonedCarts)
        .where(eq(abandonedCarts.userId, userId))
        .orderBy(desc(abandonedCarts.createdAt));
    } catch (error) {
      console.error('Erro ao buscar carrinhos do usuário:', error);
      return [];
    }
  }

  // Limpar carrinhos antigos (mais de 30 dias)
  async cleanOldCarts(): Promise<number> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const oldCarts = await db.select()
        .from(abandonedCarts)
        .where(lte(abandonedCarts.createdAt, thirtyDaysAgo));

      if (oldCarts.length > 0) {
        await db.delete(abandonedCarts)
          .where(lte(abandonedCarts.createdAt, thirtyDaysAgo));
      }

      return oldCarts.length;
    } catch (error) {
      console.error('Erro ao limpar carrinhos antigos:', error);
      return 0;
    }
  }

  // Obter estatísticas de carrinhos abandonados
  async getAbandonedCartStats(days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const carts = await db.select()
        .from(abandonedCarts)
        .where(gte(abandonedCarts.createdAt, startDate));

      const stats = {
        totalCarts: carts.length,
        convertedCarts: carts.filter(c => c.converted).length,
        emailsSent: carts.reduce((sum, c) => sum + c.emailsSent, 0),
        totalValue: carts.reduce((sum, c) => sum + parseFloat(c.amount), 0),
        convertedValue: carts
          .filter(c => c.converted && c.conversionAmount)
          .reduce((sum, c) => sum + parseFloat(c.conversionAmount!), 0),
        conversionRate: carts.length > 0 ? (carts.filter(c => c.converted).length / carts.length) * 100 : 0,
        averageCartValue: carts.length > 0 ? carts.reduce((sum, c) => sum + parseFloat(c.amount), 0) / carts.length : 0,
        emailConversionRate: 0
      };

      // Calcular taxa de conversão por email
      const emailsSentCarts = carts.filter(c => c.emailsSent > 0);
      if (emailsSentCarts.length > 0) {
        stats.emailConversionRate = (emailsSentCarts.filter(c => c.converted).length / emailsSentCarts.length) * 100;
      }

      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas de carrinhos abandonados:', error);
      return null;
    }
  }

  // Obter top planos abandonados
  async getTopAbandonedPlans(days: number = 30): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const carts = await db.select()
        .from(abandonedCarts)
        .where(gte(abandonedCarts.createdAt, startDate));

      // Agrupar por planId
      const planStats = carts.reduce((acc, cart) => {
        const planId = cart.planId;
        if (!acc[planId]) {
          acc[planId] = {
            planId,
            totalCarts: 0,
            convertedCarts: 0,
            totalValue: 0
          };
        }
        acc[planId].totalCarts++;
        if (cart.converted) acc[planId].convertedCarts++;
        acc[planId].totalValue += parseFloat(cart.amount);
        return acc;
      }, {} as any);

      return Object.values(planStats)
        .sort((a: any, b: any) => b.totalCarts - a.totalCarts);
    } catch (error) {
      console.error('Erro ao obter top planos abandonados:', error);
      return [];
    }
  }

  // Aplicar desconto de recuperação
  async applyRecoveryDiscount(sessionId: string, discountPercentage: number): Promise<boolean> {
    try {
      const cart = await this.getCartBySession(sessionId);
      if (!cart) return false;

      const originalAmount = parseFloat(cart.amount);
      const discountAmount = originalAmount * (discountPercentage / 100);
      const newAmount = originalAmount - discountAmount;

      await db.update(abandonedCarts)
        .set({
          amount: newAmount.toString(),
          discountOffered: discountAmount.toString(),
          metadata: {
            ...cart.metadata,
            recoveryDiscount: {
              originalAmount,
              discountPercentage,
              discountAmount,
              newAmount,
              appliedAt: new Date()
            }
          },
          updatedAt: new Date()
        })
        .where(eq(abandonedCarts.sessionId, sessionId));

      return true;
    } catch (error) {
      console.error('Erro ao aplicar desconto de recuperação:', error);
      return false;
    }
  }
}

export const abandonedCartService = new AbandonedCartService();