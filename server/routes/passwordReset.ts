/**
 * Password Reset Routes - SMTP Integration
 * Handles password recovery requests and token validation
 */

import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { users } from '../../shared/schema.js';
import { eq, and, gt } from 'drizzle-orm';
import emailService from '../services/emailService.js';

const router = Router();

// Password reset request schema
const passwordResetRequestSchema = z.object({
  email: z.string().email('Email inválido')
});

// Password reset confirmation schema
const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Senha deve conter ao menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial')
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = passwordResetRequestSchema.parse(req.body);

    // Check if user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Always return success to prevent email enumeration attacks
    const response = {
      success: true,
      message: 'Se o email estiver cadastrado, você receberá as instruções para redefinir sua senha.'
    };

    if (!user) {
      console.log(`[PASSWORD_RESET] Email not found: ${email}`);
      return res.json(response);
    }

    // Check if email service is configured
    if (!emailService.isServiceConfigured()) {
      console.error('[PASSWORD_RESET] Email service not configured');
      return res.status(500).json({
        success: false,
        message: 'Serviço de email temporariamente indisponível. Tente novamente mais tarde.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save reset token to database
    await db
      .update(users)
      .set({
        resetToken,
        resetTokenExpiry
      })
      .where(eq(users.id, user.id));

    // Send reset email
    const emailSent = await emailService.sendPasswordResetEmail(
      email,
      resetToken,
      user.name
    );

    if (!emailSent) {
      console.error(`[PASSWORD_RESET] Failed to send email to: ${email}`);
      return res.status(500).json({
        success: false,
        message: 'Erro ao enviar email. Tente novamente mais tarde.'
      });
    }

    console.log(`[PASSWORD_RESET] Reset email sent successfully to: ${email}`);
    res.json(response);

  } catch (error) {
    console.error('[PASSWORD_RESET] Error in forgot-password:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = passwordResetConfirmSchema.parse(req.body);

    // Find user with valid reset token
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.resetToken, token),
          gt(users.resetTokenExpiry, new Date())
        )
      )
      .limit(1);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido ou expirado. Solicite uma nova redefinição de senha.'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and clear reset token
    await db
      .update(users)
      .set({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));

    console.log(`[PASSWORD_RESET] Password reset successfully for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Senha redefinida com sucesso! Você já pode fazer login com sua nova senha.'
    });

  } catch (error) {
    console.error('[PASSWORD_RESET] Error in reset-password:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/auth/verify-reset-token/:token
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token é obrigatório'
      });
    }

    // Check if token exists and is valid
    const [user] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(
        and(
          eq(users.resetToken, token),
          gt(users.resetTokenExpiry, new Date())
        )
      )
      .limit(1);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

    res.json({
      success: true,
      message: 'Token válido',
      email: user.email.replace(/(.{2}).*(@.*)/, '$1***$2') // Partially hide email
    });

  } catch (error) {
    console.error('[PASSWORD_RESET] Error in verify-reset-token:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;