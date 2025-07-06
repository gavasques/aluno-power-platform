import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerCompleteModularRoutes } from "./modularRoutes";
import { setupVite, serveStatic, log } from "./vite";
import { scheduler } from "./services/scheduler";

const app = express();
app.use(compression()); // Enable gzip compression

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
  const server = await registerCompleteModularRoutes(app);

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

    res.status(status).json({ 
      message,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
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
  }, () => {
    log(`serving on port ${port}`);
    
    // Start the YouTube video scheduler
    scheduler.start();
  });
})();
