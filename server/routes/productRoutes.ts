/**
 * Product Routes - SOLID/DRY/KISS Modularization
 * 
 * SOLID Principles Applied:
 * - SRP: Single responsibility for product routing
 * - OCP: Open for extension via controller methods
 * - LSP: Consistent route interface
 * - ISP: Focused product route interface
 * - DIP: Depends on ProductController abstraction
 */

import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { requireAuth } from '../security';

const router = Router();
const productController = new ProductController();

// GET /api/products - List all products with pagination and search
router.get('/', productController.getAll.bind(productController));

// GET /api/products/search/:query - Search products
router.get('/search/:query', productController.search.bind(productController));

// GET /api/products/:id - Get product by ID
router.get('/:id', productController.getById.bind(productController));

// GET /api/products/:id/cost-history - Get product cost history
router.get('/:id/cost-history', productController.getCostHistory.bind(productController));

// POST /api/products - Create new product (requires auth and file upload)
router.post('/', 
  requireAuth, 
  ProductController.getUploadMiddleware(), 
  productController.create.bind(productController)
);

// PUT /api/products/:id - Update product (requires auth and file upload)
router.put('/:id', 
  requireAuth, 
  ProductController.getUploadMiddleware(), 
  productController.update.bind(productController)
);

// DELETE /api/products/:id - Delete product
router.delete('/:id', productController.delete.bind(productController));

export default router;