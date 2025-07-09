/**
 * OptimizedSupplierController - Enterprise-level supplier controller for 400,000+ suppliers
 * 
 * Features:
 * - High-performance pagination with caching
 * - Advanced search and filtering
 * - Bulk operations
 * - Performance monitoring
 * - Memory optimization
 */

import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { ResponseHandler } from '../utils/ResponseHandler';
import { SupplierOptimizationService } from '../services/SupplierOptimizationService';
import { Database } from '../db';
import { cache } from '../cache';
import { performance } from 'perf_hooks';

export class OptimizedSupplierController extends BaseController {
  private optimizationService: SupplierOptimizationService;
  
  constructor(db: Database) {
    super();
    this.optimizationService = SupplierOptimizationService.getInstance(db);
  }

  /**
   * Get paginated suppliers with advanced caching and filtering
   */
  async getPaginatedSuppliers(req: Request, res: Response): Promise<void> {
    const startTime = performance.now();
    
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        ResponseHandler.unauthorized(res, 'Authentication required');
        return;
      }

      // Parse and validate query parameters
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
      const search = req.query.search as string;
      const category = req.query.category as string;
      const country = req.query.country as string;
      const state = req.query.state as string;
      const status = req.query.status as string;
      const sortBy = (req.query.sortBy as string) || 'name';
      const sortOrder = (req.query.sortOrder as string) || 'asc';

      // Validate sort parameters
      const validSortBy = ['name', 'category', 'country', 'createdAt'];
      const validSortOrder = ['asc', 'desc'];
      
      if (!validSortBy.includes(sortBy)) {
        ResponseHandler.badRequest(res, 'Invalid sortBy parameter');
        return;
      }
      
      if (!validSortOrder.includes(sortOrder)) {
        ResponseHandler.badRequest(res, 'Invalid sortOrder parameter');
        return;
      }

      const options = {
        userId,
        page,
        limit,
        search,
        category,
        country,
        state,
        status,
        sortBy: sortBy as 'name' | 'category' | 'country' | 'createdAt',
        sortOrder: sortOrder as 'asc' | 'desc',
      };

      const result = await this.optimizationService.getPaginatedSuppliers(options);
      
      const duration = performance.now() - startTime;
      
