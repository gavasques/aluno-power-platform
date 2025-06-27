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
  insertWebhookConfigSchema,
  insertAgentSchema,
  insertAgentPromptSchema,
  insertAgentUsageSchema,
  insertAgentGenerationSchema
} from "@shared/schema";
import { youtubeService } from "./services/youtubeService";
import { agentService } from "./services/agentService";

// WebSocket connections storage
const connectedClients = new Set<WebSocket>();

// Broadcast function for real-time notifications
function broadcastNotification(type: string, data: any) {
  const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  connectedClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
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
        departmentId: departmentId ? parseInt(departmentId) : undefined,
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

  // AI Agents
  app.get('/api/agents', async (req, res) => {
    try {
      const agents = await storage.getAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch agents' });
    }
  });

  app.get('/api/agents/active', async (req, res) => {
    try {
      const agents = await storage.getActiveAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch active agents' });
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
      broadcastNotification('agent_created', agent);
      res.status(201).json(agent);
    } catch (error) {
      res.status(400).json({ error: 'Invalid agent data' });
    }
  });

  app.put('/api/agents/:id', async (req, res) => {
    try {
      const validatedData = insertAgentSchema.partial().parse(req.body);
      const agent = await storage.updateAgent(req.params.id, validatedData);
      broadcastNotification('agent_updated', agent);
      res.json(agent);
    } catch (error) {
      res.status(400).json({ error: 'Invalid agent data' });
    }
  });

  app.delete('/api/agents/:id', async (req, res) => {
    try {
      await storage.deleteAgent(req.params.id);
      broadcastNotification('agent_deleted', { id: req.params.id });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete agent' });
    }
  });

  // Agent Prompts
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

  app.put('/api/agents/prompts/:id', async (req, res) => {
    try {
      const validatedData = insertAgentPromptSchema.partial().parse(req.body);
      const prompt = await storage.updateAgentPrompt(req.params.id, validatedData);
      res.json(prompt);
    } catch (error) {
      res.status(400).json({ error: 'Invalid prompt data' });
    }
  });

  app.delete('/api/agents/prompts/:id', async (req, res) => {
    try {
      await storage.deleteAgentPrompt(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete prompt' });
    }
  });

  // Agent Usage
  app.get('/api/agents/:agentId/usage', async (req, res) => {
    try {
      const usage = await storage.getAgentUsage(req.params.agentId);
      res.json(usage);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch agent usage' });
    }
  });

  app.get('/api/users/:userId/agent-usage', async (req, res) => {
    try {
      const usage = await storage.getUserAgentUsage(req.params.userId);
      res.json(usage);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user agent usage' });
    }
  });

  app.post('/api/agents/usage', async (req, res) => {
    try {
      const validatedData = insertAgentUsageSchema.parse(req.body);
      const usage = await storage.createAgentUsage(validatedData);
      res.status(201).json(usage);
    } catch (error) {
      res.status(400).json({ error: 'Invalid usage data' });
    }
  });

  // Agent Generations
  app.get('/api/agent-usage/:usageId/generation', async (req, res) => {
    try {
      const generation = await storage.getAgentGeneration(req.params.usageId);
      if (!generation) {
        return res.status(404).json({ error: 'Generation not found' });
      }
      res.json(generation);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch generation' });
    }
  });

  app.post('/api/agent-generations', async (req, res) => {
    try {
      const validatedData = insertAgentGenerationSchema.parse(req.body);
      const generation = await storage.createAgentGeneration(validatedData);
      res.status(201).json(generation);
    } catch (error) {
      res.status(400).json({ error: 'Invalid generation data' });
    }
  });

  // Agent Execution
  app.post('/api/agents/:agentId/execute', async (req, res) => {
    try {
      const { agentId } = req.params;
      const { userId, userName, productInfo, reviewsData } = req.body;

      if (!userId || !userName || !productInfo || !reviewsData) {
        return res.status(400).json({ 
          error: 'Missing required fields: userId, userName, productInfo, reviewsData' 
        });
      }

      const generation = await agentService.executeAgent(
        agentId,
        userId,
        userName,
        productInfo,
        reviewsData
      );

      broadcastNotification('agent_executed', {
        agentId,
        userId,
        generation: generation.id
      });

      res.json(generation);
    } catch (error) {
      console.error('Agent execution error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Agent execution failed' 
      });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    connectedClients.add(ws);
    
    // Send welcome message
    ws.send(JSON.stringify({ 
      type: 'connection', 
      data: { message: 'Connected to real-time notifications' },
      timestamp: new Date().toISOString()
    }));
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      connectedClients.delete(ws);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      connectedClients.delete(ws);
    });
  });

  return httpServer;
}
