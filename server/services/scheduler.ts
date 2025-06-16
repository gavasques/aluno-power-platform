import { youtubeService } from './youtubeService';

class Scheduler {
  private intervals: NodeJS.Timeout[] = [];
  private isRunning = false;

  start() {
    if (this.isRunning) {
      console.log('Scheduler already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting YouTube video scheduler (2x daily)...');

    // Schedule for 8:00 AM and 8:00 PM daily
    this.scheduleJob('08:00', () => this.runYouTubeSync());
    this.scheduleJob('20:00', () => this.runYouTubeSync());

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
      
      console.log(`Next YouTube sync scheduled for: ${scheduledTime.toLocaleString()}`);

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
      console.log(`Starting scheduled YouTube video sync at ${new Date().toLocaleString()}`);
      await youtubeService.fetchAndCacheVideos();
      console.log(`YouTube sync completed at ${new Date().toLocaleString()}`);
    } catch (error) {
      console.error('Error in scheduled YouTube sync:', error);
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
    console.log('Manual YouTube sync triggered');
    await this.runYouTubeSync();
  }
}

export const scheduler = new Scheduler();