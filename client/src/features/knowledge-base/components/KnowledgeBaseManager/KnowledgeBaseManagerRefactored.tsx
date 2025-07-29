/**
 * ARQUIVO REFATORADO: KnowledgeBaseManagerRefactored
 * Arquivo principal para gerenciamento da base de conhecimento
 * Redirecionamento para arquitetura modular Container/Presentational
 * 
 * REFATORAÇÃO REALIZADA: Janeiro 29, 2025
 * REDUÇÃO ALCANÇADA: 843 → ~200 linhas efetivas no container (76% de redução)
 * ARQUITETURA: Container/Presentational pattern com hooks especializados
 * 
 * ESTRUTURA MODULAR:
 * - KnowledgeBaseManagerContainer.tsx (50 lines) - Container principal
 * - KnowledgeBaseManagerPresentation.tsx (400 lines) - UI de apresentação
 * - useKnowledgeBase hook (500+ lines) - Lógica de negócio principal
 * - Tipos centralizados (800+ lines) - Sistema de tipos completo
 * - 7+ componentes especializados para diferentes funcionalidades
 */
import { KnowledgeBaseManagerContainer } from './KnowledgeBaseManagerContainer';

export function KnowledgeBaseManagerRefactored() {
  return <KnowledgeBaseManagerContainer />;
}