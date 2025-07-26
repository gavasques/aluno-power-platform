import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users, userSessions, userGroups, userGroupMembers } from '@shared/schema';
import { eq, and, gt, sql, lt } from 'drizzle-orm';
import type { User, InsertUser, UserWithGroups } from '@shared/schema';
import { EncryptionService } from '../utils/encryption';
import { AuthError, AuthResponse, handleAuthError } from '../utils/authErrors';

// Enhanced interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

// In-memory store for failed login attempts (TODO: Move to database for production)
const failedAttempts = new Map<string, { count: number; lastAttempt: Date; lockoutUntil?: Date }>();

export class AuthService {
  // Account lockout configuration
  static readonly MAX_LOGIN_ATTEMPTS = 5;
  static readonly LOCKOUT_DURATION_MINUTES = 30;
  static readonly ATTEMPT_WINDOW_MINUTES = 15;

  // Check if account is locked
  static isAccountLocked(email: string): { locked: boolean; minutesRemaining?: number } {
    const attempts = failedAttempts.get(email);
    if (!attempts || !attempts.lockoutUntil) {
      return { locked: false };
    }

    const now = new Date();
    if (now < attempts.lockoutUntil) {
      const minutesRemaining = Math.ceil((attempts.lockoutUntil.getTime() - now.getTime()) / 60000);
      return { locked: true, minutesRemaining };
    }

    // Lockout expired, reset attempts
    failedAttempts.delete(email);
    return { locked: false };
  }

  // Record failed login attempt
  static recordFailedAttempt(email: string): void {
    const now = new Date();
    const attempts = failedAttempts.get(email) || { count: 0, lastAttempt: now };

    // Reset if outside window
    const windowStart = new Date(now.getTime() - this.ATTEMPT_WINDOW_MINUTES * 60000);
    if (attempts.lastAttempt < windowStart) {
      attempts.count = 0;
    }

    attempts.count++;
    attempts.lastAttempt = now;

    // Lock account if exceeded max attempts
    if (attempts.count >= this.MAX_LOGIN_ATTEMPTS) {
      attempts.lockoutUntil = new Date(now.getTime() + this.LOCKOUT_DURATION_MINUTES * 60000);
    }

    failedAttempts.set(email, attempts);
  }

  // Clear failed attempts on successful login
  static clearFailedAttempts(email: string): void {
    failedAttempts.delete(email);
  }

  // Enhanced email validation
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Data sanitization methods
  static sanitizeUser(user: User): User {
    const { password, resetToken, magicLinkToken, ...sanitizedUser } = user;
    return sanitizedUser as User;
  }

