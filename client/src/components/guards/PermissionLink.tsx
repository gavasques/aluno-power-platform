import React from 'react';
import { Link } from 'wouter';
import { usePermissions } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PermissionLinkProps {
  to: string;
  featureCode: string;
  children: React.ReactNode;
  className?: string;
  showLockIcon?: boolean;
  message?: string;
}

export function PermissionLink({ 
  to, 
  featureCode, 
  children, 
  className,
  showLockIcon = true,
  message
}: PermissionLinkProps) {
  const { hasAccess, isLoading } = usePermissions();
  const { toast } = useToast();

  if (isLoading) {
    return <span className="animate-pulse bg-gray-200 rounded h-4 w-20" />;
  }

  const hasPermission = hasAccess(featureCode);

  const handleClick = (e: React.MouseEvent) => {
    if (!hasPermission) {
      e.preventDefault();
      toast({
        title: "Acesso Negado",
        description: message || "Você não tem permissão para acessar este recurso.",
        variant: "destructive",
      });
    }
  };

  if (!hasPermission) {
    return (
      <span 
        className={cn(
          className,
          "cursor-not-allowed opacity-50 flex items-center gap-2"
        )}
        onClick={handleClick}
      >
        {children}
        {showLockIcon && <Lock className="h-3 w-3" />}
      </span>
    );
  }

  return (
    <Link 
      href={to} 
      className={className}
    >
      {children}
    </Link>
  );
}