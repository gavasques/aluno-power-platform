/**
 * APP CONTAINER - FASE 4 REFATORAÇÃO
 * 
 * Container Component seguindo padrão Container/Presentational
 * Responsabilidade única: Orquestrar hooks e gerenciar lógica de negócio da aplicação
 * 
 * Antes: Lógica misturada no componente de 1.221 linhas
 * Depois: Container limpo focado apenas em coordenação de estado
 */

import React from 'react';
import { useRouteConfiguration } from './hooks/useRouteConfiguration';
import { useLayoutManager } from './hooks/useLayoutManager';
import { usePerformanceOptimization } from './hooks/usePerformanceOptimization';
import { useAppInitialization } from './hooks/useAppInitialization';
import { AppPresentation } from './AppPresentation';
import type { AppContainerProps } from './types';

export function AppContainer({}: AppContainerProps) {
  // Initialize specialized hooks
  const routeConfigHook = useRouteConfiguration();
  const layoutHook = useLayoutManager();
  const performanceHook = usePerformanceOptimization();
  
  // Initialize app coordination
  const initializationHook = useAppInitialization(performanceHook.isReady);

  // Pass all props to presentation component
  return (
    <AppPresentation
      routeConfigHook={routeConfigHook}
      layoutHook={layoutHook}
      performanceHook={performanceHook}
      initializationHook={initializationHook}
    />
  );
}