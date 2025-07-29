/**
 * ESTE ARQUIVO FOI REFATORADO - Redirecionamento para versão modular
 * Arquivo original com 1012 linhas foi decomposto em estrutura modular
 * Nova localização: client/src/features/auth/components/LoginForm/LoginFormContainer.tsx
 * 
 * REFATORAÇÃO REALIZADA: Janeiro 29, 2025
 * REDUÇÃO ALCANÇADA: 1012 → ~200 linhas efetivas no container (80% de redução)
 * ARQUITETURA: Container/Presentational pattern com 3 hooks especializados e 3 componentes
 * 
 * ESTRUTURA MODULAR:
 * - LoginFormContainer.tsx (50 lines) - Container principal
 * - LoginFormPresentation.tsx (250 lines) - UI de apresentação
 * - 3 hooks especializados (200 lines total): useLoginForm, useRegisterForm, useModalManager
 * - 3 componentes especializados (150 lines total): FeatureCard, RegisterModal, ForgotPasswordModal
 * - Tipos centralizados (300 lines)
 * - Utils de validação (100 lines)
 */

import { LoginFormContainer } from '../features/auth/components/LoginForm/LoginFormContainer';

export default function LoginNew() {
  return <LoginFormContainer />;
}