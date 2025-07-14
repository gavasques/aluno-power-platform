/**
 * Structured Logging System - Performance Optimized
 * 
 * Features:
 * - Environment-based conditional logging
 * - Log levels with performance optimization
 * - Structured output for better debugging
 * - Production-safe logging
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: any;
  context?: string;
}

class Logger {
  private currentLevel: LogLevel;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.currentLevel = this.isProduction ? LogLevel.WARN : LogLevel.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.currentLevel;
  }

  private formatLog(level: string, message: string, data?: any, context?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(data && { data }),
      ...(context && { context })
    };
  }

  private output(entry: LogEntry): void {
    if (this.isProduction) {
      // In production, use structured JSON logging
      console.log(JSON.stringify(entry));
    } else {
      // In development, use readable format
      const prefix = `[${entry.level}] ${entry.context ? `[${entry.context}] ` : ''}`;
      if (entry.data) {
        console.log(prefix + entry.message, entry.data);
      } else {
        console.log(prefix + entry.message);
      }
    }
  }

  error(message: string, data?: any, context?: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.output(this.formatLog('ERROR', message, data, context));
    }
  }

  warn(message: string, data?: any, context?: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.output(this.formatLog('WARN', message, data, context));
    }
  }

  info(message: string, data?: any, context?: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.output(this.formatLog('INFO', message, data, context));
    }
  }

  debug(message: string, data?: any, context?: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.output(this.formatLog('DEBUG', message, data, context));
    }
  }

  trace(message: string, data?: any, context?: string): void {
    if (this.shouldLog(LogLevel.TRACE)) {
      this.output(this.formatLog('TRACE', message, data, context));
    }
  }

  // Performance-focused methods
  performanceStart(operation: string, context?: string): number {
    if (!this.shouldLog(LogLevel.DEBUG)) return 0;
    const startTime = Date.now();
    this.debug(`Performance tracking started for: ${operation}`, { startTime }, context);
    return startTime;
  }

  performanceEnd(operation: string, startTime: number, context?: string): number {
    if (!this.shouldLog(LogLevel.DEBUG)) return 0;
    const duration = Date.now() - startTime;
    this.debug(`Performance tracking completed for: ${operation}`, { duration: `${duration}ms` }, context);
    return duration;
  }

  // API request logging
  apiRequest(method: string, path: string, ip: string, userAgent?: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.info(`API Request: ${method} ${path}`, { ip, userAgent }, 'API');
    }
  }

  apiResponse(method: string, path: string, statusCode: number, duration: number): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const level = statusCode >= 400 ? 'ERROR' : statusCode >= 300 ? 'WARN' : 'INFO';
      this[level.toLowerCase() as 'error' | 'warn' | 'info'](`API Response: ${method} ${path}`, { 
        statusCode, 
        duration: `${duration}ms` 
      }, 'API');
    }
  }

  // Database logging
  dbQuery(query: string, duration?: number, context?: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.debug('Database query executed', { 
        query: query.substring(0, 100) + (query.length > 100 ? '...' : ''), 
        ...(duration && { duration: `${duration}ms` })
      }, context || 'DB');
    }
  }

  // Authentication logging
  authEvent(event: string, userId?: number, details?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.info(`Auth event: ${event}`, { userId, ...details }, 'AUTH');
    }
  }

  // Slow operation warnings
  slowOperation(operation: string, duration: number, threshold: number = 1000): void {
    if (duration > threshold) {
      this.warn(`Slow operation detected: ${operation}`, { 
        duration: `${duration}ms`, 
        threshold: `${threshold}ms` 
      }, 'PERFORMANCE');
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports for common patterns
export const logApiRequest = (req: any) => {
  logger.apiRequest(
    req.method, 
    req.path, 
    req.ip || req.connection?.remoteAddress,
    req.get('user-agent')
  );
};

export const logApiResponse = (req: any, res: any, duration: number) => {
  logger.apiResponse(req.method, req.path, res.statusCode, duration);
};

export const logSlowRequest = (req: any, duration: number) => {
  logger.slowOperation(`${req.method} ${req.path}`, duration);
};