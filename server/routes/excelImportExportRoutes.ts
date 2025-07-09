/**
 * Excel Import/Export Routes
 * RESTful routes for Excel operations
 * 
 * ROUTES:
 * - GET /templates/:type - Download templates
 * - GET /export/:type - Export data
 * - POST /import/:type/preview - Preview import
 * - POST /import/:type/confirm - Confirm import
 * - POST /import/:type - Simple import
 */

import { Router } from 'express';
import { excelImportExportController, ExcelImportExportController } from '../controllers/ExcelImportExportController';
import { requireAuth, apiLimiter, createRateLimit } from '../security';

const router = Router();

// Rate limiting for file operations
const fileOperationsLimiter = createRateLimit(
  5 * 60 * 1000, // 5 minutes
  10, // 10 operations per 5 minutes
  'Muitas operações de arquivo. Tente novamente em alguns minutos.'
);

const uploadMiddleware = ExcelImportExportController.getUploadMiddleware();

// Template download routes (no auth required for templates)
router.get('/templates/:type', apiLimiter, excelImportExportController.downloadTemplate.bind(excelImportExportController));

// Data export routes (auth required)
router.get('/export/:type', requireAuth, fileOperationsLimiter, excelImportExportController.exportData.bind(excelImportExportController));

// Import preview routes
router.post('/import/:type/preview', 
  requireAuth, 
  fileOperationsLimiter, 
  uploadMiddleware, 
  excelImportExportController.previewImport.bind(excelImportExportController)
);

// Import confirmation routes
router.post('/import/:type/confirm', 
  requireAuth, 
  fileOperationsLimiter, 
  uploadMiddleware, 
  excelImportExportController.confirmImport.bind(excelImportExportController)
);

// Simple import routes
router.post('/import/:type', 
  requireAuth, 
  fileOperationsLimiter, 
  uploadMiddleware, 
  excelImportExportController.simpleImport.bind(excelImportExportController)
);

export { router as excelImportExportRoutes };