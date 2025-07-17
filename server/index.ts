import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import helmet from "helmet";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { scheduler } from "./services/scheduler";
import { compressionMiddleware, cacheHeaders, performanceMetrics, memoryMonitor } from "./middleware/performanceMiddleware";
import { optimizedProductService } from "./services/OptimizedProductService";
import { 
  securityHeaders, 
  apiLimiter, 
  sanitizeQueryParams, 
  sanitizeBody,
  sanitizeError 
} from "./security";
import { enhancedAuth, enhancedCSRF, anonymousRateLimiter } from "./middleware/enhancedAuth";
import path from "path";

const app = express();

// SECURITY MIDDLEWARE - Applied first for protection
app.use(helmet({
  contentSecurityPolicy: false, // We set custom CSP in securityHeaders
  crossOriginEmbedderPolicy: false // Allow embedding for development
}));
app.use(securityHeaders); // Custom security headers including CSP
app.use('/api', apiLimiter); // Rate limiting for API routes

// PHASE 1 PERFORMANCE OPTIMIZATIONS
app.use(compressionMiddleware); // Enhanced compression
app.use(performanceMetrics); // Performance tracking
app.use(cacheHeaders); // Intelligent caching
app.use(memoryMonitor); // Memory monitoring

// INPUT SANITIZATION - Applied before parsing
app.use(sanitizeQueryParams); // Sanitize query parameters

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Conditional middleware for JSON parsing - skip for upload routes
app.use((req, res, next) => {
  // Skip JSON parsing for file upload routes
  if (req.path === '/api/temp-image/upload' && req.method === 'POST') {
    return next();
  }
  // Apply JSON parsing for all other routes
  express.json({ limit: '50mb' })(req, res, next);
});

app.use((req, res, next) => {
  // Skip URL encoding for file upload routes
  if (req.path === '/api/temp-image/upload' && req.method === 'POST') {
    return next();
  }
  // Apply URL encoding for all other routes
  express.urlencoded({ extended: false, limit: '50mb' })(req, res, next);
});

// Apply body sanitization after parsing but before route handlers
app.use(sanitizeBody);

