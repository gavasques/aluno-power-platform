import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { PermissionService } from '../services/permissionService';
import { AuditService } from '../services/auditServiceSimple';

// Permission middleware factory
export const requirePermission = (feature: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          error: 'Authentication required' 
        });
      }

      console.log(`🔐 [PERMISSION] Checking access for user ${req.user.id} to feature: ${feature}`);

      const hasAccess = await PermissionService.hasAccess(req.user.id, feature);
      
      if (!hasAccess) {
        console.log(`🔐 [PERMISSION] Access denied for user ${req.user.id} to feature: ${feature}`);
        
        // Log denied access for audit
        await AuditService.logDeniedAccess(
          req.user.id,
          req.method,
          req.path,
          feature,
          'Insufficient permissions'
        );
        
        return res.status(403).json({ 
          success: false,
          error: 'Acesso negado a esta funcionalidade',
          feature: feature
        });
      }

      console.log(`🔐 [PERMISSION] Access granted for user ${req.user.id} to feature: ${feature}`);
      
      // Log successful access for audit
      await AuditService.logSuccessfulAccess(
        req.user.id,
        req.method,
        req.path,
        feature,
        { userAgent: req.get('User-Agent'), ipAddress: req.ip }
      );
      
      next();
    } catch (error) {
      console.error('🔐 [PERMISSION] Error checking permissions:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Erro interno ao verificar permissões' 
      });
    }
  };
};

// Granular permission checks for common operations
export const requireProductAccess = requirePermission('myarea.products');
export const requireSupplierAccess = requirePermission('myarea.suppliers'); 
export const requireMaterialAccess = requirePermission('hub.materials');
export const requireToolAccess = requirePermission('hub.tools');
export const requireAgentAccess = (agentType: string) => requirePermission(`agents.${agentType}`);
export const requireSimulatorAccess = (simulatorType: string) => requirePermission(`simulators.${simulatorType}`);

// Admin-only access
export const requireAdminAccess = requirePermission('admin.access');
export const requireContentManagement = requirePermission('admin.content');
export const requireUserManagement = requirePermission('admin.users');

// Data export/import permissions
export const requireDataExport = requirePermission('data.export');
export const requireDataImport = requirePermission('data.import');

// Combined permission checker for multiple features
export const requireAnyPermission = (features: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          error: 'Authentication required' 
        });
      }

      console.log(`🔐 [PERMISSION] Checking any access for user ${req.user.id} to features: ${features.join(', ')}`);

      for (const feature of features) {
        const hasAccess = await PermissionService.hasAccess(req.user.id, feature);
        if (hasAccess) {
          console.log(`🔐 [PERMISSION] Access granted for user ${req.user.id} to feature: ${feature}`);
          return next();
        }
      }

      console.log(`🔐 [PERMISSION] Access denied for user ${req.user.id} to all features: ${features.join(', ')}`);
      return res.status(403).json({ 
        success: false,
        error: 'Acesso negado a esta funcionalidade',
        features: features
      });
    } catch (error) {
      console.error('🔐 [PERMISSION] Error checking permissions:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Erro interno ao verificar permissões' 
      });
    }
  };
};

// Role-based access control
export const requireRole = (roles: string | string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      console.log(`🔐 [ROLE] Access denied for user ${req.user.id} with role ${req.user.role}. Required: ${allowedRoles.join(', ')}`);
      return res.status(403).json({ 
        success: false,
        error: 'Acesso negado - privilégios insuficientes',
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }

    console.log(`🔐 [ROLE] Access granted for user ${req.user.id} with role ${req.user.role}`);
    next();
  };
};

// Admin role shortcut
export const requireAdmin = requireRole('admin');
export const requireAdminOrSupport = requireRole(['admin', 'support']);