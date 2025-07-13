import { youtubeService } from './youtubeService';

class Scheduler {
  private intervals: NodeJS.Timeout[] = [];
  private isRunning = false;

  start() {
    if (this.isRunning) {
      console.log('📅 [SCHEDULER] Scheduler already running');
      return;
    }

    this.isRunning = true;
    console.log('📅 [SCHEDULER] Starting RapidAPI video scheduler (1x daily)...');

    // Schedule for 9:00 AM daily - optimal time for new video detection
    this.scheduleJob('09:00', () => this.runYouTubeSync());

    // Run immediately on startup (for testing/initial population)
    setTimeout(() => this.runYouTubeSync(), 5000);
  }

  private scheduleJob(time: string, callback: () => void) {
    const [hours, minutes] = time.split(':').map(Number);
    
    const scheduleNext = () => {
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      // If the time has passed today, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const timeUntilNext = scheduledTime.getTime() - now.getTime();
      
      console.log(`Next RapidAPI sync scheduled for: ${scheduledTime.toLocaleString()}`);

      const timeout = setTimeout(() => {
        callback();
        scheduleNext(); // Schedule next occurrence
      }, timeUntilNext);

      this.intervals.push(timeout);
    };

    scheduleNext();
  }

  private async runYouTubeSync() {
    try {
      console.log(`🚀 [SCHEDULER] Starting scheduled RapidAPI sync at ${new Date().toLocaleString()}`);
      const result = await youtubeService.syncVideosFromRapidAPI();
      console.log(`✅ [SCHEDULER] RapidAPI sync completed at ${new Date().toLocaleString()} - ${result.newVideos} new videos added, ${result.totalVideos} total processed`);
    } catch (error) {
      console.error('❌ [SCHEDULER] Error in scheduled RapidAPI sync:', error);
    }
  }

  stop() {
    console.log('Stopping scheduler...');
    this.intervals.forEach(interval => clearTimeout(interval));
    this.intervals = [];
    this.isRunning = false;
  }

  // Method to manually trigger sync (for testing)
  async triggerManualSync() {
    console.log('Manual RapidAPI sync triggered');
    await this.runYouTubeSync();
  }
}

export const scheduler = new Scheduler();