import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../db';
import { users, userSessions, userGroups, userGroupMembers } from '@shared/schema';
import { eq, and, gt, sql } from 'drizzle-orm';
import type { User, InsertUser, UserWithGroups } from '@shared/schema';

export class AuthService {
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
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

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

  // Create session
  static async createSession(userId: number): Promise<string> {
    const sessionToken = this.generateSessionToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db
      .insert(userSessions)
      .values({
        userId,
        sessionToken,
        expiresAt,
      });

    return sessionToken;
  }

  // Validate session
  static async validateSession(sessionToken: string): Promise<User | null> {
    const [session] = await db
      .select({
        user: users,
      })
      .from(userSessions)
      .innerJoin(users, eq(userSessions.userId, users.id))
      .where(
        and(
          eq(userSessions.sessionToken, sessionToken),
          gt(userSessions.expiresAt, new Date()),
          eq(users.isActive, true)
        )
      );

    return session?.user || null;
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