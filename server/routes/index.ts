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
import productRoutes from './productRoutes';
import { excelImportExportRoutes } from './excelImportExportRoutes';
import dashboardRoutes from './dashboard';
import stripeRoutes from './stripe';
import { permissionRoutes } from './permissions';
import userGroupsRoutes from './admin/userGroups';
import stripeWebhookTestRoutes from './stripe/webhook-test';
import featureCostsRoutes from './featureCosts';
import creditsRoutes from './credits';
import investmentSimulationsRoutes from './investment-simulations';
import simulatorsRoutes from './simulators';
import aiProviderRoutes from './aiProviders';

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
  
  // PHASE 4: Products Domain Modularization - SOLID/DRY/KISS
  app.use('/api/products', productRoutes);
  
  // Excel Import/Export Routes - XLSX operations for products and channels
  app.use('/api/excel', excelImportExportRoutes);
  
  // User Dashboard Routes - Complete Dashboard System
  app.use('/api/dashboard', dashboardRoutes);
  
  // Stripe Payment Routes - Complete Stripe Integration
  app.use('/api/stripe', stripeRoutes);
  
  // Permission Management Routes - Group-based Access Control
  app.use('/api/permissions', permissionRoutes);
  
  // Feature Costs Management - Credit System
  app.use('/api/feature-costs', featureCostsRoutes);
  
  // Credits Management - Credit Deduction and Balance
  app.use('/api/credits', creditsRoutes);
  
  // Admin User Groups Management Routes
  app.use('/api/admin/user-groups', userGroupsRoutes);
  
  // Stripe Webhook Testing Routes (Admin only)
  app.use('/api/stripe/test', stripeWebhookTestRoutes);
  
  // Investment Simulations Routes
  app.use('/api/investment-simulations', investmentSimulationsRoutes);
  
  // Simulators Routes - Import/Export/ROI etc.
  app.use('/api/simulations', simulatorsRoutes);
  
  // AI Provider Routes - xAI/Grok Integration & Provider Testing
  app.use('/api/ai-providers', aiProviderRoutes);
  
  // Future modular routes will be added here:
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
  materialTypeRoutes,
  productRoutes
};