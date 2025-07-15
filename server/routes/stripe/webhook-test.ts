/**
 * Stripe Webhook Testing Routes
 * Test the complete subscription flow and user group changes
 */

import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../../security';
import { UserGroupService } from '../../services/userGroupService';
import { db } from '../../db';
import { userSubscriptions, users } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

/**
 * Test subscription activation (move user to Pagantes)
 * POST /api/stripe/test/activate-subscription
 */
router.post('/activate-subscription', requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    // Get user's current group
    const currentGroup = await UserGroupService.getUserGroup(userId);
    
    // Simulate subscription activation
    await UserGroupService.handleSubscriptionActivated(userId);
    
    // Get user's new group
    const newGroup = await UserGroupService.getUserGroup(userId);
    
    res.json({
      success: true,
      message: 'Subscription activation simulated',
      changes: {
        before: currentGroup,
        after: newGroup
      }
    });
  } catch (error) {
    console.error('❌ Error testing subscription activation:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * Test subscription cancellation (move user back to Gratuito)
 * POST /api/stripe/test/cancel-subscription
 */
router.post('/cancel-subscription', requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    // Get user's current group
    const currentGroup = await UserGroupService.getUserGroup(userId);
    
    // Simulate subscription cancellation
    await UserGroupService.handleSubscriptionEnded(userId);
    
    // Get user's new group
    const newGroup = await UserGroupService.getUserGroup(userId);
    
    res.json({
      success: true,
      message: 'Subscription cancellation simulated',
      changes: {
        before: currentGroup,
        after: newGroup
      }
    });
  } catch (error) {
    console.error('❌ Error testing subscription cancellation:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * Test special group preservation (Alunos/Mentorados should not change)
 * POST /api/stripe/test/special-group-preservation
 */
router.post('/special-group-preservation', requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { userId, action } = req.body; // action: 'activate' or 'cancel'
    
    if (!userId || !action) {
      return res.status(400).json({
        success: false,
        error: 'userId and action are required'
      });
    }

    // Get user's current group
    const currentGroup = await UserGroupService.getUserGroup(userId);
    
    // Test the preservation logic
    if (action === 'activate') {
      await UserGroupService.handleSubscriptionActivated(userId);
    } else if (action === 'cancel') {
      await UserGroupService.handleSubscriptionEnded(userId);
    }
    
    // Get user's group after action
    const newGroup = await UserGroupService.getUserGroup(userId);
    
    const wasPreserved = currentGroup?.code === newGroup?.code;
    
    res.json({
      success: true,
      message: `Special group preservation test completed`,
      testResult: {
        action,
        before: currentGroup,
        after: newGroup,
        wasPreserved,
        shouldPreserve: currentGroup && ['alunos', 'mentorados'].includes(currentGroup.code)
      }
    });
  } catch (error) {
    console.error('❌ Error testing special group preservation:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * Get full flow test status
 * GET /api/stripe/test/flow-status
 */
router.get('/flow-status', requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const allUsersWithGroups = await UserGroupService.getAllUsersWithGroups();
    
    // Group users by their permission group
    const groupedUsers = allUsersWithGroups.reduce((acc, user) => {
      const groupCode = user.groupCode || 'no_group';
      if (!acc[groupCode]) {
        acc[groupCode] = [];
      }
      acc[groupCode].push({
        id: user.userId,
        name: user.userName,
        email: user.userEmail,
        assignedAt: user.assignedAt
      });
      return acc;
    }, {} as Record<string, any[]>);
    
    res.json({
      success: true,
      summary: {
        totalUsers: allUsersWithGroups.length,
        groupDistribution: Object.keys(groupedUsers).map(groupCode => ({
          group: groupCode,
          count: groupedUsers[groupCode].length
        }))
      },
      usersByGroup: groupedUsers
    });
  } catch (error) {
    console.error('❌ Error getting flow status:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

export default router;