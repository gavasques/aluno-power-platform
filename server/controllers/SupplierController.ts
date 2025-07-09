import { Request, Response, NextFunction } from 'express';
import { BaseController } from './BaseController';
import { storage } from '../storage';
import { insertSupplierSchema } from '@shared/schema';

/**
 * Supplier Controller - Single Responsibility Principle (SRP)
 * Handles ONLY supplier-related HTTP operations
 */
export class SupplierController extends BaseController {
  protected serviceName = 'SupplierController';

  /**
   * Get all suppliers with optional filtering
   * Following KISS principle: simple, focused logic
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      console.log('GET_ALL_SUPPLIERS', { userId });
      const suppliers = await storage.getSuppliers(userId);
      res.json({ success: true, data: suppliers });
    } catch (error) {
      this.logError(error, 'GET_ALL_SUPPLIERS');
      res.status(500).json({ success: false, error: 'Failed to get suppliers' });
    }
  }

  /**
   * Get paginated suppliers - DRY: reusable pagination pattern
   */
  async getPaginated(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      this.logOperation('GET_PAGINATED_SUPPLIERS', { page, limit });
      const result = await storage.getPaginatedSuppliers(page, limit);
      ResponseHandler.success(res, result);
    } catch (error) {
      this.handleError(error, res, 'GET_PAGINATED_SUPPLIERS');
    }
  }

  /**
   * Get supplier by ID
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = ValidationHelper.parseId(req.params.id);
      
      this.logOperation('GET_SUPPLIER_BY_ID', { id });
      const supplier = await storage.getSupplier(id);
      
      if (!supplier) {
        ResponseHandler.error(res, 'Supplier not found', 404);
        return;
      }
      
      ResponseHandler.success(res, supplier);
    } catch (error) {
      this.handleError(error, res, 'GET_SUPPLIER_BY_ID');
    }
  }

  /**
   * Create new supplier with validation
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      
      this.logOperation('CREATE_SUPPLIER', validatedData);
      const supplier = await storage.createSupplier(validatedData);
      ResponseHandler.created(res, supplier);
    } catch (error) {
      this.handleError(error, res, 'CREATE_SUPPLIER');
    }
  }

  /**
   * Update supplier - partial updates supported
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = ValidationHelper.parseId(req.params.id);
      const validatedData = insertSupplierSchema.partial().parse(req.body);
      
      this.logOperation('UPDATE_SUPPLIER', { id, data: validatedData });
      const supplier = await storage.updateSupplier(id, validatedData);
      ResponseHandler.success(res, supplier);
    } catch (error) {
      this.handleError(error, res, 'UPDATE_SUPPLIER');
    }
  }

  /**
   * Delete supplier
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = ValidationHelper.parseId(req.params.id);
      
      this.logOperation('DELETE_SUPPLIER', { id });
      await storage.deleteSupplier(id);
      ResponseHandler.noContent(res);
    } catch (error) {
      this.handleError(error, res, 'DELETE_SUPPLIER');
    }
  }

  /**
   * Search suppliers - specialized functionality
   */
  async search(req: Request, res: Response): Promise<void> {
    try {
      const query = req.params.query;
      
      if (!query || query.trim().length < 2) {
        ResponseHandler.error(res, 'Search query must be at least 2 characters', 400);
        return;
      }

      this.logOperation('SEARCH_SUPPLIERS', { query });
      const suppliers = await storage.searchSuppliers(query);
      ResponseHandler.success(res, suppliers);
    } catch (error) {
      this.handleError(error, res, 'SEARCH_SUPPLIERS');
    }
  }

  /**
   * Get supplier reviews - related functionality grouped logically
   */
  async getReviews(req: Request, res: Response): Promise<void> {
    try {
      const id = ValidationHelper.parseId(req.params.id);
      
      this.logOperation('GET_SUPPLIER_REVIEWS', { supplierId: id });
      const reviews = await storage.getSupplierReviews(id);
      ResponseHandler.success(res, reviews);
    } catch (error) {
      this.handleError(error, res, 'GET_SUPPLIER_REVIEWS');
    }
  }

  /**
   * Create supplier review
   */
  async createReview(req: Request, res: Response): Promise<void> {
    try {
      const supplierId = ValidationHelper.parseId(req.params.id);
      const { rating, comment } = req.body;
      
      ValidationHelper.validateRequired(req.body, ['rating', 'comment']);
      
      // TODO: Get real user ID from authentication
      const userId = 1;
      
      const reviewData = {
        supplierId,
        userId,
        rating,
        comment,
        isApproved: false
      };

      this.logOperation('CREATE_SUPPLIER_REVIEW', reviewData);
      const review = await storage.createSupplierReview(reviewData);
      ResponseHandler.created(res, review);
    } catch (error) {
      this.handleError(error, res, 'CREATE_SUPPLIER_REVIEW');
    }
  }

  /**
   * Get supplier brands
   */
  async getBrands(req: Request, res: Response): Promise<void> {
    try {
      const supplierId = ValidationHelper.parseId(req.params.id);
      
      this.logOperation('GET_SUPPLIER_BRANDS', { supplierId });
      const brands = await storage.getSupplierBrands(supplierId);
      ResponseHandler.success(res, brands);
    } catch (error) {
      this.handleError(error, res, 'GET_SUPPLIER_BRANDS');
    }
  }

  /**
   * Create supplier brand
   */
  async createBrand(req: Request, res: Response): Promise<void> {
    try {
      const supplierId = ValidationHelper.parseId(req.params.id);
      const brandData = {
        ...req.body,
        supplierId,
      };
      
      this.logOperation('CREATE_SUPPLIER_BRAND', brandData);
      const brand = await storage.createSupplierBrand(brandData);
      ResponseHandler.created(res, brand);
    } catch (error) {
      this.handleError(error, res, 'CREATE_SUPPLIER_BRAND');
    }
  }

  /**
   * Delete supplier brand
   */
  async deleteBrand(req: Request, res: Response): Promise<void> {
    try {
      const brandId = ValidationHelper.parseId(req.params.brandId);
      
      this.logOperation('DELETE_SUPPLIER_BRAND', { brandId });
      await storage.deleteSupplierBrand(brandId);
      ResponseHandler.success(res, { success: true });
    } catch (error) {
      this.handleError(error, res, 'DELETE_SUPPLIER_BRAND');
    }
  }

  /**
   * Get supplier conversations
   */
  async getConversations(req: Request, res: Response): Promise<void> {
    try {
      const supplierId = ValidationHelper.parseId(req.params.id);
      const userId = (req as any).user?.id;
      
      if (!userId) {
        ResponseHandler.error(res, 'Authentication required', 401);
        return;
      }
      
      this.logOperation('GET_SUPPLIER_CONVERSATIONS', { supplierId, userId });
      const conversations = await storage.getSupplierConversations(supplierId, userId);
      ResponseHandler.success(res, conversations);
    } catch (error) {
      this.handleError(error, res, 'GET_SUPPLIER_CONVERSATIONS');
    }
  }

  /**
   * Create supplier conversation
   */
  async createConversation(req: Request, res: Response): Promise<void> {
    try {
      const supplierId = ValidationHelper.parseId(req.params.id);
      const userId = (req as any).user?.id;
      
      if (!userId) {
        ResponseHandler.error(res, 'Authentication required', 401);
        return;
      }
      
      const conversationData = { ...req.body, supplierId, userId };
      
      this.logOperation('CREATE_SUPPLIER_CONVERSATION', conversationData);
      const conversation = await storage.createSupplierConversation(conversationData);
      ResponseHandler.created(res, conversation);
    } catch (error) {
      this.handleError(error, res, 'CREATE_SUPPLIER_CONVERSATION');
    }
  }

  /**
   * Update supplier conversation
   */
  async updateConversation(req: Request, res: Response): Promise<void> {
    try {
      const conversationId = ValidationHelper.parseId(req.params.id);
      const userId = (req as any).user?.id;
      
      if (!userId) {
        ResponseHandler.error(res, 'Authentication required', 401);
        return;
      }
      
      this.logOperation('UPDATE_SUPPLIER_CONVERSATION', { conversationId, userId, data: req.body });
      const conversation = await storage.updateSupplierConversation(conversationId, req.body, userId);
      ResponseHandler.success(res, conversation);
    } catch (error) {
      this.handleError(error, res, 'UPDATE_SUPPLIER_CONVERSATION');
    }
  }

  /**
   * Delete supplier conversation
   */
  async deleteConversation(req: Request, res: Response): Promise<void> {
    try {
      const conversationId = ValidationHelper.parseId(req.params.id);
      const userId = (req as any).user?.id;
      
      if (!userId) {
        ResponseHandler.error(res, 'Authentication required', 401);
        return;
      }
      
      this.logOperation('DELETE_SUPPLIER_CONVERSATION', { conversationId, userId });
      await storage.deleteSupplierConversation(conversationId, userId);
      ResponseHandler.success(res, { success: true });
    } catch (error) {
      this.handleError(error, res, 'DELETE_SUPPLIER_CONVERSATION');
    }
  }

  /**
   * Get supplier contacts
   */
  async getContacts(req: Request, res: Response): Promise<void> {
    try {
      const supplierId = ValidationHelper.parseId(req.params.id);
      const userId = (req as any).user?.id;
      
      if (!userId) {
        ResponseHandler.error(res, 'Authentication required', 401);
        return;
      }
      
      this.logOperation('GET_SUPPLIER_CONTACTS', { supplierId, userId });
      const contacts = await storage.getSupplierContacts(supplierId, userId);
      ResponseHandler.success(res, contacts);
    } catch (error) {
      this.handleError(error, res, 'GET_SUPPLIER_CONTACTS');
    }
  }

  /**
   * Create supplier contact
   */
  async createContact(req: Request, res: Response): Promise<void> {
    try {
      const supplierId = ValidationHelper.parseId(req.params.id);
      const userId = (req as any).user?.id;
      
      if (!userId) {
        ResponseHandler.error(res, 'Authentication required', 401);
        return;
      }
      
      const contactData = { ...req.body, supplierId, userId };
      
      this.logOperation('CREATE_SUPPLIER_CONTACT', contactData);
      const contact = await storage.createSupplierContact(contactData);
      ResponseHandler.created(res, contact);
    } catch (error) {
      this.handleError(error, res, 'CREATE_SUPPLIER_CONTACT');
    }
  }

  /**
   * Get supplier files
   */
  async getFiles(req: Request, res: Response): Promise<void> {
    try {
      const supplierId = ValidationHelper.parseId(req.params.id);
      const userId = (req as any).user?.id;
      
      if (!userId) {
        ResponseHandler.error(res, 'Authentication required', 401);
        return;
      }
      
      this.logOperation('GET_SUPPLIER_FILES', { supplierId, userId });
      const files = await storage.getSupplierFiles(supplierId, userId);
      ResponseHandler.success(res, files);
    } catch (error) {
      this.handleError(error, res, 'GET_SUPPLIER_FILES');
    }
  }

  /**
   * Create supplier file
   */
  async createFile(req: Request, res: Response): Promise<void> {
    try {
      const supplierId = ValidationHelper.parseId(req.params.id);
      const userId = (req as any).user?.id;
      
      if (!userId) {
        ResponseHandler.error(res, 'Authentication required', 401);
        return;
      }
      
      const fileData = { ...req.body, supplierId, userId };
      
      this.logOperation('CREATE_SUPPLIER_FILE', fileData);
      const file = await storage.createSupplierFile(fileData);
      ResponseHandler.created(res, file);
    } catch (error) {
      this.handleError(error, res, 'CREATE_SUPPLIER_FILE');
    }
  }
}