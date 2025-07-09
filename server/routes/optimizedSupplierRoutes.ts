/**
 * Optimized Supplier Routes - Enterprise-level API endpoints for 400,000+ suppliers
 * 
 * Routes:
 * - GET /paginated - Get paginated suppliers with filtering
 * - GET /stats - Get supplier statistics  
 * - GET /search - Search suppliers with full-text
 * - GET /:id/details - Get supplier details with relations
 * - POST /bulk/status - Bulk update supplier status
 * - POST /cache/warmup - Warm up cache for user
 * - DELETE /cache/invalidate - Invalidate user caches
 * - GET /metrics - Get performance metrics
 * - GET /health - Health check
 */

import { Router } from 'express';
import { OptimizedSupplierController } from '../controllers/OptimizedSupplierController';
import { requireAuth } from '../security';
import { db } from '../db';

const router = Router();

// Initialize the optimized controller
const optimizedController = new OptimizedSupplierController(db);

// Apply authentication to all routes
router.use(requireAuth);

// Get paginated suppliers with advanced filtering
router.get('/paginated', (req, res) => optimizedController.getPaginatedSuppliers(req, res));

// Get supplier statistics
router.get('/stats', (req, res) => optimizedController.getSupplierStats(req, res));

// Search suppliers with full-text search
router.get('/search', (req, res) => optimizedController.searchSuppliers(req, res));

// Get supplier details with related data
router.get('/:id/details', (req, res) => optimizedController.getSupplierDetails(req, res));

// Bulk update supplier status
router.post('/bulk/status', (req, res) => optimizedController.bulkUpdateStatus(req, res));

// Cache management
router.post('/cache/warmup', (req, res) => optimizedController.warmupCache(req, res));
router.delete('/cache/invalidate', (req, res) => optimizedController.invalidateCache(req, res));

// Performance monitoring
router.get('/metrics', (req, res) => optimizedController.getPerformanceMetrics(req, res));

// Health check
router.get('/health', (req, res) => optimizedController.healthCheck(req, res));

export { router as optimizedSupplierRoutes };