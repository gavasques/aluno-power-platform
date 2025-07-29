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
  ) => {
    const LayoutComponent = getLayoutComponent(layoutType);
    const ComponentToRender = component;

    // Create the component tree
    let renderedComponent = React.createElement(
      Suspense,
      { fallback: React.createElement(PageLoader) },
      React.createElement(ComponentToRender)
    );

    // Wrap with layout if specified
    if (LayoutComponent) {
      renderedComponent = React.createElement(
        LayoutComponent,
        {},
        renderedComponent
      );
    }

    // Wrap with protection if needed
    if (isProtected) {
      renderedComponent = React.createElement(
        ProtectedRoute,
        {},
        renderedComponent
      );
    }

    return renderedComponent;
  };

  return {
    renderWithLayout,
    getLayoutComponent
  };
}