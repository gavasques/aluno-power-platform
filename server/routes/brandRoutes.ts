import { Router } from 'express';
import { BrandController } from '../controllers/BrandController';
import { requireAuth } from '../security';

const router = Router();
const brandController = new BrandController();

/**
 * Brand Routes
 * SOLID/DRY/KISS Principles Applied
 */

// Brand management
router.get('/brands', requireAuth, brandController.getBrands.bind(brandController));
router.post('/brands', requireAuth, brandController.createBrand.bind(brandController));
router.delete('/brands/:id', requireAuth, brandController.deleteBrand.bind(brandController));

// Department management
router.get('/departments', brandController.getDepartments.bind(brandController));

// Category management  
router.get('/categories', brandController.getCategories.bind(brandController));

export default router;