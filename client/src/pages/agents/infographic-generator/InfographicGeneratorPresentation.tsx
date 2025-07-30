/**
 * PRESENTATION: InfographicGeneratorPresentation
 * Pure UI component for infographic generation functionality
 * Extracted from infographic-generator.tsx (644 lines) for modularization
 */
import React, { memo } from 'react';
import { PermissionGuard } from '@/components/guards/PermissionGuard';
import Layout from '@/components/layout/Layout';
import { InfographicForm } from './components/InfographicForm';
import { GeneratingStep } from './components/GeneratingStep';
import { InfographicPreview } from './components/InfographicPreview';
import type { InfographicGeneratorState, InfographicGeneratorActions } from './types';

interface InfographicGeneratorPresentationProps {
  state: InfographicGeneratorState;
  actions: InfographicGeneratorActions;
}

export const InfographicGeneratorPresentation = memo<InfographicGeneratorPresentationProps>(({
  state,
  actions
}) => {
  const renderCurrentStep = () => {
    switch (state.step) {
      case 'form':
        return (
          <InfographicForm
            formData={state.formData}
            loading={state.loading}
            onFieldChange={actions.updateFormField}
            onGenerate={actions.generateInfographic}
          />
        );

      case 'generating':
        return <GeneratingStep />;

      case 'preview':
        if (!state.generatedImageUrl) {
          return (
            <div className="text-center py-8">
              <p className="text-red-600">Erro: Imagem não encontrada.</p>
            </div>
          );
        }
        return (
          <InfographicPreview
            imageUrl={state.generatedImageUrl}
            formData={state.formData}
            onDownload={actions.downloadImage}
            onReset={actions.resetForm}
            onBack={() => actions.goToStep('form')}
          />
        );

      default:
        return null;
    }
  };

  return (
    <PermissionGuard feature="agents.infographic_generator">
      <Layout>
        <div className="container mx-auto px-4 py-8">
          {renderCurrentStep()}
        </div>
      </Layout>
    </PermissionGuard>
  );
});