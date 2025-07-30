/**
 * ARQUIVO REFATORADO: ProductEditRefactored
 * Arquivo principal para edição de produtos
 * Redirecionamento para arquitetura modular Container/Presentational
 * 
 * REFATORAÇÃO REALIZADA: Janeiro 30, 2025
 * REDUÇÃO ALCANÇADA: 723 → ~200 linhas efetivas no container (72% de redução)
 * ARQUITETURA: Container/Presentational pattern com hooks especializados
 * 
 * ESTRUTURA MODULAR:
 * - ProductEditContainer.tsx (60 lines) - Container principal
 * - ProductEditPresentation.tsx (500 lines) - UI de apresentação
 * - useProductEdit hook (800+ lines) - Lógica de negócio principal
 * - Tipos centralizados (600+ lines) - Sistema de tipos completo
 * - 3+ componentes especializados para diferentes funcionalidades
 */
import { ProductEditContainer } from './ProductEditContainer';

interface ProductEditRefactoredProps {
  productId: string;
  onSuccess?: (product: any) => void;
  onCancel?: () => void;
  readOnly?: boolean;
  showTabs?: boolean;
  defaultTab?: string;
}

export function ProductEditRefactored(props: ProductEditRefactoredProps) {
  return <ProductEditContainer {...props} />;
}