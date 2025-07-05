import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../db';
import { users, userSessions, userGroups, userGroupMembers } from '@shared/schema';
import { eq, and, gt, sql } from 'drizzle-orm';
import type { User, InsertUser, UserWithGroups } from '@shared/schema';
import { EncryptionService } from '../utils/encryption';

// In-memory store for failed login attempts (in production, use Redis or database)
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
  // Password strength requirements
  static validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 12) {
      errors.push('Password must be at least 12 characters long');
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

  // Authenticate by email
  static async authenticateUserByEmail(email: string, password: string): Promise<User | null> {
    console.log('🔍 AUTH SERVICE - Searching for user by email:', email);
    
    // Check if account is locked
    const lockStatus = this.isAccountLocked(email);
    if (lockStatus.locked) {
      console.log('🔍 AUTH SERVICE - Account locked', { email, minutesRemaining: lockStatus.minutesRemaining });
      throw new Error(`Account locked due to too many failed login attempts. Try again in ${lockStatus.minutesRemaining} minutes.`);
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

  // Validate session
  static async validateSession(sessionToken: string): Promise<User | null> {
    console.log('🔍 VALIDATE SESSION - Starting validation for token:', sessionToken.substring(0, 10) + '...');
    
    try {
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

      // Try to find a matching session by decrypting stored tokens
      for (const session of sessions) {
        try {
          const decryptedToken = EncryptionService.decrypt(session.session.sessionToken);
          if (decryptedToken === sessionToken) {
            console.log('🔍 VALIDATE SESSION - Found matching session:', {
              userId: session.user.id,
              userEmail: session.user.email,
              sessionExpiry: session.session.expiresAt
            });
            return session.user;
          }
        } catch (decryptError) {
          // Skip sessions that can't be decrypted (may be from before encryption was implemented)
          continue;
        }
      }

      console.log('🔍 VALIDATE SESSION - No matching session found');
      return null;
    } catch (error) {
      console.error('🔍 VALIDATE SESSION - Error:', error);
      return null;
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