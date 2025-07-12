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
import { db } from '../db';
import { users, aiImgGenerationLogs } from '../../shared/schema';
import { eq, sql, and, ilike, desc } from 'drizzle-orm';
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

// Logo generation validation schema
const logoGenerationSchema = z.object({
  brandName: z.string().min(1, 'Brand name is required'),
  businessDescription: z.string().min(1, 'Business description is required'),
  colorTone: z.enum(['Auto', 'Gray', 'Blue', 'Pink', 'Orange', 'Brown', 'Yellow', 'Green', 'Purple', 'Red']).default('Auto'),
  logoDescription: z.string().optional(),
  referenceImage: z.string().optional(), // base64 encoded image
  referenceImageUrl: z.string().optional(),
  count: z.number().int().min(1).max(10).default(2)
});

// Logo history query schema
const logoHistorySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
  search: z.string().optional()
});

// Ultra enhance validation schema - handle FormData string conversion properly
const ultraEnhanceSchema = z.object({
  upscale_factor: z.union([
    z.number(),
    z.string().transform(val => parseInt(val, 10))
  ]).refine(val => val >= 2 && val <= 16, {
    message: "Upscale factor must be between 2 and 16"
  }).default(2),
  format: z.enum(['JPG', 'PNG', 'WEBP']).default('JPG')
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
    console.log(`💰 [PICSART] Credits needed: ${creditsNeeded} for user ${userId}`);

    // Check user credits first
    const userCredits = await db.select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userCredits.length) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const currentCredits = parseFloat(userCredits[0].credits || '0');
    
    if (currentCredits < creditsNeeded) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient credits',
        details: `You need ${creditsNeeded} credits but only have ${currentCredits}`,
        creditsNeeded,
        currentCredits
      });
    }

    // Deduct credits before processing
    await db.update(users)
      .set({ 
        credits: (currentCredits - creditsNeeded).toString(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    console.log(`💰 [PICSART] Credits deducted: ${creditsNeeded} (${currentCredits} → ${currentCredits - creditsNeeded})`);

    // Process the image
    console.log(`🎨 [PICSART] Starting background removal for user ${userId}`);
    
    const result = await picsartService.processImageWithBackgroundRemoval(
      userId,
      imageData,
      fileName,
      parameters
    );

    const totalDuration = Date.now() - startTime;

    // Log the usage in ai_img_generation_logs table
    try {
      await db.insert(aiImgGenerationLogs).values({
        userId,
        provider: 'picsart',
        model: 'removebg',
        feature: 'background_removal',
        originalImageName: fileName,
        generatedImageUrl: result.processedImageUrl,
        prompt: 'Background removal processing',
        status: 'success',
        cost: creditsNeeded.toString(),
        creditsUsed: creditsNeeded.toString(),
        duration: totalDuration,
        sessionId: result.sessionId,
        metadata: JSON.stringify({
          parameters,
          originalFileName: fileName,
          processingTime: result.duration,
          totalTime: totalDuration
        })
      });
      
      console.log(`📋 [PICSART] Usage logged for user ${userId}`);
    } catch (logError) {
      console.error(`❌ [PICSART] Failed to log usage:`, logError);
    }

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
    
    // Refund credits if processing failed
    try {
      const toolConfig = await picsartService.getToolConfig('background_removal');
      if (toolConfig) {
        const creditsNeeded = parseFloat(toolConfig.costPerUse);
        const userCredits = await db.select({ credits: users.credits })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        
        if (userCredits.length) {
          const currentCredits = parseFloat(userCredits[0].credits || '0');
          await db.update(users)
            .set({ 
              credits: (currentCredits + creditsNeeded).toString(),
              updatedAt: new Date()
            })
            .where(eq(users.id, userId));
          
          console.log(`💰 [PICSART] Credits refunded: ${creditsNeeded} (${currentCredits} → ${currentCredits + creditsNeeded})`);
        }
      }
    } catch (refundError) {
      console.error(`❌ [PICSART] Failed to refund credits:`, refundError);
    }

    // Log the failed usage
    try {
      await db.insert(aiImgGenerationLogs).values({
        userId,
        provider: 'picsart',
        model: 'removebg',
        feature: 'background_removal',
        originalImageName: fileName,
        prompt: 'Background removal processing',
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        cost: '0',
        creditsUsed: '0',
        duration: totalDuration,
        metadata: JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          processingTime: totalDuration
        })
      });
    } catch (logError) {
      console.error(`❌ [PICSART] Failed to log failed usage:`, logError);
    }
    
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
 * POST /api/picsart/logo-generation
 * Generate logos with AI-powered design
 */
router.post('/logo-generation', requireAuth, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const userId = req.user.id;
    console.log(`🎨 [PICSART] Logo generation request from user ${userId}`);
    
    // Validate request body
    const validation = logoGenerationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters',
        details: validation.error.errors
      });
    }
    
    const { brandName, businessDescription, colorTone, logoDescription, referenceImage, referenceImageUrl, count } = validation.data;
    
    // Get tool configuration for cost
    const toolConfig = await picsartService.getToolConfig('logo_generation');
    if (!toolConfig) {
      return res.status(500).json({
        success: false,
        error: 'Tool configuration not found'
      });
    }
    
    const creditsPerLogo = parseFloat(toolConfig.costPerUse);
    const creditsNeeded = creditsPerLogo * count;
    console.log(`💰 [PICSART] Credits needed: ${creditsPerLogo} × ${count} logos = ${creditsNeeded} for user ${userId}`);
    
    // Check user credits
    const userCredits = await db.select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!userCredits.length) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const currentCredits = parseFloat(userCredits[0].credits || '0');
    
    if (currentCredits < creditsNeeded) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient credits',
        details: `You need ${creditsNeeded} credits but only have ${currentCredits}`,
        creditsNeeded,
        currentCredits
      });
    }
    
    // Deduct credits before processing
    await db.update(users)
      .set({ 
        credits: (currentCredits - creditsNeeded).toString(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    console.log(`💰 [PICSART] Credits deducted: ${creditsNeeded} (${currentCredits} → ${currentCredits - creditsNeeded})`);
    
    // Prepare parameters for logo generation
    const parameters = {
      brand_name: brandName,
      business_description: businessDescription,
      color_tone: colorTone,
      logo_description: logoDescription,
      reference_image: referenceImage,
      reference_image_url: referenceImageUrl,
      count
    };
    
    // Process logo generation
    console.log(`🎨 [PICSART] Starting logo generation for user ${userId}`);
    const result = await picsartService.processLogoGeneration(userId, parameters);
    
    const totalDuration = Date.now() - startTime;
    
    // Log the usage
    try {
      await db.insert(aiImgGenerationLogs).values({
        userId,
        provider: 'picsart',
        model: 'logo-gen-v1',
        feature: 'logo_generation',
        originalImageName: `logo_${brandName}_${Date.now()}`,
        generatedImageUrl: result.logos[0]?.url || '',
        prompt: `Brand: ${brandName}, Business: ${businessDescription}`,
        status: 'success',
        cost: creditsNeeded.toString(),
        creditsUsed: creditsNeeded.toString(),
        duration: totalDuration,
        sessionId: result.sessionId,
        metadata: JSON.stringify({
          parameters,
          logosGenerated: result.logos.length,
          logoUrls: result.logos.map(l => l.url),
          processingTime: result.duration,
          totalTime: totalDuration
        })
      });
      
      console.log(`📋 [PICSART] Usage logged for user ${userId}`);
    } catch (logError) {
      console.error(`❌ [PICSART] Failed to log usage:`, logError);
    }
    
    res.json({
      success: true,
      message: 'Logo generation completed successfully',
      data: {
        sessionId: result.sessionId,
        logos: result.logos,
        brandName,
        businessDescription,
        parameters,
        creditsUsed: creditsNeeded,
        processingTime: result.duration,
        totalTime: totalDuration
      }
    });
    
    console.log(`✅ [PICSART] Logo generation completed for user ${userId} in ${totalDuration}ms`);
    
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    const userId = req.user.id; // Re-declare userId for error handling scope
    console.error(`❌ [PICSART] Logo generation failed after ${totalDuration}ms:`, error);
    
    // Refund credits if processing failed
    try {
      const toolConfig = await picsartService.getToolConfig('logo_generation');
      if (toolConfig) {
        const creditsNeeded = parseFloat(toolConfig.costPerUse);
        const userCredits = await db.select({ credits: users.credits })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        
        if (userCredits.length) {
          const currentCredits = parseFloat(userCredits[0].credits || '0');
          await db.update(users)
            .set({ 
              credits: (currentCredits + creditsNeeded).toString(),
              updatedAt: new Date()
            })
            .where(eq(users.id, userId));
          
          console.log(`💰 [PICSART] Credits refunded: ${creditsNeeded} (${currentCredits} → ${currentCredits + creditsNeeded})`);
        }
      }
    } catch (refundError) {
      console.error(`❌ [PICSART] Failed to refund credits:`, refundError);
    }
    
    // Log the failed usage
    try {
      await db.insert(aiImgGenerationLogs).values({
        userId,
        provider: 'picsart',
        model: 'logo-gen-v1',
        feature: 'logo_generation',
        originalImageName: `logo_${req.body.brandName}_${Date.now()}`,
        prompt: `Brand: ${req.body.brandName}, Business: ${req.body.businessDescription}`,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        cost: '0',
        creditsUsed: '0',
        duration: totalDuration,
        metadata: JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          processingTime: totalDuration
        })
      });
    } catch (logError) {
      console.error(`❌ [PICSART] Failed to log failed usage:`, logError);
    }
    
    res.status(500).json({
      success: false,
      error: 'Logo generation failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      processingTime: totalDuration
    });
  }
});

