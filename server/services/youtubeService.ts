import { storage } from "../storage";
import { InsertYoutubeVideo } from "@shared/schema";
import https from 'https';

interface RapidAPIVideoThumbnail {
  url: string;
  width: number;
  height: number;
}

interface RapidAPIVideo {
  video_id: string;
  title: string;
  author: string;
  number_of_views: number;
  video_length: string;
  description?: string;
  is_live_content?: boolean;
  published_time: string;
  channel_id: string;
  category?: string;
  type: string;
  keywords: string[];
  thumbnails: RapidAPIVideoThumbnail[];
}

interface RapidAPIResponse {
  continuation_token?: string;
  videos: RapidAPIVideo[];
}

class YouTubeService {
  private rapidApiKey: string;
  private channelId = 'UCccs9hxFuzq77stdELIU59w'; // Guilherme Vasques channel ID

  constructor() {
    this.rapidApiKey = process.env.RAPIDAPI_KEY || '';
    if (!this.rapidApiKey) {
      console.warn('RAPIDAPI_KEY not found - YouTube features will be limited');
    }
  }

  private async makeRapidAPIRequest(): Promise<RapidAPIVideo[]> {
    return new Promise((resolve, reject) => {
      if (!this.rapidApiKey) {
        console.warn('RapidAPI key not available');
        resolve([]);
        return;
      }

      const options = {
        method: 'GET',
        hostname: 'youtube-v2.p.rapidapi.com',
        port: null,
        path: `/channel/videos?channel_id=${this.channelId}`,
        headers: {
          'x-rapidapi-key': this.rapidApiKey,
          'x-rapidapi-host': 'youtube-v2.p.rapidapi.com'
        }
      };

      const req = https.request(options, (res) => {
        const chunks: Buffer[] = [];

        res.on('data', (chunk) => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          try {
            const body = Buffer.concat(chunks);
            console.log(`🎬 [RAPIDAPI DEBUG] Response status: ${res.statusCode}`);
            console.log(`🎬 [RAPIDAPI DEBUG] Response headers:`, res.headers);
            console.log(`🎬 [RAPIDAPI DEBUG] Raw response body:`, body.toString().substring(0, 500));
            
            if (res.statusCode !== 200) {
              console.error(`🎬 [RAPIDAPI ERROR] Bad status code: ${res.statusCode}`);
              reject(new Error(`RapidAPI returned status ${res.statusCode}`));
              return;
            }

            const response: RapidAPIResponse = JSON.parse(body.toString());
            console.log(`🎬 [RAPIDAPI DEBUG] Parsed response:`, JSON.stringify(response, null, 2).substring(0, 1000));
            
            if (response.videos && Array.isArray(response.videos)) {
              console.log(`🎬 [RAPIDAPI] Successfully fetched ${response.videos.length} videos from RapidAPI`);
              resolve(response.videos);
            } else {
              console.warn('🎬 [RAPIDAPI] No videos found in response - response structure:', Object.keys(response));
              resolve([]);
            }
          } catch (error) {
            console.error('🎬 [RAPIDAPI] Error parsing response:', error);
            console.error('🎬 [RAPIDAPI] Raw body for debugging:', body.toString().substring(0, 1000));
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        console.error('🎬 [RAPIDAPI] Request error:', error);
        reject(error);
      });

      req.end();
    });
  }

  async fetchChannelVideos(): Promise<RapidAPIVideo[]> {
    try {
      console.log('🎬 [RAPIDAPI] Fetching videos from Guilherme Vasques channel...');
      const videos = await this.makeRapidAPIRequest();
      return videos;
    } catch (error) {
      console.error('🎬 [RAPIDAPI] Error fetching channel videos:', error);
      return [];
    }
  }

  private convertToInsertFormat(rapidApiVideo: RapidAPIVideo): InsertYoutubeVideo {
    // Convert published_time from relative format to ISO date
    const publishedAt = this.parsePublishedTime(rapidApiVideo.published_time);
    
    // Get best thumbnail (prefer larger ones)
    const thumbnail = rapidApiVideo.thumbnails && rapidApiVideo.thumbnails.length > 0 
      ? rapidApiVideo.thumbnails[rapidApiVideo.thumbnails.length - 1] // Get the largest thumbnail
      : { url: '', width: 0, height: 0 };

    // Parse view count
    const viewCount = rapidApiVideo.number_of_views || 0;

    return {
      videoId: rapidApiVideo.video_id,
      title: rapidApiVideo.title || 'Untitled',
      description: rapidApiVideo.description || '',
      channelTitle: rapidApiVideo.author || 'Guilherme Vasques',
      channelId: rapidApiVideo.channel_id || this.channelId,
      publishedAt,
      thumbnailUrl: thumbnail.url || '',
      duration: rapidApiVideo.video_length || '',
      viewCount,
      likeCount: null, // Not available in RapidAPI response
      tags: rapidApiVideo.keywords || [],
      category: rapidApiVideo.category || null,
      isActive: rapidApiVideo.type === 'NORMAL', // Only normal videos are active
    };
  }

  private parsePublishedTime(publishedTime: string): Date {
    const now = new Date();
    
    // Handle relative time formats like "1 day ago", "3 weeks ago", "2 months ago"
    const timeMatch = publishedTime.match(/(\d+)\s*(day|week|month|year)s?\s*ago/i);
    
    if (timeMatch) {
      const amount = parseInt(timeMatch[1]);
      const unit = timeMatch[2].toLowerCase();
      
      switch (unit) {
        case 'day':
          return new Date(now.getTime() - (amount * 24 * 60 * 60 * 1000));
        case 'week':
          return new Date(now.getTime() - (amount * 7 * 24 * 60 * 60 * 1000));
        case 'month':
          return new Date(now.getTime() - (amount * 30 * 24 * 60 * 60 * 1000));
        case 'year':
          return new Date(now.getTime() - (amount * 365 * 24 * 60 * 60 * 1000));
        default:
          return now;
      }
    }
    
    // Fallback: try to parse as ISO date or return current date
    try {
      return new Date(publishedTime);
    } catch {
      return now;
    }
  }

  async syncVideosFromRapidAPI(): Promise<{ newVideos: number; totalVideos: number }> {
    try {
      console.log('🔄 [RAPIDAPI SYNC] Starting video synchronization...');
      
      // Fetch videos from RapidAPI
      const rapidApiVideos = await this.fetchChannelVideos();
      
      if (rapidApiVideos.length === 0) {
        console.log('🔄 [RAPIDAPI SYNC] No videos received from RapidAPI');
        return { newVideos: 0, totalVideos: 0 };
      }

      // Get existing videos from database to avoid duplicates
      const existingVideos = await storage.getAllYoutubeVideos();
      const existingVideoIds = new Set(existingVideos.map(video => video.videoId));

      let newVideosCount = 0;

      // Process each video from RapidAPI
      for (const rapidApiVideo of rapidApiVideos) {
        try {
          const videoData = this.convertToInsertFormat(rapidApiVideo);
          
          if (!existingVideoIds.has(videoData.videoId)) {
            // Add new video to database
            await storage.createYoutubeVideo(videoData);
            newVideosCount++;
            console.log(`➕ [RAPIDAPI SYNC] Added new video: ${videoData.title}`);
          } else {
            // Update existing video data (view count, etc.)
            await storage.updateYoutubeVideo(videoData.videoId, {
              viewCount: videoData.viewCount,
              title: videoData.title,
              description: videoData.description,
              thumbnailUrl: videoData.thumbnailUrl,
              duration: videoData.duration,
              tags: videoData.tags,
              category: videoData.category,
              fetchedAt: new Date(),
            });
          }
        } catch (error) {
          console.error('🔄 [RAPIDAPI SYNC] Error processing video:', rapidApiVideo.video_id, error);
        }
      }

      console.log(`✅ [RAPIDAPI SYNC] Sync completed: ${newVideosCount} new videos added, ${rapidApiVideos.length} total processed`);
      
      return {
        newVideos: newVideosCount,
        totalVideos: rapidApiVideos.length
      };
    } catch (error) {
      console.error('🔄 [RAPIDAPI SYNC] Error during video sync:', error);
      return { newVideos: 0, totalVideos: 0 };
    }
  }
}

export const youtubeService = new YouTubeService();