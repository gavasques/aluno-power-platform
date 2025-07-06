import { db } from '../db';
import { userTrials, userPlans, userCreditBalance, creditTransactions } from '../../shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

interface TrialCreationResult {
  success: boolean;
  trial?: any;
  error?: string;
}

class TrialService {
  // Iniciar trial gratuito
  async startTrial(
    userId: number, 
    planId: number, 
    trialDurationDays: number = 7,
    creditsLimit: number = 100
  ): Promise<TrialCreationResult> {
    try {
      // Verificar se o usuário já tem um trial ativo ou se já usou trial antes
      const existingTrial = await db.select()
        .from(userTrials)
        .where(eq(userTrials.userId, userId))
        .limit(1);

      if (existingTrial.length > 0) {
        return { 
          success: false, 
          error: 'Usuário já utilizou o período de teste gratuito' 
        };
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + trialDurationDays);

      // Criar trial
      const newTrial = await db.insert(userTrials)
        .values({
          userId,
          planId,
          startDate,
          endDate,
          originalEndDate: endDate,
          status: 'active',
          creditsLimit,
        })
        .returning();

      // Adicionar créditos iniciais do trial
      await this.addTrialCredits(userId, creditsLimit);

      return {
        success: true,
        trial: newTrial[0]
      };
    } catch (error) {
      console.error('Erro ao iniciar trial:', error);
      return { 
        success: false, 
        error: 'Erro interno do servidor' 
      };
    }
  }

  // Verificar se trial está ativo
  async isTrialActive(userId: number): Promise<boolean> {
    try {
      const now = new Date();
      const activeTrial = await db.select()
        .from(userTrials)
        .where(and(
          eq(userTrials.userId, userId),
          eq(userTrials.status, 'active'),
          gte(userTrials.endDate, now)
        ))
        .limit(1);

      return activeTrial.length > 0;
    } catch (error) {
      console.error('Erro ao verificar trial ativo:', error);
      return false;
    }
  }

