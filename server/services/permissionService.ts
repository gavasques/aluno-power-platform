import { db } from '../db';
import { users, userGroups, userGroupMembers, featureCosts, featurePermissions, userCreditBalance } from '../../shared/schema';
import { eq, and, sql } from 'drizzle-orm';

interface PermissionCheckResult {
  hasAccess: boolean;
  reason?: string;
  userGroup: string;
  featureName: string;
}

interface CreditDebitWithPermissionResult {
  success: boolean;
  hasPermission: boolean;
  creditsDebited: number;
  remainingCredits: number;
  errorMessage?: string;
  userGroup?: string;
}

class PermissionService {
  async checkFeatureAccess(userId: number, featureKey: string): Promise<PermissionCheckResult> {
    try {
      // 1. Buscar grupo do usuário através da tabela de relacionamento
      const userGroup = await db
        .select({
          groupId: userGroupMembers.groupId,
          groupName: userGroups.name,
          groupDisplayName: userGroups.displayName
        })
        .from(userGroupMembers)
        .innerJoin(userGroups, eq(userGroupMembers.groupId, userGroups.id))
        .where(eq(userGroupMembers.userId, userId))
        .limit(1);
      
      // Se não encontrar grupo específico, assumir FREE (groupId = 1)
      const userGroupId = userGroup.length > 0 ? userGroup[0].groupId : 1;
      const userGroupName = userGroup.length > 0 ? userGroup[0].groupName : 'FREE';
      
      // Verificar se o usuário existe
      const userExists = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      if (!userExists.length) {
        return {
          hasAccess: false,
          reason: 'Usuário não encontrado',
          userGroup: 'unknown',
          featureName: featureKey
        };
      }
      
      // 2. Buscar funcionalidade e permissão
      const featureData = await db
        .select({
          featureName: featureCosts.featureName,
          isActive: featureCosts.isActive,
          hasAccess: featurePermissions.hasAccess,
          groupDisplayName: userGroups.displayName
        })
        .from(featureCosts)
        .leftJoin(featurePermissions, and(
          eq(featurePermissions.featureCostId, featureCosts.id),
          eq(featurePermissions.userGroupId, userGroupId)
        ))
        .leftJoin(userGroups, eq(featurePermissions.userGroupId, userGroups.id))
        .where(eq(featureCosts.featureKey, featureKey))
        .limit(1);
      
      if (!featureData.length) {
        return {
          hasAccess: false,
          reason: 'Funcionalidade não encontrada',
          userGroup: userGroupName,
          featureName: featureKey
        };
      }
      
      const feature = featureData[0];
      
      // 3. Verificar se a funcionalidade está ativa
      if (!feature.isActive) {
        return {
          hasAccess: false,
          reason: 'Funcionalidade temporariamente indisponível',
          userGroup: userGroupName,
          featureName: feature.featureName
        };
      }
      
      // 4. Verificar permissão específica
      if (!feature.hasAccess) {
        return {
          hasAccess: false,
          reason: `Acesso não liberado para ${feature.groupDisplayName || userGroupName}`,
          userGroup: userGroupName,
          featureName: feature.featureName
        };
      }
      
      return {
        hasAccess: true,
        userGroup: userGroupName,
        featureName: feature.featureName
      };
      
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      return {
        hasAccess: false,
        reason: 'Erro interno do sistema',
        userGroup: 'unknown',
        featureName: featureKey
      };
    }
  }
  
  async debitCreditsWithPermissionCheck(userId: number, featureKey: string): Promise<CreditDebitWithPermissionResult> {
    try {
      // 1. Verificar permissões primeiro
      const permissionCheck = await this.checkFeatureAccess(userId, featureKey);
      
      if (!permissionCheck.hasAccess) {
        return {
          success: false,
          hasPermission: false,
          creditsDebited: 0,
          remainingCredits: 0,
          errorMessage: permissionCheck.reason,
          userGroup: permissionCheck.userGroup
        };
      }
      
      // 2. Se tem permissão, verificar se é admin (não cobra créditos)
      const isAdmin = permissionCheck.userGroup === 'ADMIN';
      
      if (isAdmin) {
        return {
          success: true,
          hasPermission: true,
          creditsDebited: 0,
          remainingCredits: 999999, // Saldo "infinito" para admin
          userGroup: permissionCheck.userGroup
        };
      }
      
      // 3. Buscar custo da funcionalidade
      const featureData = await db
        .select({
          creditCost: featureCosts.creditCost
        })
        .from(featureCosts)
        .where(and(
          eq(featureCosts.featureKey, featureKey),
          eq(featureCosts.isActive, true)
        ))
        .limit(1);
      
      if (!featureData.length) {
        return {
          success: false,
          hasPermission: true,
          creditsDebited: 0,
          remainingCredits: 0,
          errorMessage: 'Funcionalidade não encontrada',
          userGroup: permissionCheck.userGroup
        };
      }
      
      const creditCost = featureData[0].creditCost;
      
      // 4. Verificar saldo atual
      const balanceData = await db
        .select({
          currentBalance: userCreditBalance.currentBalance
        })
        .from(userCreditBalance)
        .where(eq(userCreditBalance.userId, userId))
        .limit(1);
      
      if (!balanceData.length || balanceData[0].currentBalance < creditCost) {
        return {
          success: false,
          hasPermission: true,
          creditsDebited: 0,
          remainingCredits: balanceData.length ? balanceData[0].currentBalance : 0,
          errorMessage: `Créditos insuficientes. Necessário: ${creditCost}`,
          userGroup: permissionCheck.userGroup
        };
      }
      
      // 5. Debitar créditos
      const currentBalance = balanceData[0].currentBalance;
      const newBalance = currentBalance - creditCost;
      
      await db
        .update(userCreditBalance)
        .set({
          currentBalance: newBalance,
          totalSpent: sql`${userCreditBalance.totalSpent} + ${creditCost}`,
          updatedAt: new Date()
        })
        .where(eq(userCreditBalance.userId, userId));
      
      return {
        success: true,
        hasPermission: true,
        creditsDebited: creditCost,
        remainingCredits: newBalance,
        userGroup: permissionCheck.userGroup
      };
      
    } catch (error) {
      console.error('Erro ao debitar créditos com verificação de permissão:', error);
      return {
        success: false,
        hasPermission: false,
        creditsDebited: 0,
        remainingCredits: 0,
        errorMessage: 'Erro interno do sistema'
      };
    }
  }

  async refundCredits(userId: number, creditsToRefund: number): Promise<boolean> {
    try {
      if (creditsToRefund <= 0) return true;
      
      await db
        .update(userCreditBalance)
        .set({
          currentBalance: sql`${userCreditBalance.currentBalance} + ${creditsToRefund}`,
          totalSpent: sql`${userCreditBalance.totalSpent} - ${creditsToRefund}`,
          updatedAt: new Date()
        })
        .where(eq(userCreditBalance.userId, userId));
      
      return true;
    } catch (error) {
      console.error('Erro ao reembolsar créditos:', error);
      return false;
    }
  }
}

export const permissionService = new PermissionService();