// Evolution API test endpoint (BEFORE authentication middleware)
app.get('/api/evolution/test-simple', async (req, res) => {
  try {
    console.log('🧪 Evolution API test endpoint called');
    
    const hasUrl = !!process.env.EVOLUTION_API_URL;
    const hasKey = !!process.env.EVOLUTION_API_KEY;
    const hasInstance = !!process.env.EVOLUTION_INSTANCE_NAME;
    
    console.log('📋 Checking Evolution API environment variables:');
    console.log('   EVOLUTION_API_URL:', hasUrl ? '✅ Set' : '❌ Not set');
    console.log('   EVOLUTION_API_KEY:', hasKey ? '✅ Set' : '❌ Not set');
    console.log('   EVOLUTION_INSTANCE_NAME:', hasInstance ? '✅ Set' : '❌ Not set');
    
    if (!hasUrl || !hasKey || !hasInstance) {
      return res.json({
        status: 'error',
        message: 'Evolution API configuration incomplete',
        details: { hasUrl, hasKey, hasInstance }
      });
    }

    // Try to import and test the WhatsApp service
    const { whatsappService } = await import('./services/whatsappService');
    const testCode = whatsappService.generateVerificationCode();
    
    console.log('📊 Testing Evolution API connection...');
    const isConnected = await whatsappService.checkConnection();
    
    console.log('📊 Test results:');
    console.log('   Connection:', isConnected ? '✅ Active' : '❌ Inactive');
    console.log('   Test code generated:', testCode);
    
    res.json({
      status: isConnected ? 'success' : 'warning',
      message: isConnected ? 
        'Evolution API configured and connected successfully' : 
        'Evolution API configured but connection failed',
      details: {
        hasUrl,
        hasKey,
        hasInstance,
        connection: isConnected,
        testCode,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Evolution API test error:', error);
    res.json({
      status: 'error',
      message: 'Error testing Evolution API',
      error: error.message
    });
  }
});

// Apply enhanced authentication to all API routes
app.use(enhancedAuth);

// Apply CSRF protection to state-changing operations
app.use(enhancedCSRF);

// Apply anonymous rate limiting for public endpoints
app.use('/api/auth/login', anonymousRateLimiter(5, 15)); // 5 attempts per 15 minutes
app.use('/api/auth/register', anonymousRateLimiter(3, 60)); // 3 registrations per hour

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  const method = req.method;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress || 'Unknown';
  
  let capturedJsonResponse: Record<string, any> | undefined = undefined;
  let errorOccurred = false;

  // Log request details for API endpoints
  if (path.startsWith("/api")) {
    console.log(`🌐 [REQUEST] ${method} ${path}`);
    console.log(`   📍 IP: ${ip}`);
    console.log(`   🖥️  User-Agent: ${userAgent.substring(0, 50)}...`);
    
    if (Object.keys(req.query).length > 0) {
      console.log(`   📋 Query Params:`, req.query);
    }
    
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyLog = { ...req.body };
      // Hide sensitive data in logs
      if (bodyLog.password) bodyLog.password = '[HIDDEN]';
      if (bodyLog.apiKey) bodyLog.apiKey = '[HIDDEN]';
      if (bodyLog.imageData) bodyLog.imageData = `[IMAGE_DATA_${bodyLog.imageData?.length || 0}_chars]`;
      console.log(`   📦 Body:`, JSON.stringify(bodyLog, null, 2));
    }
  }

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  // Capture errors
  const originalSend = res.send;
  res.send = function(body) {
    if (res.statusCode >= 400) {
      errorOccurred = true;
    }
    return originalSend.call(this, body);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    
    if (path.startsWith("/api")) {
      const statusIcon = res.statusCode >= 400 ? '❌' : '✅';
      const statusColor = res.statusCode >= 500 ? '\x1b[31m' : res.statusCode >= 400 ? '\x1b[33m' : '\x1b[32m';
      const resetColor = '\x1b[0m';
      
      console.log(`${statusIcon} [RESPONSE] ${statusColor}${method} ${path} ${res.statusCode}${resetColor} in ${duration}ms`);
      
      if (capturedJsonResponse) {
        if (errorOccurred) {
          console.log(`   🚨 Error Response:`, JSON.stringify(capturedJsonResponse, null, 2));
        } else {
          const responsePreview = JSON.stringify(capturedJsonResponse).substring(0, 200);
          console.log(`   📤 Response Preview: ${responsePreview}${responsePreview.length >= 200 ? '...' : ''}`);
        }
      }
      
      // Log slow requests
      if (duration > 1000) {
        console.log(`   ⚠️  SLOW REQUEST: ${duration}ms`);
      }
      
      console.log(`   ⏱️  Total Duration: ${duration}ms\n`);
      
      // Original short log for compatibility
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log detailed error information
    console.error(`🔥 [ERROR] ${req.method} ${req.path}`);
    console.error(`   📍 IP: ${req.ip || 'Unknown'}`);
    console.error(`   🚨 Status: ${status}`);
    console.error(`   💬 Message: ${message}`);
    console.error(`   📋 Stack Trace:`, err.stack);
    
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyLog = { ...req.body };
      // Hide sensitive data
      if (bodyLog.password) bodyLog.password = '[HIDDEN]';
      if (bodyLog.apiKey) bodyLog.apiKey = '[HIDDEN]';
      if (bodyLog.imageData) bodyLog.imageData = `[IMAGE_DATA_${bodyLog.imageData?.length || 0}_chars]`;
      console.error(`   📦 Request Body:`, JSON.stringify(bodyLog, null, 2));
    }
    
    if (req.query && Object.keys(req.query).length > 0) {
      console.error(`   🔍 Query Params:`, req.query);
    }
    
    console.error(`   🕐 Timestamp: ${new Date().toISOString()}\n`);

    // Use sanitizeError to prevent information leakage
    const sanitizedError = sanitizeError(err);

    res.status(status).json({ 
      ...sanitizedError,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    });
    
    // Don't throw in production to avoid crashing the server
    if (process.env.NODE_ENV === 'development') {
      throw err;
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, async () => {
    log(`serving on port ${port}`);
    
    // PHASE 1 PERFORMANCE: Initialize database optimizations
    console.log('🚀 [PERFORMANCE] Initializing Phase 1 optimizations...');
    try {
      await optimizedProductService.initialize();
      console.log('✅ [PERFORMANCE] Phase 1 optimizations ready - Target: 70-80% speed improvement');
    } catch (error) {
      console.error('❌ [PERFORMANCE] Failed to initialize optimizations:', error);
    }
    
    // Start the YouTube video scheduler
    scheduler.start();
  });
})();
