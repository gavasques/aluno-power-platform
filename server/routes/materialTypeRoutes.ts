import { Router } from 'express';
import { MaterialController } from '../controllers/MaterialController';

const router = Router();
const materialController = new MaterialController();

// === MATERIAL TYPES ROUTES ===
router.get('/', materialController.getAllTypes.bind(materialController));
router.get('/:id', materialController.getTypeById.bind(materialController));
router.post('/', materialController.createType.bind(materialController));
router.put('/:id', materialController.updateType.bind(materialController));
router.delete('/:id', materialController.deleteType.bind(materialController));

export default router;