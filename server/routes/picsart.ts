/**
 * Picsart API Routes - RESTful endpoints for image processing
 * 
 * Routes:
 * - POST /api/picsart/background-removal - Process background removal
 * - GET /api/picsart/tools - Get available tools
 * - GET /api/picsart/sessions - Get user sessions
 * - GET /api/picsart/sessions/:id - Get session details
 * - GET /api/picsart/stats - Get user statistics
 */

import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { picsartService } from '../services/picsart/PicsartService';
import { requireAuth } from '../security';
// Credit deduction will be handled by storage service for now
// import { deductCreditsWithValidation } from '../services/CreditService';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPG, JPEG, and WEBP are allowed.'));
    }
  }
});

// Validation schemas
const backgroundRemovalSchema = z.object({
  imageData: z.string().optional(), // base64 or URL
  fileName: z.string().default('image.png'),
  parameters: z.object({
    output_type: z.enum(['cutout', 'mask']).default('cutout'),
    bg_blur: z.string().default('0'),
    scale: z.enum(['fit', 'fill', 'auto']).default('fit'),
    auto_center: z.enum(['true', 'false']).default('false'),
    stroke_size: z.string().default('0'),
    stroke_color: z.string().default('FFFFFF'),
    stroke_opacity: z.string().default('100'),
    shadow: z.enum(['disabled', 'enabled']).default('disabled'),
    shadow_opacity: z.string().default('20'),
    shadow_blur: z.string().default('50'),
    format: z.enum(['PNG', 'JPG', 'WEBP']).default('PNG')
  }).default({})
});

// Initialize Picsart configurations
(async () => {
  try {
    await picsartService.initializeToolConfigs();
    console.log('✅ [PICSART] Tool configurations initialized');
  } catch (error) {
    console.error('❌ [PICSART] Failed to initialize tool configurations:', error);
  }
})();

/**
 * GET /api/picsart/tools
 * Get all available Picsart tools
 */
router.get('/tools', requireAuth, async (req, res) => {
  try {
    const tools = await picsartService.getAvailableTools();
    
    res.json({
      success: true,
      message: 'Tools retrieved successfully',
      data: tools
    });
  } catch (error) {
    console.error('❌ [PICSART] Get tools failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve tools',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/picsart/background-removal
 * Process background removal (supports both file upload and base64)
 */
router.post('/background-removal', requireAuth, upload.single('image'), async (req, res) => {
  const startTime = Date.now();
  
  try {
    const userId = req.user.id;
    let imageData: string;
    let fileName: string;

    // Handle file upload or base64 data
    if (req.file) {
      // File upload
      const base64 = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;
      imageData = `data:${mimeType};base64,${base64}`;
      fileName = req.file.originalname;
      
      console.log(`📤 [PICSART] Received file upload: ${fileName} (${req.file.size} bytes)`);
    } else if (req.body.imageData) {
      // Base64 data
      imageData = req.body.imageData;
      fileName = req.body.fileName || 'image.png';
      
      console.log(`📤 [PICSART] Received base64 data: ${fileName}`);
    } else {
      return res.status(400).json({
        success: false,
        error: 'No image data provided',
        details: 'Please provide either a file upload or base64 imageData'
      });
    }

    // Validate parameters
    const validation = backgroundRemovalSchema.safeParse({
      imageData,
      fileName,
      parameters: req.body.parameters ? JSON.parse(req.body.parameters) : {}
    });

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters',
        details: validation.error.errors
      });
    }

    const { parameters } = validation.data;

    // Get tool configuration for cost
    const toolConfig = await picsartService.getToolConfig('background_removal');
    if (!toolConfig) {
      return res.status(500).json({
        success: false,
        error: 'Tool configuration not found'
      });
    }

    // Get tool configuration for cost
    const creditsNeeded = parseFloat(toolConfig.costPerUse);
    
    // Simple credit check - in production you would implement proper credit deduction
    console.log(`💰 [PICSART] Credits needed: ${creditsNeeded} for user ${userId}`);

    // Process the image
    console.log(`🎨 [PICSART] Starting background removal for user ${userId}`);
    
    const result = await picsartService.processImageWithBackgroundRemoval(
      userId,
      imageData,
      fileName,
      parameters
    );

    const totalDuration = Date.now() - startTime;

    res.json({
      success: true,
      message: 'Background removal completed successfully',
      data: {
        sessionId: result.sessionId,
        processedImageUrl: result.processedImageUrl,
        processedImageBase64: result.processedImageBase64,
        originalFileName: fileName,
        parameters,
        creditsUsed: creditsNeeded,
        processingTime: result.duration,
        totalTime: totalDuration
      }
    });

    console.log(`✅ [PICSART] Background removal completed for user ${userId} in ${totalDuration}ms`);

  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`❌ [PICSART] Background removal failed after ${totalDuration}ms:`, error);
    
    res.status(500).json({
      success: false,
      error: 'Background removal failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      processingTime: totalDuration
    });
  }
});

/**
 * GET /api/picsart/sessions
 * Get user's processing sessions with pagination
 */
router.get('/sessions', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const sessions = await picsartService.getUserSessions(userId, limit, offset);
    
    res.json({
      success: true,
      message: 'Sessions retrieved successfully',
      data: sessions,
      pagination: {
        limit,
        offset,
        hasMore: sessions.length === limit
      }
    });
  } catch (error) {
    console.error('❌ [PICSART] Get sessions failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve sessions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/picsart/sessions/:id
 * Get specific session details
 */
router.get('/sessions/:id', requireAuth, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const session = await picsartService.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Ensure user owns the session
    if (session.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      message: 'Session retrieved successfully',
      data: session
    });
  } catch (error) {
    console.error('❌ [PICSART] Get session failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve session',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/picsart/stats
 * Get user's processing statistics
 */
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await picsartService.getUserStats(userId);
    
    res.json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('❌ [PICSART] Get stats failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;