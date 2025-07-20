import { db } from '../db';
import { auditLogs, insertAuditLogSchema } from '../../shared/schema';
import { eq, desc, and, gt, sql } from 'drizzle-orm';

export interface AuditLogEntry {
  userId: number;
  action: string;
  resource: string;
  feature: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

export class AuditService {
  /**
   * Log access attempt with permission checking results
   */
  static async logAccess(entry: AuditLogEntry): Promise<void> {
    try {
      await db.insert(auditLogs).values({
        userId: entry.userId,
        action: entry.action,
        resource: entry.resource,
        feature: entry.feature,
        success: entry.success,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        metadata: entry.metadata,
        timestamp: new Date()
      });

      console.log(`📋 [AUDIT] ${entry.success ? '✅' : '❌'} User ${entry.userId} ${entry.action} ${entry.resource} (${entry.feature})`);
    } catch (error) {
      console.error('📋 [AUDIT] Error logging access:', error);
    }
  }

  /**
   * Log successful access
   */
  static async logSuccessfulAccess(
    userId: number, 
    action: string, 
    resource: string, 
    feature: string,
    metadata?: any
  ): Promise<void> {
    await this.logAccess({
      userId,
      action,
      resource,
      feature,
      success: true,
      metadata
    });
  }

  /**
   * Log denied access
   */
  static async logDeniedAccess(
    userId: number, 
    action: string, 
    resource: string, 
    feature: string,
    reason?: string
  ): Promise<void> {
    await this.logAccess({
      userId,
      action,
      resource,
      feature,
      success: false,
      metadata: { reason }
    });
  }

  /**
   * Get audit logs for user
   */
  static async getUserAuditLogs(userId: number, limit: number = 50) {
    try {
      const logs = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.userId, userId))
        .orderBy(desc(auditLogs.timestamp))
        .limit(limit);

      return logs;
    } catch (error) {
      console.error('📋 [AUDIT] Error fetching user audit logs:', error);
      return [];
    }
  }

  /**
   * Get audit logs for feature
   */
  static async getFeatureAuditLogs(feature: string, limit: number = 100) {
    try {
      const logs = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.feature, feature))
        .orderBy(desc(auditLogs.timestamp))
        .limit(limit);

      return logs;
    } catch (error) {
      console.error('📋 [AUDIT] Error fetching feature audit logs:', error);
      return [];
    }
  }

  /**
   * Get failed access attempts
   */
  static async getFailedAccessAttempts(hours: number = 24) {
    try {
      const since = new Date();
      since.setHours(since.getHours() - hours);

      const logs = await db
        .select()
        .from(auditLogs)
        .where(
          and(
            eq(auditLogs.success, false),
            gt(auditLogs.timestamp, since)
          )
        )
        .orderBy(desc(auditLogs.timestamp));

      return logs;
    } catch (error) {
      console.error('📋 [AUDIT] Error fetching failed access attempts:', error);
      return [];
    }
  }

  /**
   * Get access statistics
   */
  static async getAccessStats(userId?: number) {
    try {
      const baseQuery = db
        .select({
          feature: auditLogs.feature,
          totalAttempts: sql<number>`count(*)`,
          successfulAttempts: sql<number>`count(case when ${auditLogs.success} = true then 1 end)`,
          failedAttempts: sql<number>`count(case when ${auditLogs.success} = false then 1 end)`
        })
        .from(auditLogs);

      const query = userId 
        ? baseQuery.where(eq(auditLogs.userId, userId))
        : baseQuery;

      const stats = await query
        .groupBy(auditLogs.feature)
        .orderBy(desc(sql`count(*)`));

      return stats;
    } catch (error) {
      console.error('📋 [AUDIT] Error fetching access stats:', error);
      return [];
    }
  }
}