import React, { ReactNode } from 'react';
import { PartnersProvider } from "./PartnersContext";
import { SuppliersProvider } from "./SuppliersContext";
import { MaterialsProvider } from "./MaterialsContext";
import { ProductProvider } from "./ProductContext";
import { ToolsProvider } from "./ToolsContext";
import { TemplatesProvider } from "./TemplatesContext";
import { PromptsProvider } from "./PromptsContext";
import { YoutubeProvider } from "./YoutubeContext";
import { AgentsProvider } from "./AgentsContext";
import { PermissionProvider } from "./PermissionContext";

interface CombinedProviderProps {
  children: ReactNode;
}

/**
 * Combined provider that groups related contexts to optimize performance
 * and reduce provider nesting depth
 */
export function CombinedProvider({ children }: CombinedProviderProps) {
  return (
    <PermissionProvider>
      <YoutubeProvider>
        <PartnersProvider>
          <SuppliersProvider>
            <MaterialsProvider>
              <ProductProvider>
                <ToolsProvider>
                  <TemplatesProvider>
                    <PromptsProvider>
                      <AgentsProvider>
                        {children}
                      </AgentsProvider>
                    </PromptsProvider>
                  </TemplatesProvider>
                </ToolsProvider>
              </ProductProvider>
            </MaterialsProvider>
          </SuppliersProvider>
        </PartnersProvider>
      </YoutubeProvider>
    </PermissionProvider>
  );
}