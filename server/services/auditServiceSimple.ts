import { db } from '../db';
import { auditLogs } from '../../shared/schema';

export interface AuditLogEntry {
  userId: number;
  action: string;
  resource: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

export class AuditService {
  /**
   * Log access attempt - simplified version without non-existent fields
   */
  static async logAccess(entry: AuditLogEntry): Promise<void> {
    try {
      await db.insert(auditLogs).values({
        userId: entry.userId,
        action: entry.action,
        resource: entry.resource,
        ipAddress: entry.ipAddress || '',
        userAgent: entry.userAgent || '',
        metadata: entry.metadata,
        timestamp: new Date()
      });

      console.log(`📋 [AUDIT] ✅ User ${entry.userId} ${entry.action} ${entry.resource}`);
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
      resource: feature, // Use feature as resource
      metadata
    });
  }

  /**
   * Log failed access
   */
  static async logFailedAccess(
    userId: number, 
    action: string, 
    resource: string, 
    feature: string,
    errorMessage?: string
  ): Promise<void> {
    await this.logAccess({
      userId,
      action,
      resource: feature, // Use feature as resource
      metadata: { error: errorMessage, success: false }
    });
  }

  /**
   * Log denied access (alias for logFailedAccess)
   */
  static async logDeniedAccess(
    userId: number, 
    action: string, 
    resource: string, 
    feature: string,
    errorMessage?: string
  ): Promise<void> {
    await this.logFailedAccess(userId, action, resource, feature, errorMessage);
  }

  /**
   * Get user audit logs - simplified version
   */
  static async getUserAuditLogs(userId: number, limit: number = 50) {
    try {
      return [];  // Return empty array for now - avoids complex queries
    } catch (error) {
      console.error('📋 [AUDIT] Error fetching user audit logs:', error);
      return [];
    }
  }

  /**
   * Get feature audit logs - simplified version
   */
  static async getFeatureAuditLogs(feature: string, limit: number = 100) {
    try {
      return [];  // Return empty array for now
    } catch (error) {
      console.error('📋 [AUDIT] Error fetching feature audit logs:', error);
      return [];
    }
  }

  /**
   * Get failed access attempts - simplified version
   */
  static async getFailedAccessAttempts(hours: number = 24) {
    try {
      return [];  // Return empty array for now
    } catch (error) {
      console.error('📋 [AUDIT] Error fetching failed access attempts:', error);
      return [];
    }
  }

  /**
   * Get access statistics - simplified version
   */
  static async getAccessStats(userId?: number) {
    try {
      return [];  // Return empty array for now
    } catch (error) {
      console.error('📋 [AUDIT] Error fetching access stats:', error);
      return [];
    }
  }
}