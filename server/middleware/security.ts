import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { fraudDetectionService } from '../services/fraudDetection';
import { auditLogger } from '../services/auditLogger';

// Rate limiting configurations
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por IP
  message: {
    error: 'Muitas requisições. Tente novamente em 15 minutos.',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas de login por IP
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const paymentRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 3, // 3 tentativas de pagamento por IP
  message: {
    error: 'Muitas tentativas de pagamento. Tente novamente em 5 minutos.',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware de detecção de fraude para pagamentos
export const fraudDetectionMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const { amount, paymentMethod } = req.body;
    if (!amount) {
      return next();
    }

    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    const fraudCheck = await fraudDetectionService.analyzeFraud({
      userId: user.id,
      amount: parseFloat(amount),
      paymentMethod: paymentMethod || 'unknown',
      ipAddress,
      userAgent,
    });

    // Log da tentativa de pagamento
    await auditLogger.logPaymentAction(
      user.id,
      'payment_created',
      req.body.paymentIntentId || 'unknown',
      parseFloat(amount),
      ipAddress,
      userAgent
    );

    if (fraudCheck.shouldBlock) {
      await auditLogger.logSecurityAction(
        user.id,
        'fraud_detected',
        {
          riskScore: fraudCheck.riskScore,
          flags: fraudCheck.flags,
          amount: parseFloat(amount),
        },
        ipAddress,
        userAgent
      );

      return res.status(403).json({
        error: 'Transação bloqueada por motivos de segurança',
        code: 'FRAUD_DETECTED',
        riskLevel: fraudCheck.riskLevel,
      });
    }

    if (fraudCheck.requiresReview) {
      await auditLogger.logSecurityAction(
        user.id,
        'suspicious_activity',
        {
          riskScore: fraudCheck.riskScore,
          flags: fraudCheck.flags,
          amount: parseFloat(amount),
        },
        ipAddress,
        userAgent
      );

      // Continuar mas marcar para revisão
      (req as any).requiresReview = true;
      (req as any).fraudAnalysis = fraudCheck;
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de detecção de fraude:', error);
    next(); // Continuar em caso de erro para não quebrar o fluxo
  }
};

// Middleware de auditoria para ações do usuário
export const auditMiddleware = (action: string, resource: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';

      // Capturar dados antigos para operações de update/delete
      let oldValues = null;
      if (['update', 'delete'].includes(action) && req.params.id) {
        // Aqui você poderia buscar os dados antigos do banco
        // oldValues = await getResourceById(resource, req.params.id);
      }

      // Log da ação
      if (user) {
        await auditLogger.logUserAction(
          user.id,
          action,
          resource,
          req.params.id || req.body.id || 'unknown',
          ipAddress,
          userAgent,
          {
            method: req.method,
            path: req.path,
            body: req.body,
          }
        );
      }

      next();
    } catch (error) {
      console.error('Erro no middleware de auditoria:', error);
      next(); // Continuar em caso de erro
    }
  };
};

// Middleware de validação de input
export const inputValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Sanitizar query parameters
  if (req.query) {
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'string') {
        // Remover caracteres perigosos
        req.query[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '');
      }
    }
  }

  // Sanitizar body
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }

  next();
};

function sanitizeObject(obj: any): void {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      obj[key] = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '');
    } else if (typeof value === 'object' && value !== null) {
      sanitizeObject(value);
    }
  }
}

// Middleware de verificação de IP suspeito
export const ipSecurityMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Lista básica de IPs bloqueados (em produção, usar banco de dados)
    const blockedIPs = [
      // IPs conhecidos por atividade maliciosa
    ];

    if (blockedIPs.includes(ipAddress)) {
      await auditLogger.log({
        action: 'blocked_ip_access',
        resource: 'security',
        ipAddress,
        userAgent: req.get('User-Agent') || 'unknown',
        metadata: {
          path: req.path,
          method: req.method,
        },
      });

      return res.status(403).json({
        error: 'Acesso negado',
        code: 'IP_BLOCKED',
      });
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de segurança IP:', error);
    next();
  }
};

// Middleware de validação de sessão
export const sessionValidationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return next();
    }

    // Verificar se a conta não está bloqueada
    if (!user.isActive) {
      await auditLogger.logAuthAction(
        user.id,
        'failed_login',
        req.ip || 'unknown',
        req.get('User-Agent') || 'unknown',
        { reason: 'account_inactive' }
      );

      return res.status(403).json({
        error: 'Conta inativa',
        code: 'ACCOUNT_INACTIVE',
      });
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de validação de sessão:', error);
    next();
  }
};

// Middleware de headers de segurança
export const securityHeadersMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';");
  
  next();
};