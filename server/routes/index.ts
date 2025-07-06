/**
 * Routes Index - Centralized Route Management
 * 
 * SOLID Principles Applied:
 * - SRP: Each route module has single responsibility
 * - OCP: Easy to add new route modules without modification
 * - DIP: Main application depends on route abstractions
 */

import { Express } from 'express';
import express from 'express';
import path from 'path';

// Import supplier routes
import { supplierRoutes } from './supplierRoutes';
import { supplierConversationRoutes } from './supplierConversationRoutes';

// PHASE 3: Import material routes
import materialRoutes from './materialRoutes';
import materialCategoryRoutes from './materialCategoryRoutes';
import materialTypeRoutes from './materialTypeRoutes';

// PHASE 4: Import product routes
import productRoutes from './productRoutes';

// PHASE 6: Import admin and content routes
import { adminRoutes } from './adminRoutes';
import { contentRoutes } from './contentRoutes';

// PHASE 7: Import auth and brand routes
import authRoutes from './authRoutes';
import brandRoutes from './brandRoutes';

/**
 * Register all modular routes
 * DRY Principle: Single place to register all routes
 * PHASE 7: Complete modular architecture - SOLID/DRY/KISS
 */
export function registerModularRoutes(app: Express): void {
  // PHASE 7: Authentication Routes - SOLID/DRY/KISS
  app.use('/api', authRoutes);
  
  // PHASE 7: Brand/Department/Category Routes - SOLID/DRY/KISS  
  app.use('/api', brandRoutes);
  
  // Supplier routes - PHASE 2: SOLID/DRY/KISS Implementation
  app.use('/api/suppliers', supplierRoutes);
  
  // Additional supplier conversation management routes
  app.use('/api/supplier-conversations', supplierConversationRoutes);
  
  // PHASE 3: Materials Domain Modularization - SOLID/DRY/KISS
  app.use('/api/materials', materialRoutes);
  app.use('/api/material-categories', materialCategoryRoutes);
  app.use('/api/material-types', materialTypeRoutes);
  
  // PHASE 4: Products Domain Modularization - SOLID/DRY/KISS
  app.use('/api/products', productRoutes);
  
  // PHASE 6: Admin & Content Domain Modularization - SOLID/DRY/KISS
  app.use('/api', adminRoutes);
  app.use('/api', contentRoutes);
  
  // Static file serving
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
}

/**
 * Export individual route modules for flexibility
 */
export { 
  supplierRoutes,
  materialRoutes,
  materialCategoryRoutes,
  materialTypeRoutes,
  productRoutes,
  adminRoutes,
  contentRoutes,
  authRoutes,
  brandRoutes
};