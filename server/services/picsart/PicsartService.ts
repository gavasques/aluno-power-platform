/**
 * Picsart Integration Service - Comprehensive image processing system
 * 
 * Features:
 * - Background removal and image enhancement
 * - Modular API integration for multiple Picsart tools
 * - Session management and processing tracking
 * - Cost and credits management
 * - File upload and download handling
 * - Base64 image processing
 */

import { db } from '../../db';
import { picsartSessions, picsartToolConfigs } from '@shared/schema';
import type { InsertPicsartSession, PicsartSession, PicsartToolConfig } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

interface PicsartAPIResponse {
  data: {
    id: string;
    url: string;
  };
  status: string;
}

interface BackgroundRemovalParams {
  output_type?: 'cutout' | 'mask';
  bg_blur?: string;
  scale?: 'fit' | 'fill' | 'auto';
  auto_center?: 'true' | 'false';
  stroke_size?: string;
  stroke_color?: string;
  stroke_opacity?: string;
  shadow?: 'disabled' | 'enabled';
  shadow_opacity?: string;
  shadow_blur?: string;
  format?: 'PNG' | 'JPG' | 'WEBP';
}

interface LogoGenerationParams {
  brand_name: string;
  business_description: string;
  color_tone?: 'Auto' | 'Gray' | 'Blue' | 'Pink' | 'Orange' | 'Brown' | 'Yellow' | 'Green' | 'Purple' | 'Red';
  logo_description?: string;
  reference_image?: string; // base64 encoded image
  reference_image_url?: string;
  reference_image_id?: string;
  count?: number; // 1-10, defaults to 2
}

interface UltraEnhanceParams {
  upscale_factor?: number; // 2-16, defaults to 2
  format?: 'JPG' | 'PNG' | 'WEBP'; // defaults to JPG
}

interface ProcessingOptions {
  userId: number;
  tool: string;
  originalImageUrl: string;
  originalFileName: string;
  parameters: Record<string, any>;
}