/**
 * GET /api/picsart/logo-history
 * Get user's logo generation history with pagination and search
 */
router.get('/logo-history', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const search = req.query.search as string;
    const offset = (page - 1) * limit;

    console.log(`📋 [PICSART] Getting logo history for user ${userId} (page ${page}, limit ${limit})`);

    // Base query conditions
    let whereConditions = and(
      eq(aiImgGenerationLogs.userId, userId),
      eq(aiImgGenerationLogs.feature, 'logo_generation')
    );

    // Add search condition if provided
    if (search && search.trim()) {
      whereConditions = and(
        whereConditions,
        sql`(${aiImgGenerationLogs.prompt} ILIKE ${`%${search}%`} OR ${aiImgGenerationLogs.originalImageName} ILIKE ${`%${search}%`})`
      );
    }

    const logoHistory = await db.select({
      id: aiImgGenerationLogs.id,
      originalImageName: aiImgGenerationLogs.originalImageName,
      generatedImageUrl: aiImgGenerationLogs.generatedImageUrl,
      prompt: aiImgGenerationLogs.prompt,
      status: aiImgGenerationLogs.status,
      cost: aiImgGenerationLogs.cost,
      creditsUsed: aiImgGenerationLogs.creditsUsed,
      duration: aiImgGenerationLogs.duration,
      sessionId: aiImgGenerationLogs.sessionId,
      metadata: aiImgGenerationLogs.metadata,
      createdAt: aiImgGenerationLogs.createdAt
    })
    .from(aiImgGenerationLogs)
    .where(whereConditions)
    .orderBy(desc(aiImgGenerationLogs.createdAt))
    .limit(limit)
    .offset(offset);

    // Get total count for pagination
    const totalResult = await db.select({ count: sql<number>`count(*)` })
      .from(aiImgGenerationLogs)
      .where(whereConditions);

    const totalCount = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    // Process metadata to extract additional info
    const processedHistory = logoHistory.map(item => {
      let parsedMetadata = {};
      let logoUrls: string[] = [];
      
      try {
        parsedMetadata = JSON.parse(item.metadata || '{}');
        logoUrls = (parsedMetadata as any).logoUrls || [];
      } catch (e) {
        console.warn('Failed to parse metadata:', e);
      }

      // Extract brand name from prompt
      const brandMatch = item.prompt?.match(/Brand: ([^,]+)/);
      const brandName = brandMatch ? brandMatch[1] : 'Unknown Brand';

      // Extract business description from prompt
      const businessMatch = item.prompt?.match(/Business: (.+)$/);
      const businessDescription = businessMatch ? businessMatch[1] : '';

      return {
        ...item,
        brandName,
        businessDescription,
        logoUrls,
        parsedMetadata,
        formattedDate: new Date(item.createdAt).toLocaleString('pt-BR'),
        formattedCost: parseFloat(item.cost || '0').toFixed(2)
      };
    });

    res.json({
      success: true,
      message: 'Logo history retrieved successfully',
      data: {
        logos: processedHistory,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasMore,
          hasPrevious: page > 1
        }
      }
    });

    console.log(`✅ [PICSART] Logo history retrieved: ${logoHistory.length} items for user ${userId}`);

  } catch (error) {
    console.error('❌ [PICSART] Get logo history failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve logo history',
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

/**
 * POST /api/picsart/ultra-enhance
 * Process ultra enhance (upscale) for images
 */
router.post('/ultra-enhance', requireAuth, upload.single('image'), async (req, res) => {
  const startTime = Date.now();
  
  try {
    const userId = req.user.id;
    console.log(`🎨 [PICSART] Ultra enhance request from user ${userId}`);
    
    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided',
        details: 'Please upload an image file to enhance'
      });
    }
    
    // Debug what we're receiving
    console.log(`🔍 [PICSART] Request body:`, req.body);
    console.log(`🔍 [PICSART] upscale_factor type:`, typeof req.body.upscale_factor);
    console.log(`🔍 [PICSART] upscale_factor value:`, req.body.upscale_factor);
    
    // Validate parameters
    const validation = ultraEnhanceSchema.safeParse(req.body);
    if (!validation.success) {
      console.log(`❌ [PICSART] Validation failed:`, validation.error.errors);
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters',
        details: validation.error.errors
      });
    }
    
    const { upscale_factor, format } = validation.data;
    
    // Get tool configuration for cost
    const toolConfig = await picsartService.getToolConfig('ultra_enhance');
    if (!toolConfig) {
      return res.status(500).json({
        success: false,
        error: 'Tool configuration not found'
      });
    }
    
    const creditsNeeded = parseFloat(toolConfig.costPerUse);
    console.log(`💰 [PICSART] Credits needed: ${creditsNeeded} for ultra enhance`);
    
    // Check user credits
    const userCredits = await db.select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!userCredits.length) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const currentCredits = parseFloat(userCredits[0].credits || '0');
    
    if (currentCredits < creditsNeeded) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient credits',
        details: `You need ${creditsNeeded} credits but only have ${currentCredits}`,
        creditsNeeded,
        currentCredits
      });
    }
    
    // Deduct credits before processing
    await db.update(users)
      .set({ 
        credits: (currentCredits - creditsNeeded).toString(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    console.log(`💰 [PICSART] Credits deducted: ${creditsNeeded} (${currentCredits} → ${currentCredits - creditsNeeded})`);
    
    // Process ultra enhance
    const result = await picsartService.processUltraEnhance(
      userId,
      req.file.buffer,
      req.file.originalname,
      { upscale_factor, format }
    );
    
    const totalDuration = Date.now() - startTime;
    
    // Log the usage
    try {
      await db.insert(aiImgGenerationLogs).values({
        userId,
        provider: 'picsart',
        model: 'ultra-enhance-v1',
        feature: 'ultra_enhance',
        originalImageName: req.file.originalname,
        generatedImageUrl: result.processedImageUrl,
        prompt: `Ultra enhance - upscale factor: ${upscale_factor}, format: ${format}`,
        status: 'success',
        cost: creditsNeeded.toString(),
        creditsUsed: creditsNeeded.toString(),
        duration: totalDuration,
        sessionId: result.sessionId,
        metadata: JSON.stringify({
          upscale_factor,
          format,
          originalFileName: req.file.originalname,
          originalFileSize: req.file.size,
          processingTime: result.duration,
          totalTime: totalDuration
        })
      });
      
      console.log(`📋 [PICSART] Usage logged for user ${userId}`);
    } catch (logError) {
      console.error(`❌ [PICSART] Failed to log usage:`, logError);
    }
    
    return res.json({
      success: true,
      data: {
        processedImageUrl: result.processedImageUrl,
        processedImageData: result.processedImageData,
        sessionId: result.sessionId,
        duration: result.duration
      },
      processingTime: totalDuration
    });
    
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`❌ [PICSART] Ultra enhance error after ${totalDuration}ms:`, error);
    
    // Refund credits on failure
    try {
      const toolConfig = await picsartService.getToolConfig('ultra_enhance');
      if (toolConfig) {
        const creditsToRefund = parseFloat(toolConfig.costPerUse);
        
        const userCredits = await db.select({ credits: users.credits })
          .from(users)
          .where(eq(users.id, req.user.id))
          .limit(1);
        
        if (userCredits.length) {
          const currentCredits = parseFloat(userCredits[0].credits || '0');
          
          await db.update(users)
            .set({ 
              credits: (currentCredits + creditsToRefund).toString(),
              updatedAt: new Date()
            })
            .where(eq(users.id, req.user.id));
          
          console.log(`💰 [PICSART] Credits refunded: ${creditsToRefund} (${currentCredits} → ${currentCredits + creditsToRefund})`);
        }
      }
    } catch (refundError) {
      console.error(`❌ [PICSART] Failed to refund credits:`, refundError);
    }
    
    return res.status(500).json({
      success: false,
      error: 'Ultra enhance processing failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      processingTime: totalDuration
    });
  }
});

export default router;