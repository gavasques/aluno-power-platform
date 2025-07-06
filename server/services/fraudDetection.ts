import { db } from '../db';
import { fraudAlerts, paymentHistory, users } from '../../shared/schema';
import { eq, and, gte, count } from 'drizzle-orm';

interface FraudCheck {
  userId: number;
  amount: number;
  paymentMethod: string;
  ipAddress: string;
  userAgent: string;
  country?: string;
}

interface FraudResult {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  flags: string[];
  shouldBlock: boolean;
  requiresReview: boolean;
}

class FraudDetectionService {
  // Analisar transação para fraude
  async analyzeFraud(checkData: FraudCheck): Promise<FraudResult> {
    const flags: string[] = [];
    let riskScore = 0;

    // Verificar múltiplas tentativas de pagamento
    const recentAttempts = await this.checkRecentPaymentAttempts(
      checkData.userId, 
      checkData.ipAddress
    );
    
    if (recentAttempts.failedCount > 3) {
      flags.push('multiple_failed_attempts');
      riskScore += 30;
    }

    if (recentAttempts.successCount > 5) {
      flags.push('high_frequency_payments');
      riskScore += 20;
    }

    // Verificar valor anômalo
    const avgAmount = await this.getUserAverageAmount(checkData.userId);
    if (avgAmount > 0 && checkData.amount > avgAmount * 5) {
      flags.push('unusual_amount');
      riskScore += 25;
    }

    // Verificar localização suspeita
    if (checkData.country && await this.isHighRiskCountry(checkData.country)) {
      flags.push('high_risk_country');
      riskScore += 15;
    }

    // Verificar IP suspeito
    if (await this.isSuspiciousIP(checkData.ipAddress)) {
      flags.push('suspicious_ip');
      riskScore += 20;
    }

    // Verificar user agent suspeito
    if (this.isSuspiciousUserAgent(checkData.userAgent)) {
      flags.push('suspicious_user_agent');
      riskScore += 10;
    }

    // Verificar conta nova com valor alto
    const user = await db.select()
      .from(users)
      .where(eq(users.id, checkData.userId))
      .limit(1);

    if (user[0]) {
      const accountAge = Date.now() - user[0].createdAt.getTime();
      const daysSinceCreation = accountAge / (1000 * 60 * 60 * 24);
      
      if (daysSinceCreation < 1 && checkData.amount > 100) {
        flags.push('new_account_high_amount');
        riskScore += 35;
      }
    }

    // Determinar nível de risco
    let riskLevel: 'low' | 'medium' | 'high';
    if (riskScore < 20) {
      riskLevel = 'low';
    } else if (riskScore < 50) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'high';
    }

    const shouldBlock = riskScore >= 70;
    const requiresReview = riskScore >= 40 && riskScore < 70;

    // Registrar alerta se necessário
    if (requiresReview || shouldBlock) {
      await this.createFraudAlert(checkData, riskScore, flags);
    }

    return {
      riskScore,
      riskLevel,
      flags,
      shouldBlock,
      requiresReview,
    };
  }

  private async checkRecentPaymentAttempts(userId: number, ipAddress: string) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const attempts = await db.select()
      .from(paymentHistory)
      .where(and(
        eq(paymentHistory.userId, userId),
        gte(paymentHistory.createdAt, oneDayAgo)
      ));

    const failedCount = attempts.filter(a => a.status === 'failed').length;
    const successCount = attempts.filter(a => a.status === 'succeeded').length;

    return { failedCount, successCount };
  }

  private async getUserAverageAmount(userId: number): Promise<number> {
    const payments = await db.select()
      .from(paymentHistory)
      .where(and(
        eq(paymentHistory.userId, userId),
        eq(paymentHistory.status, 'succeeded')
      ))
      .limit(10);

    if (payments.length === 0) return 0;

    const total = payments.reduce((sum, p) => sum + p.amountCents, 0);
    return total / payments.length / 100; // Converter para reais
  }

  private async isHighRiskCountry(country: string): Promise<boolean> {
    const highRiskCountries = ['XX', 'YY']; // Lista de países de alto risco
    return highRiskCountries.includes(country);
  }

  private async isSuspiciousIP(ipAddress: string): Promise<boolean> {
    // Implementar verificação contra listas de IPs suspeitos
    // Integrar com serviços como MaxMind, IPQualityScore, etc.
    return false; // Placeholder
  }

  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /automated/i,
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  private async createFraudAlert(
    checkData: FraudCheck,
    riskScore: number,
    flags: string[]
  ): Promise<void> {
    await db.insert(fraudAlerts).values({
      userId: checkData.userId,
      riskScore,
      flags,
      ipAddress: checkData.ipAddress,
      userAgent: checkData.userAgent,
      amount: checkData.amount.toString(),
      status: 'pending',
      createdAt: new Date(),
    });
  }

  // Revisar alerta de fraude
  async reviewFraudAlert(alertId: number, decision: 'approve' | 'reject', reviewerId: number): Promise<void> {
    await db.update(fraudAlerts)
      .set({
        status: decision === 'approve' ? 'approved' : 'rejected',
        reviewerId,
        reviewedAt: new Date(),
      })
      .where(eq(fraudAlerts.id, alertId));
  }
}

export const fraudDetectionService = new FraudDetectionService();