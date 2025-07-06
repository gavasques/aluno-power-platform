/**
 * ContentController - Phase 6: Content Management Modularization
 * 
 * SOLID Principles Applied:
 * - SRP: Single responsibility for content operations (YouTube videos, news, sync)
 * - OCP: Open for extension without modification of existing code
 * - LSP: Consistent with BaseController interface
 * - ISP: Focused interface for content operations only
 * - DIP: Depends on abstractions (BaseController, storage interfaces)
 * 
 * DRY/KISS Implementation:
 * - Eliminates code duplication from monolithic routes.ts
 * - Consistent error handling and response patterns
 * - Clean, readable, maintainable content logic
 */

import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { ResponseHandler } from '../utils/ResponseHandler';
import { ValidationHelper } from '../utils/ValidationHelper';
import * as storage from '../storage';
import { youtubeService } from '../services/youtubeService';

export class ContentController extends BaseController {
  
  /**
   * PHASE 6: YouTube Videos
   * Get all active YouTube videos
   * 
   * GET /api/youtube-videos
   */
  async getYouTubeVideos(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    console.log('📺 [CONTENT_YOUTUBE] Fetching YouTube videos...');

    try {
      const videos = await storage.getActiveYoutubeVideos();
      
      const duration = Date.now() - startTime;
      console.log(`✅ [CONTENT_YOUTUBE] Videos fetched in ${duration}ms - ${videos.length} videos`);

      ResponseHandler.success(res, videos, 'YouTube videos retrieved successfully');
      
    } catch (error) {
      console.error('❌ [CONTENT_YOUTUBE] Error fetching videos:', error);
      ResponseHandler.error(res, 'Failed to fetch YouTube videos');
    }
  }

  /**
   * PHASE 6: YouTube Video by ID
   * Get specific YouTube video by ID
   * 
   * GET /api/youtube-videos/:id
   */
  async getYouTubeVideoById(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const videoId = req.params.id;
    console.log(`📺 [CONTENT_YOUTUBE_DETAIL] Fetching video: ${videoId}`);

    try {
      const videoIdNumber = ValidationHelper.parseId(videoId);
      const video = await storage.getYoutubeVideo(videoIdNumber);

      if (!video) {
        console.log(`❌ [CONTENT_YOUTUBE_DETAIL] Video not found: ${videoId}`);
        ResponseHandler.notFound(res, 'Video not found');
        return;
      }

      const duration = Date.now() - startTime;
      console.log(`✅ [CONTENT_YOUTUBE_DETAIL] Video fetched in ${duration}ms: ${video.title}`);

      ResponseHandler.success(res, video, 'Video retrieved successfully');
      
    } catch (error) {
      console.error(`❌ [CONTENT_YOUTUBE_DETAIL] Error fetching video ${videoId}:`, error);
      ResponseHandler.error(res, 'Failed to fetch video');
    }
  }

  /**
   * PHASE 6: YouTube Videos Sync
   * Trigger synchronization of YouTube videos
   * 
   * POST /api/youtube-videos/sync
   */
  async syncYouTubeVideos(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    console.log('🔄 [CONTENT_YOUTUBE_SYNC] Starting YouTube sync...');

    try {
      await youtubeService.fetchAndCacheVideos();
      
      const duration = Date.now() - startTime;
      console.log(`✅ [CONTENT_YOUTUBE_SYNC] Sync completed in ${duration}ms`);

      ResponseHandler.success(res, null, 'YouTube videos sync completed');
      
    } catch (error) {
      console.error('❌ [CONTENT_YOUTUBE_SYNC] Error syncing videos:', error);
      ResponseHandler.error(res, 'Failed to sync YouTube videos');
    }
  }

