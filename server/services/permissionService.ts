import { db } from '../db';
import { 
  permissionGroups, 
  systemFeatures, 
  groupPermissions, 
  userPermissionGroups,
  users 
} from '@shared/schema';
import { and, eq, inArray } from 'drizzle-orm';

export class PermissionService {
  /**
   * Check if a user has access to a specific feature
   */
  static async hasAccess(userId: number, featureCode: string): Promise<boolean> {
    // Check if user is admin - admin has access to everything
    const user = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user[0]?.role === 'admin') {
      return true;
    }

    // Get user's groups
    const userGroupList = await db
      .select({ groupId: userPermissionGroups.groupId })
      .from(userPermissionGroups)
      .where(eq(userPermissionGroups.userId, userId));

    if (userGroupList.length === 0) {
      return false;
    }

    const groupIds = userGroupList.map(ug => ug.groupId);

    // Get feature id
    const feature = await db
      .select({ id: systemFeatures.id })
      .from(systemFeatures)
      .where(and(
        eq(systemFeatures.code, featureCode),
        eq(systemFeatures.isActive, true)
      ))
      .limit(1);

    if (!feature[0]) {
      return false;
    }

    // Check if any of user's groups have access to this feature
    const permissions = await db
      .select({ hasAccess: groupPermissions.hasAccess })
      .from(groupPermissions)
      .where(and(
        inArray(groupPermissions.groupId, groupIds),
        eq(groupPermissions.featureId, feature[0].id),
        eq(groupPermissions.hasAccess, true)
      ))
      .limit(1);

