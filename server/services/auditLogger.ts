import { db } from '../db';
import { auditLogs } from '../../shared/schema';
import type { InsertAuditLog } from '../../shared/schema';

interface AuditLogData {
  userId?: number;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress: string;
  userAgent: string;
  metadata?: any;
}

class AuditLogger {
  // Log de ação do usuário
  async log(data: AuditLogData): Promise<void> {
    try {
      await db.insert(auditLogs).values({
        userId: data.userId || null,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId || null,
        oldValues: data.oldValues || null,
        newValues: data.newValues || null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: data.metadata || null,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Erro ao salvar audit log:', error);
      // Não relançar o erro para não quebrar a aplicação
    }
  }

  // Logs específicos para diferentes ações
  async logUserAction(
    userId: number,
    action: string,
    resource: string,
    resourceId: string,
    ipAddress: string,
    userAgent: string,
    metadata?: any
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resource,
      resourceId,
      ipAddress,
      userAgent,
      metadata,
    });
  }

  async logPaymentAction(
    userId: number,
    action: 'payment_created' | 'payment_succeeded' | 'payment_failed',
    paymentId: string,
    amount: number,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resource: 'payment',
      resourceId: paymentId,
      ipAddress,
      userAgent,
      metadata: { amount },
    });
  }

  async logSubscriptionAction(
    userId: number,
    action: 'subscription_created' | 'subscription_updated' | 'subscription_cancelled',
    subscriptionId: string,
    planInfo: any,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resource: 'subscription',
      resourceId: subscriptionId,
      ipAddress,
      userAgent,
      metadata: planInfo,
    });
  }

  async logCrudAction(
    userId: number,
    action: 'create' | 'read' | 'update' | 'delete',
    resource: string,
    resourceId: string,
    oldValues: any,
    newValues: any,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resource,
      resourceId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
    });
  }

  async logAuthAction(
    userId: number | null,
    action: 'login' | 'logout' | 'failed_login' | 'password_reset',
    ipAddress: string,
    userAgent: string,
    metadata?: any
  ): Promise<void> {
    await this.log({
      userId: userId || undefined,
      action,
      resource: 'auth',
      ipAddress,
      userAgent,
      metadata,
    });
  }

  async logSecurityAction(
    userId: number,
    action: 'fraud_detected' | 'account_locked' | 'suspicious_activity',
    details: any,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resource: 'security',
      ipAddress,
      userAgent,
      metadata: details,
    });
  }

  async logDataExport(
    userId: number,
    dataType: string,
    recordCount: number,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    await this.log({
      userId,
      action: 'data_export',
      resource: 'user_data',
      ipAddress,
      userAgent,
      metadata: {
        dataType,
        recordCount,
        exportDate: new Date().toISOString(),
      },
    });
  }

  async logAdminAction(
    adminId: number,
    action: string,
    targetUserId: number,
    changes: any,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    await this.log({
      userId: adminId,
      action: `admin_${action}`,
      resource: 'user',
      resourceId: targetUserId.toString(),
      newValues: changes,
      ipAddress,
      userAgent,
      metadata: {
        targetUserId,
        adminAction: true,
      },
    });
  }

  // Consultar logs de auditoria
  async getLogs(filters: {
    userId?: number;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    // Implementar consulta com filtros
    return await db.select()
      .from(auditLogs)
      .limit(filters.limit || 100);
  }
}

export const auditLogger = new AuditLogger();