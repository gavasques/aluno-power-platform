import { Router } from 'express';
import { SupplierController } from '../controllers/SupplierController';
import { requireAuth } from '../security';
import { 
  requireSupplierAccess, 
  requireDataExport, 
  requireDataImport,
  requireRole 
} from '../middleware/permissions';

/**
 * Supplier Routes - Single Responsibility Principle (SRP)
 * Handles ONLY route definition and middleware setup for suppliers
 * 
 * Open/Closed Principle (OCP): Easy to extend with new routes without modifying existing ones
 */

const router = Router();
const supplierController = new SupplierController();

// Bind controller methods to preserve 'this' context
const bindMethod = (method: Function) => method.bind(supplierController);

/**
 * Core CRUD Operations with Granular Permissions
 */
router.get('/', requireAuth, requireSupplierAccess, bindMethod(supplierController.getAll));
router.get('/paginated', requireAuth, requireSupplierAccess, bindMethod(supplierController.getPaginated));
router.get('/search/:query', requireAuth, requireSupplierAccess, bindMethod(supplierController.search));
router.get('/:id', requireAuth, requireSupplierAccess, bindMethod(supplierController.getById));
router.post('/', requireAuth, requireSupplierAccess, bindMethod(supplierController.create));
router.put('/:id', requireAuth, requireSupplierAccess, bindMethod(supplierController.update));
router.delete('/:id', requireAuth, requireSupplierAccess, bindMethod(supplierController.delete));

/**
 * Related Operations - Logically grouped
 */
// Reviews
router.get('/:id/reviews', bindMethod(supplierController.getReviews));
router.post('/:id/reviews', bindMethod(supplierController.createReview));

// Brands
router.get('/:id/brands', bindMethod(supplierController.getBrands));
router.post('/:id/brands', bindMethod(supplierController.createBrand));
router.delete('/brands/:brandId', bindMethod(supplierController.deleteBrand));

// Conversations
router.get('/:id/conversations', requireAuth, requireSupplierAccess, bindMethod(supplierController.getConversations));
router.post('/:id/conversations', requireAuth, requireSupplierAccess, bindMethod(supplierController.createConversation));

// Contacts  
router.get('/:id/contacts', requireAuth, requireSupplierAccess, bindMethod(supplierController.getContacts));
router.post('/:id/contacts', requireAuth, requireSupplierAccess, bindMethod(supplierController.createContact));

// Files
router.get('/:id/files', requireAuth, requireSupplierAccess, bindMethod(supplierController.getFiles));
router.post('/:id/files', requireAuth, requireSupplierAccess, bindMethod(supplierController.createFile));

// Data Export/Import with special permissions
router.post('/export', requireAuth, requireDataExport, bindMethod(supplierController.export || ((req, res) => res.status(501).json({ error: 'Export not implemented' }))));
router.post('/import', requireAuth, requireDataImport, bindMethod(supplierController.import || ((req, res) => res.status(501).json({ error: 'Import not implemented' }))));

/**
 * Export router for composition in main routes file
 * Dependency Inversion Principle (DIP): Main routes depend on this abstraction
 */
export { router as supplierRoutes };