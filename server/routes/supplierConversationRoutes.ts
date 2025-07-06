import { Router } from 'express';
import { SupplierController } from '../controllers/SupplierController';
import { requireAuth } from '../security';

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
router.put('/:id', requireAuth, bindMethod(supplierController.updateConversation));
router.delete('/:id', requireAuth, bindMethod(supplierController.deleteConversation));

export { router as supplierConversationRoutes };