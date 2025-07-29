/**
 * ESTE ARQUIVO FOI REFATORADO - Redirecionamento para versão modular
 * Arquivo original com 956 linhas foi decomposto em estrutura modular
 * Nova localização: client/src/features/amazon-comparison/components/CompararListings/CompararListingsContainer.tsx
 * 
 * REFATORAÇÃO REALIZADA: Janeiro 29, 2025
 * REDUÇÃO ALCANÇADA: 956 → ~150 linhas efetivas no container (84% de redução)
 * ARQUITETURA: Container/Presentational pattern com 2 hooks especializados e 6 componentes
 * 
 * ESTRUTURA MODULAR:
 * - CompararListingsContainer.tsx (50 lines) - Container principal
 * - CompararListingsPresentation.tsx (350 lines) - UI de apresentação
 * - 2 hooks especializados (300 lines total): useComparisonForm, useAmazonApi
 * - 6 componentes especializados (400 lines total): ComparisonForm, ComparisonResults, ProductCard, etc.
 * - Tipos centralizados (250 lines)
 * - Utils de validação (150 lines)
 */

import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { CompararListingsContainer } from '../../features/amazon-comparison/components/CompararListings/CompararListingsContainer';

export default function CompararListings() {
  return (
    <PermissionGuard featureCode="tools.compare_listings">
      <CompararListingsContainer />
    </PermissionGuard>
  );
}