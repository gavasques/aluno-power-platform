import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { ResponseHandler } from '../utils/ResponseHandler';
import { ValidationHelper } from '../utils/ValidationHelper';
import { insertMaterialSchema, insertMaterialTypeSchema } from '../../shared/schema';
import { storage } from '../storage';

export class MaterialController extends BaseController {
  constructor() {
    super('MaterialController');
  }

  // === CORE MATERIALS CRUD ===
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      this.logOperation('GET_ALL_MATERIALS', {});
      const materials = await storage.getMaterials();
      ResponseHandler.success(res, materials);
    } catch (error) {
      this.handleError(error, res, 'GET_ALL_MATERIALS');
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = ValidationHelper.validateParams(req, ['id']);
      this.logOperation('GET_MATERIAL_BY_ID', { id });
      
      const material = await storage.getMaterial(id);
      if (!material) {
        ResponseHandler.notFound(res, 'Material not found');
        return;
      }
      
      ResponseHandler.success(res, material);
    } catch (error) {
      this.handleError(error, res, 'GET_MATERIAL_BY_ID');
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = ValidationHelper.validateBody(req, insertMaterialSchema);
      this.logOperation('CREATE_MATERIAL', { data: validatedData });
      
      const material = await storage.createMaterial(validatedData);
      ResponseHandler.created(res, material);
    } catch (error) {
      this.handleError(error, res, 'CREATE_MATERIAL');
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = ValidationHelper.validateParams(req, ['id']);
      const validatedData = ValidationHelper.validateBody(req, insertMaterialSchema.partial());
      this.logOperation('UPDATE_MATERIAL', { id, data: validatedData });
      
      const material = await storage.updateMaterial(id, validatedData);
      ResponseHandler.success(res, material);
    } catch (error) {
      this.handleError(error, res, 'UPDATE_MATERIAL');
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = ValidationHelper.validateParams(req, ['id']);
      this.logOperation('DELETE_MATERIAL', { id });
      
      await storage.deleteMaterial(id);
      ResponseHandler.noContent(res);
    } catch (error) {
      this.handleError(error, res, 'DELETE_MATERIAL');
    }
  }

  // === MATERIAL SEARCH & ACTIONS ===
  async search(req: Request, res: Response): Promise<void> {
    try {
      const { query } = ValidationHelper.validateParams(req, ['query']);
      this.logOperation('SEARCH_MATERIALS', { query });
      
      const materials = await storage.searchMaterials(query);
      ResponseHandler.success(res, materials);
    } catch (error) {
      this.handleError(error, res, 'SEARCH_MATERIALS');
    }
  }

  async incrementView(req: Request, res: Response): Promise<void> {
    try {
      const { id } = ValidationHelper.validateParams(req, ['id']);
      this.logOperation('INCREMENT_MATERIAL_VIEW', { id });
      
      await storage.incrementMaterialViewCount(id);
      ResponseHandler.success(res, { success: true });
    } catch (error) {
      this.handleError(error, res, 'INCREMENT_MATERIAL_VIEW');
    }
  }

  async incrementDownload(req: Request, res: Response): Promise<void> {
    try {
      const { id } = ValidationHelper.validateParams(req, ['id']);
      this.logOperation('INCREMENT_MATERIAL_DOWNLOAD', { id });
      
      await storage.incrementMaterialDownloadCount(id);
      ResponseHandler.success(res, { success: true });
    } catch (error) {
      this.handleError(error, res, 'INCREMENT_MATERIAL_DOWNLOAD');
    }
  }

  // === MATERIAL CATEGORIES ===
  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      this.logOperation('GET_ALL_MATERIAL_CATEGORIES', {});
      const categories = await storage.getMaterialCategories();
      ResponseHandler.success(res, categories);
    } catch (error) {
      this.handleError(error, res, 'GET_ALL_MATERIAL_CATEGORIES');
    }
  }

  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const categoryData = req.body;
      this.logOperation('CREATE_MATERIAL_CATEGORY', { data: categoryData });
      
      const category = await storage.createMaterialCategory(categoryData);
      ResponseHandler.created(res, category);
    } catch (error) {
      this.handleError(error, res, 'CREATE_MATERIAL_CATEGORY');
    }
  }

  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = ValidationHelper.validateParams(req, ['id']);
      const categoryData = req.body;
      this.logOperation('UPDATE_MATERIAL_CATEGORY', { id, data: categoryData });
      
      const category = await storage.updateMaterialCategory(id, categoryData);
      ResponseHandler.success(res, category);
    } catch (error) {
      this.handleError(error, res, 'UPDATE_MATERIAL_CATEGORY');
    }
  }

  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = ValidationHelper.validateParams(req, ['id']);
      this.logOperation('DELETE_MATERIAL_CATEGORY', { id });
      
      await storage.deleteMaterialCategory(id);
      ResponseHandler.noContent(res);
    } catch (error) {
      this.handleError(error, res, 'DELETE_MATERIAL_CATEGORY');
    }
  }

  // === MATERIAL TYPES ===
  async getAllTypes(req: Request, res: Response): Promise<void> {
    try {
      this.logOperation('GET_ALL_MATERIAL_TYPES', {});
      const materialTypes = await storage.getMaterialTypes();
      ResponseHandler.success(res, materialTypes);
    } catch (error) {
      this.handleError(error, res, 'GET_ALL_MATERIAL_TYPES');
    }
  }

  async getTypeById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = ValidationHelper.validateParams(req, ['id']);
      this.logOperation('GET_MATERIAL_TYPE_BY_ID', { id });
      
      const materialType = await storage.getMaterialType(id);
      if (!materialType) {
        ResponseHandler.notFound(res, 'Material type not found');
        return;
      }
      
      ResponseHandler.success(res, materialType);
    } catch (error) {
      this.handleError(error, res, 'GET_MATERIAL_TYPE_BY_ID');
    }
  }

  async createType(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = ValidationHelper.validateBody(req, insertMaterialTypeSchema);
      this.logOperation('CREATE_MATERIAL_TYPE', { data: validatedData });
      
      const materialType = await storage.createMaterialType(validatedData);
      ResponseHandler.created(res, materialType);
    } catch (error) {
      this.handleError(error, res, 'CREATE_MATERIAL_TYPE');
    }
  }

  async updateType(req: Request, res: Response): Promise<void> {
    try {
      const { id } = ValidationHelper.validateParams(req, ['id']);
      const validatedData = ValidationHelper.validateBody(req, insertMaterialTypeSchema.partial());
      this.logOperation('UPDATE_MATERIAL_TYPE', { id, data: validatedData });
      
      const materialType = await storage.updateMaterialType(id, validatedData);
      ResponseHandler.success(res, materialType);
    } catch (error) {
      this.handleError(error, res, 'UPDATE_MATERIAL_TYPE');
    }
  }

  async deleteType(req: Request, res: Response): Promise<void> {
    try {
      const { id } = ValidationHelper.validateParams(req, ['id']);
      this.logOperation('DELETE_MATERIAL_TYPE', { id });
      
      await storage.deleteMaterialType(id);
      ResponseHandler.noContent(res);
    } catch (error) {
      this.handleError(error, res, 'DELETE_MATERIAL_TYPE');
    }
  }
}