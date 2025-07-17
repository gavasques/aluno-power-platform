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

// Simple Evolution API test endpoint (BEFORE authentication middleware)
app.get('/api/evolution/status', async (req, res) => {
  console.log('🧪 Simple Evolution API status check');
  
  try {
    const url = process.env.EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;
    const instance = process.env.EVOLUTION_INSTANCE_NAME;
    
    console.log('📋 Configuration:');
    console.log('   URL:', url ? 'Set' : 'Not set');
    console.log('   API Key:', apiKey ? 'Set' : 'Not set');
    console.log('   Instance:', instance ? 'Set' : 'Not set');
    
    if (!url || !apiKey || !instance) {
      const response = {
        status: 'error',
        message: 'Evolution API configuration incomplete',
        details: {
          hasUrl: !!url,
          hasKey: !!apiKey,
          hasInstance: !!instance
        }
      };
      console.log('❌ Configuration incomplete');
      return res.status(400).json(response);
    }

    // Test basic connectivity
    console.log('🔍 Testing basic API connectivity...');
    const response = await fetch(`${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    const isApiOnline = response.status === 200;
    console.log('   API Status:', response.status);
    console.log('   API Online:', isApiOnline ? 'Yes' : 'No');
    
    // Test instance status
    console.log('🔍 Testing instance status...');
    const instanceResponse = await fetch(`${url}/instance/${instance}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    const isInstanceActive = instanceResponse.status === 200;
    console.log('   Instance Status:', instanceResponse.status);
    console.log('   Instance Active:', isInstanceActive ? 'Yes' : 'No');
    
    const result = {
      status: isApiOnline ? (isInstanceActive ? 'active' : 'instance_inactive') : 'api_offline',
      message: isApiOnline ? 
        (isInstanceActive ? 'Evolution API and instance are active' : 'Evolution API is online but instance is inactive') :
        'Evolution API is offline',
      details: {
        apiOnline: isApiOnline,
        instanceActive: isInstanceActive,
        apiStatus: response.status,
        instanceStatus: instanceResponse.status,
        url,
        instance
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ Status check completed:', result.status);
    res.json(result);
    
  } catch (error) {
    console.error('❌ Evolution API status check error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Error checking Evolution API status',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Evolution API comprehensive test endpoint (BEFORE authentication middleware)
app.get('/api/evolution/test-complete', async (req, res) => {
  try {
    console.log('🧪 Evolution API comprehensive test started');
    
    const url = process.env.EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;
    const instance = process.env.EVOLUTION_INSTANCE_NAME;
    
    const hasUrl = !!url;
    const hasKey = !!apiKey;
    const hasInstance = !!instance;
    
    console.log('📋 Configuration check:');
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

    const testResults = {
      configuration: { hasUrl, hasKey, hasInstance, url, instance },
      tests: {},
      timestamp: new Date().toISOString()
    };

    // Test 1: Basic API connectivity
    console.log('🧪 Test 1: Basic API connectivity');
    try {
      const response = await fetch(`${url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      testResults.tests.basicConnectivity = {
        status: response.status,
        success: response.status < 400,
        message: response.status < 400 ? 'API base accessible' : 'API base not accessible'
      };
      
      console.log('   Status:', response.status);
      console.log('   Result:', testResults.tests.basicConnectivity.success ? '✅' : '❌');
    } catch (error) {
      testResults.tests.basicConnectivity = {
        status: 'error',
        success: false,
        message: error.message
      };
      console.log('   ❌ Error:', error.message);
    }

    // Test 2: List instances
    console.log('🧪 Test 2: List instances');
    try {
      const response = await fetch(`${url}/instance/fetchInstances`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      const data = await response.json();
      testResults.tests.listInstances = {
        status: response.status,
        success: response.status === 200,
        data: data,
        message: response.status === 200 ? 'Instances listed successfully' : 'Failed to list instances'
      };
      
      console.log('   Status:', response.status);
      console.log('   Result:', testResults.tests.listInstances.success ? '✅' : '❌');
      console.log('   Instances found:', Array.isArray(data) ? data.length : 'N/A');
    } catch (error) {
      testResults.tests.listInstances = {
        status: 'error',
        success: false,
        message: error.message
      };
      console.log('   ❌ Error:', error.message);
    }

    // Test 3: Instance status
    console.log('🧪 Test 3: Instance status for', instance);
    try {
      const response = await fetch(`${url}/instance/${instance}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      const data = await response.json();
      testResults.tests.instanceStatus = {
        status: response.status,
        success: response.status === 200,
        data: data,
        message: response.status === 200 ? 'Instance status retrieved' : 'Instance not found or inactive'
      };
      
      console.log('   Status:', response.status);
      console.log('   Result:', testResults.tests.instanceStatus.success ? '✅' : '❌');
    } catch (error) {
      testResults.tests.instanceStatus = {
        status: 'error',
        success: false,
        message: error.message
      };
      console.log('   ❌ Error:', error.message);
    }

    // Import and test WhatsApp service
    console.log('🧪 Test 4: WhatsApp service functionality');
    try {
      const { whatsappService } = await import('./services/whatsappService');
      const testCode = whatsappService.generateVerificationCode();
      const isConnected = await whatsappService.checkConnection();
      
      testResults.tests.whatsappService = {
        success: isConnected,
        testCode: testCode,
        connection: isConnected,
        message: isConnected ? 'WhatsApp service operational' : 'WhatsApp service not connected'
      };
      
      console.log('   Test code generated:', testCode);
      console.log('   Connection result:', isConnected ? '✅' : '❌');
    } catch (error) {
      testResults.tests.whatsappService = {
        success: false,
        message: error.message
      };
      console.log('   ❌ Error:', error.message);
    }
    
    // Determine overall status
    const successfulTests = Object.values(testResults.tests).filter(test => test.success).length;
    const totalTests = Object.keys(testResults.tests).length;
    
    testResults.overallStatus = {
      success: successfulTests > 0,
      successfulTests: successfulTests,
      totalTests: totalTests,
      message: successfulTests === totalTests ? 'All tests passed' : 
               successfulTests > 0 ? 'Some tests passed' : 'All tests failed'
    };
    
    console.log('✅ Evolution API comprehensive test completed');
    console.log('📊 Results:', `${successfulTests}/${totalTests} tests passed`);
    
    res.json(testResults);
    
  } catch (error) {
    console.error('❌ Evolution API comprehensive test error:', error);
    res.json({
      status: 'error',
      message: 'Error running comprehensive Evolution API test',
      error: error.message,
      timestamp: new Date().toISOString()
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
