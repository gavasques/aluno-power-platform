/**
 * AdminController - Phase 6: Admin & Content Modularization
 * 
 * SOLID Principles Applied:
 * - SRP: Single responsibility for administrative operations (dashboard, users, analytics)
 * - OCP: Open for extension without modification of existing code
 * - LSP: Consistent with BaseController interface
 * - ISP: Focused interface for administrative operations only
 * - DIP: Depends on abstractions (BaseController, storage interfaces)
 * 
 * DRY/KISS Implementation:
 * - Eliminates code duplication from monolithic routes.ts
 * - Consistent error handling and response patterns
 * - Clean, readable, maintainable administrative logic
 */

import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { ResponseHandler } from '../utils/ResponseHandler';
import { ValidationHelper } from '../utils/ValidationHelper';
import * as storage from '../storage';

export class AdminController extends BaseController {
  
  /**
   * PHASE 6: Dashboard Statistics
   * Consolidates all administrative dashboard analytics
   * 
   * GET /api/admin/dashboard-stats
   */
  async getDashboardStats(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    console.log('📊 [ADMIN_DASHBOARD] Fetching dashboard statistics...');

    try {
      // Get comprehensive dashboard statistics
      const stats = {
        // User statistics
        totalUsers: await this.getTotalUsers(),
        activeUsers: await this.getActiveUsers(),
        newUsersThisMonth: await this.getNewUsersThisMonth(),
        
        // Content statistics  
        totalNews: await this.getTotalNews(),
        publishedNews: await this.getPublishedNews(),
        totalVideos: await this.getTotalVideos(),
        
        // System statistics
        totalProducts: await this.getTotalProducts(),
        totalSuppliers: await this.getTotalSuppliers(),
        totalMaterials: await this.getTotalMaterials(),
        
        // Activity metrics
        lastSyncDate: await this.getLastYouTubeSyncDate(),
        systemHealth: 'healthy'
      };

      const duration = Date.now() - startTime;
      console.log(`✅ [ADMIN_DASHBOARD] Dashboard stats fetched in ${duration}ms`);

      ResponseHandler.success(res, stats, 'Dashboard statistics retrieved successfully');
      
    } catch (error) {
      console.error('❌ [ADMIN_DASHBOARD] Error fetching dashboard stats:', error);
      ResponseHandler.error(res, 'Failed to fetch dashboard statistics');
    }
  }

  /**
   * PHASE 6: User Management
   * Get all users with optional filtering and pagination
   * 
   * GET /api/users
   */
  async getUsers(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    console.log('👥 [ADMIN_USERS] Fetching users list...');

    try {
      const { page = 1, limit = 50, search, role, status } = req.query;
      
      // Validate pagination parameters
      const validatedPagination = ValidationHelper.validatePagination(
        Number(page), 
        Number(limit)
      );

      const users = await storage.getUsers({
        page: validatedPagination.page,
        limit: validatedPagination.limit,
        search: search as string,
        role: role as string,
        status: status as string
      });

      const duration = Date.now() - startTime;
      console.log(`✅ [ADMIN_USERS] Users list fetched in ${duration}ms - ${users.length} users`);

      ResponseHandler.success(res, users, 'Users retrieved successfully');
      
    } catch (error) {
      console.error('❌ [ADMIN_USERS] Error fetching users:', error);
      ResponseHandler.error(res, 'Failed to fetch users');
    }
  }

  /**
   * PHASE 6: User Details
   * Get specific user by ID with full details
   * 
   * GET /api/users/:id
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const userId = req.params.id;
    console.log(`👤 [ADMIN_USER] Fetching user details for ID: ${userId}`);

    try {
      const userIdNumber = ValidationHelper.parseId(userId);
      const user = await storage.getUser(userIdNumber);

      if (!user) {
        console.log(`❌ [ADMIN_USER] User not found: ${userId}`);
        ResponseHandler.notFound(res, 'User not found');
        return;
      }

      // Get additional user data
      const userDetails = {
        ...user,
        groups: await storage.getUserGroups(userIdNumber),
        lastLoginDate: await storage.getUserLastLogin(userIdNumber),
        totalProducts: await storage.getUserProductCount(userIdNumber),
        totalSuppliers: await storage.getUserSupplierCount(userIdNumber)
      };

      const duration = Date.now() - startTime;
      console.log(`✅ [ADMIN_USER] User details fetched in ${duration}ms for: ${user.email}`);

      ResponseHandler.success(res, userDetails, 'User details retrieved successfully');
      
    } catch (error) {
      console.error(`❌ [ADMIN_USER] Error fetching user ${userId}:`, error);
      ResponseHandler.error(res, 'Failed to fetch user details');
    }
  }

  /**
   * PHASE 6: User Groups
   * Get user groups and permissions
   * 
   * GET /api/users/:id/groups
   */
  async getUserGroups(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const userId = req.params.id;
    console.log(`🔒 [ADMIN_USER_GROUPS] Fetching groups for user: ${userId}`);

    try {
      const userIdNumber = ValidationHelper.parseId(userId);
      
      const user = await storage.getUser(userIdNumber);
      if (!user) {
        ResponseHandler.notFound(res, 'User not found');
        return;
      }

      const groups = await storage.getUserGroups(userIdNumber);
      const permissions = await storage.getUserPermissions(userIdNumber);

      const groupsData = {
        userId: userIdNumber,
        userEmail: user.email,
        groups,
        permissions,
        totalGroups: groups.length,
        totalPermissions: permissions.length
      };

      const duration = Date.now() - startTime;
      console.log(`✅ [ADMIN_USER_GROUPS] Groups fetched in ${duration}ms - ${groups.length} groups`);

      ResponseHandler.success(res, groupsData, 'User groups retrieved successfully');
      
    } catch (error) {
      console.error(`❌ [ADMIN_USER_GROUPS] Error fetching groups for user ${userId}:`, error);
      ResponseHandler.error(res, 'Failed to fetch user groups');
    }
  }