  // Obter dados do trial do usuário
  async getUserTrial(userId: number): Promise<any> {
    try {
      const trial = await db.select()
        .from(userTrials)
        .where(eq(userTrials.userId, userId))
        .limit(1);

      if (trial.length === 0) {
        return null;
      }

      const userTrial = trial[0];
      const now = new Date();
      
      // Calcular dias restantes
      const daysRemaining = Math.max(0, Math.ceil((userTrial.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      
      // Calcular porcentagem de créditos usados
      const creditsUsagePercentage = (userTrial.creditsUsed / userTrial.creditsLimit) * 100;

      return {
        ...userTrial,
        daysRemaining,
        creditsRemaining: userTrial.creditsLimit - userTrial.creditsUsed,
        creditsUsagePercentage,
        isExpired: now > userTrial.endDate,
        isNearExpiry: daysRemaining <= 2 && daysRemaining > 0
      };
    } catch (error) {
      console.error('Erro ao obter trial do usuário:', error);
      return null;
    }
  }

  // Estender trial (com cupom)
  async extendTrial(userId: number, extensionDays: number, couponCode?: string): Promise<boolean> {
    try {
      const trial = await db.select()
        .from(userTrials)
        .where(eq(userTrials.userId, userId))
        .limit(1);

      if (trial.length === 0) {
        return false;
      }

      const userTrial = trial[0];
      const newEndDate = new Date(userTrial.endDate);
      newEndDate.setDate(newEndDate.getDate() + extensionDays);

      await db.update(userTrials)
        .set({
          endDate: newEndDate,
          couponCode: couponCode || userTrial.couponCode,
          updatedAt: new Date()
        })
        .where(eq(userTrials.userId, userId));

      return true;
    } catch (error) {
      console.error('Erro ao estender trial:', error);
      return false;
    }
  }

  // Converter trial em assinatura paga
  async convertTrial(userId: number, subscriptionId: number): Promise<boolean> {
    try {
      const conversionDetails = {
        convertedAt: new Date(),
        subscriptionId,
        conversionType: 'paid_subscription'
      };

      await db.update(userTrials)
        .set({
          status: 'converted',
          convertedAt: new Date(),
          conversionDetails,
          updatedAt: new Date()
        })
        .where(eq(userTrials.userId, userId));

      return true;
    } catch (error) {
      console.error('Erro ao converter trial:', error);
      return false;
    }
  }

  // Cancelar trial
  async cancelTrial(userId: number): Promise<boolean> {
    try {
      await db.update(userTrials)
        .set({
          status: 'cancelled',
          updatedAt: new Date()
        })
        .where(eq(userTrials.userId, userId));

      return true;
    } catch (error) {
      console.error('Erro ao cancelar trial:', error);
      return false;
    }
  }

  // Expirar trials automáticamente
  async expireTrials(): Promise<number> {
    try {
      const now = new Date();
      
      // Buscar trials ativos que já expiraram
      const expiredTrials = await db.select()
        .from(userTrials)
        .where(and(
          eq(userTrials.status, 'active'),
          lte(userTrials.endDate, now)
        ));

      // Marcar como expirados
      if (expiredTrials.length > 0) {
        await db.update(userTrials)
          .set({
            status: 'expired',
            updatedAt: new Date()
          })
          .where(and(
            eq(userTrials.status, 'active'),
            lte(userTrials.endDate, now)
          ));
      }

      return expiredTrials.length;
    } catch (error) {
      console.error('Erro ao expirar trials:', error);
      return 0;
    }
  }

  // Consumir créditos do trial
  async consumeTrialCredits(userId: number, creditsAmount: number): Promise<boolean> {
    try {
      const trial = await db.select()
        .from(userTrials)
        .where(and(
          eq(userTrials.userId, userId),
          eq(userTrials.status, 'active')
        ))
        .limit(1);

      if (trial.length === 0) {
        return false;
      }

      const userTrial = trial[0];
      const newCreditsUsed = userTrial.creditsUsed + creditsAmount;

      // Verificar se não excede o limite
      if (newCreditsUsed > userTrial.creditsLimit) {
        return false;
      }

      await db.update(userTrials)
        .set({
          creditsUsed: newCreditsUsed,
          updatedAt: new Date()
        })
        .where(eq(userTrials.userId, userId));

      return true;
    } catch (error) {
      console.error('Erro ao consumir créditos do trial:', error);
      return false;
    }
  }

  // Adicionar créditos iniciais do trial
  private async addTrialCredits(userId: number, creditsAmount: number): Promise<void> {
    try {
      // Buscar ou criar saldo de créditos do usuário
      let userBalance = await db.select()
        .from(userCreditBalance)
        .where(eq(userCreditBalance.userId, userId))
        .limit(1);

      if (userBalance.length === 0) {
        // Criar novo saldo
        await db.insert(userCreditBalance)
          .values({
            userId,
            currentBalance: creditsAmount,
            totalEarned: creditsAmount,
          });
      } else {
        // Atualizar saldo existente
        const balance = userBalance[0];
        await db.update(userCreditBalance)
          .set({
            currentBalance: balance.currentBalance + creditsAmount,
            totalEarned: balance.totalEarned + creditsAmount,
            updatedAt: new Date()
          })
          .where(eq(userCreditBalance.userId, userId));
      }

      // Registrar transação
      await db.insert(creditTransactions)
        .values({
          userId,
          type: 'trial_credit',
          amount: creditsAmount,
          balanceBefore: userBalance.length > 0 ? userBalance[0].currentBalance : 0,
          balanceAfter: (userBalance.length > 0 ? userBalance[0].currentBalance : 0) + creditsAmount,
          description: `Créditos do trial gratuito: ${creditsAmount} créditos`,
          relatedType: 'trial'
        });
    } catch (error) {
      console.error('Erro ao adicionar créditos do trial:', error);
    }
  }

  // Obter estatísticas de trials
  async getTrialStats(): Promise<any> {
    try {
      const trials = await db.select().from(userTrials);
      
      const stats = {
        total: trials.length,
        active: trials.filter(t => t.status === 'active').length,
        expired: trials.filter(t => t.status === 'expired').length,
        converted: trials.filter(t => t.status === 'converted').length,
        cancelled: trials.filter(t => t.status === 'cancelled').length,
        conversionRate: trials.length > 0 ? (trials.filter(t => t.status === 'converted').length / trials.length) * 100 : 0
      };

      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas de trials:', error);
      return null;
    }
  }
}

export const trialService = new TrialService();