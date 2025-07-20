import { Router } from 'express';
import { MaterialController } from '../controllers/MaterialController';
import { requireAuth } from '../security';
import { 
  requireMaterialAccess, 
  requireContentManagement,
  requireRole 
} from '../middleware/permissions';

const router = Router();
const materialController = new MaterialController();

// === CORE MATERIALS ROUTES WITH GRANULAR PERMISSIONS ===
// Public access for viewing materials
router.get('/', materialController.getAll.bind(materialController));
router.get('/search/:query', materialController.search.bind(materialController));
router.get('/:id', materialController.getById.bind(materialController));

// Admin-only access for content management
router.post('/', requireAuth, requireContentManagement, materialController.create.bind(materialController));
router.put('/:id', requireAuth, requireContentManagement, materialController.update.bind(materialController));
router.delete('/:id', requireAuth, requireContentManagement, materialController.delete.bind(materialController));

// === MATERIAL ACTIONS ===
// Require authentication for tracking
router.post('/:id/view', requireAuth, requireMaterialAccess, materialController.incrementView.bind(materialController));
router.post('/:id/download', requireAuth, requireMaterialAccess, materialController.incrementDownload.bind(materialController));

// Note: Categories and Types are handled separately via /api/material-categories and /api/material-types routes

export default router;