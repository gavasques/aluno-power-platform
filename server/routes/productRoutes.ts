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
import { 
  requireProductAccess, 
  requireDataExport, 
  requireDataImport,
  requireRole 
} from '../middleware/permissions';

const router = Router();
const productController = new ProductController();

// GET /api/products - List all products with pagination and search
router.get('/', productController.getAll.bind(productController));

// GET /api/products/search/:query - Search products
router.get('/search/:query', productController.search.bind(productController));

// GET /api/products/my-products/search - Search user's own products
router.get('/my-products/search', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user!.id;
    const searchQuery = req.query.q as string;
    
    if (!searchQuery || searchQuery.length < 2) {
      return res.json([]);
    }

    // Import storage dynamically to avoid circular dependencies
    const { storage } = await import('../storage');
    
    // Buscar produtos do usuário
    const products = await storage.searchUserProducts(userId, searchQuery);
    
    res.json(products);
  } catch (error) {
    console.error('Error searching user products:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar produtos' 
    });
  }
});

// GET /api/products/:id - Get product by ID
router.get('/:id', productController.getById.bind(productController));

// GET /api/products/:id/cost-history - Get product cost history
router.get('/:id/cost-history', productController.getCostHistory.bind(productController));

// POST /api/products - Create new product (requires auth, permissions, and file upload)
router.post('/', 
  requireAuth, 
  requireProductAccess,
  ProductController.getUploadMiddleware(), 
  productController.create.bind(productController)
);

// PUT /api/products/:id - Update product (requires auth, permissions, and file upload)
router.put('/:id', 
  requireAuth, 
  requireProductAccess,
  ProductController.getUploadMiddleware(), 
  productController.update.bind(productController)
);

// DELETE /api/products/:id - Delete product (requires auth and permissions)
router.delete('/:id', 
  requireAuth, 
  requireProductAccess,
  productController.delete.bind(productController)
);

// POST /api/products/export - Export products data (requires special permission)
router.post('/export', 
  requireAuth, 
  requireDataExport,
  productController.export?.bind(productController) || ((req, res) => res.status(501).json({ error: 'Export not implemented' }))
);

// POST /api/products/import - Import products data (requires special permission)
router.post('/import', 
  requireAuth, 
  requireDataImport,
  productController.import?.bind(productController) || ((req, res) => res.status(501).json({ error: 'Import not implemented' }))
);

export default router;