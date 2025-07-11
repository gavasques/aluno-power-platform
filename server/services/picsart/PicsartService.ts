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
        description: 'Remove backgrounds from images with AI precision',
        endpoint: '/v1/remove-background',
        parametersSchema: {
          output_type: 'cutout',
          bg_blur: '0',
          scale: 'fit',
          auto_center: 'false',
          stroke_size: '0',
          stroke_color: 'FFFFFF',
          stroke_opacity: '100',
          shadow: 'disabled',
          shadow_opacity: '20',
          shadow_blur: '50',
          format: 'PNG'
        },
        costPerUse: '5.00',
        maxFileSize: 10485760, // 10MB
        allowedFormats: ['PNG', 'JPG', 'JPEG']
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
      .orderBy(picsartToolConfigs.displayName);
  }

  /**
   * Get tool configuration by name
   */
  async getToolConfig(toolName: string): Promise<PicsartToolConfig | null> {
    const result = await db
      .select()
      .from(picsartToolConfigs)
      .where(and(
        eq(picsartToolConfigs.toolName, toolName),
        eq(picsartToolConfigs.isActive, true)
      ))
      .limit(1);

    return result[0] || null;
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
   * Process background removal
   */
  async processBackgroundRemoval(
    imageUrl: string,
    params: BackgroundRemovalParams = {}
  ): Promise<PicsartAPIResponse> {
    const startTime = Date.now();

    try {
      console.log(`🎨 [PICSART] Starting background removal for: ${imageUrl}`);

      const response = await fetch(`${this.baseUrl}/v1/remove-background`, {
        method: 'POST',
        headers: {
          'X-Picsart-API-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageUrl,
          ...params
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
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
      // Remove data URL prefix if present
      const base64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
      const buffer = Buffer.from(base64, 'base64');

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = crypto.randomBytes(8).toString('hex');
      const extension = fileName.split('.').pop() || 'png';
      const uniqueFileName = `picsart_${userId}_${timestamp}_${randomId}.${extension}`;

      // In a real implementation, you would upload to cloud storage (S3, Cloudinary, etc.)
      // For now, we'll save to the uploads directory
      const fs = require('fs').promises;
      const path = require('path');
      const uploadsDir = path.join(process.cwd(), 'uploads', 'picsart');
      
      // Ensure uploads directory exists
      await fs.mkdir(uploadsDir, { recursive: true });
      
      const filePath = path.join(uploadsDir, uniqueFileName);
      await fs.writeFile(filePath, buffer);

      // Return URL that can be accessed by Picsart
      const fileUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/picsart/${uniqueFileName}`;
      
      console.log(`📤 [PICSART] Uploaded image: ${fileUrl}`);
      return fileUrl;
    } catch (error) {
      console.error('❌ [PICSART] Image upload failed:', error);
      throw new Error('Failed to upload image');
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
      // Step 1: Upload image if it's base64
      let imageUrl = imageData;
      if (imageData.startsWith('data:')) {
        imageUrl = await this.uploadBase64Image(imageData, fileName, userId);
      }

      // Step 2: Create processing session
      sessionId = await this.createSession({
        userId,
        tool: 'background_removal',
        originalImageUrl: imageUrl,
        originalFileName: fileName,
        parameters
      });

      // Step 3: Process with Picsart API
      const toolConfig = await this.getToolConfig('background_removal');
      const finalParams = { ...toolConfig?.defaultParameters, ...parameters };
      
      const result = await this.processBackgroundRemoval(imageUrl, finalParams);

      // Step 4: Download processed image as base64
      const processedBase64 = await this.downloadImageAsBase64(result.data.url);

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