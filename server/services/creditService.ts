import { db } from "../db";
import { users, featureCosts, userCreditBalance } from "../../shared/schema";
import { eq } from "drizzle-orm";

export class CreditService {
  /**
   * Descontar créditos do usuário baseado no feature
   */
  static async deductCredits(userId: number, featureName: string): Promise<number> {
    try {
      // 1. Buscar custo da feature
      const featureCost = await db
        .select({ costPerUse: featureCosts.costPerUse })
        .from(featureCosts)
        .where(eq(featureCosts.featureName, featureName))
        .limit(1);

      if (!featureCost.length) {
        console.log(`⚠️ [CREDIT] Feature cost not found for: ${featureName}, using 0 credits`);
        return 0;
      }

      const creditsToDeduct = featureCost[0].costPerUse;
      
      // 2. Verificar saldo atual do usuário na tabela correta
      const userCredits = await db
        .select({ currentBalance: userCreditBalance.currentBalance })
        .from(userCreditBalance)
        .where(eq(userCreditBalance.userId, userId))
        .limit(1);

      if (!userCredits.length) {
        throw new Error(`User ${userId} not found in credit balance`);
      }

      const currentCredits = userCredits[0].currentBalance;
      
      // 3. Verificar se tem créditos suficientes
      if (currentCredits < creditsToDeduct) {
        throw new Error(`Insufficient credits. User has ${currentCredits}, needs ${creditsToDeduct}`);
      }

      // 4. Descontar créditos na tabela correta
      const newBalance = currentCredits - creditsToDeduct;
      const newSpent = (await db.select({ totalSpent: userCreditBalance.totalSpent }).from(userCreditBalance).where(eq(userCreditBalance.userId, userId)).limit(1))[0]?.totalSpent || 0;
      
      await db
        .update(userCreditBalance)
        .set({ 
          currentBalance: newBalance,
          totalSpent: newSpent + creditsToDeduct,
          updatedAt: new Date()
        })
        .where(eq(userCreditBalance.userId, userId));

      console.log(`💰 [CREDIT] Deducted ${creditsToDeduct} credits from user ${userId} (${currentCredits} → ${newBalance})`);
      
      return creditsToDeduct;
    } catch (error) {
      console.error(`❌ [CREDIT] Error deducting credits for ${featureName}:`, error);
      throw error;
    }
  }

  /**
   * Verificar se usuário tem créditos suficientes
   */
  static async checkCredits(userId: number, featureName: string): Promise<{ hasEnough: boolean, required: number, current: number }> {
    try {
      // Buscar custo da feature
      const featureCost = await db
        .select({ costPerUse: featureCosts.costPerUse })
        .from(featureCosts)
        .where(eq(featureCosts.featureName, featureName))
        .limit(1);

      const required = featureCost.length ? featureCost[0].costPerUse : 0;
      
      // Buscar saldo atual da tabela correta user_credit_balance
      const userCredits = await db
        .select({ currentBalance: userCreditBalance.currentBalance })
        .from(userCreditBalance)
        .where(eq(userCreditBalance.userId, userId))
        .limit(1);

      const current = userCredits.length ? userCredits[0].currentBalance : 0;
      
      return {
        hasEnough: current >= required,
        required,
        current
      };
    } catch (error) {
      console.error(`❌ [CREDIT] Error checking credits for ${featureName}:`, error);
      return { hasEnough: false, required: 0, current: 0 };
    }
  }
}