/**
 * APP COMPONENT TYPES - FASE 4 REFATORAÇÃO
 * 
 * Tipos centralizados para o componente App principal
 * Antes: Tipos espalhados no componente de 1.221 linhas
 * Depois: Tipos centralizados e organizados por responsabilidade
 */

import { ComponentType, ReactNode } from 'react';

// Route Configuration Types
export interface RouteConfig {
  path: string;
  component: ComponentType<any>;
  isProtected?: boolean;
  layout?: 'default' | 'admin' | 'none';
  isEager?: boolean;
  preloadOrder?: number;
}

export interface RouteGroup {
  name: string;
  prefix?: string;
  routes: RouteConfig[];
  description?: string;
}

// Layout Types
export type LayoutType = 'default' | 'admin' | 'none';

export interface LayoutProps {
  children: ReactNode;
}

// Performance Types
export interface PerformanceConfig {
  enablePreloader: boolean;
  enableMemoryOptimization: boolean;
  enableBackgroundSync: boolean;
  enableFontLoader: boolean;
  enableIconOptimization: boolean;
}

// Protection Types
export interface ProtectionConfig {
  requireAuth: boolean;
  requireAdmin?: boolean;
  requirePermissions?: string[];
  redirectTo?: string;
}

// Hook Return Types
export interface UseRouteConfigurationReturn {
  routeGroups: RouteGroup[];
  allRoutes: RouteConfig[];
  getRouteByPath: (path: string) => RouteConfig | undefined;
  getRoutesByGroup: (groupName: string) => RouteConfig[];
}

export interface UseLayoutManagerReturn {
  renderWithLayout: (
    component: ComponentType<any>,
    layoutType: LayoutType,
    isProtected: boolean,
    params?: any
  ) => ReactNode;
  getLayoutComponent: (layoutType: LayoutType) => ComponentType<LayoutProps> | null;
}

export interface UsePerformanceOptimizationReturn {
  isReady: boolean;
  initializeOptimizations: () => void;
  getOptimizationStatus: () => PerformanceConfig;
}

export interface UseAppInitializationReturn {
  isAppReady: boolean;
  initializationError: string | null;
  performanceReady: boolean;
  routesReady: boolean;
}

// Component Props Types
export interface AppContainerProps {
  // Container doesn't need props for this use case
}

export interface AppPresentationProps {
  // Route configuration
  routeConfigHook: UseRouteConfigurationReturn;
  
  // Layout management
  layoutHook: UseLayoutManagerReturn;
  
  // Performance optimization
  performanceHook: UsePerformanceOptimizationReturn;
  
  // App initialization
  initializationHook: UseAppInitializationReturn;
}

// Route Definition Constants
export interface RouteDefinitions {
  // Main Routes
  MAIN_ROUTES: RouteConfig[];
  
  // Authentication Routes
  AUTH_ROUTES: RouteConfig[];
  
  // Admin Routes
  ADMIN_ROUTES: RouteConfig[];
  
  // Agent Routes
  AGENT_ROUTES: RouteConfig[];
  
  // Hub Routes
  HUB_ROUTES: RouteConfig[];
  
  // Tools Routes
  TOOLS_ROUTES: RouteConfig[];
  
  // My Area Routes
  MY_AREA_ROUTES: RouteConfig[];
  
  // Simulator Routes
  SIMULATOR_ROUTES: RouteConfig[];
  
  // Legal Routes
  LEGAL_ROUTES: RouteConfig[];
}

// Component Lazy Loading Types
export interface LazyComponentMap {
  [key: string]: () => Promise<{ default: ComponentType<any> }>;
}

// App Configuration
export interface AppConfig {
  performance: PerformanceConfig;
  routes: RouteDefinitions;
  layouts: {
    default: ComponentType<LayoutProps>;
    admin: ComponentType<LayoutProps>;
  };
}

// Error Types
export interface AppError extends Error {
  component?: string;
  route?: string;
  critical?: boolean;
}

// Loading State Types
export interface AppLoadingState {
  isLoading: boolean;
  loadingComponent?: string;
  loadingMessage?: string;
  progress?: number;
}

// Navigation Types
export interface NavigationState {
  currentPath: string;
  previousPath?: string;
  canGoBack: boolean;
  isNavigating: boolean;
}

// Constants
export const LAYOUT_TYPES = {
  DEFAULT: 'default' as const,
  ADMIN: 'admin' as const,
  NONE: 'none' as const
} as const;

export const ROUTE_PROTECTION_LEVELS = {
  PUBLIC: 'public' as const,
  PROTECTED: 'protected' as const,
  ADMIN_ONLY: 'admin_only' as const
} as const;

// Route Categories for Organization
export const ROUTE_CATEGORIES = {
  AUTH: 'Authentication',
  ADMIN: 'Administration', 
  AGENTS: 'AI Agents',
  HUB: 'Hub Resources',
  TOOLS: 'Tools & Utilities',
  MY_AREA: 'My Area',
  SIMULATORS: 'Simulators',
  LEGAL: 'Legal Pages'
} as const;

export type RouteCategoryKey = keyof typeof ROUTE_CATEGORIES;