/**
 * Performance Monitoring Middleware - Phase 4 Optimization
 * Real-time performance monitoring and analytics
 * 
 * MONITORING FEATURES:
 * - Real-time performance metrics collection
 * - Memory usage tracking and alerts
 * - Database query performance analysis
 * - API response time monitoring
 * - Automatic performance regression detection
 */

import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';

export interface PerformanceMetric {
  timestamp: number;
  method: string;
  path: string;
  responseTime: number;
  statusCode: number;
  memoryUsage: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  cpuUsage: {
    user: number;
    system: number;
  };
  queryCount?: number;
  cacheHitRate?: number;
}

export interface PerformanceAlert {
  type: 'slow_request' | 'memory_leak' | 'high_cpu' | 'error_rate';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  metrics: any;
}

export class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService;
  private metrics: PerformanceMetric[] = [];
  private alerts: PerformanceAlert[] = [];
  private maxMetricsHistory = 1000;
  private alertThresholds = {
    slowRequest: 1000, // 1 second
    criticalRequest: 3000, // 3 seconds
    memoryThreshold: 500 * 1024 * 1024, // 500MB
    highCpuThreshold: 80 // 80%
  };

  private constructor() {
    // Cleanup old metrics every 5 minutes
    setInterval(() => this.cleanupOldMetrics(), 5 * 60 * 1000);
    
    // Generate performance report every 10 minutes
    setInterval(() => this.generatePerformanceReport(), 10 * 60 * 1000);
    
    console.log('📊 [PERFORMANCE_MONITOR] Performance monitoring service initialized');
  }

  static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService();
    }
    return PerformanceMonitoringService.instance;
  }

  /**
   * Main monitoring middleware
   */
  middleware = () => {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = performance.now();
      const startCpuUsage = process.cpuUsage();
      const startMemory = process.memoryUsage();

      // Track request start
      (req as any).startTime = startTime;
      (req as any).startCpuUsage = startCpuUsage;
      (req as any).startMemory = startMemory;

      // Override res.end to capture metrics
      const originalEnd = res.end;
      res.end = (...args: any[]) => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        const endCpuUsage = process.cpuUsage(startCpuUsage);
        const endMemory = process.memoryUsage();

        // Create metric record
        const metric: PerformanceMetric = {
          timestamp: Date.now(),
          method: req.method,
          path: req.path,
          responseTime,
          statusCode: res.statusCode,
          memoryUsage: endMemory,
          cpuUsage: endCpuUsage
        };

        this.addMetric(metric);
        this.checkAlerts(metric);

        // Log slow requests
        if (responseTime > this.alertThresholds.slowRequest) {
          console.warn(`🐌 [SLOW_REQUEST] ${req.method} ${req.path} took ${responseTime.toFixed(2)}ms`);
        }

        // Call original end
        return originalEnd.apply(res, args);
      };

      next();
    };
  };

  /**
   * Add metric to history
   */
  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }
  }

  /**
   * Check for performance alerts
   */
  private checkAlerts(metric: PerformanceMetric): void {
    // Slow request alert
    if (metric.responseTime > this.alertThresholds.criticalRequest) {
      this.addAlert({
        type: 'slow_request',
        severity: 'critical',
        message: `Critical slow request: ${metric.method} ${metric.path} took ${metric.responseTime.toFixed(2)}ms`,
        timestamp: Date.now(),
        metrics: metric
      });
    } else if (metric.responseTime > this.alertThresholds.slowRequest) {
      this.addAlert({
        type: 'slow_request',
        severity: 'medium',
        message: `Slow request detected: ${metric.method} ${metric.path} took ${metric.responseTime.toFixed(2)}ms`,
        timestamp: Date.now(),
        metrics: metric
      });
    }

    // Memory usage alert
    if (metric.memoryUsage.heapUsed > this.alertThresholds.memoryThreshold) {
      this.addAlert({
        type: 'memory_leak',
        severity: 'high',
        message: `High memory usage detected: ${(metric.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        timestamp: Date.now(),
        metrics: metric
      });
    }

    // CPU usage alert (simplified calculation)
    const cpuPercent = ((metric.cpuUsage.user + metric.cpuUsage.system) / 1000) * 100;
    if (cpuPercent > this.alertThresholds.highCpuThreshold) {
      this.addAlert({
        type: 'high_cpu',
        severity: 'medium',
        message: `High CPU usage detected: ${cpuPercent.toFixed(2)}%`,
        timestamp: Date.now(),
        metrics: metric
      });
    }
  }

  /**
   * Add alert to history
   */
  private addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);
    
    // Log alerts
    const severityEmoji = {
      low: '💡',
      medium: '⚠️',
      high: '🔥',
      critical: '💥'
    };
    
    console.warn(`${severityEmoji[alert.severity]} [PERFORMANCE_ALERT] ${alert.message}`);
    
    // Keep only recent alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  /**
   * Get current performance statistics
   */
  getPerformanceStats(): {
    averageResponseTime: number;
    p95ResponseTime: number;
    requestCount: number;
    errorRate: number;
    memoryUsage: NodeJS.MemoryUsage;
    alertCount: number;
    topSlowEndpoints: Array<{ path: string; avgTime: number; count: number }>;
  } {
    if (this.metrics.length === 0) {
      return {
        averageResponseTime: 0,
        p95ResponseTime: 0,
        requestCount: 0,
        errorRate: 0,
        memoryUsage: process.memoryUsage(),
        alertCount: this.alerts.length,
        topSlowEndpoints: []
      };
    }

    const recentMetrics = this.metrics.slice(-100); // Last 100 requests
    const responseTimes = recentMetrics.map(m => m.responseTime).sort((a, b) => a - b);
    const errors = recentMetrics.filter(m => m.statusCode >= 400);

    // Calculate top slow endpoints
    const endpointStats = new Map<string, { totalTime: number; count: number }>();
    recentMetrics.forEach(metric => {
      const key = `${metric.method} ${metric.path}`;
      const current = endpointStats.get(key) || { totalTime: 0, count: 0 };
      endpointStats.set(key, {
        totalTime: current.totalTime + metric.responseTime,
        count: current.count + 1
      });
    });

    const topSlowEndpoints = Array.from(endpointStats.entries())
      .map(([path, stats]) => ({
        path,
        avgTime: stats.totalTime / stats.count,
        count: stats.count
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5);

    return {
      averageResponseTime: responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length,
      p95ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.95)] || 0,
      requestCount: recentMetrics.length,
      errorRate: (errors.length / recentMetrics.length) * 100,
      memoryUsage: process.memoryUsage(),
      alertCount: this.alerts.filter(a => Date.now() - a.timestamp < 60000).length, // Last minute
      topSlowEndpoints
    };
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(minutes: number = 60): PerformanceAlert[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.alerts.filter(alert => alert.timestamp > cutoff);
  }

  /**
   * Generate periodic performance report
   */
  private generatePerformanceReport(): void {
    const stats = this.getPerformanceStats();
    const recentAlerts = this.getRecentAlerts(10);

    console.log('📊 [PERFORMANCE_REPORT] === Performance Report ===');
    console.log(`📈 Average Response Time: ${stats.averageResponseTime.toFixed(2)}ms`);
    console.log(`📊 95th Percentile: ${stats.p95ResponseTime.toFixed(2)}ms`);
    console.log(`📋 Request Count: ${stats.requestCount}`);
    console.log(`❌ Error Rate: ${stats.errorRate.toFixed(2)}%`);
    console.log(`💾 Memory Usage: ${(stats.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    console.log(`🚨 Recent Alerts: ${recentAlerts.length}`);
    
    if (stats.topSlowEndpoints.length > 0) {
      console.log('🐌 Top Slow Endpoints:');
      stats.topSlowEndpoints.forEach((endpoint, index) => {
        console.log(`  ${index + 1}. ${endpoint.path}: ${endpoint.avgTime.toFixed(2)}ms (${endpoint.count} requests)`);
      });
    }
    
    console.log('📊 ================================');
  }

  /**
   * Cleanup old metrics to prevent memory leaks
   */
  private cleanupOldMetrics(): void {
    const cutoff = Date.now() - (60 * 60 * 1000); // Keep last hour
    this.metrics = this.metrics.filter(metric => metric.timestamp > cutoff);
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoff);
    
    console.log(`🧹 [CLEANUP] Cleaned old metrics. Current: ${this.metrics.length} metrics, ${this.alerts.length} alerts`);
  }

  /**
   * Health check endpoint data
   */
  getHealthCheck(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    performanceScore: number;
    alerts: number;
  } {
    const stats = this.getPerformanceStats();
    const recentAlerts = this.getRecentAlerts(5);
    const criticalAlerts = recentAlerts.filter(a => a.severity === 'critical');

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (criticalAlerts.length > 0) {
      status = 'unhealthy';
    } else if (stats.averageResponseTime > 1000 || recentAlerts.length > 3) {
      status = 'degraded';
    }

    // Calculate performance score (0-100)
    let performanceScore = 100;
    if (stats.averageResponseTime > 500) performanceScore -= 20;
    if (stats.errorRate > 5) performanceScore -= 30;
    if (recentAlerts.length > 0) performanceScore -= (recentAlerts.length * 10);
    performanceScore = Math.max(0, performanceScore);

    return {
      status,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      performanceScore,
      alerts: recentAlerts.length
    };
  }
}

// Export singleton instance
export const performanceMonitoringService = PerformanceMonitoringService.getInstance();