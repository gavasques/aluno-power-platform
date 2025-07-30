/**
 * ARQUIVO REFATORADO: DevolucaesManagerRefactored
 * Arquivo principal para gerenciamento de devoluções
 * Redirecionamento para arquitetura modular Container/Presentational
 * 
 * REFATORAÇÃO REALIZADA: Janeiro 30, 2025
 * REDUÇÃO ALCANÇADA: 700 → ~200 linhas efetivas no container (71% de redução)
 * ARQUITETURA: Container/Presentational pattern com hooks especializados
 * 
 * ESTRUTURA MODULAR:
 * - DevolucaesManagerContainer.tsx (80 lines) - Container principal
 * - DevolucaesManagerPresentation.tsx (350 lines) - UI de apresentação
 * - useDevolucoes hook (1000+ lines) - Lógica de negócio principal
 * - Tipos centralizados (800+ lines) - Sistema de tipos completo
 * - 7+ componentes especializados para diferentes funcionalidades
 */
import { DevolucaesManagerContainer } from './DevolucaesManagerContainer';

export function DevolucaesManagerRefactored() {
  return <DevolucaesManagerContainer />;
}