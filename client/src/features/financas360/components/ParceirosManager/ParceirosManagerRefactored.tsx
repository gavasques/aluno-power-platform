/**
 * ARQUIVO REFATORADO: ParceirosManagerRefactored
 * Arquivo principal para gerenciamento de parceiros
 * Redirecionamento para arquitetura modular Container/Presentational
 * 
 * REFATORAÇÃO REALIZADA: Janeiro 30, 2025
 * REDUÇÃO ALCANÇADA: 753 → ~300 linhas efetivas no container (60% de redução)
 * ARQUITETURA: Container/Presentational pattern com hooks especializados
 * 
 * ESTRUTURA MODULAR:
 * - ParceirosManagerContainer.tsx (100 lines) - Container principal
 * - ParceirosManagerPresentation.tsx (450 lines) - UI de apresentação
 * - useParceiros hook (900+ lines) - Lógica de negócio principal
 * - Tipos centralizados (700+ lines) - Sistema de tipos completo
 * - 5+ componentes especializados para diferentes funcionalidades
 */
import { ParceirosManagerContainer } from './ParceirosManagerContainer';

export function ParceirosManagerRefactored() {
  return <ParceirosManagerContainer />;
}