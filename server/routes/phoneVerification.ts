/**
 * Phone Verification Routes - Evolution API Integration
 * Handles phone number verification via WhatsApp
 */

import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { db } from '../db.js';
import { users } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import evolutionAPI from '../services/evolutionAPI.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Phone verification request schema
const phoneVerificationRequestSchema = z.object({
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .regex(/^[\d\s\(\)\-\+]+$/, 'Formato de telefone inválido')
});

// Phone verification confirm schema
const phoneVerificationConfirmSchema = z.object({
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  code: z.string().length(6, 'Código deve ter 6 dígitos')
});

// POST /api/phone/send-verification
router.post('/send-verification', requireAuth, async (req: any, res) => {
  try {
    const { phone } = phoneVerificationRequestSchema.parse(req.body);
    const userId = req.user.id;

    // Check if Evolution API is configured
    if (!evolutionAPI.isServiceConfigured()) {
      console.error('[PHONE_VERIFICATION] Evolution API service not configured');
      return res.status(500).json({
        success: false,
        message: 'Serviço de verificação temporariamente indisponível.'
      });
    }

    // Get user info
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Save verification code to database
    await db
      .update(users)
      .set({
        phone: phone,
        phoneVerificationCode: verificationCode,
        phoneVerificationExpiry: verificationExpiry,
        phoneVerified: false
      })
      .where(eq(users.id, userId));

    // Send WhatsApp message with verification code
    const messageSent = await evolutionAPI.sendPhoneVerificationCode(
      phone,
      verificationCode,
      user.name
    );

    if (!messageSent) {
      console.error(`[PHONE_VERIFICATION] Failed to send WhatsApp to: ${phone}`);
      return res.status(500).json({
        success: false,
        message: 'Erro ao enviar código de verificação. Tente novamente.'
      });
    }

    console.log(`[PHONE_VERIFICATION] Verification code sent to: ${phone} for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Código de verificação enviado via WhatsApp!'
    });

  } catch (error) {
    console.error('[PHONE_VERIFICATION] Error in send-verification:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/phone/verify-code
router.post('/verify-code', requireAuth, async (req: any, res) => {
  try {
    const { phone, code } = phoneVerificationConfirmSchema.parse(req.body);
    const userId = req.user.id;

    // Get user with verification data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Check if phone matches
    if (user.phone !== phone) {
      return res.status(400).json({
        success: false,
        message: 'Telefone não confere com o solicitado'
      });
    }

    // Check if code exists and matches
    if (!user.phoneVerificationCode || user.phoneVerificationCode !== code) {
      return res.status(400).json({
        success: false,
        message: 'Código de verificação inválido'
      });
    }

    // Check if code has expired
    if (!user.phoneVerificationExpiry || new Date() > user.phoneVerificationExpiry) {
      return res.status(400).json({
        success: false,
        message: 'Código de verificação expirado. Solicite um novo código.'
      });
    }

    // Verify phone number
    await db
      .update(users)
      .set({
        phoneVerified: true,
        phoneVerificationCode: null,
        phoneVerificationExpiry: null
      })
      .where(eq(users.id, userId));

    // Send welcome WhatsApp message
    if (evolutionAPI.isServiceConfigured()) {
      evolutionAPI.sendWelcomeMessage(phone, user.name)
        .catch(error => console.error('[PHONE_VERIFICATION] Error sending welcome message:', error));
    }

    console.log(`[PHONE_VERIFICATION] Phone verified successfully: ${phone} for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Telefone verificado com sucesso!'
    });

  } catch (error) {
    console.error('[PHONE_VERIFICATION] Error in verify-code:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/phone/status
router.get('/status', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;

    const [user] = await db
      .select({
        phone: users.phone,
        phoneVerified: users.phoneVerified,
        hasVerificationPending: users.phoneVerificationCode
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        hasVerificationPending: !!user.hasVerificationPending
      }
    });

  } catch (error) {
    console.error('[PHONE_VERIFICATION] Error in status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/phone/test - Admin only endpoint for testing
router.post('/test', requireAuth, async (req: any, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Telefone e mensagem são obrigatórios'
      });
    }

    const result = await evolutionAPI.sendMessage(phone, message);

    res.json({
      success: result.success,
      message: result.success ? 'Mensagem enviada com sucesso!' : 'Erro ao enviar mensagem',
      data: result.data,
      error: result.error
    });

  } catch (error) {
    console.error('[PHONE_VERIFICATION] Error in test:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;