/**
 * Authentication Routes - Enhanced with Phone Verification
 * Handles user registration with phone number validation
 */

import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../db.js';
import { users } from '../../shared/schema.js';
import { eq, or } from 'drizzle-orm';
import { AuthService } from '../services/authService.js';
import { handleAuthError } from '../utils/authErrors.js';
import emailService from '../services/emailService.js';
import evolutionAPI from '../services/evolutionAPI.js';

const router = Router();

// Enhanced registration schema with phone validation
const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/(?=.*[a-z])/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/(?=.*[A-Z])/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/(?=.*\d)/, 'Senha deve conter pelo menos um número'),
  phone: z.string().min(1, 'Telefone é obrigatório')
});

// Login schema
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
});

// POST /api/auth/register - Enhanced with phone support
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = registerSchema.parse(req.body);

    // Check if email or phone already exists
    const existingUserByEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUserByEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email já está em uso',
        field: 'email'
      });
    }

    const existingUserByPhone = await db
      .select()
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);

    if (existingUserByPhone.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Telefone já está em uso',
        field: 'phone'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user - username is same as email
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        username: email, // Use email as username
        password: hashedPassword,
        phone: phone,
        phoneVerified: false,
        role: 'user',
        isActive: true,
        credits: "0.00"
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        phoneVerified: users.phoneVerified,
        role: users.role
      });

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(newUser.email, newUser.name);
      console.log(`[AUTH] Welcome email sent to: ${newUser.email}`);
    } catch (emailError) {
      console.error('[AUTH] Error sending welcome email:', emailError);
      // Don't fail registration if email fails
    }

    console.log(`[AUTH] User registered successfully: ${newUser.email}`);

    res.status(201).json({
      success: true,
      message: 'Conta criada com sucesso!',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        phoneVerified: newUser.phoneVerified,
        role: newUser.role
      },
      requiresPhoneVerification: !!newUser.phone && !newUser.phoneVerified
    });

  } catch (error) {
    console.error('[AUTH] Error in register:', error);
    
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

// Forgot password schema - support email or phone
const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, 'Email ou telefone é obrigatório'),
  type: z.enum(['email', 'phone'], {
    required_error: 'Tipo deve ser email ou phone'
  })
});

// Reset password schema
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  newPassword: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/(?=.*[a-z])/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/(?=.*[A-Z])/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/(?=.*\d)/, 'Senha deve conter pelo menos um número'),
  type: z.enum(['email', 'phone'])
});

