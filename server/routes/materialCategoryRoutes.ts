import { Router } from 'express';
import { MaterialController } from '../controllers/MaterialController';

const router = Router();
const materialController = new MaterialController();

// === MATERIAL CATEGORIES ROUTES ===
router.get('/', materialController.getAllCategories.bind(materialController));
router.post('/', materialController.createCategory.bind(materialController));
router.put('/:id', materialController.updateCategory.bind(materialController));
router.delete('/:id', materialController.deleteCategory.bind(materialController));

export default router;