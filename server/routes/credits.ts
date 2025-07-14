import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { userCreditBalance, creditTransactions } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '../security';

const router = Router();

// Schema para validação de desconto de créditos
const deductCreditsSchema = z.object({
  amount: z.number().min(1, 'Quantidade deve ser maior que zero'),
  reason: z.string().min(1, 'Razão é obrigatória')
});

// Endpoint para descontar créditos
router.post('/deduct', requireAuth, async (req, res) => {
  try {
    const { amount, reason } = deductCreditsSchema.parse(req.body);
    const userId = req.user.id;

    // Verificar saldo atual do usuário
    const [balance] = await db
      .select()
      .from(userCreditBalance)
      .where(eq(userCreditBalance.userId, userId))
      .limit(1);

    if (!balance) {
      return res.status(400).json({
        success: false,
        message: 'Usuário não possui saldo de créditos'
      });
    }

    // Verificar se tem créditos suficientes
    if (balance.currentBalance < amount) {
      return res.status(400).json({
        success: false,
        message: `Saldo insuficiente. Você tem ${balance.currentBalance} créditos, mas precisa de ${amount}`,
        currentBalance: balance.currentBalance,
        requiredAmount: amount
      });
    }

    // Descontar os créditos
    await db
      .update(userCreditBalance)
      .set({
        currentBalance: balance.currentBalance - amount,
        totalSpent: balance.totalSpent + amount
      })
      .where(eq(userCreditBalance.userId, userId));

    // Registrar transação
    await db.insert(creditTransactions).values({
      userId: userId,
      type: 'deduction',
      amount: -amount, // Negative for deductions
      balanceBefore: balance.currentBalance,
      balanceAfter: balance.currentBalance - amount,
      description: reason,
      relatedId: `deduction-${Date.now()}`,
      relatedType: 'ai_generation',
      metadata: { 
        source: 'system',
        originalBalance: balance.currentBalance,
        newBalance: balance.currentBalance - amount
      }
    });

    // Retornar sucesso com novo saldo
    const newBalance = balance.currentBalance - amount;
    
    res.json({
      success: true,
      message: `${amount} crédito(s) descontado(s) com sucesso`,
      previousBalance: balance.currentBalance,
      newBalance: newBalance,
      amountDeducted: amount,
      reason: reason
    });

  } catch (error) {
    console.error('Erro ao descontar créditos:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Endpoint para consultar saldo de créditos
router.get('/balance', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [balance] = await db
      .select()
      .from(userCreditBalance)
      .where(eq(userCreditBalance.userId, userId))
      .limit(1);

    if (!balance) {
      return res.json({
        success: true,
        balance: {
          currentBalance: 0,
          totalEarned: 0,
          totalSpent: 0
        }
      });
    }

    res.json({
      success: true,
      balance: {
        currentBalance: balance.currentBalance,
        totalEarned: balance.totalEarned,
        totalSpent: balance.totalSpent
      }
    });

  } catch (error) {
    console.error('Erro ao consultar saldo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;