import React, { ReactNode, useEffect } from 'react';
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
  // Initialize background sync for all contexts
  useBackgroundSync();

  return (
    <PermissionProvider>
      <YoutubeProvider>
        <PartnersProvider>
          <SuppliersProvider>
            <MaterialsProvider>
              <ProductProvider>
                <ToolsProvider>
                  <PromptsProvider>
                    <AgentsProvider>
                      {children}
                    </AgentsProvider>
                  </PromptsProvider>
                </ToolsProvider>
              </ProductProvider>
            </MaterialsProvider>
          </SuppliersProvider>
        </PartnersProvider>
      </YoutubeProvider>
    </PermissionProvider>
  );
}