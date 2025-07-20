/**
 * Admin Users Routes - Essential user management
 */

import { Router } from 'express';
import { eq, count } from 'drizzle-orm';
import { db } from '../../db';
import { users, userGroups } from '../../../shared/schema';
import { enhancedAuth } from '../../middleware/enhancedAuth';

const router = Router();

// GET /api/admin/users - List all users (lightweight)
router.get('/users', enhancedAuth, async (req, res) => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        name: users.name,
        role: users.role,
        isActive: users.isActive,
        lastLogin: users.lastLogin,
        createdAt: users.createdAt,
      })
      .from(users);

    res.json(allUsers);
  } catch (error) {
    console.error('❌ Admin Users Error:', error);
    res.status(500).json({ error: 'Erro ao carregar usuários' });
  }
});

// GET /api/admin/permissions/groups - List permission groups
router.get('/permissions/groups', enhancedAuth, async (req, res) => {
  try {
    const groups = await db
      .select({
        id: userGroups.id,
        name: userGroups.name,
        description: userGroups.description,
        isActive: userGroups.isActive,
        createdAt: userGroups.createdAt,
      })
      .from(userGroups)
      .where(eq(userGroups.isActive, true));

    res.json({ groups });
  } catch (error) {
    console.error('❌ Admin Permission Groups Error:', error);
    res.status(500).json({ error: 'Erro ao carregar grupos' });
  }
});

// PATCH /api/admin/users/:id - Update user status (minimal)
router.patch('/users/:id', enhancedAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    await db
      .update(users)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(users.id, parseInt(id)));

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Admin User Update Error:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

export default router;