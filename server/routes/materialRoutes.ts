import { Router } from 'express';
import { MaterialController } from '../controllers/MaterialController';

const router = Router();
const materialController = new MaterialController();

// === CORE MATERIALS ROUTES ===
router.get('/', materialController.getAll.bind(materialController));
router.get('/search/:query', materialController.search.bind(materialController));
router.get('/:id', materialController.getById.bind(materialController));
router.post('/', materialController.create.bind(materialController));
router.put('/:id', materialController.update.bind(materialController));
router.delete('/:id', materialController.delete.bind(materialController));

// === MATERIAL ACTIONS ===
router.post('/:id/view', materialController.incrementView.bind(materialController));
router.post('/:id/download', materialController.incrementDownload.bind(materialController));

// Note: Categories and Types are handled separately via /api/material-categories and /api/material-types routes

export default router;