/**
 * Performance API Routes - Phase 4 Monitoring
 * Real-time performance monitoring endpoints
 */

import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { performanceMonitoringService } from '../middleware/performanceMonitoringMiddleware';
import { connectionPoolService } from '../services/ConnectionPoolService';
import { responseCompressionService } from '../services/ResponseCompressionService';
import { queryCacheService } from '../services/QueryCacheService';

const router = Router();

/**
 * GET /api/performance/stats
 * Get current performance statistics
 */
router.get('/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const performanceStats = performanceMonitoringService.getPerformanceStats();
    const connectionStats = await connectionPoolService.healthCheck();
    const compressionStats = responseCompressionService.getCompressionStats();
    const cacheStats = queryCacheService.getMetrics();

    res.json({
      success: true,
      data: {
        performance: performanceStats,
        database: connectionStats,
        compression: compressionStats,
        cache: cacheStats,
        timestamp: Date.now()
      }
    });
  } catch (error: any) {
    console.error('💥 [PERFORMANCE_STATS_ERROR]', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get performance stats',
      details: error.message
    });
  }
});

/**
 * GET /api/performance/alerts
 * Get recent performance alerts
 */
router.get('/alerts', requireAuth, async (req: Request, res: Response) => {
  try {
    const minutes = parseInt(req.query.minutes as string) || 60;
    const alerts = performanceMonitoringService.getRecentAlerts(minutes);

    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
      timeRange: `${minutes} minutes`
    });
  } catch (error: any) {
    console.error('💥 [PERFORMANCE_ALERTS_ERROR]', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get performance alerts',
      details: error.message
    });
  }
});

/**
 * GET /api/performance/health
 * Comprehensive health check endpoint
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const healthCheck = performanceMonitoringService.getHealthCheck();
    const dbHealth = await connectionPoolService.healthCheck();
    const cacheMetrics = queryCacheService.getMetrics();

    const overallHealth = {
      ...healthCheck,
      database: {
        healthy: dbHealth.healthy,
        latency: dbHealth.latency,
        connections: dbHealth.metrics
      },
      cache: {
        hitRate: cacheMetrics.hitRate,
        memoryUsage: cacheMetrics.memoryUsage,
        entries: cacheMetrics.totalEntries
      }
    };

    // Set appropriate HTTP status based on health
    const statusCode = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 207 : 503;

    res.status(statusCode).json({
      success: healthCheck.status === 'healthy',
      health: overallHealth,
      timestamp: Date.now()
    });
  } catch (error: any) {
    console.error('💥 [HEALTH_CHECK_ERROR]', error);
    res.status(503).json({
      success: false,
      health: {
        status: 'unhealthy',
        error: error.message
      },
      timestamp: Date.now()
    });
  }
});

/**
 * GET /api/performance/metrics
 * Detailed performance metrics for dashboard
 */
router.get('/metrics', requireAuth, async (req: Request, res: Response) => {
  try {
    const stats = performanceMonitoringService.getPerformanceStats();
    const dbMetrics = connectionPoolService.getMetrics();
    const compressionStats = responseCompressionService.getCompressionStats();
    const cacheMetrics = queryCacheService.getMetrics();

    // Calculate optimization impact
    const optimizationImpact = {
      databaseOptimization: {
        averageQueryTime: dbMetrics.averageQueryTime,
        connectionEfficiency: (dbMetrics.totalConnections - dbMetrics.idleConnections) / dbMetrics.totalConnections * 100,
        querySuccessRate: ((dbMetrics.totalQueries - dbMetrics.failedQueries) / dbMetrics.totalQueries * 100) || 100
      },
      compressionOptimization: {
        averageCompressionRatio: Object.values(compressionStats).reduce((avg, stat) => avg + stat.averageRatio, 0) / Object.keys(compressionStats).length || 0,
        totalRequests: Object.values(compressionStats).reduce((total, stat) => total + stat.totalRequests, 0)
      },
      cacheOptimization: {
        hitRate: cacheMetrics.hitRate,
        memoryEfficiency: (cacheMetrics.memoryUsage / 1024 / 1024), // MB
        averageRetrievalTime: cacheMetrics.averageRetrievalTime
      },
      overallPerformance: {
        averageResponseTime: stats.averageResponseTime,
        p95ResponseTime: stats.p95ResponseTime,
        errorRate: stats.errorRate,
        performanceScore: performanceMonitoringService.getHealthCheck().performanceScore
      }
    };

    res.json({
      success: true,
      data: optimizationImpact,
      rawMetrics: {
        performance: stats,
        database: dbMetrics,
        compression: compressionStats,
        cache: cacheMetrics
      },
      timestamp: Date.now()
    });
  } catch (error: any) {
    console.error('💥 [PERFORMANCE_METRICS_ERROR]', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get performance metrics',
      details: error.message
    });
  }
});

/**
 * POST /api/performance/benchmark
 * Run performance benchmark test
 */
router.post('/benchmark', requireAuth, async (req: Request, res: Response) => {
  try {
    console.log('🚀 [BENCHMARK] Starting performance benchmark...');
    
    const startTime = performance.now();
    
    // Test database performance
    const dbStart = performance.now();
    const dbHealthCheck = await connectionPoolService.healthCheck();
    const dbTime = performance.now() - dbStart;
    
    // Test cache performance
    const cacheStart = performance.now();
    await queryCacheService.set('benchmark_test', { test: true, timestamp: Date.now() });
    const cacheValue = await queryCacheService.get('benchmark_test');
    const cacheTime = performance.now() - cacheStart;
    
    // Test memory usage
    const memoryBefore = process.memoryUsage();
    const testArray = new Array(10000).fill(0).map((_, i) => ({ id: i, data: `test_${i}` }));
    const memoryAfter = process.memoryUsage();
    
    const totalTime = performance.now() - startTime;
    
    const benchmarkResults = {
      totalTime,
      database: {
        connectionTime: dbTime,
        healthy: dbHealthCheck.healthy,
        latency: dbHealthCheck.latency
      },
      cache: {
        writeReadTime: cacheTime,
        dataIntegrity: cacheValue !== null
      },
      memory: {
        beforeBenchmark: memoryBefore,
        afterBenchmark: memoryAfter,
        allocated: memoryAfter.heapUsed - memoryBefore.heapUsed
      },
      performance: performanceMonitoringService.getPerformanceStats()
    };
    
    console.log(`✅ [BENCHMARK] Completed in ${totalTime.toFixed(2)}ms`);
    
    res.json({
      success: true,
      benchmark: benchmarkResults,
      timestamp: Date.now()
    });
  } catch (error: any) {
    console.error('💥 [BENCHMARK_ERROR]', error);
    res.status(500).json({
      success: false,
      error: 'Benchmark failed',
      details: error.message
    });
  }
});

export default router;