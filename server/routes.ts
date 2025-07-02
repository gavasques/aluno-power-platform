import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import bcryptjs from "bcryptjs";
import { storage } from "./storage";
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
  insertYoutubeVideoSchema,
  insertNewsSchema,
  insertAiGenerationLogSchema,
  aiGenerationLogs,
  insertAiImgGenerationLogSchema,
  aiImgGenerationLogs,
  insertUpdateSchema,
  insertGeneratedImageSchema,
  insertWebhookConfigSchema,
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
import { youtubeService } from "./services/youtubeService";
import { openaiService } from "./services/openaiService";
import { aiProviderService } from "./services/aiProviderService";
import { SessionService } from "./services/sessionService";
import { amazonListingService as amazonService } from "./services/amazonListingService";
import { requireAuth } from "./security";
import { db } from './db';
import { eq, desc, like, and, isNull, or, not, sql, asc } from 'drizzle-orm';
import { materials, partners, tools, toolTypes, suppliers, news, updates, youtubeVideos, agents, agentPrompts, agentUsage, agentGenerations, users, products, generatedImages, departments, amazonListingSessions, insertAmazonListingSessionSchema, userGroups, userGroupMembers, toolUsageLogs, insertToolUsageLogSchema } from '@shared/schema';

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
  // Suppliers
  app.get('/api/suppliers', async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch suppliers' });
    }
  });

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

  // Materials
  app.get('/api/materials', async (req, res) => {
    try {
      const materials = await storage.getMaterials();
      res.json(materials);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch materials' });
    }
  });

  app.get('/api/materials/:id', async (req, res) => {
    try {
      const material = await storage.getMaterial(parseInt(req.params.id));
      if (!material) {
        return res.status(404).json({ error: 'Material not found' });
      }
      res.json(material);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch material' });
    }
  });

  app.post('/api/materials', async (req, res) => {
    try {
      const validatedData = insertMaterialSchema.parse(req.body);
      const material = await storage.createMaterial(validatedData);
      res.status(201).json(material);
    } catch (error) {
      res.status(400).json({ error: 'Invalid material data' });
    }
  });

  app.put('/api/materials/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertMaterialSchema.partial().parse(req.body);
      const material = await storage.updateMaterial(id, validatedData);
      res.json(material);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update material' });
    }
  });

  app.delete('/api/materials/:id', async (req, res) => {
    try {
      await storage.deleteMaterial(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete material' });
    }
  });

  app.get('/api/materials/search/:query', async (req, res) => {
    try {
      const materials = await storage.searchMaterials(req.params.query);
      res.json(materials);
    } catch (error) {
      res.status(500).json({ error: 'Failed to search materials' });
    }
  });

  app.post('/api/materials/:id/view', async (req, res) => {
    try {
      await storage.incrementMaterialViewCount(parseInt(req.params.id));
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to increment view count' });
    }
  });

  app.post('/api/materials/:id/download', async (req, res) => {
    try {
      await storage.incrementMaterialDownloadCount(parseInt(req.params.id));
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to increment download count' });
    }
  });

  // Material Categories
  app.get('/api/material-categories', async (req, res) => {
    try {
      const categories = await storage.getMaterialCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch material categories' });
    }
  });

  app.post('/api/material-categories', async (req, res) => {
    try {
      const category = await storage.createMaterialCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create material category' });
    }
  });

  app.put('/api/material-categories/:id', async (req, res) => {
    try {
      const category = await storage.updateMaterialCategory(parseInt(req.params.id), req.body);
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update material category' });
    }
  });

  app.delete('/api/material-categories/:id', async (req, res) => {
    try {
      await storage.deleteMaterialCategory(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete material category' });
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
  app.get('/api/products', async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await storage.getProduct(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  });

  app.post('/api/products', async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: 'Invalid product data' });
    }
  });

  app.put('/api/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, validatedData);
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update product' });
    }
  });

  app.delete('/api/products/:id', async (req, res) => {
    try {
      await storage.deleteProduct(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  app.get('/api/products/search/:query', async (req, res) => {
    try {
      const products = await storage.searchProducts(req.params.query);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'Failed to search products' });
    }
  });

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

  // Material Types
  app.get('/api/material-types', async (req, res) => {
    try {
      const materialTypes = await storage.getMaterialTypes();
      res.json(materialTypes);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch material types' });
    }
  });

  app.get('/api/material-types/:id', async (req, res) => {
    try {
      const materialType = await storage.getMaterialType(parseInt(req.params.id));
      if (!materialType) {
        return res.status(404).json({ error: 'Material type not found' });
      }
      res.json(materialType);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch material type' });
    }
  });

  app.post('/api/material-types', async (req, res) => {
    try {
      const validatedData = insertMaterialTypeSchema.parse(req.body);
      const materialType = await storage.createMaterialType(validatedData);
      res.status(201).json(materialType);
    } catch (error) {
      res.status(400).json({ error: 'Invalid material type data' });
    }
  });

  app.put('/api/material-types/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertMaterialTypeSchema.partial().parse(req.body);
      const materialType = await storage.updateMaterialType(id, validatedData);
      res.json(materialType);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update material type' });
    }
  });

  app.delete('/api/material-types/:id', async (req, res) => {
    try {
      await storage.deleteMaterialType(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete material type' });
    }
  });

  // YouTube Videos
  app.get('/api/youtube-videos', async (req, res) => {
    try {
      const videos = await storage.getActiveYoutubeVideos();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch YouTube videos' });
    }
  });

  app.get('/api/youtube-videos/:id', async (req, res) => {
    try {
      const video = await storage.getYoutubeVideo(parseInt(req.params.id));
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }
      res.json(video);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch video' });
    }
  });

  app.post('/api/youtube-videos/sync', async (req, res) => {
    try {
      await youtubeService.fetchAndCacheVideos();
      res.json({ message: 'YouTube videos sync completed' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to sync YouTube videos' });
    }
  });

  // YouTube channel info endpoint
  app.get('/api/youtube-channel-info', async (req, res) => {
    try {
      // Check if YouTube API is available
      if (!process.env.YOUTUBE_API_KEY) {
        return res.status(503).json({ 
          error: 'YouTube service unavailable', 
          message: 'YouTube API key not configured' 
        });
      }

      const channelInfo = await youtubeService.fetchChannelInfo('@guilhermeavasques');
      if (channelInfo) {
        res.json({
          title: channelInfo.snippet.title,
          subscriberCount: channelInfo.statistics.subscriberCount,
          videoCount: channelInfo.statistics.videoCount,
          viewCount: channelInfo.statistics.viewCount,
          customUrl: channelInfo.snippet.customUrl,
          thumbnails: channelInfo.snippet.thumbnails,
          description: channelInfo.snippet.description,
          channelId: channelInfo.id
        });
      } else {
        res.status(404).json({ error: 'Channel not found' });
      }
    } catch (error) {
      console.error('Error fetching channel info:', error);
      res.status(500).json({ error: 'Failed to fetch channel info' });
    }
  });

  app.delete('/api/youtube-videos/:id', async (req, res) => {
    try {
      await storage.deleteYoutubeVideo(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete video' });
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

  // Webhook Config routes
  app.get('/api/webhook-configs', async (req, res) => {
    try {
      const configs = await storage.getWebhookConfigs();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch webhook configs' });
    }
  });

  app.get('/api/webhook-configs/:id', async (req, res) => {
    try {
      const config = await storage.getWebhookConfig(parseInt(req.params.id));
      if (!config) {
        return res.status(404).json({ error: 'Webhook config not found' });
      }
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch webhook config' });
    }
  });

  app.post('/api/webhook-configs', async (req, res) => {
    try {
      const validatedData = insertWebhookConfigSchema.parse(req.body);
      const config = await storage.createWebhookConfig(validatedData);
      res.status(201).json(config);
    } catch (error) {
      res.status(400).json({ error: 'Invalid webhook config data' });
    }
  });

  app.put('/api/webhook-configs/:id', async (req, res) => {
    try {
      const validatedData = insertWebhookConfigSchema.partial().parse(req.body);
      const config = await storage.updateWebhookConfig(parseInt(req.params.id), validatedData);
      res.json(config);
    } catch (error) {
      res.status(400).json({ error: 'Invalid webhook config data' });
    }
  });

  app.delete('/api/webhook-configs/:id', async (req, res) => {
    try {
      await storage.deleteWebhookConfig(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete webhook config' });
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
      const agent = await storage.getAgentWithPrompts(req.params.id);
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }
      res.json(agent);
    } catch (error) {
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

  // OpenAI Processing route (generic)
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
  app.post('/api/agents/amazon-listings-optimizer/process', async (req, res) => {
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

      // TODO: Get from authenticated user session
      const userId = "user-1";
      const userName = "Demo User";
      const agentId = "agent-amazon-listings";

      const result = await openaiService.processAmazonListingOptimizer({
        agentId,
        userId,
        userName,
        ...sanitizedData
      });

      res.json(result);
    } catch (error: any) {
      console.error('Amazon Listings Optimizer processing error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to process listing optimization',
        details: process.env.NODE_ENV === 'development' ? error.stack : null
      });
    }
  });

  // Get all generated images
  app.get('/api/generated-images', async (req, res) => {
    try {
      const images = await db.select().from(generatedImages).orderBy(desc(generatedImages.createdAt));
      res.json(images);
    } catch (error) {
      console.error('Error fetching generated images:', error);
      res.status(500).json({ error: 'Failed to fetch generated images' });
    }
  });

  // Get generated image by ID
  app.get('/api/generated-images/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const [image] = await db.select().from(generatedImages).where(eq(generatedImages.id, id));
      
      if (!image) {
        return res.status(404).json({ error: 'Image not found' });
      }
      
      res.json(image);
    } catch (error) {
      console.error('Error fetching generated image:', error);
      res.status(500).json({ error: 'Failed to fetch generated image' });
    }
  });

  // Delete generated image
  app.delete('/api/generated-images/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(generatedImages).where(eq(generatedImages.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting generated image:', error);
      res.status(500).json({ error: 'Failed to delete generated image' });
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

      const [savedLog] = await db.insert(aiGenerationLogs).values(logData).returning();

      console.log(`💾 [AI_LOG] Saved generation log - User: ${userId}, Model: ${model}, Cost: $${cost}, Characters: ${responseCharacters}`);

      res.json({ 
        success: true, 
        message: 'AI generation log saved successfully',
        logId: savedLog.id
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
  app.post('/api/amazon-reviews/extract', async (req: any, res: any) => {
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
          'X-Rapidapi-Key': process.env.RAPIDAPI_KEY!,
          'X-Rapidapi-Host': 'real-time-amazon-data.p.rapidapi.com'
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

  // Authentication Routes - Production System
  
  // Schemas for authentication
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
  });

  const registerSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1),
    password: z.string().min(6)
  });

  // Login route
  app.post('/api/auth/login', async (req, res) => {
    try {
      console.log('🔐 LOGIN ATTEMPT:', JSON.stringify({
        timestamp: new Date().toISOString(),
        requestBody: req.body,
        headers: req.headers['user-agent']
      }));

      const { email, password } = loginSchema.parse(req.body);
      
      console.log('🔐 LOGIN DATA PARSED:', JSON.stringify({
        email,
        passwordLength: password.length,
        passwordHash: password.substring(0, 3) + '***'
      }));

      const user = await AuthService.authenticateUserByEmail(email, password);
      
      console.log('🔐 AUTHENTICATION RESULT:', JSON.stringify({
        email,
        userFound: !!user,
        userId: user?.id,
        userRole: user?.role,
        userActive: user?.isActive
      }));

      if (!user) {
        console.log('🔐 LOGIN FAILED - User not found or invalid credentials');
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Create session token
      const sessionToken = await AuthService.createSession(user.id);
      
      console.log('🔐 LOGIN SUCCESS:', JSON.stringify({
        userId: user.id,
        email: user.email,
        sessionTokenLength: sessionToken.length
      }));
      
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token: sessionToken
      });
    } catch (error: any) {
      console.error('🔐 LOGIN ERROR:', JSON.stringify({
        error: error.message,
        stack: error.stack,
        requestBody: req.body
      }));
      res.status(400).json({ error: 'Dados inválidos' });
    }
  });

  // Register route
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await AuthService.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email já está em uso' });
      }

      // Create user with email as username
      const user = await AuthService.createUser({
        username: userData.email, // Use email as username
        ...userData,
        role: 'user',
        isActive: true,
        emailVerified: false
      });

      // Create session token
      const sessionToken = await AuthService.createSession(user.id);

      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role
        },
        sessionToken
      });
    } catch (error: any) {
      console.error('Register error:', error);
      res.status(400).json({ error: 'Dados inválidos' });
    }
  });

  // Get current user route (legacy)
  app.get('/api/auth/user', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      const token = authHeader.substring(7);
      const user = await AuthService.validateSession(token);
      
      if (!user) {
        return res.status(401).json({ error: 'Token inválido' });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error: any) {
      console.error('Get user error:', error);
      res.status(401).json({ error: 'Token inválido' });
    }
  });

  // Get current user route (new endpoint)
  app.get('/api/auth/me', async (req, res) => {
    try {
      console.log('🔍 AUTH ME - Request headers:', JSON.stringify({
        authorization: req.headers.authorization,
        'user-agent': req.headers['user-agent']
      }));

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('🔍 AUTH ME - No valid authorization header');
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      const token = authHeader.substring(7);
      console.log('🔍 AUTH ME - Validating token:', token.substring(0, 10) + '...');
      
      const user = await AuthService.validateSession(token);
      
      console.log('🔍 AUTH ME - Session validation result:', JSON.stringify({
        userFound: !!user,
        userId: user?.id,
        userEmail: user?.email
      }));
      
      if (!user) {
        console.log('🔍 AUTH ME - Token validation failed');
        return res.status(401).json({ error: 'Token inválido' });
      }

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error: any) {
      console.error('🔍 AUTH ME - Error:', JSON.stringify({
        error: error.message,
        stack: error.stack
      }));
      res.status(401).json({ error: 'Token inválido' });
    }
  });

  // Logout route
  app.post('/api/auth/logout', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        await AuthService.revokeSession(token);
      }
      
      res.json({ success: true, message: 'Logout realizado com sucesso' });
    } catch (error: any) {
      console.error('Logout error:', error);
      res.json({ success: true, message: 'Logout realizado com sucesso' });
    }
  });

  // Password reset request
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = z.object({ email: z.string().email() }).parse(req.body);
      
      const resetToken = await AuthService.generatePasswordResetToken(email);
      if (!resetToken) {
        return res.status(404).json({ error: 'Email não encontrado' });
      }

      // In production, send email here
      res.json({ 
        success: true, 
        message: 'Token de reset enviado por email',
        resetToken // Remove this in production
      });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      res.status(400).json({ error: 'Dados inválidos' });
    }
  });

  // Password reset
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { resetToken, newPassword } = z.object({
        resetToken: z.string(),
        newPassword: z.string().min(6)
      }).parse(req.body);
      
      const success = await AuthService.resetPassword(resetToken, newPassword);
      if (!success) {
        return res.status(400).json({ error: 'Token inválido ou expirado' });
      }

      res.json({ success: true, message: 'Senha alterada com sucesso' });
    } catch (error: any) {
      console.error('Reset password error:', error);
      res.status(400).json({ error: 'Dados inválidos' });
    }
  });

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

  app.delete('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Delete user group memberships first
      await db.execute('DELETE FROM user_group_members WHERE user_id = $1', [id]);
      
      // Delete user sessions
      await db.execute('DELETE FROM user_sessions WHERE user_id = $1', [id]);
      
      // Delete user
      const result = await db.execute('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  app.get('/api/users/:id/groups', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.execute(`
        SELECT ugm.group_id as "groupId", ug.name as "groupName"
        FROM user_group_members ugm
        JOIN user_groups ug ON ugm.group_id = ug.id
        WHERE ugm.user_id = $1
      `, [id]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching user groups:', error);
      res.status(500).json({ error: 'Failed to fetch user groups' });
    }
  });

  // User Groups Management APIs
  app.get('/api/user-groups', async (req, res) => {
    try {
      const result = await db.execute(`
        SELECT id, name, description, permissions, is_active as "isActive", 
               created_at as "createdAt", updated_at as "updatedAt"
        FROM user_groups
        ORDER BY name
      `);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching user groups:', error);
      res.status(500).json({ error: 'Failed to fetch user groups' });
    }
  });

  app.get('/api/user-groups/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.execute(`
        SELECT id, name, description, permissions, is_active as "isActive", 
               created_at as "createdAt", updated_at as "updatedAt"
        FROM user_groups
        WHERE id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Group not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching user group:', error);
      res.status(500).json({ error: 'Failed to fetch user group' });
    }
  });

  app.post('/api/user-groups', async (req, res) => {
    try {
      const { name, description, permissions, isActive } = req.body;
      
      const result = await db.execute(`
        INSERT INTO user_groups (name, description, permissions, is_active)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, description, permissions, is_active as "isActive", created_at as "createdAt"
      `, [name, description || '', JSON.stringify(permissions || []), isActive !== false]);
      
      res.status(201).json(result.rows[0]);
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
      
      const result = await db.execute(`
        UPDATE user_groups 
        SET name = $1, description = $2, permissions = $3, is_active = $4, updated_at = NOW()
        WHERE id = $5
        RETURNING id, name, description, permissions, is_active as "isActive", updated_at as "updatedAt"
      `, [name, description || '', JSON.stringify(permissions || []), isActive, id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Group not found' });
      }
      
      res.json(result.rows[0]);
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
      await db.execute('DELETE FROM user_group_members WHERE group_id = $1', [id]);
      
      // Delete the group
      const result = await db.execute('DELETE FROM user_groups WHERE id = $1 RETURNING id', [id]);
      
      if (result.rows.length === 0) {
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
      const totalUsers = Number(usersResult.rows[0]?.count) || 0;

      const agentsResult = await db.execute('SELECT COUNT(*) as count FROM agents');
      const totalAgents = Number(agentsResult.rows[0]?.count) || 0;

      const videosResult = await db.execute('SELECT COUNT(*) as count FROM youtube_videos');
      const totalVideos = Number(videosResult.rows[0]?.count) || 0;

      // Count content from each table separately
      const materialsResult = await db.execute('SELECT COUNT(*) as count FROM materials');
      const toolsResult = await db.execute('SELECT COUNT(*) as count FROM tools');
      const partnersResult = await db.execute('SELECT COUNT(*) as count FROM partners');
      const suppliersResult = await db.execute('SELECT COUNT(*) as count FROM suppliers');
      
      const totalContent = 
        Number(materialsResult.rows[0]?.count || 0) +
        Number(toolsResult.rows[0]?.count || 0) +
        Number(partnersResult.rows[0]?.count || 0) +
        Number(suppliersResult.rows[0]?.count || 0);

      // Recent/active counts (simplified)
      const activeAgentsResult = await db.execute('SELECT COUNT(*) as count FROM agents WHERE is_active = true');
      const activeAgents = Number(activeAgentsResult.rows[0]?.count) || 0;

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

  // Amazon Product Details API
  app.post('/api/amazon-product-details', async (req, res) => {
    try {
      const { asin, country } = req.body;

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

      console.log(`🔍 [AMAZON_PRODUCT] Buscando produto - ASIN: ${asin}, País: ${country}`);

      const response = await fetch(`https://real-time-amazon-data.p.rapidapi.com/product-details?asin=${asin}&country=${country}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
          'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com',
          'Host': 'real-time-amazon-data.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 'OK' && data.data) {
        console.log(`✅ [AMAZON_PRODUCT] Produto encontrado - Título: ${data.data.product_title}`);
        
        // Log da busca de produto
        try {
          await db.insert(toolUsageLogs).values({
            userId: 2, // ID do usuário admin padrão
            userName: 'Guilherme Vasques',
            userEmail: 'gavasques@gmail.com',
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

  app.post('/api/amazon-keywords/search', async (req, res) => {
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
          'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com'
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
  app.get('/api/amazon-keyword-suggestions', async (req: Request, res: Response) => {
    try {
      const { prefix, region = 'BR' } = req.query;
      
      if (!prefix || typeof prefix !== 'string') {
        return res.status(400).json({ 
          error: 'Parâmetro prefix é obrigatório' 
        });
      }

      console.log(`🔍 [KEYWORD_SUGGESTIONS] Buscando sugestões para: "${prefix}" na região: ${region}`);

      const response = await fetch(
        `https://amazon-data-scraper141.p.rapidapi.com/v1/keywords/suggestions?prefix=${encodeURIComponent(prefix)}&region=${region}`,
        {
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
            'X-RapidAPI-Host': 'amazon-data-scraper141.p.rapidapi.com'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ [KEYWORD_SUGGESTIONS] ${data.data?.suggestions?.length || 0} sugestões encontradas para: "${prefix}"`);

      // Log da consulta na tabela tool_usage_logs - capturando usuário autenticado
      try {
        // Pega o usuário autenticado da sessão
        const user = req.user || { id: 2, username: 'gavasques', email: 'gavasques@gmail.com', name: 'Guilherme Vasques' };
        
        await db.insert(toolUsageLogs).values({
          userId: user.id,
          userName: user.name || user.username,
          userEmail: user.email,
          toolName: 'Amazon Keyword Suggestions', // nome da ferramenta
          keyword: prefix, // palavra-chave pesquisada
          asin: null, // asin deixado em branco conforme solicitado
          country: region as string, // país selecionado
          additionalData: prefix, // repetindo a palavra buscada conforme solicitado
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
  app.get('/api/cnpj-consulta', async (req: Request, res: Response) => {
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
        const response = await fetch(`https://dados-cnpj.p.rapidapi.com/buscar-base.php?cnpj=${cnpjNumbers}`, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
            'X-RapidAPI-Host': 'dados-cnpj.p.rapidapi.com'
          }
        });

        if (!response.ok) {
          console.error(`❌ [CNPJ_CONSULTA] Erro na API: ${response.status} ${response.statusText}`);
          throw new Error(`Erro na consulta: ${response.status}`);
        }

        const data = await response.json();
        console.log(`✅ [CNPJ_CONSULTA] Dados recebidos para CNPJ: ${cnpjNumbers}`, data.status ? 'SUCESSO' : 'FALHA');
        
        // Log da consulta na tabela tool_usage_logs
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

        // Log da consulta demo na tabela tool_usage_logs
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
  
  // Upload image and store temporarily
  app.post('/api/image-upscale/upload', requireAuth, async (req, res) => {
    const startTime = Date.now();
    
    try {
      console.log('🔍 [IMAGE_UPLOAD] Starting image upload process');
      
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
        imageId: imageRecord.id,
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
        generatedImageUrl: resultUrl,
        generatedImageSize: {
          width: 0, // Would calculate from scale
          height: 0,
          fileSize: 0 // Would get from result if available
        },
        scale: scale,
        quality: 'high',
        apiResponse: pixelcutResult,
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
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        // Extract MIME type from data URL
        const mimeMatch = tempImage.imageUrl.match(/^data:([^;]+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
        
        // Create a temporary URL to send to PixelCut
        const tempImageUrl = `data:${mimeType};base64,${base64Data}`;
        
        console.log('🔍 [PIXELCUT_API] Trying background removal with base64...');
        
        const response = await fetch('https://api.developer.pixelcut.ai/v1/remove-background', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-API-KEY': process.env.PIXELCUT_API_KEY
          },
          body: JSON.stringify({
            image: base64Data,
            format: 'png'
          })
        });

        console.log('🔍 [PIXELCUT_API] Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.log('❌ [PIXELCUT_API] Error:', response.status, '-', JSON.stringify(errorData));
          
          if (response.status === 403 && errorData.error_code === 'insufficient_api_credits') {
            throw new Error('Créditos da API PixelCut esgotados. Entre em contato com o administrador para recarregar os créditos.');
          }
          
          throw new Error(`Erro da API PixelCut: ${errorData.error || 'Erro desconhecido'}`);
        }

        const result = await response.json();
        
        if (!result.data || !result.data.result_url) {
          throw new Error('Resposta inválida da API PixelCut');
        }

        processedImageUrl = result.data.result_url;
        console.log('✅ [PIXELCUT_API] Background removal successful');

      } catch (apiError) {
        console.log('❌ [BACKGROUND_REMOVAL] Error:', apiError);
        return res.status(400).json({
          error: 'Erro no processamento, aguarde 24 horas e tente novamente. Pedimos desculpas.',
          code: 'PROCESSING_ERROR'
        });
      }

      const processingTime = Date.now() - startTime;

      // Save log to database
      try {
        const user = (req as any).user;
        
        await storage.createAiImgGenerationLog({
          userId: user.id,
          provider: 'pixelcut',
          model: 'background-removal',
          feature: 'background_removal',
          originalImageName: tempImage.metadata?.fileName || 'unknown.png',
          generatedImageUrl: processedImageUrl,
          status: 'success',
          cost: '0.02',
          duration: processingTime
        });
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

  return httpServer;
}

// Utility functions for session management
function generateSessionHash(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`.toUpperCase();
}

function generateTags(inputData: any): Record<string, string> {
  const tags: Record<string, string> = {};

  // Tags principais do formulário
  if (inputData.productName) tags.PRODUCT_NAME = inputData.productName;
  if (inputData.brand) tags.BRAND = inputData.brand;
  if (inputData.category) tags.CATEGORY = inputData.category;
  if (inputData.keywords) tags.KEYWORDS = inputData.keywords;
  if (inputData.longTailKeywords) tags.LONG_TAIL_KEYWORDS = inputData.longTailKeywords;
  if (inputData.features) tags.FEATURES = inputData.features;
  if (inputData.targetAudience) tags.TARGET_AUDIENCE = inputData.targetAudience;
  if (inputData.reviewsData) tags.REVIEWS_DATA = inputData.reviewsData;

  // Tags adicionais para melhor usabilidade nos prompts
  if (inputData.productName) tags.PRODUCT_DESCRIPTION = inputData.productName;
  if (inputData.reviewsData) tags.COMPETITOR_REVIEWS = inputData.reviewsData;
  
  // Combinação de palavras-chave
  if (inputData.keywords && inputData.longTailKeywords) {
    tags.ALL_KEYWORDS = `${inputData.keywords}, ${inputData.longTailKeywords}`;
  } else if (inputData.keywords) {
    tags.ALL_KEYWORDS = inputData.keywords;
  } else if (inputData.longTailKeywords) {
    tags.ALL_KEYWORDS = inputData.longTailKeywords;
  }

  return tags;
}


