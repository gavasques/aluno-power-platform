import React, { memo, useMemo, Suspense } from 'react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';

// Layout variants for different contexts
export type LayoutVariant = 'default' | 'admin' | 'minimal' | 'dashboard' | 'auth';

// Responsive breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Layout configuration
interface LayoutConfig {
  variant: LayoutVariant;
  header?: boolean;
  sidebar?: boolean;
  breadcrumbs?: boolean;
  footer?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  background?: 'default' | 'muted' | 'card' | 'transparent';
  scroll?: 'auto' | 'hidden' | 'smooth';
}

// Default configurations for each variant
const variantConfigs: Record<LayoutVariant, LayoutConfig> = {
  default: {
    variant: 'default',
    header: true,
    breadcrumbs: true,
    maxWidth: '2xl',
    padding: 'md',
    background: 'default',
    scroll: 'auto',
  },
  admin: {
    variant: 'admin',
    header: true,
    sidebar: true,
    breadcrumbs: true,
    maxWidth: 'full',
    padding: 'lg',
    background: 'default',
    scroll: 'auto',
  },
  minimal: {
    variant: 'minimal',
    maxWidth: 'lg',
    padding: 'sm',
    background: 'transparent',
    scroll: 'smooth',
  },
  dashboard: {
    variant: 'dashboard',
    header: true,
    breadcrumbs: true,
    maxWidth: 'full',
    padding: 'md',
    background: 'muted',
    scroll: 'auto',
  },
  auth: {
    variant: 'auth',
    maxWidth: 'sm',
    padding: 'lg',
    background: 'card',
    scroll: 'hidden',
  },
};

// Import existing components directly for now
import { Header } from './Header';
import { AdminHeader } from './AdminHeader';
import { UserBreadcrumbs } from './UserBreadcrumbs';
import { AdminBreadcrumbs } from '../admin/AdminBreadcrumbs';

// Loading fallback component
const LayoutFallback = memo(() => (
  <div className="w-full h-12 bg-muted animate-pulse rounded" />
));
LayoutFallback.displayName = 'LayoutFallback';

interface OptimizedLayoutProps {
  children: React.ReactNode;
  config?: Partial<LayoutConfig>;
  className?: string;
}

export const OptimizedLayout = memo<OptimizedLayoutProps>(({ 
  children, 
  config = {}, 
  className 
}) => {
  const [location] = useLocation();
  
  // Auto-detect layout variant based on route
  const autoVariant: LayoutVariant = useMemo(() => {
    if (location.startsWith('/admin')) return 'admin';
    if (location.startsWith('/auth') || location.startsWith('/login')) return 'auth';
    if (location.startsWith('/dashboard')) return 'dashboard';
    if (location === '/' || location.includes('minimal')) return 'minimal';
    return 'default';
  }, [location]);

  // Merge configurations
  const finalConfig = useMemo(() => ({
    ...variantConfigs[autoVariant],
    ...config,
  }), [autoVariant, config]);

  // Generate CSS classes based on configuration
  const layoutClasses = useMemo(() => {
    const classes = [
      'min-h-screen',
      'flex',
      'flex-col',
      'transition-all',
      'duration-200',
      'ease-in-out',
    ];

    // Background
    switch (finalConfig.background) {
      case 'muted':
        classes.push('bg-muted/50');
        break;
      case 'card':
        classes.push('bg-card');
        break;
      case 'transparent':
        classes.push('bg-transparent');
        break;
      default:
        classes.push('bg-background');
    }

    // Scroll behavior
    if (finalConfig.scroll === 'smooth') {
      classes.push('scroll-smooth');
    } else if (finalConfig.scroll === 'hidden') {
      classes.push('overflow-hidden');
    }

    return cn(classes, className);
  }, [finalConfig, className]);

  // Main content classes
  const mainClasses = useMemo(() => {
    const classes = ['flex-1', 'flex', 'flex-col'];

    // Padding
    switch (finalConfig.padding) {
      case 'none':
        break;
      case 'sm':
        classes.push('p-2', 'sm:p-4');
        break;
      case 'lg':
        classes.push('p-6', 'sm:p-8', 'lg:p-12');
        break;
      default: // md
        classes.push('p-4', 'sm:p-6', 'lg:p-8');
    }

    return cn(classes);
  }, [finalConfig.padding]);

  // Container classes
  const containerClasses = useMemo(() => {
    const classes = ['w-full', 'mx-auto'];

    // Max width
    switch (finalConfig.maxWidth) {
      case 'sm':
        classes.push('max-w-sm');
        break;
      case 'md':
        classes.push('max-w-md');
        break;
      case 'lg':
        classes.push('max-w-4xl');
        break;
      case 'xl':
        classes.push('max-w-6xl');
        break;
      case '2xl':
        classes.push('max-w-7xl');
        break;
      case 'full':
        classes.push('max-w-full');
        break;
      case 'none':
        break;
      default:
        classes.push('max-w-7xl');
    }

    return cn(classes);
  }, [finalConfig.maxWidth]);

  // Determine which header to use
  const HeaderComponent = finalConfig.variant === 'admin' ? AdminHeader : Header;

  return (
    <div className={layoutClasses}>
      {/* Header Section */}
      {finalConfig.header && (
        <Suspense fallback={<LayoutFallback />}>
          <HeaderComponent />
        </Suspense>
      )}

      {/* Main Layout Container */}
      <div className="flex flex-1">
        {/* Sidebar Section */}
        {finalConfig.sidebar && (
          <Suspense fallback={<div className="w-64 bg-muted animate-pulse" />}>
            <Sidebar />
          </Suspense>
        )}

        {/* Main Content Area */}
        <main className={mainClasses}>
          {/* Breadcrumbs */}
          {finalConfig.breadcrumbs && (
            <Suspense fallback={<div className="h-8 bg-muted animate-pulse rounded mb-4" />}>
              <Breadcrumbs />
            </Suspense>
          )}

          {/* Content Container */}
          <div className={containerClasses}>
            {children}
          </div>
        </main>
      </div>

      {/* Footer Section */}
      {finalConfig.footer && (
        <Suspense fallback={<LayoutFallback />}>
          <Footer />
        </Suspense>
      )}
    </div>
  );
});

