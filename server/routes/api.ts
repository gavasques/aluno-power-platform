import express from 'express';
import authRoutes from './auth.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes (no authentication required)
router.use('/auth', authRoutes);

// Public endpoints for basic data
router.get('/news/published/preview', async (req, res) => {
  try {
    // Return some sample news data for now
    res.json([
      {
        id: 1,
        title: "Sistema Atualizado",
        summary: "Nova versão com melhorias de segurança",
        category: "Sistema",
        isFeatured: true,
        createdAt: new Date().toISOString()
      }
    ]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/updates/published/preview', async (req, res) => {
  try {
    // Return some sample updates data for now
    res.json([
      {
        id: 1,
        title: "Correções de Segurança",
        summary: "Melhorias na autenticação e proteção",
        version: "2.0.4",
        type: "security",
        priority: "high",
        createdAt: new Date().toISOString()
      }
    ]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected routes (require authentication)
router.use(authenticateToken);

router.get('/user/profile', async (req: any, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;