/**
 * Routes Index - Centralized Route Management
 * 
 * SOLID Principles Applied:
 * - SRP: Each route module has single responsibility
 * - OCP: Easy to add new route modules without modification
 * - DIP: Main application depends on route abstractions
 */

import { Express } from 'express';
import { supplierRoutes } from './supplierRoutes';
import { supplierConversationRoutes } from './supplierConversationRoutes';
import materialRoutes from './materialRoutes';
import materialCategoryRoutes from './materialCategoryRoutes';
import materialTypeRoutes from './materialTypeRoutes';

/**
 * Register all modular routes
 * DRY Principle: Single place to register all routes
 */
export function registerModularRoutes(app: Express): void {
  // Supplier routes - PHASE 2: SOLID/DRY/KISS Implementation
  app.use('/api/suppliers', supplierRoutes);
  
  // Additional supplier conversation management routes
  app.use('/api/supplier-conversations', supplierConversationRoutes);
  
  // PHASE 3: Materials Domain Modularization - SOLID/DRY/KISS
  app.use('/api/materials', materialRoutes);
  app.use('/api/material-categories', materialCategoryRoutes);
  app.use('/api/material-types', materialTypeRoutes);
  
  // Future modular routes will be added here:
  // app.use('/api/products', productRoutes);
  // app.use('/api/agents', agentRoutes);
  // app.use('/api/users', userRoutes);
}

/**
 * Export individual route modules for flexibility
 */
export { 
  supplierRoutes,
  materialRoutes,
  materialCategoryRoutes,
  materialTypeRoutes
};