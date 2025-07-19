// Scheduler class for future system tasks
class Scheduler {
  private intervals: NodeJS.Timeout[] = [];
  private isRunning = false;

  start() {
    if (this.isRunning) {
      console.log('📅 [SCHEDULER] Scheduler already running');
      return;
    }

    this.isRunning = true;
    console.log('📅 [SCHEDULER] Scheduler started (no active jobs)');
    
    // Future scheduled tasks can be added here
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

      const timeout = setTimeout(() => {
        callback();
        scheduleNext(); // Schedule next occurrence
      }, timeUntilNext);

      this.intervals.push(timeout);
    };

    scheduleNext();
  }

  stop() {
    console.log('📅 [SCHEDULER] Stopping scheduler...');
    this.intervals.forEach(interval => clearTimeout(interval));
    this.intervals = [];
    this.isRunning = false;
  }
}

export const scheduler = new Scheduler();