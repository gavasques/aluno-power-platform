import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Express, Request, Response, NextFunction } from 'express';

/**
 * Enhanced Security Middleware based on security audit recommendations
 */

// Rate limiting for API endpoints
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.',
    status: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Relaxed rate limiting for authentication endpoints to allow normal usage
export const authRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes  
  max: 50, // limit each IP to 50 auth requests per 5 minutes (10 per minute)
  message: {
    error: 'Muitas tentativas de autenticação. Tente novamente em 5 minutos.',
    status: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for /me endpoint (user status checks)
    return req.path === '/api/auth/me';
  }
});

// Rate limiting for simulator endpoints
export const simulatorRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 simulator requests per windowMs
  message: {
    error: 'Muitas tentativas de simulação. Tente novamente em 15 minutos.',
    status: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security headers configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:", "https:"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow iframe embedding for admin panel
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize query parameters
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = (req.query[key] as string)
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '');
      }
    }
  }

  // Sanitize body parameters
  if (req.body && typeof req.body === 'object') {
    const sanitizeObject = (obj: any): any => {
      if (typeof obj === 'string') {
        return obj
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '');
      } else if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      } else if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const key in obj) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
        return sanitized;
      }
      return obj;
    };

    req.body = sanitizeObject(req.body);
  }

  next();
};

// Enhanced error handler with security considerations
export const secureErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('🚨 [SECURITY_ERROR]', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    success: false,
    error: isDevelopment ? err.message : 'Erro interno do servidor',
    ...(isDevelopment && { stack: err.stack })
  });
};

// CORS configuration for enhanced security
export const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    // Allow development origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://core.guivasques.app',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

/**
 * Apply all security enhancements to Express app
 */
export function applySecurityEnhancements(app: Express) {
  // Apply security headers
  app.use(securityHeaders);
  
  // Apply input sanitization to all routes
  app.use(sanitizeInput);
  
  // Apply general API rate limiting
  app.use('/api/', apiRateLimit);
  
  // Apply strict rate limiting to auth routes
  app.use('/api/auth/', authRateLimit);
  
  // Apply simulator rate limiting
  app.use('/api/simulations/', simulatorRateLimit);
  app.use('/api/investment-simulations/', simulatorRateLimit);
  
  console.log('🔒 [SECURITY] Enhanced security middleware applied');
}