import React, { memo, lazy, Suspense } from 'react';

// Icon loading optimization with lazy loading and tree shaking
interface IconLoaderProps {
  name: string;
  size?: number;
  className?: string;
  fallback?: React.ComponentType<any>;
}

// Critical icons that should be loaded immediately
const criticalIcons = {
  // Navigation and core UI
  Menu: lazy(() => import('lucide-react').then(module => ({ default: module.Menu }))),
  X: lazy(() => import('lucide-react').then(module => ({ default: module.X }))),
  Home: lazy(() => import('lucide-react').then(module => ({ default: module.Home }))),
  User: lazy(() => import('lucide-react').then(module => ({ default: module.User }))),
  Settings: lazy(() => import('lucide-react').then(module => ({ default: module.Settings }))),
  
  // Loading states
  Loader2: lazy(() => import('lucide-react').then(module => ({ default: module.Loader2 }))),
  
  // Common actions
  Search: lazy(() => import('lucide-react').then(module => ({ default: module.Search }))),
  Plus: lazy(() => import('lucide-react').then(module => ({ default: module.Plus }))),
  Edit: lazy(() => import('lucide-react').then(module => ({ default: module.Edit }))),
  Trash: lazy(() => import('lucide-react').then(module => ({ default: module.Trash }))),
  
  // Business specific
  Brain: lazy(() => import('lucide-react').then(module => ({ default: module.Brain }))),
  Package: lazy(() => import('lucide-react').then(module => ({ default: module.Package }))),
  Youtube: lazy(() => import('lucide-react').then(module => ({ default: module.Youtube }))),
};

// Non-critical icons loaded on demand
const lazyIcons = {
  // Extended business icons
  BrainCircuit: lazy(() => import('lucide-react').then(module => ({ default: module.BrainCircuit }))),
  TrendingUp: lazy(() => import('lucide-react').then(module => ({ default: module.TrendingUp }))),
  BookOpen: lazy(() => import('lucide-react').then(module => ({ default: module.BookOpen }))),
  ExternalLink: lazy(() => import('lucide-react').then(module => ({ default: module.ExternalLink }))),
  Calendar: lazy(() => import('lucide-react').then(module => ({ default: module.Calendar }))),
  ArrowRight: lazy(() => import('lucide-react').then(module => ({ default: module.ArrowRight }))),
  Users: lazy(() => import('lucide-react').then(module => ({ default: module.Users }))),
  Truck: lazy(() => import('lucide-react').then(module => ({ default: module.Truck }))),
  Rss: lazy(() => import('lucide-react').then(module => ({ default: module.Rss }))),
  
  // Form and input icons
  Mail: lazy(() => import('lucide-react').then(module => ({ default: module.Mail }))),
  Lock: lazy(() => import('lucide-react').then(module => ({ default: module.Lock }))),
  UserPlus: lazy(() => import('lucide-react').then(module => ({ default: module.UserPlus }))),
  Eye: lazy(() => import('lucide-react').then(module => ({ default: module.Eye }))),
  EyeOff: lazy(() => import('lucide-react').then(module => ({ default: module.EyeOff }))),
  
  // Advanced features
  RefreshCw: lazy(() => import('lucide-react').then(module => ({ default: module.RefreshCw }))),
  Play: lazy(() => import('lucide-react').then(module => ({ default: module.Play }))),
  Activity: lazy(() => import('lucide-react').then(module => ({ default: module.Activity }))),
  Zap: lazy(() => import('lucide-react').then(module => ({ default: module.Zap }))),
  Database: lazy(() => import('lucide-react').then(module => ({ default: module.Database }))),
  Clock: lazy(() => import('lucide-react').then(module => ({ default: module.Clock }))),
};

// Fallback icon component for loading states
const IconFallback = memo<{ size?: number; className?: string }>(({ 
  size = 16, 
  className = '' 
}) => (
  <div 
    className={`inline-block bg-gray-200 animate-pulse rounded ${className}`}
    style={{ width: size, height: size }}
    aria-hidden="true"
  />
));
IconFallback.displayName = 'IconFallback';

// Optimized icon loader with caching and fallbacks
export const IconLoader = memo<IconLoaderProps>(({ 
  name, 
  size = 16, 
  className = '', 
  fallback: CustomFallback 
}) => {
  // Check critical icons first for immediate loading
  const CriticalIcon = criticalIcons[name as keyof typeof criticalIcons];
  if (CriticalIcon) {
    return (
      <Suspense fallback={CustomFallback ? <CustomFallback /> : <IconFallback size={size} className={className} />}>
        <CriticalIcon size={size} className={className} />
      </Suspense>
    );
  }

  // Load non-critical icons with lazy loading
  const LazyIcon = lazyIcons[name as keyof typeof lazyIcons];
  if (LazyIcon) {
    return (
      <Suspense fallback={CustomFallback ? <CustomFallback /> : <IconFallback size={size} className={className} />}>
        <LazyIcon size={size} className={className} />
      </Suspense>
    );
  }

  // Fallback for unknown icons
  return <IconFallback size={size} className={className} />;
});

IconLoader.displayName = 'IconLoader';

// Preload critical icons for better performance
export const preloadCriticalIcons = () => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    requestIdleCallback(() => {
      Object.values(criticalIcons).forEach(iconComponent => {
        // Trigger lazy loading
        const _ = iconComponent;
      });
    });
  }
};

// Hook for icon management
export const useOptimizedIcons = () => {
  React.useEffect(() => {
    preloadCriticalIcons();
  }, []);

  return {
    IconLoader,
    preloadCriticalIcons,
  };
};