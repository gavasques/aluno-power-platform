/**
 * CONTAINER: InfographicContainer
 * Manages business logic and state for advanced infographic generation
 * Refactored from AdvancedInfographicGenerator.tsx (671 lines) for modularization
 */
import React from 'react';
import { useInfographicGenerator } from './hooks/useInfographicGenerator';
import { InfographicPresentation } from './InfographicPresentation';

export const InfographicContainer: React.FC = () => {
  const { state, departments, actions } = useInfographicGenerator();

  return (
    <InfographicPresentation
      state={state}
      departments={departments}
      actions={actions}
    />
  );
};