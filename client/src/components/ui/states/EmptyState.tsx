/**
 * Componente reutilizável para estados vazios
 * Elimina duplicação dos estados empty nos managers
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'search' | 'filter';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
  size = 'md',
  variant = 'default'
}: EmptyStateProps) {
  const sizeClasses = {
    sm: { 
      container: 'py-8', 
      icon: 'h-8 w-8', 
      title: 'text-base', 
      description: 'text-sm',
      spacing: 'mb-3'
    },
    md: { 
      container: 'py-12', 
      icon: 'h-12 w-12', 
      title: 'text-lg', 
      description: 'text-base',
      spacing: 'mb-4'
    },
    lg: { 
      container: 'py-16', 
      icon: 'h-16 w-16', 
      title: 'text-xl', 
      description: 'text-lg',
      spacing: 'mb-6'
    }
  };

  const classes = sizeClasses[size];

  const variantStyles = {
    default: 'text-gray-400',
    search: 'text-orange-400',
    filter: 'text-blue-400'
  };

  return (
    <div className={`text-center ${classes.container} ${className}`}>
      {Icon && (
        <Icon className={`${classes.icon} ${variantStyles[variant]} mx-auto ${classes.spacing}`} />
      )}
      
      <h3 className={`${classes.title} font-medium text-gray-900 ${classes.spacing.replace('mb-', 'mb-2')}`}>
        {title}
      </h3>
      
      <p className={`${classes.description} text-gray-600 ${classes.spacing}`}>
        {description}
      </p>
      
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          className="inline-flex items-center gap-2"
          variant={variant === 'default' ? 'default' : 'outline'}
        >
          {variant === 'default' && <Plus className="h-4 w-4" />}
          {actionLabel}
        </Button>
      )}
    </div>
  );
}