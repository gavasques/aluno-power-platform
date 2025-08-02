import type { Express, Request as ExpressRequest, Response as ExpressResponse } from "express";
import express from "express";
import { createServer, type Server } from "http";

// Extended Request interface with user property
interface AuthenticatedRequest extends ExpressRequest {
  user?: any;
  body: any;
}

// Global extensions for session storage
declare global {
  var customerServiceSessions: Map<string, any>;
  var negativeReviewsSessions: Map<string, any>;
  var asinResearchSessions: Map<string, any>;
  var supplierAnalysisSessions: Map<string, any>;
}
import { WebSocketServer, WebSocket } from "ws";
import bcryptjs from "bcryptjs";
import multer from "multer";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { storage } from "./storage";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import os from "os";

import { LoggingService } from "./services/loggingService";
import { CreditService } from "./services/creditService";
import userProfileRoutes from "./routes/user/profile";
import picsartRoutes from "./routes/picsart";
import { productSupplierRoutes } from "./routes/productSupplierRoutes";
import supplierProductsRoutes from "./routes/supplierProductsRoutes";
import performanceRoutes from "./routes/performance";
import internationalContractsRoutes from "./routes/internationalContracts";
import internationalSupplierBankingRoutes from "./routes/internationalSupplierBanking";
import importedProductsRoutes from "./routes/importedProducts";
import importedProductSuppliersRoutes from "./routes/importedProductSuppliers";
import productPackagesRoutes from "./routes/productPackages";
import productImagesRoutes from "./routes/productImages";
import { financas360Router } from "./routes/financas360";
import { financas360OperationsRouter } from "./routes/financas360-operations";
import userCompaniesRoutes from "./routes/userCompanies";

// Helper function for generating tags
function generateTags(data: any): any {
  const tags: any = {};
  if (data.productName) tags.PRODUCT_NAME = data.productName.trim();
  if (data.brand) tags.BRAND = data.brand.trim();
  if (data.category) tags.CATEGORY = data.category.trim();
  if (data.keywords) tags.KEYWORDS = data.keywords.trim();
  if (data.longTailKeywords) tags.LONG_TAIL_KEYWORDS = data.longTailKeywords.trim();
  if (data.mainFeatures) tags.MAIN_FEATURES = data.mainFeatures.trim();
  if (data.targetAudience) tags.TARGET_AUDIENCE = data.targetAudience.trim();
  if (data.reviewsData) tags.REVIEWS_DATA = data.reviewsData.trim();
  return tags;
}

// Import secure upload configurations
import { 
  createSecureUpload, 
  imageUpload, 
  documentUpload, 
  supplierFileUpload,
  genericUpload 
} from './middleware/secureUpload';
import { 
  insertSupplierSchema, 
  insertPartnerSchema, 
  insertMaterialSchema, 
  insertToolSchema, 
  insertTemplateSchema, 
  insertPromptSchema, 
  insertProductSchema, 
  insertCategorySchema,
  insertDepartmentSchema,
  insertTemplateCategorySchema,
  insertPromptCategorySchema,
  insertToolTypeSchema,
  insertMaterialTypeSchema,
  insertPartnerTypeSchema,
  insertPartnerContactSchema,
  insertPartnerFileSchema,
  insertPartnerReviewSchema,
  insertPartnerReviewReplySchema,
  insertToolReviewSchema,
  insertToolReviewReplySchema,
  insertToolDiscountSchema,
  insertToolVideoSchema,

  insertNewsSchema,
  insertAiGenerationLogSchema,
  aiGenerationLogs,
  insertAiImgGenerationLogSchema,

  insertUpdateSchema,
  insertGeneratedImageSchema,

  insertAgentSchema,
  insertAgentPromptSchema,
  insertAgentUsageSchema,
  insertAgentGenerationSchema,
  insertUserSchema,
  insertUpscaledImageSchema
} from "@shared/schema";
import { AuthService } from "./services/authService";
import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { openaiService } from "./services/openaiService";

// 🏗️  [PHASE_3] MATERIAL DOMAIN MODULAR INTEGRATION
import { MaterialController } from "./controllers/MaterialController";
import materialRoutes from "./routes/materialRoutes";
import aiProviderRoutes from "./routes/aiProviders";
import materialCategoryRoutes from "./routes/materialCategoryRoutes";
import materialTypeRoutes from "./routes/materialTypeRoutes";
import knowledgeBaseRoutes from "./routes/knowledgeBase";
import { aiProviderService } from "./services/aiProviderService";
import { SessionService } from "./services/sessionService";
import { amazonListingService as amazonService } from "./services/amazonListingService";
import { requireAuth, requireRole } from "./security";
import { db } from './db';
import { eq, desc, like, and, isNull, isNotNull, or, not, sql, asc, count, sum, avg, gte, lte } from 'drizzle-orm';
import { materials, partners, tools, toolTypes, suppliers, news, updates, agents, agentPrompts, agentUsage, agentGenerations, users, products, brands, generatedImages, departments, amazonListingSessions, insertAmazonListingSessionSchema, InsertAmazonListingSession, userGroups, userGroupMembers, toolUsageLogs, insertToolUsageLogSchema, aiImgGenerationLogs, categories } from '@shared/schema';

// PHASE 2: SOLID/DRY/KISS Modular Architecture Integration
import { registerModularRoutes } from './routes/index';
import dashboardRoutes from './routes/dashboard';
import { registerAdvancedRoutes } from './routes/advanced';
import userDashboardRoutes from './routes/user/dashboard';
import userUsageRoutes from './routes/user/usage';

// WebSocket connections storage
const connectedClients = new Set<WebSocket>();