export class PicsartService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.picsart.io';

  constructor() {
    this.apiKey = process.env.PICSART_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('PICSART_API_KEY is required');
    }
  }

  /**
   * Initialize tool configurations in database
   */
  async initializeToolConfigs(): Promise<void> {
    const defaultConfigs = [
      {
        toolName: 'background_removal',
        displayName: 'Remover de Fundo PRO',
        description: 'Remove backgrounds from images with AI precision',
        endpoint: '/v1/remove-background',
        defaultParameters: {
          output_type: 'cutout',
          format: 'PNG'
        },
        costPerUse: '2.00',
        category: 'image_editing',
        supportedFormats: ['PNG', 'JPG', 'JPEG'],
        maxFileSize: 10485760 // 10MB
      },
      {
        toolName: 'logo_generation',
        displayName: 'Gerador de Logomarcas PRO',
        description: 'Generate professional logos with AI-powered design',
        endpoint: '/v1/logo',
        defaultParameters: {
          color_tone: 'Auto',
          count: 2
        },
        costPerUse: '3.00',
        category: 'ai_design',
        supportedFormats: ['PNG', 'JPG'],
        maxFileSize: 5242880 // 5MB for reference images
      },
      {
        toolName: 'ultra_enhance',
        displayName: 'Ultra Melhorador PRO',
        description: 'Enhance and upscale images with AI-powered ultra enhancement',
        endpoint: '/tools/1.0/upscale/enhance',
        defaultParameters: {
          upscale_factor: 2,
          format: 'JPG'
        },
        costPerUse: '4.00',
        category: 'ai_enhancement',
        supportedFormats: ['PNG', 'JPG', 'WEBP'],
        maxFileSize: 10485760 // 10MB for upscaling
      },
      {
        toolName: 'upscale_pro',
        displayName: 'Upscale PRO',
        description: 'Professional image upscaling with AI-powered enhancement (up to 8x)',
        endpoint: '/tools/1.0/upscale',
        defaultParameters: {
          upscale_factor: 2,
          format: 'PNG'
        },
        costPerUse: '4.00',
        category: 'ai_enhancement',
        supportedFormats: ['PNG', 'JPG', 'WEBP'],
        maxFileSize: 10485760 // 10MB for upscaling
      }
    ];

    for (const config of defaultConfigs) {
      const exists = await db
        .select()
        .from(picsartToolConfigs)
        .where(eq(picsartToolConfigs.toolName, config.toolName))
        .limit(1);

      if (exists.length === 0) {
        await db.insert(picsartToolConfigs).values(config);
        console.log(`✅ [PICSART] Initialized tool config: ${config.toolName}`);
      }
    }
  }

  /**
   * Get all available tools
   */
  async getAvailableTools(): Promise<PicsartToolConfig[]> {
    return await db
      .select()
      .from(picsartToolConfigs)
      .where(eq(picsartToolConfigs.isActive, true))
      .orderBy(picsartToolConfigs.toolName);
  }

  /**
   * Get tool configuration by name
   */
  async getToolConfig(toolName: string): Promise<PicsartToolConfig | null> {
    try {
      console.log(`🔍 [PICSART] Getting tool config for: ${toolName}`);
      
      const result = await db
        .select({
          id: picsartToolConfigs.id,
          toolName: picsartToolConfigs.toolName,
          displayName: picsartToolConfigs.displayName,
          description: picsartToolConfigs.description,
          endpoint: picsartToolConfigs.endpoint,
          defaultParameters: picsartToolConfigs.defaultParameters,
          costPerUse: picsartToolConfigs.costPerUse,
          isActive: picsartToolConfigs.isActive,
          category: picsartToolConfigs.category,
          supportedFormats: picsartToolConfigs.supportedFormats,
          maxFileSize: picsartToolConfigs.maxFileSize,
          processingTime: picsartToolConfigs.processingTime,
          createdAt: picsartToolConfigs.createdAt,
          updatedAt: picsartToolConfigs.updatedAt,
        })
        .from(picsartToolConfigs)
        .where(and(
          eq(picsartToolConfigs.toolName, toolName),
          eq(picsartToolConfigs.isActive, true)
        ))
        .limit(1);

      console.log(`✅ [PICSART] Tool config query result:`, result);
      return result[0] || null;
    } catch (error) {
      console.error(`❌ [PICSART] Error getting tool config for ${toolName}:`, error);
      return null;
    }
  }

  /**
   * Create new processing session
   */
  async createSession(options: ProcessingOptions): Promise<string> {
    const sessionId = crypto.randomUUID();
    
    const sessionData: InsertPicsartSession = {
      id: sessionId,
      userId: options.userId,
      tool: options.tool,
      status: 'processing',
      originalImageUrl: options.originalImageUrl,
      originalFileName: options.originalFileName,
      parameters: options.parameters,
      metadata: {
        userAgent: 'Aluno Power Platform',
        processingStarted: new Date().toISOString()
      }
    };

    await db.insert(picsartSessions).values(sessionData);
    
    console.log(`🎨 [PICSART] Created session: ${sessionId} for tool: ${options.tool}`);
    return sessionId;
  }

  /**
   * Update session status and results
   */
  async updateSession(
    sessionId: string, 
    updates: Partial<PicsartSession>
  ): Promise<void> {
    await db
      .update(picsartSessions)
      .set({
        ...updates,
        completedAt: updates.status === 'completed' ? new Date() : undefined
      })
      .where(eq(picsartSessions.id, sessionId));

    console.log(`🔄 [PICSART] Updated session: ${sessionId} - Status: ${updates.status}`);
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<PicsartSession | null> {
    const result = await db
      .select()
      .from(picsartSessions)
      .where(eq(picsartSessions.id, sessionId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Get user sessions with pagination
   */
  async getUserSessions(
    userId: number, 
    limit = 20, 
    offset = 0
  ): Promise<PicsartSession[]> {
    return await db
      .select()
      .from(picsartSessions)
      .where(eq(picsartSessions.userId, userId))
      .orderBy(desc(picsartSessions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Validate image file signature to ensure it's a valid image
   */
  private validateImageBuffer(buffer: Buffer): { isValid: boolean; detectedFormat: string } {
    if (buffer.length < 4) {
      return { isValid: false, detectedFormat: 'unknown' };
    }

    // JPEG: Starts with FF D8 and ends with FF D9
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      return { isValid: true, detectedFormat: 'image/jpeg' };
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (buffer.length >= 8 && 
        buffer[0] === 0x89 && buffer[1] === 0x50 && 
        buffer[2] === 0x4E && buffer[3] === 0x47 &&
        buffer[4] === 0x0D && buffer[5] === 0x0A && 
        buffer[6] === 0x1A && buffer[7] === 0x0A) {
      return { isValid: true, detectedFormat: 'image/png' };
    }

    // WEBP: RIFF....WEBP
    if (buffer.length >= 12 && 
        buffer[0] === 0x52 && buffer[1] === 0x49 && 
        buffer[2] === 0x46 && buffer[3] === 0x46 &&
        buffer[8] === 0x57 && buffer[9] === 0x45 && 
        buffer[10] === 0x42 && buffer[11] === 0x50) {
      return { isValid: true, detectedFormat: 'image/webp' };
    }

    // GIF: GIF87a or GIF89a
    if (buffer.length >= 6 && 
        buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 &&
        ((buffer[3] === 0x38 && buffer[4] === 0x37 && buffer[5] === 0x61) ||
         (buffer[3] === 0x38 && buffer[4] === 0x39 && buffer[5] === 0x61))) {
      return { isValid: true, detectedFormat: 'image/gif' };
    }

    return { isValid: false, detectedFormat: 'unknown' };
  }

  /**
   * Process background removal with direct file upload
   */
  async processBackgroundRemoval(
    imagePath: string,
    params: BackgroundRemovalParams = {}
  ): Promise<PicsartAPIResponse> {
    const startTime = Date.now();

    try {
      console.log(`🎨 [PICSART] Starting background removal for file: ${imagePath}`);

      // Read the image file
      const fs = await import('fs');
      const path = await import('path');
      
      if (!fs.existsSync(imagePath)) {
        throw new Error(`Image file not found: ${imagePath}`);
      }

      const imageBuffer = fs.readFileSync(imagePath);
      const fileName = path.basename(imagePath);
      
      console.log(`📤 [PICSART] Uploading image file: ${fileName} (${imageBuffer.length} bytes)`);

      // Validate the image buffer
      const validation = this.validateImageBuffer(imageBuffer);
      if (!validation.isValid) {
        throw new Error(`Invalid image format. File appears to be corrupted or not a valid image.`);
      }
      
      console.log(`✅ [PICSART] Image validation passed: ${validation.detectedFormat}`);

      // Create FormData for multipart/form-data with direct file upload
      const formData = new FormData();
      
      // Use detected mime type from validation
      const mimeType = validation.detectedFormat;
      
      console.log(`📤 [PICSART] Using mime type: ${mimeType} for file: ${fileName}`);
      
      // Create a proper File object instead of Blob for better compatibility
      const file = new File([imageBuffer], fileName, { type: mimeType });
      formData.append('image', file);
      formData.append('output_type', params.output_type || 'cutout');
      formData.append('format', params.format || 'PNG');
      
      // Add additional safe parameters
      const safeParams = ['bg_blur', 'scale', 'auto_center', 'stroke_size', 'stroke_color', 'stroke_opacity', 'shadow', 'shadow_opacity', 'shadow_blur'];
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && safeParams.includes(key)) {
          formData.append(key, String(value));
        }
      });

      const response = await fetch(`${this.baseUrl}/tools/1.0/removebg`, {
        method: 'POST',
        headers: {
          'X-Picsart-API-Key': this.apiKey,
          // Don't set Content-Type - let fetch set it automatically for FormData
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [PICSART] API Error Response:`, errorText);
        throw new Error(`Picsart API error: ${response.status} - ${errorText}`);
      }

      const result: PicsartAPIResponse = await response.json();
      const duration = Date.now() - startTime;

      console.log(`✅ [PICSART] Background removal completed in ${duration}ms`);
      console.log(`🖼️ [PICSART] Result URL: ${result.data.url}`);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ [PICSART] Background removal failed after ${duration}ms:`, error);
      throw error;
    }
  }

  /**
   * Convert base64 image to URL (upload to temporary storage)
   */
  async uploadBase64Image(
    base64Data: string,
    fileName: string,
    userId: number
  ): Promise<string> {
    try {
      console.log(`📤 [PICSART] Starting image upload for user ${userId}, file: ${fileName}`);
      console.log(`📤 [PICSART] Raw base64Data length: ${base64Data.length}`);
      console.log(`📤 [PICSART] Base64Data starts with: ${base64Data.substring(0, 50)}...`);
      
      // Extract mime type and remove data URL prefix
      const mimeMatch = base64Data.match(/^data:image\/([a-z]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'jpeg';
      const base64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
      
      console.log(`📤 [PICSART] Detected mime type: ${mimeType}`);
      console.log(`📤 [PICSART] Clean base64 data length: ${base64.length}`);
      console.log(`📤 [PICSART] Clean base64 starts with: ${base64.substring(0, 50)}...`);
      
      const buffer = Buffer.from(base64, 'base64');
      console.log(`📤 [PICSART] Buffer size: ${buffer.length} bytes`);
      
      // Debug: Log first few bytes of the buffer to understand the issue
      const firstBytes = Array.from(buffer.slice(0, 16)).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' ');
      console.log(`🔍 [PICSART] Buffer first 16 bytes: ${firstBytes}`);
      
      // Validate image buffer using file signature
      const validation = this.validateImageBuffer(buffer);
      console.log(`🔍 [PICSART] Validation result:`, validation);
      
      if (!validation.isValid) {
        console.error(`❌ [PICSART] Image validation failed. Buffer size: ${buffer.length}, First bytes: ${firstBytes}`);
        throw new Error(`Invalid image format. File appears to be corrupted or not a valid image.`);
      }
      
      console.log(`✅ [PICSART] Image validation passed: ${validation.detectedFormat}`);
      
      // Use the detected format instead of the declared mime type for better accuracy
      const detectedType = validation.detectedFormat.split('/')[1]; // Extract 'jpeg', 'png', etc.
      
      // Validate image format
      if (!['jpeg', 'png', 'webp', 'gif'].includes(detectedType.toLowerCase())) {
        throw new Error(`Unsupported image format: ${detectedType}. Supported formats: JPG, PNG, WEBP, GIF`);
      }

      // Ensure proper file extension based on detected format
      const ext = path.extname(fileName);
      const properExtension = detectedType === 'png' ? '.png' : 
                             detectedType === 'webp' ? '.webp' : 
                             detectedType === 'gif' ? '.gif' : '.jpg';
      
      if (!ext) {
        fileName = `${fileName}${properExtension}`;
      } else if (ext.toLowerCase() !== properExtension) {
        // Replace extension with the correct one based on actual format
        fileName = fileName.replace(/\.[^/.]+$/, properExtension);
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = crypto.randomBytes(8).toString('hex');
      const extension = properExtension.substring(1); // Remove the dot
      const uniqueFileName = `picsart_${userId}_${timestamp}_${randomId}.${extension}`;
      console.log(`📤 [PICSART] Generated filename: ${uniqueFileName} (original: ${fileName})`);

      // In a real implementation, you would upload to cloud storage (S3, Cloudinary, etc.)
      // For now, we'll save to the uploads directory
      const uploadsDir = path.join(process.cwd(), 'uploads', 'picsart');
      console.log(`📤 [PICSART] Uploads directory: ${uploadsDir}`);
      
      // Ensure uploads directory exists
      await fs.mkdir(uploadsDir, { recursive: true });
      console.log(`📤 [PICSART] Directory created/verified`);
      
      const filePath = path.join(uploadsDir, uniqueFileName);
      console.log(`📤 [PICSART] File path: ${filePath}`);
      
      await fs.writeFile(filePath, buffer);
      console.log(`📤 [PICSART] File written successfully`);

      // Return URL that can be accessed by Picsart
      const fileUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/picsart/${uniqueFileName}`;
      
      console.log(`📤 [PICSART] Uploaded image: ${fileUrl}`);
      return fileUrl;
    } catch (error) {
      console.error('❌ [PICSART] Image upload failed:', error);
      console.error('❌ [PICSART] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Download processed image and convert to base64
   */
  async downloadImageAsBase64(imageUrl: string): Promise<string> {
    try {
      console.log(`📥 [PICSART] Downloading image: ${imageUrl}`);

      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      
      // Determine content type from response headers or URL
      const contentType = response.headers.get('content-type') || 'image/png';
      const dataUrl = `data:${contentType};base64,${base64}`;

      console.log(`✅ [PICSART] Downloaded and converted to base64`);
      return dataUrl;
    } catch (error) {
      console.error('❌ [PICSART] Image download failed:', error);
      throw new Error('Failed to download processed image');
    }
  }

  /**
   * Complete background removal process end-to-end
   */
  async processImageWithBackgroundRemoval(
    userId: number,
    imageData: string, // base64 or URL
    fileName: string,
    parameters: BackgroundRemovalParams = {}
  ): Promise<{
    sessionId: string;
    processedImageUrl: string;
    processedImageBase64: string;
    duration: number;
  }> {
    const startTime = Date.now();
    let sessionId: string | null = null;

    try {
      // Step 1: Upload image if it's base64 and get file path
      let imageUrl = imageData;
      let imagePath = '';
      
      if (imageData.startsWith('data:')) {
        imageUrl = await this.uploadBase64Image(imageData, fileName, userId);
        // Convert URL to file path for direct file upload
        const urlParts = imageUrl.split('/');
        imagePath = `uploads/picsart/${urlParts[urlParts.length - 1]}`;
      } else {
        // If imageData is already a path or URL, handle accordingly
        imagePath = imageData;
      }

      console.log(`📁 [PICSART] Using image path: ${imagePath}`);

      // Step 2: Create processing session
      sessionId = await this.createSession({
        userId,
        tool: 'background_removal',
        originalImageUrl: imageUrl,
        originalFileName: fileName,
        parameters
      });

      // Step 3: Process with Picsart API using direct file upload
      const toolConfig = await this.getToolConfig('background_removal');
      const finalParams = { ...toolConfig?.defaultParameters, ...parameters };
      
      const result = await this.processBackgroundRemoval(imagePath, finalParams);

      // Step 4: Download processed image as base64
      const processedImageBase64 = await this.downloadImageAsBase64(result.data.url);

      // Step 5: Update session with results
      const duration = Date.now() - startTime;
      await this.updateSession(sessionId, {
        status: 'completed',
        processedImageUrl: result.data.url,
        picsartJobId: result.data.id,
        duration,
        creditsUsed: toolConfig?.costPerUse || '5.00'
      });

      console.log(`🎉 [PICSART] Complete process finished in ${duration}ms`);

      return {
        sessionId,
        processedImageUrl: result.data.url,
        processedImageBase64,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Update session with error if session was created
      if (sessionId) {
        await this.updateSession(sessionId, {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          duration
        });
      }

      console.error(`💥 [PICSART] Process failed after ${duration}ms:`, error);
      throw error;
    }
  }

  /**
   * Generate logos using Picsart GenAI API
   */
  async generateLogo(parameters: LogoGenerationParams): Promise<{ inference_id: string }> {
    const startTime = Date.now();
    
    try {
      console.log(`🎨 [PICSART] Starting logo generation with parameters:`, parameters);
      
      const formData = new FormData();
      formData.append('brand_name', parameters.brand_name);
      formData.append('business_description', parameters.business_description);
      formData.append('color_tone', parameters.color_tone || 'Auto');
      formData.append('count', (parameters.count || 2).toString());
      
      if (parameters.logo_description) {
        formData.append('logo_description', parameters.logo_description);
      }
      
      if (parameters.reference_image) {
        try {
          // Extract MIME type from base64 string
          const mimeMatch = parameters.reference_image.match(/^data:image\/([a-z]+);base64,/);
          const mimeType = mimeMatch ? `image/${mimeMatch[1]}` : 'image/png';
          const extension = mimeMatch ? mimeMatch[1] : 'png';
          
          // Convert base64 to buffer
          const base64Data = parameters.reference_image.replace(/^data:image\/[a-z]+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          
          // Create a file-like object for FormData
          const fileObject = {
            buffer,
            name: `reference.${extension}`,
            type: mimeType
          };
          
          // Append as stream with proper options
          formData.append('reference_image', buffer, {
            filename: `reference.${extension}`,
            contentType: mimeType
          });
          
          console.log(`📎 [PICSART] Reference image attached: ${mimeType}, ${buffer.length} bytes`);
        } catch (imageError) {
          console.warn(`⚠️ [PICSART] Failed to process reference image:`, imageError);
          // Continue without reference image if processing fails
        }
      }
      
      if (parameters.reference_image_url) {
        formData.append('reference_image_url', parameters.reference_image_url);
      }
      
      if (parameters.reference_image_id) {
        formData.append('reference_image_id', parameters.reference_image_id);
      }

      const response = await fetch('https://genai-api.picsart.io/v1/logo', {
        method: 'POST',
        headers: {
          'X-Picsart-API-Key': this.apiKey,
          'Accept': 'application/json',
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Picsart GenAI API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      const duration = Date.now() - startTime;

      console.log(`✅ [PICSART] Logo generation started in ${duration}ms`);
      console.log(`🎨 [PICSART] Inference ID: ${result.inference_id}`);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ [PICSART] Logo generation failed after ${duration}ms:`, error);
      throw error;
    }
  }

  /**
   * Get logo generation result
   */
  async getLogoResult(inferenceId: string): Promise<{
    status: string;
    data?: Array<{ url: string; id: string }>;
  }> {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 [PICSART] Checking logo generation result for inference: ${inferenceId}`);

      // Use the correct endpoint for status check
      const response = await fetch(`https://genai-api.picsart.io/v1/logo/inferences/${inferenceId}`, {
        method: 'GET',
        headers: {
          'X-Picsart-API-Key': this.apiKey,
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Picsart GenAI API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      const duration = Date.now() - startTime;

      console.log(`✅ [PICSART] Logo result check completed in ${duration}ms`);
      console.log(`🎨 [PICSART] Status: ${result.status}`);
      console.log(`🎨 [PICSART] Response data:`, JSON.stringify(result, null, 2));

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ [PICSART] Logo result check failed after ${duration}ms:`, error);
      throw error;
    }
  }

  /**
   * Process ultra enhance (upscale) for an image
   */
  async processUltraEnhance(userId: number, imageBuffer: Buffer, fileName: string, parameters: UltraEnhanceParams): Promise<{
    success: boolean;
    processedImageUrl: string;
    processedImageData: string;
    sessionId: string;
    duration: number;
  }> {
    const startTime = Date.now();
    const sessionId = await this.createSession({
      userId,
      tool: 'ultra_enhance',
      originalImageUrl: `uploaded://${fileName}`,
      originalFileName: fileName,
      parameters
    });
    
    try {
      console.log(`🎨 [PICSART] Starting ultra enhance processing for user ${userId}`);
      console.log(`🎨 [PICSART] Parameters:`, JSON.stringify(parameters, null, 2));
      
      // Prepare form data for the API
      const formData = new FormData();
      
      // Add image file
      const blob = new Blob([imageBuffer], { 
        type: fileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg' 
      });
      formData.append('image', blob, fileName);
      
      // Add parameters
      formData.append('upscale_factor', String(parameters.upscale_factor || 2));
      formData.append('format', parameters.format || 'JPG');
      
      // Make API request
      const response = await fetch(`${this.baseUrl}/tools/1.0/upscale/enhance`, {
        method: 'POST',
        headers: {
          'X-Picsart-API-Key': this.apiKey,
          'accept': 'application/json'
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Picsart API error: ${response.status} - ${errorText}`);
      }
      
      const result: PicsartAPIResponse = await response.json();
      console.log(`✅ [PICSART] Ultra enhance completed in ${Date.now() - startTime}ms`);
      
      // Download processed image
      const processedImageResponse = await fetch(result.data.url);
      if (!processedImageResponse.ok) {
        throw new Error(`Failed to download processed image: ${processedImageResponse.status}`);
      }
      
      const processedImageBuffer = await processedImageResponse.arrayBuffer();
      const processedImageData = Buffer.from(processedImageBuffer).toString('base64');
      
      // Update session status
      await this.updateSession(sessionId, {
        status: 'completed',
        processedImageUrl: result.data.url,
        picsartJobId: result.data.id,
        duration: Date.now() - startTime
      });
      
      return {
        success: true,
        processedImageUrl: result.data.url,
        processedImageData,
        sessionId,
        duration: Date.now() - startTime
      };
      
    } catch (error) {
      console.error(`❌ [PICSART] Ultra enhance failed after ${Date.now() - startTime}ms:`, error);
      
      // Update session status
      await this.updateSession(sessionId, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }

  /**
   * Process standard upscale (Upscale PRO tool) with image buffer
   */
  async processUpscalePro(userId: number, imageBuffer: Buffer, fileName: string, parameters: UltraEnhanceParams): Promise<{
    success: boolean;
    processedImageUrl: string;
    processedImageData: string;
    sessionId: string;
    duration: number;
  }> {
    const startTime = Date.now();
    const sessionId = await this.createSession({
      userId,
      tool: 'upscale_pro',
      originalImageUrl: `uploaded://${fileName}`,
      originalFileName: fileName,
      parameters
    });
    
    try {
      console.log(`🎨 [PICSART] Starting standard upscale processing for user ${userId}`);
      console.log(`🎨 [PICSART] Parameters:`, JSON.stringify(parameters, null, 2));
      
      // Prepare form data for the API
      const formData = new FormData();
      
      // Add image file
      const blob = new Blob([imageBuffer], { 
        type: fileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg' 
      });
      formData.append('image', blob, fileName);
      
      // Add parameters for standard upscale (max 8x)
      const upscaleFactor = Math.min(parameters.upscale_factor || 2, 8); // Limit to 8x max for standard upscale
      formData.append('upscale_factor', String(upscaleFactor));
      formData.append('format', parameters.format || 'PNG');
      
      // Make API request to standard upscale endpoint
      const response = await fetch(`${this.baseUrl}/tools/1.0/upscale`, {
        method: 'POST',
        headers: {
          'X-Picsart-API-Key': this.apiKey,
          'accept': 'application/json'
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Picsart API error: ${response.status} - ${errorText}`);
      }
      
      const result: PicsartAPIResponse = await response.json();
      console.log(`✅ [PICSART] Standard upscale completed in ${Date.now() - startTime}ms`);
      
      // Download processed image
      const processedImageResponse = await fetch(result.data.url);
      if (!processedImageResponse.ok) {
        throw new Error(`Failed to download processed image: ${processedImageResponse.status}`);
      }
      
      const processedImageBuffer = await processedImageResponse.arrayBuffer();
      const processedImageData = Buffer.from(processedImageBuffer).toString('base64');
      
      // Update session status
      await this.updateSession(sessionId, {
        status: 'completed',
        processedImageUrl: result.data.url,
        picsartJobId: result.data.id,
        duration: Date.now() - startTime
      });
      
      return {
        success: true,
        processedImageUrl: result.data.url,
        processedImageData,
        sessionId,
        duration: Date.now() - startTime
      };
      
    } catch (error) {
      console.error(`❌ [PICSART] Standard upscale failed after ${Date.now() - startTime}ms:`, error);
      
      // Update session status
      await this.updateSession(sessionId, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }

  /**
   * Complete logo generation process end-to-end
   */
  async processLogoGeneration(
    userId: number,
    parameters: LogoGenerationParams
  ): Promise<{
    sessionId: string;
    logos: Array<{ url: string; id: string; base64: string }>;
    duration: number;
  }> {
    const startTime = Date.now();
    let sessionId: string | null = null;

    try {
      // Step 1: Create processing session
      sessionId = await this.createSession({
        userId,
        tool: 'logo_generation',
        originalImageUrl: parameters.reference_image_url || '',
        originalFileName: `logo_${parameters.brand_name}_${Date.now()}.png`,
        parameters
      });

      // Step 2: Start logo generation
      const generationResult = await this.generateLogo(parameters);
      const inferenceId = generationResult.inference_id;

      // Step 3: Poll for results (with timeout)
      let attempts = 0;
      const maxAttempts = 30; // 30 attempts * 2 seconds = 60 seconds max
      let logoResult: any = null;

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        
        logoResult = await this.getLogoResult(inferenceId);
        
        // Check if generation is complete (Picsart uses 'success' status)
        if ((logoResult.status === 'completed' || logoResult.status === 'success') && logoResult.data) {
          console.log(`🎉 [PICSART] Logo generation completed! Found ${logoResult.data.length} logos`);
          break;
        }
        
        if (logoResult.status === 'failed' || logoResult.status === 'error') {
          throw new Error(`Logo generation failed with status: ${logoResult.status}`);
        }
        
        attempts++;
        console.log(`⏳ [PICSART] Logo generation in progress... (${attempts}/${maxAttempts})`);
      }

      if (!logoResult || (logoResult.status !== 'completed' && logoResult.status !== 'success') || !logoResult.data) {
        throw new Error(`Logo generation timed out or failed. Status: ${logoResult?.status}, Has data: ${!!logoResult?.data}`);
      }

      // Step 4: Download all logos as base64
      const logos = await Promise.all(
        logoResult.data.map(async (logo: { url: string; id: string }) => {
          const base64 = await this.downloadImageAsBase64(logo.url);
          return {
            url: logo.url,
            id: logo.id,
            base64
          };
        })
      );

      // Step 5: Update session with results
      const duration = Date.now() - startTime;
      const toolConfig = await this.getToolConfig('logo_generation');
      
      await this.updateSession(sessionId, {
        status: 'completed',
        processedImageUrl: logos[0]?.url || '',
        picsartJobId: inferenceId,
        duration,
        creditsUsed: toolConfig?.costPerUse || '3.00',
        metadata: {
          ...((await this.getSession(sessionId))?.metadata || {}),
          logosGenerated: logos.length,
          logoUrls: logos.map(l => l.url)
        }
      });

      console.log(`🎉 [PICSART] Logo generation process finished in ${duration}ms`);
      console.log(`🎨 [PICSART] Generated ${logos.length} logos`);

      return {
        sessionId,
        logos,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Update session with error if session was created
      if (sessionId) {
        await this.updateSession(sessionId, {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          duration
        });
      }

      console.error(`💥 [PICSART] Logo generation failed after ${duration}ms:`, error);
      throw error;
    }
  }

  /**
   * Get processing statistics for a user
   */
  async getUserStats(userId: number): Promise<{
    totalSessions: number;
    completedSessions: number;
    failedSessions: number;
    totalCreditsUsed: number;
    averageProcessingTime: number;
  }> {
    const sessions = await this.getUserSessions(userId, 1000, 0);
    
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const failedSessions = sessions.filter(s => s.status === 'failed').length;
    const totalCreditsUsed = sessions.reduce((sum, s) => sum + parseFloat(s.creditsUsed || '0'), 0);
    const averageProcessingTime = sessions
      .filter(s => s.duration)
      .reduce((sum, s, _, arr) => sum + (s.duration || 0) / arr.length, 0);

    return {
      totalSessions,
      completedSessions,
      failedSessions,
      totalCreditsUsed,
      averageProcessingTime
    };
  }
}

export const picsartService = new PicsartService();