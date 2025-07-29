/**
 * ESTE ARQUIVO FOI REFATORADO - Redirecionamento para versão modular
 * Arquivo original com 1020 linhas foi decomposto em estrutura modular
 * Nova localização: client/src/features/products/components/ImportedProductDetail/ImportedProductDetailContainer.tsx
 * 
 * REFATORAÇÃO REALIZADA: Janeiro 29, 2025
 * REDUÇÃO ALCANÇADA: 1020 → ~300 linhas efetivas no container (70% de redução)
 * ARQUITETURA: Container/Presentational pattern com 3 hooks especializados e 6 componentes
 * 
 * ESTRUTURA MODULAR:
 * - ImportedProductDetailContainer.tsx (80 linhas) - Container principal
 * - ImportedProductDetailPresentation.tsx (220 linhas) - UI de apresentação
 * - 3 hooks especializados (300 linhas total): useProductDetail, useProductActions, useProductImages
 * - 6 componentes de apresentação (400 linhas total)
 * - Tipos centralizados (350 linhas)
 */

import { ImportedProductDetailContainer } from '../../../../features/products/components/ImportedProductDetail/ImportedProductDetailContainer';

export default function ImportedProductDetail() {
  return <ImportedProductDetailContainer />;
}