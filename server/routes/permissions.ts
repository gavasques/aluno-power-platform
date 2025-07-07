import { Router } from 'express';
import { PermissionsService } from '../services/permissionsService';
import { requireAuth } from '../security';

const router = Router();

/**
 * Get current user's permissions for all features
 */
router.get('/api/permissions/features', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const features = await PermissionsService.getUserFeatureAccess(userId);
    
    res.json({
      success: true,
      data: features,
      userGroup: await PermissionsService.getUserGroup(userId)
    });
  } catch (error) {
    console.error('Error getting user feature access:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * Check access to a specific feature
 */
router.get('/api/permissions/check/:featureKey', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { featureKey } = req.params;
    
    const permission = await PermissionsService.checkFeatureAccess(userId, featureKey);
    
    res.json({
      success: true,
      data: permission
    });
  } catch (error) {
    console.error('Error checking feature access:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * Get user's group information
 */
router.get('/api/permissions/group', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const group = await PermissionsService.getUserGroup(userId);
    
    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Error getting user group:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * Admin endpoint: Get complete feature access matrix
 */
router.get('/api/permissions/matrix', requireAuth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado - apenas administradores'
      });
    }
    
    const matrix = await PermissionsService.getFeatureAccessMatrix();
    
    res.json({
      success: true,
      data: matrix
    });
  } catch (error) {
    console.error('Error getting feature access matrix:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * Admin endpoint: Assign user to group
 */
router.post('/api/permissions/assign', requireAuth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado - apenas administradores'
      });
    }
    
    const { userId, groupName } = req.body;
    
    if (!userId || !groupName) {
      return res.status(400).json({
        success: false,
        error: 'userId e groupName são obrigatórios'
      });
    }
    
    const success = await PermissionsService.assignUserToGroup(userId, groupName);
    
    if (success) {
      res.json({
        success: true,
        message: `Usuário ${userId} atribuído ao grupo ${groupName}`
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Falha ao atribuir usuário ao grupo'
      });
    }
  } catch (error) {
    console.error('Error assigning user to group:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

export default router;