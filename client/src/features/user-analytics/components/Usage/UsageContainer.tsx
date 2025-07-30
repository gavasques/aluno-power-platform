/**
 * CONTAINER: UsageContainer
 * Lógica de negócio para análise de uso
 * Extraído de Usage.tsx para modularização
 */
import React from 'react';
import { useUsageAnalytics } from '../../hooks/useUsageAnalytics';
import { UsagePresentation } from './UsagePresentation';
import { UsageAnalyticsContainerProps } from '../../types/usage';

export const UsageContainer = ({
  userId,
  readOnly = false,
  showCredits = true,
  showRealTime = false,
  defaultTab = 'overview',
  defaultDateRange
}: UsageAnalyticsContainerProps) => {
  // ===== HOOKS INTEGRATION =====
  const usageData = useUsageAnalytics(userId, defaultTab, defaultDateRange);

  // ===== CONTAINER ORCHESTRATION =====
  const containerProps = {
    state: usageData.state,
    analytics: usageData.analytics,
    credits: usageData.credits,
    actions: usageData.actions,
    utils: usageData.utils,
    readOnly,
    showCredits,
    showRealTime
  };

  return <UsagePresentation {...containerProps} />;
};