    return permissions.length > 0;
  }

  /**
   * Get all features a user has access to
   */
  static async getUserFeatures(userId: number): Promise<string[]> {
    // Check if user is admin
    const user = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user[0]?.role === 'admin') {
      // Admin has access to all active features
      const allFeatures = await db
        .select({ code: systemFeatures.code })
        .from(systemFeatures)
        .where(eq(systemFeatures.isActive, true));
      
      return allFeatures.map(f => f.code);
    }

    // Get user's groups
    const userGroupList = await db
      .select({ groupId: userPermissionGroups.groupId })
      .from(userPermissionGroups)
      .where(eq(userPermissionGroups.userId, userId));

    if (userGroupList.length === 0) {
      return [];
    }

    const groupIds = userGroupList.map(ug => ug.groupId);

    // Get all features user has access to through their groups
    const features = await db
      .select({ code: systemFeatures.code })
      .from(systemFeatures)
      .innerJoin(groupPermissions, and(
        eq(groupPermissions.featureId, systemFeatures.id),
        eq(groupPermissions.hasAccess, true)
      ))
      .where(and(
        inArray(groupPermissions.groupId, groupIds),
        eq(systemFeatures.isActive, true)
      ));

    return features.map(f => f.code);
  }

  /**
   * Get all features organized by category
   */
  static async getAllFeatures() {
    const features = await db
      .select()
      .from(systemFeatures)
      .where(eq(systemFeatures.isActive, true))
      .orderBy(systemFeatures.category, systemFeatures.sortOrder);

    // Organize by category
    const categorized: Record<string, typeof features> = {};
    
    features.forEach(feature => {
      if (!categorized[feature.category]) {
        categorized[feature.category] = [];
      }
      categorized[feature.category].push(feature);
    });

    return categorized;
  }

  /**
   * Get all permission groups
   */
  static async getGroups() {
    return await db
      .select()
      .from(permissionGroups)
      .where(eq(permissionGroups.isActive, true))
      .orderBy(permissionGroups.priority);
  }

  /**
   * Get permissions for a specific group
   */
  static async getGroupPermissions(groupId: number) {
    const permissions = await db
      .select({
        featureId: groupPermissions.featureId,
        featureCode: systemFeatures.code,
        featureName: systemFeatures.name,
        featureCategory: systemFeatures.category,
        hasAccess: groupPermissions.hasAccess
      })
      .from(groupPermissions)
      .innerJoin(systemFeatures, eq(systemFeatures.id, groupPermissions.featureId))
      .where(eq(groupPermissions.groupId, groupId))
      .orderBy(systemFeatures.category, systemFeatures.sortOrder);

    return permissions;
  }

  /**
   * Update group permissions
   */
  static async updateGroupPermissions(
    groupId: number, 
    permissions: { featureId: number; hasAccess: boolean }[]
  ) {
    // Delete existing permissions
    await db
      .delete(groupPermissions)
      .where(eq(groupPermissions.groupId, groupId));

    // Insert new permissions
    if (permissions.length > 0) {
      await db.insert(groupPermissions).values(
        permissions.map(p => ({
          groupId,
          featureId: p.featureId,
          hasAccess: p.hasAccess
        }))
      );
    }
  }

  /**
   * Assign user to a group
   */
  static async assignUserToGroup(userId: number, groupId: number, assignedBy?: number) {
    // Remove existing group assignments
    await db
      .delete(userPermissionGroups)
      .where(eq(userPermissionGroups.userId, userId));

    // Assign new group
    await db.insert(userPermissionGroups).values({
      userId,
      groupId,
      assignedBy
    });
  }

  /**
   * Get user's current group
   */
  static async getUserGroup(userId: number) {
    const userGroup = await db
      .select({
        groupId: userPermissionGroups.groupId,
        groupName: permissionGroups.name,
        groupDescription: permissionGroups.description
      })
      .from(userPermissionGroups)
      .innerJoin(permissionGroups, eq(permissionGroups.id, userPermissionGroups.groupId))
      .where(eq(userPermissionGroups.userId, userId))
      .limit(1);

    return userGroup[0] || null;
  }

  /**
   * Initialize default features in the system
   */
  static async initializeFeatures() {
    const features = [
      // AI Features
      { code: 'ai.upscale', name: 'Upscale de Imagem', category: 'IA', sortOrder: 1, isActive: true },
      { code: 'ai.background_removal', name: 'Remover Background', category: 'IA', sortOrder: 2, isActive: true },
      
      // Agents
      { code: 'agents.amazon_listing', name: 'Amazon Listing Optimizer', category: 'Agentes', sortOrder: 1 },
      { code: 'agents.html_descriptions', name: 'Gerador de Descrições HTML', category: 'Agentes', sortOrder: 2 },
      { code: 'agents.bullet_points', name: 'Gerar Bullet Points', category: 'Agentes', sortOrder: 3 },
      { code: 'agents.main_image_editor', name: 'Editar Imagem Principal', category: 'Agentes', sortOrder: 4 },
      { code: 'agents.lifestyle_model', name: 'Editar Imagem - Lifestyle com Modelo', category: 'Agentes', sortOrder: 5 },
      { code: 'agents.infographic_editor', name: 'Editar Fotos Infográficos', category: 'Agentes', sortOrder: 6 },
      { code: 'agents.advanced_infographic', name: 'Gerador Avançado de Infográficos', category: 'Agentes', sortOrder: 7 },
      { code: 'agents.customer_service', name: 'Amazon Customer Service Email', category: 'Agentes', sortOrder: 8 },
      { code: 'agents.negative_reviews', name: 'Amazon Negative Reviews Response', category: 'Agentes', sortOrder: 9 },
      
      // Hub de Recursos
      { code: 'hub.keyword_report', name: 'Relatório de Keywords', category: 'Hub de Recursos', sortOrder: 1 },
      { code: 'hub.keyword_suggestions', name: 'Amazon Keywords Suggestions', category: 'Hub de Recursos', sortOrder: 2 },
      { code: 'hub.product_details', name: 'Detalhes do Produto', category: 'Hub de Recursos', sortOrder: 3 },
      { code: 'hub.amazon_reviews', name: 'Amazon Reviews', category: 'Hub de Recursos', sortOrder: 4 },
      
      // Admin Area
      { code: 'admin.access', name: 'Acesso à Área Admin', category: 'Admin', sortOrder: 1 },
      { code: 'admin.users', name: 'Gerenciar Usuários', category: 'Admin', sortOrder: 2 },
      { code: 'admin.permissions', name: 'Gerenciar Permissões', category: 'Admin', sortOrder: 3 },
      { code: 'admin.content', name: 'Gerenciar Conteúdo', category: 'Admin', sortOrder: 4 },
    ];

    // Insert features if they don't exist
    for (const feature of features) {
      const existing = await db
        .select({ id: systemFeatures.id })
        .from(systemFeatures)
        .where(eq(systemFeatures.code, feature.code))
        .limit(1);

      if (!existing[0]) {
        await db.insert(systemFeatures).values(feature);
      }
    }
  }

  /**
   * Initialize default groups
   */
  static async initializeGroups() {
    const groups = [
      { code: 'gratuito', name: 'Gratuito', description: 'Acesso básico gratuito', priority: 1 },
      { code: 'pagantes', name: 'Pagantes', description: 'Assinantes pagantes', priority: 2 },
      { code: 'alunos', name: 'Alunos', description: 'Alunos do curso', priority: 3 },
      { code: 'mentorados', name: 'Mentorados', description: 'Participantes da mentoria', priority: 4 },
      { code: 'admin', name: 'Admin', description: 'Administradores do sistema', priority: 100 },
    ];

    // Insert groups if they don't exist
    for (const group of groups) {
      const existing = await db
        .select({ id: permissionGroups.id })
        .from(permissionGroups)
        .where(eq(permissionGroups.code, group.code))
        .limit(1);

      if (!existing[0]) {
        await db.insert(permissionGroups).values(group);
      }
    }
  }
}