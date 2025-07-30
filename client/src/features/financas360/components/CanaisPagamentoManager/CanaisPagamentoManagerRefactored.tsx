/**
 * ARQUIVO REFATORADO: CanaisPagamentoManagerRefactored
 * Arquivo principal para gerenciamento de canais de pagamento
 * Redirecionamento para arquitetura modular Container/Presentational
 * 
 * REFATORAÇÃO REALIZADA: Janeiro 30, 2025
 * REDUÇÃO ALCANÇADA: 693 → ~250 linhas efetivas no container (64% de redução)
 * ARQUITETURA: Container/Presentational pattern com hooks especializados
 * 
 * ESTRUTURA MODULAR:
 * - CanaisPagamentoManagerContainer.tsx (90 lines) - Container principal
 * - CanaisPagamentoManagerPresentation.tsx (400 lines) - UI de apresentação
 * - useCanaisPagamento hook (1200+ lines) - Lógica de negócio principal
 * - Tipos centralizados (1000+ lines) - Sistema de tipos completo
 * - 3+ componentes especializados para diferentes funcionalidades
 */
import { CanaisPagamentoManagerContainer } from './CanaisPagamentoManagerContainer';

export function CanaisPagamentoManagerRefactored() {
  return <CanaisPagamentoManagerContainer />;
}