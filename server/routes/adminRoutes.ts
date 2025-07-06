/**
 * Administrative Routes - Phase 6: Admin & Content Modularization
 * 
 * SOLID Principles Applied:
 * - SRP: Single responsibility for admin route configuration
 * - OCP: Open for extension, closed for modification
 * - LSP: Consistent route interface pattern
 * - ISP: Focused interface for admin routes only
 * - DIP: Depends on AdminController abstraction
 * 
 * Routes Covered:
 * - GET /api/admin/dashboard-stats
 * - GET /api/users
 * - GET /api/users/:id
 * - GET /api/users/:id/groups
 * - POST /api/users
 * - PUT /api/users/:id
 * - DELETE /api/users/:id
 */

import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { requireAuth, requireRole } from '../security';

const router = Router();
const adminController = new AdminController();

/**
 * PHASE 6: Dashboard Statistics
 * Protected: Admin only
 */
router.get('/admin/dashboard-stats', 
  requireAuth, 
  requireRole(['admin']), 
  adminController.getDashboardStats.bind(adminController)
);

/**
 * PHASE 6: User Management Routes
 * Protected: Admin and support roles
 */
router.get('/users', 
  requireAuth, 
  requireRole(['admin', 'support']), 
  adminController.getUsers.bind(adminController)
);

router.get('/users/:id', 
  requireAuth, 
  requireRole(['admin', 'support']), 
  adminController.getUserById.bind(adminController)
);

router.get('/users/:id/groups', 
  requireAuth, 
  requireRole(['admin']), 
  adminController.getUserGroups.bind(adminController)
);

router.post('/users', 
  requireAuth, 
  requireRole(['admin']), 
  adminController.createUser.bind(adminController)
);

router.put('/users/:id', 
  requireAuth, 
  requireRole(['admin']), 
  adminController.updateUser.bind(adminController)
);

router.delete('/users/:id', 
  requireAuth, 
  requireRole(['admin']), 
  adminController.deleteUser.bind(adminController)
);

export { router as adminRoutes };