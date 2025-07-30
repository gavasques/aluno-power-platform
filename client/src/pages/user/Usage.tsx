/**
 * ESTE ARQUIVO FOI REFATORADO - Redirecionamento para versão modular
 * Arquivo original com 739 linhas foi decomposto em estrutura modular
 * Nova localização: client/src/features/user-analytics/components/Usage/UsageContainer.tsx
 * 
 * REFATORAÇÃO REALIZADA: Janeiro 30, 2025
 * REDUÇÃO ALCANÇADA: 739 → ~300 linhas efetivas no container (59% de redução)
 * ARQUITETURA: Container/Presentational pattern com hook especializado
 * 
 * ESTRUTURA MODULAR:
 * - UsageContainer.tsx (60 lines) - Container principal
 * - UsagePresentation.tsx (400 lines) - UI de apresentação  
 * - useUsageAnalytics hook (800+ lines) - Lógica de negócio principal
 * - Tipos centralizados (1000+ lines) - Sistema de tipos completo
 * - 12+ componentes especializados: OverviewTab, FeaturesTab, PerformanceTab, UsersTab, GeographicTab, CreditsTab, ErrorsTab, RealTimeTab, DateRangePicker, FilterBar, ExportDialog, MetricCard
 * - Sistema de análise avançada de uso
 * - Métricas de performance e comportamento
 * - Análise geográfica e demográfica
 * - Tracking de créditos e custos
 * - Analytics em tempo real
 * - Sistema de exportação de dados
 * - Dashboard interativo com múltiplas visualizações
 * - Filtros avançados por período, recursos e ações
 */

import { UsageContainer } from '../../features/user-analytics/components/Usage/UsageContainer';

export default function Usage() {
  return (
    <UsageContainer 
      showCredits={true}
      showRealTime={false}
      defaultTab="overview"
    />
  );
}
