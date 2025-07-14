/**
 * SupplierOptimizationService - Enterprise optimization service for 400,000+ suppliers
 * 
 * Features:
 * - Intelligent caching strategies
 * - Optimized database queries
 * - Performance monitoring
 * - Memory management
 * - Bulk operations support
 */

import { Database } from '../db';
import { suppliers, supplierContacts, supplierBrands, supplierFiles } from '@shared/schema';
import { eq, and, desc, asc, like, ilike, or, sql, count } from 'drizzle-orm';
import { cache } from '../cache';
import { performance } from 'perf_hooks';

interface PaginationOptions {
  userId: number;
  page: number;
  limit: number;
  search?: string;
  category?: string;
  country?: string;
  state?: string;
  status?: string;
  sortBy: 'name' | 'category' | 'country' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

interface SupplierStats {
  total: number;
  verified: number;
  byCategory: Record<string, number>;
  byCountry: Record<string, number>;
  byStatus: Record<string, number>;
  activeSuppliers: number;
}

interface PaginatedSuppliersResult {
  suppliers: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  stats: SupplierStats;
}

interface PerformanceMetrics {
  cacheHits: number;
  cacheMisses: number;
  averageQueryTime: number;
  totalQueries: number;
  lastOptimization: Date;
}

export class SupplierOptimizationService {
  private static instance: SupplierOptimizationService;
  private db: Database;
  private performanceMetrics: PerformanceMetrics;

  private constructor(db: Database) {
    this.db = db;
    this.performanceMetrics = {
      cacheHits: 0,
      cacheMisses: 0,
      averageQueryTime: 0,
      totalQueries: 0,
      lastOptimization: new Date(),
    };
  }

  static getInstance(db: Database): SupplierOptimizationService {
    if (!SupplierOptimizationService.instance) {
      SupplierOptimizationService.instance = new SupplierOptimizationService(db);
    }
    return SupplierOptimizationService.instance;
  }

  /**
   * Get paginated suppliers with advanced caching
   */
  async getPaginatedSuppliers(options: PaginationOptions): Promise<PaginatedSuppliersResult> {
    const startTime = performance.now();
    
    try {
      // Generate cache key
      const cacheKey = this.generateCacheKey('paginated_suppliers', options);
      
      // Try to get from cache first
      const cachedResult = await cache.get<PaginatedSuppliersResult>(cacheKey);
      if (cachedResult) {
        this.performanceMetrics.cacheHits++;
        return cachedResult;
      }
      
      this.performanceMetrics.cacheMisses++;
      
      // Build dynamic query
      const baseQuery = this.db
        .select({
          id: suppliers.id,
          tradeName: suppliers.tradeName,
          corporateName: suppliers.corporateName,
          category: suppliers.category,
          country: suppliers.country,
          state: suppliers.state,
          city: suppliers.city,
          status: suppliers.status,
          isVerified: suppliers.isVerified,
          phone: suppliers.phone,
          email: suppliers.email,
          website: suppliers.website,
          averageRating: suppliers.averageRating,
          totalReviews: suppliers.totalReviews,
          createdAt: suppliers.createdAt,
          updatedAt: suppliers.updatedAt,
        })
        .from(suppliers)
        .where(eq(suppliers.userId, options.userId));

      // Apply filters
      const conditions = [eq(suppliers.userId, options.userId)];
      
      if (options.search) {
        conditions.push(
          or(
            ilike(suppliers.tradeName, `%${options.search}%`),
            ilike(suppliers.corporateName, `%${options.search}%`),
            ilike(suppliers.email, `%${options.search}%`)
          )
        );
      }
      
      if (options.category) {
        conditions.push(eq(suppliers.category, options.category));
      }
      
      if (options.country) {
        conditions.push(eq(suppliers.country, options.country));
      }
      
      if (options.state) {
        conditions.push(eq(suppliers.state, options.state));
      }
      
      if (options.status) {
        conditions.push(eq(suppliers.status, options.status));
      }

      // Apply all conditions
      const query = baseQuery.where(and(...conditions));

      // Apply sorting
      const sortColumn = this.getSortColumn(options.sortBy);
      const sortDirection = options.sortOrder === 'desc' ? desc : asc;
      const sortedQuery = query.orderBy(sortDirection(sortColumn));

      // Execute paginated query
      const offset = (options.page - 1) * options.limit;
      const paginatedQuery = sortedQuery.limit(options.limit).offset(offset);
      
      // Execute queries in parallel
      const [suppliersData, totalCountResult] = await Promise.all([
        paginatedQuery,
        this.db.select({ count: count() }).from(suppliers).where(and(...conditions)),
      ]);

      const total = totalCountResult[0]?.count || 0;
      const totalPages = Math.ceil(total / options.limit);
      const hasMore = options.page < totalPages;

      // Get stats for this user
      const stats = await this.getSupplierStats(options.userId);

      const result: PaginatedSuppliersResult = {
        suppliers: suppliersData,
        total,
        page: options.page,
        limit: options.limit,
        totalPages,
        hasMore,
        stats,
      };

      // Cache result for 2 minutes
      await cache.set(cacheKey, result, 120);

      const duration = performance.now() - startTime;
      this.updatePerformanceMetrics(duration);

      return result;
    } catch (error) {
      console.error('Error in getPaginatedSuppliers:', error);
      throw error;
    }
  }

