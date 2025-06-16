import { storage } from "../storage";
import { InsertYoutubeVideo } from "@shared/schema";

interface YouTubeVideo {
  id: { videoId: string };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      high: { url: string };
      medium: { url: string };
      default: { url: string };
    };
    channelTitle: string;
    tags?: string[];
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
  };
  contentDetails?: {
    duration: string;
  };
}

interface YouTubeSearchResponse {
  items: YouTubeVideo[];
  nextPageToken?: string;
}

class YouTubeService {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('YOUTUBE_API_KEY is required');
    }
  }

  async searchVideos(query: string, maxResults: number = 20): Promise<YouTubeVideo[]> {
    try {
      // Search for videos
      const searchUrl = `${this.baseUrl}/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${this.apiKey}&order=relevance&publishedAfter=${this.getDateWeekAgo()}`;
      
      const searchResponse = await fetch(searchUrl);
      const searchData: YouTubeSearchResponse = await searchResponse.json();

      if (!searchResponse.ok) {
        throw new Error(`YouTube API error: ${JSON.stringify(searchData)}`);
      }

      if (!searchData.items || searchData.items.length === 0) {
        return [];
      }

      // Get video IDs for additional details
      const videoIds = searchData.items.map(item => item.id.videoId).join(',');
      
      // Get video statistics and content details
      const detailsUrl = `${this.baseUrl}/videos?part=statistics,contentDetails&id=${videoIds}&key=${this.apiKey}`;
      
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      // Merge search results with details
      const videosWithDetails = searchData.items.map(video => {
        const details = detailsData.items?.find((detail: any) => detail.id === video.id.videoId);
        return {
          ...video,
          statistics: details?.statistics,
          contentDetails: details?.contentDetails
        };
      });

      return videosWithDetails;
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      throw error;
    }
  }

  private getDateWeekAgo(): string {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString();
  }

  private parseDuration(duration: string): string {
    // Convert ISO 8601 duration (PT4M13S) to readable format (4:13)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '';
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  async fetchAndCacheVideos(): Promise<void> {
    try {
      console.log('Starting YouTube video fetch...');
      
      // Define search queries relacionados ao seu negócio
      const queries = [
        'marketing digital',
        'empreendedorismo',
        'vendas online',
        'e-commerce',
        'redes sociais negócios',
        'gestão empresarial',
        'inovação tecnologia',
        'startup brasil'
      ];

      // Deactivate old videos
      await storage.deactivateOldVideos();

      let totalFetched = 0;

      for (const query of queries) {
        try {
          const videos = await this.searchVideos(query, 10);
          
          for (const video of videos) {
            try {
              const videoData: InsertYoutubeVideo = {
                videoId: video.id.videoId,
                title: video.snippet.title,
                description: video.snippet.description || '',
                channelTitle: video.snippet.channelTitle,
                channelId: video.snippet.channelId,
                publishedAt: new Date(video.snippet.publishedAt),
                thumbnailUrl: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
                duration: video.contentDetails ? this.parseDuration(video.contentDetails.duration) : null,
                viewCount: video.statistics ? parseInt(video.statistics.viewCount) : null,
                likeCount: video.statistics ? parseInt(video.statistics.likeCount) : null,
                tags: video.snippet.tags || null,
                category: query,
                isActive: true,
                fetchedAt: new Date()
              };

              // Check if video already exists
              const existingVideos = await storage.getYoutubeVideos();
              const exists = existingVideos.some(v => v.videoId === video.id.videoId);
              
              if (!exists) {
                await storage.createYoutubeVideo(videoData);
                totalFetched++;
              }
            } catch (error) {
              console.error(`Error saving video ${video.id.videoId}:`, error);
            }
          }
          
          // Add delay between queries to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error fetching videos for query "${query}":`, error);
        }
      }

      console.log(`YouTube fetch completed. ${totalFetched} new videos cached.`);
    } catch (error) {
      console.error('Error in fetchAndCacheVideos:', error);
      throw error;
    }
  }
}

export const youtubeService = new YouTubeService();