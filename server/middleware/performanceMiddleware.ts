/**
 * Performance Middleware - Phase 1 Optimization
 * Response compression, caching headers, and performance monitoring
 */

import { Request, Response, NextFunction } from 'express';
import compression from 'compression';

/**
 * Compression middleware with optimized settings
 */
export const compressionMiddleware = compression({
  // Compress only if response is larger than 1KB
  threshold: 1024,
  // Compression level (1-9, 6 is good balance)
  level: 6,
  // Don't compress already compressed files
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
});

/**
 * Cache headers for API responses
 */
export const cacheHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Different cache strategies based on route
  const path = req.path;
  
  // Disable cache for preview/development mode or specific no-cache routes
  if (path.includes('/preview') || 
      path.includes('/dashboard') ||
      path.includes('/published/preview') ||
      req.headers['cache-control'] === 'no-cache' ||
      req.query.nocache === '1') {
    // No cache for preview routes and development
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    return next();
  }
  
  if (path.includes('/api/products')) {
    // Products API - short cache for dynamic data
    res.set({
      'Cache-Control': 'public, max-age=300', // 5 minutes
      'ETag': generateETag(req.url)
    });
  } else if (path.includes('/api/categories') || path.includes('/api/departments')) {
    // Categories - longer cache for relatively static data
    res.set({
      'Cache-Control': 'public, max-age=3600', // 1 hour
      'ETag': generateETag(req.url)
    });
  } else if (path.includes('/api/youtube-videos')) {
    // YouTube videos - medium cache
    res.set({
      'Cache-Control': 'public, max-age=1800', // 30 minutes
      'ETag': generateETag(req.url)
    });
  }
  
  next();
};

/**
 * Performance metrics middleware
 */
export const performanceMetrics = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Don't try to set headers after response is sent
    if (!res.headersSent) {
      res.set('X-Response-Time', `${duration}ms`);
    }
    
    // Log slow requests (> 1000ms)
    if (duration > 1000) {
      console.warn(`🐌 [SLOW_REQUEST] ${req.method} ${req.path} took ${duration}ms`);
    }
    
    // Log performance metrics for products API
    if (req.path.includes('/api/products') && duration > 500) {
      console.log(`⚡ [PRODUCTS_API] ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  
  next();
};

/**
 * Request size limiter for large payloads
 */
export const requestSizeLimiter = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = req.get('content-length');
  const maxSize = 50 * 1024 * 1024; // 50MB
  
  if (contentLength && parseInt(contentLength) > maxSize) {
    return res.status(413).json({
      error: 'Request too large',
      maxSize: '50MB'
    });
  }
  
  next();
};

/**
 * Generate simple ETag for caching
 */
function generateETag(url: string): string {
  const hash = url.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return `W/"${Math.abs(hash)}"`;
}

/**
 * Memory usage monitoring
 */
export const memoryMonitor = (req: Request, res: Response, next: NextFunction) => {
  // Check memory usage every 100 requests (simple sampling)
  if (Math.random() < 0.01) {
    const memUsage = process.memoryUsage();
    const memMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };
    
    console.log(`📊 [MEMORY_USAGE] RSS: ${memMB.rss}MB, Heap: ${memMB.heapUsed}/${memMB.heapTotal}MB`);
    
    // Warn if memory usage is high
    if (memMB.heapUsed > 512) {
      console.warn(`⚠️ [HIGH_MEMORY] Heap usage: ${memMB.heapUsed}MB - Consider optimization`);
    }
  }
  
  next();
};