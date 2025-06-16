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

  async fetchChannelInfo(channelHandle: string): Promise<any> {
    try {
      // Try multiple search approaches for better channel discovery
      const searchQueries = [
        channelHandle,
        'Guilherme Vasques',
        'Guilherme Vasques Amazon',
        'Guilherme Vasques importação'
      ];

      for (const query of searchQueries) {
        try {
          const searchUrl = `${this.baseUrl}/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&key=${this.apiKey}`;
          const searchResponse = await fetch(searchUrl);
          
          if (!searchResponse.ok) {
            continue;
          }
          
          const searchData = await searchResponse.json();
          
          if (searchData.items && searchData.items.length > 0) {
            // Look for exact match or best match
            let bestMatch = searchData.items[0];
            
            // Try to find exact channel name match
            for (const item of searchData.items) {
              if (item.snippet.title.toLowerCase().includes('guilherme vasques')) {
                bestMatch = item;
                break;
              }
            }
            
            const channelId = bestMatch.id.channelId;
            
            // Get detailed channel info including subscriber count
            const channelUrl = `${this.baseUrl}/channels?part=snippet,statistics&id=${channelId}&key=${this.apiKey}`;
            const channelResponse = await fetch(channelUrl);
            
            if (channelResponse.ok) {
              const channelData = await channelResponse.json();
              if (channelData.items && channelData.items.length > 0) {
                return channelData.items[0];
              }
            }
          }
        } catch (error) {
          console.error(`Error searching for "${query}":`, error);
          continue;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching channel info:', error);
      return null;
    }
  }

  async fetchChannelVideos(channelHandle: string, maxResults: number = 20): Promise<YouTubeVideo[]> {
    try {
      // Use the same search approach as fetchChannelInfo for consistency
      const searchQueries = [
        channelHandle,
        'Guilherme Vasques',
        'Guilherme Vasques Amazon',
        'Guilherme Vasques importação'
      ];

      for (const query of searchQueries) {
        try {
          const searchUrl = `${this.baseUrl}/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&key=${this.apiKey}`;
          const searchResponse = await fetch(searchUrl);
          
          if (!searchResponse.ok) {
            continue;
          }
          
          const searchData = await searchResponse.json();
          
          if (searchData.items && searchData.items.length > 0) {
            // Look for exact match or best match
            let bestMatch = searchData.items[0];
            
            // Try to find exact channel name match
            for (const item of searchData.items) {
              if (item.snippet.title.toLowerCase().includes('guilherme vasques')) {
                bestMatch = item;
                break;
              }
            }
            
            const channelId = bestMatch.id.channelId;
            
            // Get videos from the channel
            const videosUrl = `${this.baseUrl}/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=${maxResults}&key=${this.apiKey}`;
            const videosResponse = await fetch(videosUrl);
            
            if (!videosResponse.ok) {
              continue;
            }
            
            const videosData: YouTubeSearchResponse = await videosResponse.json();
            
            if (!videosData.items || videosData.items.length === 0) {
              continue;
            }
            
            // Get additional details for videos
            const videoIds = videosData.items.map(video => video.id.videoId).join(',');
            const detailsUrl = `${this.baseUrl}/videos?part=contentDetails,statistics&id=${videoIds}&key=${this.apiKey}`;
            const detailsResponse = await fetch(detailsUrl);
            
            if (detailsResponse.ok) {
              const detailsData = await detailsResponse.json();
              
              // Merge video data with details
              const videos = videosData.items.map(video => {
                const details = detailsData.items?.find((detail: any) => detail.id === video.id.videoId);
                return {
                  ...video,
                  contentDetails: details?.contentDetails,
                  statistics: details?.statistics
                };
              });
              
              console.log(`Found ${videos.length} videos for channel: ${bestMatch.snippet.title}`);
              return videos;
            }
            
            return videosData.items;
          }
        } catch (error) {
          console.error(`Error searching for "${query}":`, error);
          continue;
        }
      }
      
      console.log(`No videos found for any search query`);
      return [];
    } catch (error) {
      console.error('Error fetching channel videos:', error);
      return [];
    }
  }

  async fetchAndCacheVideos(): Promise<void> {
    try {
      console.log('Starting YouTube video fetch...');
      
      // Fetch videos from Guilherme Vasques channel
      const channelHandle = '@guilhermeavasques';
      const videos = await this.fetchChannelVideos(channelHandle, 50);
      
      // Deactivate old videos
      await storage.deactivateOldVideos();

      let totalFetched = 0;

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
            viewCount: video.statistics && !isNaN(parseInt(video.statistics.viewCount)) ? parseInt(video.statistics.viewCount) : null,
            likeCount: video.statistics && !isNaN(parseInt(video.statistics.likeCount)) ? parseInt(video.statistics.likeCount) : null,
            tags: video.snippet.tags || null,
            category: 'Guilherme Vasques',
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

      console.log(`YouTube fetch completed. ${totalFetched} new videos cached.`);
    } catch (error) {
      console.error('Error in fetchAndCacheVideos:', error);
      throw error;
    }
  }
}

export const youtubeService = new YouTubeService();