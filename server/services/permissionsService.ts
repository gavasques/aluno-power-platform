import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);
import { featureCosts, featurePermissions, userGroups, userGroupMembers, users } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

export interface UserPermissionCheck {
  userId: number;
  featureKey: string;
  hasAccess: boolean;
  userGroup?: string;
  creditCost?: number;
  featureName?: string;
  featureCategory?: string;
}

export interface UserFeatureAccess {
  featureKey: string;
  featureName: string;
  featureCategory: string;
  creditCost: number;
  estimatedApiCost?: string;
  hasAccess: boolean;
  icon?: string;
  description?: string;
}

export class PermissionsService {
  /**
   * Check if a user has access to a specific feature
   */
  static async checkFeatureAccess(userId: number, featureKey: string): Promise<UserPermissionCheck> {
    try {
      // Get user's group membership
      const userGroupQuery = await db
        .select({
          groupName: userGroups.name,
          groupDisplayName: userGroups.displayName,
        })
        .from(userGroupMembers)
        .innerJoin(userGroups, eq(userGroupMembers.groupId, userGroups.id))
        .where(eq(userGroupMembers.userId, userId))
        .limit(1);

      // If user has no group, default to FREE
      const userGroup = userGroupQuery[0]?.groupName || 'FREE';

      // Get feature details and permission
      const permissionQuery = await db
        .select({
          featureId: featureCosts.id,
          featureName: featureCosts.featureName,
          featureCategory: featureCosts.featureCategory,
          creditCost: featureCosts.creditCost,
          hasAccess: featurePermissions.hasAccess,
          groupId: userGroups.id,
          groupName: userGroups.name,
        })
        .from(featureCosts)
        .innerJoin(featurePermissions, eq(featurePermissions.featureCostId, featureCosts.id))
        .innerJoin(userGroups, eq(featurePermissions.userGroupId, userGroups.id))
        .where(
          and(
            eq(featureCosts.featureKey, featureKey),
            eq(userGroups.name, userGroup)
          )
        )
        .limit(1);

      const permission = permissionQuery[0];

      return {
        userId,
        featureKey,
        hasAccess: permission?.hasAccess || false,
        userGroup: userGroup,
        creditCost: permission?.creditCost,
        featureName: permission?.featureName,
        featureCategory: permission?.featureCategory,
      };
    } catch (error) {
      console.error('Error checking feature access:', error);
      return {
        userId,
        featureKey,
        hasAccess: false,
      };
    }
  }

  /**
   * Get all features accessible to a user with their permission status
   */
  static async getUserFeatureAccess(userId: number): Promise<UserFeatureAccess[]> {
    try {
      // Get user's group membership
      const userGroupQuery = await db
        .select({
          groupName: userGroups.name,
        })
        .from(userGroupMembers)
        .innerJoin(userGroups, eq(userGroupMembers.groupId, userGroups.id))
        .where(eq(userGroupMembers.userId, userId))
        .limit(1);

      // If user has no group, default to FREE
      const userGroup = userGroupQuery[0]?.groupName || 'FREE';

      // Get all features with permission status for user's group
      const featuresQuery = await db
        .select({
          featureKey: featureCosts.featureKey,
          featureName: featureCosts.featureName,
          featureCategory: featureCosts.featureCategory,
          creditCost: featureCosts.creditCost,
          estimatedApiCost: featureCosts.estimatedApiCost,
          icon: featureCosts.icon,
          description: featureCosts.description,
          hasAccess: featurePermissions.hasAccess,
          displayOrder: featureCosts.displayOrder,
        })
        .from(featureCosts)
        .innerJoin(featurePermissions, eq(featurePermissions.featureCostId, featureCosts.id))
        .innerJoin(userGroups, eq(featurePermissions.userGroupId, userGroups.id))
        .where(eq(userGroups.name, userGroup))
        .orderBy(featureCosts.displayOrder);

      return featuresQuery.map(feature => ({
        featureKey: feature.featureKey,
        featureName: feature.featureName,
        featureCategory: feature.featureCategory,
        creditCost: feature.creditCost,
        estimatedApiCost: feature.estimatedApiCost?.toString(),
        hasAccess: feature.hasAccess,
        icon: feature.icon,
        description: feature.description,
      }));
    } catch (error) {
      console.error('Error getting user feature access:', error);
      return [];
    }
  }

  /**
   * Get user's group information
   */
  static async getUserGroup(userId: number): Promise<{ name: string; displayName: string; description: string } | null> {
    try {
      const userGroupQuery = await db
        .select({
          name: userGroups.name,
          displayName: userGroups.displayName,
          description: userGroups.description,
        })
        .from(userGroupMembers)
        .innerJoin(userGroups, eq(userGroupMembers.groupId, userGroups.id))
        .where(eq(userGroupMembers.userId, userId))
        .limit(1);

      return userGroupQuery[0] || { name: 'FREE', displayName: 'Usuário Gratuito', description: 'Acesso limitado às funcionalidades básicas' };
    } catch (error) {
      console.error('Error getting user group:', error);
      return null;
    }
  }

  /**
   * Assign user to a group (for subscription management)
   */
  static async assignUserToGroup(userId: number, groupName: string): Promise<boolean> {
    try {
      // Get group ID
      const group = await db
        .select({ id: userGroups.id })
        .from(userGroups)
        .where(eq(userGroups.name, groupName))
        .limit(1);

      if (!group[0]) {
        throw new Error(`Group ${groupName} not found`);
      }

      // Remove existing group membership
      await db
        .delete(userGroupMembers)
        .where(eq(userGroupMembers.userId, userId));

      // Add new group membership
      await db
        .insert(userGroupMembers)
        .values({
          userId: userId,
          groupId: group[0].id,
        });

      return true;
    } catch (error) {
      console.error('Error assigning user to group:', error);
      return false;
    }
  }

  /**
   * Get feature access summary by group (for admin dashboard)
   */
  static async getFeatureAccessMatrix(): Promise<any[]> {
    try {
      const matrix = await db
        .select({
          groupName: userGroups.name,
          groupDisplayName: userGroups.displayName,
          featureKey: featureCosts.featureKey,
          featureName: featureCosts.featureName,
          featureCategory: featureCosts.featureCategory,
          creditCost: featureCosts.creditCost,
          hasAccess: featurePermissions.hasAccess,
        })
        .from(userGroups)
        .innerJoin(featurePermissions, eq(featurePermissions.userGroupId, userGroups.id))
        .innerJoin(featureCosts, eq(featurePermissions.featureCostId, featureCosts.id))
        .orderBy(userGroups.id, featureCosts.displayOrder);

      return matrix;
    } catch (error) {
      console.error('Error getting feature access matrix:', error);
      return [];
    }
  }
}