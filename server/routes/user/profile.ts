import { Router } from 'express';
import { requireAuth } from '../../security';
import { validateIdParam, sanitizeBody } from '../../security';
import { pool } from '../../db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const router = Router();

// Schema for profile update
const updateProfileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string().optional()
});

// Schema for password change
const changePasswordSchema = z.object({
  newPassword: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});

// GET /api/user/profile - Get user profile
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const result = await pool.query(
      'SELECT id, name, email, phone FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/user/profile - Update user profile
router.put('/', requireAuth, sanitizeBody, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Validate request body
    const validation = updateProfileSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: validation.error.errors.map(e => e.message).join(', ')
      });
    }

    const { name, phone } = validation.data;

    const result = await pool.query(
      'UPDATE users SET name = $1, phone = $2 WHERE id = $3 RETURNING id, name, email, phone',
      [name, phone || null, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/user/change-password - Change user password
router.put('/change-password', requireAuth, sanitizeBody, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Validate request body
    const validation = changePasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: validation.error.errors.map(e => e.message).join(', ')
      });
    }

    const { newPassword } = validation.data;

    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2 RETURNING id',
      [hashedPassword, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;