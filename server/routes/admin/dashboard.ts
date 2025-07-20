/**
 * Admin Dashboard Routes - Ultra Lightweight
 * Only essential data, no status or activity tracking
 */

import { Router } from 'express';
import { eq, count } from 'drizzle-orm';
import { db } from '../../db';
import { users, userGroups } from '../../../shared/schema';
import { enhancedAuth } from '../../middleware/enhancedAuth';

const router = Router();

// GET /api/admin/dashboard-stats - Ultra-lightweight stats only
router.get('/dashboard-stats', enhancedAuth, async (req, res) => {
  try {
    // Only count totals - no heavy queries
    const [totalUsers, totalGroups] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(userGroups),
    ]);

    const stats = {
      totalUsers: totalUsers[0]?.count || 0,
      totalGroups: totalGroups[0]?.count || 0,
    };

    res.json(stats);
  } catch (error) {
    console.error('❌ Admin Dashboard Stats Error:', error);
    res.status(500).json({ error: 'Erro ao carregar estatísticas' });
  }
});

export default router;