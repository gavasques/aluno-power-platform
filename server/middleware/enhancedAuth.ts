import { Request, Response, NextFunction } from 'express';
import { requireAuth } from '../security';

// Whitelist of public API endpoints that don't require authentication
const PUBLIC_API_ENDPOINTS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/health',
  '/api/stripe/webhook', // Stripe webhooks have their own signature verification
  '/api/youtube-videos', // Public video listing
  '/api/news/published', // Public news
  '/api/updates/published', // Public updates
  '/api/agents', // Public agents listing
  '/api/news/published/preview', // Public news preview
  '/api/updates/published/preview', // Public updates preview
];

// Endpoints that require specific handling
const SPECIAL_ENDPOINTS = {
  upload: [
    '/api/temp-image/upload',
    '/api/suppliers/\\d+/files',
    '/api/partners/\\d+/files',
    '/api/materials/\\d+/files',
    '/api/background-removal/process',
    '/api/infographics/generate-prompt',
  ],
  readOnly: [
    '/api/dashboard/summary',
    '/api/permissions/check',
    '/api/permissions/user-features',
    '/api/news/published/preview',
    '/api/updates/published/preview',
  ]
};

// Check if endpoint matches any pattern
function matchesPattern(path: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(path);
  });
}

// Enhanced authentication middleware
export const enhancedAuth = async (req: Request, res: Response, next: NextFunction) => {
  // Skip authentication for non-API routes
  if (!req.path.startsWith('/api')) {
    return next();
  }

  // Check if this is a public endpoint
  if (PUBLIC_API_ENDPOINTS.includes(req.path) || matchesPattern(req.path, PUBLIC_API_ENDPOINTS)) {
    return next();
  }

  // Check if it's a public GET endpoint (like specific news/update items)
  const publicGetPatterns = [
    '/api/news/\\d+',
    '/api/updates/\\d+',
    '/api/youtube-videos/\\d+',
    '/api/tools$', // Tools listing is public
    '/api/tool-types$',
    '/api/partners$', // Partners listing is public
    '/api/materials$', // Materials listing is public
    '/api/agents/[^/]+$', // Specific agent by ID is public
  ];

  if (req.method === 'GET' && matchesPattern(req.path, publicGetPatterns)) {
    return next();
  }

  // Apply authentication for all other API routes
  await requireAuth(req, res, next);
};

// Enhanced CSRF protection for state-changing operations
export const enhancedCSRF = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for Stripe webhooks (they use signature verification)
  if (req.path === '/api/stripe/webhook') {
    return next();
  }

  // Skip CSRF for public auth endpoints
  const publicAuthEndpoints = ['/api/auth/login', '/api/auth/register'];
  if (publicAuthEndpoints.includes(req.path)) {
    return next();
  }

  // For now, we'll just pass through since CSRF tokens need frontend implementation
  // In production, you should implement proper CSRF token validation here
  next();
};

// Rate limiting for sensitive operations
export const sensitiveOperationLimiter = (maxAttempts: number = 3, windowMinutes: number = 15) => {
  const attempts = new Map<string, { count: number; resetTime: Date }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return next();

    const key = `${user.id}-${req.path}-${req.method}`;
    const now = new Date();
    const userAttempts = attempts.get(key);

    if (userAttempts && userAttempts.resetTime > now) {
      if (userAttempts.count >= maxAttempts) {
        return res.status(429).json({
          error: 'Too many attempts',
          details: `Please try again after ${Math.ceil((userAttempts.resetTime.getTime() - now.getTime()) / 60000)} minutes`
        });
      }
      userAttempts.count++;
    } else {
      attempts.set(key, {
        count: 1,
        resetTime: new Date(now.getTime() + windowMinutes * 60000)
      });
    }

    next();
  };
};

// IP-based rate limiting for anonymous operations
export const anonymousRateLimiter = (maxRequests: number = 10, windowMinutes: number = 1) => {
  const requests = new Map<string, { count: number; resetTime: Date }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = new Date();
    const ipRequests = requests.get(ip);

    if (ipRequests && ipRequests.resetTime > now) {
      if (ipRequests.count >= maxRequests) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          details: 'Too many requests from this IP address'
        });
      }
      ipRequests.count++;
    } else {
      requests.set(ip, {
        count: 1,
        resetTime: new Date(now.getTime() + windowMinutes * 60000)
      });
    }

    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance on each request
      const cutoff = new Date();
      for (const [key, value] of requests.entries()) {
        if (value.resetTime < cutoff) {
          requests.delete(key);
        }
      }
    }

    next();
  };
};