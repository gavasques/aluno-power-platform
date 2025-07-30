/**
 * CONTAINER: InfographicGeneratorContainer
 * Manages business logic and state for infographic generation
 * Refactored from infographic-generator.tsx (644 lines) for modularization
 */
import React from 'react';
import { useInfographicGenerator } from './hooks/useInfographicGenerator';
import { InfographicGeneratorPresentation } from './InfographicGeneratorPresentation';

export const InfographicGeneratorContainer: React.FC = () => {
  const { state, actions } = useInfographicGenerator();

  return (
    <InfographicGeneratorPresentation
      state={state}
      actions={actions}
    />
  );
};