/**
 * ARQUIVO REFATORADO: NotasFiscaisManagerRefactored
 * Arquivo principal para gerenciamento de notas fiscais
 * Redirecionamento para arquitetura modular Container/Presentational
 * 
 * REFATORAÇÃO REALIZADA: Janeiro 29, 2025
 * REDUÇÃO ALCANÇADA: 810 → ~250 linhas efetivas no container (69% de redução)
 * ARQUITETURA: Container/Presentational pattern com hooks especializados
 * 
 * ESTRUTURA MODULAR:
 * - NotasFiscaisManagerContainer.tsx (60 lines) - Container principal
 * - NotasFiscaisManagerPresentation.tsx (350 lines) - UI de apresentação
 * - useNotasFiscais hook (600+ lines) - Lógica de negócio principal
 * - Tipos centralizados (700+ lines) - Sistema de tipos completo
 * - 5+ componentes especializados para diferentes funcionalidades
 */
import { NotasFiscaisManagerContainer } from './NotasFiscaisManagerContainer';

export function NotasFiscaisManagerRefactored() {
  return <NotasFiscaisManagerContainer />;
}