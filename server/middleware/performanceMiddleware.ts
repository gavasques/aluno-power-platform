/**
 * Performance Middleware - Phase 1 Optimization
 * Response compression, caching headers, and performance monitoring
 */

import { Request, Response, NextFunction } from 'express';
import compression from 'compression';
import { logger, logApiRequest, logApiResponse, logSlowRequest } from '../utils/logger';

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
 * Performance metrics middleware - Optimized logging
 */
export const performanceMetrics = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Log incoming request
  logApiRequest(req);
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Don't try to set headers after response is sent
    if (!res.headersSent) {
      res.set('X-Response-Time', `${duration}ms`);
    }
    
    // Log API response
    logApiResponse(req, res, duration);
    
    // Log slow requests
    logSlowRequest(req, duration);
    
    // Performance-specific logging for critical APIs
    if (req.path.includes('/api/products') && duration > 500) {
      logger.warn('Products API slow response', {
        path: req.path,
        duration: `${duration}ms`,
        threshold: '500ms'
      }, 'PRODUCTS_API');
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
 * Memory usage monitoring - Optimized sampling
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
    
    logger.info('Memory usage sample', memMB, 'MEMORY');
    
    // Warn if memory usage is high
    if (memMB.heapUsed > 512) {
      logger.warn('High memory usage detected', {
        heapUsed: `${memMB.heapUsed}MB`,
        recommendation: 'Consider optimization'
      }, 'MEMORY');
    }
  }
  
  next();
};