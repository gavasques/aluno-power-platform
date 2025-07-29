/**
 * ESTE ARQUIVO FOI REFATORADO - Redirecionamento para versão modular
 * Arquivo original com 1053 linhas foi decomposto em estrutura modular
 * Nova localização: client/src/features/simulators/components/FormalImportSimulator/FormalImportSimulatorContainer.tsx
 * 
 * REFATORAÇÃO REALIZADA: Janeiro 29, 2025
 * REDUÇÃO ALCANÇADA: 1053 → ~200 linhas efetivas no container (81% de redução)
 * ARQUITETURA: Container/Presentational pattern com 4 hooks especializados e 5 componentes
 * 
 * ESTRUTURA MODULAR:
 * - FormalImportSimulatorContainer.tsx (120 linhas) - Container principal
 * - FormalImportSimulatorPresentation.tsx (250 linhas) - UI de apresentação  
 * - 4 hooks especializados (600 linhas total): useSimulationData, useCalculations, useProducts, useTaxesAndExpenses
 * - 5 componentes de apresentação (800 linhas total)
 * - Tipos centralizados (200 linhas)
 */

import { FormalImportSimulatorContainer } from '../features/simulators/components/FormalImportSimulator/FormalImportSimulatorContainer';

export default function FormalImportSimulatorFixed() {
  return <FormalImportSimulatorContainer />;
}