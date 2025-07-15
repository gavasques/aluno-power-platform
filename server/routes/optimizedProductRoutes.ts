/**
 * Optimized Product Routes
 * High-Performance Product Management Routes
 * 
 * PERFORMANCE FEATURES:
 * - Pagination with efficient queries
 * - Smart caching headers
 * - Rate limiting for heavy operations
 * - Compression middleware
 * - Response optimization
 */

import { Router } from 'express';
import { optimizedProductController } from '../controllers/OptimizedProductController';
import { requireAuth, apiLimiter, createRateLimit } from '../security';
import compression from 'compression';

const router = Router();

// Apply compression for all product routes
router.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Good balance between compression and speed
  threshold: 1024 // Only compress responses larger than 1KB
}));

// Heavy operations rate limiting
const heavyOperationsLimiter = createRateLimit(
  5 * 60 * 1000, // 5 minutes
  20, // 20 requests per 5 minutes
  'Too many heavy operations. Please try again later.'
);

const searchLimiter = createRateLimit(
  60 * 1000, // 1 minute
  60, // 60 searches per minute
  'Too many search requests. Please slow down.'
);

// Routes with authentication and optimization
router.get('/optimized', requireAuth, apiLimiter, optimizedProductController.getOptimizedList.bind(optimizedProductController));
router.get('/summary', requireAuth, apiLimiter, optimizedProductController.getSummary.bind(optimizedProductController));
router.get('/search', requireAuth, searchLimiter, optimizedProductController.search.bind(optimizedProductController));
router.get('/filter-options', requireAuth, apiLimiter, optimizedProductController.getFilterOptions.bind(optimizedProductController));
router.post('/bulk-update', requireAuth, heavyOperationsLimiter, optimizedProductController.bulkUpdate.bind(optimizedProductController));
router.delete('/cache', requireAuth, optimizedProductController.clearCache.bind(optimizedProductController));
router.get('/performance', requireAuth, optimizedProductController.getPerformanceMetrics.bind(optimizedProductController));

export { router as optimizedProductRoutes };