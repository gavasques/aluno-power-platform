/**
 * Database Query Cache System - High-performance caching for database queries
 * 
 * Features:
 * - Query result caching with TTL expiration
 * - Pattern-based cache invalidation
 * - Optimized cache keys for database queries
 * - Memory-efficient storage
 * - Performance metrics tracking
 */

import { logger } from './logger';

interface QueryCacheEntry<T> {
  data: T;
  expires: number;
  created: number;
  hits: number;
}

interface QueryCacheStats {
  hits: number;
  misses: number;
  sets: number;
  evictions: number;
  totalQueries: number;
  hitRate: number;
}

class DatabaseQueryCache {
  private cache = new Map<string, QueryCacheEntry<any>>();
  private stats: QueryCacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    evictions: 0,
    totalQueries: 0,
    hitRate: 0
  };
  
  private readonly maxEntries = 5000; // Maximum number of cached queries
  private readonly defaultTTL = 300; // 5 minutes default TTL
  private cleanupTimer: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every 2 minutes
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, 120000);

    logger.info('Database Query Cache initialized', {
      maxEntries: this.maxEntries,
      defaultTTL: this.defaultTTL
    }, 'DB_CACHE');
  }

  /**
   * Get cached query result
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    // Update hit count and stats
    entry.hits++;
    this.stats.hits++;
    this.updateStats();

    logger.trace('Query cache hit', {
      key: key.substring(0, 50),
      hits: entry.hits,
      age: Date.now() - entry.created
    }, 'DB_CACHE');

    return entry.data;
  }

  /**
   * Cache query result
   */
  async set<T>(key: string, data: T, ttlSeconds: number = this.defaultTTL): Promise<void> {
    // Check memory limits
    if (this.cache.size >= this.maxEntries) {
      this.evictOldestEntries();
    }

    const expires = Date.now() + (ttlSeconds * 1000);
    const entry: QueryCacheEntry<T> = {
      data,
      expires,
      created: Date.now(),
      hits: 0
    };

    this.cache.set(key, entry);
    this.stats.sets++;

    logger.trace('Query cached', {
      key: key.substring(0, 50),
      ttl: ttlSeconds,
      cacheSize: this.cache.size
    }, 'DB_CACHE');
  }

  /**
   * Invalidate cache entries by pattern
   */
  async invalidatePattern(pattern: string): Promise<number> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    let deletedCount = 0;

    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    logger.debug('Cache pattern invalidated', {
      pattern,
      deletedCount,
      remainingEntries: this.cache.size
    }, 'DB_CACHE');

    return deletedCount;
  }

  /**
   * Clear specific cache entry
   */
  async invalidate(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.trace('Cache entry invalidated', { key: key.substring(0, 50) }, 'DB_CACHE');
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    const size = this.cache.size;
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
      totalQueries: 0,
      hitRate: 0
    };

    logger.info('Query cache cleared', { clearedEntries: size }, 'DB_CACHE');
  }

  /**
   * Get cache statistics
   */
  getStats(): QueryCacheStats {
    return { ...this.stats };
  }

  /**
   * Generate cache key for database queries
   */
  generateKey(tableName: string, operation: string, params: Record<string, any> = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((sorted, key) => {
        sorted[key] = params[key];
        return sorted;
      }, {} as Record<string, any>);

    const paramsString = JSON.stringify(sortedParams);
    return `${tableName}:${operation}:${Buffer.from(paramsString).toString('base64url')}`;
  }

  /**
   * Cache wrapper for database operations
   */
  async wrap<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttlSeconds: number = this.defaultTTL
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute query and cache result
    const result = await queryFn();
    await this.set(key, result, ttlSeconds);
    
    return result;
  }

  /**
   * Evict oldest entries when cache is full
   */
  private evictOldestEntries(): void {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.created - b.created)
      .slice(0, Math.floor(this.maxEntries * 0.1)); // Remove oldest 10%

    entries.forEach(([key]) => {
      this.cache.delete(key);
      this.stats.evictions++;
    });

    logger.debug('Cache eviction completed', {
      evictedCount: entries.length,
      remainingEntries: this.cache.size
    }, 'DB_CACHE');
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let expiredCount = 0;

    for (const [key, entry] of this.cache) {
      if (now > entry.expires) {
        this.cache.delete(key);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      logger.debug('Cache cleanup completed', {
        expiredCount,
        remainingEntries: this.cache.size
      }, 'DB_CACHE');
    }
  }

  /**
   * Update hit rate statistics
   */
  private updateStats(): void {
    this.stats.totalQueries = this.stats.hits + this.stats.misses;
    this.stats.hitRate = this.stats.totalQueries > 0 
      ? (this.stats.hits / this.stats.totalQueries) * 100 
      : 0;
  }

  /**
   * Get cache health status
   */
  getHealthStatus(): {
    isHealthy: boolean;
    memoryUsage: number;
    hitRate: number;
    totalEntries: number;
  } {
    return {
      isHealthy: this.cache.size < this.maxEntries * 0.9,
      memoryUsage: this.cache.size,
      hitRate: this.stats.hitRate,
      totalEntries: this.cache.size
    };
  }

  /**
   * Destroy cache instance
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.cache.clear();
    logger.info('Database Query Cache destroyed', {}, 'DB_CACHE');
  }
}

// Export singleton instance
export const queryCache = new DatabaseQueryCache();

// Cache TTL constants for different types of data
export const CACHE_TTL = {
  STATIC_DATA: 3600,     // 1 hour - categories, departments, etc.
  USER_DATA: 1800,       // 30 minutes - user profiles, groups
  DYNAMIC_DATA: 300,     // 5 minutes - suppliers, products  
  REAL_TIME_DATA: 60,    // 1 minute - reviews, conversations
  STATS_DATA: 900,       // 15 minutes - aggregated statistics
} as const;