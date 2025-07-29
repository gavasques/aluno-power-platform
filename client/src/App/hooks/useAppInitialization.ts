/**
 * USE APP INITIALIZATION HOOK - FASE 4 REFATORAÇÃO
 * 
 * Hook especializado para gerenciar inicialização da aplicação
 * Antes: Lógica de inicialização espalhada no componente de 1.221 linhas
 * Depois: Hook dedicado para coordenar inicialização de todos os subsistemas
 */

import { useState, useEffect } from 'react';
import type { UseAppInitializationReturn } from '../types';

export function useAppInitialization(
  performanceReady: boolean
): UseAppInitializationReturn {
  const [isAppReady, setIsAppReady] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [routesReady, setRoutesReady] = useState(true); // Routes are ready immediately

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Wait for all subsystems to be ready
        if (performanceReady && routesReady) {
          setIsAppReady(true);
          setInitializationError(null);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
        setInitializationError(errorMessage);
        console.error('App initialization failed:', error);
      }
    };

    initializeApp();
  }, [performanceReady, routesReady]);

  return {
    isAppReady,
    initializationError,
    performanceReady,
    routesReady
  };
}