import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
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
  insertUpdateSchema,
  insertGeneratedImageSchema,
  insertWebhookConfigSchema,
  insertAgentSchema,
  insertAgentPromptSchema,
  insertAgentUsageSchema,
  insertAgentGenerationSchema
} from "@shared/schema";
import { youtubeService } from "./services/youtubeService";
import { openaiService } from "./services/openaiService";
import { aiProviderService } from "./services/aiProviderService";
import { db } from './db';
import { eq, desc, like, and, isNull, or, not, sql, asc } from 'drizzle-orm';
import { materials, partners, tools, toolTypes, suppliers, news, updates, youtubeVideos, agents, agentPrompts, agentUsage, agentGenerations, users, products, generatedImages } from '@shared/schema';

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

  // Agent Prompts routes
  app.get('/api/agents/:agentId/prompts', async (req, res) => {
    try {
      const prompts = await storage.getAgentPrompts(req.params.agentId);
      res.json(prompts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch agent prompts' });
    }
  });

  app.post('/api/agents/:agentId/prompts', async (req, res) => {
    try {
      const validatedData = insertAgentPromptSchema.parse({
        ...req.body,
        agentId: req.params.agentId
      });
      const prompt = await storage.createAgentPrompt(validatedData);
      res.status(201).json(prompt);
    } catch (error) {
      res.status(400).json({ error: 'Invalid prompt data' });
    }
  });

  app.put('/api/agent-prompts/:id', async (req, res) => {
    try {
      const validatedData = insertAgentPromptSchema.partial().parse(req.body);
      const prompt = await storage.updateAgentPrompt(req.params.id, validatedData);
      res.json(prompt);
    } catch (error) {
      res.status(400).json({ error: 'Invalid prompt data' });
    }
  });

  app.delete('/api/agent-prompts/:id', async (req, res) => {
    try {
      await storage.deleteAgentPrompt(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete prompt' });
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
          variables: ['{{PRODUCT_NAME}}', '{{PRODUCT_DESCRIPTION}}', '{{KEYWORDS}}', '{{COMPETITOR_REVIEWS}}', '{{CATEGORY}}'],
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
          variables: ['{{PRODUCT_NAME}}', '{{KEYWORDS}}', '{{MAIN_BENEFITS}}', '{{TARGET_AUDIENCE}}', '{{CATEGORY}}'],
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
          variables: ['{{PRODUCT_NAME}}', '{{KEY_FEATURES}}', '{{MAIN_BENEFITS}}', '{{PAIN_POINTS}}', '{{EMOTIONAL_TRIGGERS}}'],
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
          variables: ['{{PRODUCT_NAME}}', '{{ANALYSIS_RESULT}}', '{{KEY_FEATURES}}', '{{TARGET_AUDIENCE}}', '{{MARKET_DIFFERENTIATORS}}'],
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
      const models = aiProviderService.getAvailableModels();
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
      
      const { provider, model, prompt, imageData, temperature, maxTokens } = req.body;
      
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

      console.log(`🚀 [AI_TEST_SEND] RequestID: ${requestId} - Sending to AI service`);
      const aiStartTime = Date.now();

      const testResponse = await aiProviderService.generateCompletion(requestData);

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
        price,
        keywords,
        longTailKeywords,
        features,
        targetAudience,
        competitors,
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
        price: price?.trim() || '',
        keywords: keywords.trim(),
        longTailKeywords: longTailKeywords?.trim() || '',
        features: features?.trim() || '',
        targetAudience: targetAudience?.trim() || '',
        competitors: competitors?.trim() || '',
        reviewsData: reviewsData.trim(),
        format
      };

      // Price validation if provided
      if (sanitizedData.price && isNaN(Number(sanitizedData.price))) {
        return res.status(400).json({ error: 'Price must be a valid number' });
      }

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
  
  // Add heartbeat to detect broken connections
  const interval = setInterval(() => {
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

  return httpServer;
}
