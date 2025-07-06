import { db } from '../db';
import { userCreditBalance, creditTransactions } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export class CreditService {
  // Add credits to user account
  static async creditCredits(
    userId: number,
    amount: number,
    description: string,
    source: 'subscription' | 'purchase' | 'refund' | 'bonus',
    referenceId?: string
  ): Promise<void> {
    try {
      // Get current balance
      const [currentBalance] = await db
        .select()
        .from(userCreditBalance)
        .where(eq(userCreditBalance.userId, userId))
        .limit(1);

      const newBalance = (currentBalance?.currentBalance || 0) + amount;
      const totalEarned = (currentBalance?.totalEarned || 0) + amount;

      // Update or create credit balance
      if (currentBalance) {
        await db
          .update(userCreditBalance)
          .set({
            currentBalance: newBalance,
            totalEarned: totalEarned,
            updatedAt: new Date(),
          })
          .where(eq(userCreditBalance.userId, userId));
      } else {
        await db
          .insert(userCreditBalance)
          .values({
            userId,
            currentBalance: newBalance,
            totalEarned: amount,
            totalSpent: 0,
            lastResetDate: null,
          });
      }

      // Record transaction
      await db
        .insert(creditTransactions)
        .values({
          userId,
          type: 'credit',
          amount,
          description,
          source,
          referenceId: referenceId || null,
          balanceBefore: currentBalance?.currentBalance || 0,
          balanceAfter: newBalance,
        });

      console.log(`✅ Credited ${amount} credits to user ${userId}: ${description}`);
    } catch (error) {
      console.error('Error crediting credits:', error);
      throw new Error('Failed to credit credits');
    }
  }

  // Debit credits from user account
  static async debitCredits(
    userId: number,
    amount: number,
    description: string,
    source: string,
    referenceId?: string
  ): Promise<boolean> {
    try {
      // Get current balance
      const [currentBalance] = await db
        .select()
        .from(userCreditBalance)
        .where(eq(userCreditBalance.userId, userId))
        .limit(1);

      if (!currentBalance || currentBalance.currentBalance < amount) {
        console.log(`❌ Insufficient credits for user ${userId}: required ${amount}, available ${currentBalance?.currentBalance || 0}`);
        return false;
      }

      const newBalance = currentBalance.currentBalance - amount;
      const totalSpent = currentBalance.totalSpent + amount;

      // Update credit balance
      await db
        .update(userCreditBalance)
        .set({
          currentBalance: newBalance,
          totalSpent: totalSpent,
          updatedAt: new Date(),
        })
        .where(eq(userCreditBalance.userId, userId));

      // Record transaction
      await db
        .insert(creditTransactions)
        .values({
          userId,
          type: 'debit',
          amount: -amount, // Negative for debits
          description,
          source,
          referenceId: referenceId || null,
          balanceBefore: currentBalance.currentBalance,
          balanceAfter: newBalance,
        });

      console.log(`✅ Debited ${amount} credits from user ${userId}: ${description}`);
      return true;
    } catch (error) {
      console.error('Error debiting credits:', error);
      throw new Error('Failed to debit credits');
    }
  }

  // Get user credit balance
  static async getUserBalance(userId: number): Promise<number> {
    try {
      const [balance] = await db
        .select()
        .from(userCreditBalance)
        .where(eq(userCreditBalance.userId, userId))
        .limit(1);

      return balance?.currentBalance || 0;
    } catch (error) {
      console.error('Error getting user balance:', error);
      return 0;
    }
  }

  // Get credit transaction history
  static async getTransactionHistory(userId: number, limit: number = 50) {
    try {
      return await db
        .select()
        .from(creditTransactions)
        .where(eq(creditTransactions.userId, userId))
        .orderBy(creditTransactions.createdAt)
        .limit(limit);
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }
}

export const creditService = CreditService;