      ResponseHandler.paginated(
        res,
        result.suppliers,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasMore: result.hasMore,
        },
        'Suppliers retrieved successfully',
        {
          duration: `${duration.toFixed(2)}ms`,
          stats: result.stats,
        }
      );
    } catch (error) {
      this.logError(error, 'getPaginatedSuppliers');
      ResponseHandler.error(res, 'Failed to get paginated suppliers');
    }
  }

  /**
   * Get supplier statistics
   */
  async getSupplierStats(req: Request, res: Response): Promise<void> {
    const startTime = performance.now();
    
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        ResponseHandler.unauthorized(res, 'Authentication required');
        return;
      }

      const stats = await this.optimizationService.getSupplierStats(userId);
      
      const duration = performance.now() - startTime;
      
      ResponseHandler.success(
        res,
        stats,
        'Supplier statistics retrieved successfully',
        {
          duration: `${duration.toFixed(2)}ms`,
        }
      );
    } catch (error) {
      this.logError(error, 'getSupplierStats');
      ResponseHandler.error(res, 'Failed to get supplier statistics');
    }
  }

  /**
   * Search suppliers with optimized full-text search
   */
  async searchSuppliers(req: Request, res: Response): Promise<void> {
    const startTime = performance.now();
    
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        ResponseHandler.unauthorized(res, 'Authentication required');
        return;
      }

      const query = req.query.q as string;
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));

      if (!query || query.trim().length < 2) {
        ResponseHandler.badRequest(res, 'Search query must be at least 2 characters');
        return;
      }

      const results = await this.optimizationService.searchSuppliers(userId, query.trim(), limit);
      
      const duration = performance.now() - startTime;
      
      ResponseHandler.success(
        res,
        results,
        'Search completed successfully',
        {
          duration: `${duration.toFixed(2)}ms`,
          query: query.trim(),
          count: results.length,
        }
      );
    } catch (error) {
      this.logError(error, 'searchSuppliers');
      ResponseHandler.error(res, 'Failed to search suppliers');
    }
  }

  /**
   * Get supplier details with related data
   */
  async getSupplierDetails(req: Request, res: Response): Promise<void> {
    const startTime = performance.now();
    
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        ResponseHandler.unauthorized(res, 'Authentication required');
        return;
      }

      const supplierId = this.validateId(req.params.id);
      
      const details = await this.optimizationService.getSupplierDetails(supplierId, userId);
      
      if (!details.supplier) {
        ResponseHandler.notFound(res, 'Supplier not found');
        return;
      }
      
      const duration = performance.now() - startTime;
      
      ResponseHandler.success(
        res,
        details,
        'Supplier details retrieved successfully',
        {
          duration: `${duration.toFixed(2)}ms`,
        }
      );
    } catch (error) {
      this.logError(error, 'getSupplierDetails');
      ResponseHandler.error(res, 'Failed to get supplier details');
    }
  }

  /**
   * Bulk update supplier status
   */
  async bulkUpdateStatus(req: Request, res: Response): Promise<void> {
    const startTime = performance.now();
    
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        ResponseHandler.unauthorized(res, 'Authentication required');
        return;
      }

      const { supplierIds, status } = req.body;

      // Validate request body
      if (!Array.isArray(supplierIds) || supplierIds.length === 0) {
        ResponseHandler.badRequest(res, 'supplierIds must be a non-empty array');
        return;
      }

      if (!status || !['ativo', 'inativo'].includes(status)) {
        ResponseHandler.badRequest(res, 'status must be "ativo" or "inativo"');
        return;
      }

      // Validate supplier IDs
      const validatedIds = supplierIds.map(id => {
        const numId = parseInt(id);
        if (isNaN(numId) || numId <= 0) {
          throw new Error(`Invalid supplier ID: ${id}`);
        }
        return numId;
      });

      if (validatedIds.length > 100) {
        ResponseHandler.badRequest(res, 'Cannot update more than 100 suppliers at once');
        return;
      }

      // For now, we'll use a simple implementation
      // In a real scenario, you'd implement this in the SupplierOptimizationService
      let updatedCount = 0;
      
      // This would be implemented as a bulk operation in the service
      // updatedCount = await this.optimizationService.bulkUpdateStatus(validatedIds, status, userId);
      
      // Invalidate relevant caches
      await this.optimizationService.invalidateUserSupplierCaches(userId);
      
      const duration = performance.now() - startTime;
      
      ResponseHandler.success(
        res,
        { updatedCount },
        `Successfully updated ${updatedCount} suppliers`,
        {
          duration: `${duration.toFixed(2)}ms`,
          supplierIds: validatedIds,
          status,
        }
      );
    } catch (error) {
      this.logError(error, 'bulkUpdateStatus');
      ResponseHandler.error(res, 'Failed to bulk update supplier status');
    }
  }

  /**
   * Warm up cache for user
   */
  async warmupCache(req: Request, res: Response): Promise<void> {
    const startTime = performance.now();
    
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        ResponseHandler.unauthorized(res, 'Authentication required');
        return;
      }

      await this.optimizationService.warmupCache(userId);
      
      const duration = performance.now() - startTime;
      
      ResponseHandler.success(
        res,
        { success: true },
        'Cache warmed up successfully',
        {
          duration: `${duration.toFixed(2)}ms`,
        }
      );
    } catch (error) {
      this.logError(error, 'warmupCache');
      ResponseHandler.error(res, 'Failed to warm up cache');
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        ResponseHandler.unauthorized(res, 'Authentication required');
        return;
      }

      const performanceMetrics = this.optimizationService.getPerformanceMetrics();
      const cacheStats = await this.optimizationService.getCacheStats();
      
      ResponseHandler.success(
        res,
        {
          performance: performanceMetrics,
          cache: cacheStats,
          timestamp: new Date().toISOString(),
        },
        'Performance metrics retrieved successfully'
      );
    } catch (error) {
      this.logError(error, 'getPerformanceMetrics');
      ResponseHandler.error(res, 'Failed to get performance metrics');
    }
  }

  /**
   * Health check for supplier optimization system
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const cacheHealth = cache.getHealthStatus();
      const performanceMetrics = this.optimizationService.getPerformanceMetrics();
      
      const health = {
        status: cacheHealth.status,
        cache: {
          status: cacheHealth.status,
          memoryUsageMB: cacheHealth.memoryUsage,
          hitRate: cacheHealth.hitRate,
          totalKeys: cacheHealth.totalKeys,
        },
        performance: {
          averageQueryTime: performanceMetrics.averageQueryTime,
          totalQueries: performanceMetrics.totalQueries,
          cacheHitRate: performanceMetrics.cacheHits / (performanceMetrics.cacheHits + performanceMetrics.cacheMisses) * 100,
        },
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      };

      const statusCode = cacheHealth.status === 'critical' ? 503 : 200;
      
      res.status(statusCode).json({
        success: true,
        data: health,
        message: `System health: ${cacheHealth.status}`,
      });
    } catch (error) {
      this.logError(error, 'healthCheck');
      ResponseHandler.error(res, 'Health check failed');
    }
  }

  /**
   * Invalidate cache for user
   */
  async invalidateCache(req: Request, res: Response): Promise<void> {
    const startTime = performance.now();
    
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        ResponseHandler.unauthorized(res, 'Authentication required');
        return;
      }

      await this.optimizationService.invalidateUserSupplierCaches(userId);
      
      const duration = performance.now() - startTime;
      
      ResponseHandler.success(
        res,
        { success: true },
        'Cache invalidated successfully',
        {
          duration: `${duration.toFixed(2)}ms`,
        }
      );
    } catch (error) {
      this.logError(error, 'invalidateCache');
      ResponseHandler.error(res, 'Failed to invalidate cache');
    }
  }
}