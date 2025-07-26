import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

import { AuthService } from '../services/authService';

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('🔍 [AUTH] Request headers:', { 
      authorization: req.headers.authorization ? 'Bearer ' + req.headers.authorization.substring(7, 17) + '...' : 'missing',
      'user-agent': req.headers['user-agent']?.substring(0, 50) + '...'
    });

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔍 [AUTH] Missing or invalid authorization header');
      return res.status(401).json({ error: 'Authentication required - please login again' });
    }

    const token = authHeader.substring(7);
    console.log('🔍 [AUTH] Extracted token:', token.substring(0, 10) + '...');

    if (!token || token === 'null' || token === 'undefined') {
      console.log('🔍 [AUTH] Invalid token format');
      return res.status(401).json({ error: 'Authentication required - please login again' });
    }

    // Validate JWT token
    const decoded = AuthService.verifyToken(token);
    console.log('🔍 [AUTH] Token validation result:', decoded ? 'valid' : 'invalid');

    if (!decoded || !decoded.userId) {
      console.log('🔍 [AUTH] Token validation failed');
      return res.status(401).json({ error: 'Authentication required - please login again' });
    }

    // Get user from database
    const user = await AuthService.getUserById(decoded.userId);

    if (!user || !user.isActive) {
      console.log('🔍 [AUTH] User not found or inactive:', { userId: decoded.userId, userFound: !!user, isActive: user?.isActive });
      return res.status(401).json({ error: 'Authentication required - please login again' });
    }

    // Attach sanitized user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    console.log('🔍 [AUTH] Authentication successful for user:', user.email);
    next();
  } catch (error) {
    console.error('🔍 [AUTH] Middleware error:', error);
    return res.status(401).json({ error: 'Authentication required - please login again' });
  }
};