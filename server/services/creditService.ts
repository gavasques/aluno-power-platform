import { db } from '../db.js';
import { users, userCreditBalance, creditTransactions, featureCosts, userGroups } from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';

/**
 * Ultra-simple credit service
 * Logic: Admins don't pay, everyone else pays
 */

export async function debitarCreditos(userId: number, featureKey: string): Promise<{
  sucesso: boolean;
  creditosDebitados: number;
  saldoRestante: number;
  erro?: string;
  ehAdmin?: boolean;
}> {
  try {
    // 1. Verificar se é admin (não cobra nada)
    const usuario = await db.select({
      role: users.role,
      userGroupId: users.userGroupId
    }).from(users).where(eq(users.id, userId)).limit(1);
    
    if (!usuario.length) {
      return {
        sucesso: false,
        creditosDebitados: 0,
        saldoRestante: 0,
        erro: 'Usuário não encontrado'
      };
    }
    
    const isAdmin = usuario[0].role === 'admin' || usuario[0].userGroupId === 1;
    
    // 2. Se for admin, não cobra nada
    if (isAdmin) {
      return {
        sucesso: true,
        creditosDebitados: 0,
        saldoRestante: 999999, // Saldo "infinito" para admin
        ehAdmin: true
      };
    }
    
    // 3. Buscar custo da funcionalidade
    const custo = await db.select({
      creditCost: featureCosts.creditCost
    }).from(featureCosts)
    .where(and(eq(featureCosts.featureKey, featureKey), eq(featureCosts.isActive, true)))
    .limit(1);
    
    if (!custo.length) {
      return {
        sucesso: false,
        creditosDebitados: 0,
        saldoRestante: 0,
        erro: 'Funcionalidade não encontrada'
      };
    }
    
    const creditosNecessarios = custo[0].creditCost;
    
    // 4. Verificar saldo atual
    const saldo = await db.select({
      currentBalance: userCreditBalance.currentBalance
    }).from(userCreditBalance)
    .where(eq(userCreditBalance.userId, userId))
    .limit(1);
    
    if (!saldo.length || saldo[0].currentBalance < creditosNecessarios) {
      return {
        sucesso: false,
        creditosDebitados: 0,
        saldoRestante: saldo.length ? saldo[0].currentBalance : 0,
        erro: `Créditos insuficientes. Necessário: ${creditosNecessarios}`
      };
    }
    
    // 5. Debitar créditos
    const balanceBefore = saldo[0].currentBalance;
    const balanceAfter = balanceBefore - creditosNecessarios;
    
    await db.update(userCreditBalance)
      .set({
        currentBalance: balanceAfter,
        totalSpent: userCreditBalance.totalSpent + creditosNecessarios,
        updatedAt: new Date()
      })
      .where(eq(userCreditBalance.userId, userId));
    
    // 6. Registrar transação
    await db.insert(creditTransactions).values({
      userId: userId,
      type: 'usage',
      amount: -creditosNecessarios, // Negativo para débito
      balanceBefore: balanceBefore,
      balanceAfter: balanceAfter,
      description: `Uso de funcionalidade: ${featureKey}`,
      relatedType: featureKey,
      createdAt: new Date()
    });
    
    return {
      sucesso: true,
      creditosDebitados: creditosNecessarios,
      saldoRestante: balanceAfter,
      ehAdmin: false
    };
    
  } catch (error) {
    console.error('Erro ao debitar créditos:', error);
    return {
      sucesso: false,
      creditosDebitados: 0,
      saldoRestante: 0,
      erro: error instanceof Error ? error.message : 'Erro interno do sistema'
    };
  }
}

export async function verificarSaldoCreditos(userId: number): Promise<{
  saldo: number;
  ehAdmin: boolean;
}> {
  try {
    // Verificar se é admin
    const usuario = await db.select({
      role: users.role,
      userGroupId: users.userGroupId
    }).from(users).where(eq(users.id, userId)).limit(1);
    
    if (!usuario.length) {
      return { saldo: 0, ehAdmin: false };
    }
    
    const isAdmin = usuario[0].role === 'admin' || usuario[0].userGroupId === 1;
    
    if (isAdmin) {
      return { saldo: 999999, ehAdmin: true };
    }
    
    // Buscar saldo real
    const saldo = await db.select({
      currentBalance: userCreditBalance.currentBalance
    }).from(userCreditBalance)
    .where(eq(userCreditBalance.userId, userId))
    .limit(1);
    
    return {
      saldo: saldo.length ? saldo[0].currentBalance : 0,
      ehAdmin: false
    };
    
  } catch (error) {
    console.error('Erro ao verificar saldo:', error);
    return { saldo: 0, ehAdmin: false };
  }
}

export async function reembolsarCreditos(userId: number, amount: number, reason: string): Promise<boolean> {
  try {
    // Verificar se é admin (admin não precisa de reembolso)
    const { ehAdmin } = await verificarSaldoCreditos(userId);
    
    if (ehAdmin) {
      return true; // Admin sempre "sucesso" mas não faz nada
    }
    
    // Buscar saldo atual para transação
    const saldo = await db.select({
      currentBalance: userCreditBalance.currentBalance
    }).from(userCreditBalance)
    .where(eq(userCreditBalance.userId, userId))
    .limit(1);
    
    if (!saldo.length) {
      return false; // Usuário sem registro de créditos
    }
    
    const balanceBefore = saldo[0].currentBalance;
    const balanceAfter = balanceBefore + amount;
    
    // Reembolsar créditos
    await db.update(userCreditBalance)
      .set({
        currentBalance: balanceAfter,
        totalSpent: userCreditBalance.totalSpent - amount,
        updatedAt: new Date()
      })
      .where(eq(userCreditBalance.userId, userId));
    
    // Registrar transação de reembolso
    await db.insert(creditTransactions).values({
      userId: userId,
      type: 'refund',
      amount: amount, // Positivo para crédito
      balanceBefore: balanceBefore,
      balanceAfter: balanceAfter,
      description: reason,
      relatedType: 'manual_refund',
      createdAt: new Date()
    });
    
    return true;
    
  } catch (error) {
    console.error('Erro ao reembolsar créditos:', error);
    return false;
  }
}