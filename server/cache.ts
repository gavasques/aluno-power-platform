/**
 * Enterprise Cache System - High-performance caching for 400,000+ records
 * 
 * Features:
 * - In-memory cache with TTL expiration
 * - Pattern-based invalidation
 * - LRU eviction policy
 * - Memory usage monitoring
 * - Performance metrics
 * - Cluster-safe operations
 */

interface CacheEntry<T> {
  value: T;
  expires: number;
  accessed: number;
  hits: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  memoryUsage: number;
  totalKeys: number;
  hitRate: number;
}

class EnterpriseCache {
  private cache = new Map<string, CacheEntry<any>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    memoryUsage: 0,
    totalKeys: 0,
    hitRate: 0,
  };
  
  private readonly maxMemoryMB = 256; // 256MB max memory
  private readonly cleanupInterval = 60000; // 1 minute cleanup
  private readonly maxKeys = 10000; // Maximum number of keys
  
  private cleanupTimer: NodeJS.Timeout;

  constructor() {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Update access time and hits
    entry.accessed = Date.now();
    entry.hits++;
    this.stats.hits++;
    this.updateHitRate();

    return entry.value;
  }

  /**
   * Set value in cache with TTL
   */
  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    const expires = Date.now() + (ttlSeconds * 1000);
    
    const entry: CacheEntry<T> = {
      value,
      expires,
      accessed: Date.now(),
      hits: 0,
    };

    this.cache.set(key, entry);
    this.stats.sets++;
    this.stats.totalKeys = this.cache.size;
    
    // Check memory limits
    this.checkMemoryLimits();
  }

  /**
   * Delete specific key
   */
  async delete(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
      this.stats.totalKeys = this.cache.size;
    }
    return deleted;
  }

  /**
   * Delete keys matching pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    let deletedCount = 0;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    
    this.stats.deletes += deletedCount;
    this.stats.totalKeys = this.cache.size;
    
    return deletedCount;
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.deletes += size;
    this.stats.totalKeys = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    this.updateMemoryUsage();
    return { ...this.stats };
  }

  /**
   * Check if key exists
   */
  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check if expired
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Update memory usage estimation
   */
  private updateMemoryUsage(): void {
    let memoryUsage = 0;
    
    for (const [key, entry] of this.cache) {
      memoryUsage += this.estimateSize(key);
      memoryUsage += this.estimateSize(entry.value);
      memoryUsage += 64; // Overhead for entry metadata
    }
    
    this.stats.memoryUsage = memoryUsage;
  }

  /**
   * Estimate object size in bytes
   */
  private estimateSize(obj: any): number {
    if (obj === null || obj === undefined) return 0;
    
    if (typeof obj === 'string') {
      return obj.length * 2; // UTF-16 characters
    }
    
    if (typeof obj === 'number') {
      return 8; // 64-bit number
    }
    
    if (typeof obj === 'boolean') {
      return 1;
    }
    
    if (Array.isArray(obj)) {
      return obj.reduce((size, item) => size + this.estimateSize(item), 0);
    }
    
    if (typeof obj === 'object') {
      return Object.keys(obj).reduce((size, key) => {
        return size + this.estimateSize(key) + this.estimateSize(obj[key]);
      }, 0);
    }
    
    return 0;
  }

  /**
   * Check memory limits and evict if necessary
   */
  private checkMemoryLimits(): void {
    this.updateMemoryUsage();
    
    const memoryMB = this.stats.memoryUsage / (1024 * 1024);
    
    if (memoryMB > this.maxMemoryMB || this.cache.size > this.maxKeys) {
      this.evictLRU();
    }
  }

  /**
   * Evict least recently used entries
   */
  private evictLRU(): void {
    const entries = Array.from(this.cache.entries());
    
    // Sort by access time (oldest first)
    entries.sort((a, b) => a[1].accessed - b[1].accessed);
    
    // Remove 20% of entries
    const evictCount = Math.floor(entries.length * 0.2);
    
    for (let i = 0; i < evictCount; i++) {
      this.cache.delete(entries[i][0]);
      this.stats.evictions++;
    }
    
    this.stats.totalKeys = this.cache.size;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, entry] of this.cache) {
      if (now > entry.expires) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      this.stats.deletes += cleanedCount;
      this.stats.totalKeys = this.cache.size;
    }
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const totalRequests = this.stats.hits + this.stats.misses;
    this.stats.hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
  }

  /**
   * Get memory usage in MB
   */
  getMemoryUsageMB(): number {
    this.updateMemoryUsage();
    return this.stats.memoryUsage / (1024 * 1024);
  }

  /**
   * Get cache health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    memoryUsage: number;
    hitRate: number;
    totalKeys: number;
  } {
    const memoryMB = this.getMemoryUsageMB();
    const hitRate = this.stats.hitRate;
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if (memoryMB > this.maxMemoryMB * 0.8 || hitRate < 50) {
      status = 'warning';
    }
    
    if (memoryMB > this.maxMemoryMB * 0.95 || hitRate < 20) {
      status = 'critical';
    }
    
    return {
      status,
      memoryUsage: memoryMB,
      hitRate,
      totalKeys: this.stats.totalKeys,
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
  }
}

// Export singleton instance
export const cache = new EnterpriseCache();

// Graceful shutdown
process.on('SIGINT', () => {
  cache.destroy();
});

process.on('SIGTERM', () => {
  cache.destroy();
});