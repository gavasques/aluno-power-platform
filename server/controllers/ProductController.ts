/**
 * Product Controller
 * 
 * SOLID Principles Applied:
 * - SRP: Single responsibility for product operations
 * - OCP: Open for extension, closed for modification
 * - LSP: Proper inheritance from BaseController
 * - ISP: Interface segregation for product-specific operations
 * - DIP: Dependency inversion through storage abstraction
 */

import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { ResponseHandler } from '../utils/ResponseHandler';
import { ValidationHelper } from '../utils/ValidationHelper';
import { insertProductSchema } from '../../shared/schema';
import { storage } from '../storage';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storageConfig = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storageConfig,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export class ProductController extends BaseController {
  
  /**
   * GET /api/products - Optimized product list with performance metrics
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const userId = user?.id;

      // Parse query parameters for optimized filtering
      const options: ProductSearchOptions = {
        search: req.query.search as string,
        brandId: req.query.brandId ? parseInt(req.query.brandId as string) : undefined,
        category: req.query.category as string,
        supplierId: req.query.supplierId ? parseInt(req.query.supplierId as string) : undefined,
        active: req.query.active !== 'false', // Default to true unless explicitly false
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        sortBy: (req.query.sortBy as any) || 'updatedAt',
        sortOrder: (req.query.sortOrder as any) || 'desc'
      };

      // Use optimized service if user is authenticated, fallback to storage for public access
      if (userId) {
        try {
          const result = await optimizedProductService.getOptimizedProductList(userId, options);
          if (!res.headersSent) {
            res.set('X-Performance-Metrics', JSON.stringify(result.performance));
          }
          ResponseHandler.success(res, result);
        } catch (optimizationError) {
          console.warn('⚠️ [PRODUCTS] Optimization failed, falling back to storage:', optimizationError.message);
          // Fallback to original storage method
          const products = await storage.getProducts();
          ResponseHandler.success(res, { success: true, data: products });
        }
      } else {
        // Fallback for unauthenticated requests
        const products = await storage.getProducts();
        ResponseHandler.success(res, { success: true, data: products });
      }
    } catch (error) {
      this.handleError(res, error, 'Failed to fetch products');
    }
  }

  /**
   * GET /api/products/:id - Get product by ID with optimization
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const userId = user?.id;
      
      ValidationHelper.validateParams(req.params, ['id']);
      
      const productId = ValidationHelper.parseId(id);
      
      // Use optimized service if user is authenticated
      if (userId) {
        const product = await optimizedProductService.getOptimizedProduct(productId, userId);
        if (!product) {
          ResponseHandler.notFound(res, 'Product not found or access denied');
          return;
        }
        ResponseHandler.success(res, product);
      } else {
        // Fallback for unauthenticated requests
        const product = await storage.getProduct(productId);
        if (!product) {
          ResponseHandler.notFound(res, 'Product not found');
          return;
        }
        ResponseHandler.success(res, product);
      }
    } catch (error) {
      this.handleError(res, error, 'Failed to fetch product');
    }
  }

  /**
   * POST /api/products - Create new product
   */
  async create(req: Request, res: Response): Promise<void> {
    try {

      
      // Parse FormData fields
      const productData: any = {
        name: req.body.name,
        sku: req.body.sku || '',  // Required field
        freeCode: req.body.freeCode || null,
        supplierCode: req.body.supplierCode || null,
        ean: req.body.ean || null,
        brand: req.body.brand || null,
        category: req.body.categoryId || null,  // categoryId from frontend maps to category in DB
        supplierId: req.body.supplierId ? parseInt(req.body.supplierId) : null,
        ncm: req.body.ncm || null,
        dimensions: req.body.dimensions ? JSON.parse(req.body.dimensions) : null,
        weight: req.body.weight ? String(req.body.weight) : "0",
        costItem: req.body.costItem ? String(req.body.costItem) : "0",
        taxPercent: req.body.taxPercent ? String(req.body.taxPercent) : "0",
        packCost: req.body.packCost ? String(req.body.packCost) : "0",
        observations: req.body.observations || null,
        channels: req.body.channels ? (typeof req.body.channels === 'string' ? JSON.parse(req.body.channels) : req.body.channels) : [],
        photo: req.file ? `/uploads/${req.file.filename}` : (req.body.photo || null),
        active: true,
      };


      
      const validatedData = insertProductSchema.parse(productData);

      
      const product = await storage.createProduct(validatedData);

      
      ResponseHandler.created(res, product);
    } catch (error) {
      console.error('Error creating product:', error);
      this.handleError(error, res, 'Failed to create product');
    }
  }

  /**
   * PUT /api/products/:id - Update product
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const productId = ValidationHelper.parseId(id);
      

      
      // Parse FormData fields - only include fields that were actually sent
      const productData: any = {
        name: req.body.name,
        sku: req.body.sku || '',  // Required field
      };

      // Handle costs object from frontend
      if (req.body.costs) {
        const costs = typeof req.body.costs === 'string' ? JSON.parse(req.body.costs) : req.body.costs;
        if (costs.currentCost !== undefined) productData.costItem = String(costs.currentCost);
        if (costs.taxPercent !== undefined) productData.taxPercent = String(costs.taxPercent);
        if (costs.observations !== undefined) productData.observations = costs.observations;
      }

      // Only add optional fields if they were explicitly sent in the request
      if ('freeCode' in req.body) productData.freeCode = req.body.freeCode || null;
      if ('supplierCode' in req.body) productData.supplierCode = req.body.supplierCode || null;
      if ('ean' in req.body) productData.ean = req.body.ean || null;
      if ('brand' in req.body) productData.brand = req.body.brand || null;
      if ('brandId' in req.body) productData.brandId = req.body.brandId ? parseInt(req.body.brandId) : null;
      if ('categoryId' in req.body) productData.category = req.body.categoryId || null;  // Keep as string to match schema
      if ('supplierId' in req.body) productData.supplierId = req.body.supplierId ? parseInt(req.body.supplierId) : null;
      if ('ncm' in req.body) productData.ncm = req.body.ncm || null;
      if ('dimensions' in req.body) productData.dimensions = req.body.dimensions ? JSON.parse(req.body.dimensions) : null;
      if ('weight' in req.body) productData.weight = req.body.weight ? String(req.body.weight) : "0";
      
      // Direct fields (not from costs object)
      if ('costItem' in req.body && !req.body.costs) productData.costItem = req.body.costItem ? String(req.body.costItem) : "0";
      if ('taxPercent' in req.body && !req.body.costs) productData.taxPercent = req.body.taxPercent ? String(req.body.taxPercent) : "0";
      if ('packCost' in req.body) productData.packCost = req.body.packCost ? String(req.body.packCost) : "0";
      if ('observations' in req.body && !req.body.costs) productData.observations = req.body.observations || null;
      if ('channels' in req.body) productData.channels = typeof req.body.channels === 'string' ? JSON.parse(req.body.channels) : req.body.channels;

      // Handle photo update
      if (req.file) {
        productData.photo = `/uploads/${req.file.filename}`;
      } else if (req.body.photo !== undefined) {
        productData.photo = req.body.photo || null;
      }


      
      const validatedData = insertProductSchema.partial().parse(productData);

      
      const product = await storage.updateProduct(productId, validatedData);

      
      ResponseHandler.success(res, product);
    } catch (error) {
      console.error('Error updating product:', error);
      this.handleError(error, res, 'Failed to update product');
    }
  }

  /**
   * DELETE /api/products/:id - Delete product
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      ValidationHelper.validateParams(req.params, ['id']);
      
      const productId = ValidationHelper.parseId(id);
      await storage.deleteProduct(productId);
      
      ResponseHandler.noContent(res);
    } catch (error) {
      this.handleError(res, error, 'Failed to delete product');
    }
  }

  /**
   * GET /api/products/:id/cost-history - Get product cost history
   */
  async getCostHistory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { limit } = req.query;
      
      ValidationHelper.validateParams(req.params, ['id']);
      const productId = ValidationHelper.parseId(id);
      const limitValue = limit ? parseInt(limit as string) : undefined;
      
      console.log('📊 [COST HISTORY ENDPOINT] Fetching for product:', productId, 'limit:', limitValue);
      const history = await storage.getProductCostHistory(productId, limitValue);
      console.log('📊 [COST HISTORY ENDPOINT] Found entries:', history.length);
      
      ResponseHandler.success(res, history);
    } catch (error) {
      console.error('Error fetching cost history:', error);
      this.handleError(res, error, 'Failed to fetch cost history');
    }
  }

  /**
   * GET /api/products/search/:query - Search products
   */
  async search(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.params;
      ValidationHelper.validateParams(req.params, ['query']);
      
      const products = await storage.searchProducts(query);
      ResponseHandler.success(res, products);
    } catch (error) {
      this.handleError(res, error, 'Failed to search products');
    }
  }

  /**
   * Get multer upload middleware
   */
  static getUploadMiddleware() {
    return upload.single('photo');
  }
}