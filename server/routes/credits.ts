import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { users, creditTransactions } from '../../shared/schema';
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
    const [user] = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const currentBalance = parseFloat(user.credits?.toString() || '0');

    // Verificar se tem créditos suficientes
    if (currentBalance < amount) {
      return res.status(400).json({
        success: false,
        message: `Saldo insuficiente. Você tem ${currentBalance} créditos, mas precisa de ${amount}`,
        currentBalance: currentBalance,
        requiredAmount: amount
      });
    }

    // Descontar os créditos
    const newBalance = currentBalance - amount;
    await db
      .update(users)
      .set({
        credits: newBalance.toString(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    // Registrar transação
    await db.insert(creditTransactions).values({
      userId: userId,
      type: 'deduction',
      amount: amount,
      cost: 0, // Não há custo para deduções
      description: reason,
      reference: `deduction-${Date.now()}`,
      status: 'completed',
      metadata: { 
        source: 'system',
        originalBalance: currentBalance,
        newBalance: newBalance
      }
    });

    // Retornar sucesso com novo saldo
    
    res.json({
      success: true,
      message: `${amount} crédito(s) descontado(s) com sucesso`,
      previousBalance: currentBalance,
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

    const [user] = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const currentBalance = parseFloat(user?.credits?.toString() || '0');

    res.json({
      success: true,
      balance: {
        currentBalance: currentBalance,
        totalEarned: 0, // Legacy field - no longer tracked separately
        totalSpent: 0   // Legacy field - no longer tracked separately
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