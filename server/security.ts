import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { z } from 'zod';
import crypto from 'crypto';
import validator from 'validator';
import { logger } from './utils/logger';

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Only set HSTS in production with HTTPS
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://replit.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' wss: ws:; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self';"
  );
  
  next();
};

// Rate limiting configurations
export const createRateLimit = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health' || req.path === '/api/health';
    }
  });
};

// API rate limiting
export const apiLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many API requests from this IP, please try again later'
);

// Authentication rate limiting (stricter)
export const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 login attempts per window
  'Too many login attempts from this IP, please try again later'
);

// Parameter validation middleware
export const validateIdParam = (req: Request, res: Response, next: NextFunction) => {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ 
      error: 'Invalid ID parameter',
      details: 'ID must be a positive integer'
    });
  }
  req.params.validatedId = id.toString();
  next();
};

// Query parameter sanitization
export const sanitizeQuery = (req: Request, res: Response, next: NextFunction) => {
  if (req.query.q && typeof req.query.q === 'string') {
    // Remove potentially dangerous characters
    req.query.q = req.query.q.replace(/[<>\"'%;()&+]/g, '');
    // Limit query length
    if (req.query.q.length > 100) {
      req.query.q = req.query.q.substring(0, 100);
    }
  }
  next();
};

// Error response sanitizer
export const sanitizeError = (error: any): { error: string; details?: string } => {
  // Never expose stack traces in production
  if (process.env.NODE_ENV === 'production') {
    return {
      error: 'An error occurred',
      details: 'Please contact support if the problem persists'
    };
  }
  
  // In development, provide more details but sanitize sensitive data
  let message = error.message || 'Unknown error';
  
  // Remove potential sensitive data patterns
  message = message.replace(/password/gi, '***');
  message = message.replace(/token/gi, '***');
  message = message.replace(/key/gi, '***');
  
  return {
    error: message,
    details: error.details || undefined
  };
};

// Input sanitization functions
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Trim whitespace
  let sanitized = input.trim();
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Escape HTML entities
  sanitized = validator.escape(sanitized);
  
  // Remove control characters except newline and tab
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  return sanitized;
};

// Sanitize search query specifically
export const sanitizeSearchQuery = (query: string): string => {
  if (!query || typeof query !== 'string') {
    return '';
  }
  
  // Basic sanitization
  let sanitized = sanitizeInput(query);
  
  // Limit length for search queries
  sanitized = sanitized.substring(0, 100);
  
  // Remove SQL injection attempts
  sanitized = sanitized.replace(/(['";\\])/g, '\\$1');
  
  // Remove common SQL keywords used in injection
  const sqlKeywords = /\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|SCRIPT|--)\b/gi;
  sanitized = sanitized.replace(sqlKeywords, '');
  
  return sanitized;
};

// Sanitize filename
export const sanitizeFilename = (filename: string): string => {
  if (!filename || typeof filename !== 'string') {
    return '';
  }
  
  // Get base name to remove any path traversal attempts
  const basename = filename.replace(/^.*[\\\/]/, '');
  
  // Remove special characters, keep only alphanumeric, dots, dashes, and underscores
  let sanitized = basename.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.substring(sanitized.lastIndexOf('.'));
    const name = sanitized.substring(0, sanitized.lastIndexOf('.'));
    sanitized = name.substring(0, 255 - ext.length) + ext;
  }
  
  return sanitized;
};

// Sanitize URL
export const sanitizeUrl = (url: string): string => {
  if (!url || typeof url !== 'string') {
    return '';
  }
  
  try {
    // Validate URL
    if (!validator.isURL(url, { 
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true
    })) {
      return '';
    }
    
    // Parse and reconstruct to ensure it's clean
    const parsed = new URL(url);
    
    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    
    return parsed.toString();
  } catch (error) {
    return '';
  }
};

// Middleware to sanitize all query parameters
export const sanitizeQueryParams = (req: Request, res: Response, next: NextFunction) => {
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      const value = req.query[key];
      if (typeof value === 'string') {
        req.query[key] = sanitizeInput(value);
      } else if (Array.isArray(value)) {
        req.query[key] = value.map(v => typeof v === 'string' ? sanitizeInput(v) : v) as any;
      }
    });
  }
  next();
};

