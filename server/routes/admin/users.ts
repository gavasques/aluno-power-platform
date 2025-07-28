/**
 * Admin Users Routes - Essential user management
 */

import { Router } from 'express';
import { eq, count } from 'drizzle-orm';
import { db } from '../../db';
import { users, userGroups } from '../../../shared/schema';
import { enhancedAuth } from '../../middleware/enhancedAuth';
import bcrypt from 'bcryptjs';

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

// POST /api/admin/users - Create new user (admin only)
router.post('/users', enhancedAuth, async (req, res) => {
  try {
    const { name, email, username, role, isActive, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        username,
        role,
        isActive,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        username: users.username,
        role: users.role,
        isActive: users.isActive
      });

    res.json({ success: true, user: newUser });
  } catch (error) {
    console.error('❌ Admin User Create Error:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// GET /api/admin/users/:id - Get specific user (admin only)
router.get('/users/:id', enhancedAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        name: users.name,
        role: users.role,
        isActive: users.isActive,
        lastLogin: users.lastLogin,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.id, parseInt(id)));

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('❌ Admin User Get Error:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// DELETE /api/admin/users/:id - Delete user (admin only)
router.delete('/users/:id', enhancedAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await db
      .delete(users)
      .where(eq(users.id, parseInt(id)));

    res.json({ success: true, message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('❌ Admin User Delete Error:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
});

export default router;