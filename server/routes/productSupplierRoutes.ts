/**
 * Product Supplier Routes
 * 
 * SOLID Principles Applied:
 * - SRP: Single responsibility for product supplier routing
 * - OCP: Open for extension with new supplier endpoints
 * - LSP: Consistent routing interface
 * - ISP: Focused on supplier-specific routes
 * - DIP: Depends on abstractions through controller
 */

import { Router } from 'express';
import { ProductSupplierController } from '../controllers/ProductSupplierController';
import { requireAuth } from '../security';
import { requirePermission } from '../middleware/permissions';

const router = Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

/**
 * @route   GET /api/products/:productId/suppliers
 * @desc    Get all suppliers for a product
 * @access  Private
 */
router.get('/:productId/suppliers', requirePermission('products.view_suppliers'), ProductSupplierController.getProductSuppliers);

/**
 * @route   POST /api/products/:productId/suppliers
 * @desc    Add a supplier to a product
 * @access  Private
 */
router.post('/:productId/suppliers', requirePermission('products.manage_suppliers'), ProductSupplierController.addProductSupplier);

/**
 * @route   PUT /api/products/:productId/suppliers/:supplierId
 * @desc    Update a product supplier
 * @access  Private
 */
router.put('/:productId/suppliers/:supplierId', requirePermission('products.manage_suppliers'), ProductSupplierController.updateProductSupplier);

/**
 * @route   DELETE /api/products/:productId/suppliers/:supplierId
 * @desc    Delete a product supplier
 * @access  Private
 */
router.delete('/:productId/suppliers/:supplierId', requirePermission('products.manage_suppliers'), ProductSupplierController.deleteProductSupplier);

/**
 * @route   PUT /api/products/:productId/suppliers/:supplierId/set-primary
 * @desc    Set a supplier as primary for a product
 * @access  Private
 */
router.put('/:productId/suppliers/:supplierId/set-primary', requirePermission('products.manage_suppliers'), ProductSupplierController.setPrimarySupplier);

/**
 * @route   GET /api/products/:productId/suppliers/stats
 * @desc    Get supplier statistics for a product
 * @access  Private
 */
router.get('/:productId/suppliers/stats', requirePermission('products.view_suppliers'), ProductSupplierController.getSupplierStats);

export { router as productSupplierRoutes };