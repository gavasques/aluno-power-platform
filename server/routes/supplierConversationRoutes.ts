import { Router } from 'express';
import { SupplierController } from '../controllers/SupplierController';
import { requireAuth } from '../security';
import { requirePermission } from '../middleware/permissions';

/**
 * Supplier Conversation Routes - Additional endpoints for conversation management
 * Single Responsibility Principle (SRP): Focused on conversation-specific routes
 */

const router = Router();
const supplierController = new SupplierController();

// Bind controller methods to preserve 'this' context
const bindMethod = (method: Function) => method.bind(supplierController);

/**
 * Conversation Management Routes
 */
router.put('/:id', requireAuth, requirePermission('suppliers.manage'), bindMethod(supplierController.updateConversation));
router.delete('/:id', requireAuth, requirePermission('suppliers.manage'), bindMethod(supplierController.deleteConversation));

export { router as supplierConversationRoutes };