  /**
   * Get supplier statistics with caching
   */
  async getSupplierStats(userId: number): Promise<SupplierStats> {
    const cacheKey = `supplier_stats:${userId}`;
    
    // Try cache first
    const cachedStats = await cache.get<SupplierStats>(cacheKey);
    if (cachedStats) {
      return cachedStats;
    }

    try {
      // Execute stats query
      const statsQuery = await this.db
        .select({
          total: count(),
          verified: sql<number>`COUNT(*) FILTER (WHERE ${suppliers.isVerified} = true)`,
          active: sql<number>`COUNT(*) FILTER (WHERE ${suppliers.status} = 'ativo')`,
          category: suppliers.category,
          country: suppliers.country,
          status: suppliers.status,
        })
        .from(suppliers)
        .where(eq(suppliers.userId, userId));

      // Process results into stats structure
      const stats: SupplierStats = {
        total: 0,
        verified: 0,
        activeSuppliers: 0,
        byCategory: {},
        byCountry: {},
        byStatus: {},
      };

      if (statsQuery.length > 0) {
        const firstRow = statsQuery[0];
        stats.total = firstRow.total || 0;
        stats.verified = firstRow.verified || 0;
        stats.activeSuppliers = firstRow.active || 0;
      }

      // Get category, country, and status breakdowns
      const [categoryStats, countryStats, statusStats] = await Promise.all([
        this.db
          .select({
            category: suppliers.category,
            count: count(),
          })
          .from(suppliers)
          .where(eq(suppliers.userId, userId))
          .groupBy(suppliers.category),
        
        this.db
          .select({
            country: suppliers.country,
            count: count(),
          })
          .from(suppliers)
          .where(eq(suppliers.userId, userId))
          .groupBy(suppliers.country),
        
        this.db
          .select({
            status: suppliers.status,
            count: count(),
          })
          .from(suppliers)
          .where(eq(suppliers.userId, userId))
          .groupBy(suppliers.status),
      ]);

      // Process breakdowns
      categoryStats.forEach(row => {
        if (row.category) {
          stats.byCategory[row.category] = row.count;
        }
      });

      countryStats.forEach(row => {
        if (row.country) {
          stats.byCountry[row.country] = row.count;
        }
      });

      statusStats.forEach(row => {
        if (row.status) {
          stats.byStatus[row.status] = row.count;
        }
      });

      // Cache for 10 minutes
      await cache.set(cacheKey, stats, 600);

      return stats;
    } catch (error) {
      console.error('Error in getSupplierStats:', error);
      throw error;
    }
  }

  /**
   * Search suppliers with optimized full-text search
   */
  async searchSuppliers(userId: number, query: string, limit: number = 20): Promise<any[]> {
    const cacheKey = `supplier_search:${userId}:${query}:${limit}`;
    
    // Try cache first
    const cachedResults = await cache.get<any[]>(cacheKey);
    if (cachedResults) {
      return cachedResults;
    }

    try {
      const searchResults = await this.db
        .select({
          id: suppliers.id,
          tradeName: suppliers.tradeName,
          corporateName: suppliers.corporateName,
          category: suppliers.category,
          country: suppliers.country,
          state: suppliers.state,
          email: suppliers.email,
          phone: suppliers.phone,
          status: suppliers.status,
          isVerified: suppliers.isVerified,
        })
        .from(suppliers)
        .where(
          and(
            eq(suppliers.userId, userId),
            or(
              ilike(suppliers.tradeName, `%${query}%`),
              ilike(suppliers.corporateName, `%${query}%`),
              ilike(suppliers.email, `%${query}%`),
              ilike(suppliers.category, `%${query}%`)
            )
          )
        )
        .orderBy(desc(suppliers.isVerified), asc(suppliers.tradeName))
        .limit(limit);

      // Cache for 3 minutes
      await cache.set(cacheKey, searchResults, 180);

      return searchResults;
    } catch (error) {
      console.error('Error in searchSuppliers:', error);
      throw error;
    }
  }

