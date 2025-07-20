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
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autorização necessário' });
    }

    const token = authHeader.substring(7);
    
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Validate session token with database
    const user = await AuthService.validateSession(token);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Sessão inválida ou expirada' });
    }

    // Attach sanitized user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Falha na autenticação' });
  }
};