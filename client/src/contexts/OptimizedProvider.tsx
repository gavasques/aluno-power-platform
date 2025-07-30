/**
 * OptimizedProvider - Nova arquitetura de contextos consolidada
 * Substitui CombinedProvider com arquitetura otimizada
 */

import React, { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { UserProvider } from './UserContext';
import { UIProvider } from './UIContext';

interface OptimizedProviderProps {
  children: ReactNode;
}

/**
 * Provider otimizado que consolida contextos relacionados
 * Reduz de 9 providers para 3 providers funcionais
 * 
 * Arquitetura:
 * 1. QueryClient - Para dados do servidor (cache automático)
 * 2. UserProvider - Para autenticação e permissões
 * 3. UIProvider - Para estado de interface
 */
export function OptimizedProvider({ children }: OptimizedProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <UIProvider>
          {children}
        </UIProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

// Re-export dos hooks principais para facilitar migração
export { useUser, useAuth, usePermissions } from './UserContext';
export { 
  useUI, 
  useTheme, 
  useSidebar, 
  useModals, 
  useNotifications, 
  useGlobalLoading, 
  useGlobalSearch 
} from './UIContext';