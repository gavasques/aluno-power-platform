import { db } from "../db";
import { users, hub_feature_costs } from "../../shared/schema";
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
        // Feature cost not found - using 0 credits as fallback
        return 0;
      }

      const creditsToDeduct = featureCost[0].costPerUse;
      
      // 2. Verificar saldo atual do usuário
      const userCredits = await db
        .select({ credits: users.credits })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!userCredits.length) {
        throw new Error(`User ${userId} not found`);
      }

      const currentCredits = parseFloat(userCredits[0].credits || '0');
      
      // 3. Verificar se tem créditos suficientes
      if (currentCredits < creditsToDeduct) {
        throw new Error(`Insufficient credits. User has ${currentCredits}, needs ${creditsToDeduct}`);
      }

      // 4. Descontar créditos
      const newBalance = currentCredits - creditsToDeduct;
      await db
        .update(users)
        .set({ 
          credits: newBalance.toString(),
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      // Credits deducted successfully
      
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
      
      // Buscar saldo atual
      const userCredits = await db
        .select({ credits: users.credits })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      const current = userCredits.length ? parseFloat(userCredits[0].credits || '0') : 0;
      
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