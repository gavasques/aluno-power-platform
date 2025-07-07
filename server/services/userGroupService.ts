/**
 * User Group Service - Automated Permission Group Management
 * 
 * Business Rules:
 * - New users start in "Gratuito" group
 * - Active subscribers move to "Pagantes" group  
 * - Cancelled/overdue subscribers return to "Gratuito"
 * - Exception: "Alunos" and "Mentorados" remain in their groups even when purchasing plans
 */

import { db } from '../db';
import { users, permissionGroups, userPermissionGroups, userSubscriptions } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

export class UserGroupService {
  
  /**
   * Assign new user to "Gratuito" group on registration
   */
  static async assignDefaultGroup(userId: number): Promise<void> {
    try {
      // Get "Gratuito" group
      const [gratuitoGroup] = await db
        .select()
        .from(permissionGroups)
        .where(eq(permissionGroups.code, 'gratuito'))
        .limit(1);

      if (!gratuitoGroup) {
        console.error('❌ Gratuito group not found');
        return;
      }

      // Check if user already has a group
      const [existingGroup] = await db
        .select()
        .from(userPermissionGroups)
        .where(eq(userPermissionGroups.userId, userId))
        .limit(1);

      if (existingGroup) {
        console.log(`✅ User ${userId} already has group assignment`);
        return;
      }

      // Assign to Gratuito group
      await db
        .insert(userPermissionGroups)
        .values({
          userId,
          groupId: gratuitoGroup.id,
          assignedAt: new Date(),
          assignedBy: null // System assignment
        });

      console.log(`✅ User ${userId} assigned to Gratuito group`);
      
    } catch (error) {
      console.error('❌ Error assigning default group:', error);
    }
  }

  /**
   * Get user's current permission group
   */
  static async getUserGroup(userId: number): Promise<{ code: string; name: string } | null> {
    try {
      const [result] = await db
        .select({
          code: permissionGroups.code,
          name: permissionGroups.name
        })
        .from(userPermissionGroups)
        .innerJoin(permissionGroups, eq(userPermissionGroups.groupId, permissionGroups.id))
        .where(eq(userPermissionGroups.userId, userId))
        .limit(1);

      return result || null;
    } catch (error) {
      console.error('❌ Error getting user group:', error);
      return null;
    }
  }

  /**
   * Move user to "Pagantes" group when subscription becomes active
   * Exception: Preserve "Alunos" and "Mentorados" groups
   */
  static async handleSubscriptionActivated(userId: number): Promise<void> {
    try {
      const currentGroup = await this.getUserGroup(userId);
      
      // Exception: Preserve special groups
      if (currentGroup && ['alunos', 'mentorados'].includes(currentGroup.code)) {
        console.log(`✅ Preserving special group "${currentGroup.name}" for user ${userId}`);
        return;
      }

      await this.changeUserGroup(userId, 'pagantes', null);
      console.log(`✅ User ${userId} moved to Pagantes group (subscription activated)`);
      
    } catch (error) {
      console.error('❌ Error handling subscription activation:', error);
    }
  }

  /**
   * Move user back to "Gratuito" when subscription ends/fails
   * Exception: Preserve "Alunos" and "Mentorados" groups
   */
  static async handleSubscriptionEnded(userId: number): Promise<void> {
    try {
      const currentGroup = await this.getUserGroup(userId);
      
      // Exception: Preserve special groups
      if (currentGroup && ['alunos', 'mentorados'].includes(currentGroup.code)) {
        console.log(`✅ Preserving special group "${currentGroup.name}" for user ${userId}`);
        return;
      }

      await this.changeUserGroup(userId, 'gratuito', null);
      console.log(`✅ User ${userId} moved to Gratuito group (subscription ended)`);
      
    } catch (error) {
      console.error('❌ Error handling subscription end:', error);
    }
  }

  /**
   * Manual group assignment (admin function)
   */
  static async assignUserToGroup(userId: number, groupCode: string, assignedByUserId: number | null = null): Promise<boolean> {
    try {
      // Get target group
      const [targetGroup] = await db
        .select()
        .from(permissionGroups)
        .where(eq(permissionGroups.code, groupCode))
        .limit(1);

      if (!targetGroup) {
        console.error(`❌ Group "${groupCode}" not found`);
        return false;
      }

      await this.changeUserGroup(userId, groupCode, assignedByUserId);
      console.log(`✅ User ${userId} manually assigned to ${targetGroup.name} group`);
      return true;
      
    } catch (error) {
      console.error('❌ Error in manual group assignment:', error);
      return false;
    }
  }

  /**
   * Internal method to change user group
   */
  private static async changeUserGroup(userId: number, newGroupCode: string, assignedByUserId: number | null): Promise<void> {
    // Get new group
    const [newGroup] = await db
      .select()
      .from(permissionGroups)
      .where(eq(permissionGroups.code, newGroupCode))
      .limit(1);

    if (!newGroup) {
      throw new Error(`Group "${newGroupCode}" not found`);
    }

    // Remove existing group assignment
    await db
      .delete(userPermissionGroups)
      .where(eq(userPermissionGroups.userId, userId));

    // Add new group assignment
    await db
      .insert(userPermissionGroups)
      .values({
        userId,
        groupId: newGroup.id,
        assignedAt: new Date(),
        assignedBy: assignedByUserId
      });
  }

  /**
   * Get all users with their current groups (admin function)
   */
  static async getAllUsersWithGroups(): Promise<Array<{
    userId: number;
    userName: string;
    userEmail: string;
    groupCode: string;
    groupName: string;
    assignedAt: Date;
  }>> {
    try {
      const result = await db
        .select({
          userId: users.id,
          userName: users.name,
          userEmail: users.email,
          groupCode: permissionGroups.code,
          groupName: permissionGroups.name,
          assignedAt: userPermissionGroups.assignedAt
        })
        .from(userPermissionGroups)
        .innerJoin(users, eq(userPermissionGroups.userId, users.id))
        .innerJoin(permissionGroups, eq(userPermissionGroups.groupId, permissionGroups.id))
        .orderBy(users.name);

      return result;
    } catch (error) {
      console.error('❌ Error getting users with groups:', error);
      return [];
    }
  }

  /**
   * Sync user groups based on current subscription status
   */
  static async syncUserGroupWithSubscription(userId: number): Promise<void> {
    try {
      // Get current active subscription
      const [subscription] = await db
        .select()
        .from(userSubscriptions)
        .where(
          and(
            eq(userSubscriptions.userId, userId),
            eq(userSubscriptions.status, 'active')
          )
        )
        .limit(1);

      if (subscription) {
        await this.handleSubscriptionActivated(userId);
      } else {
        await this.handleSubscriptionEnded(userId);
      }
    } catch (error) {
      console.error('❌ Error syncing user group with subscription:', error);
    }
  }
}