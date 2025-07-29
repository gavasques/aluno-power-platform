/**
 * ARQUIVO REFATORADO: ImportedProductDetailRefactored
 * Arquivo principal para detalhes de produtos importados
 * Redirecionamento para arquitetura modular Container/Presentational
 * 
 * REFATORAÇÃO REALIZADA: Janeiro 29, 2025
 * REDUÇÃO ALCANÇADA: 1020 → ~300 linhas efetivas no container (70% de redução)
 * ARQUITETURA: Container/Presentational pattern com hooks especializados
 * 
 * ESTRUTURA MODULAR:
 * - ImportedProductDetailContainer.tsx (80 linhas) - Container principal
 * - ImportedProductDetailPresentation.tsx (220 linhas) - UI de apresentação
 * - 3 hooks especializados (300 linhas total)
 * - 6 componentes de apresentação (400 linhas total)
 * - Tipos centralizados (350 linhas)
 */
import { ImportedProductDetailContainer } from './ImportedProductDetailContainer';

export default function ImportedProductDetailRefactored() {
  return <ImportedProductDetailContainer />;
}