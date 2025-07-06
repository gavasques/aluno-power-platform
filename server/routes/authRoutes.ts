import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();
const authController = new AuthController();

/**
 * Authentication Routes
 * SOLID/DRY/KISS Principles Applied
 */

// User authentication
router.post('/auth/register', authController.register.bind(authController));
router.post('/auth/login', authController.login.bind(authController));
router.post('/auth/logout', authController.logout.bind(authController));
router.get('/auth/me', authController.getCurrentUser.bind(authController));

// Password management
router.post('/auth/change-password', authController.changePassword.bind(authController));

export default router;