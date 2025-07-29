/**
 * APP PRESENTATION - FASE 4 REFATORAÇÃO
 * 
 * Componente de apresentação pura para renderização da aplicação
 * Responsabilidade única: Renderizar interface baseada em props recebidas
 * 
 * Antes: UI misturada com lógica em 1.221 linhas
 * Depois: Componente de apresentação focado apenas em renderização
 */

import React from 'react';
import { Router, Route, Switch } from "wouter";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from '@/components/ui/toast';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from "../contexts/AuthContext";
import { CombinedProvider } from "../contexts/CombinedProvider";
import { HelmetProvider } from 'react-helmet-async';
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import type { AppPresentationProps } from './types';

// Loading screen for app initialization
const AppLoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">Inicializando aplicação...</p>
    </div>
  </div>
);

// Error screen for initialization failures
const AppErrorScreen = ({ error }: { error: string }) => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center space-y-4 max-w-md mx-auto p-6">
      <div className="text-red-500 text-6xl">⚠️</div>
      <h1 className="text-2xl font-bold text-foreground">Erro na Inicialização</h1>
      <p className="text-muted-foreground">{error}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Tentar Novamente
      </button>
    </div>
  </div>
);

export function AppPresentation({
  routeConfigHook,
  layoutHook,
  performanceHook,
  initializationHook
}: AppPresentationProps) {
  
  // Show loading screen during initialization
  if (!initializationHook.isAppReady) {
    if (initializationHook.initializationError) {
      return <AppErrorScreen error={initializationHook.initializationError} />;
    }
    return <AppLoadingScreen />;
  }

  const { allRoutes } = routeConfigHook;
  const { renderWithLayout } = layoutHook;

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeProvider>
          <ToastProvider 
            theme="system" 
            position="top-right" 
            richColors 
            closeButton
          >
            <HelmetProvider>
              <AuthProvider>
                <CombinedProvider>
                <Switch>
                  {/* Render all routes dynamically */}
                  {allRoutes.map((route) => (
                    <Route key={route.path} path={route.path}>
                      {() => renderWithLayout(
                        route.component,
                        route.layout || 'default',
                        route.isProtected !== false
                      )}
                    </Route>
                  ))}
                  
                  {/* Fallback route */}
                  <Route>
                    {() => renderWithLayout(
                      () => (
                        <div className="flex items-center justify-center min-h-screen">
                          <div className="text-center space-y-4">
                            <h1 className="text-2xl font-bold">Página não encontrada</h1>
                            <p className="text-muted-foreground">A página que você está procurando não existe.</p>
                            <button 
                              onClick={() => window.location.href = '/'}
                              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                            >
                              Voltar ao Início
                            </button>
                          </div>
                        </div>
                      ),
                      'default',
                      true
                    )}
                  </Route>
                </Switch>
                  <Toaster />
                </CombinedProvider>
              </AuthProvider>
            </HelmetProvider>
          </ToastProvider>
        </ThemeProvider>
      </Router>
    </QueryClientProvider>
  );
}