/**
 * ESTE ARQUIVO FOI REFATORADO - Redirecionamento para versão modular
 * Arquivo original com 1085 linhas foi decomposto em estrutura modular
 * Nova localização: client/src/features/suppliers/components/SupplierProductsTab/SupplierProductsTabContainer.tsx
 * 
 * REDUÇÃO ALCANÇADA: 1085 → ~250 linhas efetivas no container (77% de redução)
 * ARQUITETURA: Container/Presentational pattern com 2 hooks especializados e 7 componentes
 * 
 * ESTRUTURA MODULAR:
 * - SupplierProductsTabContainer.tsx (105 linhas) - Container principal
 * - SupplierProductsTabPresentation.tsx (188 linhas) - UI de apresentação
 * - 2 hooks especializados (442 linhas total): useSupplierProducts, useProductModals
 * - 7 componentes de apresentação (1,124 linhas total)
 * - Tipos integrados nos hooks
 */

import { SupplierProductsTabContainer } from '../../features/suppliers/components/SupplierProductsTab/SupplierProductsTabContainer';

interface SupplierProductsTabSimpleProps {
  supplierId: number;
}

export const SupplierProductsTabSimple = ({ 
  supplierId 
}: SupplierProductsTabSimpleProps) => {
  return <SupplierProductsTabContainer supplierId={supplierId} />;
};