// Middleware to sanitize all body parameters
export const sanitizeBody = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    const sanitizeObject = (obj: any): any => {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          sanitized[key] = sanitizeInput(value);
        } else if (Array.isArray(value)) {
          sanitized[key] = value.map(v => 
            typeof v === 'string' ? sanitizeInput(v) : 
            typeof v === 'object' && v !== null ? sanitizeObject(v) : v
          );
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = sanitizeObject(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    };
    
    req.body = sanitizeObject(req.body);
  }
  next();
};

// Middleware to sanitize search parameters
export const sanitizeSearchParam = (req: Request, res: Response, next: NextFunction) => {
  if (req.params.query) {
    req.params.query = sanitizeSearchQuery(req.params.query);
  }
  
  if (req.params.search) {
    req.params.search = sanitizeSearchQuery(req.params.search);
  }
  
  next();
};

// CSRF token generation and validation
const csrfTokens = new Map<string, { token: string; createdAt: Date }>();

export const generateCSRFToken = (sessionId: string): string => {
  const token = crypto.randomBytes(32).toString('hex');
  csrfTokens.set(sessionId, {
    token,
    createdAt: new Date()
  });
  
  // Clean old tokens every hour
  setTimeout(() => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    for (const [sid, data] of csrfTokens.entries()) {
      if (data.createdAt < oneHourAgo) {
        csrfTokens.delete(sid);
      }
    }
  }, 60 * 60 * 1000);
  
  return token;
};

export const validateCSRFToken = (sessionId: string, token: string): boolean => {
  const storedData = csrfTokens.get(sessionId);
  if (!storedData) return false;
  
  // Check if token is valid and not expired (1 hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return storedData.token === token && storedData.createdAt > oneHourAgo;
};

// CSRF protection middleware
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Skip CSRF for public endpoints
  const publicPaths = ['/api/auth/login', '/api/auth/register', '/api/health'];
  if (publicPaths.includes(req.path)) {
    return next();
  }
  
  const sessionId = (req as any).sessionId;
  const csrfToken = req.headers['x-csrf-token'] as string || req.body?._csrf;
  
  if (!sessionId || !csrfToken || !validateCSRFToken(sessionId, csrfToken)) {
    return res.status(403).json({ error: 'Invalid or missing CSRF token' });
  }
  
  next();
};

// Authentication middleware - Optimized logging
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  logger.trace('Authentication request received', {
    hasAuth: !!req.headers.authorization,
    userAgent: req.headers['user-agent']?.substring(0, 50)
  }, 'AUTH');
  
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    logger.warn('Authentication required - missing token', {
      path: req.path,
      method: req.method
    }, 'AUTH');
    return res.status(401).json({ 
      error: 'Authentication required',
      details: 'Please provide a valid authorization token'
    });
  }
  
  try {
    // Import AuthService here to avoid circular dependency
    const { AuthService } = await import('./services/authService.js');
    
    // Validate the session token
    const user = await AuthService.validateSession(token);
    
    if (!user) {
      logger.warn('Invalid or expired token', {
        tokenPrefix: token.substring(0, 10),
        path: req.path
      }, 'AUTH');
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        details: 'Please login again'
      });
    }
    
    // Set user information on request object
    (req as any).user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      username: user.username
    };
    
    logger.debug('User authenticated successfully', {
      userId: user.id,
      userRole: user.role,
      path: req.path
    }, 'AUTH');
    
    next();
  } catch (error) {
    logger.error('Token validation error', { 
      error: error.message,
      path: req.path 
    }, 'AUTH');
    return res.status(401).json({ 
      error: 'Authentication failed',
      details: 'Please login again'
    });
  }
};

// Role-based authorization middleware - Optimized logging
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.id;
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      logger.warn('Insufficient permissions', {
        userId,
        userRole,
        requiredRoles: allowedRoles,
        path: req.path
      }, 'AUTH');
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        details: `This operation requires one of: ${allowedRoles.join(', ')}`
      });
    }
    
    logger.trace('Role authorization successful', {
      userId,
      userRole,
      path: req.path
    }, 'AUTH');
    
    next();
  };
};