// POST /api/auth/forgot-password-code - Send verification code via email
router.post('/forgot-password-code', async (req, res) => {
  try {
    const { email } = z.object({
      email: z.string().email('Email inválido')
    }).parse(req.body);

    console.log('🔐 [AUTH_ROUTE] /forgot-password-code endpoint reached for:', email);

    const resetCode = await AuthService.generatePasswordResetCode(email);
    
    if (!resetCode) {
      return res.status(404).json({
        success: false,
        message: 'Email não encontrado'
      });
    }

    // Send email with code
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      await emailService.sendPasswordResetCodeEmail(email, resetCode, user?.name);
      console.log(`🔐 [AUTH_ROUTE] Password reset code sent to: ${email}`);
      
      return res.json({
        success: true,
        message: 'Código de verificação enviado para o seu email!'
      });
    } catch (emailError) {
      console.error('[AUTH] Error sending password reset code email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao enviar email de recuperação'
      });
    }

  } catch (error) {
    console.error('[AUTH] Error in forgot-password-code:', error);
    
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

// POST /api/auth/verify-reset-code - Verify reset code
router.post('/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = z.object({
      email: z.string().email('Email inválido'),
      code: z.string().min(6, 'Código deve ter 6 dígitos')
    }).parse(req.body);

    const isValid = await AuthService.verifyResetCode(email, code);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido ou expirado'
      });
    }

    return res.json({
      success: true,
      message: 'Código verificado com sucesso!'
    });

  } catch (error) {
    console.error('[AUTH] Error in verify-reset-code:', error);
    
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

// POST /api/auth/reset-password-with-code - Reset password using code
router.post('/reset-password-with-code', async (req, res) => {
  try {
    const { email, code, newPassword } = z.object({
      email: z.string().email('Email inválido'),
      code: z.string().min(6, 'Código deve ter 6 dígitos'),
      newPassword: z.string()
        .min(8, 'Senha deve ter pelo menos 8 caracteres')
        .regex(/(?=.*[a-z])/, 'Senha deve conter pelo menos uma letra minúscula')
        .regex(/(?=.*[A-Z])/, 'Senha deve conter pelo menos uma letra maiúscula')
        .regex(/(?=.*\d)/, 'Senha deve conter pelo menos um número')
    }).parse(req.body);

    const success = await AuthService.resetPasswordWithCode(email, code, newPassword);
    
    if (!success) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido ou expirado'
      });
    }

    console.log(`[AUTH] Password reset successfully using code for: ${email}`);

    return res.json({
      success: true,
      message: 'Senha redefinida com sucesso!'
    });

  } catch (error) {
    console.error('[AUTH] Error in reset-password-with-code:', error);
    
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

// POST /api/auth/forgot-password - Dual recovery (email/phone)
router.post('/forgot-password', async (req, res) => {
  try {
    console.log('🔐 [AUTH_ROUTE] /forgot-password endpoint reached');
    console.log('🔐 [AUTH_ROUTE] Request body:', JSON.stringify(req.body));
    
    const { identifier, type } = forgotPasswordSchema.parse(req.body);

    let user;
    if (type === 'email') {
      [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, identifier))
        .limit(1);
    } else {
      [user] = await db
        .select()
        .from(users)
        .where(eq(users.phone, identifier))
        .limit(1);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: type === 'email' ? 'Email não encontrado' : 'Telefone não encontrado'
      });
    }

    // Generate reset token/code
    if (type === 'email') {
      console.log('🔐 [AUTH_ROUTE] Starting email reset flow...');
      
      // Generate email reset token (long)
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
      console.log('🔐 [AUTH_ROUTE] Token generated for user:', user.id);

      await db
        .update(users)
        .set({
          resetToken,
          resetTokenExpiry
        })
        .where(eq(users.id, user.id));

      // Send email
      try {
        await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);
        console.log(`🔐 [AUTH_ROUTE] Password reset email sent to: ${user.email}`);
        
        return res.json({
          success: true,
          message: 'Email de recuperação enviado com sucesso!',
          type: 'email'
        });
      } catch (emailError) {
        console.error('[AUTH] Error sending password reset email:', emailError);
        return res.status(500).json({
          success: false,
          message: 'Erro ao enviar email de recuperação'
        });
      }

    } else {
      // Generate phone verification code (6 digits)
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationExpiry = new Date(Date.now() + 600000); // 10 minutes

      await db
        .update(users)
        .set({
          phoneVerificationCode: verificationCode,
          phoneVerificationExpiry: verificationExpiry
        })
        .where(eq(users.id, user.id));

      // Send WhatsApp message
      try {
        const message = `🔐 *Core Guilherme Vasques*\n\nSeu código para recuperar a senha é:\n\n*${verificationCode}*\n\nEste código expira em 10 minutos.\n\nSe você não solicitou esta recuperação, ignore esta mensagem.`;
        
        await evolutionAPI.sendMessage(user.phone, message);
        console.log(`[AUTH] Password recovery WhatsApp sent to: ${user.phone}`);
      } catch (whatsappError) {
        console.error('[AUTH] Error sending password recovery WhatsApp:', whatsappError);
        return res.status(500).json({
          success: false,
          message: 'Erro ao enviar código via WhatsApp'
        });
      }

      res.json({
        success: true,
        message: 'Código de recuperação enviado via WhatsApp!',
        type: 'phone',
        phone: user.phone
      });
    }

  } catch (error) {
    console.error('[AUTH] Error in forgot-password:', error);
    
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

// POST /api/auth/reset-password - Reset with email token or phone code
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword, type } = resetPasswordSchema.parse(req.body);

    let user;
    if (type === 'email') {
      // Find user by reset token
      [user] = await db
        .select()
        .from(users)
        .where(eq(users.resetToken, token))
        .limit(1);

      if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Token inválido ou expirado'
        });
      }
    } else {
      // Find user by verification code
      [user] = await db
        .select()
        .from(users)
        .where(eq(users.phoneVerificationCode, token))
        .limit(1);

      if (!user || !user.phoneVerificationExpiry || user.phoneVerificationExpiry < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Código inválido ou expirado'
        });
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear tokens
    if (type === 'email') {
      await db
        .update(users)
        .set({
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null
        })
        .where(eq(users.id, user.id));
    } else {
      await db
        .update(users)
        .set({
          password: hashedPassword,
          phoneVerificationCode: null,
          phoneVerificationExpiry: null
        })
        .where(eq(users.id, user.id));
    }

    console.log(`[AUTH] Password reset successfully for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Senha redefinida com sucesso!'
    });

  } catch (error) {
    console.error('[AUTH] Error in reset-password:', error);
    
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

// POST /api/auth/login - Clean implementation using AuthService
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    // Use standardized authentication service
    const authResult = await AuthService.authenticate({ email, password });

    if (!authResult.success) {
      return res.status(authResult.error.code).json(authResult);
    }

    const { user, token } = authResult.data;

    console.log(`[AUTH] User logged in successfully: ${user.email}`);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        role: user.role,
        credits: user.credits
      },
      requiresPhoneVerification: !!user.phone && !user.phoneVerified
    });

  } catch (error) {
    console.error('[AUTH] Error in login:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
        errors: error.errors
      });
    }

    // Use handleAuthError for consistent error handling
    const errorResponse = handleAuthError(error);
    res.status(errorResponse.error.code).json(errorResponse);
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', async (req: any, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        username: users.username,
        phone: users.phone,
        phoneVerified: users.phoneVerified,
        role: users.role,
        credits: users.credits,
        isActive: users.isActive
      })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo'
      });
    }

    res.json({
      success: true,
      user: {
        ...user,
        requiresPhoneVerification: !!user.phone && !user.phoneVerified
      }
    });

  } catch (error) {
    console.error('[AUTH] Error in /me:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;