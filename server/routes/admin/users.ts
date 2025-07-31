/**
 * Admin Users Routes - Essential user management
 */

import { Router } from 'express';
import { eq, count, or, ilike } from 'drizzle-orm';
import { db } from '../../db';
import { users, userGroups, userGroupMembers } from '../../../shared/schema';
import { enhancedAuth } from '../../middleware/enhancedAuth';
import bcrypt from 'bcryptjs';

const router = Router();

// GET /api/admin/users - List all users with pagination
router.get('/users', enhancedAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const offset = (page - 1) * limit;

    // Build the base query with search filter
    const baseQuery = db
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

    // Build where condition if search is provided
    const whereCondition = search ? or(
      ilike(users.name, `%${search}%`),
      ilike(users.email, `%${search}%`),
      ilike(users.username, `%${search}%`)
    ) : undefined;

    // Get total count for pagination with same filter
    const totalCountResult = await db
      .select({ count: count() })
      .from(users)
      .where(whereCondition);
    const totalUsers = totalCountResult[0].count;

    // Get paginated users
    const query = baseQuery;
    const allUsers = await (whereCondition ? query.where(whereCondition) : query)
      .limit(limit)
      .offset(offset)
      .orderBy(users.createdAt);

    // Calculate pagination
    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      users: allUsers,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNextPage,
        hasPrevPage
      }
    });
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

// PATCH /api/admin/users/:id - Update user with groups (admin only)
router.patch('/users/:id', enhancedAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, isActive, groupIds } = req.body;

    const [updatedUser] = await db
      .update(users)
      .set({ 
        name, 
        email, 
        isActive, 
        updatedAt: new Date() 
      })
      .where(eq(users.id, parseInt(id)))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        isActive: users.isActive
      });

    // Update user groups if provided
    if (Array.isArray(groupIds)) {
      // Remove existing group memberships
      await db.delete(userGroupMembers).where(eq(userGroupMembers.userId, parseInt(id)));
      
      // Add new group memberships
      if (groupIds.length > 0) {
        await db.insert(userGroupMembers).values(
          groupIds.map((groupId: number) => ({
            userId: parseInt(id),
            groupId,
            addedAt: new Date()
          }))
        );
      }
    }

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('❌ Admin User Update Error:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// POST /api/admin/users - Create new user with groups (admin only)
router.post('/users', enhancedAuth, async (req, res) => {
  try {
    const { name, email, isActive, password, groupIds } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate username from email (before @ symbol)
    const username = email.split('@')[0];
    
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        username, // Auto-generated from email
        role: 'user', // Default role
        isActive,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        isActive: users.isActive
      });

    // Add user to groups if provided
    if (Array.isArray(groupIds) && groupIds.length > 0) {
      await db.insert(userGroupMembers).values(
        groupIds.map((groupId: number) => ({
          userId: newUser.id,
          groupId,
          addedAt: new Date()
        }))
      );
    }

    res.json({ success: true, user: newUser });
  } catch (error) {
    console.error('❌ Admin User Create Error:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// GET /api/admin/users/:id - Get specific user with groups (admin only)
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

    // Get user's groups using aliases to avoid naming conflicts
    const ugm = userGroupMembers;
    const ug = userGroups;
    
    const groupMemberships = await db
      .select({
        groupId: ugm.groupId,
        groupName: ug.name
      })
      .from(ugm)
      .innerJoin(ug, eq(ugm.groupId, ug.id))
      .where(eq(ugm.userId, parseInt(id)));

    res.json({
      ...user,
      groups: groupMemberships.map(membership => membership.groupId)
    });
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