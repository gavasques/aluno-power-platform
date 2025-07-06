import { Router } from 'express';
import { SupplierController } from '../controllers/SupplierController';
import { requireAuth } from '../security';

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
 * Core CRUD Operations
 */
router.get('/', requireAuth, bindMethod(supplierController.getAll));
router.get('/paginated', bindMethod(supplierController.getPaginated));
router.get('/search/:query', bindMethod(supplierController.search));
router.get('/:id', bindMethod(supplierController.getById));
router.post('/', bindMethod(supplierController.create));
router.put('/:id', bindMethod(supplierController.update));
router.delete('/:id', bindMethod(supplierController.delete));

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
router.get('/:id/conversations', requireAuth, bindMethod(supplierController.getConversations));
router.post('/:id/conversations', requireAuth, bindMethod(supplierController.createConversation));

// Contacts  
router.get('/:id/contacts', requireAuth, bindMethod(supplierController.getContacts));
router.post('/:id/contacts', requireAuth, bindMethod(supplierController.createContact));

// Files
router.get('/:id/files', requireAuth, bindMethod(supplierController.getFiles));
router.post('/:id/files', requireAuth, bindMethod(supplierController.createFile));

/**
 * Export router for composition in main routes file
 * Dependency Inversion Principle (DIP): Main routes depend on this abstraction
 */
export { router as supplierRoutes };