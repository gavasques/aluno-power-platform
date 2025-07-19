/**
 * Authentication Routes - Enhanced with Phone Verification
 * Handles user registration with phone number validation
 */

import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { users } from '../../shared/schema.js';
import { eq, or } from 'drizzle-orm';
import { authService } from '../services/authService.js';
import emailService from '../services/emailService.js';
import evolutionAPI from '../services/evolutionAPI.js';

const router = Router();

// Enhanced registration schema with phone validation
const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  username: z.string().min(3, 'Username deve ter pelo menos 3 caracteres'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  phone: z.string().optional()
});

// Login schema
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
});

// POST /api/auth/register - Enhanced with phone support
router.post('/register', async (req, res) => {
  try {
    const { name, email, username, password, phone } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, username)))
      .limit(1);

    if (existingUser.length > 0) {
      const field = existingUser[0].email === email ? 'email' : 'username';
      return res.status(400).json({
        success: false,
        message: `${field === 'email' ? 'Email' : 'Username'} já está em uso`,
        field
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with phone field
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        username,
        password: hashedPassword,
        phone: phone || null,
        phoneVerified: false,
        role: 'user',
        isActive: true,
        credits: "0.00"
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        username: users.username,
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
        username: newUser.username,
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

// POST /api/auth/login - Enhanced with phone verification check
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Conta desativada. Entre em contato com o suporte.'
      });
    }

    // Generate token
    const token = authService.generateToken(user.id);

    // Update last login
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));

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

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
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

    const decoded = authService.verifyToken(token);
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