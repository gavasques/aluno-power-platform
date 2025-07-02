import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { z } from 'zod';

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

// Authentication middleware
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  console.log('🔍 [AUTH] Request headers:', JSON.stringify({
    authorization: req.headers.authorization,
    'user-agent': req.headers['user-agent']?.substring(0, 50) + '...'
  }));
  
  const token = req.headers.authorization?.replace('Bearer ', '');
  console.log('🔍 [AUTH] Extracted token:', token ? token.substring(0, 10) + '...' : 'null');
  
  if (!token) {
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
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        details: 'Please login again'
      });
    }
    
    // Set user information on request object
    (req as any).user = {
      id: user.id,
      email: user.email
    };
    
    next();
  } catch (error) {
    console.error('❌ [AUTH] Token validation error:', error);
    return res.status(401).json({ 
      error: 'Authentication failed',
      details: 'Please login again'
    });
  }
};

// Role-based authorization middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.role;
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        details: `This operation requires one of: ${allowedRoles.join(', ')}`
      });
    }
    
    next();
  };
};