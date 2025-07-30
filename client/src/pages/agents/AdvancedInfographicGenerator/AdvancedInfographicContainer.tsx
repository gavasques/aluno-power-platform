/**
 * CONTAINER: AdvancedInfographicContainer
 * Manages business logic and state for advanced infographic generation
 * Refactored from AdvancedInfographicGenerator.tsx (671 lines) for modularization
 */
import React from 'react';
import { useAdvancedInfographic } from './hooks/useAdvancedInfographic';
import { AdvancedInfographicPresentation } from './AdvancedInfographicPresentation';

export const AdvancedInfographicContainer: React.FC = () => {
  const { state, actions, isGenerating } = useAdvancedInfographic();

  return (
    <AdvancedInfographicPresentation
      state={state}
      actions={actions}
      isGenerating={isGenerating}
    />
  );
};