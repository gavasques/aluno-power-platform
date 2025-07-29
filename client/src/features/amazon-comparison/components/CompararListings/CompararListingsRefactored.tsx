/**
 * ARQUIVO REFATORADO: CompararListingsRefactored
 * Arquivo principal para sistema de comparação Amazon
 * Redirecionamento para arquitetura modular Container/Presentational
 * 
 * REFATORAÇÃO REALIZADA: Janeiro 29, 2025
 * REDUÇÃO ALCANÇADA: 956 → ~150 linhas efetivas no container (84% de redução)
 * ARQUITETURA: Container/Presentational pattern com hooks especializados
 * 
 * ESTRUTURA MODULAR:
 * - CompararListingsContainer.tsx (50 lines) - Container principal
 * - CompararListingsPresentation.tsx (350 lines) - UI de apresentação
 * - 2 hooks especializados (300 lines total)
 * - 6 componentes especializados (400 lines total) 
 * - Tipos centralizados (250 lines)
 * - Utils de validação (150 lines)
 */
import { CompararListingsContainer } from './CompararListingsContainer';

export default function CompararListingsRefactored() {
  return <CompararListingsContainer />;
}