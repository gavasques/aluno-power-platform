import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { AuthService } from '../services/authService';
import { storage } from '../storage';
import { ValidationHelper } from '../utils/ValidationHelper';
import { ResponseHandler } from '../utils/ResponseHandler';
import bcryptjs from 'bcryptjs';
import { z } from 'zod';

/**
 * AuthController
 * SOLID Principles: Single Responsibility for authentication operations
 * DRY: Centralized auth logic, no duplication
 * KISS: Simple, focused controller methods
 */
export class AuthController extends BaseController {
  private authService: AuthService;

  constructor() {
    super();
    this.authService = new AuthService();
  }

  public async register(req: Request, res: Response): Promise<void> {
    try {
      const registerSchema = z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(2)
      });

      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await AuthService.getUserByEmail(validatedData.email);
      if (existingUser) {
        ResponseHandler.conflict(res, 'Email already registered');
        return;
      }

      // Hash password
      const hashedPassword = await bcryptjs.hash(validatedData.password, 12);
      
      // Create user
      const user = await storage.createUser({
        email: validatedData.email,
        passwordHash: hashedPassword,
        name: validatedData.name,
        role: 'user'
      });

      // Generate session
      const session = await this.authService.createSession(user.id);
      
      ResponseHandler.created(res, {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        token: session.token
      });
    } catch (error: any) {
      ResponseHandler.handleError(res, error, 'Registration failed');
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const loginSchema = z.object({
        email: z.string().email(),
        password: z.string()
      });

      const { email, password } = loginSchema.parse(req.body);
      
      // Find user
      const user = await AuthService.getUserByEmail(email);
      if (!user) {
        ResponseHandler.unauthorized(res, 'Invalid credentials');
        return;
      }

      // Verify password
      const isValid = await bcryptjs.compare(password, user.password);
      if (!isValid) {
        ResponseHandler.unauthorized(res, 'Invalid credentials');
        return;
      }

      // Create session
      const session = await AuthService.createSession(user.id);
      
      ResponseHandler.success(res, {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        token: session.token
      });
    } catch (error: any) {
      ResponseHandler.handleError(res, error, 'Login failed');
    }
  }

  public async logout(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        await this.authService.deleteSession(token);
      }
      
      ResponseHandler.success(res, { message: 'Logged out successfully' });
    } catch (error: any) {
      ResponseHandler.handleError(res, error, 'Logout failed');
    }
  }

  public async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        ResponseHandler.unauthorized(res, 'No token provided');
        return;
      }

      const token = authHeader.substring(7);
      const session = await this.authService.validateSession(token);
      
      if (!session) {
        ResponseHandler.unauthorized(res, 'Invalid token');
        return;
      }

      const user = await storage.getUser(session.userId);
      if (!user) {
        ResponseHandler.notFound(res, 'User not found');
        return;
      }

      ResponseHandler.success(res, {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      });
    } catch (error: any) {
      ResponseHandler.handleError(res, error, 'Failed to get current user');
    }
  }

  public async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const changePasswordSchema = z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8)
      });

      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      
      // Get user from token
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        ResponseHandler.unauthorized(res, 'No token provided');
        return;
      }

      const token = authHeader.substring(7);
      const session = await this.authService.validateSession(token);
      
      if (!session) {
        ResponseHandler.unauthorized(res, 'Invalid token');
        return;
      }

      const user = await storage.getUser(session.userId);
      if (!user) {
        ResponseHandler.notFound(res, 'User not found');
        return;
      }

      // Verify current password
      const isValid = await bcryptjs.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        ResponseHandler.unauthorized(res, 'Current password is incorrect');
        return;
      }

      // Hash new password
      const hashedNewPassword = await bcryptjs.hash(newPassword, 12);
      
      // Update password
      await storage.updateUser(user.id, { passwordHash: hashedNewPassword });
      
      ResponseHandler.success(res, { message: 'Password changed successfully' });
    } catch (error: any) {
      ResponseHandler.handleError(res, error, 'Password change failed');
    }
  }
}