  /**
   * PHASE 6: YouTube Channel Info
   * Get YouTube channel information
   * 
   * GET /api/youtube-channel-info
   */
  async getYouTubeChannelInfo(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    console.log('📊 [CONTENT_CHANNEL_INFO] Fetching channel info...');

    try {
      // Check if YouTube API is available
      if (!process.env.YOUTUBE_API_KEY) {
        ResponseHandler.serviceUnavailable(res, 'YouTube service unavailable', 
          'YouTube API key not configured');
        return;
      }

      const channelInfo = await youtubeService.fetchChannelInfo('@guilhermeavasques');
      
      if (!channelInfo) {
        ResponseHandler.notFound(res, 'Channel not found');
        return;
      }

      const channelData = {
        title: channelInfo.snippet.title,
        subscriberCount: channelInfo.statistics.subscriberCount,
        videoCount: channelInfo.statistics.videoCount,
        viewCount: channelInfo.statistics.viewCount,
        customUrl: channelInfo.snippet.customUrl,
        thumbnails: channelInfo.snippet.thumbnails,
        description: channelInfo.snippet.description,
        channelId: channelInfo.id
      };

      const duration = Date.now() - startTime;
      console.log(`✅ [CONTENT_CHANNEL_INFO] Channel info fetched in ${duration}ms`);

      ResponseHandler.success(res, channelData, 'Channel info retrieved successfully');
      
    } catch (error) {
      console.error('❌ [CONTENT_CHANNEL_INFO] Error fetching channel info:', error);
      ResponseHandler.error(res, 'Failed to fetch channel info');
    }
  }

  /**
   * PHASE 6: Delete YouTube Video
   * Delete YouTube video by ID
   * 
   * DELETE /api/youtube-videos/:id
   */
  async deleteYouTubeVideo(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const videoId = req.params.id;
    console.log(`🗑️ [CONTENT_YOUTUBE_DELETE] Deleting video: ${videoId}`);

    try {
      const videoIdNumber = ValidationHelper.parseId(videoId);
      
      const video = await storage.getYoutubeVideo(videoIdNumber);
      if (!video) {
        ResponseHandler.notFound(res, 'Video not found');
        return;
      }

      await storage.deleteYoutubeVideo(videoIdNumber);

      const duration = Date.now() - startTime;
      console.log(`✅ [CONTENT_YOUTUBE_DELETE] Video deleted in ${duration}ms: ${video.title}`);

      ResponseHandler.success(res, null, 'Video deleted successfully');
      
    } catch (error) {
      console.error(`❌ [CONTENT_YOUTUBE_DELETE] Error deleting video ${videoId}:`, error);
      ResponseHandler.error(res, 'Failed to delete video');
    }
  }

  /**
   * PHASE 6: News Management
   * Get all news articles
   * 
   * GET /api/news
   */
  async getNews(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    console.log('📰 [CONTENT_NEWS] Fetching news...');

    try {
      const news = await storage.getNews();
      
      const duration = Date.now() - startTime;
      console.log(`✅ [CONTENT_NEWS] News fetched in ${duration}ms - ${news.length} articles`);

      ResponseHandler.success(res, news, 'News retrieved successfully');
      
    } catch (error) {
      console.error('❌ [CONTENT_NEWS] Error fetching news:', error);
      ResponseHandler.error(res, 'Failed to fetch news');
    }
  }

  /**
   * PHASE 6: Published News
   * Get all published news articles with caching
   * 
   * GET /api/news/published
   */
  async getPublishedNews(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    console.log('📰 [CONTENT_NEWS_PUBLISHED] Fetching published news...');

    try {
      const news = await storage.getPublishedNews();
      
      // Add caching headers
      res.set({
        'Cache-Control': 'public, max-age=300', // 5 minutes
        'ETag': `"news-${Date.now()}"`,
      });

      const duration = Date.now() - startTime;
      console.log(`✅ [CONTENT_NEWS_PUBLISHED] Published news fetched in ${duration}ms - ${news.length} articles`);

      ResponseHandler.success(res, news, 'Published news retrieved successfully');
      
    } catch (error) {
      console.error('❌ [CONTENT_NEWS_PUBLISHED] Error fetching published news:', error);
      ResponseHandler.error(res, 'Failed to fetch published news');
    }
  }

  /**
   * PHASE 6: Published News Preview
   * Lightweight endpoint for dashboard preview
   * 
   * GET /api/news/published/preview
   */
  async getPublishedNewsPreview(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    console.log('📰 [CONTENT_NEWS_PREVIEW] Fetching news preview...');

    try {
      const news = await storage.getPublishedNewsPreview();
      
      const duration = Date.now() - startTime;
      console.log(`✅ [CONTENT_NEWS_PREVIEW] News preview fetched in ${duration}ms - ${news.length} items`);

      ResponseHandler.success(res, news, 'News preview retrieved successfully');
      
    } catch (error) {
      console.error('❌ [CONTENT_NEWS_PREVIEW] Error fetching news preview:', error);
      ResponseHandler.error(res, 'Failed to fetch news preview');
    }
  }