  /**
   * Get supplier details with related data
   */
  async getSupplierDetails(supplierId: number, userId: number): Promise<any> {
    const cacheKey = `supplier_details:${supplierId}:${userId}`;
    
    // Try cache first
    const cachedDetails = await cache.get<any>(cacheKey);
    if (cachedDetails) {
      return cachedDetails;
    }

    try {
      // Get supplier basic info
      const supplier = await this.db
        .select()
        .from(suppliers)
        .where(and(eq(suppliers.id, supplierId), eq(suppliers.userId, userId)))
        .limit(1);

      if (supplier.length === 0) {
        return { supplier: null };
      }

      // Get related data in parallel
      const [contacts, brands, files] = await Promise.all([
        this.db
          .select()
          .from(supplierContacts)
          .where(eq(supplierContacts.supplierId, supplierId)),
        
        this.db
          .select()
          .from(supplierBrands)
          .where(eq(supplierBrands.supplierId, supplierId)),
        
        this.db
          .select()
          .from(supplierFiles)
          .where(eq(supplierFiles.supplierId, supplierId)),
      ]);

      const details = {
        supplier: supplier[0],
        contacts,
        brands,
        files,
      };

      // Cache for 5 minutes
      await cache.set(cacheKey, details, 300);

      return details;
    } catch (error) {
      console.error('Error in getSupplierDetails:', error);
      throw error;
    }
  }

  /**
   * Warm up cache for user
   */
  async warmupCache(userId: number): Promise<void> {
    try {
      console.log(`🔥 Warming up cache for user ${userId}...`);
      
      // Warm up common queries
      await Promise.all([
        this.getSupplierStats(userId),
        this.getPaginatedSuppliers({
          userId,
          page: 1,
          limit: 50,
          sortBy: 'name',
          sortOrder: 'asc',
        }),
        this.getPaginatedSuppliers({
          userId,
          page: 1,
          limit: 50,
          status: 'ativo',
          sortBy: 'name',
          sortOrder: 'asc',
        }),
      ]);

      console.log(`✅ Cache warmed up for user ${userId}`);
    } catch (error) {
      console.error('Error warming up cache:', error);
      throw error;
    }
  }

  /**
   * Invalidate user supplier caches
   */
  async invalidateUserSupplierCaches(userId: number): Promise<void> {
    try {
      // Delete cache patterns for this user
      await cache.deletePattern(`supplier_stats:${userId}`);
      await cache.deletePattern(`supplier_search:${userId}:*`);
      await cache.deletePattern(`supplier_details:*:${userId}`);
      await cache.deletePattern(`paginated_suppliers:*:${userId}:*`);
      
      console.log(`✅ Cache invalidated for user ${userId}`);
    } catch (error) {
      console.error('Error invalidating cache:', error);
      throw error;
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<any> {
    return cache.getStats();
  }

  /**
   * Initialize optimizations
   */
  async initializeOptimizations(): Promise<void> {
    try {
      console.log('🚀 Initializing supplier optimizations...');
      
      // Database optimizations removed - handled at database level
      
      console.log('✅ Supplier optimizations initialized');
    } catch (error) {
      console.error('❌ Error initializing optimizations:', error);
      throw error;
    }
  }

  // Private helper methods

  private generateCacheKey(prefix: string, options: any): string {
    const sortedKeys = Object.keys(options).sort();
    const keyParts = sortedKeys.map(key => `${key}:${options[key]}`);
    return `${prefix}:${keyParts.join(':')}`;
  }

  private getSortColumn(sortBy: string) {
    switch (sortBy) {
      case 'category':
        return suppliers.category;
      case 'country':
        return suppliers.country;
      case 'createdAt':
        return suppliers.createdAt;
      default:
        return suppliers.tradeName;
    }
  }

  private updatePerformanceMetrics(duration: number): void {
    this.performanceMetrics.totalQueries++;
    this.performanceMetrics.averageQueryTime = 
      (this.performanceMetrics.averageQueryTime * (this.performanceMetrics.totalQueries - 1) + duration) / 
      this.performanceMetrics.totalQueries;
  }
}