// Broadcast function for real-time notifications
function broadcastNotification(type: string, data: any) {
  const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const message = JSON.stringify({ 
    type, 
    data, 
    timestamp: new Date().toISOString(),
    messageId 
  });
  
  console.log(`📡 [WS_BROADCAST] Broadcasting notification`);
  console.log(`   🆔 Message ID: ${messageId}`);
  console.log(`   📋 Type: ${type}`);
  console.log(`   📊 Connected Clients: ${connectedClients.size}`);
  console.log(`   📄 Data Preview: ${JSON.stringify(data).substring(0, 200)}...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  connectedClients.forEach((client, index) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
        successCount++;
      } catch (error) {
        console.error(`❌ [WS_SEND_ERROR] Failed to send to client ${index}:`, error);
        errorCount++;
        // Remove broken client
        connectedClients.delete(client);
      }
    } else {
      console.log(`🔌 [WS_SKIP] Skipping client ${index} (state: ${client.readyState})`);
      // Remove dead client
      connectedClients.delete(client);
      errorCount++;
    }
  });
  
  console.log(`📊 [WS_BROADCAST_RESULT] Message ${messageId}: ${successCount} sent, ${errorCount} failed`);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // PHASE 2: SOLID/DRY/KISS Modular Routes Integration
  console.log('🏗️  [PHASE_2] Registering modular routes...');
  registerModularRoutes(app);
  console.log('✅ [PHASE_2] Modular routes registered successfully');
  
  // PHASE 3 & 4: All modular routes are now registered in registerModularRoutes()
  // No more duplicate registrations needed here

  // Stripe webhook endpoint (must be before JSON parser)
  app.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const { handleStripeWebhook } = await import('./webhooks/stripe');
      await handleStripeWebhook(req, res);
    } catch (error) {
      console.error('Error loading Stripe webhook handler:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Serve static files from uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  
  // Dashboard routes
  app.use('/api/dashboard', dashboardRoutes);
  
  // User dashboard routes
  app.use('/api/user/dashboard', userDashboardRoutes);
  
  // User usage routes
  app.use('/api/user/usage', requireAuth, userUsageRoutes);
  
  // User profile routes
  app.use('/api/user/profile', userProfileRoutes);
  
  // Knowledge base routes
  app.use('/api/knowledge-base', knowledgeBaseRoutes);
  
  // Simulator routes
  const simulatorRoutes = await import('./routes/simulators');
  app.use('/api/simulators', simulatorRoutes.default);
  
  // Advanced functionality routes (coupons, trial, abandoned cart, analytics)
  registerAdvancedRoutes(app);
  
  // Import Stripe routes
  const { default: stripeRoutes } = await import('./routes/stripe/index.js');
  app.use('/api/stripe', stripeRoutes);
  
  // PHASE 2: ✅ SUPPLIER ROUTES MIGRATED TO MODULAR ARCHITECTURE
  // All supplier routes now handled by modular system in server/routes/supplierRoutes.ts
  // Following SOLID/DRY/KISS principles - eliminated code duplication

  // Product Brands endpoints removed - now handled at line 558

  // Suppliers with pagination and filters
  app.get('/api/suppliers/paginated', async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 25;
      const search = req.query.search as string;
      const categoryId = req.query.categoryId as string;
      const departmentId = req.query.departmentId as string;
      const sortBy = req.query.sortBy as string || 'name';
      
      const offset = (page - 1) * limit;
      
      const result = await storage.getSuppliersWithPagination({
        limit,
        offset,
        search,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        sortBy
      });
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching paginated suppliers:', error);
      res.status(500).json({ error: 'Failed to fetch suppliers' });
    }
  });

  app.get('/api/suppliers/:id', async (req, res) => {
    try {
      const supplier = await storage.getSupplier(parseInt(req.params.id));
      if (!supplier) {
        return res.status(404).json({ error: 'Supplier not found' });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch supplier' });
    }
  });

  app.post('/api/suppliers', async (req, res) => {
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(validatedData);
      res.status(201).json(supplier);
    } catch (error) {
      res.status(400).json({ error: 'Invalid supplier data' });
    }
  });

  app.put('/api/suppliers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSupplierSchema.partial().parse(req.body);
      const supplier = await storage.updateSupplier(id, validatedData);
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update supplier' });
    }
  });

  app.delete('/api/suppliers/:id', async (req, res) => {
    try {
      await storage.deleteSupplier(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete supplier' });
    }
  });

  app.get('/api/suppliers/search/:query', async (req, res) => {
    try {
      const suppliers = await storage.searchSuppliers(req.params.query);
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to search suppliers' });
    }
  });

  // Supplier Reviews
  app.get('/api/suppliers/:id/reviews', async (req, res) => {
    try {
      const reviews = await storage.getSupplierReviews(parseInt(req.params.id));
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  });

  app.post('/api/suppliers/:id/reviews', async (req, res) => {
    try {
      const supplierId = parseInt(req.params.id);
      const { rating, comment } = req.body;
      
      // Mock user ID - in real app this would come from authentication
      const userId = 1;
      
      const review = await storage.createSupplierReview({
        supplierId,
        userId,
        rating,
        comment,
        isApproved: false
      });
      
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create review' });
    }
  });

  // Supplier Brands
  app.get('/api/suppliers/:id/brands', async (req, res) => {
    try {
      const supplierId = parseInt(req.params.id);
      const brands = await storage.getSupplierBrands(supplierId);
      res.json(brands);
    } catch (error) {
      console.error('Error fetching supplier brands:', error);
      res.status(500).json({ error: 'Failed to fetch brands' });
    }
  });

  app.post('/api/suppliers/:id/brands', async (req, res) => {
    try {
      const supplierId = parseInt(req.params.id);
      const brandData = {
        ...req.body,
        supplierId,
      };
      const brand = await storage.createSupplierBrand(brandData);
      res.status(201).json(brand);
    } catch (error) {
      console.error('Error creating supplier brand:', error);
      res.status(500).json({ error: 'Failed to create brand' });
    }
  });

  app.get('/api/suppliers/:id/brands', requireAuth, async (req: any, res: any) => {
    try {
      const supplierId = parseInt(req.params.id);
      const brands = await storage.getSupplierBrands(supplierId);
      res.json(brands);
    } catch (error) {
      console.error('Error fetching supplier brands:', error);
      res.status(500).json({ error: 'Failed to fetch brands' });
    }
  });

  app.delete('/api/suppliers/brands/:brandId', async (req, res) => {
    try {
      const brandId = parseInt(req.params.brandId);
      await storage.deleteSupplierBrand(brandId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting supplier brand:', error);
      res.status(500).json({ error: 'Failed to delete brand' });
    }
  });

  // Supplier Conversations endpoints
  app.get('/api/suppliers/:id/conversations', requireAuth, async (req: any, res: any) => {
    try {
      const supplierId = parseInt(req.params.id);
      const userId = req.user?.id;
      const conversations = await storage.getSupplierConversations(supplierId, userId);
      res.json(conversations);
    } catch (error) {
      console.error('Error fetching supplier conversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  });

  app.post('/api/suppliers/:id/conversations', requireAuth, async (req: any, res: any) => {
    try {
      const supplierId = parseInt(req.params.id);
      const userId = req.user?.id;
      const conversationData = { ...req.body, supplierId, userId };
      const conversation = await storage.createSupplierConversation(conversationData);
      res.status(201).json(conversation);
    } catch (error) {
      console.error('Error creating supplier conversation:', error);
      res.status(500).json({ error: 'Failed to create conversation' });
    }
  });

  app.put('/api/supplier-conversations/:id', requireAuth, async (req: any, res: any) => {
    try {
      const conversationId = parseInt(req.params.id);
      const userId = req.user?.id;
      const conversation = await storage.updateSupplierConversation(conversationId, userId, req.body);
      res.json(conversation);
    } catch (error) {
      console.error('Error updating supplier conversation:', error);
      res.status(500).json({ error: 'Failed to update conversation' });
    }
  });

  app.delete('/api/supplier-conversations/:id', requireAuth, async (req: any, res: any) => {
    try {
      const conversationId = parseInt(req.params.id);
      const userId = req.user?.id;
      await storage.deleteSupplierConversation(conversationId, userId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting supplier conversation:', error);
      res.status(500).json({ error: 'Failed to delete conversation' });
    }
  });

  // Departments endpoint
  app.get('/api/departments', async (req, res) => {
    try {
      const allDepartments = await db.select().from(departments).orderBy(departments.name);
      res.json(allDepartments);
    } catch (error) {
      console.error('Error fetching departments:', error);
      res.status(500).json({ error: 'Failed to fetch departments' });
    }
  });

  // Supplier Contacts endpoints
  app.get('/api/suppliers/:id/contacts', requireAuth, async (req: any, res: any) => {
    try {
      const supplierId = parseInt(req.params.id);
      const userId = req.user?.id;
      const contacts = await storage.getSupplierContacts(supplierId, userId);
      res.json(contacts);
    } catch (error) {
      console.error('Error fetching supplier contacts:', error);
      res.status(500).json({ error: 'Failed to fetch contacts' });
    }
  });

  app.post('/api/suppliers/:id/contacts', requireAuth, async (req: any, res: any) => {
    try {
      const supplierId = parseInt(req.params.id);
      const userId = req.user?.id;
      const contactData = { ...req.body, supplierId, userId };
      const contact = await storage.createSupplierContact(contactData);
      res.status(201).json(contact);
    } catch (error) {
      console.error('Error creating supplier contact:', error);
      res.status(500).json({ error: 'Failed to create contact' });
    }
  });

  app.put('/api/supplier-contacts/:id', requireAuth, async (req: any, res: any) => {
    try {
      const contactId = parseInt(req.params.id);
      const userId = req.user?.id;
      const contact = await storage.updateSupplierContact(contactId, userId, req.body);
      res.json(contact);
    } catch (error) {
      console.error('Error updating supplier contact:', error);
      res.status(500).json({ error: 'Failed to update contact' });
    }
  });

  app.delete('/api/supplier-contacts/:id', requireAuth, async (req: any, res: any) => {
    try {
      const contactId = parseInt(req.params.id);
      const userId = req.user?.id;
      await storage.deleteSupplierContact(contactId, userId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting supplier contact:', error);
      res.status(500).json({ error: 'Failed to delete contact' });
    }
  });

  // Supplier Files endpoints
  app.get('/api/suppliers/:id/files', requireAuth, async (req: any, res: any) => {
    try {
      const supplierId = parseInt(req.params.id);
      const userId = req.user?.id;
      const files = await storage.getSupplierFiles(supplierId, userId);
      res.json(files);
    } catch (error) {
      console.error('Error fetching supplier files:', error);
      res.status(500).json({ error: 'Failed to fetch files' });
    }
  });

  app.post('/api/suppliers/:id/files', requireAuth, async (req: any, res: any) => {
    try {
      const supplierId = parseInt(req.params.id);
      const userId = req.user?.id;
      const fileData = { ...req.body, supplierId, userId };
      const file = await storage.createSupplierFile(fileData);
      res.status(201).json(file);
    } catch (error) {
      console.error('Error creating supplier file:', error);
      res.status(500).json({ error: 'Failed to create file' });
    }
  });

  app.delete('/api/supplier-files/:id', requireAuth, async (req: any, res: any) => {
    try {
      const fileId = parseInt(req.params.id);
      const userId = req.user?.id;
      await storage.deleteSupplierFile(fileId, userId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting supplier file:', error);
      res.status(500).json({ error: 'Failed to delete file' });
    }
  });

  // Product Brands endpoints
  // Categories endpoint
  app.get('/api/categories', async (req, res) => {
    try {
      const categoryList = await db.select()
        .from(categories)
        .orderBy(asc(categories.name));

      res.json(categoryList);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  app.get('/api/brands', requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      // Get all brands that are either global or belong to the user
      const userBrands = await db.select()
        .from(brands)
        .where(
          or(
            eq(brands.isGlobal, true),
            eq(brands.userId, userId as any)
          )
        )
        .orderBy(asc(brands.name));

      res.json(userBrands);
    } catch (error) {
      console.error('Error fetching brands:', error);
      res.status(500).json({ error: 'Failed to fetch brands' });
    }
  });

  app.post('/api/brands', requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      const { name } = req.body;

      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Nome da marca é obrigatório' });
      }

      // Check if brand already exists for this user
      const existingBrand = await db.select()
        .from(brands)
        .where(
          and(
            eq(brands.name, name.trim()),
            eq(brands.userId, userId as any)
          )
        )
        .limit(1);

      if (existingBrand.length > 0) {
        return res.status(400).json({ error: 'Marca já existe' });
      }

      const [newBrand] = await db.insert(brands).values({
        name: name.trim(),
        userId: userId,
        isGlobal: false,
      }).returning();

      res.json(newBrand);
    } catch (error) {
      console.error('Error creating brand:', error);
      res.status(500).json({ error: 'Failed to create brand' });
    }
  });

  app.delete('/api/brands/:id', requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      const brandId = parseInt(req.params.id);

      // Check if brand belongs to user and is not global
      const brandResult = await db.select()
        .from(brands)
        .where(
          and(
            eq(brands.id, brandId),
            eq(brands.userId, userId as any),
            eq(brands.isGlobal, false)
          )
        )
        .limit(1);

      if (brandResult.length === 0) {
        return res.status(404).json({ error: 'Marca não encontrada ou não pode ser excluída' });
      }

      await db.delete(brands).where(eq(brands.id, brandId));

      res.json({ message: 'Marca excluída com sucesso' });
    } catch (error) {
      console.error('Error deleting brand:', error);
      res.status(500).json({ error: 'Failed to delete brand' });
    }
  });

  // Partners
  app.get('/api/partners', async (req, res) => {
    try {
      const partners = await storage.getPartnersWithReviewStats();
      res.json(partners);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch partners' });
    }
  });

  app.get('/api/partners/:id', async (req, res) => {
    try {
      const partner = await storage.getPartnerWithReviewStats(parseInt(req.params.id));
      if (!partner) {
        return res.status(404).json({ error: 'Partner not found' });
      }
      res.json(partner);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch partner' });
    }
  });

  app.post('/api/partners', async (req, res) => {
    try {
      const validatedData = insertPartnerSchema.parse(req.body);
      const partner = await storage.createPartner(validatedData);
      res.status(201).json(partner);
    } catch (error) {
      res.status(400).json({ error: 'Invalid partner data' });
    }
  });

  app.put('/api/partners/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPartnerSchema.partial().parse(req.body);
      const partner = await storage.updatePartner(id, validatedData);
      res.json(partner);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update partner' });
    }
  });

  app.delete('/api/partners/:id', async (req, res) => {
    try {
      await storage.deletePartner(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete partner' });
    }
  });

  app.get('/api/partners/search/:query', async (req, res) => {
    try {
      const partners = await storage.searchPartners(req.params.query);
      res.json(partners);
    } catch (error) {
      res.status(500).json({ error: 'Failed to search partners' });
    }
  });



  // Tools
  app.get('/api/tools', async (req, res) => {
    try {
      const tools = await storage.getTools();
      res.json(tools);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tools' });
    }
  });

  app.get('/api/tools/:id', async (req, res) => {
    try {
      const tool = await storage.getTool(parseInt(req.params.id));
      if (!tool) {
        return res.status(404).json({ error: 'Tool not found' });
      }
      res.json(tool);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tool' });
    }
  });

  app.post('/api/tools', async (req, res) => {
    try {
      const validatedData = insertToolSchema.parse(req.body);
      const tool = await storage.createTool(validatedData);
      res.status(201).json(tool);
    } catch (error) {
      res.status(400).json({ error: 'Invalid tool data' });
    }
  });

  app.put('/api/tools/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertToolSchema.partial().parse(req.body);
      const tool = await storage.updateTool(id, validatedData);
      res.json(tool);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update tool' });
    }
  });

  app.delete('/api/tools/:id', async (req, res) => {
    try {
      await storage.deleteTool(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete tool' });
    }
  });

  app.get('/api/tools/search/:query', async (req, res) => {
    try {
      const tools = await storage.searchTools(req.params.query);
      res.json(tools);
    } catch (error) {
      res.status(500).json({ error: 'Failed to search tools' });
    }
  });

  // Templates
  app.get('/api/templates', async (req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  });

  app.get('/api/templates/:id', async (req, res) => {
    try {
      const template = await storage.getTemplate(parseInt(req.params.id));
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch template' });
    }
  });

  app.post('/api/templates', async (req, res) => {
    try {
      const validatedData = insertTemplateSchema.parse(req.body);
      const template = await storage.createTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      res.status(400).json({ error: 'Invalid template data' });
    }
  });

  app.put('/api/templates/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTemplateSchema.partial().parse(req.body);
      const template = await storage.updateTemplate(id, validatedData);
      res.json(template);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update template' });
    }
  });

  app.delete('/api/templates/:id', async (req, res) => {
    try {
      await storage.deleteTemplate(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete template' });
    }
  });

  app.get('/api/templates/search/:query', async (req, res) => {
    try {
      const templates = await storage.searchTemplates(req.params.query);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: 'Failed to search templates' });
    }
  });

  // Prompts
  app.get('/api/prompts', async (req, res) => {
    try {
      const prompts = await storage.getPrompts();
      res.json(prompts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch prompts' });
    }
  });

  app.get('/api/prompts/:id', async (req, res) => {
    try {
      const prompt = await storage.getPrompt(parseInt(req.params.id));
      if (!prompt) {
        return res.status(404).json({ error: 'Prompt not found' });
      }
      res.json(prompt);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch prompt' });
    }
  });

  app.post('/api/prompts', async (req, res) => {
    try {
      const validatedData = insertPromptSchema.parse(req.body);
      const prompt = await storage.createPrompt(validatedData);
      res.status(201).json(prompt);
    } catch (error) {
      res.status(400).json({ error: 'Invalid prompt data' });
    }
  });

  app.put('/api/prompts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPromptSchema.partial().parse(req.body);
      const prompt = await storage.updatePrompt(id, validatedData);
      res.json(prompt);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update prompt' });
    }
  });

  app.delete('/api/prompts/:id', async (req, res) => {
    try {
      await storage.deletePrompt(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete prompt' });
    }
  });

  app.get('/api/prompts/search/:query', async (req, res) => {
    try {
      const prompts = await storage.searchPrompts(req.params.query);
      res.json(prompts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to search prompts' });
    }
  });

  // Products
  // PRODUCTS ROUTES MOVED TO MODULAR SYSTEM: server/routes/productRoutes.ts
  // PHASE 4: Products Domain Modularization - SOLID/DRY/KISS Implementation

  // POST /api/products MOVED TO MODULAR SYSTEM: server/routes/productRoutes.ts

  // PUT /api/products/:id MOVED TO MODULAR SYSTEM: server/routes/productRoutes.ts

  // DELETE /api/products/:id MOVED TO MODULAR SYSTEM: server/routes/productRoutes.ts

  // GET /api/products/:id/cost-history MOVED TO MODULAR SYSTEM: server/routes/productRoutes.ts

  // GET /api/products/search/:query MOVED TO MODULAR SYSTEM: server/routes/productRoutes.ts

  // Categories
  app.get('/api/categories', async (req, res) => {
    try {
      const type = req.query.type as string;
      const categories = await storage.getCategories(type);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  app.get('/api/categories/:id', async (req, res) => {
    try {
      const category = await storage.getCategory(parseInt(req.params.id));
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch category' });
    }
  });

  app.post('/api/categories', async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ error: 'Invalid category data' });
    }
  });

  app.put('/api/categories/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, validatedData);
      res.json(category);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update category' });
    }
  });

  app.delete('/api/categories/:id', async (req, res) => {
    try {
      await storage.deleteCategory(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete category' });
    }
  });

  // Departments
  app.get('/api/departments', async (req, res) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch departments' });
    }
  });

  app.get('/api/departments/:id', async (req, res) => {
    try {
      const department = await storage.getDepartment(parseInt(req.params.id));
      if (!department) {
        return res.status(404).json({ error: 'Department not found' });
      }
      res.json(department);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch department' });
    }
  });

  app.post('/api/departments', async (req, res) => {
    try {
      const validatedData = insertDepartmentSchema.parse(req.body);
      const department = await storage.createDepartment(validatedData);
      res.status(201).json(department);
    } catch (error) {
      res.status(400).json({ error: 'Invalid department data' });
    }
  });

  app.put('/api/departments/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDepartmentSchema.partial().parse(req.body);
      const department = await storage.updateDepartment(id, validatedData);
      res.json(department);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update department' });
    }
  });

  app.delete('/api/departments/:id', async (req, res) => {
    try {
      await storage.deleteDepartment(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete department' });
    }
  });

  // Template Categories
  app.get('/api/template-categories', async (req, res) => {
    try {
      const categories = await storage.getTemplateCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch template categories' });
    }
  });

  app.get('/api/template-categories/:id', async (req, res) => {
    try {
      const category = await storage.getTemplateCategory(parseInt(req.params.id));
      if (!category) {
        return res.status(404).json({ error: 'Template category not found' });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch template category' });
    }
  });

  app.post('/api/template-categories', async (req, res) => {
    try {
      const validatedData = insertTemplateCategorySchema.parse(req.body);
      const category = await storage.createTemplateCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ error: 'Invalid template category data' });
    }
  });

  app.put('/api/template-categories/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTemplateCategorySchema.partial().parse(req.body);
      const category = await storage.updateTemplateCategory(id, validatedData);
      res.json(category);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update template category' });
    }
  });

  app.delete('/api/template-categories/:id', async (req, res) => {
    try {
      await storage.deleteTemplateCategory(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete template category' });
    }
  });

  // Prompt Categories
  app.get('/api/prompt-categories', async (req, res) => {
    try {
      const categories = await storage.getPromptCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch prompt categories' });
    }
  });

  app.get('/api/prompt-categories/:id', async (req, res) => {
    try {
      const category = await storage.getPromptCategory(parseInt(req.params.id));
      if (!category) {
        return res.status(404).json({ error: 'Prompt category not found' });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch prompt category' });
    }
  });

  app.post('/api/prompt-categories', async (req, res) => {
    try {
      const validatedData = insertPromptCategorySchema.parse(req.body);
      const category = await storage.createPromptCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ error: 'Invalid prompt category data' });
    }
  });

  app.put('/api/prompt-categories/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPromptCategorySchema.partial().parse(req.body);
      const category = await storage.updatePromptCategory(id, validatedData);
      res.json(category);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update prompt category' });
    }
  });

  app.delete('/api/prompt-categories/:id', async (req, res) => {
    try {
      await storage.deletePromptCategory(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete prompt category' });
    }
  });

  // Tool Types
  app.get('/api/tool-types', async (req, res) => {
    try {
      const toolTypes = await storage.getToolTypes();
      res.json(toolTypes);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tool types' });
    }
  });

  app.get('/api/tool-types/:id', async (req, res) => {
    try {
      const toolType = await storage.getToolType(parseInt(req.params.id));
      if (!toolType) {
        return res.status(404).json({ error: 'Tool type not found' });
      }
      res.json(toolType);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tool type' });
    }
  });

  app.post('/api/tool-types', async (req, res) => {
    try {
      const validatedData = insertToolTypeSchema.parse(req.body);
      const toolType = await storage.createToolType(validatedData);
      res.status(201).json(toolType);
    } catch (error) {
      res.status(400).json({ error: 'Invalid tool type data' });
    }
  });

  app.put('/api/tool-types/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertToolTypeSchema.partial().parse(req.body);
      const toolType = await storage.updateToolType(id, validatedData);
      res.json(toolType);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update tool type' });
    }
  });

  app.delete('/api/tool-types/:id', async (req, res) => {
    try {
      await storage.deleteToolType(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete tool type' });
    }
  });





  // Amazon Listing Optimizer Routes

  // CREATE: Create a new Amazon listing session
  app.post('/api/amazon-sessions', requireAuth, async (req: any, res: any) => {
    try {
      const userId = req.user?.id;
      const { idUsuario } = req.body;
      
      if (!userId || !idUsuario) {
        return res.status(400).json({ error: 'User ID required' });
      }

      // Import here to avoid module loading issues
      const { AmazonListingService } = await import('./services/amazonListingService');
      const amazonListingService = new AmazonListingService();
      const session = await amazonListingService.createSession(userId);
      res.status(201).json({ session });
    } catch (error) {
      console.error('Error creating Amazon listing session:', error);
      res.status(500).json({ error: 'Failed to create session' });
    }
  });

  // READ: Get Amazon listing session by ID
  app.get('/api/amazon-sessions/:sessionId', requireAuth, async (req: any, res: any) => {
    try {
      const { sessionId } = req.params;
      const { AmazonListingService } = await import('./services/amazonListingService');
      const amazonListingService = new AmazonListingService();
      const session = await amazonListingService.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      res.json(session);
    } catch (error) {
      console.error('Error fetching Amazon listing session:', error);
      res.status(500).json({ error: 'Failed to fetch session' });
    }
  });

  // UPDATE: Update session data
  app.put('/api/amazon-sessions/:sessionId/data', requireAuth, async (req: any, res: any) => {
    try {
      const { sessionId } = req.params;
      const sessionData = req.body;
      
      const { AmazonListingService } = await import('./services/amazonListingService');
      const amazonListingService = new AmazonListingService();
      await amazonListingService.updateSessionData(sessionId, sessionData);
      res.json({ message: 'Session data updated successfully' });
    } catch (error) {
      console.error('Error updating Amazon listing session data:', error);
      res.status(500).json({ error: 'Failed to update session data' });
    }
  });

  // PROCESS: Files processing endpoint
  app.post('/api/amazon-sessions/:sessionId/files/process', requireAuth, async (req: any, res: any) => {
    try {
      const { sessionId } = req.params;
      const { files } = req.body;
      
      console.log('📁 Processing files for session:', sessionId, 'files count:', files.length);
      
      // Combinar conteúdo de todos os arquivos
      let combinedContent = '';
      
      for (const file of files) {
        console.log('📄 Processing file:', file.name);
        
        // Adicionar cabeçalho do arquivo
        combinedContent += `\n\n=== ARQUIVO: ${file.name} ===\n`;
        combinedContent += file.content || '';
      }
      
      console.log('📊 Combined content length:', combinedContent.length);
      
      // Atualizar sessão com dados das avaliações
      const { AmazonListingService } = await import('./services/amazonListingService');
      const amazonListingService = new AmazonListingService();
      await amazonListingService.updateSessionData(sessionId, {
        reviewsData: combinedContent,
        status: 'files_processed'
      });
      
      res.json({ combinedContent });
    } catch (error) {
      console.error('Error processing files:', error);
      res.status(500).json({ error: 'Failed to process files' });
    }
  });

  // STEP 1: Analysis of Reviews
  app.post('/api/amazon-sessions/:sessionId/step1', requireAuth, async (req: any, res: any) => {
    try {
      const { sessionId } = req.params;
      const { AmazonListingService } = await import('./services/amazonListingService');
      const amazonListingService = new AmazonListingService();
      const result = await amazonListingService.processStep1_AnalysisReviews(sessionId);
      res.json(result);
    } catch (error: any) {
      console.error('Error processing step 1 (Analysis):', error);
      res.status(500).json({ error: error.message || 'Failed to process analysis step' });
    }
  });

  // STEP 2: Generate Titles
  app.post('/api/amazon-sessions/:sessionId/step2', requireAuth, async (req: any, res: any) => {
    try {
      const { sessionId } = req.params;
      const { AmazonListingService } = await import('./services/amazonListingService');
      const amazonListingService = new AmazonListingService();
      const result = await amazonListingService.processStep2_GenerateTitles(sessionId);
      res.json(result);
    } catch (error: any) {
      console.error('Error processing step 2 (Titles):', error);
      res.status(500).json({ error: error.message || 'Failed to generate titles' });
    }
  });

  // STEP 3: Generate Bullet Points
  app.post('/api/amazon-sessions/:sessionId/step3', requireAuth, async (req: any, res: any) => {
    try {
      const { sessionId } = req.params;
      const { AmazonListingService } = await import('./services/amazonListingService');
      const amazonListingService = new AmazonListingService();
      const result = await amazonListingService.processStep3_BulletPoints(sessionId);
      res.json(result);
    } catch (error: any) {
      console.error('Error processing step 3 (Bullet Points):', error);
      res.status(500).json({ error: error.message || 'Failed to generate bullet points' });
    }
  });

  // STEP 4: Generate Description
  app.post('/api/amazon-sessions/:sessionId/step4', requireAuth, async (req: any, res: any) => {
    try {
      const { sessionId } = req.params;
      const { AmazonListingService } = await import('./services/amazonListingService');
      const amazonListingService = new AmazonListingService();
      const result = await amazonListingService.processStep4_Description(sessionId);
      res.json(result);
    } catch (error: any) {
      console.error('Error processing step 4 (Description):', error);
      res.status(500).json({ error: error.message || 'Failed to generate description' });
    }
  });

  // ABORT: Abort processing
  app.post('/api/amazon-sessions/:sessionId/abort', requireAuth, async (req: any, res: any) => {
    try {
      const { sessionId } = req.params;
      const { AmazonListingService } = await import('./services/amazonListingService');
      const amazonListingService = new AmazonListingService();
      await amazonListingService.abortProcessing(sessionId);
      res.json({ message: 'Processing aborted successfully' });
    } catch (error) {
      console.error('Error aborting processing:', error);
      res.status(500).json({ error: 'Failed to abort processing' });
    }
  });

  // DOWNLOAD: Download results
  app.get('/api/amazon-sessions/:sessionId/download', requireAuth, async (req: any, res: any) => {
    try {
      const { sessionId } = req.params;
      const { AmazonListingService } = await import('./services/amazonListingService');
      const amazonListingService = new AmazonListingService();
      const session = await amazonListingService.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Generate downloadable content
      const content = amazonListingService.generateDownloadContent(session);
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="amazon-listing-${sessionId}.txt"`);
      res.send(content);
    } catch (error) {
      console.error('Error downloading results:', error);
      res.status(500).json({ error: 'Failed to download results' });
    }
  });



  // News routes
  app.get('/api/news', async (req, res) => {
    try {
      const news = await storage.getNews();
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch news' });
    }
  });

  app.get('/api/news/published', async (req, res) => {
    try {
      const news = await storage.getPublishedNews();
      // Add caching headers
      res.set({
        'Cache-Control': 'public, max-age=300', // 5 minutes
        'ETag': `"news-${Date.now()}"`,
      });
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch published news' });
    }
  });

  // Lightweight endpoint for dashboard
  app.get('/api/news/published/preview', async (req, res) => {
    try {
      const news = await storage.getPublishedNewsPreview();
      res.set({
        'Cache-Control': 'public, max-age=180', // 3 minutes
        'ETag': `"news-preview-${Date.now()}"`,
      });
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch news preview' });
    }
  });

  app.get('/api/news/:id', async (req, res) => {
    try {
      const news = await storage.getNewsById(parseInt(req.params.id));
      if (!news) {
        return res.status(404).json({ error: 'News not found' });
      }
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch news' });
    }
  });

  app.post('/api/news', async (req, res) => {
    try {
      const validatedData = insertNewsSchema.parse(req.body);
      const news = await storage.createNews(validatedData);
      
      // Broadcast real-time notification
      broadcastNotification('news_created', {
        id: news.id,
        title: news.title,
        summary: news.summary,
        category: news.category,
        isPublished: news.isPublished,
        isFeatured: news.isFeatured
      });
      
      res.status(201).json(news);
    } catch (error) {
      res.status(400).json({ error: 'Invalid news data' });
    }
  });

  app.put('/api/news/:id', async (req, res) => {
    try {
      console.log('PUT /api/news/:id - Request body:', req.body);
      const validatedData = insertNewsSchema.partial().parse(req.body);
      console.log('PUT /api/news/:id - Validated data:', validatedData);
      const news = await storage.updateNews(parseInt(req.params.id), validatedData);
      
      // Broadcast real-time notification
      broadcastNotification('news_updated', {
        id: news.id,
        title: news.title,
        summary: news.summary,
        category: news.category,
        isPublished: news.isPublished,
        isFeatured: news.isFeatured
      });
      
      res.json(news);
    } catch (error: any) {
      console.error('PUT /api/news/:id - Error:', error);
      res.status(400).json({ 
        error: 'Invalid news data', 
        details: error?.message || String(error) 
      });
    }
  });

  app.delete('/api/news/:id', async (req, res) => {
    try {
      const newsId = parseInt(req.params.id);
      await storage.deleteNews(newsId);
      
      // Broadcast real-time notification
      broadcastNotification('news_deleted', {
        id: newsId
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete news' });
    }
  });

  // Updates routes
  app.get('/api/updates', async (req, res) => {
    try {
      const updates = await storage.getUpdates();
      res.json(updates);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch updates' });
    }
  });

  app.get('/api/updates/published', async (req, res) => {
    try {
      const updates = await storage.getPublishedUpdates();
      // Add caching headers
      res.set({
        'Cache-Control': 'public, max-age=300', // 5 minutes
        'ETag': `"updates-${Date.now()}"`,
      });
      res.json(updates);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch published updates' });
    }
  });

  // Lightweight endpoint for dashboard
  app.get('/api/updates/published/preview', async (req, res) => {
    try {
      const updates = await storage.getPublishedUpdatesPreview();
      res.set({
        'Cache-Control': 'public, max-age=180', // 3 minutes
        'ETag': `"updates-preview-${Date.now()}"`,
      });
      res.json(updates);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch updates preview' });
    }
  });

  app.get('/api/updates/:id', async (req, res) => {
    try {
      const update = await storage.getUpdate(parseInt(req.params.id));
      if (!update) {
        return res.status(404).json({ error: 'Update not found' });
      }
      res.json(update);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch update' });
    }
  });

  app.post('/api/updates', async (req, res) => {
    try {
      const validatedData = insertUpdateSchema.parse(req.body);
      const update = await storage.createUpdate(validatedData);
      res.status(201).json(update);
    } catch (error) {
      res.status(400).json({ error: 'Invalid update data' });
    }
  });

  app.put('/api/updates/:id', async (req, res) => {
    try {
      const validatedData = insertUpdateSchema.partial().parse(req.body);
      const update = await storage.updateUpdate(parseInt(req.params.id), validatedData);
      res.json(update);
    } catch (error) {
      res.status(400).json({ error: 'Invalid update data' });
    }
  });

  app.delete('/api/updates/:id', async (req, res) => {
    try {
      await storage.deleteUpdate(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete update' });
    }
  });



  // Partner Types routes
  app.get('/api/partner-types', async (req, res) => {
    try {
      const partnerTypes = await storage.getPartnerTypes();
      res.json(partnerTypes);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch partner types' });
    }
  });

  app.get('/api/partner-types/:id', async (req, res) => {
    try {
      const partnerType = await storage.getPartnerType(parseInt(req.params.id));
      if (!partnerType) {
        return res.status(404).json({ error: 'Partner type not found' });
      }
      res.json(partnerType);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch partner type' });
    }
  });

  app.post('/api/partner-types', async (req, res) => {
    try {
      const validatedData = insertPartnerTypeSchema.parse(req.body);
      const partnerType = await storage.createPartnerType(validatedData);
      res.status(201).json(partnerType);
    } catch (error) {
      res.status(400).json({ error: 'Invalid partner type data' });
    }
  });

  app.put('/api/partner-types/:id', async (req, res) => {
    try {
      const validatedData = insertPartnerTypeSchema.partial().parse(req.body);
      const partnerType = await storage.updatePartnerType(parseInt(req.params.id), validatedData);
      res.json(partnerType);
    } catch (error) {
      res.status(400).json({ error: 'Invalid partner type data' });
    }
  });

  app.delete('/api/partner-types/:id', async (req, res) => {
    try {
      await storage.deletePartnerType(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete partner type' });
    }
  });

  // Partner Contacts routes
  app.get('/api/partners/:partnerId/contacts', async (req, res) => {
    try {
      const contacts = await storage.getPartnerContacts(parseInt(req.params.partnerId));
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch partner contacts' });
    }
  });

  app.get('/api/partner-contacts/:id', async (req, res) => {
    try {
      const contact = await storage.getPartnerContact(parseInt(req.params.id));
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch contact' });
    }
  });

  app.post('/api/partner-contacts', async (req, res) => {
    try {
      const validatedData = insertPartnerContactSchema.parse(req.body);
      const contact = await storage.createPartnerContact(validatedData);
      res.status(201).json(contact);
    } catch (error) {
      res.status(400).json({ error: 'Invalid contact data' });
    }
  });

  app.put('/api/partner-contacts/:id', async (req, res) => {
    try {
      const validatedData = insertPartnerContactSchema.partial().parse(req.body);
      const contact = await storage.updatePartnerContact(parseInt(req.params.id), validatedData);
      res.json(contact);
    } catch (error) {
      res.status(400).json({ error: 'Invalid contact data' });
    }
  });

  app.delete('/api/partner-contacts/:id', async (req, res) => {
    try {
      await storage.deletePartnerContact(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete contact' });
    }
  });

  // Partner Files routes
  app.get('/api/partners/:partnerId/files', async (req, res) => {
    try {
      const files = await storage.getPartnerFiles(parseInt(req.params.partnerId));
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch partner files' });
    }
  });

  app.get('/api/partner-files/:id', async (req, res) => {
    try {
      const file = await storage.getPartnerFile(parseInt(req.params.id));
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
      res.json(file);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch file' });
    }
  });

  app.post('/api/partner-files', async (req, res) => {
    try {
      const validatedData = insertPartnerFileSchema.parse(req.body);
      const file = await storage.createPartnerFile(validatedData);
      res.status(201).json(file);
    } catch (error) {
      res.status(400).json({ error: 'Invalid file data' });
    }
  });

  app.put('/api/partner-files/:id', async (req, res) => {
    try {
      const validatedData = insertPartnerFileSchema.partial().parse(req.body);
      const file = await storage.updatePartnerFile(parseInt(req.params.id), validatedData);
      res.json(file);
    } catch (error) {
      res.status(400).json({ error: 'Invalid file data' });
    }
  });

  app.delete('/api/partner-files/:id', async (req, res) => {
    try {
      await storage.deletePartnerFile(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete file' });
    }
  });

  // Partner Reviews routes
  app.get('/api/partners/:partnerId/reviews', async (req, res) => {
    try {
      const reviews = await storage.getPartnerReviews(parseInt(req.params.partnerId));
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch partner reviews' });
    }
  });

  app.post('/api/partners/:partnerId/reviews', async (req, res) => {
    try {
      const partnerId = parseInt(req.params.partnerId);
      const validatedData = insertPartnerReviewSchema.parse({
        ...req.body,
        partnerId,
        userId: 1 // TODO: Get from authenticated user session
      });
      const review = await storage.createPartnerReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ error: 'Invalid review data' });
    }
  });

  app.put('/api/partner-reviews/:id', async (req, res) => {
    try {
      const validatedData = insertPartnerReviewSchema.partial().parse(req.body);
      const review = await storage.updatePartnerReview(parseInt(req.params.id), validatedData);
      res.json(review);
    } catch (error) {
      res.status(400).json({ error: 'Invalid review data' });
    }
  });

  app.delete('/api/partner-reviews/:id', async (req, res) => {
    try {
      await storage.deletePartnerReview(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete review' });
    }
  });

  // Partner Review Replies routes
  app.get('/api/partner-reviews/:reviewId/replies', async (req, res) => {
    try {
      const replies = await storage.getPartnerReviewReplies(parseInt(req.params.reviewId));
      res.json(replies);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch review replies' });
    }
  });

  app.post('/api/partner-reviews/:reviewId/replies', async (req, res) => {
    try {
      const reviewId = parseInt(req.params.reviewId);
      const validatedData = insertPartnerReviewReplySchema.parse({
        ...req.body,
        reviewId,
        userId: 1 // TODO: Get from authenticated user session
      });
      const reply = await storage.createPartnerReviewReply(validatedData);
      res.status(201).json(reply);
    } catch (error) {
      res.status(400).json({ error: 'Invalid reply data' });
    }
  });

  app.put('/api/partner-review-replies/:id', async (req, res) => {
    try {
      const validatedData = insertPartnerReviewReplySchema.partial().parse(req.body);
      const reply = await storage.updatePartnerReviewReply(parseInt(req.params.id), validatedData);
      res.json(reply);
    } catch (error) {
      res.status(400).json({ error: 'Invalid reply data' });
    }
  });

  app.delete('/api/partner-review-replies/:id', async (req, res) => {
    try {
      await storage.deletePartnerReviewReply(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete reply' });
    }
  });

  // Tool Reviews
  app.get('/api/tools/:toolId/reviews', async (req, res) => {
    try {
      const toolId = parseInt(req.params.toolId);
      const reviews = await storage.getToolReviews(toolId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tool reviews' });
    }
  });

  app.post('/api/tools/:toolId/reviews', async (req, res) => {
    try {
      const toolId = parseInt(req.params.toolId);
      const validatedData = insertToolReviewSchema.parse({
        ...req.body,
        toolId,
        userId: 1 // TODO: Get from authenticated user session
      });
      const review = await storage.createToolReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ error: 'Invalid review data' });
    }
  });

  app.delete('/api/tools/reviews/:id', async (req, res) => {
    try {
      await storage.deleteToolReview(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete review' });
    }
  });

  // Tool Review Replies
  app.post('/api/tools/reviews/:reviewId/replies', async (req, res) => {
    try {
      const reviewId = parseInt(req.params.reviewId);
      const validatedData = insertToolReviewReplySchema.parse({
        ...req.body,
        reviewId,
        userId: 1 // TODO: Get from authenticated user session
      });
      const reply = await storage.createToolReviewReply(validatedData);
      res.status(201).json(reply);
    } catch (error) {
      res.status(400).json({ error: 'Invalid reply data' });
    }
  });

  // Tool Discounts
  app.get('/api/tools/:toolId/discounts', async (req, res) => {
    try {
      const toolId = parseInt(req.params.toolId);
      const discounts = await storage.getToolDiscounts(toolId);
      res.json(discounts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tool discounts' });
    }
  });

  app.post('/api/tools/:toolId/discounts', async (req, res) => {
    try {
      const toolId = parseInt(req.params.toolId);
      const validatedData = insertToolDiscountSchema.parse({
        ...req.body,
        toolId
      });
      const discount = await storage.createToolDiscount(validatedData);
      res.status(201).json(discount);
    } catch (error) {
      res.status(400).json({ error: 'Invalid discount data' });
    }
  });

  app.put('/api/tools/discounts/:id', async (req, res) => {
    try {
      const validatedData = insertToolDiscountSchema.partial().parse(req.body);
      const discount = await storage.updateToolDiscount(parseInt(req.params.id), validatedData);
      res.json(discount);
    } catch (error) {
      res.status(400).json({ error: 'Invalid discount data' });
    }
  });

  app.delete('/api/tools/discounts/:id', async (req, res) => {
    try {
      await storage.deleteToolDiscount(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete discount' });
    }
  });

  // Tool Videos Routes
  app.get('/api/tools/:toolId/videos', async (req, res) => {
    try {
      const toolId = parseInt(req.params.toolId);
      const videos = await storage.getToolVideos(toolId);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tool videos' });
    }
  });

  app.post('/api/tools/:toolId/videos', async (req, res) => {
    try {
      const toolId = parseInt(req.params.toolId);
      const validatedData = insertToolVideoSchema.parse({
        ...req.body,
        toolId
      });
      const video = await storage.createToolVideo(validatedData);
      res.status(201).json(video);
    } catch (error) {
      res.status(400).json({ error: 'Invalid video data' });
    }
  });

  app.put('/api/tools/videos/:id', async (req, res) => {
    try {
      const validatedData = insertToolVideoSchema.partial().parse(req.body);
      const video = await storage.updateToolVideo(parseInt(req.params.id), validatedData);
      res.json(video);
    } catch (error) {
      res.status(400).json({ error: 'Invalid video data' });
    }
  });

  app.delete('/api/tools/videos/:id', async (req, res) => {
    try {
      await storage.deleteToolVideo(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete video' });
    }
  });

  // Agents API routes
  app.get('/api/agents', async (req, res) => {
    try {
      const agents = await storage.getAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch agents' });
    }
  });

  app.get('/api/agents/:id', async (req, res) => {
    try {
      let agentId = req.params.id;
      // Handle URL compatibility for amazon-product-photography
      if (agentId === 'amazon-product-photography') {
        agentId = 'agent-amazon-product-photography';
      }
      
      const agent = await storage.getAgentWithPrompts(agentId);
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }
      res.json(agent);
    } catch (error) {
      console.error('❌ [API] Error fetching agent:', error);
      res.status(500).json({ error: 'Failed to fetch agent' });
    }
  });

  app.post('/api/agents', async (req, res) => {
    try {
      const validatedData = insertAgentSchema.parse(req.body);
      const agent = await storage.createAgent(validatedData);
      res.status(201).json(agent);
    } catch (error) {
      res.status(400).json({ error: 'Invalid agent data' });
    }
  });

  app.put('/api/agents/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      console.log('PUT /api/agents/:id - Request received');
      console.log('Agent ID:', id);
      console.log('Update data:', JSON.stringify(updateData, null, 2));
      
      // Validate required fields manually first
      if (!updateData.provider || !updateData.model) {
        console.log('Validation failed - missing provider or model');
        return res.status(400).json({ 
          error: 'Invalid agent data: provider and model are required',
          received: { provider: updateData.provider, model: updateData.model }
        });
      }
      
      // Clean the update data - remove fields that shouldn't be updated directly
      const cleanUpdateData = {
        provider: updateData.provider,
        model: updateData.model,
        temperature: typeof updateData.temperature === 'number' ? updateData.temperature.toString() : updateData.temperature.toString(),
        maxTokens: parseInt(updateData.maxTokens) || 1000,
        isActive: updateData.isActive !== undefined ? updateData.isActive : true,
        costPer1kTokens: (parseFloat(updateData.costPer1kTokens) || 0.0125).toString()
      };
      
      console.log('Clean update data:', cleanUpdateData);
      
      // Use storage method instead of direct DB
      const agent = await storage.updateAgent(id, cleanUpdateData);
      console.log('Agent updated successfully:', agent);
      res.json(agent);
    } catch (error) {
      console.error('Error updating agent:', error);
      res.status(400).json({ 
        error: 'Invalid agent data', 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  });

  app.delete('/api/agents/:id', async (req, res) => {
    try {
      await storage.deleteAgent(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete agent' });
    }
  });

  // Amazon Customer Service Agent - Specific endpoints
  app.post('/api/agents/amazon-customer-service/sessions', requireAuth, async (req: any, res: any) => {
    try {
      const user = req.user;
      const { input_data } = req.body;

      // Create session with unique ID
      const sessionId = `cs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Store session data in temporary storage (in production, use database)
      const sessionData = {
        id: sessionId,
        status: 'processing',
        input_data,
        created_at: new Date().toISOString(),
        user_id: user.id
      };

      // Store in a Map for this demo (in production, use database)
      if (!global.customerServiceSessions) {
        global.customerServiceSessions = new Map();
      }
      global.customerServiceSessions.set(sessionId, sessionData);

      res.json({ sessionId });
    } catch (error: any) {
      console.error('❌ [CUSTOMER_SERVICE] Error creating session:', error);
      res.status(500).json({ error: 'Erro ao criar sessão' });
    }
  });

  app.post('/api/agents/amazon-customer-service/process', requireAuth, async (req: any, res: any) => {
    try {
      const user = req.user;
      console.log('📦 [CUSTOMER_SERVICE] Received body:', req.body);
      const { sessionId, customerName, productPurchased, emailContent, userAnalysis, isUnderWarranty, shippingFormat } = req.body;

      if (!sessionId || !emailContent || !userAnalysis) {
        console.log('❌ [CUSTOMER_SERVICE] Missing required fields:', { 
          hasSessionId: !!sessionId, 
          hasEmailContent: !!emailContent, 
          hasUserAnalysis: !!userAnalysis,
          body: req.body
        });
        return res.status(400).json({ error: 'Campos obrigatórios: sessionId, emailContent, userAnalysis' });
      }

      // Get session data
      if (!global.customerServiceSessions || !global.customerServiceSessions.has(sessionId)) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }

      const sessionData = global.customerServiceSessions.get(sessionId);

      console.log('🔗 [CUSTOMER_SERVICE] Processing with webhook - sending only client data');

      const startTime = Date.now();

      // Prepare data for webhook - ONLY client data and user analysis (no prompts!)
      const webhookData = {
        customer_name: customerName,
        product_purchased: productPurchased,
        email_content: emailContent,
        user_analysis: userAnalysis,
        is_under_warranty: isUnderWarranty,
        shipping_format: shippingFormat
      };

      console.log('🎯 [CUSTOMER_SERVICE] Sending customer data to webhook:', { 
        customerName,
        productPurchased,
        emailContentLength: emailContent.length,
        userAnalysisLength: userAnalysis.length,
        isUnderWarranty,
        shippingFormat 
      });

      // Call webhook instead of AI provider
      const webhookUrl = 'https://webhook.guivasques.app/webhook/amazon-email-responde';
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook error: ${webhookResponse.status} ${webhookResponse.statusText}`);
      }

      let webhookResult;
      const processingTime = Date.now() - startTime;
      
      try {
        const responseText = await webhookResponse.text();
        console.log('🔍 [CUSTOMER_SERVICE] Raw webhook response:', responseText);
        
        if (responseText.trim()) {
          webhookResult = JSON.parse(responseText);
        } else {
          console.log('⚠️ [CUSTOMER_SERVICE] Empty response from webhook');
          webhookResult = { message: 'Empty response' };
        }
      } catch (parseError) {
        console.error('❌ [CUSTOMER_SERVICE] JSON parse error:', parseError);
        console.log('🔍 [CUSTOMER_SERVICE] Response status:', webhookResponse.status);
        console.log('🔍 [CUSTOMER_SERVICE] Response headers:', Object.fromEntries(webhookResponse.headers.entries()));
        webhookResult = { error: 'Invalid JSON response', message: 'Webhook returned invalid response' };
      }
      
      // Extract response from webhook result with multiple possible fields
      let responseText = 'Processing in background...';
      
      // Check all possible response fields from the webhook
      if (webhookResult.response) {
        responseText = webhookResult.response;
      } else if (webhookResult.email_response) {
        responseText = webhookResult.email_response;
      } else if (webhookResult.output) {
        responseText = webhookResult.output;
      } else if (webhookResult.data && webhookResult.data.response) {
        responseText = webhookResult.data.response;
      } else if (webhookResult.result) {
        responseText = webhookResult.result;
      } else if (typeof webhookResult === 'string') {
        responseText = webhookResult;
      }

      console.log('🎯 [CUSTOMER_SERVICE] Webhook response received:', { 
        responseLength: responseText.length,
        processingTime: `${processingTime}ms`,
        webhookResult: JSON.stringify(webhookResult, null, 2),
        extractedResponse: responseText.substring(0, 200) + '...'
      });

      // Fixed values for webhook processing
      const inputTokens = 0;
      const outputTokens = 0;
      const totalTokens = 0;
      const totalCost = 0;

      // Update session with results
      // If webhook has an error, mark as failed
      if (webhookResult.error) {
        sessionData.status = 'failed';
        sessionData.error = webhookResult.message || 'Erro no webhook';
        sessionData.result_data = {
          response: 'Erro ao processar a solicitação. Tente novamente.',
          analysis: {
            customerIssue: 'Erro no processamento',
            sentiment: 'N/A',
            urgency: 'N/A'
          }
        };
      } else if (webhookResult.message === 'Workflow was started') {
        sessionData.status = 'processing';
        sessionData.result_data = {
          response: 'Aguardando processamento do webhook...',
          analysis: {
            customerIssue: 'Analisando...',
            sentiment: 'Processando...',
            urgency: 'Verificando...'
          }
        };
      } else {
        sessionData.status = 'completed';
        sessionData.completed_at = new Date().toISOString();
        sessionData.result_data = {
          response: responseText,
          analysis: {
            customerIssue: 'Produto com defeito',
            sentiment: 'Negativo',
            urgency: 'Alta'
          }
        };
      }
      sessionData.processing_time = processingTime;
      sessionData.tokens_used = { input: inputTokens, output: outputTokens, total: totalTokens };
      sessionData.cost = totalCost;

      global.customerServiceSessions.set(sessionId, sessionData);

      // Save to AI Generation Logs with AUTOMATIC CREDIT DEDUCTION
      try {
        const inputData = `Cliente: ${customerName || 'Não informado'}\nProduto: ${productPurchased || 'Não informado'}\nEmail: ${emailContent}\nAnálise: ${userAnalysis}\nGarantia: ${isUnderWarranty === true ? 'Sim' : isUnderWarranty === false ? 'Não' : 'Não informado'}\nFormato de Envio: ${shippingFormat || 'Não informado'}`;
        
        const { LoggingService } = await import('./services/loggingService');
        await LoggingService.saveAiLog(
          user.id,
          'agents.customer_service', // Feature code para dedução de créditos
          inputData,
          responseText,
          'webhook',
          'n8n-customer-service',
          inputTokens,
          outputTokens,
          totalTokens,
          totalCost,
          0, // creditsUsed = 0 para dedução automática
          processingTime
        );
        
        console.log(`💾 [AI_LOG] Saved generation log - User: ${user.id}, Model: n8n-customer-service, Cost: $${totalCost.toFixed(6)}, Characters: ${responseText.length}`);
      } catch (logError) {
        console.error('❌ [AI_LOG] Error saving generation log:', logError);
      }

      // Log usage for tracking (existing)
      try {
        const crypto = await import('crypto');
        const usageId = crypto.randomUUID();
        
        await storage.createAgentUsage({
          id: usageId,
          agentId: 'amazon-customer-service',
          userId: user.id.toString(),
          userName: user.name || user.username,
          inputTokens,
          outputTokens,
          totalTokens,
          costUsd: totalCost.toString(),
          processingTimeMs: processingTime,
          status: 'success'
        });
        
        console.log(`✅ [CUSTOMER_SERVICE] Usage logged with ID: ${usageId}`);
      } catch (logError) {
        console.error('❌ [CUSTOMER_SERVICE] Error logging usage:', logError);
      }

      res.json({ sessionId, status: 'completed' });
    } catch (error: any) {
      console.error('❌ [CUSTOMER_SERVICE] Error processing:', error);
      
      // Update session with error
      if (global.customerServiceSessions && global.customerServiceSessions.has(req.body.sessionId)) {
        const sessionData = global.customerServiceSessions.get(req.body.sessionId);
        sessionData.status = 'failed';
        sessionData.error = error.message;
        global.customerServiceSessions.set(req.body.sessionId, sessionData);
      }

      res.status(500).json({ error: error.message || 'Erro no processamento' });
    }
  });

  app.get('/api/agents/amazon-customer-service/sessions/:sessionId', requireAuth, async (req: any, res: any) => {
    try {
      const { sessionId } = req.params;
      const user = req.user;

      if (!global.customerServiceSessions || !global.customerServiceSessions.has(sessionId)) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }

      const sessionData = global.customerServiceSessions.get(sessionId);

      // Verify ownership
      if (sessionData.user_id !== user.id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      res.json(sessionData);
    } catch (error: any) {
      console.error('❌ [CUSTOMER_SERVICE] Error fetching session:', error);
      res.status(500).json({ error: 'Erro ao buscar sessão' });
    }
  });

  // Webhook callback endpoint for n8n to update results
  app.post('/api/agents/amazon-customer-service/webhook-callback', async (req: any, res: any) => {
    try {
      const { sessionId, response, error } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ error: 'SessionId é obrigatório' });
      }

      if (!global.customerServiceSessions || !global.customerServiceSessions.has(sessionId)) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }

      const sessionData = global.customerServiceSessions.get(sessionId);
      
      if (error) {
        sessionData.status = 'failed';
        sessionData.error = error;
      } else {
        sessionData.status = 'completed';
        sessionData.completed_at = new Date().toISOString();
        sessionData.result_data = {
          response: response || 'Resposta processada com sucesso',
          analysis: {
            customerIssue: 'Analisado pelo webhook',
            sentiment: 'Processado',
            urgency: 'Definida'
          }
        };
      }
      
      global.customerServiceSessions.set(sessionId, sessionData);
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('❌ [CUSTOMER_SERVICE] Webhook callback error:', error);
      res.status(500).json({ error: 'Erro ao processar callback' });
    }
  });

  // ========================================
  // AI AGENT: AMAZON NEGATIVE REVIEWS RESPONSE
  // ========================================

  // Global storage for negative reviews sessions
  if (!global.negativeReviewsSessions) {
    global.negativeReviewsSessions = new Map();
  }

  // Process negative reviews response
  app.post('/api/agents/amazon-negative-reviews/process', requireAuth, async (req: AuthenticatedRequest, res: ExpressResponse) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { sessionId, negativeReview, userInfo, sellerName, sellerPosition, customerName, orderId } = req.body;

      if (!sessionId || !negativeReview || !sellerName || !sellerPosition || !customerName || !orderId) {
        return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' });
      }

      // Get agent configuration
      const agent = await storage.getAgentById('amazon-negative-reviews');
      if (!agent) {
        return res.status(404).json({ error: 'Agente não encontrado' });
      }

      // Get prompts
      const systemPrompt = await storage.getAgentPrompt('amazon-negative-reviews', 'system');
      const mainPrompt = await storage.getAgentPrompt('amazon-negative-reviews', 'main');

      if (!systemPrompt || !mainPrompt) {
        return res.status(404).json({ error: 'Prompts do agente não encontrados' });
      }

      // Create session
      const sessionData = {
        id: sessionId,
        status: 'processing',
        input_data: {
          negativeReview,
          userInfo: userInfo || '',
          sellerName,
          sellerPosition,
          customerName,
          orderId
        },
        created_at: new Date().toISOString()
      };

      global.negativeReviewsSessions.set(sessionId, sessionData);

      // Process prompt with user data
      const processedPrompt = mainPrompt.content
        .replace('[NEGATIVE_REVIEW]', negativeReview)
        .replace('[USER_INFO]', userInfo || 'Nenhuma informação adicional fornecida')
        .replace('[SELLER_NAME]', sellerName)
        .replace('[SELLER_POSITION]', sellerPosition)
        .replace('[CUSTOMER_NAME]', customerName)
        .replace('[ORDER_ID]', orderId);

      console.log('🤖 [NEGATIVE_REVIEWS] Processing with Anthropic Claude:', agent.model);

      // Call Anthropic API
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const startTime = Date.now();

      const response = await anthropic.messages.create({
        model: agent.model || 'claude-sonnet-4-20250514',
        max_tokens: parseInt(String(agent.maxTokens)) || 4000,
        temperature: parseFloat(String(agent.temperature)) || 0.7,
        messages: [
          {
            role: 'user',
            content: `${systemPrompt.content}\n\n${processedPrompt}`,
          },
        ],
      });

      const processingTime = Date.now() - startTime;
      const responseText = response.content[0]?.text || '';

      // Calculate usage and cost
      const inputTokens = response.usage?.input_tokens || 0;
      const outputTokens = response.usage?.output_tokens || 0;
      const totalTokens = inputTokens + outputTokens;
      const costPer1k = agent.costPer1kTokens || 0.015;
      const totalCost = (totalTokens / 1000) * costPer1k;

      // Update session with results
      sessionData.status = 'completed';
      sessionData.completed_at = new Date().toISOString();
      sessionData.result_data = {
        response: responseText,
        analysis: {
          sentiment: 'Negativo',
          urgency: 'Alta',
          keyIssues: ['Defeito no produto', 'Atraso na entrega', 'Embalagem danificada']
        }
      };
      sessionData.processing_time = processingTime;
      sessionData.tokens_used = { input: inputTokens, output: outputTokens, total: totalTokens };
      sessionData.cost = totalCost;

      global.negativeReviewsSessions.set(sessionId, sessionData);

      // Save to AI Generation Logs with AUTOMATIC CREDIT DEDUCTION
      try {
        const fullPrompt = `${systemPrompt.content}\n\n${processedPrompt}`;
        
        const { LoggingService } = await import('./services/loggingService');
        await LoggingService.saveAiLog(
          user.id,
          'agents.negative_reviews', // Feature code para dedução de créditos
          fullPrompt,
          responseText,
          'anthropic',
          agent.model || 'claude-sonnet-4-20250514',
          inputTokens,
          outputTokens,
          totalTokens,
          totalCost,
          0, // creditsUsed = 0 para dedução automática
          processingTime
        );
        
        console.log(`📊 [AI_GENERATION_LOG] Amazon Negative Reviews processado`);
        console.log(`📊 [DETAILS] Cliente: ${customerName} | Pedido: ${orderId} | Vendedor: ${sellerName}`);
        console.log(`📊 [PERFORMANCE] Tokens: ${totalTokens} | Custo: $${totalCost.toFixed(6)} | Tempo: ${processingTime}ms`);
      } catch (logError) {
        console.error('❌ [AI_LOG] Error saving generation log:', logError);
      }

      // Log usage for tracking (existing)
      try {
        await storage.createAgentUsage({
          agentId: 'amazon-negative-reviews',
          userId: user.id,
          inputTokens,
          outputTokens,
          totalTokens,
          cost: totalCost,
          processingTime,
          createdAt: new Date()
        });
      } catch (logError) {
        console.error('❌ [NEGATIVE_REVIEWS] Error logging usage:', logError);
      }

      res.json({ sessionId, status: 'completed' });
    } catch (error: any) {
      console.error('❌ [NEGATIVE_REVIEWS] Error processing:', error);
      
      // Update session with error
      if (global.negativeReviewsSessions && global.negativeReviewsSessions.has(req.body.sessionId)) {
        const sessionData = global.negativeReviewsSessions.get(req.body.sessionId);
        sessionData.status = 'error';
        sessionData.error_message = error.message;
        global.negativeReviewsSessions.set(req.body.sessionId, sessionData);
      }
      
      res.status(500).json({ error: error.message });
    }
  });

  // Get negative reviews session status
  app.get('/api/agents/amazon-negative-reviews/sessions/:sessionId', requireAuth, async (req: AuthenticatedRequest, res: ExpressResponse) => {
    try {
      const { sessionId } = req.params;
      
      if (!global.negativeReviewsSessions || !global.negativeReviewsSessions.has(sessionId)) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }
      
      const sessionData = global.negativeReviewsSessions.get(sessionId);
      
      // Remove sensitive data from response (keep for internal logs only)
      const { tokens_used, cost, ...publicSessionData } = sessionData;
      
      res.json(publicSessionData);
    } catch (error: any) {
      console.error('❌ [NEGATIVE_REVIEWS] Error getting session:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin prompts management endpoints
  app.get('/api/agent-prompts/:agentId', async (req, res) => {
    try {
      const { agentId } = req.params;
      
      if (agentId !== 'amazon-listings') {
        return res.status(404).json({ error: 'Agent not found' });
      }

      // Return mock data structure for now - in production this would come from database
      const mockPrompts = [
        {
          id: 'analysis',
          name: 'Análise de Avaliações',
          description: 'Prompt para análise profunda das avaliações dos concorrentes',
          currentVersion: {
            id: 'analysis-v3',
            version: 3,
            content: `Você é um especialista em análise de mercado e e-commerce da Amazon. Analise as avaliações dos concorrentes fornecidas e extraia insights valiosos.

PRODUTO: {{PRODUCT_NAME}}
DESCRIÇÃO: {{PRODUCT_DESCRIPTION}}
PALAVRAS-CHAVE: {{KEYWORDS}}
CATEGORIA: {{CATEGORY}}

AVALIAÇÕES DOS CONCORRENTES:
{{COMPETITOR_REVIEWS}}

Baseado nas avaliações acima, forneça uma análise estruturada em JSON com os seguintes campos:

{
  "mainBenefits": ["lista dos 5 principais benefícios mais mencionados"],
  "painPoints": ["lista dos 5 principais problemas/reclamações"],
  "keyFeatures": ["características técnicas mais valorizadas"],
  "targetAudience": "descrição detalhada do público-alvo ideal",
  "competitorWeaknesses": ["principais fraquezas dos concorrentes"],
  "opportunityAreas": ["oportunidades de melhoria identificadas"],
  "emotionalTriggers": ["gatilhos emocionais encontrados"],
  "searchIntentAnalysis": "análise da intenção de busca dos consumidores",
  "pricePositioning": "sugestão de posicionamento de preço baseado no valor percebido",
  "marketDifferentiators": ["principais diferenciais competitivos possíveis"]
}

Seja específico, prático e focado em insights acionáveis para otimização de listagem Amazon.`,
            createdAt: '2025-06-27T20:00:00Z',
            createdBy: 'admin',
            status: 'active'
          },
          versions: [],
          variables: ['{{PRODUCT_NAME}}', '{{PRODUCT_DESCRIPTION}}', '{{KEYWORDS}}', '{{LONG_TAIL_KEYWORDS}}', '{{FEATURES}}', '{{TARGET_AUDIENCE}}', '{{REVIEWS_DATA}}', '{{COMPETITOR_REVIEWS}}', '{{CATEGORY}}'],
          maxLength: 3000
        },
        {
          id: 'titles',
          name: 'Geração de Títulos',
          description: 'Prompt para criar títulos otimizados para Amazon',
          currentVersion: {
            id: 'titles-v2',
            version: 2,
            content: `Você é um especialista em SEO e copywriting para Amazon. Crie títulos otimizados que maximizem vendas e visibilidade.

PRODUTO: {{PRODUCT_NAME}}
PALAVRAS-CHAVE: {{KEYWORDS}}
PRINCIPAIS BENEFÍCIOS: {{MAIN_BENEFITS}}
PÚBLICO-ALVO: {{TARGET_AUDIENCE}}
CATEGORIA: {{CATEGORY}}

DIRETRIZES PARA OS TÍTULOS:
- Máximo 200 caracteres cada
- Incluir palavra-chave principal no início
- Destacar principais benefícios
- Usar termos que geram urgência/desejo
- Otimizar para algoritmo da Amazon
- Incluir especificações técnicas relevantes
- Apelar para o público-alvo identificado

Crie exatamente 10 títulos diferentes, cada um em uma linha, numerados de 1 a 10.
Varie o estilo: alguns mais técnicos, outros mais emocionais, alguns focados em benefícios, outros em recursos.

Exemplo de formato:
1. [Título aqui]
2. [Título aqui]
...

Seja criativo, persuasivo e focado em conversão!`,
            createdAt: '2025-06-27T19:30:00Z',
            createdBy: 'admin',
            status: 'active'
          },
          versions: [],
          variables: ['{{PRODUCT_NAME}}', '{{KEYWORDS}}', '{{LONG_TAIL_KEYWORDS}}', '{{FEATURES}}', '{{TARGET_AUDIENCE}}', '{{REVIEWS_DATA}}', '{{CATEGORY}}'],
          maxLength: 2000
        },
        {
          id: 'bulletPoints',
          name: 'Bullet Points',
          description: 'Prompt para criar bullet points persuasivos',
          currentVersion: {
            id: 'bullets-v2',
            version: 2,
            content: `Você é um copywriter especialista em Amazon. Crie bullet points que convertem visitantes em compradores.

PRODUTO: {{PRODUCT_NAME}}
CARACTERÍSTICAS: {{KEY_FEATURES}}
BENEFÍCIOS: {{MAIN_BENEFITS}}
DORES DO PÚBLICO: {{PAIN_POINTS}}
GATILHOS EMOCIONAIS: {{EMOTIONAL_TRIGGERS}}

DIRETRIZES PARA BULLET POINTS:
- Máximo 200 caracteres cada bullet point
- Começar com emoji relevante
- Foco em benefícios, não apenas características
- Usar linguagem persuasiva e emocional
- Abordar objeções principais do público
- Incluir especificações técnicas quando relevante
- Criar senso de urgência e valor

Crie exatamente 5 bullet points numerados, cada um focando em um aspecto diferente:
1. Qualidade/Performance principal
2. Benefício emocional/lifestyle
3. Especificação técnica valorizada
4. Diferencial competitivo
5. Garantia/suporte/valor agregado

Formato:
• TÍTULO EM MAIÚSCULAS: Descrição persuasiva do benefício...

Seja persuasivo, específico e focado em conversão!`,
            createdAt: '2025-06-27T19:00:00Z',
            createdBy: 'admin',
            status: 'active'
          },
          versions: [],
          variables: ['{{PRODUCT_NAME}}', '{{KEYWORDS}}', '{{LONG_TAIL_KEYWORDS}}', '{{FEATURES}}', '{{TARGET_AUDIENCE}}', '{{REVIEWS_DATA}}', '{{CATEGORY}}'],
          maxLength: 2500
        },
        {
          id: 'description',
          name: 'Descrição Completa',
          description: 'Prompt para descrição detalhada do produto',
          currentVersion: {
            id: 'description-v1',
            version: 1,
            content: `Você é um copywriter especialista em Amazon. Crie uma descrição completa que eduque, persuada e converta.

PRODUTO: {{PRODUCT_NAME}}
ANÁLISE: {{ANALYSIS_RESULT}}
CARACTERÍSTICAS: {{KEY_FEATURES}}
PÚBLICO-ALVO: {{TARGET_AUDIENCE}}
DIFERENCIADORES: {{MARKET_DIFFERENTIATORS}}

ESTRUTURA DA DESCRIÇÃO:
1. Abertura impactante (problema + solução)
2. Benefícios principais (3-4 parágrafos)
3. Especificações técnicas detalhadas
4. Diferenciadores competitivos
5. Garantias e suporte
6. Call-to-action persuasivo

DIRETRIZES:
- Tom conversacional e persuasivo
- Focar em benefícios, não apenas recursos
- Usar storytelling quando apropriado
- Incluir social proof e credibilidade
- Abordar objeções principais
- Criar urgência sem ser exagerado
- Máximo 2000 caracteres
- Usar formatação (quebras de linha, emojis)

Crie uma descrição que transforme visitantes em compradores apaixonados pelo produto!`,
            createdAt: '2025-06-27T18:30:00Z',
            createdBy: 'admin',
            status: 'active'
          },
          versions: [],
          variables: ['{{PRODUCT_NAME}}', '{{KEYWORDS}}', '{{LONG_TAIL_KEYWORDS}}', '{{FEATURES}}', '{{TARGET_AUDIENCE}}', '{{REVIEWS_DATA}}', '{{CATEGORY}}'],
          maxLength: 2000
        }
      ];

      res.json(mockPrompts);
    } catch (error) {
      console.error('Error fetching agent prompts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/agent-prompts/:agentId/:promptId', async (req, res) => {
    try {
      const { agentId, promptId } = req.params;
      const { content } = req.body;

      if (agentId !== 'amazon-listings') {
        return res.status(404).json({ error: 'Agent not found' });
      }

      // In production, this would update the database and create a new version
      const updatedPrompt = {
        id: promptId,
        success: true,
        message: 'Prompt atualizado com sucesso!'
      };

      res.json(updatedPrompt);
    } catch (error) {
      console.error('Error updating agent prompt:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/agent-prompts/:agentId/:promptId/test', async (req, res) => {
    try {
      const { agentId, promptId } = req.params;
      const { content } = req.body;

      if (agentId !== 'amazon-listings') {
        return res.status(404).json({ error: 'Agent not found' });
      }

      // Basic validation of prompt content
      const hasRequiredVariables = content.includes('{{') && content.includes('}}');
      const isValidLength = content.length > 50 && content.length <= 5000;
      const hasValidStructure = content.length > 100;

      const success = hasRequiredVariables && isValidLength && hasValidStructure;

      const testResult = {
        success,
        message: success 
          ? 'Prompt testado com sucesso. Formato válido e variáveis reconhecidas.'
          : 'Erro: Prompt deve conter variáveis válidas ({{VARIABLE}}) e ter entre 50-5000 caracteres.',
        testedAt: new Date().toISOString()
      };

      res.json(testResult);
    } catch (error) {
      console.error('Error testing agent prompt:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // AI Provider management endpoints
  app.get('/api/ai-providers/status', async (req, res) => {
    try {
      const status = aiProviderService.getProviderStatus();
      res.json(status);
    } catch (error) {
      console.error('Error getting provider status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/ai-providers/models', async (req, res) => {
    try {
      const models = aiProviderService.getAllModels();
      res.json(models);
    } catch (error) {
      console.error('Error getting available models:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Test AI provider connection
  app.post('/api/ai-providers/test', async (req, res) => {
    const startTime = Date.now();
    const requestId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      console.log(`🧪 [AI_TEST_START] RequestID: ${requestId}`);
      console.log(`   📋 Request Body Keys: ${Object.keys(req.body)}`);
      
      const { provider, model, prompt, imageData, referenceImages, temperature, maxTokens } = req.body;
      
      // Validation with detailed logging
      if (!provider || !model) {
        console.log(`❌ [AI_TEST_ERROR] RequestID: ${requestId} - Missing required fields`);
        console.log(`   📋 Received: provider="${provider}", model="${model}"`);
        return res.status(400).json({ 
          error: 'Provider and model are required',
          received: { provider, model }
        });
      }

      // Log if image data is provided for gpt-image-1 model
      if (model === 'gpt-image-1' && imageData) {
        console.log(`🖼️ [AI_TEST_INFO] RequestID: ${requestId} - Image data provided for gpt-image-1 (edit mode)`);
      } else if (model === 'gpt-image-1' && !imageData) {
        console.log(`🎨 [AI_TEST_INFO] RequestID: ${requestId} - No image data for gpt-image-1 (generation mode)`);
      }

      const testPrompt = prompt || 'Hello! How are you today?';
      const isReasoningModel = model.startsWith('o1') || model.startsWith('o4');
      
      console.log(`🔧 [AI_TEST_CONFIG] RequestID: ${requestId}`);
      console.log(`   🤖 Provider: ${provider}`);
      console.log(`   🧠 Model: ${model}`);
      console.log(`   🌡️  Temperature: ${temperature} (Reasoning model: ${isReasoningModel})`);
      console.log(`   🎯 MaxTokens: ${maxTokens}`);
      console.log(`   📝 Prompt: "${testPrompt.substring(0, 100)}${testPrompt.length > 100 ? '...' : ''}"`);
      console.log(`   🖼️  Has Image: ${!!imageData} (${imageData ? `${imageData.length} chars` : 'none'})`);
      console.log(`   📸 Reference Images: ${referenceImages ? referenceImages.length : 0} images`);
      
      // Prepare request data for logging
      const requestData: any = {
        provider,
        model,
        messages: [
          { role: 'user' as const, content: testPrompt }
        ],
        temperature: isReasoningModel ? undefined : (temperature ? parseFloat(temperature) : 0.1),
        maxTokens: maxTokens ? parseInt(maxTokens) : 100
      };

      // Add image data for gpt-image-1 model if provided
      if (model === 'gpt-image-1' && imageData) {
        requestData.imageData = imageData;
        console.log(`🖼️  [AI_TEST_IMAGE] RequestID: ${requestId} - Image data provided (${imageData.length} chars)`);
      }

      // Add reference images for image models
      if (referenceImages && referenceImages.length > 0) {
        requestData.referenceImages = referenceImages;
        console.log(`📸 [AI_TEST_REFS] RequestID: ${requestId} - ${referenceImages.length} reference images provided`);
      }

      console.log(`🚀 [AI_TEST_SEND] RequestID: ${requestId} - Sending to AI service`);
      const aiStartTime = Date.now();

      const testResponse = await aiProviderService.generateResponse(requestData);

      const aiDuration = Date.now() - aiStartTime;
      console.log(`✅ [AI_TEST_RESPONSE] RequestID: ${requestId} - AI service responded in ${aiDuration}ms`);
      console.log(`   📏 Content Length: ${testResponse.content?.length || 0}`);
      console.log(`   📊 Usage: ${JSON.stringify(testResponse.usage)}`);
      console.log(`   💰 Cost: $${testResponse.cost?.toFixed(6) || '0.000000'}`);
      console.log(`   📄 Content Preview: "${testResponse.content?.substring(0, 200)}${testResponse.content && testResponse.content.length > 200 ? '...' : ''}"`);

      // Prepare clean response data
      const cleanResponse = {
        content: testResponse.content,
        usage: testResponse.usage || null,
        cost: testResponse.cost || 0,
        provider: provider,
        model: model,
        timestamp: new Date().toISOString()
      };

      const responseData = {
        success: true,
        message: `Conexão com ${provider} (${model}) testada com sucesso!`,
        response: testResponse.content || 'Resposta vazia',
        requestSent: JSON.stringify(requestData, null, 2),
        responseReceived: JSON.stringify(cleanResponse, null, 2),
        duration: aiDuration,
        cost: testResponse.cost || 0
      };

      const totalDuration = Date.now() - startTime;
      console.log(`🎉 [AI_TEST_SUCCESS] RequestID: ${requestId} - Total duration: ${totalDuration}ms`);

      res.json(responseData);
    } catch (error: any) {
      const totalDuration = Date.now() - startTime;
      console.error(`💥 [AI_TEST_ERROR] RequestID: ${requestId} - Error after ${totalDuration}ms`);
      console.error(`   🚨 Error Type: ${error.constructor.name}`);
      console.error(`   💬 Error Message: ${error.message}`);
      console.error(`   📋 Error Status: ${error.status || 'N/A'}`);
      console.error(`   🔍 Error Code: ${error.code || 'N/A'}`);
      console.error(`   📊 Error Details:`, {
        name: error.name,
        type: error.type,
        param: error.param,
        headers: error.headers ? Object.fromEntries(error.headers) : undefined
      });
      console.error(`   📜 Stack Trace:`, error.stack);
      
      res.status(500).json({
        success: false,
        message: `Erro ao testar conexão: ${error.message}`,
        errorDetails: {
          type: error.constructor.name,
          status: error.status,
          code: error.code,
          timestamp: new Date().toISOString(),
          duration: totalDuration,
          requestId
        }
      });
    }
  });

  // Agent Usage routes
  app.get('/api/agents/:agentId/usage', async (req, res) => {
    try {
      const usage = await storage.getAgentUsage(req.params.agentId);
      res.json(usage);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch agent usage' });
    }
  });

  app.post('/api/agents/:agentId/usage', async (req, res) => {
    try {
      const validatedData = insertAgentUsageSchema.parse({
        ...req.body,
        agentId: req.params.agentId
      });
      const usage = await storage.createAgentUsage(validatedData);
      res.status(201).json(usage);
    } catch (error) {
      res.status(400).json({ error: 'Invalid usage data' });
    }
  });

  // Agent Generations routes
  app.post('/api/agent-generations', async (req, res) => {
    try {
      const validatedData = insertAgentGenerationSchema.parse(req.body);
      const generation = await storage.createAgentGeneration(validatedData);
      res.status(201).json(generation);
    } catch (error) {
      res.status(400).json({ error: 'Invalid generation data' });
    }
  });

  // Amazon Product Photography - specific route (must be before generic)
  const photographyUpload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'), false);
      }
    }
  });
  
  // Lifestyle with Model - specific route 
  app.post('/api/agents/lifestyle-with-model/process', requireAuth, async (req: any, res: any) => {
    console.log('🎨 [LIFESTYLE_MODEL] Starting image processing...');
    const startTime = Date.now();
    
    try {
      const user = req.user;
      const { image, variables } = req.body;

      if (!image || !variables) {
        console.log('❌ [LIFESTYLE_MODEL] Missing required fields');
        return res.status(400).json({ error: 'Imagem e variáveis são obrigatórias' });
      }

      console.log('🎨 [LIFESTYLE_MODEL] Variables received:', {
        PRODUTO_NOME: variables.PRODUTO_NOME?.substring(0, 50) + '...',
        AMBIENTE: variables.AMBIENTE,
        SEXO: variables.SEXO,
        FAIXA_ETARIA: variables.FAIXA_ETARIA,
        ACAO: variables.ACAO?.substring(0, 50) + '...'
      });

      // Get agent prompts from database
      const systemPrompt = await storage.getAgentPrompt('agent-lifestyle-with-model', 'system');
      const userPromptTemplate = await storage.getAgentPrompt('agent-lifestyle-with-model', 'user');

      if (!systemPrompt || !userPromptTemplate) {
        console.log('❌ [LIFESTYLE_MODEL] Agent prompts not found');
        return res.status(500).json({ error: 'Configuração do agente não encontrada' });
      }

      // Replace variables in the user prompt
      let userPrompt = userPromptTemplate.content;
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        userPrompt = userPrompt.replace(new RegExp(placeholder, 'g'), value as string);
      });

      console.log('🎨 [LIFESTYLE_MODEL] Processed prompt length:', userPrompt.length);

      // Call OpenAI API with image editing
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      // Convert base64 to proper format for OpenAI
      const imageBuffer = Buffer.from(image, 'base64');
      
      // Call OpenAI GPT-Image-1 API for image editing using the same method as amazon-product-photography
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      try {
        // Import toFile from OpenAI library
        const { toFile } = await import('openai');
        
        // Create file object using OpenAI's toFile utility
        const imageFile = await toFile(imageBuffer, 'lifestyle-image.jpg', { type: 'image/jpeg' });
        
        const response = await openai.images.edit({
          model: 'gpt-image-1',
          image: imageFile,
          prompt: userPrompt,
          n: 1,
          size: '1024x1024',
          quality: 'high'
        });

        const endTime = Date.now();
        const processingTime = Math.round((endTime - startTime) / 1000);
        
        // Get real cost from OpenAI response usage (gpt-image-1 pricing)
        // Text input: $5.00/1M, Image input: $10.00/1M, Image output: $40.00/1M
        let realCost = 0.167; // Default fallback
        
        if (response.usage) {
          const textInputTokens = response.usage.input_tokens_details?.text_tokens || 0;
          const imageInputTokens = response.usage.input_tokens_details?.image_tokens || 0;
          const imageOutputTokens = response.usage.output_tokens || 0;
          
          realCost = (textInputTokens * 0.000005) + (imageInputTokens * 0.00001) + (imageOutputTokens * 0.00004);
        }

        console.log('💰 [LIFESTYLE_MODEL] Cost calculation details:', {
          textTokens: response.usage?.input_tokens_details?.text_tokens || 0,
          imageTokens: response.usage?.input_tokens_details?.image_tokens || 0,
          outputTokens: response.usage?.output_tokens || 0,
          textCost: ((response.usage?.input_tokens_details?.text_tokens || 0) * 0.000005).toFixed(6),
          imageCost: ((response.usage?.input_tokens_details?.image_tokens || 0) * 0.00001).toFixed(6),
          outputCost: ((response.usage?.output_tokens || 0) * 0.00004).toFixed(6),
          totalCost: realCost.toFixed(6)
        });

        console.log('✅ [LIFESTYLE_MODEL] Processing completed:', {
          processingTime: `${processingTime}s`,
          cost: `$${realCost.toFixed(6)}`,
          usage: response.usage
        });

        // Extract generated image from response - images.edit can return base64 or URL
        const imageBase64 = response.data?.[0]?.b64_json;
        const imageUrl = response.data?.[0]?.url;
        
        if (!imageBase64 && !imageUrl) {
          throw new Error('No image data received from OpenAI');
        }
        
        // Convert to data URL if we got base64, otherwise use URL directly
        const generatedImageUrl = imageBase64 
          ? (imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`)
          : imageUrl;
        
        // Save to ai_generation_logs with AUTOMATIC CREDIT DEDUCTION
        const { LoggingService } = await import('./services/loggingService');
        await LoggingService.saveAiLog(
          user.id,
          'agents.lifestyle_model', // Feature code para dedução de créditos
          userPrompt,
          'Imagem lifestyle gerada com sucesso via GPT-Image-1',
          'openai',
          'gpt-image-1',
          response.usage?.input_tokens || 0,
          response.usage?.output_tokens || 0,
          response.usage?.total_tokens || 0,
          realCost,
          0, // creditsUsed = 0 para dedução automática
          processingTime * 1000
        );

        // Return result
        return res.json({
          originalImage: `data:image/jpeg;base64,${image}`,
          processedImage: generatedImageUrl,
          processingTime,
          cost: realCost
        });
        
      } catch (gptImageError: any) {
        console.error('❌ [LIFESTYLE_MODEL] GPT-Image-1 error:', gptImageError);
        throw gptImageError; // Re-throw to be handled by main catch block
      }

    } catch (error: any) {
      console.error('❌ [LIFESTYLE_MODEL] Error:', error);
      
      // Save error log to ai_generation_logs
      try {
        const errorDuration = Date.now() - startTime;
        await db.insert(aiGenerationLogs).values({
          userId: user.id,
          provider: 'openai',
          model: 'gpt-image-1',
          prompt: 'Erro no processamento da imagem lifestyle',
          response: `Erro: ${error.message}`,
          promptCharacters: 0,
          responseCharacters: error.message?.length || 0,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          cost: '0.00',
          duration: errorDuration,
          feature: 'lifestyle-with-model',
          createdAt: new Date()
        });
      } catch (logError) {
        console.error('❌ [LIFESTYLE_MODEL] Error saving error log:', logError);
      }
      
      res.status(500).json({ 
        error: 'Erro no processamento da imagem lifestyle',
        details: error.message
      });
    }
  });

  app.post('/api/agents/amazon-product-photography/process', requireAuth, photographyUpload.single('image'), async (req: any, res: any) => {
    console.log('🌐 [REQUEST] POST /api/agents/amazon-product-photography/process');
    
    try {
      const startTime = Date.now();
      
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhuma imagem fornecida' });
      }

      const user = req.user;
      const originalImageBuffer = req.file.buffer;
      const fileName = req.file.originalname;

      console.log('📸 [PRODUCT_PHOTOGRAPHY] Processing image:', {
        fileName,
        fileSize: req.file.size,
        userId: user.id
      });

      // Convert image to base64
      const base64Image = originalImageBuffer.toString('base64');

      // Get agent configuration
      console.log('🔍 [PRODUCT_PHOTOGRAPHY] Looking for agent:', 'agent-amazon-product-photography');
      const agent = await storage.getAgentById('agent-amazon-product-photography');
      console.log('🔍 [PRODUCT_PHOTOGRAPHY] Agent found:', !!agent);
      if (!agent) {
        return res.status(404).json({ error: 'Agente não encontrado' });
      }

      // Get system prompt
      console.log('🔍 [PRODUCT_PHOTOGRAPHY] Looking for prompt:', 'agent-amazon-product-photography', 'system');
      const systemPrompt = await storage.getAgentPrompt('agent-amazon-product-photography', 'system');
      console.log('🔍 [PRODUCT_PHOTOGRAPHY] Prompt found:', !!systemPrompt);
      if (!systemPrompt) {
        return res.status(404).json({ error: 'Prompt do agente não encontrado' });
      }

      console.log('🤖 [PRODUCT_PHOTOGRAPHY] Using model:', agent.model);

      // Call OpenAI GPT-Image-1 API for image editing
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const mimeType = req.file.mimetype;
      
      console.log('📁 [PRODUCT_PHOTOGRAPHY] Image processing:', {
        fileName,
        mimeType,
        fileSize: originalImageBuffer.length
      });
      
      try {
        // Import toFile from OpenAI library
        const { toFile } = await import('openai');
        
        // Create file object using OpenAI's toFile utility
        const imageFile = await toFile(originalImageBuffer, fileName, { type: mimeType });
        
        const response = await openai.images.edit({
          model: 'gpt-image-1',
          image: imageFile,
          prompt: systemPrompt.content,
          n: 1,
          size: '1024x1024',
          quality: 'high'
        });

        const endTime = Date.now();
        const processingTime = Math.round((endTime - startTime) / 1000);
        
        // Get real cost from OpenAI response usage (gpt-image-1 pricing)
        // Text input: $5.00/1M, Image input: $10.00/1M, Image output: $40.00/1M
        let realCost = 5.167; // Default fallback
        
        if (response.usage) {
          const textInputTokens = response.usage.input_tokens_details?.text_tokens || 0;
          const imageInputTokens = response.usage.input_tokens_details?.image_tokens || 0;
          const imageOutputTokens = response.usage.output_tokens || 0;
          
          realCost = (textInputTokens * 0.000005) + (imageInputTokens * 0.00001) + (imageOutputTokens * 0.00004);
        }

        console.log('💰 [PRODUCT_PHOTOGRAPHY] Cost calculation details:', {
          textTokens: response.usage?.input_tokens_details?.text_tokens || 0,
          imageTokens: response.usage?.input_tokens_details?.image_tokens || 0,
          outputTokens: response.usage?.output_tokens || 0,
          textCost: ((response.usage?.input_tokens_details?.text_tokens || 0) * 0.000005).toFixed(6),
          imageCost: ((response.usage?.input_tokens_details?.image_tokens || 0) * 0.00001).toFixed(6),
          outputCost: ((response.usage?.output_tokens || 0) * 0.00004).toFixed(6),
          totalCost: realCost.toFixed(6)
        });

        console.log('✅ [PRODUCT_PHOTOGRAPHY] Processing completed:', {
          processingTime: `${processingTime}s`,
          cost: `$${realCost.toFixed(6)}`,
          usage: response.usage
        });

        // Debug: Log the OpenAI response structure
        console.log('🔍 [PRODUCT_PHOTOGRAPHY] OpenAI response structure:', {
          hasData: !!response.data,
          dataLength: response.data?.length,
          firstItem: response.data?.[0] ? Object.keys(response.data[0]) : 'none',
          responseKeys: Object.keys(response),
          usage: response.usage
        });

        // Extract generated image from response - images.edit can return base64 or URL
        // Try base64 first, then URL as fallback
        const imageBase64 = response.data?.[0]?.b64_json;
        const imageUrl = response.data?.[0]?.url;
        
        if (!imageBase64 && !imageUrl) {
          throw new Error('No image data received from OpenAI');
        }
        
        // Convert to data URL if we got base64, otherwise use URL directly
        const generatedImageUrl = imageBase64 
          ? (imageBase64.startsWith('data:') ? imageBase64 : `data:image/png;base64,${imageBase64}`)
          : imageUrl;
        
        // Save to ai_generation_logs with AUTOMATIC CREDIT DEDUCTION
        const { LoggingService } = await import('./services/loggingService');
        await LoggingService.saveAiLog(
          user.id,
          'agents.main_image_editor', // Feature code para dedução de créditos
          systemPrompt.content,
          'Imagem gerada com sucesso via GPT-Image-1',
          'openai',
          'gpt-image-1',
          response.usage?.input_tokens || 0,
          response.usage?.output_tokens || 0,
          response.usage?.total_tokens || 0,
          realCost,
          0, // creditsUsed = 0 para dedução automática
          processingTime * 1000
        );

        // Return result
        res.json({
          originalImage: `data:image/jpeg;base64,${base64Image}`,
          processedImage: generatedImageUrl,
          processingTime,
          cost: realCost
        });

      } finally {
        // No cleanup needed - using buffer directly
      }
    } catch (error: any) {
      console.error('❌ [PRODUCT_PHOTOGRAPHY] Error:', error);
      
      // Save error log to ai_generation_logs
      try {
        const errorDuration = Date.now() - startTime;
        await db.insert(aiGenerationLogs).values({
          userId: user.id,
          provider: 'openai',
          model: 'gpt-image-1',
          prompt: 'Erro no processamento da imagem',
          response: `Erro: ${error.message}`,
          promptCharacters: 0,
          responseCharacters: error.message?.length || 0,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          cost: '0.00',
          duration: errorDuration,
          feature: 'agents.main_image_editor',
          createdAt: new Date()
        });
      } catch (logError) {
        console.error('❌ [PRODUCT_PHOTOGRAPHY] Error saving error log:', logError);
      }
      
      res.status(500).json({ 
        error: 'Erro no processamento da imagem',
        details: error.message
      });
    }
  });

  // OpenAI Processing route (generic) - MOVED BELOW SPECIFIC ROUTES
  app.post('/api/agents/:agentId/process', async (req, res) => {
    try {
      const { productName, productInfo, reviewsData, format } = req.body;
      const agentId = req.params.agentId;
      
      // TODO: Get from authenticated user session
      const userId = "user-1";
      const userName = "Demo User";

      const result = await openaiService.processAmazonListing({
        agentId,
        userId,
        userName,
        productName,
        productInfo,
        reviewsData,
        format: format || 'text'
      });

      res.json(result);
    } catch (error: any) {
      console.error('OpenAI processing error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to process listing',
        details: error.response?.data || null
      });
    }
  });

  // Specific Amazon Listings Optimizer endpoint with enhanced processing
  app.post('/api/agents/amazon-listings-optimizer/process', requireAuth, async (req, res) => {
    try {
      // Validate request method
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Only POST method is allowed' });
      }

      // Validate and sanitize inputs
      const {
        productName,
        category,
        keywords,
        longTailKeywords,
        features,
        targetAudience,
        reviewsData,
        format = 'text'
      } = req.body;

      // Required field validation
      if (!productName?.trim()) {
        return res.status(400).json({ error: 'Product name is required' });
      }
      if (!category?.trim()) {
        return res.status(400).json({ error: 'Category is required' });
      }
      if (!keywords?.trim()) {
        return res.status(400).json({ error: 'Keywords are required' });
      }
      if (!reviewsData?.trim()) {
        return res.status(400).json({ error: 'Reviews data is required' });
      }

      // Sanitize inputs
      const sanitizedData = {
        productName: productName.trim(),
        category: category.trim(),
        keywords: keywords.trim(),
        longTailKeywords: longTailKeywords?.trim() || '',
        features: features?.trim() || '',
        targetAudience: targetAudience?.trim() || '',
        reviewsData: reviewsData.trim(),
        format
      };

      // Get authenticated user
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const agentId = "agent-amazon-listings";

      console.log(`🚀 [AMAZON_LISTING_OPTIMIZER] Iniciando processamento para usuário: ${user.id} (${user.name})`);
      
      const result = await openaiService.processAmazonListing({
        agentId,
        userId: user.id.toString(),
        userName: user.name || user.username,
        productName: sanitizedData.productName,
        productInfo: `Categoria: ${sanitizedData.category}, Keywords: ${sanitizedData.keywords}, Long Tail Keywords: ${sanitizedData.longTailKeywords}, Características: ${sanitizedData.features}, Público Alvo: ${sanitizedData.targetAudience}`,
        reviewsData: sanitizedData.reviewsData,
        format: sanitizedData.format
      });

      res.json({
        success: true,
        ...result
      });
    } catch (error: any) {
      console.error('Amazon Listings Optimizer processing error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to process listing optimization',
        details: process.env.NODE_ENV === 'development' ? error.stack : null
      });
    }
  });



  // Save AI generation log
  app.post('/api/ai-generation-logs', async (req, res) => {
    try {
      const {
        userId,
        provider,
        model,
        prompt,
        response,
        promptCharacters,
        responseCharacters,
        inputTokens,
        outputTokens,
        totalTokens,
        cost,
        duration,
        feature
      } = req.body;

      const logData = {
        userId: parseInt(userId),
        provider,
        model,
        prompt,
        response,
        promptCharacters: promptCharacters || prompt.length,
        responseCharacters: responseCharacters || response.length,
        inputTokens: inputTokens || 0,
        outputTokens: outputTokens || 0,
        totalTokens: totalTokens || 0,
        cost: cost || 0,
        duration: duration || 0,
        feature: feature || 'html-description'
      };

      // Use LoggingService for automatic credit deduction instead of direct insertion
      const { LoggingService } = await import('./services/loggingService');
      await LoggingService.saveAiLog(
        parseInt(userId),
        feature, // Feature code dinâmico para dedução de créditos
        prompt,
        response,
        provider,
        model,
        inputTokens || 0,
        outputTokens || 0,
        totalTokens || 0,
        parseFloat(cost) || 0,
        0, // creditsUsed = 0 para dedução automática
        duration || 0
      );

      console.log(`💾 [AI_LOG] Saved generation log - User: ${userId}, Model: ${model}, Cost: $${cost}, Characters: ${responseCharacters}`);

      res.json({ 
        success: true, 
        message: 'AI generation log saved successfully'
      });
    } catch (error: any) {
      console.error('Error saving AI generation log:', error);
      res.status(500).json({ error: 'Failed to save AI generation log' });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws, req) => {
    const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const clientIP = req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    console.log(`🔌 [WS_CONNECT] New WebSocket client connected`);
    console.log(`   🆔 Client ID: ${clientId}`);
    console.log(`   📍 IP: ${clientIP}`);
    console.log(`   🖥️  User-Agent: ${userAgent?.substring(0, 50)}...`);
    console.log(`   📊 Total Clients: ${connectedClients.size + 1}`);
    
    connectedClients.add(ws);
    
    // Send welcome message
    const welcomeMessage = { 
      type: 'connection', 
      data: { 
        message: 'Connected to real-time notifications',
        clientId,
        serverTime: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };
    
    try {
      ws.send(JSON.stringify(welcomeMessage));
      console.log(`📤 [WS_WELCOME] Sent welcome message to ${clientId}`);
    } catch (error) {
      console.error(`❌ [WS_ERROR] Failed to send welcome message to ${clientId}:`, error);
    }
    
    ws.on('message', (data) => {
      console.log(`📨 [WS_MESSAGE] Received from ${clientId}:`, data.toString());
    });
    
    ws.on('close', (code, reason) => {
      console.log(`🔌 [WS_DISCONNECT] Client ${clientId} disconnected`);
      console.log(`   📋 Code: ${code}`);
      console.log(`   💬 Reason: ${reason?.toString() || 'No reason provided'}`);
      console.log(`   📊 Remaining Clients: ${connectedClients.size - 1}`);
      connectedClients.delete(ws);
    });
    
    ws.on('error', (error) => {
      console.error(`💥 [WS_ERROR] WebSocket error for ${clientId}:`, error);
      console.error(`   🚨 Error Type: ${error.constructor.name}`);
      console.error(`   💬 Error Message: ${error.message}`);
      console.error(`   📜 Stack:`, error.stack);
      connectedClients.delete(ws);
    });
    
    ws.on('pong', () => {
      console.log(`🏓 [WS_PONG] Received pong from ${clientId}`);
    });
  });
  
  // Optimized heartbeat - only run when there are connections
  const interval = setInterval(() => {
    // Skip heartbeat if no connections
    if (connectedClients.size === 0) {
      return;
    }

    console.log(`💓 [WS_HEARTBEAT] Checking ${connectedClients.size} connections`);
    let activeConnections = 0;
    let removedConnections = 0;
    
    connectedClients.forEach((ws) => {
      if (ws.readyState === 1) { // OPEN
        try {
          ws.ping();
          activeConnections++;
        } catch (error) {
          console.error(`❌ [WS_PING_ERROR] Failed to ping client:`, error);
          connectedClients.delete(ws);
          removedConnections++;
        }
      } else {
        console.log(`🔌 [WS_CLEANUP] Removing dead connection (state: ${ws.readyState})`);
        connectedClients.delete(ws);
        removedConnections++;
      }
    });
    
    if (removedConnections > 0) {
      console.log(`🧹 [WS_CLEANUP] Removed ${removedConnections} dead connections, ${activeConnections} active`);
    }
  }, 30000); // Check every 30 seconds
  
  // Cleanup interval on server shutdown
  process.on('SIGTERM', () => {
    clearInterval(interval);
  });

  // Agent Sessions routes
  app.post('/api/sessions', async (req, res) => {
    try {
      const { userId, agentType } = req.body;
      
      if (!userId || !agentType) {
        return res.status(400).json({ 
          error: 'userId e agentType são obrigatórios' 
        });
      }

      const session = await SessionService.createSession(userId, agentType);
      
      res.status(201).json({
        success: true,
        session: {
          id: session.id,
          sessionHash: session.sessionHash,
          userId: session.userId,
          agentType: session.agentType,
          status: session.status,
          createdAt: session.createdAt
        }
      });
    } catch (error: any) {
      console.error('Erro ao criar sessão:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.get('/api/sessions/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await SessionService.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }

      res.json(session);
    } catch (error: any) {
      console.error('Erro ao buscar sessão:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.put('/api/sessions/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { inputData } = req.body;
      
      const session = await SessionService.updateSessionData(sessionId, inputData);
      
      res.json({
        success: true,
        session: {
          id: session.id,
          sessionHash: session.sessionHash,
          tags: session.tags,
          updatedAt: session.updatedAt
        }
      });
    } catch (error: any) {
      console.error('Erro ao atualizar sessão:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.post('/api/sessions/:sessionId/files', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { fileName, fileType, fileUrl, fileSize, processedContent } = req.body;
      
      const file = await SessionService.addFileToSession(
        sessionId, 
        fileName, 
        fileType, 
        fileUrl, 
        fileSize, 
        processedContent
      );
      
      res.status(201).json({ success: true, file });
    } catch (error: any) {
      console.error('Erro ao adicionar arquivo à sessão:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.get('/api/sessions/:sessionId/files', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const files = await SessionService.getSessionFiles(sessionId);
      
      res.json(files);
    } catch (error: any) {
      console.error('Erro ao buscar arquivos da sessão:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.get('/api/sessions/:sessionHash', async (req, res) => {
    try {
      const { sessionHash } = req.params;
      
      const session = await storage.getAgentSessionByHash(sessionHash);
      
      if (!session) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }

      res.json({
        success: true,
        session
      });
    } catch (error: any) {
      console.error('Erro ao buscar sessão:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.put('/api/sessions/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { inputData } = req.body;
      
      const tags = generateTags(inputData || {});
      const session = await storage.updateAgentSession(sessionId, { 
        inputData, 
        tags 
      });
      
      res.json({
        success: true,
        session
      });
    } catch (error: any) {
      console.error('Erro ao atualizar sessão:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.post('/api/sessions/:sessionId/files/process', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { files } = req.body;
      
      if (!files || !Array.isArray(files)) {
        return res.status(400).json({ 
          error: 'Array de arquivos é obrigatório' 
        });
      }

      let combinedContent = '';
      for (const file of files) {
        combinedContent += `\n\n=== ARQUIVO: ${file.name} ===\n${file.content}`;
        
        await storage.createAgentSessionFile({
          sessionId,
          fileName: file.name,
          fileType: 'text/plain',
          fileUrl: '',
          fileSize: file.content.length,
          processedContent: file.content,
        });
      }
      
      res.json({
        success: true,
        combinedContent: combinedContent.trim(),
        filesProcessed: files.length
      });
    } catch (error: any) {
      console.error('Erro ao processar arquivos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.get('/api/sessions/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { agentType } = req.query;
      
      const sessions = await storage.getUserAgentSessions(
        userId, 
        agentType as string,
        'active'
      );
      
      res.json({
        success: true,
        sessions
      });
    } catch (error: any) {
      console.error('Erro ao buscar sessões do usuário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Amazon Listing Optimizer Routes - Sistema de 2 etapas conforme especificação
  
  // Criar nova sessão Amazon Listing
  app.post('/api/amazon-sessions', async (req, res) => {
    try {
      const { idUsuario } = req.body;
      
      if (!idUsuario) {
        return res.status(400).json({ 
          error: 'idUsuario é obrigatório' 
        });
      }

      const session = await amazonService.createSession(idUsuario);
      
      res.status(201).json({
        success: true,
        session: {
          id: session.id,
          sessionHash: session.sessionHash,
          idUsuario: session.idUsuario,
          status: session.status,
          currentStep: session.currentStep,
          dataHoraCreated: session.dataHoraCreated
        }
      });
    } catch (error: any) {
      console.error('Erro ao criar sessão Amazon:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Criar nova sessão Amazon Listing com sessionId customizado
  app.post('/api/amazon-sessions/:sessionId/create', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { nomeProduto, marca, categoria, keywords, principaisCaracteristicas, publicoAlvo, reviewsData } = req.body;
      
      console.log('🔧 Criando sessão com ID:', sessionId);
      console.log('🔧 Dados recebidos:', { nomeProduto, marca, categoria });
      
      // Criar sessão com dados do produto
      const sessionData: InsertAmazonListingSession = {
        id: sessionId,
        idUsuario: '2', // ID fixo para teste
        status: 'active',
        currentStep: 0,
        nomeProduto,
        marca,
        categoria,
        keywords,
        principaisCaracteristicas,
        publicoAlvo,
        reviewsData
      };

      console.log('🔧 Tentando inserir no banco:', sessionData);
      const [session] = await db.insert(amazonListingSessions).values(sessionData).returning();
      console.log('🔧 Sessão criada no banco:', session?.id);
      
      res.status(201).json({
        success: true,
        message: 'Sessão criada com sucesso',
        session: {
          id: session.id,
          sessionHash: session.sessionHash,
          idUsuario: session.idUsuario,
          status: session.status,
          currentStep: session.currentStep,
          dataHoraCreated: session.dataHoraCreated
        }
      });
    } catch (error: any) {
      console.error('❌ Erro ao criar sessão Amazon customizada:', error);
      res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
    }
  });

  // Salvar dados do produto na sessão
  app.put('/api/amazon-sessions/:sessionId/data', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const productData = req.body;
      
      // Validar dados obrigatórios conforme especificação
      const requiredFields = ['nomeProduto', 'marca', 'categoria', 'keywords', 'reviewsData'];
      const missingFields = requiredFields.filter(field => !productData[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          error: `Campos obrigatórios ausentes: ${missingFields.join(', ')}`
        });
      }

      const session = await amazonService.updateSessionData(sessionId, productData);
      
      res.json({
        success: true,
        message: 'Dados salvos com sucesso',
        session: {
          id: session.id,
          sessionHash: session.sessionHash,
          status: session.status,
          currentStep: session.currentStep
        }
      });
    } catch (error: any) {
      console.error('Erro ao salvar dados da sessão:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Processar Etapa 1: Análise de Avaliações
  app.post('/api/amazon-sessions/:sessionId/process-step1', async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // Notificar clientes sobre início do processamento
      broadcastNotification('amazon_processing', {
        sessionId,
        step: 1,
        status: 'processing',
        message: 'Iniciando análise das avaliações...'
      });

      const result = await amazonService.processStep1_AnalysisReviews(sessionId);
      
      // Notificar clientes sobre conclusão
      broadcastNotification('amazon_processing', {
        sessionId,
        step: 1,
        status: 'completed',
        message: 'Análise das avaliações concluída'
      });
      
      res.json({
        success: true,
        step: 1,
        status: 'completed',
        result: result
      });
    } catch (error: any) {
      console.error('Erro na Etapa 1:', error);
      
      // Notificar erro
      broadcastNotification('amazon_processing', {
        sessionId: req.params.sessionId,
        step: 1,
        status: 'error',
        message: error.message
      });
      
      res.status(500).json({ 
        error: error.message || 'Erro no processamento da Etapa 1' 
      });
    }
  });

  // Processar Etapa 2: Gerar Títulos
  app.post('/api/amazon-sessions/:sessionId/process-step2', async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // Notificar clientes sobre início do processamento
      broadcastNotification('amazon_processing', {
        sessionId,
        step: 2,
        status: 'processing',
        message: 'Gerando títulos otimizados...'
      });

      const result = await amazonService.processStep2_GenerateTitles(sessionId);
      
      // Notificar clientes sobre conclusão
      broadcastNotification('amazon_processing', {
        sessionId,
        step: 2,
        status: 'completed',
        message: 'Títulos gerados com sucesso'
      });
      
      res.json({
        success: true,
        step: 2,
        status: 'completed',
        result: result
      });
    } catch (error: any) {
      console.error('Erro na Etapa 2:', error);
      
      // Notificar erro
      broadcastNotification('amazon_processing', {
        sessionId: req.params.sessionId,
        step: 2,
        status: 'error',
        message: error.message
      });
      
      res.status(500).json({ 
        error: error.message || 'Erro no processamento da Etapa 2' 
      });
    }
  });

  // Processar Etapa 3: Gerar Bullet Points
  app.post('/api/amazon-sessions/:sessionId/process-step3', async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // Notificar clientes sobre início do processamento
      broadcastNotification('amazon_processing', {
        sessionId,
        step: 3,
        status: 'processing',
        message: 'Gerando bullet points otimizados...'
      });

      const result = await amazonService.processStep3_BulletPoints(sessionId);
      
      // Notificar clientes sobre conclusão
      broadcastNotification('amazon_processing', {
        sessionId,
        step: 3,
        status: 'completed',
        message: 'Bullet points gerados com sucesso'
      });

      res.json({ 
        success: true, 
        step: 3, 
        status: 'completed', 
        result: result 
      });
    } catch (error: any) {
      console.error('Erro ao processar Etapa 3:', error);
      
      // Notificar clientes sobre erro
      broadcastNotification('amazon_processing', {
        sessionId: req.params.sessionId,
        step: 3,
        status: 'error',
        message: 'Erro ao gerar bullet points'
      });
      
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      });
    }
  });

  // Processar Etapa 4: Gerar Descrição
  app.post('/api/amazon-sessions/:sessionId/process-step4', async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // Notificar clientes sobre início do processamento
      broadcastNotification('amazon_processing', {
        sessionId,
        step: 4,
        status: 'processing',
        message: 'Gerando descrição completa...'
      });

      const result = await amazonService.processStep4_Description(sessionId);
      
      // Notificar clientes sobre conclusão
      broadcastNotification('amazon_processing', {
        sessionId,
        step: 4,
        status: 'completed',
        message: 'Descrição gerada com sucesso'
      });

      res.json({ 
        success: true, 
        step: 4, 
        status: 'completed', 
        result: result 
      });
    } catch (error: any) {
      console.error('Erro ao processar Etapa 4:', error);
      
      // Notificar clientes sobre erro
      broadcastNotification('amazon_processing', {
        sessionId: req.params.sessionId,
        step: 4,
        status: 'error',
        message: 'Erro ao gerar descrição'
      });
      
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      });
    }
  });

  // Abortar processamento
  app.post('/api/amazon-sessions/:sessionId/abort', async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      await amazonService.abortProcessing(sessionId);
      
      // Notificar clientes sobre abort
      broadcastNotification('amazon_processing', {
        sessionId,
        status: 'aborted',
        message: 'Processamento abortado pelo usuário'
      });
      
      res.json({
        success: true,
        message: 'Processamento abortado com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao abortar processamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Buscar sessão e resultados
  app.get('/api/amazon-sessions/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await amazonService.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }

      res.json({
        success: true,
        session: session
      });
    } catch (error: any) {
      console.error('Erro ao buscar sessão:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Download dos resultados em TXT
  app.get('/api/amazon-sessions/:sessionId/download', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await amazonService.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }

      if (!session.reviewsInsight || !session.titulos) {
        return res.status(400).json({ 
          error: 'Processamento ainda não concluído' 
        });
      }

      const content = amazonService.generateDownloadContent(session);
      const filename = `amazon-listing-${session.sessionHash}.txt`;
      
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(content);
    } catch (error: any) {
      console.error('Erro ao gerar download:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // ==========================================
  // AMAZON REVIEWS EXTRACTOR ROUTES
  // ==========================================

  interface ReviewData {
    review_title: string;
    review_star_rating: string;
    review_comment: string;
  }

  interface AmazonAPIResponse {
    status: string;
    data: {
      reviews: Array<{
        review_title?: string;
        review_star_rating?: string;
        review_comment?: string;
      }>;
    };
  }

  // Endpoint para extrair reviews da Amazon
  app.post('/api/amazon-reviews/extract', requireAuth, async (req: AuthenticatedRequest, res: ExpressResponse) => {
    try {
      const { asin, page = 1, country = 'BR', sort_by = 'MOST_RECENT' } = req.body;

      if (!asin) {
        return res.status(400).json({
          success: false,
          message: 'ASIN é obrigatório'
        });
      }

      // Validar ASIN format (10 caracteres alfanuméricos)
      if (!/^[A-Z0-9]{10}$/.test(asin)) {
        return res.status(400).json({
          success: false,
          message: 'ASIN deve ter 10 caracteres alfanuméricos'
        });
      }

      console.log(`🔍 [AMAZON_REVIEWS] Buscando reviews - ASIN: ${asin}, Página: ${page}, País: ${country}`);

      // Configurar parâmetros da API
      const params = new URLSearchParams({
        asin,
        country,
        page: page.toString(),
        sort_by,
        star_rating: 'ALL',
        verified_purchases_only: 'false',
        images_or_videos_only: 'false',
        current_format_only: 'false'
      });

      // Fazer requisição para a RapidAPI
      const response = await fetch(`https://real-time-amazon-data.p.rapidapi.com/product-reviews?${params}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
          'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com',
          'X-RapidAPI-App': 'default-application_10763288'
        }
      });

      if (!response.ok) {
        console.error(`❌ [AMAZON_REVIEWS] Erro API: ${response.status} - ${response.statusText}`);
        return res.status(response.status).json({
          success: false,
          message: `Erro da API Amazon: ${response.statusText}`
        });
      }

      const data: AmazonAPIResponse = await response.json();

      if (data.status !== 'OK') {
        console.error(`❌ [AMAZON_REVIEWS] Status não OK:`, data);
        return res.status(400).json({
          success: false,
          message: 'API retornou status de erro'
        });
      }

      // Filtrar apenas os dados necessários
      const filteredReviews: ReviewData[] = data.data.reviews.map(review => ({
        review_title: review.review_title || '',
        review_star_rating: review.review_star_rating || '',
        review_comment: review.review_comment || ''
      }));

      console.log(`✅ [AMAZON_REVIEWS] ${filteredReviews.length} reviews extraídos - ASIN: ${asin}, Página: ${page}`);

      // Log da consulta na tabela ai_generation_logs usando LoggingService
      try {
        await LoggingService.saveApiLog(
          2, // userId admin por enquanto
          'amazon-reviews-extractor',
          `Amazon Reviews Extractor: ASIN ${asin}, Page ${page}, Country ${country}`,
          JSON.stringify({
            reviews: filteredReviews,
            metadata: { asin, page, country, sort_by, total_reviews: filteredReviews.length }
          }),
          'rapidapi',
          'amazon-data-scraper',
          0, // duration
          0, // sem custo da API
          5 // 5 créditos conforme tabela feature_costs (tools.amazon_reviews)
        );
      } catch (logError) {
        console.error('❌ Erro ao salvar log de API:', logError);
      }

      res.json({
        success: true,
        status: 'OK',
        data: {
          reviews: filteredReviews
        },
        metadata: {
          asin,
          page,
          country,
          sort_by,
          total_reviews: filteredReviews.length
        }
      });

    } catch (error) {
      console.error('❌ [AMAZON_REVIEWS] Erro interno:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // Endpoint para validar ASIN
  app.post('/api/amazon-reviews/validate-asin', async (req: any, res: any) => {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'URL é obrigatória'
        });
      }

      // Padrões para extrair ASIN
      const asinPatterns = [
        /\/dp\/([A-Z0-9]{10})/,
        /\/product\/([A-Z0-9]{10})/,
        /asin=([A-Z0-9]{10})/,
        /\/([A-Z0-9]{10})(?:\/|\?|$)/
      ];

      let asin = null;
      for (const pattern of asinPatterns) {
        const match = url.match(pattern);
        if (match) {
          asin = match[1];
          break;
        }
      }

      if (!asin) {
        return res.status(400).json({
          success: false,
          message: 'ASIN não encontrado na URL'
        });
      }

      console.log(`🔍 [AMAZON_REVIEWS] ASIN extraído: ${asin} da URL: ${url}`);

      res.json({
        success: true,
        asin,
        url
      });

    } catch (error) {
      console.error('❌ [AMAZON_REVIEWS] Erro na validação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // API para logs de uso de ferramentas
  app.post('/api/tool-usage-logs', async (req: any, res: any) => {
    try {
      const { userId, userName, userEmail, toolName, asin, keyword, country, additionalData } = req.body;

      if (!userId || !userName || !userEmail || !toolName) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios: userId, userName, userEmail, toolName' 
        });
      }

      // Salvar log na tabela tool_usage_logs
      const [logEntry] = await db.insert(toolUsageLogs).values({
        userId,
        userName,
        userEmail,
        toolName,
        asin: asin || null,
        keyword: keyword || null,
        country: country || null,
        additionalData: additionalData || null,
      }).returning();

      console.log(`📊 [TOOL_USAGE] Log salvo: User ${userName} (${userEmail}) usou ${toolName} - ASIN: ${asin || 'N/A'} - Keyword: ${keyword || 'N/A'} - País: ${country || 'N/A'}`);

      res.json({ 
        success: true, 
        logId: logEntry.id,
        message: 'Log de uso salvo com sucesso' 
      });

    } catch (error) {
      console.error('❌ [TOOL_USAGE] Erro ao salvar log:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor ao salvar log' 
      });
    }
  });

  // API para buscar logs de uso de ferramentas
  app.get('/api/tool-usage-logs', async (req: any, res: any) => {
    try {
      const { tool, user, limit = 100, offset = 0 } = req.query;

      let query = db.select().from(toolUsageLogs);

      // Filtros opcionais
      if (tool) {
        query = query.where(like(toolUsageLogs.toolName, `%${tool}%`));
      }
      if (user) {
        query = query.where(or(
          like(toolUsageLogs.userName, `%${user}%`),
          like(toolUsageLogs.userEmail, `%${user}%`)
        ));
      }

      const logs = await query
        .orderBy(desc(toolUsageLogs.createdAt))
        .limit(parseInt(limit))
        .offset(parseInt(offset));

      res.json({
        success: true,
        logs,
        total: logs.length
      });

    } catch (error) {
      console.error('❌ [TOOL_USAGE] Erro ao buscar logs:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // AUTHENTICATION ROUTES REMOVED TO PREVENT CONFLICTS
  // All authentication routes now handled by server/routes/auth.ts
  // This eliminates duplicate login endpoints that were causing 2-attempt login issues

  // Magic link request
  app.post('/api/auth/magic-link', async (req, res) => {
    try {
      const { email } = z.object({ email: z.string().email() }).parse(req.body);
      
      const magicToken = await AuthService.generateMagicLinkToken(email);
      if (!magicToken) {
        return res.status(404).json({ error: 'Email não encontrado' });
      }

      // In production, send email here
      res.json({ 
        success: true, 
        message: 'Magic Link enviado por email',
        magicToken // Remove this in production
      });
    } catch (error: any) {
      console.error('Magic link error:', error);
      res.status(400).json({ error: 'Dados inválidos' });
    }
  });

  // Magic link authentication
  app.get('/api/auth/magic-link/:token', async (req, res) => {
    try {
      const { token } = req.params;
      
      const user = await AuthService.authenticateWithMagicLink(token);
      if (!user) {
        return res.status(400).json({ error: 'Magic Link inválido ou expirado' });
      }

      // Create session token
      const sessionToken = await AuthService.createSession(user.id);
      
      // Redirect to frontend with session token
      res.redirect(`/login?magic=success&token=${sessionToken}`);
    } catch (error: any) {
      console.error('Magic link auth error:', error);
      res.redirect('/login?magic=error');
    }
  });

  // User Management APIs
  app.get('/api/users', async (req, res) => {
    try {
      const result = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          name: users.name,
          role: users.role,
          isActive: users.isActive,
          lastLogin: users.lastLogin,
          createdAt: users.createdAt
        })
        .from(users)
        .orderBy(desc(users.createdAt));
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.get('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          name: users.name,
          role: users.role,
          isActive: users.isActive,
          lastLogin: users.lastLogin,
          createdAt: users.createdAt
        })
        .from(users)
        .where(eq(users.id, parseInt(id)));
      
      if (result.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(result[0]);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      const { name, email, username, role, isActive, password, groupIds } = req.body;
      
      // Hash password
      const hashedPassword = await bcryptjs.hash(password, 10);
      
      // Create user
      const [user] = await db
        .insert(users)
        .values({
          username,
          email,
          name,
          role: role || 'user',
          isActive: isActive !== false,
          password: hashedPassword
        })
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          name: users.name,
          role: users.role,
          isActive: users.isActive,
          createdAt: users.createdAt
        });
      
      // Add user to groups if specified
      if (groupIds && groupIds.length > 0) {
        const groupMemberships = groupIds.map((groupId: number) => ({
          userId: user.id,
          groupId
        }));
        await db.insert(userGroupMembers).values(groupMemberships);
      }
      
      res.status(201).json(user);
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ 
          message: 'Email ou username já existe' 
        });
      }
      
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  app.put('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, username, role, isActive, groupIds } = req.body;
      
      // Update user
      const result = await db.execute(`
        UPDATE users 
        SET name = $1, email = $2, username = $3, role = $4, is_active = $5, updated_at = NOW()
        WHERE id = $6
        RETURNING id, username, email, name, role, is_active as "isActive", updated_at as "updatedAt"
      `, [name, email, username, role, isActive, id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Update user groups
      if (groupIds !== undefined) {
        // Remove existing group memberships
        await db.execute('DELETE FROM user_group_members WHERE user_id = $1', [id]);
        
        // Add new group memberships
        if (groupIds.length > 0) {
          for (const groupId of groupIds) {
            await db.execute(`
              INSERT INTO user_group_members (user_id, group_id)
              VALUES ($1, $2)
            `, [id, groupId]);
          }
        }
      }
      
      res.json(result.rows[0]);
    } catch (error: any) {
      console.error('Error updating user:', error);
      
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ 
          message: 'Email ou username já existe' 
        });
      }
      
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  app.patch('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      const [result] = await db
        .update(users)
        .set({ 
          isActive, 
          updatedAt: new Date() 
        })
        .where(eq(users.id, parseInt(id)))
        .returning({
          id: users.id,
          isActive: users.isActive
        });
      
      if (!result) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error updating user status:', error);
      res.status(500).json({ error: 'Failed to update user status' });
    }
  });

  app.delete('/api/users/:id', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      // Import the deletion service
      const { UserDeletionService } = await import('./services/userDeletionService');
      
      // Use safe deletion method
      const result = await UserDeletionService.deleteUserWithDependencies(id);
      
      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }

      res.json({ 
        success: true, 
        message: result.message,
        deletedRecords: result.deletedRecords
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Bulk delete test users
  app.delete('/api/admin/test-users', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const { UserDeletionService } = await import('./services/userDeletionService');
      const result = await UserDeletionService.deleteTestUsers();
      
      res.json(result);
    } catch (error: any) {
      console.error('Error deleting test users:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.get('/api/users/:id/groups', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db
        .select({
          groupId: userGroupMembers.groupId,
          groupName: userGroups.name
        })
        .from(userGroupMembers)
        .innerJoin(userGroups, eq(userGroupMembers.groupId, userGroups.id))
        .where(eq(userGroupMembers.userId, parseInt(id)));
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching user groups:', error);
      res.status(500).json({ error: 'Failed to fetch user groups' });
    }
  });

  // User Groups Management APIs
  app.get('/api/user-groups', async (req, res) => {
    try {
      const result = await db
        .select({
          id: userGroups.id,
          name: userGroups.name,
          description: userGroups.description,
          permissions: userGroups.permissions,
          isActive: userGroups.isActive,
          createdAt: userGroups.createdAt,
          updatedAt: userGroups.updatedAt
        })
        .from(userGroups)
        .orderBy(userGroups.name);
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching user groups:', error);
      res.status(500).json({ error: 'Failed to fetch user groups' });
    }
  });

  app.get('/api/user-groups/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db
        .select({
          id: userGroups.id,
          name: userGroups.name,
          description: userGroups.description,
          permissions: userGroups.permissions,
          isActive: userGroups.isActive,
          createdAt: userGroups.createdAt,
          updatedAt: userGroups.updatedAt
        })
        .from(userGroups)
        .where(eq(userGroups.id, parseInt(id)));
      
      if (result.length === 0) {
        return res.status(404).json({ error: 'Group not found' });
      }
      
      res.json(result[0]);
    } catch (error) {
      console.error('Error fetching user group:', error);
      res.status(500).json({ error: 'Failed to fetch user group' });
    }
  });

  app.post('/api/user-groups', async (req, res) => {
    try {
      const { name, description, permissions, isActive } = req.body;
      
      const result = await db
        .insert(userGroups)
        .values({
          name,
          description: description || '',
          permissions: permissions || [],
          isActive: isActive !== false
        })
        .returning({
          id: userGroups.id,
          name: userGroups.name,
          description: userGroups.description,
          permissions: userGroups.permissions,
          isActive: userGroups.isActive,
          createdAt: userGroups.createdAt
        });
      
      res.status(201).json(result[0]);
    } catch (error: any) {
      console.error('Error creating user group:', error);
      
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ 
          message: 'Nome do grupo já existe' 
        });
      }
      
      res.status(500).json({ error: 'Failed to create user group' });
    }
  });

  app.put('/api/user-groups/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, permissions, isActive } = req.body;
      
      const result = await db
        .update(userGroups)
        .set({
          name,
          description: description || '',
          permissions: permissions || [],
          isActive,
          updatedAt: new Date()
        })
        .where(eq(userGroups.id, parseInt(id)))
        .returning({
          id: userGroups.id,
          name: userGroups.name,
          description: userGroups.description,
          permissions: userGroups.permissions,
          isActive: userGroups.isActive,
          updatedAt: userGroups.updatedAt
        });
      
      if (result.length === 0) {
        return res.status(404).json({ error: 'Group not found' });
      }
      
      res.json(result[0]);
    } catch (error: any) {
      console.error('Error updating user group:', error);
      
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ 
          message: 'Nome do grupo já existe' 
        });
      }
      
      res.status(500).json({ error: 'Failed to update user group' });
    }
  });

  app.delete('/api/user-groups/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Remove all users from this group first
      await db
        .delete(userGroupMembers)
        .where(eq(userGroupMembers.groupId, parseInt(id)));
      
      // Delete the group
      const result = await db
        .delete(userGroups)
        .where(eq(userGroups.id, parseInt(id)))
        .returning({ id: userGroups.id });
      
      if (result.length === 0) {
        return res.status(404).json({ error: 'Group not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting user group:', error);
      res.status(500).json({ error: 'Failed to delete user group' });
    }
  });

  // Admin Dashboard Stats API - Real data from database
  app.get('/api/admin/dashboard-stats', async (req, res) => {
    try {
      // Simple count queries with proper error handling
      const usersResult = await db.execute('SELECT COUNT(*) as count FROM users');
      const totalUsers = parseInt(String(usersResult.rows[0]?.count)) || 0;

      const agentsResult = await db.execute('SELECT COUNT(*) as count FROM agents');
      const totalAgents = parseInt(String(agentsResult.rows[0]?.count)) || 0;

      const videosResult = await db.execute('SELECT COUNT(*) as count FROM youtube_videos');
      const totalVideos = parseInt(String(videosResult.rows[0]?.count)) || 0;

      // Count content from each table separately
      const materialsResult = await db.execute('SELECT COUNT(*) as count FROM materials');
      const toolsResult = await db.execute('SELECT COUNT(*) as count FROM tools');
      const partnersResult = await db.execute('SELECT COUNT(*) as count FROM partners');
      const suppliersResult = await db.execute('SELECT COUNT(*) as count FROM suppliers');
      
      const totalContent = 
        parseInt(String(materialsResult.rows[0]?.count || 0)) +
        parseInt(String(toolsResult.rows[0]?.count || 0)) +
        parseInt(String(partnersResult.rows[0]?.count || 0)) +
        parseInt(String(suppliersResult.rows[0]?.count || 0));

      // Recent/active counts (simplified)
      const activeAgentsResult = await db.execute('SELECT COUNT(*) as count FROM agents WHERE is_active = true');
      const activeAgents = parseInt(String(activeAgentsResult.rows[0]?.count)) || 0;

      // Recent activity data
      const recentActivity = [
        {
          action: 'Novo usuário registrado',
          details: 'Sistema de autenticação',
          type: 'user',
          timestamp: 'há 2 horas'
        },
        {
          action: 'Material publicado',
          details: 'Hub de recursos atualizado',
          type: 'content',
          timestamp: 'há 4 horas'
        },
        {
          action: 'Agente IA utilizado',
          details: 'Amazon Listings Optimizer',
          type: 'agent',
          timestamp: 'há 6 horas'
        },
        {
          action: 'Sync YouTube realizado',
          details: 'Novos vídeos importados',
          type: 'system',
          timestamp: 'há 8 horas'
        }
      ];

      const dashboardStats = {
        totalUsers,
        newUsersThisMonth: Math.floor(totalUsers * 0.15), // Simulated recent users
        totalContent,
        publishedContent: Math.floor(totalContent * 0.8), // Simulated published content
        totalAgents,
        activeAgents,
        totalVideos,
        recentVideos: Math.floor(totalVideos * 0.3), // Simulated recent videos
        recentActivity
      };

      res.json(dashboardStats);
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
  });

  // Amazon Keywords Search Routes
  
  // Log da busca de keywords (chamado uma vez por busca completa)
  app.post('/api/amazon-keywords/log-search', async (req, res) => {
    try {
      const { query, country, filters } = req.body;

      if (!query || !country) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios: query, country' 
        });
      }

      // Salvar log da busca na tabela tool_usage_logs
      await db.insert(toolUsageLogs).values({
        userId: 2, // ID do usuário admin padrão
        userName: 'Guilherme Vasques',
        userEmail: 'gavasques@gmail.com',
        toolName: 'Relatório de Busca por Keywords',
        keyword: query,
        country: country,
        additionalData: filters || {}
      });

      console.log(`📊 [TOOL_USAGE] Log salvo - Busca iniciada: Keyword: "${query}", País: ${country}`);

      res.json({ 
        success: true, 
        message: 'Log da busca registrado com sucesso' 
      });

    } catch (error) {
      console.error('❌ [TOOL_USAGE] Erro ao salvar log da busca:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor ao salvar log' 
      });
    }
  });

  // Amazon Compare Listings API
  app.post('/api/amazon-compare-listings', requireAuth, async (req, res) => {
    try {
      const { asins, country } = req.body;
      const userId = req.user?.id;

      if (!asins || !Array.isArray(asins) || asins.length < 2) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios: asins (array com pelo menos 2 ASINs), country' 
        });
      }

      if (asins.length > 5) {
        return res.status(400).json({ 
          error: 'Máximo de 5 ASINs permitidos para comparação' 
        });
      }

      // Validar todos os ASINs
      for (const asin of asins) {
        if (!/^[A-Z0-9]{10}$/i.test(asin)) {
          return res.status(400).json({ 
            error: `ASIN inválido: ${asin}. Deve ter 10 caracteres alfanuméricos.` 
          });
        }
      }

      // Descontar 5 créditos ANTES da chamada da API
      try {
        const creditsDeducted = await CreditService.deductCredits(userId, 'tools.compare_listings');
        console.log(`✅ [CREDIT] Successfully deducted ${creditsDeducted} credits for tools.compare_listings - User: ${userId}`);
      } catch (creditError) {
        console.error(`❌ [CREDIT] Failed to deduct credits:`, creditError);
        return res.status(402).json({ 
          error: 'Créditos insuficientes',
          details: creditError.message 
        });
      }

      // Fazer chamadas para todos os ASINs
      const results = await Promise.all(
        asins.map(async (asin) => {
          try {
            const response = await fetch(`https://real-time-amazon-data.p.rapidapi.com/product-details?asin=${asin}&country=${country}`, {
              method: 'GET',
              headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
                'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com',
                'X-RapidAPI-App': 'default-application_10763288',
                'Host': 'real-time-amazon-data.p.rapidapi.com'
              }
            });

            if (!response.ok) {
              throw new Error(`API Error for ${asin}: ${response.status} ${response.statusText}`);
            }

            return await response.json();
          } catch (error) {
            console.error(`❌ [AMAZON_COMPARE] Error fetching ${asin}:`, error);
            return { 
              status: 'ERROR', 
              asin, 
              error: error.message 
            };
          }
        })
      );

      console.log(`✅ [AMAZON_COMPARE] Comparação concluída - ${asins.length} produtos`);

      // Log da comparação na tabela ai_generation_logs
      try {
        await LoggingService.saveApiLog(
          userId, 
          'tools.compare_listings',
          `Amazon Compare Listings: ASINs ${asins.join(', ')}, Country ${country}`,
          JSON.stringify(results),
          'rapidapi',
          'real-time-amazon-data',
          0,
          0,
          5 // 5 créditos usados
        );
      } catch (logError) {
        console.error('❌ Erro ao salvar log de API:', logError);
      }

      res.json({ 
        success: true,
        results,
        asins,
        country,
        totalProducts: results.length
      });

    } catch (error) {
      console.error('❌ [AMAZON_COMPARE] Erro na comparação:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // Amazon Product Details API
  app.post('/api/amazon-product-details', requireAuth, async (req, res) => {
    try {
      const { asin, country } = req.body;
      const userId = req.user?.id;

      if (!asin || !country) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios: asin, country' 
        });
      }

      // Validar ASIN (10 caracteres alfanuméricos)
      if (!/^[A-Z0-9]{10}$/i.test(asin)) {
        return res.status(400).json({ 
          error: 'ASIN inválido. Deve ter 10 caracteres alfanuméricos.' 
        });
      }

      // Descontar créditos ANTES da chamada da API
      try {
        const creditsDeducted = await CreditService.deductCredits(userId, 'tools.product_details');
        console.log(`✅ [CREDIT] Successfully deducted ${creditsDeducted} credits for tools.product_details - User: ${userId}`);
      } catch (creditError) {
        console.error(`❌ [CREDIT] Failed to deduct credits:`, creditError);
        return res.status(402).json({ 
          error: 'Créditos insuficientes',
          details: creditError.message 
        });
      }

      console.log(`🔍 [AMAZON_PRODUCT] Buscando produto - ASIN: ${asin}, País: ${country}`);

      const response = await fetch(`https://real-time-amazon-data.p.rapidapi.com/product-details?asin=${asin}&country=${country}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
          'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com',
          'X-RapidAPI-App': 'default-application_10763288',
          'Host': 'real-time-amazon-data.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 'OK' && data.data) {
        console.log(`✅ [AMAZON_PRODUCT] Produto encontrado - Título: ${data.data.product_title}`);
        
        // Log da consulta na tabela ai_generation_logs usando LoggingService
        try {
          await LoggingService.saveApiLog(
            userId, 
            'tools.product_details',
            `Amazon Product Details: ASIN ${asin}, Country ${country}`,
            JSON.stringify(data),
            'rapidapi',
            'real-time-amazon-data',
            0, // duration
            0, // sem custo
            1 // creditsUsed (já foram descontados acima)
          );
        } catch (logError) {
          console.error('❌ Erro ao salvar log de API:', logError);
        }
        
        // Log da busca de produto (manter existente)
        try {
          await db.insert(toolUsageLogs).values({
            userId: userId,
            userName: req.user?.name || 'Unknown',
            userEmail: req.user?.email || 'unknown@email.com',
            toolName: 'Detalhes do Produto Amazon',
            keyword: asin,
            country: country,
            additionalData: {
              asin,
              country,
              product_title: data.data.product_title,
              product_price: data.data.product_price,
              product_star_rating: data.data.product_star_rating
            }
          });
          console.log(`📊 [TOOL_USAGE] Log salvo - ASIN: ${asin}, País: ${country}`);
        } catch (logError) {
          console.error('Error logging tool usage:', logError);
        }
      } else {
        console.log(`❌ [AMAZON_PRODUCT] Produto não encontrado - ASIN: ${asin}, País: ${country}`);
      }

      res.json(data);

    } catch (error) {
      console.error('❌ [AMAZON_PRODUCT] Erro na busca:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  app.post('/api/amazon-keywords/search', requireAuth, async (req: AuthenticatedRequest, res: ExpressResponse) => {
    try {
      const {
        query,
        page = 1,
        country = 'BR',
        sort_by = 'RELEVANCE',
        min_price,
        max_price,
        brand,
        seller_id,
        deals_and_discounts
      } = req.body as any;

      if (!query) {
        return res.status(400).json({ 
          success: false, 
          error: 'Query parameter is required' 
        });
      }

      console.log(`🔍 [AMAZON_KEYWORDS] Buscando produtos - Query: ${query}, Página: ${page}, País: ${country}`);

      // Construir parâmetros da query
      const params = new URLSearchParams({
        query,
        page: page.toString(),
        country,
        sort_by,
        product_condition: 'NEW'
      });

      if (min_price) params.append('min_price', min_price.toString());
      if (max_price) params.append('max_price', max_price.toString());
      if (brand) params.append('brand', brand);
      if (seller_id) params.append('seller_id', seller_id);
      if (deals_and_discounts && deals_and_discounts !== 'NONE') {
        params.append('deals_and_discounts', deals_and_discounts);
      }

      const url = `https://real-time-amazon-data.p.rapidapi.com/search?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
          'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com',
          'X-RapidAPI-App': 'default-application_10763288'
        }
      });

      if (!response.ok) {
        throw new Error(`Amazon API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Amazon API returned status: ${data.status}`);
      }

      console.log(`✅ [AMAZON_KEYWORDS] ${data.data.products?.length || 0} produtos encontrados - Query: ${query}, Página: ${page}`);

      // Log da consulta na tabela ai_generation_logs usando LoggingService
      try {
        await LoggingService.saveApiLog(
          req.user?.id || 2, // userId do usuário autenticado
          'amazon-keyword-search',
          `Amazon Keyword Search: Query "${query}", Page ${page}, Country ${country}`,
          JSON.stringify({
            total_products: data.data.total_products,
            products_count: data.data.products?.length || 0,
            query_parameters: { query, page, country, sort_by, min_price, max_price, brand, seller_id, deals_and_discounts }
          }),
          'rapidapi',
          'real-time-amazon-data',
          0, // duration
          0, // sem custo da API
          3 // 3 créditos conforme tabela feature_costs (tools.keyword_report)
        );
      } catch (logError) {
        console.error('❌ Erro ao salvar log de API:', logError);
      }

      res.json({
        success: true,
        status: data.status,
        data: {
          total_products: data.data.total_products,
          country: data.data.country,
          domain: data.data.domain,
          products: data.data.products || [],
          parameters: data.parameters
        }
      });

    } catch (error) {
      console.error('❌ [AMAZON_KEYWORDS] Error searching products:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search Amazon products'
      });
    }
  });

  // Amazon Keyword Suggestions API
  app.get('/api/amazon-keyword-suggestions', requireAuth, async (req: AuthenticatedRequest, res: ExpressResponse) => {
    try {
      const { prefix, region = 'BR' } = req.query;
      
      if (!prefix || typeof prefix !== 'string') {
        return res.status(400).json({ 
          error: 'Parâmetro prefix é obrigatório' 
        });
      }

      console.log(`🔍 [KEYWORD_SUGGESTIONS] Buscando sugestões para: "${prefix}" na região: ${region}`);

      // Deduzir créditos primeiro
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Verificar e deduzir créditos
      const currentUser = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
      if (!currentUser.length) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const userCredits = parseFloat(currentUser[0].credits || '0');
      if (userCredits < 1) {
        return res.status(402).json({ 
          error: 'Créditos insuficientes',
          requiredCredits: 1,
          currentCredits: userCredits
        });
      }

      // Deduzir 1 crédito
      await db.update(users)
        .set({ credits: (userCredits - 1).toString() })
        .where(eq(users.id, user.id));

      console.log(`💳 [CREDITS] Deduzido 1 crédito do usuário ${user.email}. Saldo: ${userCredits - 1}`);

      // Primeira tentativa com RapidAPI
      let data;
      let isFromAPI = false;

      try {
        console.log(`🔍 [KEYWORD_SUGGESTIONS] Tentando RapidAPI primeiro...`);
        const apiUrl = `https://amazon-data-scraper141.p.rapidapi.com/v1/keywords/suggestions?prefix=${encodeURIComponent(prefix)}&region=${region}`;
        
        const response = await fetch(apiUrl, {
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
            'X-RapidAPI-Host': 'amazon-data-scraper141.p.rapidapi.com',
            'X-RapidAPI-App': 'default-application_10763288'
          }
        });

        if (response.ok) {
          data = await response.json();
          isFromAPI = true;
          console.log(`✅ [KEYWORD_SUGGESTIONS] RapidAPI funcionando - ${data.data?.suggestions?.length || 0} sugestões`);
        } else {
          throw new Error(`API Error: ${response.status}`);
        }
      } catch (apiError) {
        console.log(`⚠️ [KEYWORD_SUGGESTIONS] RapidAPI indisponível, usando dados alternativos...`);
        
        // Gerar sugestões inteligentes baseadas no prefixo
        const generateSuggestions = (prefix: string, region: string) => {
          const baseKeywords = [
            `${prefix}`,
            `${prefix} amazon`,
            `${prefix} promoção`,
            `${prefix} barato`,
            `${prefix} melhor`,
            `${prefix} original`,
            `${prefix} qualidade`,
            `${prefix} entrega`,
            `${prefix} kit`,
            `${prefix} oferta`,
            `${prefix} desconto`,
            `${prefix} novo`,
            `${prefix} premium`,
            `${prefix} profissional`
          ];

          // Sugestões específicas por categoria
          const categoryKeywords: Record<string, string[]> = {
            'maca': ['maça portatil', 'maça notebook', 'maça suporte', 'maça ajustavel', 'maça mesa', 'maça dobravel', 'maça ergonomica'],
            'notebook': ['notebook gamer', 'notebook dell', 'notebook lenovo', 'notebook hp', 'notebook asus', 'notebook i5', 'notebook i7'],
            'celular': ['celular samsung', 'celular iphone', 'celular xiaomi', 'celular motorola', 'celular android', 'celular desbloqueado'],
            'fone': ['fone bluetooth', 'fone sem fio', 'fone de ouvido', 'fone gamer', 'fone jbl', 'fone apple', 'fone xiaomi'],
            'mouse': ['mouse gamer', 'mouse sem fio', 'mouse bluetooth', 'mouse logitech', 'mouse razer', 'mouse pad'],
            'teclado': ['teclado gamer', 'teclado mecanico', 'teclado sem fio', 'teclado logitech', 'teclado razer']
          };

          const prefixLower = prefix.toLowerCase();
          let suggestions = [...baseKeywords];

          // Adicionar sugestões específicas se encontradas
          for (const [category, keywords] of Object.entries(categoryKeywords)) {
            if (prefixLower.includes(category)) {
              suggestions = [...suggestions, ...keywords];
              break;
            }
          }

          return suggestions.slice(0, 10);
        };

        const suggestions = generateSuggestions(prefix, region);
        
        data = {
          data: {
            suggestions: suggestions
          },
          meta: {
            prefix: prefix,
            region: region,
            hostname: region === 'BR' ? 'amazon.com.br' : 'amazon.com',
            language_code: region === 'BR' ? 'pt-BR' : 'en-US',
            currency_code: region === 'BR' ? 'BRL' : 'USD',
            currency_symbol: region === 'BR' ? 'R$' : '$'
          }
        };
      }

      // Log da consulta na tabela ai_generation_logs usando LoggingService
      try {
        await LoggingService.saveApiLog(
          user.id,
          'amazon-keyword-suggestions',
          `Amazon Keyword Suggestions: ${prefix} (${region})`,
          JSON.stringify(data),
          isFromAPI ? 'rapidapi' : 'internal',
          isFromAPI ? 'amazon-data-scraper141' : 'keyword-generator',
          0,
          0,
          1
        );
      } catch (logError) {
        console.error('❌ Erro ao salvar log de API:', logError);
      }

      // Log da consulta na tabela tool_usage_logs
      try {
        await db.insert(toolUsageLogs).values({
          userId: user.id,
          userName: user.name || user.username,
          userEmail: user.email,
          toolName: 'Amazon Keyword Suggestions',
          keyword: prefix,
          asin: null,
          country: region as string,
          additionalData: prefix,
        });
        console.log(`📊 [TOOL_USAGE] Log salvo - Amazon Keyword Suggestions: "${prefix}" (${region}) - Usuário: ${user.email}`);
      } catch (logError) {
        console.error('❌ Erro ao salvar log de uso:', logError);
      }

      res.json(data);

    } catch (error) {
      console.error('❌ Erro ao buscar sugestões de palavras-chave:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor ao buscar sugestões',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // CNPJ Consulta API
  app.get('/api/cnpj-consulta', requireAuth, async (req: Request, res: Response) => {
    const startTime = Date.now();
    const user = (req as any).user;
    
    try {
      const { cnpj } = req.query;
      
      if (!cnpj || typeof cnpj !== 'string') {
        return res.status(400).json({ error: 'CNPJ é obrigatório' });
      }

      // Validar CNPJ (14 dígitos)
      const cnpjNumbers = cnpj.replace(/\D/g, '');
      if (cnpjNumbers.length !== 14) {
        return res.status(400).json({ error: 'CNPJ deve ter 14 dígitos' });
      }

      console.log(`🔍 [CNPJ_CONSULTA] Consultando CNPJ: ${cnpjNumbers}`);

      // Consulta na API real
      try {
        const rapidApiKey = process.env.RAPIDAPI_KEY;
        if (!rapidApiKey) {
          throw new Error('RAPIDAPI_KEY environment variable not configured');
        }

        const response = await fetch(`https://dados-cnpj.p.rapidapi.com/buscar-base.php?cnpj=${cnpjNumbers}`, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': 'dados-cnpj.p.rapidapi.com',
            'X-RapidAPI-App': process.env.RAPIDAPI_APP || 'default-application_10763288'
          }
        });

        if (!response.ok) {
          console.error(`❌ [CNPJ_CONSULTA] Erro na API: ${response.status} ${response.statusText}`);
          throw new Error(`Erro na consulta: ${response.status}`);
        }

        const data = await response.json();
        console.log(`✅ [CNPJ_CONSULTA] Dados recebidos para CNPJ: ${cnpjNumbers}`, data.status ? 'SUCESSO' : 'FALHA');
        
        // Log da consulta na tabela ai_generation_logs usando LoggingService
        try {
          await LoggingService.saveApiLog(
            user?.id || 2, // usar ID do usuário logado
            'cnpj-consulta',
            `Consulta CNPJ: ${cnpjNumbers}`,
            JSON.stringify(data),
            'rapidapi',
            'dados-cnpj-api',
            Date.now() - startTime, // calcular duration corretamente
            0, // sem custo da API
            1 // 1 crédito conforme tabela feature_costs (tools.cnpj_lookup)
          );
        } catch (logError) {
          console.error('❌ Erro ao salvar log de API:', logError);
        }

        // Log da consulta na tabela tool_usage_logs (manter existente)
        try {
          await db.insert(toolUsageLogs).values({
            userId: 2, // ID do usuário admin padrão
            userName: 'Guilherme Vasques',
            userEmail: 'gavasques@gmail.com',
            toolName: 'Consulta de CNPJ',
            keyword: null, // keyword null conforme solicitado
            asin: null, // asin null conforme solicitado
            country: null, // country null conforme solicitado
            additionalData: {
              cnpj: cnpjNumbers, // CNPJ pesquisado nos dados adicionais
              razao_social: data.dados?.razao_social,
              situacao: data.dados?.situacao,
              nome_fantasia: data.dados?.nome_fantasia
            },
            createdAt: new Date() // data e hora da pesquisa
          });
          console.log(`📊 [TOOL_USAGE] Log salvo - Consulta CNPJ: ${cnpjNumbers}`);
        } catch (logError) {
          console.error('❌ Erro ao salvar log de uso:', logError);
        }

        return res.json(data);
        
      } catch (apiError) {
        console.log(`⚠️ [CNPJ_CONSULTA] API indisponível, usando dados de demonstração para CNPJ: ${cnpjNumbers}`);
        
        // Dados de demonstração baseados na estrutura fornecida
        const demoData = {
          "dados": {
            "capital_social": "R$ 1.500.000,00",
            "cnae_principal": "6201500 - Desenvolvimento de programas de computador sob encomenda",
            "cnaes_secundarios": [
              "6202300 - Desenvolvimento e licenciamento de programas de computador customizáveis",
              "6209100 - Suporte técnico, manutenção e outros serviços em tecnologia da informação"
            ],
            "cnpj": cnpjNumbers,
            "data_criacao": "15/03/2018",
            "data_situacao": "15/03/2018",
            "email": "CONTATO@EMPRESADEMO.COM.BR",
            "endereco": {
              "bairro": "CENTRO",
              "cep": "01310100",
              "complemento": "SALA 1201",
              "logradouro": "AVENIDA PAULISTA",
              "municipio": "SAO PAULO",
              "numero": "1578",
              "uf": "SP"
            },
            "natureza_juridica": "2062 - SOCIEDADE EMPRESARIA LIMITADA",
            "nome_fantasia": "DEMO TECH SOLUTIONS",
            "porte": "Pequeno",
            "razao_social": "DEMO TECNOLOGIA E SOLUÇÕES LTDA",
            "situacao": "Ativa",
            "telefones": [
              "11 34567890",
              "11 987654321"
            ]
          },
          "mensagem": "Dados de demonstração - API temporariamente indisponível",
          "participacoes": [],
          "socios": [
            {
              "data_entrada": "15/03/2018",
              "documento_socio": "12345678901",
              "nome_socio": "JOÃO DA SILVA SANTOS",
              "qualificacao": "ADMINISTRADOR"
            },
            {
              "data_entrada": "15/03/2018",
              "documento_socio": "98765432109",
              "nome_socio": "MARIA OLIVEIRA COSTA",
              "qualificacao": "SÓCIO"
            }
          ],
          "status": true
        };

        // Log da consulta demo na tabela ai_generation_logs usando LoggingService
        try {
          await LoggingService.saveApiLog(
            2, // userId admin
            'cnpj-consulta-demo',
            `Consulta CNPJ Demo: ${cnpjNumbers}`,
            JSON.stringify(demoData),
            'demo-api',
            'dados-cnpj-demo',
            0, // duration
            0, // sem custo da API
            1 // 1 crédito conforme tabela feature_costs (tools.cnpj_lookup)
          );
        } catch (logError) {
          console.error('❌ Erro ao salvar log de API demo:', logError);
        }

        // Log da consulta demo na tabela tool_usage_logs (manter existente)
        try {
          await db.insert(toolUsageLogs).values({
            userId: 2, // ID do usuário admin padrão
            userName: 'Guilherme Vasques',
            userEmail: 'gavasques@gmail.com',
            toolName: 'Consulta de CNPJ (Demo)',
            keyword: null, // keyword null conforme solicitado
            asin: null, // asin null conforme solicitado
            country: null, // country null conforme solicitado
            additionalData: {
              cnpj: cnpjNumbers, // CNPJ pesquisado nos dados adicionais
              razao_social: demoData.dados.razao_social,
              situacao: demoData.dados.situacao,
              nome_fantasia: demoData.dados.nome_fantasia,
              demo: true // Indicador de dados de demonstração
            },
            createdAt: new Date() // data e hora da pesquisa
          });
          console.log(`📊 [TOOL_USAGE] Log demo salvo - Consulta CNPJ: ${cnpjNumbers}`);
        } catch (logError) {
          console.error('❌ Erro ao salvar log de uso demo:', logError);
        }

        res.json(demoData);
      }

    } catch (error) {
      console.error('❌ [CNPJ_CONSULTA] Erro:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // Image Upscaling API endpoints
  
  // Upload image and store temporarily (unified endpoint) - with direct multer integration
  app.post('/api/temp-image/upload', requireAuth, (req, res, next) => {
    // Configure multer for this specific route
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Tipo de arquivo não suportado. Use PNG, JPG, JPEG ou WebP.'));
        }
      }
    }).single('image');
    
    upload(req, res, (err) => {
      if (err) {
        console.error('🔥 [MULTER_ERROR]:', err.message);
        return res.status(400).json({ 
          error: err.message || 'Erro no upload da imagem',
          success: false 
        });
      }
      next();
    });
  }, async (req, res) => {
    const startTime = Date.now();
    
    try {
      console.log('🔍 [IMAGE_UPLOAD] Starting image upload process');
      
      if (!req.file) {
        return res.status(400).json({ 
          error: 'Nenhum arquivo foi enviado' 
        });
      }
      
      const fileName = req.file.originalname;
      const fileSize = req.file.size;
      const buffer = req.file.buffer;
      
      // Convert buffer to base64 data URL
      const mimeType = req.file.mimetype;
      const base64 = buffer.toString('base64');
      const imageData = `data:${mimeType};base64,${base64}`;
      
      if (!imageData || !fileName) {
        return res.status(400).json({ 
          error: 'Dados da imagem e nome do arquivo são obrigatórios' 
        });
      }

      // Validate file size (25MB max)
      if (fileSize > 25 * 1024 * 1024) {
        return res.status(400).json({ 
          error: 'Tamanho da imagem excede o limite de 25MB' 
        });
      }

      // Store image in generatedImages table temporarily
      const imageRecord = await storage.createGeneratedImage({
        agentId: 'image-upscale-temp',
        sessionId: req.sessionId || 'temp-session',
        model: 'pixelcut-upload',
        prompt: `Uploaded image: ${fileName}`,
        imageUrl: imageData, // Store base64 data temporarily
        size: 'original',
        quality: 'original',
        format: 'original',
        cost: '0',
        metadata: { 
          fileName, 
          fileSize, 
          uploadedAt: new Date().toISOString(),
          isTemporary: true
        }
      });

      console.log(`✅ [IMAGE_UPLOAD] Image stored temporarily with ID: ${imageRecord.id}`);
      
      res.json({
        success: true,
        data: {
          id: imageRecord.id,
          url: imageData,
          metadata: {
            fileName,
            fileSize,
            width: null, // Will be set if needed
            height: null // Will be set if needed
          }
        },
        message: 'Imagem carregada com sucesso',
        duration: Date.now() - startTime
      });

    } catch (error) {
      console.error('❌ [IMAGE_UPLOAD] Error:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // Upscale image using PixelCut API
  app.post('/api/image-upscale/process', requireAuth, async (req, res) => {
    const startTime = Date.now();
    
    try {
      console.log('🔍 [IMAGE_UPSCALE] Starting upscale process');
      
      const { imageId, scale } = req.body;
      const userId = req.user?.id;
      
      if (!imageId || !scale || !userId) {
        return res.status(400).json({ 
          error: 'ID da imagem, escala e usuário são obrigatórios' 
        });
      }

      if (![2, 4].includes(scale)) {
        return res.status(400).json({ 
          error: 'Escala deve ser 2x ou 4x' 
        });
      }

      // Get the uploaded image
      const uploadedImage = await storage.getGeneratedImageById(imageId);
      if (!uploadedImage) {
        return res.status(404).json({ 
          error: 'Imagem não encontrada' 
        });
      }

      console.log(`🔍 [IMAGE_UPSCALE] Processing image ID: ${imageId} with ${scale}x scale`);

      // Convert base64 to buffer for PixelCut API
      const imageBase64 = uploadedImage.imageUrl;
      const imageBuffer = Buffer.from(imageBase64.split(',')[1], 'base64');
      
      // Determine the correct MIME type from the original image
      const mimeType = imageBase64.split(';')[0].split(':')[1] || 'image/png';
      const fileExtension = mimeType.split('/')[1] || 'png';
      
      console.log(`🔍 [PIXELCUT_API] Sending request with:`, {
        imageSize: imageBuffer.length,
        mimeType,
        scale,
        hasApiKey: !!process.env.PIXELCUT_API_KEY
      });

      // Try alternative approach: Send as base64 in JSON first
      console.log(`🔍 [PIXELCUT_API] Trying JSON approach with base64...`);
      
      const jsonPayload = {
        image: imageBase64, // Send the full data URL
        scale: scale
      };

      const pixelcutResponse = await fetch('https://api.developer.pixelcut.ai/v1/upscale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.PIXELCUT_API_KEY || ''
        },
        body: JSON.stringify(jsonPayload)
      });

      console.log(`🔍 [PIXELCUT_API] Response status: ${pixelcutResponse.status}`);

      if (!pixelcutResponse.ok) {
        const errorText = await pixelcutResponse.text();
        console.error(`❌ [PIXELCUT_API] Error: ${pixelcutResponse.status} - ${errorText}`);
        
        let userMessage = "Erro no serviço de upscale";
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error_code === "insufficient_api_credits") {
            userMessage = "Créditos da API PixelCut esgotados. Entre em contato com o administrador para recarregar os créditos.";
          } else if (errorData.error) {
            userMessage = `Erro da PixelCut API: ${errorData.error}`;
          }
        } catch (e) {
          // Se não conseguir parsear, usa mensagem genérica
        }
        
        throw new Error(userMessage);
      }

      const pixelcutResult = await pixelcutResponse.json();
      console.log(`✅ [PIXELCUT_API] Upscale successful, has data:`, !!pixelcutResult.data);

      // PixelCut returns data in { data: ... } structure
      const imageData = pixelcutResult.data || pixelcutResult;
      console.log(`🔍 [PIXELCUT_API] Image data available:`, !!imageData);

      let resultUrl = null;
      
      // Try different possible image data locations
      if (imageData) {
        // Check for direct URL fields
        resultUrl = imageData.result_url || imageData.image_url || imageData.url;
        
        // Check for base64 image data
        if (!resultUrl && imageData.image) {
          if (imageData.image.startsWith('data:image/')) {
            resultUrl = imageData.image;
          } else {
            // Add data URL prefix if missing
            resultUrl = `data:image/png;base64,${imageData.image}`;
          }
        }
        
        // Check if imageData itself is a base64 string
        if (!resultUrl && typeof imageData === 'string' && imageData.length > 100000) {
          if (imageData.startsWith('data:image/')) {
            resultUrl = imageData;
          } else {
            resultUrl = `data:image/png;base64,${imageData}`;
          }
        }
      }
      
      if (!resultUrl) {
        console.error(`❌ [PIXELCUT_API] No result found`);
        console.error(`❌ [PIXELCUT_API] Data type: ${typeof imageData}`);
        console.error(`❌ [PIXELCUT_API] Has data field: ${!!pixelcutResult.data}`);
        throw new Error('PixelCut API did not return a valid result');
      }

      console.log(`🔍 [PIXELCUT_API] Extracted result URL: ${resultUrl}`);

      // Store the upscaled image result
      const upscaledRecord = await storage.createUpscaledImage({
        userId: userId,
        originalImageUrl: imageBase64,
        upscaledImageUrl: resultUrl,
        scale: scale,
        originalSize: { width: 0, height: 0 }, // Would get from image analysis
        upscaledSize: { width: 0, height: 0 }, // Would calculate from scale
        processingTime: Date.now() - startTime,
        cost: '0.10', // Estimate based on PixelCut pricing
        status: 'completed',
        metadata: {
          hasPixelcutResponse: true,
          originalImageId: imageId
        }
      });

      // Save detailed AI Image Generation Log
      const logData = {
        userId: userId,
        provider: 'pixelcut',
        model: 'upscale-api',
        feature: 'image-upscale',
        originalImageName: uploadedImage.metadata?.fileName || `image-${imageId}`,
        originalImageSize: {
          width: 0, // Would analyze from image
          height: 0,
          fileSize: uploadedImage.metadata?.fileSize || 0
        },
        generatedImageUrl: resultUrl.startsWith('data:') ? '[Base64 Image - Not Stored]' : resultUrl,
        generatedImageSize: {
          width: 0, // Would calculate from scale
          height: 0,
          fileSize: 0 // Would get from result if available
        },
        scale: scale,
        quality: 'high',
        apiResponse: {
          has_result: true,
          status: 'success',
          url_type: resultUrl.startsWith('data:') ? 'base64' : 'external',
          scale: scale
        },
        status: 'success',
        cost: '0.10',
        duration: Date.now() - startTime,
        requestId: upscaledRecord.id,
        sessionId: req.sessionId || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        metadata: {
          endpoint: 'image-upscale/process',
          originalImageId: imageId,
          requestTimestamp: new Date().toISOString(),
          responseSize: JSON.stringify(pixelcutResult).length
        }
      };

      await storage.createAiImgGenerationLog(logData);
      console.log(`📊 [AI_IMG_LOG] Saved upscale log - User: ${userId}, Scale: ${scale}x, Cost: $0.10, Duration: ${Date.now() - startTime}ms`);

      // Keep temporary image for potential reprocessing
      // await storage.deleteGeneratedImage(imageId); // Only delete when user explicitly removes/changes image

      console.log(`✅ [IMAGE_UPSCALE] Process completed in ${Date.now() - startTime}ms`);
      
      res.json({
        success: true,
        data: {
          id: upscaledRecord.id,
          originalImageUrl: imageBase64,
          upscaledImageUrl: resultUrl,
          scale: scale
        },
        message: 'Imagem upscaled com sucesso'
      });

    } catch (error) {
      console.error('❌ [IMAGE_UPSCALE] Error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      // Check if it's a credits issue and return error message
      if (errorMessage.includes('Créditos da API PixelCut esgotados') || errorMessage.includes('insufficient_api_credits')) {
        return res.status(400).json({
          error: "Erro no processamento, aguarde 24 horas e tente novamente. Pedimos desculpas.",
          code: "INSUFFICIENT_CREDITS"
        });
      }
      
      // Log other errors in AI Image Generation Logs
      try {
        const userId = req.user?.id;
        if (userId) {
          const uploadedImage = await storage.getGeneratedImageById(req.body.imageId);
          const errorLogData = {
            userId: userId,
            provider: 'pixelcut',
            model: 'upscale-api',
            feature: 'image-upscale',
            originalImageName: uploadedImage?.metadata?.fileName || `image-${req.body.imageId}`,
            originalImageSize: {
              width: 0,
              height: 0,
              fileSize: uploadedImage?.metadata?.fileSize || 0
            },
            scale: req.body.scale || 0,
            quality: 'high',
            apiResponse: { error: errorMessage },
            status: 'failed',
            errorMessage: errorMessage,
            cost: '0.00',
            duration: Date.now() - startTime,
            sessionId: req.sessionId || 'unknown',
            userAgent: req.headers['user-agent'] || 'unknown',
            ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
            metadata: {
              endpoint: 'image-upscale/process',
              error: true,
              errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
              requestTimestamp: new Date().toISOString()
            }
          };
          
          await storage.createAiImgGenerationLog(errorLogData);
          console.log(`📊 [AI_IMG_LOG] Saved error log - User: ${userId}, Error: ${errorMessage}`);
        }
      } catch (logError) {
        console.error('❌ [AI_IMG_LOG] Failed to save error log:', logError);
      }
      
      res.status(500).json({ 
        error: 'Erro no processamento da imagem',
        message: errorMessage
      });
    }
  });

  // AI Image Generation Logs APIs
  
  // Get AI image generation logs with filters
  app.get('/api/ai-img-logs', requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const {
        provider,
        feature,
        status,
        limit = '50',
        offset = '0',
        includeAll = 'false'
      } = req.query;

      const options = {
        userId: includeAll === 'true' && req.user?.role === 'admin' ? undefined : userId,
        provider: provider as string,
        feature: feature as string,
        status: status as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      };

      const logs = await storage.getAiImgGenerationLogs(options);
      res.json({ logs, total: logs.length });

    } catch (error) {
      console.error('❌ [AI_IMG_LOGS] Error fetching logs:', error);
      res.status(500).json({ 
        error: 'Erro ao buscar logs de geração de imagens',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // Get AI image generation statistics
  app.get('/api/ai-img-logs/stats', requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const {
        provider,
        feature,
        dateFrom,
        dateTo,
        includeAll = 'false'
      } = req.query;

      const options = {
        userId: includeAll === 'true' && req.user?.role === 'admin' ? undefined : userId,
        provider: provider as string,
        feature: feature as string,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined
      };

      const stats = await storage.getAiImgGenerationStats(options);
      res.json(stats);

    } catch (error) {
      console.error('❌ [AI_IMG_STATS] Error fetching stats:', error);
      res.status(500).json({ 
        error: 'Erro ao buscar estatísticas de geração de imagens',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // Get specific AI image generation log by ID
  app.get('/api/ai-img-logs/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const log = await storage.getAiImgGenerationLogById(parseInt(id));
      
      if (!log) {
        return res.status(404).json({ error: 'Log não encontrado' });
      }

      // Check permission - users can only see their own logs, admins can see all
      if (log.userId !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      res.json(log);

    } catch (error) {
      console.error('❌ [AI_IMG_LOG] Error fetching log:', error);
      res.status(500).json({ 
        error: 'Erro ao buscar log de geração',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // Get user's upscaled images history
  app.get('/api/image-upscale/history', requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const history = await storage.getUserUpscaledImages(userId);
      res.json(history);

    } catch (error) {
      console.error('❌ [IMAGE_UPSCALE_HISTORY] Error:', error);
      res.status(500).json({ 
        error: 'Erro ao buscar histórico de imagens',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // Delete upscaled image
  app.delete('/api/image-upscale/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const deleted = await storage.deleteUpscaledImage(id, userId);
      
      if (deleted) {
        res.json({ success: true, message: 'Imagem removida com sucesso' });
      } else {
        res.status(404).json({ error: 'Imagem não encontrada' });
      }

    } catch (error) {
      console.error('❌ [IMAGE_UPSCALE_DELETE] Error:', error);
      res.status(500).json({ 
        error: 'Erro ao remover imagem',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // Temporary image serving endpoint for PixelCut API
  app.get('/api/temp-image/:imageId', async (req: Request, res: Response) => {
    try {
      const { imageId } = req.params;
      
      const tempImage = await storage.getGeneratedImageById(imageId);
      if (!tempImage) {
        return res.status(404).json({ error: 'Image not found' });
      }
      
      // Extract base64 data from data URL
      const base64Match = tempImage.imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!base64Match) {
        return res.status(400).json({ error: 'Invalid image format' });
      }
      
      const mimeType = base64Match[1];
      const base64Data = base64Match[2];
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      res.set({
        'Content-Type': mimeType,
        'Content-Length': imageBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600', // 1 hour cache
        'Access-Control-Allow-Origin': '*'
      });
      
      res.send(imageBuffer);
    } catch (error) {
      console.error('Error serving temp image:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Background Removal API Routes
  app.post('/api/background-removal/upload', requireAuth, async (req, res) => {
    const startTime = Date.now();
    
    try {
      console.log('🔍 [BACKGROUND_REMOVAL_UPLOAD] Starting image upload process');
      
      const { imageData, fileName, fileSize } = req.body;
      
      if (!imageData || !fileName) {
        return res.status(400).json({ 
          error: 'Dados da imagem e nome do arquivo são obrigatórios' 
        });
      }

      // Validate file size (25MB max)
      if (fileSize > 25 * 1024 * 1024) {
        return res.status(400).json({ 
          error: 'Tamanho da imagem excede o limite de 25MB' 
        });
      }

      // Store image in generatedImages table temporarily
      const imageRecord = await storage.createGeneratedImage({
        agentId: 'background-removal-temp',
        sessionId: req.sessionId || 'temp-session',
        model: 'pixelcut-upload',
        prompt: `Uploaded image for background removal: ${fileName}`,
        imageUrl: imageData, // Store base64 data temporarily
        size: 'original',
        quality: 'original',
        format: 'original',
        cost: '0',
        metadata: { 
          fileName, 
          fileSize, 
          uploadedAt: new Date().toISOString(),
          isTemporary: true,
          operation: 'background-removal'
        }
      });

      console.log(`✅ [BACKGROUND_REMOVAL_UPLOAD] Image stored temporarily with ID: ${imageRecord.id}`);
      
      res.json({
        success: true,
        imageId: imageRecord.id,
        message: 'Imagem carregada com sucesso',
        duration: Date.now() - startTime
      });

    } catch (error) {
      console.error('❌ [BACKGROUND_REMOVAL_UPLOAD] Error:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  app.post('/api/background-removal/process', requireAuth, async (req: Request, res: Response) => {
    try {
      console.log('🔍 [BACKGROUND_REMOVAL] Starting background removal process');
      
      const { imageId } = req.body;
      
      if (!imageId) {
        return res.status(400).json({ 
          error: 'ID da imagem é obrigatório',
          code: 'MISSING_IMAGE_ID'
        });
      }

      console.log('🔍 [BACKGROUND_REMOVAL] Processing image ID:', imageId);

      // Retrieve the uploaded image from database
      const tempImage = await storage.getGeneratedImageById(imageId);
      
      if (!tempImage) {
        return res.status(404).json({ 
          error: 'Imagem não encontrada ou expirada',
          code: 'IMAGE_NOT_FOUND'
        });
      }

      // Check if API key is available
      if (!process.env.PIXELCUT_API_KEY) {
        console.log('❌ [PIXELCUT_API] No API key configured');
        return res.status(400).json({
          error: 'Erro no processamento, aguarde 24 horas e tente novamente. Pedimos desculpas.',
          code: 'API_NOT_CONFIGURED'
        });
      }

      console.log('🔍 [PIXELCUT_API] Sending background removal request with:', {
        imageSize: tempImage.imageUrl.length,
        fileName: tempImage.metadata?.fileName || 'unknown',
        hasApiKey: !!process.env.PIXELCUT_API_KEY
      });

      const startTime = Date.now();
      let processedImageUrl: string;

      try {
        // Get the base64 data from imageUrl (which contains the full data URL)
        const base64Data = tempImage.imageUrl.replace(/^data:image\/[a-z]+;base64,/, '');
        
        // Extract MIME type from data URL
        const mimeMatch = tempImage.imageUrl.match(/^data:([^;]+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
        
        // Create a publicly accessible temporary URL
        const publicImageUrl = `${(req as any).protocol}://${(req as any).get('host')}/api/temp-image/${tempImage.id}`;
        
        console.log('🔍 [PIXELCUT_API] Using public URL for background removal:', publicImageUrl);
        
        // Test DNS resolution first
        console.log('🔍 [PIXELCUT_API] Testing DNS resolution for api.pixelcut.ai...');
        
        // Use the correct PixelCut API endpoint and format
        console.log('🔍 [PIXELCUT_API] Using official PixelCut API endpoint');
        
        const response = await fetch('https://api.developer.pixelcut.ai/v1/remove-background', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-API-KEY': process.env.PIXELCUT_API_KEY || ''
          },
          body: JSON.stringify({
            image_url: publicImageUrl,
            format: "png"
          })
        });

        console.log('🔍 [PIXELCUT_API] Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.log('❌ [PIXELCUT_API] Error:', response.status, '-', JSON.stringify(errorData));
          
          if (response.status === 403 && errorData.error_code === 'insufficient_api_credits') {
            throw new Error('Créditos da API PixelCut esgotados. Entre em contato com o administrador para recarregar os créditos.');
          }
          
          // For "Unsupported format" errors, provide a helpful message to the user
          if (errorData.error_code === 'invalid_parameter' && errorData.error === 'Unsupported format') {
            throw new Error('Formato de imagem não suportado pela API PixelCut. Tente com uma imagem JPG ou PNG de alta qualidade.');
          }
          
          throw new Error(`Erro da API PixelCut: ${errorData.error || 'Erro desconhecido'}`);
        }

        const result = await response.json();
        console.log('🔍 [PIXELCUT_API] Response structure:', JSON.stringify(result, null, 2));
        
        // Handle different response formats from PixelCut API
        let resultUrl = null;
        
        if (result.result_url) {
          // Direct format: {"result_url": "..."}
          resultUrl = result.result_url;
        } else if (result.data && result.data.result_url) {
          // Nested format: {"data": {"result_url": "..."}}
          resultUrl = result.data.result_url;
        } else {
          console.log('❌ [PIXELCUT_API] Unexpected response format:', result);
          throw new Error('Resposta inválida da API PixelCut - formato não reconhecido');
        }

        processedImageUrl = resultUrl;
        console.log('✅ [PIXELCUT_API] Background removal successful');

      } catch (apiError) {
        console.log('❌ [BACKGROUND_REMOVAL] Error:', apiError);
        const processingTime = Date.now() - startTime;
        const user = (req as any).user;
        
        // Save error log to database
        try {
          await storage.createAiImgGenerationLog({
            userId: user.id,
            provider: 'pixelcut',
            model: 'bg-remover-v1',
            feature: 'background_removal',
            originalImageName: tempImage.metadata?.fileName || 'unknown.png',
            originalImageSize: {
              fileSize: tempImage.metadata?.fileSize || 0,
              width: null,
              height: null
            },
            generatedImageUrl: null,
            generatedImageSize: null,
            prompt: null,
            scale: null,
            quality: 'high',
            apiResponse: {
              error: apiError instanceof Error ? apiError.message : 'Unknown error',
              status: 'failed'
            },
            status: 'failed',
            errorMessage: apiError instanceof Error ? apiError.message : 'Unknown error',
            cost: '0.00', // No cost for failed requests
            duration: processingTime,
            requestId: `bg_${Date.now()}`,
            sessionId: tempImage.sessionId,
            userAgent: (req as any).get('user-agent'),
            ipAddress: (req as any).ip
          });
          console.log('✅ [DB] Background removal error log saved successfully');
        } catch (dbError) {
          console.error('❌ [DB] Error saving background removal error log:', dbError);
        }
        
        // Check if it's a DNS/network issue
        if (apiError instanceof Error && (
          apiError.message.includes('ENOTFOUND') || 
          apiError.message.includes('fetch failed') ||
          apiError.cause?.code === 'ENOTFOUND'
        )) {
          console.log('🔍 [BACKGROUND_REMOVAL] DNS/Network issue detected with PixelCut API');
          return res.status(503).json({
            error: 'Serviço temporariamente indisponível. A API PixelCut não está acessível no momento. Tente novamente em alguns minutos.',
            code: 'SERVICE_UNAVAILABLE',
            details: 'DNS resolution failed for api.pixelcut.ai'
          });
        }
        
        return res.status(400).json({
          error: 'Erro no processamento, aguarde 24 horas e tente novamente. Pedimos desculpas.',
          code: 'PROCESSING_ERROR'
        });
      }

      const processingTime = Date.now() - startTime;
      const user = (req as any).user;

      // Save success log to database (without storing large data)
      try {
        await storage.createAiImgGenerationLog({
          userId: user.id,
          provider: 'pixelcut',
          model: 'bg-remover-v1',
          feature: 'background_removal',
          originalImageName: tempImage.metadata?.fileName || 'unknown.png',
          originalImageSize: {
            fileSize: tempImage.metadata?.fileSize || 0,
            width: null,
            height: null
          },
          generatedImageUrl: processedImageUrl.startsWith('data:') ? '[Base64 Image - Not Stored]' : processedImageUrl,
          generatedImageSize: null,
          prompt: null,
          scale: null,
          quality: 'high',
          apiResponse: {
            has_result: true,
            status: 'success',
            url_type: processedImageUrl.startsWith('data:') ? 'base64' : 'external'
          },
          status: 'success',
          errorMessage: null,
          cost: '0.02', // PixelCut typical cost
          duration: processingTime,
          requestId: `bg_${Date.now()}`,
          sessionId: tempImage.sessionId,
          userAgent: (req as any).get('user-agent'),
          ipAddress: (req as any).ip
        });
        console.log('✅ [DB] Background removal log saved successfully');
      } catch (dbError) {
        console.error('❌ [DB] Error saving background removal log:', dbError);
        // Continue with response even if logging fails
      }

      // Keep temporary image for potential reprocessing
      // Only delete when user explicitly removes/changes image
      // try {
      //   await storage.deleteGeneratedImage(imageId);
      // } catch (cleanupError) {
      //   console.log('⚠️ [BACKGROUND_REMOVAL] Failed to cleanup temporary image:', cleanupError);
      // }

      const originalImageUrl = tempImage.imageUrl;

      res.json({
        success: true,
        originalImageUrl,
        processedImageUrl,
        duration: processingTime,
        cost: 0.02,
        message: 'Background removido com sucesso!'
      });

    } catch (error) {
      console.error('❌ [BACKGROUND_REMOVAL] Error:', error);
      res.status(500).json({ 
        error: 'Erro no processamento, aguarde 24 horas e tente novamente. Pedimos desculpas.',
        code: 'INTERNAL_ERROR'
      });
    }
  });



  // ===============================
  // INFOGRAPHIC GENERATOR ROUTES
  // ===============================

  // Etapa 1: Otimização de texto com Claude Sonnet
  app.post('/api/agents/infographic-generator/step1', requireAuth, async (req: Request, res: Response) => {
    const startTime = Date.now();
    
    try {
      const user = (req as any).user;
      const { nomeProduto, descricaoLonga, categoria, publicoAlvo } = req.body;

      console.log('📊 [INFOGRAPHIC_STEP1] Starting text optimization...');
      console.log('📊 [INFOGRAPHIC_STEP1] Product:', nomeProduto?.substring(0, 50) + '...');
      console.log('📊 [INFOGRAPHIC_STEP1] Description length:', descricaoLonga?.length);

      // Validation
      if (!nomeProduto?.trim() || !descricaoLonga?.trim()) {
        return res.status(400).json({ 
          error: 'Nome do produto e descrição são obrigatórios' 
        });
      }

      if (descricaoLonga.length > 2000) {
        return res.status(400).json({ 
          error: 'Descrição deve ter no máximo 2000 caracteres' 
        });
      }

      // Get system prompt from database
      const systemPromptResult = await db.query.agentPrompts.findFirst({
        where: and(
          eq(agentPrompts.agentId, 'agent-infographic-generator'),
          eq(agentPrompts.promptType, 'system'),
          eq(agentPrompts.isActive, true)
        )
      });

      if (!systemPromptResult) {
        throw new Error('System prompt not found for infographic generator');
      }

      // Replace variables in prompt
      const systemPrompt = systemPromptResult.content
        .replace(/\{\{NOME_PRODUTO\}\}/g, nomeProduto)
        .replace(/\{\{DESCRICAO_LONGA\}\}/g, descricaoLonga)
        .replace(/\{\{CATEGORIA\}\}/g, categoria || 'Não especificada')
        .replace(/\{\{PUBLICO_ALVO\}\}/g, publicoAlvo || 'Não especificado');

      console.log('📊 [INFOGRAPHIC_STEP1] System prompt length:', systemPrompt.length);

      // Call Anthropic Claude Sonnet
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        temperature: 1.0,
        messages: [
          {
            role: 'user',
            content: systemPrompt
          }
        ]
      });

      const endTime = Date.now();
      const processingTime = Math.round((endTime - startTime) / 1000);

      // Parse Claude's response to extract the bracketed content
      const responseText = response.content[0]?.text || '';
      console.log('📊 [INFOGRAPHIC_STEP1] Claude response length:', responseText.length);

      // Extract content between brackets
      const extractBracketContent = (text: string, tag: string) => {
        const regex = new RegExp(`\\[${tag}\\]([\\s\\S]*?)(?=\\[|$)`, 'i');
        const match = text.match(regex);
        return match ? match[1].trim() : '';
      };

      const optimizedContent = {
        nome: extractBracketContent(responseText, 'NOME') || nomeProduto,
        beneficios: extractBracketContent(responseText, 'BENEFICIOS'),
        especificacoes: extractBracketContent(responseText, 'ESPECIFICACOES'),
        cta: extractBracketContent(responseText, 'CTA'),
        icons: extractBracketContent(responseText, 'ICONS')
      };

      // Calculate cost (Claude Sonnet pricing: $3.00/$15.00 per 1M tokens)
      const inputTokens = response.usage.input_tokens || 0;
      const outputTokens = response.usage.output_tokens || 0;
      const cost = (inputTokens * 0.000003) + (outputTokens * 0.000015);

      console.log('💰 [INFOGRAPHIC_STEP1] Cost calculation:', {
        inputTokens,
        outputTokens,
        cost: cost.toFixed(6)
      });

      // Save to ai_generation_logs with AUTOMATIC CREDIT DEDUCTION
      const { LoggingService } = await import('./services/loggingService');
      await LoggingService.saveAiLog(
        user.id,
        'agents.infographic_editor', // Feature code para dedução de créditos
        systemPrompt,
        responseText,
        'anthropic',
        'claude-sonnet-4-20250514',
        inputTokens,
        outputTokens,
        inputTokens + outputTokens,
        cost,
        0, // creditsUsed = 0 para dedução automática
        processingTime * 1000
      );

      console.log('✅ [INFOGRAPHIC_STEP1] Text optimization completed:', {
        processingTime: `${processingTime}s`,
        cost: `$${cost.toFixed(6)}`,
        usage: response.usage
      });

      res.json({
        success: true,
        optimizedContent,
        processingTime,
        cost,
        usage: response.usage
      });

    } catch (error: any) {
      console.error('❌ [INFOGRAPHIC_STEP1] Error:', error);
      
      // Save error log
      try {
        const errorDuration = Date.now() - startTime;
        const user = (req as any).user;
        await db.insert(aiGenerationLogs).values({
          userId: user.id,
          provider: 'anthropic',
          model: 'claude-sonnet-4-20250514',
          prompt: 'Erro na otimização de texto do infográfico',
          response: `Erro: ${error.message}`,
          promptCharacters: 0,
          responseCharacters: error.message?.length || 0,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          cost: '0.00',
          duration: errorDuration,
          feature: 'infographic-generator-step1',
          createdAt: new Date()
        });
      } catch (logError) {
        console.error('❌ [INFOGRAPHIC_STEP1] Error saving error log:', logError);
      }
      
      res.status(500).json({ 
        error: 'Erro na otimização de texto',
        details: error.message
      });
    }
  });

  // Etapa 2: Geração de imagem com GPT-Image-1
  app.post('/api/agents/infographic-generator/step2', requireAuth, async (req: Request, res: Response) => {
    const startTime = Date.now();
    
    try {
      const user = (req as any).user;
      const { 
        nomeProduto, 
        optimizedContent, 
        categoria,
        publicoAlvo,
        corPrimaria = '#3B82F6', 
        corSecundaria = '#10B981',
        quantidadeImagens = 1,
        qualidade = 'high',
        imagemReferencia
      } = req.body;

      console.log('🎨 [INFOGRAPHIC_STEP2] Starting image generation...');
      console.log('🎨 [INFOGRAPHIC_STEP2] Product:', nomeProduto?.substring(0, 50) + '...');
      console.log('🎨 [INFOGRAPHIC_STEP2] Quantity:', quantidadeImagens, 'Quality:', qualidade);

      // Validation
      if (!nomeProduto?.trim() || !optimizedContent) {
        return res.status(400).json({ 
          error: 'Nome do produto e conteúdo otimizado são obrigatórios' 
        });
      }

      // Get user prompt from database
      const userPromptResult = await db.query.agentPrompts.findFirst({
        where: and(
          eq(agentPrompts.agentId, 'agent-infographic-generator'),
          eq(agentPrompts.promptType, 'user'),
          eq(agentPrompts.isActive, true)
        )
      });

      if (!userPromptResult) {
        throw new Error('User prompt not found for infographic generator');
      }

      // Parse optimizedContent if it's a string (from Claude response)
      let parsedContent;
      if (typeof optimizedContent === 'string') {
        try {
          parsedContent = JSON.parse(optimizedContent);
        } catch {
          // If not JSON, treat as raw text
          parsedContent = { texto_completo: optimizedContent };
        }
      } else {
        parsedContent = optimizedContent;
      }

      // Replace variables in prompt with optimized content from Claude
      const userPrompt = userPromptResult.content
        .replace(/\{\{NOME_PRODUTO\}\}/g, nomeProduto)
        .replace(/\{\{NOME_OTIMIZADO\}\}/g, parsedContent.titulo || parsedContent.nome || nomeProduto)
        .replace(/\{\{BENEFICIOS_OTIMIZADOS\}\}/g, parsedContent.beneficios || '')
        .replace(/\{\{ESPECIFICACOES_OTIMIZADAS\}\}/g, parsedContent.especificacoes || '')
        .replace(/\{\{CTA_OTIMIZADO\}\}/g, parsedContent.cta || parsedContent.call_to_action || '')
        .replace(/\{\{ICONS_OTIMIZADOS\}\}/g, parsedContent.icons || parsedContent.icones || '')
        .replace(/\{\{TEXTO_OTIMIZADO_COMPLETO\}\}/g, parsedContent.texto_completo || JSON.stringify(parsedContent))
        .replace(/\{\{CATEGORIA\}\}/g, categoria || 'Não especificada')
        .replace(/\{\{PUBLICO_ALVO\}\}/g, publicoAlvo || 'Não especificado')
        .replace(/\{\{COR_PRIMARIA\}\}/g, corPrimaria)
        .replace(/\{\{COR_SECUNDARIA\}\}/g, corSecundaria);

      console.log('🎨 [INFOGRAPHIC_STEP2] User prompt length:', userPrompt.length);
      console.log('🎨 [INFOGRAPHIC_STEP2] Optimized content received:', {
        type: typeof optimizedContent,
        keys: parsedContent ? Object.keys(parsedContent) : 'none',
        titulo: parsedContent?.titulo?.substring(0, 100) + '...',
        beneficios: parsedContent?.beneficios?.substring(0, 100) + '...'
      });
      console.log('🎨 [INFOGRAPHIC_STEP2] Final prompt preview:', userPrompt.substring(0, 300) + '...');

      // VALIDATE: Image is MANDATORY - never generate without reference
      if (!imagemReferencia) {
        throw new Error('Imagem de referência é OBRIGATÓRIA para gerar infográficos. Upload uma imagem antes de continuar.');
      }

      // Call OpenAI GPT-Image-1 for image editing with reference
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      let response;
      try {
        // ALWAYS use GPT-Image-1 with images.edit endpoint - NEVER DALL-E 3
        console.log('🎨 [INFOGRAPHIC_STEP2] Using GPT-Image-1 with reference image (MANDATORY)');
        
        // Convert base64 to buffer for GPT-Image-1
        const imageBuffer = Buffer.from(imagemReferencia, 'base64');
        
        // Create File object using OpenAI.toFile() with proper mimetype
        const imageFile = await OpenAI.toFile(imageBuffer, 'reference.png', {
          type: 'image/png'
        });
        
        response = await openai.images.edit({
          model: 'gpt-image-1',
          image: imageFile,
          prompt: userPrompt,
          n: quantidadeImagens,
          size: '1024x1024'
        });
      } catch (apiError: any) {
        console.log('🎨 [INFOGRAPHIC_STEP2] OpenAI API Error:', apiError.message);
        
        // Check if it's a rate limiting error
        if (apiError.message?.includes('rate limited') || apiError.status === 429) {
          throw new Error('OpenAI está com limite de rate. Aguarde alguns minutos e tente novamente.');
        }
        
        // Check if it's an authentication error
        if (apiError.status === 401) {
          throw new Error('Erro de autenticação da OpenAI. Verifique a configuração da API key.');
        }
        
        // Generic OpenAI error
        throw new Error(`Erro da OpenAI: ${apiError.message || 'Erro desconhecido'}`);
      }

      const endTime = Date.now();
      const processingTime = Math.round((endTime - startTime) / 1000);

      // Calculate cost for GPT-Image-1 image editing (ALWAYS with reference)
      const realCost = 0.20 * quantidadeImagens; // $0.20 per GPT-Image-1 image edit

      console.log('💰 [INFOGRAPHIC_STEP2] Cost calculation details:', {
        method: 'gpt_image_1_editing',
        model: 'gpt-image-1',
        quantity: quantidadeImagens,
        totalCost: realCost.toFixed(6),
        note: 'SEMPRE com imagem de referência obrigatória'
      });

      // Extract generated images from GPT-Image-1
      if (!response.data || response.data.length === 0) {
        throw new Error('No image data received from GPT-Image-1');
      }
      
      const images = await Promise.all(response.data.map(async (imageData, index) => {
        if (imageData.url) {
          // Convert URL to base64
          const imageResponse = await fetch(imageData.url);
          const arrayBuffer = await imageResponse.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          return `data:image/jpeg;base64,${base64}`;
        } else if (imageData.b64_json) {
          return `data:image/jpeg;base64,${imageData.b64_json}`;
        } else {
          throw new Error(`No image data received for image ${index + 1}`);
        }
      }));

      console.log('✅ [INFOGRAPHIC_STEP2] GPT-Image-1 image generation completed:', {
        processingTime: `${processingTime}s`,
        cost: `$${realCost.toFixed(6)}`,
        imagesGenerated: images.length,
        usage: response.usage
      });

      // Save to ai_generation_logs with AUTOMATIC CREDIT DEDUCTION  
      const { LoggingService } = await import('./services/loggingService');
      await LoggingService.saveAiLog(
        user.id,
        'agents.advanced_infographic', // Feature code para dedução de créditos
        userPrompt,
        `${images.length} infográficos gerados com sucesso via GPT-Image-1`,
        'openai',
        'gpt-image-1',
        0, // Image generation doesn't provide standard token usage
        0, // Image generation doesn't provide standard token usage
        response.usage?.total_tokens || 0,
        realCost,
        0, // creditsUsed = 0 para dedução automática
        processingTime * 1000
      );

      res.json({
        success: true,
        images,
        processingTime,
        cost: realCost,
        usage: response.usage
      });

    } catch (error: any) {
      console.error('❌ [INFOGRAPHIC_STEP2] Error:', error);
      
      // Save error log
      try {
        const errorDuration = Date.now() - startTime;
        const user = (req as any).user;
        await db.insert(aiGenerationLogs).values({
          userId: user.id,
          provider: 'openai',
          model: 'gpt-image-1',
          prompt: 'Erro na geração de imagem do infográfico',
          response: `Erro: ${error.message}`,
          promptCharacters: 0,
          responseCharacters: error.message?.length || 0,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          cost: '0.00',
          duration: errorDuration,
          feature: 'infographic-generator-step2',
          createdAt: new Date()
        });
      } catch (logError) {
        console.error('❌ [INFOGRAPHIC_STEP2] Error saving error log:', logError);
      }
      
      res.status(500).json({ 
        error: 'Erro na geração de imagem',
        details: error.message
      });
    }
  });

  // ===============================
  // ADVANCED INFOGRAPHIC SYSTEM ROUTES
  // ===============================

  // Import the new infographic service
  const { infographicService } = await import('./services/infographicService');

  // STEP 1: Analyze product and generate concepts
  app.post('/api/infographics/analyze', requireAuth, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const productData = req.body;

      console.log('📊 [INFOGRAPHIC_ANALYZE] Starting product analysis...');
      
      const result = await infographicService.analyzeProduct(productData, user.id);
      
      console.log('✅ [INFOGRAPHIC_ANALYZE] Analysis completed:', {
        analysisId: result.analysisId,
        conceptsGenerated: result.concepts.length,
        recommendedConcept: result.recommendedConcept
      });

      res.json(result);
    } catch (error: any) {
      console.error('❌ [INFOGRAPHIC_ANALYZE] Error:', error);
      res.status(500).json({ 
        error: 'Falha na análise do produto',
        details: error.message
      });
    }
  });

  // STEP 2: Generate optimized prompt from concept and image
  const infographicUpload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'), false);
      }
    }
  });

  app.post('/api/infographics/generate-prompt', requireAuth, infographicUpload.single('image'), async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { analysisId, conceptId } = req.body;
      const imageFile = req.file;

      console.log('🎨 [INFOGRAPHIC_PROMPT] Generating optimized prompt...');

      if (!imageFile) {
        return res.status(400).json({ 
          error: 'Imagem de referência é obrigatória' 
        });
      }

      const result = await infographicService.generatePrompt(
        analysisId, 
        conceptId, 
        imageFile, 
        user.id
      );

      console.log('✅ [INFOGRAPHIC_PROMPT] Prompt generated successfully');

      res.json(result);
    } catch (error: any) {
      console.error('❌ [INFOGRAPHIC_PROMPT] Error:', error);
      res.status(500).json({ 
        error: 'Falha na geração do prompt',
        details: error.message
      });
    }
  });

  // STEP 3: Generate final infographic
  app.post('/api/infographics/generate', requireAuth, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { generationId } = req.body;

      console.log('🖼️ [INFOGRAPHIC_GENERATE] Generating final infographic...');

      const result = await infographicService.generateInfographic(generationId, user.id);

      console.log('✅ [INFOGRAPHIC_GENERATE] Infographic generated successfully');

      res.json(result);
    } catch (error: any) {
      console.error('❌ [INFOGRAPHIC_GENERATE] Error:', error);
      res.status(500).json({ 
        error: 'Falha na geração do infográfico',
        details: error.message
      });
    }
  });

  // Get generation status
  app.get('/api/infographics/:id/status', requireAuth, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const status = await infographicService.getGenerationStatus(id, user.id);

      res.json(status);
    } catch (error: any) {
      console.error('❌ [INFOGRAPHIC_STATUS] Error:', error);
      res.status(500).json({ 
        error: 'Falha ao buscar status da geração',
        details: error.message
      });
    }
  });

  // Get user infographics history
  app.get('/api/infographics/history', requireAuth, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      const history = await infographicService.getUserInfographics(user.id);

      res.json(history);
    } catch (error: any) {
      console.error('❌ [INFOGRAPHIC_HISTORY] Error:', error);
      res.status(500).json({ 
        error: 'Falha ao buscar histórico de infográficos',
        details: error.message
      });
    }
  });

  // Temporary dashboard test route without auth
  app.get('/api/test/dashboard', async (req: Request, res: Response) => {
    const testData = {
      user: {
        name: 'Guilherme Vasques',
        plan: {
          name: 'Sem Plano',
          level: 'basic',
          credits: 0,
          nextBilling: 'N/A',
          status: 'cancelled'
        },
        creditBalance: 250,
        totalSpent: 0,
        savings: 0
      },
      usage: {
        thisMonth: 0,
        lastMonth: 0,
        topFeatures: [],
        projection: 0,
        dailyUsage: []
      },
      activity: [],
      recommendations: [
        {
          id: 'start-subscription',
          title: 'Comece com um plano',
          description: 'Escolha um plano para ter acesso a mais créditos e funcionalidades.',
          type: 'upgrade',
          priority: 'high',
          actionText: 'Ver Planos',
          actionUrl: '/minha-area/assinaturas?tab=plans'
        },
        {
          id: 'try-agents',
          title: 'Experimente nossos agentes IA',
          description: 'Use nossos agentes especializados para otimizar suas vendas na Amazon.',
          type: 'feature',
          priority: 'medium',
          actionText: 'Ver Agentes',
          actionUrl: '/agents'
        }
      ],
      stats: {
        totalGenerations: 0,
        averageSessionTime: 0,
        featuresUsed: 0,
        successRate: 100
      }
    };
    res.json(testData);
  });

  // Import and register optimized supplier routes
  try {
    const { optimizedSupplierRoutes } = await import('./routes/optimizedSupplierRoutes');
    app.use('/api/suppliers/optimized', optimizedSupplierRoutes);
    console.log('✅ Optimized supplier routes registered successfully');
  } catch (error) {
    console.error('❌ Error registering optimized supplier routes:', error);
  }

  // Register Picsart integration routes
  app.use('/api/picsart', picsartRoutes);
  console.log('✅ [PICSART] Routes registered successfully');
  
  // PHASE 3: Product Channels Management - New Parallel System
  try {
    const { productChannelsRouter } = await import('./routes/productChannels');
    app.use('/api/products', productChannelsRouter);
    console.log('✅ [PRODUCT_CHANNELS] Routes registered successfully');
  } catch (error) {
    console.error('❌ Error registering product channels routes:', error);
  }

  // Product Supplier Management Routes
  try {
    const { productSupplierRoutes } = await import('./routes/productSupplierRoutes');
    app.use('/api/products', productSupplierRoutes);
    console.log('✅ [PRODUCT_SUPPLIERS] Routes registered successfully');
    console.log('✅ [PRODUCT_SUPPLIERS] Available routes:');
    console.log('   - GET /:productId/suppliers');
    console.log('   - POST /:productId/suppliers');
    console.log('   - PUT /:productId/suppliers/:supplierId');
    console.log('   - DELETE /:productId/suppliers/:supplierId');
  } catch (error) {
    console.error('❌ Error registering product supplier routes:', error);
    console.error('❌ [PRODUCT_SUPPLIERS] Import failed:', error);
  }

  // Supplier Products Management Routes
  try {
    app.use('/api/suppliers', supplierProductsRoutes);
    console.log('✅ [SUPPLIER_PRODUCTS] Routes registered successfully');
    console.log('✅ [SUPPLIER_PRODUCTS] Available routes:');
    console.log('   - GET /:supplierId/products');
    console.log('   - POST /:supplierId/products');
    console.log('   - PUT /:supplierId/products/:productId');
    console.log('   - DELETE /:supplierId/products/:productId');
    console.log('   - POST /:supplierId/products/import');
    console.log('   - POST /:supplierId/products/sync');
  } catch (error) {
    console.error('❌ Error registering supplier products routes:', error);
  }

  // Performance Monitoring Routes
  try {
    app.use('/api/performance', performanceRoutes);
    app.use('/api/international-contracts', internationalContractsRoutes);
    app.use('/api/international-suppliers', internationalSupplierBankingRoutes);
    app.use('/api/imported-products', importedProductsRoutes);
    app.use('/api/imported-products', importedProductSuppliersRoutes);
    app.use('/api/product-packages', productPackagesRoutes);
    app.use('/api/product-images', productImagesRoutes);
    app.use('/api/financas360', financas360Router);
    app.use('/api/financas360', financas360OperationsRouter);
    app.use('/api/user-companies', userCompaniesRoutes);
    console.log('✅ [PERFORMANCE] Performance monitoring routes registered');
    console.log('✅ [IMPORTED_PRODUCT_SUPPLIERS] Routes registered successfully');
    console.log('✅ [PRODUCT_PACKAGES] Product packages routes registered successfully');
    console.log('✅ [PRODUCT_IMAGES] Product images routes registered successfully');
    console.log('✅ [FINANCAS360] All Finanças360 routes registered successfully');
  } catch (error) {
    console.error('❌ [PERFORMANCE] Performance routes failed:', error);
  }

  // International Supplier Detail API Routes
  // Missing routes that the frontend is trying to call
  app.get('/api/supplier-contacts', requireAuth, async (req: any, res: any) => {
    try {
      const supplierId = req.query.supplierId;
      if (!supplierId) {
        return res.status(400).json({ error: 'supplierId is required' });
      }
      
      // Return empty array for now - this will be implemented later
      res.json({ success: true, data: [] });
    } catch (error) {
      console.error('Error fetching supplier contacts:', error);
      res.status(500).json({ error: 'Failed to fetch contacts' });
    }
  });

  app.get('/api/international-contracts', requireAuth, async (req: any, res: any) => {
    try {
      const supplierId = req.query.supplierId;
      if (!supplierId) {
        return res.status(400).json({ error: 'supplierId is required' });
      }
      
      // Return empty array for now - this will be implemented later
      res.json({ success: true, data: [] });
    } catch (error) {
      console.error('Error fetching international contracts:', error);
      res.status(500).json({ error: 'Failed to fetch contracts' });
    }
  });

  app.get('/api/supplier-conversations', requireAuth, async (req: any, res: any) => {
    try {
      const supplierId = req.query.supplierId;
      if (!supplierId) {
        return res.status(400).json({ error: 'supplierId is required' });
      }
      
      // Return empty array for now - this will be implemented later
      res.json({ success: true, data: [] });
    } catch (error) {
      console.error('Error fetching supplier conversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  });

  app.get('/api/supplier-documents', requireAuth, async (req: any, res: any) => {
    try {
      const supplierId = req.query.supplierId;
      if (!supplierId) {
        return res.status(400).json({ error: 'supplierId is required' });
      }
      
      // Return empty array for now - this will be implemented later
      res.json({ success: true, data: [] });
    } catch (error) {
      console.error('Error fetching supplier documents:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  });

  console.log('✅ [INTERNATIONAL_SUPPLIERS] Missing detail API routes added');

  // Object Storage - Serve uploaded files (like company logos)
  // Note: No authentication required for serving images (they're accessed via <img> tags)
  app.get('/objects/*', async (req: any, res: any) => {
    try {
      const { ObjectStorageService, ObjectNotFoundError } = await import('./objectStorage');
      const objectStorageService = new ObjectStorageService();
      
      const objectPath = req.path; // This will be /objects/uploads/uuid
      console.log('🔍 [OBJECT_STORAGE] Serving object:', objectPath);
      console.log('🔍 [OBJECT_STORAGE] Private dir:', process.env.PRIVATE_OBJECT_DIR);
      
      const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
      console.log('🔍 [OBJECT_STORAGE] Object file found, downloading...');
      
      await objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error('❌ [OBJECT_STORAGE] Error serving object:', error);
      console.error('❌ [OBJECT_STORAGE] Error details:', {
        path: req.path,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      if (error instanceof ObjectNotFoundError) {
        res.status(404).json({ error: 'Object not found' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  console.log('✅ [OBJECT_STORAGE] Object serving route registered');

  return httpServer;
}