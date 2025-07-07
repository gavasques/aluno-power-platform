import { Request, Response, NextFunction } from 'express';
import { permissionService } from '../services/permissionService';

// Extend Request interface to include credit info
declare global {
  namespace Express {
    interface Request {
      creditInfo?: {
        creditsDebited: number;
        remainingCredits: number;
        userGroup: string;
      };
    }
  }
}

/**
 * Middleware para verificar permissões de acesso e debitar créditos
 * @param featureKey Chave da funcionalidade a ser verificada
 */
export const checkFeaturePermission = (featureKey: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          error: 'Usuário não autenticado',
          code: 'UNAUTHORIZED'
        });
      }
      
      // Verificar permissões e debitar créditos
      const result = await permissionService.debitCreditsWithPermissionCheck(userId, featureKey);
      
      if (!result.hasPermission) {
        return res.status(403).json({
          error: result.errorMessage,
          code: 'ACCESS_DENIED',
          userGroup: result.userGroup,
          featureKey
        });
      }
      
      if (!result.success) {
        return res.status(400).json({
          error: result.errorMessage,
          code: 'INSUFFICIENT_CREDITS',
          userGroup: result.userGroup,
          remainingCredits: result.remainingCredits
        });
      }
      
      // Adicionar informações ao request para uso posterior
      req.creditInfo = {
        creditsDebited: result.creditsDebited,
        remainingCredits: result.remainingCredits,
        userGroup: result.userGroup || 'FREE'
      };
      
      next();
      
    } catch (error) {
      console.error('Erro no middleware de permissões:', error);
      return res.status(500).json({
        error: 'Erro interno do sistema',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

/**
 * Middleware apenas para verificar permissões (sem debitar créditos)
 * @param featureKey Chave da funcionalidade a ser verificada
 */
export const checkFeatureAccess = (featureKey: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          error: 'Usuário não autenticado',
          code: 'UNAUTHORIZED'
        });
      }
      
      // Apenas verificar permissões sem debitar créditos
      const result = await permissionService.checkFeatureAccess(userId, featureKey);
      
      if (!result.hasAccess) {
        return res.status(403).json({
          error: result.reason,
          code: 'ACCESS_DENIED',
          userGroup: result.userGroup,
          featureKey,
          featureName: result.featureName
        });
      }
      
      // Adicionar informações ao request
      req.creditInfo = {
        creditsDebited: 0,
        remainingCredits: 0, // Será preenchido se necessário
        userGroup: result.userGroup
      };
      
      next();
      
    } catch (error) {
      console.error('Erro no middleware de verificação de acesso:', error);
      return res.status(500).json({
        error: 'Erro interno do sistema',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

/**
 * Função utilitária para reembolsar créditos em caso de erro
 * @param req Request object contendo creditInfo
 * @param userId ID do usuário
 */
export const refundCreditsOnError = async (req: Request, userId: number): Promise<void> => {
  if (req.creditInfo && req.creditInfo.creditsDebited > 0) {
    console.log(`Reembolsando ${req.creditInfo.creditsDebited} créditos para usuário ${userId}`);
    await permissionService.refundCredits(userId, req.creditInfo.creditsDebited);
  }
};