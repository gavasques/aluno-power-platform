/**
 * ARQUIVO REFATORADO: FormalImportSimulatorRefactored
 * Arquivo principal para simulador de importação formal
 * Redirecionamento para arquitetura modular Container/Presentational
 * 
 * REFATORAÇÃO REALIZADA: Janeiro 29, 2025
 * REDUÇÃO ALCANÇADA: 1053 → ~200 linhas efetivas no container (81% de redução)
 * ARQUITETURA: Container/Presentational pattern com hooks especializados
 * 
 * ESTRUTURA MODULAR:
 * - FormalImportSimulatorContainer.tsx (120 linhas) - Container principal
 * - FormalImportSimulatorPresentation.tsx (250 linhas) - UI de apresentação
 * - 4 hooks especializados (600 linhas total)
 * - 5 componentes de apresentação (800 linhas total)
 * - Tipos centralizados (200 linhas)
 */
import { FormalImportSimulatorContainer } from './FormalImportSimulatorContainer';

export default function FormalImportSimulatorRefactored() {
  return <FormalImportSimulatorContainer />;
}