import React, { ReactNode, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { PartnersProvider } from "./PartnersContext";
import { SuppliersProvider } from "./SuppliersContext";
import { MaterialsProvider } from "./MaterialsContext";
import { ProductProvider } from "./ProductContext";
import { ToolsProvider } from "./ToolsContext";

import { PromptsProvider } from "./PromptsContext";
import { YoutubeProvider } from "./YoutubeContext";
import { AgentsProvider } from "./AgentsContext";
import { PermissionProvider } from "./PermissionContext";
import { useBackgroundSync } from "@/lib/queryOptimizations";

interface CombinedProviderProps {
  children: ReactNode;
}

/**
 * Combined provider that groups related contexts to optimize performance
 * and reduce provider nesting depth.
 * 
 * Phase 2 Optimization: Implements background sync and context-aware caching
 */
export function CombinedProvider({ children }: CombinedProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <PermissionProvider>
        <YoutubeProvider>
          <PartnersProvider>
            <SuppliersProvider>
              <MaterialsProvider>
                <ProductProvider>
                  <ToolsProvider>
                    <PromptsProvider>
                      <AgentsProvider>
                        <BackgroundSyncWrapper>
                          {children}
                        </BackgroundSyncWrapper>
                      </AgentsProvider>
                    </PromptsProvider>
                  </ToolsProvider>
                </ProductProvider>
              </MaterialsProvider>
            </SuppliersProvider>
          </PartnersProvider>
        </YoutubeProvider>
      </PermissionProvider>
    </QueryClientProvider>
  );
}

// Wrapper component to initialize background sync after QueryClient is available
function BackgroundSyncWrapper({ children }: { children: ReactNode }) {
  // Re-enable background sync now that QueryClient is available
  useBackgroundSync();
  return <>{children}</>;
}