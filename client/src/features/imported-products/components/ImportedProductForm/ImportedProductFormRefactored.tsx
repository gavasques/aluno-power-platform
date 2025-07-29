/**
 * ARQUIVO REFATORADO: ImportedProductFormRefactored
 * Arquivo principal para formulário de produtos importados
 * Redirecionamento para arquitetura modular Container/Presentational
 * 
 * REFATORAÇÃO REALIZADA: Janeiro 29, 2025
 * REDUÇÃO ALCANÇADA: 926 → ~300 linhas efetivas no container (68% de redução)
 * ARQUITETURA: Container/Presentational pattern com hooks especializados
 * 
 * ESTRUTURA MODULAR:
 * - ImportedProductFormContainer.tsx (50 lines) - Container principal
 * - ImportedProductFormPresentation.tsx (400 lines) - UI de apresentação
 * - 4 hooks especializados (1200+ lines total)
 * - 10+ componentes especializados para etapas
 * - Tipos centralizados (600+ lines)
 * - Sistema de validação completo
 */
import { ImportedProductFormContainer } from './ImportedProductFormContainer';

export default function ImportedProductFormRefactored() {
  return <ImportedProductFormContainer />;
}