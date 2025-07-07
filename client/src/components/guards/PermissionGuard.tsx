import React, { ReactNode } from 'react';
import { usePermissions } from '@/contexts/PermissionContext';
import { useToast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';

interface PermissionGuardProps {
  featureCode: string;
  children: ReactNode;
  fallback?: ReactNode;
  showMessage?: boolean;
  message?: string;
}

export function PermissionGuard({ 
  featureCode, 
  children, 
  fallback,
  showMessage = true,
  message
}: PermissionGuardProps) {
  const { hasAccess, isLoading } = usePermissions();
  const { toast } = useToast();

  // Show loading state while permissions are being fetched
  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 rounded h-10 w-full" />;
  }

  const hasPermission = hasAccess(featureCode);

  const handleAccessDenied = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (showMessage) {
      toast({
        title: "Acesso Negado",
        description: message || "Você não tem permissão para acessar este recurso. Entre em contato com o administrador.",
        variant: "destructive",
      });
    }
  };

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Return a grayed out version with click handler
    return (
      <div 
        className="relative cursor-not-allowed" 
        onClick={handleAccessDenied}
      >
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50">
          <Lock className="h-5 w-5 text-gray-500" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// HOC version for wrapping components
export function withPermissionGuard<P extends object>(
  Component: React.ComponentType<P>,
  featureCode: string,
  options?: {
    fallback?: ReactNode;
    showMessage?: boolean;
    message?: string;
  }
) {
  return (props: P) => (
    <PermissionGuard featureCode={featureCode} {...options}>
      <Component {...props} />
    </PermissionGuard>
  );
}