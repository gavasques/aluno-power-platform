/**
 * BaseCard Component - Unified card component eliminating duplicates
 * Consolidates card patterns from 10+ components across the codebase
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export interface BaseCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badges?: Array<{
    label: string;
    variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive';
  }>;
  actions?: React.ReactNode;
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
}

const badgeVariants = {
  default: 'bg-gray-100 text-gray-800',
  secondary: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  destructive: 'bg-red-100 text-red-800'
};

export function BaseCard({
  title,
  subtitle,
  icon,
  badges,
  actions,
  children,
  isLoading = false,
  className = '',
  headerClassName = '',
  contentClassName = '',
  footerClassName = ''
}: BaseCardProps) {
  return (
    <div className={cn('bg-white rounded-lg border shadow-sm', className)}>
      {/* Header */}
      <div className={cn('p-4 border-b', headerClassName)}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex-shrink-0 text-gray-500">
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
        
        {/* Badges */}
        {badges && badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {badges.map((badge, index) => (
              <span
                key={index}
                className={cn(
                  'px-2 py-1 text-xs font-medium rounded-full',
                  badgeVariants[badge.variant]
                )}
              >
                {badge.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cn('p-4', contentClassName)}>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

// Convenience component for status cards
export interface StatusCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

export function StatusCard({
  title,
  value,
  description,
  icon,
  trend,
  variant = 'default',
  className = ''
}: StatusCardProps) {
  const variantStyles = {
    default: 'border-gray-200',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    error: 'border-red-200 bg-red-50'
  };

  return (
    <div className={cn('p-4 rounded-lg border', variantStyles[variant], className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 text-gray-400">
            {icon}
          </div>
        )}
      </div>
      
      {trend && (
        <div className="mt-3 flex items-center">
          <span className={cn(
            'text-sm font-medium',
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          )}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-sm text-gray-500 ml-2">{trend.label}</span>
        </div>
      )}
    </div>
  );
}

// Convenience component for action cards
export interface ActionCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  buttonText: string;
  onAction: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ActionCard({
  title,
  description,
  icon,
  buttonText,
  onAction,
  isLoading = false,
  disabled = false,
  className = ''
}: ActionCardProps) {
  return (
    <div className={cn('p-4 border rounded-lg hover:bg-gray-50 transition-colors', className)}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex-shrink-0 text-gray-500 mt-1">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          <button
            onClick={onAction}
            disabled={disabled || isLoading}
            className="mt-3 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processando...' : buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}