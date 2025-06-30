import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { useLocation } from 'wouter';

interface AdminStandardLayoutProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };
  children: React.ReactNode;
}

// Ultra-lightweight admin layout - minimal CSS, maximum performance
const AdminStandardLayout = memo(({ 
  title, 
  description, 
  showBackButton = false, 
  primaryAction,
  children 
}: AdminStandardLayoutProps) => {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Minimal header - no shadows or heavy effects */}
      <div className="bg-white border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation('/admin')}
                  className="p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                {description && (
                  <p className="text-sm text-gray-500">{description}</p>
                )}
              </div>
            </div>
            
            {primaryAction && (
              <Button onClick={primaryAction.onClick} size="sm">
                {primaryAction.icon && <primaryAction.icon className="h-4 w-4 mr-2" />}
                {primaryAction.label}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content area - minimal padding, no unnecessary containers */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
});

AdminStandardLayout.displayName = 'AdminStandardLayout';

// Lightweight card component for admin sections
export const AdminCard = memo(({ 
  title, 
  children, 
  actions,
  className = "",
  onClick
}: {
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <Card 
    className={`border-gray-200/60 shadow-none bg-white/80 ${className}`}
    onClick={onClick}
  >
    {title && (
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          {actions}
        </div>
      </CardHeader>
    )}
    <CardContent className={title ? "pt-0" : ""}>
      {children}
    </CardContent>
  </Card>
));

AdminCard.displayName = 'AdminCard';

// Ultra-minimal grid for admin pages
export const AdminGrid = memo(({ 
  children, 
  columns = 'auto-fit',
  gap = 'md'
}: {
  children: React.ReactNode;
  columns?: 'auto-fit' | 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}) => {
  const gridCols = columns === 'auto-fit' 
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    : `grid-cols-${columns}`;
  
  const gapSize = {
    sm: 'gap-3',
    md: 'gap-4', 
    lg: 'gap-6'
  }[gap];

  return (
    <div className={`grid ${gridCols} ${gapSize}`}>
      {children}
    </div>
  );
});

AdminGrid.displayName = 'AdminGrid';

// Simple loading state for admin pages
export const AdminLoader = memo(() => (
  <div className="space-y-4">
    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
    <AdminGrid>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
      ))}
    </AdminGrid>
  </div>
));

AdminLoader.displayName = 'AdminLoader';

export default AdminStandardLayout;