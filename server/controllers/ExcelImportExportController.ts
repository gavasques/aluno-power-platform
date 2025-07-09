/**
 * Excel Import/Export Controller
 * RESTful API for Excel operations
 * 
 * ENDPOINTS:
 * - GET /templates/:type - Download Excel templates
 * - GET /export/:type - Export data to Excel
 * - POST /import/:type - Import data from Excel
 * - POST /import/:type/preview - Preview import changes
 * - POST /import/:type/confirm - Confirm import with user decisions
 */

import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { ResponseHandler } from '../utils/ResponseHandler';
import { excelImportExportService } from '../services/ExcelImportExportService';
import multer from 'multer';
import { z } from 'zod';

// Configure multer for Excel file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /xlsx|xls/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = file.mimetype.includes('spreadsheet') || file.mimetype.includes('excel');
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas arquivos Excel (.xlsx, .xls) são permitidos'));
    }
  }
});

const ImportTypeSchema = z.enum(['products', 'channels']);
const ExportQuerySchema = z.object({
  includeData: z.string().optional().transform(val => val === 'true'),
  format: z.enum(['xlsx']).optional().default('xlsx')
});

const ImportConfirmSchema = z.object({
  conflicts: z.array(z.object({
    row: z.number(),
    action: z.enum(['skip', 'update', 'create_new'])
  })),
  autoUpdate: z.boolean().optional().default(false)
});

export class ExcelImportExportController extends BaseController {

  /**
   * GET /api/excel/templates/:type - Download Excel template
   */
  async downloadTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.params;
      const importType = ImportTypeSchema.parse(type);
      
      let buffer: Buffer;
      let filename: string;
      
      if (importType === 'products') {
        buffer = await excelImportExportService.exportProductsToExcel(0, false);
        filename = 'template_produtos.xlsx';
      } else {
        buffer = await excelImportExportService.exportChannelsToExcel(0, false);
        filename = 'template_canais_venda.xlsx';
      }
      
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString()
      });
      
      res.send(buffer);
    } catch (error) {
      this.handleError(res, error, 'Erro ao gerar template');
    }
  }

  /**
   * GET /api/excel/export/:type - Export user data to Excel
   */
  async exportData(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ResponseHandler.unauthorized(res, 'Authentication required');
        return;
      }

      const { type } = req.params;
      const importType = ImportTypeSchema.parse(type);
      const query = ExportQuerySchema.parse(req.query);
      
      let buffer: Buffer;
      let filename: string;
      
      if (importType === 'products') {
        buffer = await excelImportExportService.exportProductsToExcel(userId, query.includeData);
        filename = query.includeData ? 'meus_produtos.xlsx' : 'template_produtos.xlsx';
      } else {
        buffer = await excelImportExportService.exportChannelsToExcel(userId, query.includeData);
        filename = query.includeData ? 'meus_canais_venda.xlsx' : 'template_canais_venda.xlsx';
      }
      
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache'
      });
      
      res.send(buffer);
    } catch (error) {
      this.handleError(res, error, 'Erro ao exportar dados');
    }
  }

  /**
   * POST /api/excel/import/:type/preview - Preview import changes
   */
  async previewImport(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ResponseHandler.unauthorized(res, 'Authentication required');
        return;
      }

      if (!req.file) {
        ResponseHandler.badRequest(res, 'Arquivo Excel é obrigatório');
        return;
      }

      const { type } = req.params;
      const importType = ImportTypeSchema.parse(type);
      
      let result;
      if (importType === 'products') {
        result = await excelImportExportService.processProductImport(
          req.file.buffer,
          userId,
          false // Preview mode - don't auto-update
        );
      } else {
        result = await excelImportExportService.processChannelsImport(
          req.file.buffer,
          userId,
          false // Preview mode - don't auto-update
        );
      }
      
      ResponseHandler.success(res, {
        preview: true,
        summary: {
          totalRows: result.totalProcessed + result.errors.length + result.conflicts.length,
          newItems: result.newProducts,
          conflicts: result.conflicts.length,
          errors: result.errors.length
        },
        conflicts: result.conflicts.map(conflict => ({
          row: conflict.row,
          type: conflict.conflictType,
          existing: {
            id: conflict.existingProduct.id,
            name: conflict.existingProduct.name,
            sku: conflict.existingProduct.sku
          },
          new: {
            name: conflict.newData.name,
            sku: conflict.newData.sku
          }
        })),
        errors: result.errors
      });
    } catch (error) {
      this.handleError(res, error, 'Erro ao processar preview da importação');
    }
  }

  /**
   * POST /api/excel/import/:type/confirm - Confirm and execute import
   */
  async confirmImport(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ResponseHandler.unauthorized(res, 'Authentication required');
        return;
      }

      if (!req.file) {
        ResponseHandler.badRequest(res, 'Arquivo Excel é obrigatório');
        return;
      }

      const { type } = req.params;
      const importType = ImportTypeSchema.parse(type);
      const confirmData = ImportConfirmSchema.parse(req.body);
      
      // Process import with user decisions
      let result;
      if (importType === 'products') {
        result = await excelImportExportService.processProductImport(
          req.file.buffer,
          userId,
          confirmData.autoUpdate
        );
      } else {
        result = await excelImportExportService.processChannelsImport(
          req.file.buffer,
          userId,
          confirmData.autoUpdate
        );
      }
      
      ResponseHandler.success(res, {
        imported: true,
        summary: {
          newItems: result.newProducts,
          updatedItems: result.updatedProducts,
          totalProcessed: result.totalProcessed,
          errors: result.errors.length
        },
        details: {
          errors: result.errors
        }
      });
    } catch (error) {
      this.handleError(res, error, 'Erro ao confirmar importação');
    }
  }

  /**
   * POST /api/excel/import/:type - Simple import (with auto-update)
   */
  async simpleImport(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ResponseHandler.unauthorized(res, 'Authentication required');
        return;
      }

      if (!req.file) {
        ResponseHandler.badRequest(res, 'Arquivo Excel é obrigatório');
        return;
      }

      const { type } = req.params;
      const importType = ImportTypeSchema.parse(type);
      const autoUpdate = req.body.autoUpdate === 'true';
      
      let result;
      if (importType === 'products') {
        result = await excelImportExportService.processProductImport(
          req.file.buffer,
          userId,
          autoUpdate
        );
      } else {
        result = await excelImportExportService.processChannelsImport(
          req.file.buffer,
          userId,
          autoUpdate
        );
      }
      
      if (result.conflicts.length > 0 && !autoUpdate) {
        ResponseHandler.success(res, {
          requiresConfirmation: true,
          conflicts: result.conflicts,
          errors: result.errors,
          summary: {
            totalRows: result.totalProcessed + result.errors.length + result.conflicts.length,
            newItems: result.newProducts,
            conflicts: result.conflicts.length,
            errors: result.errors.length
          }
        });
      } else {
        ResponseHandler.success(res, {
          imported: true,
          summary: {
            newItems: result.newProducts,
            updatedItems: result.updatedProducts,
            totalProcessed: result.totalProcessed,
            errors: result.errors.length
          },
          errors: result.errors
        });
      }
    } catch (error) {
      this.handleError(res, error, 'Erro ao processar importação');
    }
  }

  /**
   * Setup multer middleware for file uploads
   */
  static getUploadMiddleware() {
    return upload.single('file');
  }
}

export const excelImportExportController = new ExcelImportExportController();