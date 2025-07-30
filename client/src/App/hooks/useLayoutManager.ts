/**
 * USE LAYOUT MANAGER HOOK - FASE 4 REFATORAÇÃO
 * 
 * Hook especializado para gerenciar layouts da aplicação
 * Antes: Lógica de layout espalhada no componente de 1.221 linhas
 * Depois: Hook dedicado para gerenciamento de layouts
 */

import React, { ComponentType, Suspense } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import Layout from '../../components/layout/Layout';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import ProtectedRoute from '../../components/ProtectedRoute';
import type { 
  UseLayoutManagerReturn, 
  LayoutType, 
  LayoutProps 
} from '../types';

// Page Loader Component
const PageLoader = () => (
  React.createElement('div', { className: "flex items-center justify-center min-h-screen" },
    React.createElement(LoadingSpinner, { size: "lg" })
  )
);

export function useLayoutManager(): UseLayoutManagerReturn {
  
  const getLayoutComponent = (layoutType: LayoutType): ComponentType<LayoutProps> | null => {
    switch (layoutType) {
      case 'admin':
        return AdminLayout;
      case 'default':
        return Layout;
      case 'none':
        return null;
      default:
        return Layout;
    }
  };

  const renderWithLayout = (
    component: ComponentType<any>,
    layoutType: LayoutType = 'default',
    isProtected: boolean = true
  ): React.ReactNode => {
    const LayoutComponent = getLayoutComponent(layoutType);
    const ComponentToRender = component;

    // Create the component tree
    const wrappedComponent = React.createElement(
      Suspense,
      { fallback: React.createElement(PageLoader) },
      React.createElement(ComponentToRender)
    );

    // Apply layout wrapper if specified
    const layoutWrapped = LayoutComponent 
      ? React.createElement(LayoutComponent, { children: wrappedComponent })
      : wrappedComponent;

    // Apply protection wrapper if needed
    const finalComponent = isProtected 
      ? React.createElement(ProtectedRoute, { children: layoutWrapped })
      : layoutWrapped;

    return finalComponent;
  };

  return {
    renderWithLayout,
    getLayoutComponent
  };
}