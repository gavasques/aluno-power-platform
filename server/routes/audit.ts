import { Router } from 'express';
import { requireAuth } from '../security';
import { requireAdmin, requireAdminAccess } from '../middleware/permissions';
import { AuditService } from '../services/auditService';

const router = Router();

// Get audit logs for current user
router.get('/my-logs', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const logs = await AuditService.getUserAuditLogs(userId, limit);
    
    res.json({
      success: true,
      data: logs,
      message: 'Audit logs retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching user audit logs:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Get audit logs for specific feature (admin only)
router.get('/feature/:feature', requireAuth, requireAdminAccess, async (req, res) => {
  try {
    const feature = req.params.feature;
    const limit = parseInt(req.query.limit as string) || 100;
    
    const logs = await AuditService.getFeatureAuditLogs(feature, limit);
    
    res.json({
      success: true,
      data: logs,
      message: `Audit logs for feature ${feature} retrieved successfully`
    });
  } catch (error) {
    console.error('Error fetching feature audit logs:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Get failed access attempts (admin only)
router.get('/failed-attempts', requireAuth, requireAdminAccess, async (req, res) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    
    const attempts = await AuditService.getFailedAccessAttempts(hours);
    
    res.json({
      success: true,
      data: attempts,
      message: `Failed access attempts in last ${hours} hours retrieved successfully`
    });
  } catch (error) {
    console.error('Error fetching failed access attempts:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Get access statistics (admin only)
router.get('/stats', requireAuth, requireAdminAccess, async (req, res) => {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    
    const stats = await AuditService.getAccessStats(userId);
    
    res.json({
      success: true,
      data: stats,
      message: 'Access statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching access statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

export default router;