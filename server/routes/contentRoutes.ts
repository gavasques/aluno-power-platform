/**
 * Content Routes - Phase 6: Content Management Modularization
 * 
 * SOLID Principles Applied:
 * - SRP: Single responsibility for content route configuration
 * - OCP: Open for extension, closed for modification
 * - LSP: Consistent route interface pattern
 * - ISP: Focused interface for content routes only
 * - DIP: Depends on ContentController abstraction
 * 
 * Routes Covered:
 * YouTube Videos:
 * - GET /api/youtube-videos
 * - GET /api/youtube-videos/:id
 * - POST /api/youtube-videos/sync
 * - GET /api/youtube-channel-info
 * - DELETE /api/youtube-videos/:id
 * 
 * News:
 * - GET /api/news
 * - GET /api/news/published
 * - GET /api/news/published/preview
 * - GET /api/news/:id
 * - POST /api/news
 * - PUT /api/news/:id
 * - DELETE /api/news/:id
 */

import { Router } from 'express';
import { ContentController } from '../controllers/ContentController';
import { requireAuth, requireRole } from '../security';

const router = Router();
const contentController = new ContentController();

/**
 * PHASE 6: YouTube Video Routes
 * Public access for viewing, admin for management
 */
router.get('/youtube-videos', 
  contentController.getYouTubeVideos.bind(contentController)
);

router.get('/youtube-videos/:id', 
  contentController.getYouTubeVideoById.bind(contentController)
);

router.post('/youtube-videos/sync', 
  requireAuth, 
  requireRole(['admin']), 
  contentController.syncYouTubeVideos.bind(contentController)
);

router.get('/youtube-channel-info', 
  contentController.getYouTubeChannelInfo.bind(contentController)
);

router.delete('/youtube-videos/:id', 
  requireAuth, 
  requireRole(['admin']), 
  contentController.deleteYouTubeVideo.bind(contentController)
);

/**
 * PHASE 6: News Routes
 * Public access for published content, admin for management
 */
router.get('/news', 
  requireAuth, 
  requireRole(['admin']), 
  contentController.getNews.bind(contentController)
);

router.get('/news/published', 
  contentController.getPublishedNews.bind(contentController)
);

router.get('/news/published/preview', 
  contentController.getPublishedNewsPreview.bind(contentController)
);

router.get('/news/:id', 
  contentController.getNewsById.bind(contentController)
);

router.post('/news', 
  requireAuth, 
  requireRole(['admin']), 
  contentController.createNews.bind(contentController)
);

router.put('/news/:id', 
  requireAuth, 
  requireRole(['admin']), 
  contentController.updateNews.bind(contentController)
);

router.delete('/news/:id', 
  requireAuth, 
  requireRole(['admin']), 
  contentController.deleteNews.bind(contentController)
);

export { router as contentRoutes };