  /**
   * PHASE 6: Create New User
   * Administrative user creation with validation
   * 
   * POST /api/users
   */
  async createUser(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    console.log('➕ [ADMIN_CREATE_USER] Creating new user...');

    try {
      const userData = req.body;
      
      // Validate required fields
      const validationErrors = ValidationHelper.validateUserData(userData);
      if (validationErrors.length > 0) {
        ResponseHandler.badRequest(res, 'Validation failed', { errors: validationErrors });
        return;
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        ResponseHandler.conflict(res, 'User with this email already exists');
        return;
      }

      const newUser = await storage.createUser(userData);

      const duration = Date.now() - startTime;
      console.log(`✅ [ADMIN_CREATE_USER] User created in ${duration}ms: ${newUser.email}`);

      ResponseHandler.created(res, newUser, 'User created successfully');
      
    } catch (error) {
      console.error('❌ [ADMIN_CREATE_USER] Error creating user:', error);
      ResponseHandler.error(res, 'Failed to create user');
    }
  }

  /**
   * PHASE 6: Update User
   * Administrative user updates with role management
   * 
   * PUT /api/users/:id
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const userId = req.params.id;
    console.log(`✏️ [ADMIN_UPDATE_USER] Updating user: ${userId}`);

    try {
      const userIdNumber = ValidationHelper.parseId(userId);
      const updateData = req.body;

      const existingUser = await storage.getUser(userIdNumber);
      if (!existingUser) {
        ResponseHandler.notFound(res, 'User not found');
        return;
      }

      const updatedUser = await storage.updateUser(userIdNumber, updateData);

      const duration = Date.now() - startTime;
      console.log(`✅ [ADMIN_UPDATE_USER] User updated in ${duration}ms: ${updatedUser.email}`);

      ResponseHandler.success(res, updatedUser, 'User updated successfully');
      
    } catch (error) {
      console.error(`❌ [ADMIN_UPDATE_USER] Error updating user ${userId}:`, error);
      ResponseHandler.error(res, 'Failed to update user');
    }
  }

  /**
   * PHASE 6: Delete User
   * Administrative user deletion with safety checks
   * 
   * DELETE /api/users/:id
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const userId = req.params.id;
    console.log(`🗑️ [ADMIN_DELETE_USER] Deleting user: ${userId}`);

    try {
      const userIdNumber = ValidationHelper.parseId(userId);
      
      const user = await storage.getUser(userIdNumber);
      if (!user) {
        ResponseHandler.notFound(res, 'User not found');
        return;
      }

      // Safety check: prevent deletion of admin users
      if (user.role === 'admin') {
        ResponseHandler.forbidden(res, 'Cannot delete admin users');
        return;
      }

      await storage.deleteUser(userIdNumber);

      const duration = Date.now() - startTime;
      console.log(`✅ [ADMIN_DELETE_USER] User deleted in ${duration}ms: ${user.email}`);

      ResponseHandler.success(res, null, 'User deleted successfully');
      
    } catch (error) {
      console.error(`❌ [ADMIN_DELETE_USER] Error deleting user ${userId}:`, error);
      ResponseHandler.error(res, 'Failed to delete user');
    }
  }

  // Private helper methods for dashboard statistics
  private async getTotalUsers(): Promise<number> {
    return await storage.getUserCount();
  }

  private async getActiveUsers(): Promise<number> {
    return await storage.getActiveUserCount();
  }

  private async getNewUsersThisMonth(): Promise<number> {
    return await storage.getNewUsersThisMonth();
  }

  private async getTotalNews(): Promise<number> {
    return await storage.getNewsCount();
  }

  private async getPublishedNews(): Promise<number> {
    return await storage.getPublishedNewsCount();
  }

  private async getTotalVideos(): Promise<number> {
    return await storage.getYouTubeVideoCount();
  }

  private async getTotalProducts(): Promise<number> {
    return await storage.getProductCount();
  }

  private async getTotalSuppliers(): Promise<number> {
    return await storage.getSupplierCount();
  }

  private async getTotalMaterials(): Promise<number> {
    return await storage.getMaterialCount();
  }

  private async getLastYouTubeSyncDate(): Promise<string | null> {
    return await storage.getLastYouTubeSyncDate();
  }
}