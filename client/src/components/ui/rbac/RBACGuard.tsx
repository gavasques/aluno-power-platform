/**
 * Componente para proteção baseada em RBAC
 */

import React from 'react';
import { useRBAC, Permission } from '@/hooks/useRBAC';
import { AlertCircle, Lock } from 'lucide-react';

interface RBACGuardProps {
  resource: string;
  action: Permission['action'];
  conditions?: Record<string, any>;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

// Componente para proteger elementos baseado em permissões
export function RBACGuard({
  resource,
  action,
  conditions,
  fallback,
  children
}: RBACGuardProps) {
  const { hasPermission, isLoading, error } = useRBAC();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 text-red-600 bg-red-50 rounded">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">Erro ao verificar permissões</span>
      </div>
    );
  }

  // Verificar permissão
  const hasAccess = hasPermission(resource, action, conditions);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Fallback padrão
    return (
      <div className="flex items-center gap-2 p-4 text-gray-500 bg-gray-50 rounded">
        <Lock className="h-4 w-4" />
        <span className="text-sm">Você não tem permissão para acessar este conteúdo</span>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook para usar como HOC
export function withRBACGuard<P extends object>(
  Component: React.ComponentType<P>,
  resource: string,
  action: Permission['action'],
  conditions?: Record<string, any>
) {
  return function RBACProtectedComponent(props: P) {
    return (
      <RBACGuard resource={resource} action={action} conditions={conditions}>
        <Component {...props} />
      </RBACGuard>
    );
  };
}

// Componente para esconder elementos sem permissão
export function RBACShow({
  resource,
  action,
  conditions,
  children
}: Omit<RBACGuardProps, 'fallback'>) {
  const { hasPermission, isLoading } = useRBAC();

  if (isLoading) return null;

  const hasAccess = hasPermission(resource, action, conditions);
  return hasAccess ? <>{children}</> : null;
}

// Componente para mostrar elementos condicionalmente
export function RBACHide({
  resource,
  action,
  conditions,
  children
}: Omit<RBACGuardProps, 'fallback'>) {
  const { hasPermission, isLoading } = useRBAC();

  if (isLoading) return null;

  const hasAccess = hasPermission(resource, action, conditions);
  return !hasAccess ? <>{children}</> : null;
}