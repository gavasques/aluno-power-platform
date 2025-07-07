/**
 * Admin User Groups Management Routes
 * Allows administrators to manage user permission groups
 */

import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../../security';
import { UserGroupService } from '../../services/userGroupService';
import { z } from 'zod';

const router = Router();

// Schema for group assignment
const assignGroupSchema = z.object({
  userId: z.number(),
  groupCode: z.enum(['gratuito', 'pagantes', 'alunos', 'mentorados', 'admin'])
});

/**
 * Get all users with their current groups
 * GET /api/admin/user-groups
 */
router.get('/', requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const usersWithGroups = await UserGroupService.getAllUsersWithGroups();
    
    res.json({
      success: true,
      users: usersWithGroups
    });
  } catch (error) {
    console.error('❌ Error getting users with groups:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * Assign user to a specific group
 * POST /api/admin/user-groups/assign
 */
router.post('/assign', requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { userId, groupCode } = assignGroupSchema.parse(req.body);
    const adminUser = (req as any).user;
    
    const success = await UserGroupService.assignUserToGroup(
      userId, 
      groupCode, 
      adminUser.id
    );
    
    if (success) {
      res.json({
        success: true,
        message: `Usuário atribuído ao grupo ${groupCode} com sucesso`
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Falha ao atribuir usuário ao grupo'
      });
    }
  } catch (error) {
    console.error('❌ Error assigning user to group:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
});

/**
 * Get user's current group
 * GET /api/admin/user-groups/:userId
 */
router.get('/:userId', requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'ID de usuário inválido'
      });
    }
    
    const userGroup = await UserGroupService.getUserGroup(userId);
    
    res.json({
      success: true,
      group: userGroup
    });
  } catch (error) {
    console.error('❌ Error getting user group:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * Sync user group with subscription status
 * POST /api/admin/user-groups/:userId/sync
 */
router.post('/:userId/sync', requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'ID de usuário inválido'
      });
    }
    
    await UserGroupService.syncUserGroupWithSubscription(userId);
    
    res.json({
      success: true,
      message: 'Grupo do usuário sincronizado com status da assinatura'
    });
  } catch (error) {
    console.error('❌ Error syncing user group:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

export default router;