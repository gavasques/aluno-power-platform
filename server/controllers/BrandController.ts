import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { storage } from '../storage';
import { ValidationHelper } from '../utils/ValidationHelper';
import { ResponseHandler } from '../utils/ResponseHandler';
import { z } from 'zod';

/**
 * BrandController
 * SOLID Principles: Single Responsibility for brand/department/category operations
 * DRY: Centralized brand logic, no duplication
 * KISS: Simple, focused controller methods
 */
export class BrandController extends BaseController {

  public async getBrands(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const brands = await storage.getBrands(userId);
      ResponseHandler.success(res, brands);
    } catch (error: any) {
      ResponseHandler.handleError(res, error, 'Failed to fetch brands');
    }
  }

  public async createBrand(req: Request, res: Response): Promise<void> {
    try {
      const brandSchema = z.object({
        name: z.string().min(1).max(100)
      });

      const validatedData = brandSchema.parse(req.body);
      const userId = (req as any).user?.id;

      const brand = await storage.createBrand({
        name: validatedData.name,
        userId,
        isGlobal: false
      });

      ResponseHandler.created(res, brand);
    } catch (error: any) {
      ResponseHandler.handleError(res, error, 'Failed to create brand');
    }
  }

  public async deleteBrand(req: Request, res: Response): Promise<void> {
    try {
      const id = ValidationHelper.parseId(req.params.id);
      const userId = (req as any).user?.id;

      // Check if brand exists and belongs to user
      const brand = await storage.getBrand(id);
      if (!brand) {
        ResponseHandler.notFound(res, 'Brand not found');
        return;
      }

      if (brand.isGlobal || brand.userId !== userId) {
        ResponseHandler.forbidden(res, 'Cannot delete this brand');
        return;
      }

      await storage.deleteBrand(id);
      ResponseHandler.noContent(res);
    } catch (error: any) {
      ResponseHandler.handleError(res, error, 'Failed to delete brand');
    }
  }

  public async getDepartments(req: Request, res: Response): Promise<void> {
    try {
      const departments = await storage.getDepartments();
      ResponseHandler.success(res, departments);
    } catch (error: any) {
      ResponseHandler.handleError(res, error, 'Failed to fetch departments');
    }
  }

  public async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await storage.getCategories();
      ResponseHandler.success(res, categories);
    } catch (error: any) {
      ResponseHandler.handleError(res, error, 'Failed to fetch categories');
    }
  }
}