  /**
   * PHASE 6: News by ID
   * Get specific news article by ID
   * 
   * GET /api/news/:id
   */
  async getNewsById(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const newsId = req.params.id;
    console.log(`📰 [CONTENT_NEWS_DETAIL] Fetching news: ${newsId}`);

    try {
      const newsIdNumber = ValidationHelper.parseId(newsId);
      const newsItem = await storage.getNewsById(newsIdNumber);

      if (!newsItem) {
        console.log(`❌ [CONTENT_NEWS_DETAIL] News not found: ${newsId}`);
        ResponseHandler.notFound(res, 'News article not found');
        return;
      }

      const duration = Date.now() - startTime;
      console.log(`✅ [CONTENT_NEWS_DETAIL] News fetched in ${duration}ms: ${newsItem.title}`);

      ResponseHandler.success(res, newsItem, 'News article retrieved successfully');
      
    } catch (error) {
      console.error(`❌ [CONTENT_NEWS_DETAIL] Error fetching news ${newsId}:`, error);
      ResponseHandler.error(res, 'Failed to fetch news article');
    }
  }

  /**
   * PHASE 6: Create News
   * Create new news article
   * 
   * POST /api/news
   */
  async createNews(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    console.log('➕ [CONTENT_NEWS_CREATE] Creating news article...');

    try {
      const newsData = req.body;
      
      // Validate required fields
      const validationErrors = ValidationHelper.validateNewsData(newsData);
      if (validationErrors.length > 0) {
        ResponseHandler.badRequest(res, 'Validation failed', { errors: validationErrors });
        return;
      }

      const newNews = await storage.createNews(newsData);

      const duration = Date.now() - startTime;
      console.log(`✅ [CONTENT_NEWS_CREATE] News created in ${duration}ms: ${newNews.title}`);

      ResponseHandler.created(res, newNews, 'News article created successfully');
      
    } catch (error) {
      console.error('❌ [CONTENT_NEWS_CREATE] Error creating news:', error);
      ResponseHandler.error(res, 'Failed to create news article');
    }
  }

  /**
   * PHASE 6: Update News
   * Update existing news article
   * 
   * PUT /api/news/:id
   */
  async updateNews(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const newsId = req.params.id;
    console.log(`✏️ [CONTENT_NEWS_UPDATE] Updating news: ${newsId}`);

    try {
      const newsIdNumber = ValidationHelper.parseId(newsId);
      const updateData = req.body;

      const existingNews = await storage.getNewsById(newsIdNumber);
      if (!existingNews) {
        ResponseHandler.notFound(res, 'News article not found');
        return;
      }

      const updatedNews = await storage.updateNews(newsIdNumber, updateData);

      const duration = Date.now() - startTime;
      console.log(`✅ [CONTENT_NEWS_UPDATE] News updated in ${duration}ms: ${updatedNews.title}`);

      ResponseHandler.success(res, updatedNews, 'News article updated successfully');
      
    } catch (error) {
      console.error(`❌ [CONTENT_NEWS_UPDATE] Error updating news ${newsId}:`, error);
      ResponseHandler.error(res, 'Failed to update news article');
    }
  }

  /**
   * PHASE 6: Delete News
   * Delete news article by ID
   * 
   * DELETE /api/news/:id
   */
  async deleteNews(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const newsId = req.params.id;
    console.log(`🗑️ [CONTENT_NEWS_DELETE] Deleting news: ${newsId}`);

    try {
      const newsIdNumber = ValidationHelper.parseId(newsId);
      
      const newsItem = await storage.getNewsById(newsIdNumber);
      if (!newsItem) {
        ResponseHandler.notFound(res, 'News article not found');
        return;
      }

      await storage.deleteNews(newsIdNumber);

      const duration = Date.now() - startTime;
      console.log(`✅ [CONTENT_NEWS_DELETE] News deleted in ${duration}ms: ${newsItem.title}`);

      ResponseHandler.success(res, null, 'News article deleted successfully');
      
    } catch (error) {
      console.error(`❌ [CONTENT_NEWS_DELETE] Error deleting news ${newsId}:`, error);
      ResponseHandler.error(res, 'Failed to delete news article');
    }
  }
}