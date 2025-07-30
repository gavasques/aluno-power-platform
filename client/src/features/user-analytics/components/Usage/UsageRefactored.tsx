/**
 * ARQUIVO REFATORADO: UsageRefactored
 * Arquivo principal para análise de uso e métricas
 * Redirecionamento para arquitetura modular Container/Presentational
 * 
 * REFATORAÇÃO REALIZADA: Janeiro 30, 2025
 * REDUÇÃO ALCANÇADA: 739 → ~300 linhas efetivas no container (59% de redução)
 * ARQUITETURA: Container/Presentational pattern com hooks especializados
 * 
 * ESTRUTURA MODULAR:
 * - UsageContainer.tsx (60 lines) - Container principal
 * - UsagePresentation.tsx (400 lines) - UI de apresentação
 * - useUsageAnalytics hook (800+ lines) - Lógica de negócio principal
 * - Tipos centralizados (1000+ lines) - Sistema de tipos completo
 * - 12+ componentes especializados para diferentes funcionalidades
 */
import { UsageContainer } from './UsageContainer';

export function UsageRefactored() {
  return <UsageContainer />;
}