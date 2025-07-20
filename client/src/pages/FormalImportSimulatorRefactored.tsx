import { FormalImportSimulatorContainer } from './FormalImportSimulator/FormalImportSimulatorContainer';

export default function FormalImportSimulatorRefactored() {
  // Extrair ID da simulação dos parâmetros da URL
  const urlParams = new URLSearchParams(window.location.search);
  const simulationId = urlParams.get('id');

  return <FormalImportSimulatorContainer simulationId={simulationId} />;
} 