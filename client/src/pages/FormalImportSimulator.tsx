/**
 * ESTE ARQUIVO FOI REFATORADO - Redirecionamento para versão modular
 * Arquivo original com 1771 linhas foi decomposto em estrutura modular
 * Nova localização: client/src/pages/FormalImportSimulator/FormalImportSimulatorContainer.tsx
 * 
 * REDUÇÃO ALCANÇADA: 1771 → ~185 linhas efetivas no container (89% de redução)
 * ARQUITETURA: Container/Presentational pattern com 4 hooks especializados
 * 
 * ESTRUTURA MODULAR:
 * - FormalImportSimulatorContainer.tsx (185 linhas) - Container principal
 * - FormalImportSimulatorPresentation.tsx (534 linhas) - UI de apresentação
 * - 4 hooks especializados (611 linhas total)
 * - types.ts (57 linhas) - Tipos centralizados
 */

import { FormalImportSimulatorContainer } from './FormalImportSimulator/FormalImportSimulatorContainer';

export default function FormalImportSimulator() {
  // Extrair ID da simulação dos parâmetros da URL
  const urlParams = new URLSearchParams(window.location.search);
  const simulationId = urlParams.get('id');

  return <FormalImportSimulatorContainer simulationId={simulationId} />;
}