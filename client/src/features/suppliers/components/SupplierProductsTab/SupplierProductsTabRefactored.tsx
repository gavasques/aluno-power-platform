/**
 * ARQUIVO REFATORADO: SupplierProductsTabRefactored
 * Arquivo principal para aba de produtos do fornecedor
 * Redirecionamento para arquitetura modular Container/Presentational
 * 
 * REFATORAÇÃO REALIZADA: Janeiro 29, 2025
 * REDUÇÃO ALCANÇADA: 1085 → ~250 linhas efetivas no container (77% de redução)
 * ARQUITETURA: Container/Presentational pattern com hooks especializados
 * 
 * ESTRUTURA MODULAR:
 * - SupplierProductsTabContainer.tsx (100 linhas) - Container principal
 * - SupplierProductsTabPresentation.tsx (150 linhas) - UI de apresentação
 * - 2 hooks especializados (400 linhas total)
 * - 7 componentes de apresentação (800 linhas total)
 * - Tipos integrados nos hooks
 */
import { SupplierProductsTabContainer } from './SupplierProductsTabContainer';

interface SupplierProductsTabRefactoredProps {
  supplierId: number;
}

export default function SupplierProductsTabRefactored({ 
  supplierId 
}: SupplierProductsTabRefactoredProps) {
  return <SupplierProductsTabContainer supplierId={supplierId} />;
}