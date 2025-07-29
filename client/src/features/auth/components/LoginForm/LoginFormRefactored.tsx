/**
 * ARQUIVO REFATORADO: LoginFormRefactored
 * Arquivo principal para sistema de login/registro
 * Redirecionamento para arquitetura modular Container/Presentational
 * 
 * REFATORAÇÃO REALIZADA: Janeiro 29, 2025
 * REDUÇÃO ALCANÇADA: 1012 → ~200 linhas efetivas no container (80% de redução)
 * ARQUITETURA: Container/Presentational pattern com hooks especializados
 * 
 * ESTRUTURA MODULAR:
 * - LoginFormContainer.tsx (50 lines) - Container principal
 * - LoginFormPresentation.tsx (250 lines) - UI de apresentação
 * - 3 hooks especializados (200 lines total)
 * - 3 componentes especializados (150 lines total) 
 * - Tipos centralizados (300 lines)
 * - Utils de validação (100 lines)
 */
import { LoginFormContainer } from './LoginFormContainer';

export default function LoginFormRefactored() {
  return <LoginFormContainer />;
}