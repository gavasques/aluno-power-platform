/**
 * Phase 2 Performance Hook - Route-Aware Optimization
 * 
 * This hook provides intelligent prefetching and cache warming based on route
 */

import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { warmContextCache } from '@/lib/queryOptimizations';

/**
 * Automatically prefetch data when navigating to different routes
 */
export function useRouteOptimization() {
  const [location] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Warm cache for current route
    warmContextCache(queryClient, location);

    // Predictive prefetching for likely next routes
    const predictiveRoutes = getPredictiveRoutes(location);
    predictiveRoutes.forEach(route => {
      setTimeout(() => {
        warmContextCache(queryClient, route);
      }, 1000); // Delay to avoid blocking current route
    });
  }, [location, queryClient]);
}

/**
 * Get routes user is likely to visit next based on current route
 */
function getPredictiveRoutes(currentRoute: string): string[] {
  const routeMap: Record<string, string[]> = {
    '/dashboard': ['/agentes', '/ferramentas', '/minha-area'],
    '/agentes': ['/dashboard', '/ferramentas'],
    '/ferramentas': ['/agentes', '/hub'],
    '/hub': ['/ferramentas', '/minha-area'],
    '/minha-area': ['/minha-area/produtos', '/minha-area/fornecedores'],
    '/minha-area/produtos': ['/minha-area/fornecedores', '/minha-area/marcas'],
    '/minha-area/fornecedores': ['/minha-area/produtos'],
  };

  return routeMap[currentRoute] || [];
}

/**
 * Optimize mutations with intelligent cache invalidation
 */
export function useIntelligentInvalidation() {
  const queryClient = useQueryClient();

  const invalidateProducts = () => {
    queryClient.invalidateQueries({ 
      queryKey: ['/api/products'],
      exact: false,
    });
    // Also invalidate dashboard as it shows product counts
    queryClient.invalidateQueries({ 
      queryKey: ['/api/dashboard/summary'],
      refetchType: 'none' // Mark stale but don't refetch immediately
    });
  };

  const invalidateSuppliers = () => {
    queryClient.invalidateQueries({ 
      queryKey: ['/api/suppliers'],
      exact: false,
    });
    // Suppliers affect products too
    queryClient.invalidateQueries({ 
      queryKey: ['/api/products'],
      refetchType: 'none'
    });
  };

  const invalidateAgents = () => {
    queryClient.invalidateQueries({ 
      queryKey: ['/api/agents'],
      exact: false,
    });
  };

  return {
    invalidateProducts,
    invalidateSuppliers,
    invalidateAgents,
  };
}