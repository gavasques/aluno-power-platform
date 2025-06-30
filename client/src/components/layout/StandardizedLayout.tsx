import React, { memo, useMemo, Suspense } from 'react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

// Layout system with performance optimizations
interface LayoutProps {
  children: React.ReactNode;
  variant?: 'default' | 'admin' | 'minimal' | 'dashboard' | 'auth';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

// Optimized loading component
const LayoutSkeleton = memo(() => (
  <div className="animate-pulse">
    <div className="h-16 bg-muted/20 mb-4" />
    <div className="h-8 bg-muted/20 mb-6 w-1/3" />
    <div className="space-y-4">
      <div className="h-4 bg-muted/20 w-full" />
      <div className="h-4 bg-muted/20 w-5/6" />
      <div className="h-4 bg-muted/20 w-4/6" />
    </div>
  </div>
));
LayoutSkeleton.displayName = 'LayoutSkeleton';

// Responsive header component
const ResponsiveHeader = memo<{ variant: string }>(({ variant }) => {
  const { user } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Navigation items based on user role and context
  const navigationItems = useMemo(() => {
    const baseItems = [
      { title: 'Dashboard', href: '/', icon: '📊' },
      { title: 'Hub de Recursos', href: '/hub', icon: '📚' },
      { title: 'Agentes IA', href: '/agents', icon: '🤖' },
      { title: 'Vídeos', href: '/videos', icon: '🎥' },
    ];

    if (user?.role === 'admin') {
      baseItems.push({ title: 'Admin', href: '/admin', icon: '⚙️' });
    }

    return baseItems;
  }, [user?.role]);

  if (variant === 'minimal' || variant === 'auth') return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <a href="/" className="font-bold text-xl">
              Aluno Power
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location === item.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                <span className="mr-2">{item.icon}</span>
                {item.title}
              </a>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {user.name}
                </span>
                <button
                  onClick={() => window.location.href = '/auth/logout'}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Sair
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="px-4 py-4 space-y-2">
              {navigationItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block py-2 text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.title}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
});
ResponsiveHeader.displayName = 'ResponsiveHeader';

// Breadcrumb component
const SmartBreadcrumbs = memo(() => {
  const [location] = useLocation();
  
  const breadcrumbs = useMemo(() => {
    const paths = location.split('/').filter(Boolean);
    const items = [{ label: 'Início', href: '/' }];
    
    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const label = path.charAt(0).toUpperCase() + path.slice(1);
      items.push({ label, href: currentPath });
    });
    
    return items;
  }, [location]);

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className="border-b bg-muted/30 px-4 py-2">
      <div className="container mx-auto">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index > 0 && <span className="mx-2 text-muted-foreground">/</span>}
              <a
                href={item.href}
                className={cn(
                  "hover:text-primary transition-colors",
                  index === breadcrumbs.length - 1
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
});
SmartBreadcrumbs.displayName = 'SmartBreadcrumbs';

// Main standardized layout component
export const StandardizedLayout = memo<LayoutProps>(({
  children,
  variant = 'default',
  maxWidth = 'xl',
  padding = 'md',
  className
}) => {
  const [location] = useLocation();
  
  // Auto-detect variant based on route if not specified
  const detectedVariant = useMemo(() => {
    if (location.startsWith('/admin')) return 'admin';
    if (location.startsWith('/auth') || location === '/login') return 'auth';
    if (location === '/') return 'dashboard';
    return variant;
  }, [location, variant]);

  // Layout configuration
  const config = useMemo(() => {
    const configs = {
      default: {
        header: true,
        breadcrumbs: true,
        maxWidth: 'xl',
        padding: 'md',
        background: 'bg-background',
      },
      admin: {
        header: true,
        breadcrumbs: true,
        maxWidth: 'full',
        padding: 'lg',
        background: 'bg-background',
      },
      minimal: {
        header: false,
        breadcrumbs: false,
        maxWidth: 'lg',
        padding: 'sm',
        background: 'bg-transparent',
      },
      dashboard: {
        header: true,
        breadcrumbs: false,
        maxWidth: 'full',
        padding: 'md',
        background: 'bg-muted/30',
      },
      auth: {
        header: false,
        breadcrumbs: false,
        maxWidth: 'sm',
        padding: 'lg',
        background: 'bg-background',
      },
    };
    
    return configs[detectedVariant] || configs.default;
  }, [detectedVariant]);

  // CSS classes for layout structure
  const layoutClasses = useMemo(() => {
    return cn(
      'min-h-screen flex flex-col',
      config.background,
      className
    );
  }, [config.background, className]);

  const containerClasses = useMemo(() => {
    const maxWidthClasses = {
      sm: 'max-w-sm',
      md: 'max-w-2xl',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      '2xl': 'max-w-7xl',
      full: 'max-w-full',
    };

    const paddingClasses = {
      none: '',
      sm: 'p-2 sm:p-4',
      md: 'p-4 sm:p-6 lg:p-8',
      lg: 'p-6 sm:p-8 lg:p-12',
    };

    return cn(
      'w-full mx-auto',
      maxWidthClasses[maxWidth],
      paddingClasses[padding]
    );
  }, [maxWidth, padding]);

  return (
    <div className={layoutClasses}>
      {/* Header */}
      {config.header && (
        <Suspense fallback={<div className="h-16 bg-muted/20 animate-pulse" />}>
          <ResponsiveHeader variant={detectedVariant} />
        </Suspense>
      )}

      {/* Breadcrumbs */}
      {config.breadcrumbs && (
        <Suspense fallback={<div className="h-8 bg-muted/20 animate-pulse" />}>
          <SmartBreadcrumbs />
        </Suspense>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className={containerClasses}>
          <Suspense fallback={<LayoutSkeleton />}>
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  );
});

StandardizedLayout.displayName = 'StandardizedLayout';

// Performance-optimized page wrapper
export const PageWrapper = memo<{
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}>(({ children, title, description, actions, className }) => (
  <div className={cn('space-y-6', className)}>
    {/* Page Header */}
    {(title || description || actions) && (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {title && (
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          )}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    )}

    {/* Page Content */}
    <div className="space-y-6">
      {children}
    </div>
  </div>
));

PageWrapper.displayName = 'PageWrapper';

// Grid system for consistent layouts
export const ResponsiveGrid = memo<{
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}>(({ children, columns = 3, gap = 'md', className }) => {
  const gridClasses = useMemo(() => {
    const columnClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
    };

    const gapClasses = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
    };

    return cn(
      'grid',
      columnClasses[columns],
      gapClasses[gap],
      className
    );
  }, [columns, gap, className]);

  return <div className={gridClasses}>{children}</div>;
});

ResponsiveGrid.displayName = 'ResponsiveGrid';

export default StandardizedLayout;