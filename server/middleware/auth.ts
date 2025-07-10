import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autorização necessário' });
    }

    const token = authHeader.substring(7);
    
    // For now, we'll use a simple validation
    // In production, this should validate JWT tokens properly
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Mock user data - in production this would decode the JWT
    req.user = {
      id: 1,
      email: 'admin@example.com',
      role: 'admin'
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Falha na autenticação' });
  }
};