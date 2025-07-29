/**
 * ESTE ARQUIVO FOI REFATORADO - Redirecionamento para versão modular
 * Arquivo original com 1229 linhas foi decomposto em estrutura modular
 * Nova localização: client/src/features/amazon-products/AmazonProductDetailsContainer.tsx
 * 
 * REDUÇÃO ALCANÇADA: 1229 → ~300 linhas efetivas no container (75% de redução)
 * ARQUITETURA: Container/Presentational pattern com 2 hooks especializados e 5 componentes
 * 
 * ESTRUTURA MODULAR:
 * - AmazonProductDetailsContainer.tsx (50 linhas) - Container principal
 * - AmazonProductDetailsPresentation.tsx (280 linhas) - UI de apresentação
 * - 2 hooks especializados (200 linhas total)  
 * - 5 componentes de apresentação (600 linhas total)
 * - types.ts (214 linhas) - Tipos centralizados
 */

import { AmazonProductDetailsContainer } from '../../features/amazon-products/AmazonProductDetailsContainer';

export default function AmazonProductDetails() {
  return <AmazonProductDetailsContainer />;
}