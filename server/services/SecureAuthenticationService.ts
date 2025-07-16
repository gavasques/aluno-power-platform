import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../db';
import { users, userSessions } from '@shared/schema';
import { eq, and, gt, lt } from 'drizzle-orm';
import type { User, InsertUser } from '@shared/schema';

export interface AuthenticationResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Repository pattern for user data access
class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    return user || null;
  }

  async findById(id: number): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    
    return user || null;
  }

  async create(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    
    return user;
  }

  async updateLastLogin(userId: number): Promise<void> {
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, userId));
  }
}

// Repository pattern for session management
class SessionRepository {
  async createSession(userId: number, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await db
      .insert(userSessions)
      .values({
        userId,
        sessionToken: token,
        expiresAt
      });
  }

  async validateSession(token: string): Promise<{ userId: number } | null> {
    const [session] = await db
      .select()
      .from(userSessions)
      .where(
        and(
          eq(userSessions.sessionToken, token),
          gt(userSessions.expiresAt, new Date())
        )
      );

    return session ? { userId: session.userId } : null;
  }

  async invalidateSession(token: string): Promise<void> {
    await db
      .delete(userSessions)
      .where(eq(userSessions.sessionToken, token));
  }

  async cleanupExpiredSessions(): Promise<void> {
    await db
      .delete(userSessions)
      .where(lt(userSessions.expiresAt, new Date()));
  }
}

// Single Responsibility: Authentication only
export class SecureAuthenticationService {
  private userRepository: UserRepository;
  private sessionRepository: SessionRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.sessionRepository = new SessionRepository();
  }

  async authenticate(credentials: LoginCredentials): Promise<AuthenticationResult> {
    try {
      // Input validation
      if (!this.isValidEmail(credentials.email)) {
        return { success: false, error: 'Invalid email format' };
      }

      if (!credentials.password || credentials.password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      // Find user by email
      const user = await this.userRepository.findByEmail(credentials.email);
      
      if (!user) {
        console.log('AUTH - User not found:', this.maskEmail(credentials.email));
        return { success: false, error: 'Invalid credentials' };
      }

      if (!user.isActive) {
        console.log('AUTH - User inactive:', this.maskEmail(credentials.email));
        return { success: false, error: 'Account is inactive' };
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(credentials.password, user.password);
      
      if (!isValidPassword) {
        console.log('AUTH - Invalid password for:', this.maskEmail(credentials.email));
        return { success: false, error: 'Invalid credentials' };
      }

      // Update last login
      await this.userRepository.updateLastLogin(user.id);

      // Create session with regenerated token
      const sessionToken = this.generateSecureToken();
      await this.sessionRepository.createSession(user.id, sessionToken);

      console.log('AUTH - Successful login for:', this.maskEmail(credentials.email));
      
      return {
        success: true,
        user: this.sanitizeUser(user),
        token: sessionToken
      };

    } catch (error) {
      console.error('AUTH - Authentication error:', this.sanitizeError(error));
      return { 
        success: false, 
        error: 'Authentication failed' 
      };
    }
  }

  async validateSession(token: string): Promise<User | null> {
    try {
      if (!token || token.length !== 64) {
        return null;
      }

      const session = await this.sessionRepository.validateSession(token);
      
      if (!session) {
        return null;
      }

      const user = await this.userRepository.findById(session.userId);
      
      if (!user || !user.isActive) {
        // Clean up invalid session
        await this.sessionRepository.invalidateSession(token);
        return null;
      }

      return this.sanitizeUser(user);

    } catch (error) {
      console.error('AUTH - Session validation error:', this.sanitizeError(error));
      return null;
    }
  }

  async logout(token: string): Promise<boolean> {
    try {
      await this.sessionRepository.invalidateSession(token);
      return true;
    } catch (error) {
      console.error('AUTH - Logout error:', this.sanitizeError(error));
      return false;
    }
  }

  async register(userData: InsertUser): Promise<AuthenticationResult> {
    try {
      // Input validation
      if (!this.isValidEmail(userData.email)) {
        return { success: false, error: 'Invalid email format' };
      }

      const passwordValidation = this.validatePasswordStrength(userData.password);
      if (!passwordValidation.valid) {
        return { 
          success: false, 
          error: `Password requirements not met: ${passwordValidation.errors.join(', ')}` 
        };
      }

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(userData.email);
      
      if (existingUser) {
        return { 
          success: false, 
          error: 'User already exists' 
        };
      }

      // Hash password with secure settings
      const hashedPassword = await this.hashPassword(userData.password);
      
      // Create user
      const user = await this.userRepository.create({
        ...userData,
        password: hashedPassword,
        emailVerified: false, // Require email verification
        isActive: true
      });

      // Create session
      const sessionToken = this.generateSecureToken();
      await this.sessionRepository.createSession(user.id, sessionToken);

      console.log('AUTH - New user registered:', this.maskEmail(userData.email));

      return {
        success: true,
        user: this.sanitizeUser(user),
        token: sessionToken
      };

    } catch (error) {
      console.error('AUTH - Registration error:', this.sanitizeError(error));
      return { 
        success: false, 
        error: 'Registration failed' 
      };
    }
  }

  // Password utilities with enhanced security
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12; // Increased from default
    return bcrypt.hash(password, saltRounds);
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Data sanitization methods
  private sanitizeUser(user: User): User {
    const { password, resetToken, magicLinkToken, ...sanitizedUser } = user;
    return sanitizedUser as User;
  }

  private maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    const maskedUsername = username.length > 2 
      ? username.substring(0, 2) + '***' 
      : '***';
    return `${maskedUsername}@${domain}`;
  }

  private sanitizeError(error: any): string {
    if (typeof error === 'string') {
      return error.replace(/password|token|key/gi, '***');
    }
    return error?.message?.replace(/password|token|key/gi, '***') || 'Unknown error';
  }

  // Enhanced validation methods
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Must be at least 8 characters long');
    }
    
    if (password.length > 128) {
      errors.push('Must be less than 128 characters');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Must contain at least one number');
    }
    
    // Special characters no longer required
    // if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    //   errors.push('Must contain at least one special character');
    // }

    // Check for common weak passwords
    const commonPasswords = ['password', '123456', 'qwerty', 'admin'];
    if (commonPasswords.some(weak => password.toLowerCase().includes(weak))) {
      errors.push('Cannot contain common weak patterns');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Session cleanup utility
  async cleanupExpiredSessions(): Promise<void> {
    try {
      await this.sessionRepository.cleanupExpiredSessions();
    } catch (error) {
      console.error('AUTH - Session cleanup error:', this.sanitizeError(error));
    }
  }
}