  static maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    const maskedUsername = username.length > 2 
      ? username.substring(0, 2) + '***' 
      : '***';
    return `${maskedUsername}@${domain}`;
  }

  static sanitizeError(error: any): string {
    if (typeof error === 'string') {
      return error.replace(/password|token|key/gi, '***');
    }
    return error?.message?.replace(/password|token|key/gi, '***') || 'Unknown error';
  }

  // Enhanced password strength requirements
  static validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 12) {
      errors.push('Password must be at least 12 characters long');
    }

    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

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

  // Hash password with bcrypt
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Compare password with hash
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate session token
  static generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate reset token
  static generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate JWT token
  static generateToken(userId: number): string {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    return jwt.sign({ userId }, secret, { expiresIn: '7d' });
  }

  // Verify JWT token
  static verifyToken(token: string): { userId: number } | null {
    try {
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      const decoded = jwt.verify(token, secret) as { userId: number };
      return decoded;
    } catch (error) {
      return null;
    }
  }

  // Create user
  static async createUser(userData: InsertUser): Promise<User> {
    // Validate password strength
    const passwordValidation = this.validatePasswordStrength(userData.password);
    if (!passwordValidation.valid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    const hashedPassword = await this.hashPassword(userData.password);

    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();

    return user;
  }

  // Authenticate user
  static async authenticateUser(username: string, password: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (!user || !user.isActive) {
      return null;
    }

    const isValidPassword = await this.comparePassword(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    // Update last login
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));

    return user;
  }

  // Enhanced authenticate method with standardized error handling
  static async authenticate(credentials: LoginCredentials): Promise<AuthResponse<{ user: User; token: string }>> {
    try {
      // Input validation
      if (!this.isValidEmail(credentials.email)) {
        throw AuthError.emailInvalid();
      }

      if (!credentials.password || credentials.password.length < 6) {
        throw AuthError.passwordWeak(['Password must be at least 6 characters']);
      }

      const user = await this.authenticateUserByEmail(credentials.email, credentials.password);

      if (!user) {
        throw AuthError.invalidCredentials();
      }

      // Create JWT token instead of session
      const jwtToken = this.generateToken(user.id);

      console.log('AUTH - Successful login for:', this.maskEmail(credentials.email));

      return AuthError.createResponse({
        user: this.sanitizeUser(user),
        token: jwtToken
      }, 'Login successful');

    } catch (error) {
      console.error('AUTH - Authentication error:', this.sanitizeError(error));
      return handleAuthError(error);
    }
  }

  // Enhanced register method with standardized error handling
  static async register(userData: InsertUser): Promise<AuthResponse<{ user: User; token: string }>> {
    try {
      // Input validation
      if (!this.isValidEmail(userData.email)) {
        throw AuthError.emailInvalid();
      }

      const passwordValidation = this.validatePasswordStrength(userData.password);
      if (!passwordValidation.valid) {
        throw AuthError.passwordWeak(passwordValidation.errors);
      }

      // Check if user already exists
      const existingUser = await this.getUserByEmail(userData.email);

      if (existingUser) {
        throw AuthError.userExists();
      }

      // Create user
      const user = await this.createUser({
        ...userData,
        emailVerified: false, // Require email verification
        isActive: true
      });

      // Create JWT token instead of session
      const jwtToken = this.generateToken(user.id);

      console.log('AUTH - New user registered:', this.maskEmail(userData.email));

      return AuthError.createResponse({
        user: this.sanitizeUser(user),
        token: jwtToken
      }, 'Registration successful');

    } catch (error) {
      console.error('AUTH - Registration error:', this.sanitizeError(error));
      return handleAuthError(error);
    }
  }

  // Legacy method - kept for backward compatibility
  static async authenticateUserByEmail(email: string, password: string): Promise<User | null> {
    console.log('🔍 AUTH SERVICE - Searching for user by email:', email);

    // Check if account is locked
    const lockStatus = this.isAccountLocked(email);
    if (lockStatus.locked) {
      console.log('🔍 AUTH SERVICE - Account locked', { email, minutesRemaining: lockStatus.minutesRemaining });
      throw AuthError.accountLocked(lockStatus.minutesRemaining);
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    console.log('🔍 AUTH SERVICE - User search result:', {
      email,
      userFound: !!user,
      userId: user?.id,
      userActive: user?.isActive,
      userRole: user?.role
    });

    if (!user) {
      console.log('🔍 AUTH SERVICE - User not found in database');
      this.recordFailedAttempt(email);
      return null;
    }

    if (!user.isActive) {
      console.log('🔍 AUTH SERVICE - User found but not active');
      return null;
    }

    console.log('🔍 AUTH SERVICE - Comparing passwords for user:', user.email);
    const isValidPassword = await this.comparePassword(password, user.password);

    console.log('🔍 AUTH SERVICE - Password comparison result:', {
      email: user.email,
      isValidPassword
    });

    if (!isValidPassword) {
      console.log('🔍 AUTH SERVICE - Password validation failed');
      this.recordFailedAttempt(email);
      return null;
    }

    // Clear failed attempts on successful login
    this.clearFailedAttempts(email);

    // Update last login
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));

    return user;
  }

  // Get user by ID
  static async getUserById(userId: number): Promise<User | null> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      return user || null;
    } catch (error) {
      console.error('🔍 AUTH SERVICE - Error getting user by ID:', this.sanitizeError(error));
      return null;
    }
  }

  // Create session
  static async createSession(userId: number): Promise<string> {
    const sessionToken = this.generateSessionToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Encrypt the session token before storing
    const encryptedToken = EncryptionService.encrypt(sessionToken);

    await db
      .insert(userSessions)
      .values({
        userId,
        sessionToken: encryptedToken,
        expiresAt,
      });

    // Return the unencrypted token to the user
    return sessionToken;
  }

  // Enhanced session validation with better security
  static async validateSession(sessionToken: string): Promise<User | null> {
    try {
      if (!sessionToken || sessionToken.length !== 64) {
        return null;
      }

      console.log('🔍 VALIDATE SESSION - Starting validation for token:', sessionToken.substring(0, 10) + '...');
      // Get all active sessions
      const sessions = await db
        .select({
          user: users,
          session: userSessions,
        })
        .from(userSessions)
        .innerJoin(users, eq(userSessions.userId, users.id))
        .where(
          and(
            gt(userSessions.expiresAt, new Date()),
            eq(users.isActive, true)
          )
        );

      // Try to find a matching session by comparing tokens (encrypted and unencrypted)
      for (const session of sessions) {
        // First try direct comparison (for unencrypted tokens)
        if (session.session.sessionToken === sessionToken) {
          console.log('🔍 VALIDATE SESSION - Found matching session (direct):', {
            userId: session.user.id,
            userEmail: session.user.email,
            sessionExpiry: session.session.expiresAt
          });
          return session.user;
        }

        // Only try decrypting if the token looks encrypted (contains base64 characters like + or /)
        if (session.session.sessionToken.includes('+') || session.session.sessionToken.includes('/')) {
          try {
            const decryptedToken = EncryptionService.decrypt(session.session.sessionToken);
            if (decryptedToken === sessionToken) {
              console.log('🔍 VALIDATE SESSION - Found matching session (decrypted):', {
                userId: session.user.id,
                userEmail: session.user.email,
                sessionExpiry: session.session.expiresAt
              });
              return session.user;
            }
          } catch (decryptError) {
            // Skip sessions that can't be decrypted
            continue;
          }
        }
      }

      console.log('🔍 VALIDATE SESSION - No matching session found');
      return null;
    } catch (error) {
      console.error('🔍 VALIDATE SESSION - Error:', this.sanitizeError(error));
      return null;
    }
  }

  // Enhanced logout method
  static async logout(token: string): Promise<boolean> {
    try {
      await this.revokeSession(token);
      return true;
    } catch (error) {
      console.error('AUTH - Logout error:', this.sanitizeError(error));
      return false;
    }
  }

  // Get user with groups
  static async getUserWithGroups(userId: number): Promise<UserWithGroups | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return null;
    }

    const groups = await db
      .select({
        id: userGroupMembers.id,
        userId: userGroupMembers.userId,
        groupId: userGroupMembers.groupId,
        addedAt: userGroupMembers.addedAt,
        group: userGroups,
      })
      .from(userGroupMembers)
      .innerJoin(userGroups, eq(userGroupMembers.groupId, userGroups.id))
      .where(eq(userGroupMembers.userId, userId));

    return { ...user, groups };
  }

  // Revoke session
  static async revokeSession(sessionToken: string): Promise<void> {
    await db
      .delete(userSessions)
      .where(eq(userSessions.sessionToken, sessionToken));
  }

  // Revoke all user sessions
  static async revokeAllUserSessions(userId: number): Promise<void> {
    await db
      .delete(userSessions)
      .where(eq(userSessions.userId, userId));
  }

  // Generate password reset token
  static async generatePasswordResetToken(email: string): Promise<string | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      return null;
    }

    const resetToken = this.generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db
      .update(users)
      .set({
        resetToken,
        resetTokenExpiry,
      })
      .where(eq(users.id, user.id));

    return resetToken;
  }

  // Generate password reset code (6 digits)
  static generateResetCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generate password reset code and store in database
  static async generatePasswordResetCode(email: string): Promise<string | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      return null;
    }

    const resetCode = this.generateResetCode();
    const resetCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db
      .update(users)
      .set({
        passwordResetCode: resetCode,
        passwordResetCodeExpiry: resetCodeExpiry,
      })
      .where(eq(users.id, user.id));

    return resetCode;
  }

  // Reset password
  static async resetPassword(resetToken: string, newPassword: string): Promise<boolean> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.resetToken, resetToken),
          gt(users.resetTokenExpiry, new Date())
        )
      );

    if (!user) {
      return false;
    }

    const hashedPassword = await this.hashPassword(newPassword);

    await db
      .update(users)
      .set({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      })
      .where(eq(users.id, user.id));

    return true;
  }

  // Reset password with code
  static async resetPasswordWithCode(email: string, resetCode: string, newPassword: string): Promise<boolean> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, email),
          eq(users.passwordResetCode, resetCode),
          gt(users.passwordResetCodeExpiry, new Date())
        )
      );

    if (!user) {
      return false;
    }

    const hashedPassword = await this.hashPassword(newPassword);

    await db
      .update(users)
      .set({
        password: hashedPassword,
        passwordResetCode: null,
        passwordResetCodeExpiry: null,
      })
      .where(eq(users.id, user.id));

    return true;
  }

  // Verify reset code
  static async verifyResetCode(email: string, resetCode: string): Promise<boolean> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, email),
          eq(users.passwordResetCode, resetCode),
          gt(users.passwordResetCodeExpiry, new Date())
        )
      );

    return !!user;
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    return user || null;
  }

  // Get user by username
  static async getUserByUsername(username: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    return user || null;
  }

  // Update user
  static async updateUser(userId: number, updates: Partial<InsertUser>): Promise<User | null> {
    if (updates.password) {
      updates.password = await this.hashPassword(updates.password);
    }

    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    return user || null;
  }

  // Generate magic link token
  static async generateMagicLinkToken(email: string): Promise<string | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;

    const magicToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db
      .update(users)
      .set({
        magicLinkToken: magicToken,
        magicLinkExpiresAt: expiresAt,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));

    return magicToken;
  }

  // Authenticate with magic link
  static async authenticateWithMagicLink(token: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.magicLinkToken, token),
          gt(users.magicLinkExpiresAt, new Date())
        )
      );

    if (!user) return null;

    // Clear magic link token after use
    await db
      .update(users)
      .set({
        magicLinkToken: null,
        magicLinkExpiresAt: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));

    return user;
  }

  // Clean expired sessions
  static async cleanExpiredSessions(): Promise<void> {
    const now = new Date();
    await db
      .delete(userSessions)
      .where(sql`${userSessions.expiresAt} < ${now}`);
  }
}