OptimizedLayout.displayName = 'OptimizedLayout';

// Layout context for sharing configuration
export const LayoutContext = React.createContext<LayoutConfig | null>(null);

// Hook to use layout configuration
export const useLayoutConfig = () => {
  const context = React.useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutConfig must be used within a LayoutProvider');
  }
  return context;
};

// Layout provider component
export const LayoutProvider = memo<{ 
  children: React.ReactNode; 
  config: LayoutConfig 
}>(({ children, config }) => (
  <LayoutContext.Provider value={config}>
    {children}
  </LayoutContext.Provider>
));

LayoutProvider.displayName = 'LayoutProvider';

// Responsive layout hook
export const useResponsiveLayout = () => {
  const [screenSize, setScreenSize] = React.useState<keyof typeof breakpoints>('lg');

  React.useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width >= 1536) setScreenSize('2xl');
      else if (width >= 1280) setScreenSize('xl');
      else if (width >= 1024) setScreenSize('lg');
      else if (width >= 768) setScreenSize('md');
      else setScreenSize('sm');
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return { screenSize, isMobile: screenSize === 'sm' };
};

// Pre-built layout variants as components
export const DefaultLayout = memo<{ children: React.ReactNode }>(({ children }) => (
  <OptimizedLayout config={variantConfigs.default}>
    {children}
  </OptimizedLayout>
));
DefaultLayout.displayName = 'DefaultLayout';

export const AdminLayout = memo<{ children: React.ReactNode }>(({ children }) => (
  <OptimizedLayout config={variantConfigs.admin}>
    {children}
  </OptimizedLayout>
));
AdminLayout.displayName = 'AdminLayout';

export const DashboardLayout = memo<{ children: React.ReactNode }>(({ children }) => (
  <OptimizedLayout config={variantConfigs.dashboard}>
    {children}
  </OptimizedLayout>
));
DashboardLayout.displayName = 'DashboardLayout';

export const AuthLayout = memo<{ children: React.ReactNode }>(({ children }) => (
  <OptimizedLayout config={variantConfigs.auth}>
    {children}
  </OptimizedLayout>
));
AuthLayout.displayName = 'AuthLayout';

export const MinimalLayout = memo<{ children: React.ReactNode }>(({ children }) => (
  <OptimizedLayout config={variantConfigs.minimal}>
    {children}
  </OptimizedLayout>
));
MinimalLayout.displayName = 'MinimalLayout';